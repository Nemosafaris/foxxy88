# แบบสำรวจบุคลิกภาพ — รุ่นออนไลน์ พร้อมฐานข้อมูล PostgreSQL

ระบบนี้มีแบบสอบถาม 10 ข้อ และ API `POST /api/results` สำหรับเก็บผลของผู้ตอบทุกคนลง PostgreSQL อย่างถาวร (ตามนโยบายการเก็บรักษาของฐานข้อมูล/โฮสต์) **ไม่จำเป็นต้องมี XAMPP**

## วิธีนำขึ้นออนไลน์บน Railway

1. สมัคร/เข้าสู่ระบบ [GitHub](https://github.com) และ [Railway](https://railway.com).
2. สร้าง repository ใหม่บน GitHub แล้วอัปโหลด **ไฟล์ภายในโฟลเดอร์นี้** ทั้งหมด (ไม่ต้องอัปโหลดเป็น ZIP และไม่ต้องอัปโหลด `.env`).
3. Railway → **New Project** → **Deploy from GitHub repo** → เลือก repository นั้นและอนุญาตให้ Railway เข้าถึง.
4. ใน Railway project เพิ่มฐานข้อมูล **PostgreSQL** โดยกด **+ New** → **Database** → **Postgres**.
5. เปิดบริการ Node.js ที่สร้างจาก GitHub → **Variables** → **New Variable** ตั้งชื่อ `DATABASE_URL` และกำหนดค่าอ้างอิง `${{Postgres.DATABASE_URL}}` โดย **Postgres** ต้องตรงกับชื่อบริการฐานข้อมูลบน Railway (ใช้เมนู Add Reference หากมี).
6. ให้ Railway deploy/redeploy เว็บ (คำสั่งเริ่มระบบคือ `npm start`; Railway จะติดตั้งแพ็กเกจจาก `package.json`).
7. ที่บริการเว็บ → **Settings** → **Networking** → **Generate Domain** เพื่อสร้างลิงก์สาธารณะ `https://...up.railway.app` **เฉพาะบริการเว็บ ไม่ใช่บริการฐานข้อมูล**.
8. เปิด `https://<โดเมนของคุณ>/api/health` ควรได้ `{"ok":true,"database":"connected"}`. จากนั้นเปิดหน้าเว็บจริง ตอบครบ 10 ข้อ กดส่ง และเช็กข้อความว่า `ส่งข้อมูลไปยังเซิร์ฟเวอร์สำเร็จ`.
9. แชร์ลิงก์หน้าเว็บให้ผู้ตอบได้เลย ข้อมูลอยู่ในตาราง `survey_results` ของ Postgres. ดูได้จากแท็บ Database ของ Postgres (หากหน้า Railway รองรับการดูตาราง) หรือเชื่อมต่อเครื่องมือฐานข้อมูลแบบปลอดภัย.

## ทดสอบบนเครื่องที่มี PostgreSQL อยู่แล้ว

```sh
npm install
# Linux/macOS:
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DBNAME'
npm start
```

ที่ Windows PowerShell: `$env:DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DBNAME'` ก่อน `npm start`.
เปิด http://localhost:3000

## โครงสร้างตาราง

- `id` UUID: รหัสคำตอบ
- `submitted_at` timestamptz: วันเวลาตอบ
- `answers` jsonb: คำตอบ q0–q9

## ข้อควรทราบก่อนเปิดให้สาธารณะ

- ไม่มีหน้าผู้ดูแลหรือ API สำหรับดาวน์โหลดข้อมูล (ป้องกันการเปิดเผยคำตอบผู้ตอบโดยไม่ตั้งใจ).
- เปิดให้ผู้ตอบรู้ว่าจะจัดเก็บคำตอบ, วัตถุประสงค์, ระยะเวลาเก็บ, และวิธีติดต่อผู้ดูแล; จัดทำนโยบายความเป็นส่วนตัวที่เหมาะสมก่อนนำไปใช้จริง.
- สำรองฐานข้อมูลและตั้งงบประมาณ/การแจ้งเตือนค่าบริการที่ Railway.
- มีการตรวจสอบค่าคำตอบและจำกัดจำนวนคำขอขั้นพื้นฐาน แต่หากเปิดสาธารณะเป็นวงกว้าง ควรเพิ่มการป้องกันสแปมและระบบติดตาม.
- ระบบนี้ **ไม่ใช่แบบทดสอบบุคลิกภาพมาตรฐานทางจิตวิทยา**.
