'use strict';
// Excel .xlsx using Office Open XML and ZIP (no additional runtime packages).
const zlib = require('node:zlib');
const {translate} = require('./admin-data');
const escape = s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const crcTable = Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});
const crc32 = b => {let c=0xFFFFFFFF;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
function zip(entries) {
 let offset=0;const bodies=[],central=[];
 for(const [name,text] of entries){
  const filename=Buffer.from(name);const input=Buffer.from(text,'utf8'),compressed=zlib.deflateRawSync(input);const crc=crc32(input);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(8,6);local.writeUInt16LE(8,8);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(input.length,22);local.writeUInt16LE(filename.length,26);
  bodies.push(local,filename,compressed);
  const directory=Buffer.alloc(46);directory.writeUInt32LE(0x02014b50,0);directory.writeUInt16LE(20,4);directory.writeUInt16LE(20,6);directory.writeUInt16LE(8,8);directory.writeUInt16LE(8,10);directory.writeUInt32LE(crc,16);directory.writeUInt32LE(compressed.length,20);directory.writeUInt32LE(input.length,24);directory.writeUInt16LE(filename.length,28);directory.writeUInt32LE(offset,42);
  central.push(directory,filename);offset+=local.length+filename.length+compressed.length;
 }
 const center=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(center.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...bodies,center,end]);
}
function xlsx(rows){
 const head=['รหัสรายการ','ชื่อเล่น','วันที่ส่ง (เวลาไทย)','ผลวิเคราะห์แนวโน้ม',...Array.from({length:10},(_,i)=>`ข้อ ${i+1}`),'ข้อความถึงคนทำเว็บ','ชุดคำถาม'];
 const all=[head,...rows.map(row=>{const t=translate(row.answers);return [row.id,row.answers?.nickname,new Date(row.submitted_at).toLocaleString('th-TH',{timeZone:'Asia/Bangkok',hour12:false}),t.result,...t.details.map(d=>d.answer),row.answers?.creatorFeedback,row.answers?.questionnaireVersion===2?2:1];})];
 const cells=all.map((row,i)=>`<row r="${i+1}">${row.map((value,j)=>{let n=j+1,letters='';while(n){n--;letters=String.fromCharCode(65+n%26)+letters;n=Math.floor(n/26);}let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return `<c r="${letters}${i+1}" t="inlineStr"><is><t xml:space="preserve">${escape(s)}</t></is></c>`;}).join('')}</row>`).join('');
 const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="17"/><sheetData>${cells}</sheetData></worksheet>`;
 return zip([
 ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
 ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
 ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="คำตอบแบบสอบถาม" sheetId="1" r:id="rId1"/></sheets></workbook>'],
 ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
 ['xl/worksheets/sheet1.xml',sheet]
 ]);
}
module.exports={xlsx};
