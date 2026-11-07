'use strict';
const el=id=>document.getElementById(id);
let page=1,total=0,items=[];
const deleteDialog=el('delete-dialog');
let pendingDelete=null;
const thaiDate=new Intl.DateTimeFormat('th-TH',{dateStyle:'short',timeStyle:'medium',timeZone:'Asia/Bangkok',hour12:false});
function message(id,value){el(id).textContent=value;}
async function call(path,options){const res=await fetch(path,{credentials:'same-origin',...options});if(!res.ok){let err;try{err=(await res.json()).error;}catch{}throw Object.assign(new Error(err||`HTTP ${res.status}`),{status:res.status});}return res;}
function viewLogin(){el('login-panel').hidden=false;el('dashboard').hidden=true;el('password').value='';}
function viewDashboard(){el('login-panel').hidden=true;el('dashboard').hidden=false;}
async function load(){message('dashboard-message','กำลังโหลดข้อมูล...');try{const data=await(await call(`/api/admin/results?page=${page}`)).json();items=data.items;total=data.total;const lastPage=Math.max(1,Math.ceil(total/data.pageSize));if(page>lastPage){page=lastPage;return load();}message('total-count',new Intl.NumberFormat('th-TH').format(total));message('range-label',total?`แสดง ${(page-1)*20+1}–${(page-1)*20+items.length} จาก ${total} รายการ`:'ยังไม่มีคำตอบ');message('page-label',`หน้า ${page} / ${Math.max(1,Math.ceil(total/20))}`);el('prev-page').disabled=page<=1;el('next-page').disabled=page*20>=total;const body=el('results-body');body.replaceChildren();if(!items.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='ยังไม่มีข้อมูลผู้ตอบแบบสอบถาม';tr.append(td);body.append(tr);}
 for(const row of items){const tr=document.createElement('tr');const cells=[row.id.slice(0,8)+'…',row.nickname??'ไม่ระบุ',new Date(row.submitted_at).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',hour12:false}),row.result];for(const value of cells){const td=document.createElement('td');td.textContent=value;tr.append(td);}
 const feedbackCell=document.createElement('td');
 feedbackCell.className=row.creatorFeedback?'feedback-cell':'feedback-cell feedback-cell-empty';
 feedbackCell.textContent=row.creatorFeedback??'ไม่มีข้อความ';
 tr.append(feedbackCell);
 const td=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='ดูคำตอบ';button.addEventListener('click',()=>details(row));const remove=document.createElement('button');remove.type='button';remove.className='secondary remove-result';remove.textContent='ลบ';remove.setAttribute('aria-label','ลบคำตอบของ '+(row.nickname??'ผู้ไม่ระบุชื่อ')+' รหัส '+row.id);remove.addEventListener('click',()=>confirmDelete(row));td.className='result-actions';td.append(button,remove);tr.append(td);body.append(tr);}message('dashboard-message','');}catch(error){message('dashboard-message',error.message);if(error.status===401)viewLogin();}}
function details(row){el('detail-panel').hidden=false;message('detail-meta',`รหัส ${row.id} · ${new Date(row.submitted_at).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',hour12:false})}`);message('detail-result',`แนวโน้มเด่น: ${row.result}`);const scoreNames={analytical:'นักคิดและวางแผน',social:'นักประสานงาน',adaptable:'นักปรับตัวและเรียนรู้',action:'นักลงมือทำ'};const scores=el('detail-scores');scores.replaceChildren();for(const [key,num] of Object.entries(row.scores)){const item=document.createElement('span');item.textContent=`${scoreNames[key]} ${num}/10`;scores.append(item);}const list=el('detail-answers');list.replaceChildren();for(const d of row.details){const li=document.createElement('li'),q=document.createElement('strong'),a=document.createElement('p');q.textContent=d.question;a.textContent=d.answer;li.append(q,a);list.append(li);}const feedback=document.createElement('li'),label=document.createElement('strong'),body=document.createElement('p');label.textContent='ข้อความถึงคนทำเว็บ';for(const [index,line] of (row.creatorFeedback??'ไม่มีข้อความ').split('\n').entries()){if(index>0)body.append(document.createElement('br'));body.append(line);}feedback.append(label,body);list.append(feedback);el('detail-panel').scrollIntoView({behavior:'smooth',block:'start'});}
function confirmDelete(row){
 if(pendingDelete)return;
 pendingDelete=row.id;
 deleteDialog.returnValue='';
 message('delete-meta','ชื่อเล่น: '+(row.nickname??'ไม่ระบุ')+' · '+thaiDate.format(new Date(row.submitted_at))+' · รหัส '+row.id.slice(0,8));
 deleteDialog.showModal();
}
deleteDialog.addEventListener('close',async()=>{
 const id=pendingDelete;
 if(deleteDialog.returnValue!=='delete'){
  pendingDelete=null;
  return;
 }
 try{
  await call('/api/admin/results/'+encodeURIComponent(id),{method:'DELETE'});
  el('detail-panel').hidden=true;
  await load();
  if(!el('dashboard-message').textContent)message('dashboard-message','ลบคำตอบแล้ว');
 }catch(error){
  if(error.status===401)viewLogin();
  else message('dashboard-message',error.message);
 }finally{
  pendingDelete=null;
 }
});
el('login-form').addEventListener('submit',async e=>{e.preventDefault();message('login-message','กำลังเข้าสู่ระบบ...');try{await call('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:el('password').value})});viewDashboard();page=1;await load();message('login-message','');}catch(error){message('login-message',error.message);}});
el('logout-btn').addEventListener('click',async()=>{try{await call('/api/admin/logout',{method:'POST'});}catch{}viewLogin();});
el('refresh-btn').addEventListener('click',()=>{el('detail-panel').hidden=true;load();});
el('prev-page').addEventListener('click',()=>{if(page>1){page--;el('detail-panel').hidden=true;load();}});
el('next-page').addEventListener('click',()=>{if(page*20<total){page++;el('detail-panel').hidden=true;load();}});
el('close-detail').addEventListener('click',()=>{el('detail-panel').hidden=true;});
el('export-btn').addEventListener('click',async()=>{message('dashboard-message','กำลังสร้างไฟล์ Excel...');try{const res=await call('/api/admin/export');const data=await res.blob();const url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download='survey-results.xlsx';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);message('dashboard-message','ดาวน์โหลดไฟล์ Excel แล้ว');}catch(error){message('dashboard-message',error.message);}});
call('/api/admin/session').then(()=>{viewDashboard();load();}).catch(()=>viewLogin());
