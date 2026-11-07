'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {Pool} = require('pg');
const {valid,translate} = require('./admin-data');
const {xlsx} = require('./xlsx');
const PORT=Number(process.env.PORT||3000);
if (!process.env.DATABASE_URL || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD.length<12 || process.env.SESSION_SECRET.length<32) {
 console.error('โปรดตั้ง DATABASE_URL, ADMIN_PASSWORD (อย่างน้อย 12 ตัวอักษร) และ SESSION_SECRET (อย่างน้อย 32 ตัวอักษร) ใน Railway Variables');
 process.exit(1);
}
const db=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000});
const assets=new Map([
 ['/',['index.html','text/html; charset=utf-8']],['/index.html',['index.html','text/html; charset=utf-8']],
 ['/style.css',['style.css','text/css; charset=utf-8']],['/script.js',['script.js','text/javascript; charset=utf-8']],
 ['/admin',['admin.html','text/html; charset=utf-8']],['/admin.html',['admin.html','text/html; charset=utf-8']],
 ['/admin.js',['admin.js','text/javascript; charset=utf-8']],['/admin.css',['admin.css','text/css; charset=utf-8']]
]);
function headers(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function guardOrigin(req){const origin=req.headers.origin;if (!origin) return true;try{const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();return new URL(origin).host===host;}catch{return false;}}
function safeEqual(a,b){const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y);}
const loginAttempts=new Map();
function blocked(ip){const now=Date.now();if(loginAttempts.size>3000)for(const [k,v] of loginAttempts)if(v.until<now)loginAttempts.delete(k);const v=loginAttempts.get(ip);return Boolean(v&&v.until>now&&v.count>=6);}
function failed(ip){const now=Date.now();let v=loginAttempts.get(ip);if(!v||v.until<now)v={count:0,until:now+15*60*1000};v.count++;loginAttempts.set(ip,v);}
function sign(payload){return crypto.createHmac('sha256',process.env.SESSION_SECRET).update(payload).digest('base64url');}
function issueSession(res){const p=`${Date.now()+8*60*60*1000}.${crypto.randomBytes(12).toString('hex')}`;const cookie=`admin_session=${p}.${sign(p)}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;res.setHeader('Set-Cookie',cookie);}
function authenticated(req){const cookies=String(req.headers.cookie||'').split(';').map(x=>x.trim());const token=cookies.find(x=>x.startsWith('admin_session='))?.slice(14);if(!token)return false;const cut=token.lastIndexOf('.');if(cut<0)return false;const p=token.slice(0,cut),s=token.slice(cut+1);if(!safeEqual(s,sign(p)))return false;const expiry=Number(p.split('.')[0]);return Number.isFinite(expiry)&&expiry>Date.now()&&expiry<Date.now()+9*60*60*1000;}
async function readJSON(req,limit=8192){if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw Object.assign(new Error('กรุณาส่ง JSON'),{code:415});let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>limit)throw Object.assign(new Error('ข้อมูลใหญ่เกินไป'),{code:413});}try{return JSON.parse(body);}catch{throw Object.assign(new Error('JSON ไม่ถูกต้อง'),{code:400});}}
function ipFrom(req){return req.socket.remoteAddress||'unknown';}
function serialize(row){const t=translate(row.answers);return {id:row.id,submitted_at:row.submitted_at,nickname:row.answers?.nickname??null,details:t.details,result:t.result,scores:t.scores};}
const server=http.createServer(async(req,res)=>{
 headers(res);let pathname,query;try{const u=new URL(req.url,'http://localhost');pathname=u.pathname;query=u.searchParams;}catch{return json(res,400,{error:'URL ไม่ถูกต้อง'});}
 try{
  if(pathname==='/api/health'&&req.method==='GET'){try{await db.query('SELECT 1');return json(res,200,{ok:true,database:'connected'});}catch{return json(res,503,{ok:false,database:'unavailable'});}}
  if(pathname==='/api/results'&&req.method==='POST'){
   if(!guardOrigin(req))return json(res,403,{error:'Origin ไม่ถูกต้อง'});
   const data=await readJSON(req);
   const {nickname,...answers}=data??{};
   if(!valid(answers))return json(res,400,{error:'กรุณาตอบให้ครบ 10 ข้อ'});
   // Keep accepting submissions from survey pages opened before this deployment.
   if(nickname!==undefined){
    const name=typeof nickname==='string'?nickname.trim():'';
    if(!name||name.length>40||/[\x00-\x1f\x7f\uD800-\uDFFF\uFFFE\uFFFF]/u.test(name)){
     return json(res,400,{error:'กรุณากรอกชื่อเล่นที่ถูกต้อง ไม่เกิน 40 ตัวอักษร'});
    }
    answers.nickname=name;
   }
   const id=crypto.randomUUID();await db.query('INSERT INTO survey_results (id,answers) VALUES ($1,$2::jsonb)',[id,JSON.stringify(answers)]);return json(res,201,{success:true,id});
  }
  if(pathname==='/api/admin/login'&&req.method==='POST'){
   if(!guardOrigin(req))return json(res,403,{error:'Origin ไม่ถูกต้อง'});
   const ip=ipFrom(req);if(blocked(ip))return json(res,429,{error:'ลองรหัสผ่านหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง'});
   const data=await readJSON(req,1024);if(!safeEqual(data?.password??'',process.env.ADMIN_PASSWORD)){failed(ip);return json(res,401,{error:'รหัสผ่านไม่ถูกต้อง'});}
   loginAttempts.delete(ip);issueSession(res);return json(res,200,{ok:true});
  }
  if(pathname==='/api/admin/logout'&&req.method==='POST'){
   if(!guardOrigin(req))return json(res,403,{error:'Origin ไม่ถูกต้อง'});
   res.setHeader('Set-Cookie','admin_session=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return json(res,200,{ok:true});
  }
  if(pathname.startsWith('/api/admin/')){
   if(!authenticated(req))return json(res,401,{error:'กรุณาเข้าสู่ระบบผู้ดูแล'});
   if(pathname==='/api/admin/session'&&req.method==='GET')return json(res,200,{ok:true});
   if(pathname==='/api/admin/results'&&req.method==='GET'){
    const page=Math.max(1,Math.min(100000,Math.floor(Number(query.get('page')||1))||1));const limit=20;
    const [count,items]=await Promise.all([db.query('SELECT COUNT(*)::int AS total FROM survey_results'),db.query('SELECT id,submitted_at,answers FROM survey_results ORDER BY submitted_at DESC,id DESC LIMIT $1 OFFSET $2',[limit,(page-1)*limit])]);
    return json(res,200,{total:count.rows[0].total,page,pageSize:limit,items:items.rows.map(serialize)});
   }
   if(pathname==='/api/admin/export'&&req.method==='GET'){
    const results=await db.query('SELECT id,submitted_at,answers FROM survey_results ORDER BY submitted_at DESC,id DESC LIMIT 50000');
    const content=xlsx(results.rows);
    res.writeHead(200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="survey-results.xlsx"','Content-Length':content.length,'Cache-Control':'no-store'});return res.end(content);
   }
   return json(res,404,{error:'ไม่พบ API'});
  }
  if(req.method==='GET'&&assets.has(pathname)){
   const [file,mime]=assets.get(pathname);res.writeHead(200,{'Content-Type':mime,'Cache-Control':pathname.startsWith('/admin')?'no-store':'no-cache'});return fs.createReadStream(path.join(__dirname,file)).on('error',e=>{console.error(e);res.destroy();}).pipe(res);
  }
  return json(res,404,{error:'ไม่พบหน้า'});
 }catch(err){console.error('Request failed',err.message);return !res.headersSent&&json(res,err.code||500,{error:err.code?err.message:'เซิร์ฟเวอร์ขัดข้อง'});}
});
async function start(){await db.query(`CREATE TABLE IF NOT EXISTS survey_results (id UUID PRIMARY KEY,submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),answers JSONB NOT NULL)`);await new Promise(resolve=>server.listen(PORT,'0.0.0.0',resolve));console.log(`Survey online with admin on port ${PORT}`);}
start().catch(err=>{console.error('Startup failed',err);process.exit(1);});
process.on('SIGTERM',()=>server.close(()=>db.end().then(()=>process.exit(0))));
