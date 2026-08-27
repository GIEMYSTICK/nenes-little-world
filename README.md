# Nene's Little World

เว็บไซต์ความทรงจำสองภาษา พร้อมหน้าร้าน ระบบฝากขาย ระบบชำระเงิน Stripe และ Admin Dashboard สำหรับครอบครัวเนเน่

คู่มือฉบับเต็มสำหรับการพัฒนาและนำระบบขึ้นใช้งาน: [`docs/DEPLOYMENT_GUIDE_TH.md`](docs/DEPLOYMENT_GUIDE_TH.md)

## ฟีเจอร์หลัก

- Baby Memory ภาษาไทย/อังกฤษ รองรับมือถือและเดสก์ท็อป
- ร้านค้าสินค้าแม่และเด็ก พร้อมหมวดหมู่ สต็อก สภาพสินค้า และสินค้าแนะนำ
- Stripe-hosted Checkout และ Webhook บันทึกคำสั่งซื้อ
- แบบฟอร์มฝากขาย พร้อมเลขอ้างอิงและอีเมลตอบกลับ
- Admin Dashboard จัดการสินค้า ออเดอร์ ฝากขาย และคอนเทนต์
- Supabase Auth, Postgres และ Row Level Security (RLS)
- Contact form ส่งผ่าน Gmail SMTP ไปยัง `jiminun1@gmail.com`

## เริ่มต้น

```bash
npm install
cp .env.example .env.local
npm run dev
```

เปิด `http://localhost:3000` และตรวจระบบด้วย:

```bash
npm run lint
npm run build
```

## อัปเดต Production

โปรเจกต์นี้ใช้ Git remote ชื่อ `nene` และ branch `mail` เป็น Production Branch ของ Vercel:

```bash
git add .
git commit -m "อธิบายสิ่งที่แก้ไข"
git push nene mail
```

เมื่อ Push สำเร็จ Vercel จะ Build และ Deploy ไปยัง Production โดยอัตโนมัติ ควรรัน `npm run lint` และ `npm run build` ก่อน Push ทุกครั้ง

GitHub Fine-grained token สำหรับเครื่องนี้เก็บใน macOS Keychain ไม่ได้เก็บใน Repository ห้ามใส่ token, App Password หรือ Secret ใด ๆ ลงใน Commit เอกสาร หรือคำสั่ง remote URL

## ตั้งค่า Supabase

1. สร้าง Supabase project
2. เปิด SQL Editor แล้วรันไฟล์ `supabase/schema.sql` ทั้งไฟล์
3. เพิ่มค่าจาก Project Settings → API ลง `.env.local` และ Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. ไปที่ Authentication → Users แล้วสร้างผู้ใช้ Admin
5. นำ UUID ของผู้ใช้ไปรันคำสั่งท้ายไฟล์ `supabase/schema.sql` เพื่อเพิ่มสิทธิ์ `admin`
6. เข้าหลังบ้านที่ `/admin`

ห้ามส่ง `SUPABASE_SERVICE_ROLE_KEY` ไปยัง Client หรือใช้ชื่อตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_`

## ตั้งค่า Stripe

เพิ่มตัวแปรต่อไปนี้ใน Vercel Production:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

ใน Stripe Workbench → Webhooks ให้ใช้ Endpoint URL:

```text
https://โดเมนของคุณ/api/stripe/webhook
```

เลือก Event `checkout.session.completed` แล้วคัดลอก Signing secret (`whsec_...`) ไปใส่ `STRIPE_WEBHOOK_SECRET` จากนั้น Redeploy

## ตั้งค่าอีเมล

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=jiminun1@gmail.com
SMTP_APP_PASSWORD=Google-App-Password
CONTACT_TO_EMAIL=jiminun1@gmail.com
```

## หน้าสำคัญ

- `/` และ `/en` — เว็บไซต์ความทรงจำ
- `/shop` และ `/en/shop` — หน้าร้าน
- `/sell-with-nene` และ `/en/sell-with-nene` — ฝากขาย
- `/admin` — ระบบหลังบ้าน

ไฟล์ `.env*` ถูกกันออกจาก Git แล้ว ห้าม Commit ค่าลับทุกชนิดขึ้น GitHub
