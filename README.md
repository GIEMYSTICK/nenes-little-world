# Nene's Little World

เว็บไซต์ Baby Memory / Baby Diary ของน้องเนเน่ สร้างด้วย Next.js, React, TypeScript และ Tailwind CSS พร้อมนำขึ้น Vercel

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## ตรวจสอบ Production Build

```bash
npm run build
npm start
```

## แก้ไขเนื้อหา

- ข้อมูลน้อง พัฒนาการ รูปภาพ ความทรงจำ และวิดีโอ: `data/nene.ts`
- รูปภาพ: `public/images/`
- วิดีโอ: `public/videos/`
- หน้าและส่วนประกอบ: `app/` และ `components/`

## Deploy บน Vercel

นำ repository เข้า Vercel แล้วใช้ค่า Framework Preset เป็น Next.js

## Facebook Comments

สร้างแอปที่ [Meta for Developers](https://developers.facebook.com/apps/) แล้วเพิ่ม Environment Variables ใน Vercel:

```bash
NEXT_PUBLIC_FACEBOOK_APP_ID=Facebook App ID
NEXT_PUBLIC_SITE_URL=https://โดเมนจริงของเว็บไซต์
NEXT_PUBLIC_FACEBOOK_GRAPH_VERSION=v26.0
```

`NEXT_PUBLIC_SITE_URL` ควรเป็นโดเมนถาวร เพราะ Facebook จะแยกความคิดเห็นตาม URL ห้ามใส่ Facebook App Secret ในตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_`
