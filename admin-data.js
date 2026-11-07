'use strict';
const questions = [
 ['คุณชอบการทำงานแบบไหน?', [['อิสระและสามารถทำงานได้ตามจังหวะของตัวเอง','independent'],['รักการทำงานเป็นทีมและร่วมมือกับผู้อื่น','collaborative'],['ชอบทำตามขั้นตอนแต่ยืดหยุ่นได้','structured-flexible'],['เน้นความรวดเร็วและผลลัพธ์เป็นหลัก','result-oriented']]],
 ['เมื่อเจอปัญหาคุณจะ...', [['คิดและหาวิธีแก้คนเดียวก่อน','think-alone'],['ปรึกษาเพื่อนหรือขอความช่วยเหลือ','ask-for-help'],['รอให้มันค่อยๆ แก้เองตามธรรมชาติ','wait-and-see'],['หาข้อมูลออนไลน์มาวิเคราะห์เอง','research']]],
 ['คุณเป็นคนที่ชอบ...', [['วางแผนและจัดลำดับความสำคัญ','planner'],['ลองทำสิ่งใหม่ๆ ดูผลก่อน','spontaneous'],['ทำตามแผนที่มีอยู่แล้ว','routine'],['ปรับตัวตามสถานการณ์ที่เกิดขึ้น','adaptable']]],
 ['เมื่อคนแปลกหน้าเข้ามาทักทาย...', [['ยิ้มและคุยแบบสุภาพ','polite'],['ดูเป็นธรรมชาติและไม่สนใจมาก','casual'],['เปิดใจและแสดงความต้อนรับ','welcoming'],['ตอบกลับแบบสั้นๆ แล้วกลับสู่กิจกรรมเดิม','concise']]],
 ['คุณชอบการทำงานแบบไหน?', [['มีเป้าหมายชัดเจนและทำตามขั้นตอน','structured'],['ยืดหยุ่นและปรับได้ตามสถานการณ์','flexible'],['เน้นความละเอียดและความแม่นยำ','precision'],['ทำงานให้เสร็จก่อนกำหนดเวลาเสมอ','time-manager']]],
 ['เมื่อรู้สึกเบื่อ...', [['ทำสิ่งที่เคยโปรดปรานเดิมๆ','stay-comfortable'],['เปลี่ยนไปหาอะไรใหม่ๆ ทำ','try-new'],['พักผ่อนให้ถึงก่อนแล้วค่อยเริ่มใหม่','rest-recover'],['ทำสิ่งที่เคยไม่สนใจแต่พยายามทำให้','challenge-self']]],
 ['คุณเป็นคนที่...', [['เก็บความรู้สึกและแสดงออกน้อย','reserved'],['เปิดใจและสื่อสารอย่างตรงไปตรงมา','open'],['มองบวกต่อทุกสถานการณ์','optimistic'],['วิเคราะห์ก่อนแล้วค่อยตัดสินใจ','analytical']]],
 ['การตัดสินใจเรื่องสำคัญ...', [['คิดวิเคราะห์อย่างละเอียดก่อน','careful'],['ลงมือทำแล้วค่อยปรับปรุง','improvement'],['ฟังคนอื่นก่อนแล้วตัดสินใจ','consensus'],['ตัดสินใจเร็วเพื่อไม่เสียเวลา','decisive']]],
 ['คุณชอบบรรยากาศที่...', [['มีระเบียบและชัดเจน','organized'],['ผ่อนคลายและเป็นกันเอง','relaxed'],['มีพื้นที่ส่วนตัวและไม่รบกวนผู้อื่น','private'],['แอคทีฟและมีพลังงานอยู่เสมอ','energetic']]],
 ['เมื่อเรียนรู้อะไรใหม่ๆ...', [['จดบันทึกและทบทวนให้เข้าใจ','memorize'],['ลงมือทำจริงเป็นหลัก','practice'],['ถามเพื่อนหรือผู้เชี่ยวชาญ','ask-expert'],['สังเกตและเรียนรู้จากการลองผิดลองถูก','experience-learning']]]
];
const traits = { analytical:'นักคิดและวางแผน',social:'นักประสานงาน',adaptable:'นักปรับตัวและเรียนรู้',action:'นักลงมือทำ' };
const traitByQuestion = [
 ['adaptable','social','analytical','action'],['analytical','social','adaptable','analytical'],
 ['analytical','action','analytical','adaptable'],['social','adaptable','social','analytical'],
 ['analytical','adaptable','analytical','action'],['analytical','adaptable','adaptable','action'],
 ['analytical','social','adaptable','analytical'],['analytical','action','social','action'],
 ['analytical','social','analytical','action'],['analytical','action','social','adaptable']
];
const allowed = questions.map(q => q[1].map(o => o[1]));
function valid(data) { return data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === questions.length && allowed.every((opts,i) => opts.includes(data[`q${i}`])); }
function translate(answers) {
 const scores={analytical:0,social:0,adaptable:0,action:0};
 const details=questions.map(([question, opts],i) => {
  const idx=opts.findIndex(o=>o[1]===answers?.[`q${i}`]);
  if(idx>=0) scores[traitByQuestion[i][idx]]++;
  return {number:i+1,question,answer:idx>=0?opts[idx][0]:'ไม่พบข้อมูล'};
 });
 const max=Math.max(...Object.values(scores));
 const result=Object.keys(scores).filter(k=>scores[k]===max).map(k=>traits[k]).join(' / ');
 return {details,scores,result};
}
module.exports={questions,valid,translate};
