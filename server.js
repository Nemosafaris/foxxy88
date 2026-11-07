'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {Pool} = require('pg');

const PORT = Number(process.env.PORT || 3000);
if (!process.env.DATABASE_URL) {
  console.error('กรุณากำหนด DATABASE_URL สำหรับ PostgreSQL ก่อนเริ่มระบบ');
  process.exit(1);
}
const db = new Pool({connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000});
const allowed = [
  ['independent','collaborative','structured-flexible','result-oriented'],
  ['think-alone','ask-for-help','wait-and-see','research'],
  ['planner','spontaneous','routine','adaptable'],
  ['polite','casual','welcoming','concise'],
  ['structured','flexible','precision','time-manager'],
  ['stay-comfortable','try-new','rest-recover','challenge-self'],
  ['reserved','open','optimistic','analytical'],
  ['careful','improvement','consensus','decisive'],
  ['organized','relaxed','private','energetic'],
  ['memorize','practice','ask-expert','experience-learning']
];
const assets = new Map([
  ['/', ['index.html','text/html; charset=utf-8']],
  ['/index.html', ['index.html','text/html; charset=utf-8']],
  ['/style.css', ['style.css','text/css; charset=utf-8']],
  ['/script.js', ['script.js','text/javascript; charset=utf-8']]
]);
const json = (res, status, data) => {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(data));
};
const valid = data => data && typeof data === 'object' && !Array.isArray(data) &&
  Object.keys(data).length === allowed.length &&
  allowed.every((options,i) => options.includes(data[`q${i}`]));

// ขีดจำกัดพื้นฐานสำหรับการส่งซ้ำจาก IP เดียวกัน (ใช้ร่วมกับ rate limit ระดับแพลตฟอร์มเมื่อใช้งานจริง)
const requests = new Map();
function rateLimited(ip) {
  const now = Date.now();
  if (requests.size > 5000) {
    for (const [key,v] of requests) if (now - v.start > 60000) requests.delete(key);
  }
  const prev = requests.get(ip);
  if (!prev || now - prev.start > 60000) { requests.set(ip,{start:now,count:1}); return false; }
  prev.count++;
  return prev.count > 20;
}

const server = http.createServer(async (req,res) => {
  let pathname;
  try { pathname = new URL(req.url,'http://localhost').pathname; }
  catch { return json(res,400,{error:'Invalid URL'}); }
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','DENY');
  if (pathname === '/api/health' && req.method === 'GET') {
    try { await db.query('SELECT 1'); return json(res,200,{ok:true,database:'connected'}); }
    catch (err) { console.error('DB health failed',err.message); return json(res,503,{ok:false,database:'unavailable'}); }
  }
  if (pathname === '/api/results' && req.method === 'POST') {
    // บล็อกคำขอจาก origin อื่นเมื่อเบราว์เซอร์ส่ง Origin มา
    if (req.headers.origin) {
      let origin;
      try { origin = new URL(req.headers.origin); } catch { return json(res,403,{error:'Origin ไม่ถูกต้อง'}); }
      const forwardedHost = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      if (origin.host !== forwardedHost) return json(res,403,{error:'Origin ไม่ได้รับอนุญาต'});
    }
    if (rateLimited(req.socket.remoteAddress || 'unknown')) return json(res,429,{error:'ส่งข้อมูลบ่อยเกินไป กรุณาลองใหม่'});
    if (!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) return json(res,415,{error:'กรุณาส่ง JSON'});
    let body='';
    try {
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body,'utf8') > 8192) return json(res,413,{error:'ข้อมูลมีขนาดใหญ่เกินไป'});
      }
      let data;
      try { data = JSON.parse(body); } catch { return json(res,400,{error:'รูปแบบ JSON ไม่ถูกต้อง'}); }
      if (!valid(data)) return json(res,400,{error:'กรุณาตอบให้ครบ 10 ข้อ และเลือกคำตอบที่ถูกต้อง'});
      const id=randomUUID();
      await db.query('INSERT INTO survey_results (id, answers) VALUES ($1,$2::jsonb)',[id,JSON.stringify(data)]);
      return json(res,201,{success:true,id});
    } catch (err) {
      console.error('Cannot save survey',err);
      if (!res.headersSent) return json(res,500,{error:'ไม่สามารถบันทึกผลได้'});
      return;
    }
  }
  if (req.method === 'GET' && assets.has(pathname)) {
    const [file,mime] = assets.get(pathname);
    res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    const stream=fs.createReadStream(path.join(__dirname,file));
    stream.on('error',e=>{console.error('Asset error',e.message); res.destroy();});
    stream.pipe(res);
    return;
  }
  return json(res,404,{error:'ไม่พบหน้าที่ร้องขอ'});
});

async function start() {
  await db.query(`CREATE TABLE IF NOT EXISTS survey_results (
    id UUID PRIMARY KEY,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answers JSONB NOT NULL
  )`);
  await new Promise(resolve => server.listen(PORT, '0.0.0.0',resolve));
  console.log(`Survey service running on port ${PORT}`);
}
start().catch(err=>{console.error('Startup failed:',err); process.exit(1);});
process.on('SIGTERM',()=>server.close(()=>db.end().then(()=>process.exit(0))));
