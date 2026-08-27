# คู่มือสร้างและ Deploy เว็บไซต์ Nene's Little World

เอกสารนี้เป็นคู่มือประจำโปรเจกต์สำหรับพัฒนา ทดสอบ และนำเว็บไซต์เนเน่ขึ้นระบบจริงด้วย GitHub, Vercel และ Supabase รวมถึงการเชื่อมต่อ Stripe และ Gmail SMTP

> ตรวจทานกับ Source Code และ Production Audit ล่าสุดวันที่ 25 สิงหาคม 2026: Next.js 16.3.2, React 19.2.6, Supabase JS 2.x, Stripe SDK 22.x และ Nodemailer 9.x

## 1. ภาพรวมระบบ

ลำดับการทำงานหลัก:

```text
เครื่องผู้พัฒนา
  └─ แก้ไขและทดสอบ Next.js
       └─ Push ไป GitHub (remote: nene, branch: mail)
            └─ Vercel ตรวจพบ Commit และ Deploy อัตโนมัติ
                 ├─ Frontend ภาษาไทย/อังกฤษ
                 ├─ API Routes บน Vercel
                 ├─ Supabase: Auth + Database + Storage
                 ├─ Stripe: Checkout + Webhook
                 └─ Gmail SMTP: Contact/Consignment Email
```

ระบบสำคัญในเว็บไซต์:

- `/` และ `/en` — เว็บไซต์ความทรงจำภาษาไทยและอังกฤษ
- `/shop` และ `/en/shop` — ร้านค้าสินค้าแม่และเด็ก
- `/sell-with-nene` และ `/en/sell-with-nene` — แบบฟอร์มฝากขาย
- `/admin` — Dashboard สำหรับผู้ดูแล
- `/api/contact` — รับฟอร์มติดต่อและส่งอีเมล
- `/api/consignments` — รับข้อมูลฝากขาย
- `/api/checkout` — สร้าง Stripe Checkout Session
- `/api/stripe/webhook` — รับผลการชำระเงินจาก Stripe
- `/api/visitors` — ตัวนับผู้เข้าชม

## 2. เครื่องมือที่ต้องมี

- Node.js `20.9.0` ขึ้นไป
- npm
- Git
- บัญชี GitHub
- บัญชี Vercel
- Supabase Project
- Stripe Account (เมื่อเปิดระบบรับชำระเงินจริง)
- Gmail ที่เปิด 2-Step Verification และสร้าง App Password แล้ว (เมื่อใช้ SMTP)

ตรวจสอบเวอร์ชัน:

```bash
node --version
npm --version
git --version
```

## 3. ดาวน์โหลดและเปิดโปรเจกต์

### 3.1 หากสร้างโปรเจกต์ใหม่ตั้งแต่ต้น

ส่วนนี้ใช้เมื่อจำเป็นต้องสร้างเว็บใหม่ ไม่ต้องรันซ้ำกับ Repository ปัจจุบัน:

```bash
npx create-next-app@latest nenes-little-world --typescript --eslint --app --src-dir=false --import-alias="@/*"
cd nenes-little-world
npm install @supabase/supabase-js stripe nodemailer zod lucide-react
npm install -D @types/nodemailer eslint-plugin-jsx-a11y
```

จากนั้นสร้างโครงสร้าง `app/`, `components/`, `lib/`, `data/`, `public/` และ `supabase/` ตามหัวข้อ 4 แล้วจึงคัดลอก Feature ทีละส่วน การสร้างใหม่ควรเริ่มจากหน้า Static ให้ Build ผ่านก่อน แล้วค่อยเพิ่ม Supabase, Admin, Stripe และ SMTP ตามลำดับ

### 3.2 เปิด Repository ปัจจุบัน

```bash
git clone https://github.com/GIEMYSTICK/nenes-little-world.git
cd nenes-little-world
npm install
cp .env.example .env.local
```

ไฟล์ `.env.local` ใช้เฉพาะในเครื่องและห้าม Commit ขึ้น GitHub

เปิดเว็บสำหรับพัฒนา:

```bash
npm run dev
```

จากนั้นเปิด `http://localhost:3000`

## 4. โครงสร้างโปรเจกต์ที่ควรรู้

```text
app/                    หน้าเว็บและ API Routes
app/en/                 หน้าภาษาอังกฤษ
app/admin/              หน้า Admin Dashboard
app/api/                Backend API ของ Next.js
app/robots.ts            กฎสำหรับ Search Engine และป้องกันการ Crawl Admin/API
app/sitemap.ts           Sitemap สองภาษา
components/             UI และ Feature Components
data/nene.ts             ข้อมูลพื้นฐานของเนเน่
lib/                    Supabase, Email, Auth และ Catalog helpers
public/                 รูปภาพ วิดีโอ โลโก้ และไฟล์สาธารณะ
supabase/schema.sql      โครงสร้างฐานข้อมูล, RLS และข้อมูลเริ่มต้น
docs/                    คู่มือประจำโปรเจกต์
.env.example             รายชื่อตัวแปร Environment
```

เมื่อเพิ่มไฟล์รูปหรือวิดีโอแบบคงที่ ให้วางใน `public/` แล้วเรียกด้วย path ที่เริ่มจาก `/` เช่น `/images/photo.jpeg`

## 5. ตัวแปร Environment

สร้าง `.env.local` จาก `.env.example` แล้วกรอกค่าจริง:

```env
NEXT_PUBLIC_SITE_URL=https://nenes-little-world.vercel.app

# Supabase — ค่า public ใช้ใน Browser ได้ แต่ต้องเปิด RLS
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=jiminun1@gmail.com
SMTP_APP_PASSWORD=
CONTACT_TO_EMAIL=jiminun1@gmail.com
```

กฎความปลอดภัย:

- ตัวแปรที่ขึ้นต้น `NEXT_PUBLIC_` จะถูกส่งไป Browser จึงห้ามใส่ Secret
- ห้ามเปิดเผย `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` และ `SMTP_APP_PASSWORD`
- ห้ามใส่ Secret ลงในโค้ด, README, Screenshot, Commit หรือ GitHub Issue
- หาก Secret เคยถูกเผยแพร่ ให้ยกเลิกและสร้างค่าใหม่ทันที

ตารางการเปิดเผยค่า:

| ตัวแปร | ใช้ที่ใด | เป็น Secret | หมายเหตุ |
|---|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata/ลิงก์ | ไม่ | Local fallback; บน Vercel ระบบเลือก Production Domain อัตโนมัติ |
| `NEXT_PUBLIC_SUPABASE_URL` | Server + Browser | ไม่ | URL ของ Supabase Project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Server + Browser | ไม่ | ต้องใช้ร่วมกับ RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server เท่านั้น | ใช่ | ใช้ใน API Admin/Order ห้ามส่งเข้า Browser |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser | ไม่ | เตรียมไว้สำหรับ Stripe UI ในอนาคต |
| `STRIPE_SECRET_KEY` | Server เท่านั้น | ใช่ | สร้าง Checkout Session |
| `STRIPE_WEBHOOK_SECRET` | Server เท่านั้น | ใช่ | ตรวจลายเซ็น Webhook |
| `SMTP_USER` | Server เท่านั้น | ข้อมูลภายใน | บัญชีผู้ส่งอีเมล |
| `SMTP_APP_PASSWORD` | Server เท่านั้น | ใช่ | Google App Password ไม่ใช่รหัส Gmail ปกติ |
| `CONTACT_TO_EMAIL` | Server เท่านั้น | ไม่ | อีเมลผู้รับข้อความจากเว็บ |

ใน Vercel ควรกำหนด ENV แยกอย่างน้อย 3 กลุ่ม: **Production**, **Preview** และ **Development** ห้ามใช้ Stripe Live Secret ใน Preview/Development

## 6. สร้างและตั้งค่า Supabase

### 6.1 สร้าง Project

1. เข้า Supabase Dashboard และกด **New project**
2. เลือก Organization, ชื่อ Project, Region และตั้ง Database Password
3. รอ Project พร้อมใช้งาน
4. ไปที่ **Project Settings → API**
5. คัดลอก Project URL, Publishable/Anon Key และ Service Role Key ไปเก็บใน ENV

### 6.2 สร้างฐานข้อมูล

1. เปิด **SQL Editor**
2. สร้าง Query ใหม่
3. คัดลอกเนื้อหาทั้งหมดจาก `supabase/schema.sql`
4. กด **Run** หนึ่งครั้ง

Schema นี้สร้างตารางหลัก:

- `profiles` — ผู้ดูแลและบทบาท `admin`/`editor`
- `categories` — หมวดหมู่สินค้า
- `products` — สินค้า ราคา สต็อก และสถานะ
- `product_images` — รูปสินค้าหลายรูป
- `customers` — ลูกค้า
- `orders` และ `order_items` — คำสั่งซื้อ
- `consignment_submissions` — รายการฝากขาย
- `site_content` — คอนเทนต์ภาษาไทย/อังกฤษ

ไฟล์เดียวกันยังเปิด Row Level Security (RLS), สร้าง Policies, Indexes, Triggers และข้อมูลเริ่มต้นด้วย

หาก `supabase/schema.sql` เปลี่ยนหลังระบบเปิดใช้งานแล้ว ให้เก็บเฉพาะ SQL ส่วนที่เพิ่มหรือแก้เป็น Migration ใหม่ก่อน อย่าลบตาราง Production เพื่อรันใหม่ เพราะอาจทำให้สินค้า ออเดอร์ และรายการฝากขายสูญหาย ควรสำรองฐานข้อมูลก่อน Migration ทุกครั้ง

### 6.3 สร้าง Admin

1. ไปที่ **Authentication → Users → Add user**
2. สร้างผู้ใช้ด้วยอีเมลผู้ดูแลและรหัสผ่านที่แข็งแรง
3. คัดลอก UUID ของผู้ใช้
4. เปิด SQL Editor แล้วรัน:

```sql
insert into public.profiles (id, display_name, role)
values ('UUID_ของผู้ใช้', 'Nene Admin', 'admin')
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role;
```

5. เข้า `/admin` และ Login ด้วยบัญชีที่สร้าง

### 6.4 Storage สำหรับรูปที่อัปโหลดจาก Admin

API `/api/admin/uploads` จะสร้าง Public Bucket ชื่อ `nene-media` อัตโนมัติในครั้งแรกที่ Admin อัปโหลดรูป โดยกำหนดขนาดสูงสุด 4 MB และรองรับ JPG, PNG, WEBP และ GIF รูปจะถูกจัดไว้ใต้ Folder เช่น `products/` และ `content/`

หลังอัปโหลดครั้งแรก ให้ตรวจสอบใน Supabase Dashboard ที่ **Storage** ว่ามี Bucket `nene-media` และค่าตรงตามนี้:

- ผู้ชมอ่านรูปที่เผยแพร่ได้
- เฉพาะ Admin/Editor อัปโหลด แก้ไข หรือลบได้
- จำกัดชนิดไฟล์เป็นรูปภาพและกำหนดขนาดสูงสุดที่เหมาะสม

การอัปโหลดและลบจาก Dashboard ของเว็บต้องผ่าน Admin API ซึ่งตรวจ Supabase Access Token และบทบาท `admin`/`editor` ก่อน ส่วน Public URL ใช้แสดงภาพหน้าร้าน ห้ามใส่เอกสารส่วนตัวหรือภาพที่ไม่ต้องการเผยแพร่ใน Bucket นี้

### 6.5 ความสัมพันธ์ข้อมูลโดยสรุป

```text
auth.users 1 ── 1 profiles
categories 1 ── * products
products   1 ── * product_images
customers  1 ── * orders
orders     1 ── * order_items * ── 1 products
consignment_submissions 1 ── 0..* products
auth.users 1 ── * site_content (updated_by)
```

Public อ่านได้เฉพาะหมวดหมู่ที่เปิดใช้ สินค้า `active` และคอนเทนต์ที่เผยแพร่ ส่วนข้อมูลลูกค้า ออเดอร์ และหลังบ้านต้องผ่าน Service Role/Staff เท่านั้น

## 7. นำโปรเจกต์ขึ้น GitHub

ตรวจสอบก่อน Commit:

```bash
git status
npm run lint
npm run build
```

Commit และ Push:

```bash
git add .
git commit -m "Describe the website update"
git push origin main
```

ตรวจใน GitHub ว่าไม่มี `.env.local` หรือ Secret อยู่ในรายการไฟล์

ตรวจไฟล์ที่กำลังจะ Commit แบบละเอียด:

```bash
git diff --check
git diff --cached --stat
git diff --cached
git ls-files | grep -E '(^|/)\.env' || true
```

ผลที่ถูกต้องคือ Git ติดตามได้เฉพาะ `.env.example` ซึ่งมีแต่ช่องว่างหรือตัวอย่างที่ไม่ใช่ Secret

แนวทาง Branch สำหรับการเปลี่ยนแปลงใหญ่:

```bash
git switch -c feature/ชื่อฟีเจอร์
git push -u origin feature/ชื่อฟีเจอร์
```

จากนั้นสร้าง Pull Request, ตรวจ Preview Deployment และ Merge เข้า `main`

## 8. เชื่อม GitHub กับ Vercel

### 8.1 Import Project ครั้งแรก

1. เข้า Vercel Dashboard และกด **Add New → Project**
2. เชื่อมบัญชี GitHub
3. เลือก Repository `GIEMYSTICK/nenes-little-world`
4. Framework Preset ควรตรวจพบเป็น **Next.js**
5. Root Directory ใช้ค่าเริ่มต้นของ Repository
6. Build Command ใช้ `npm run build`
7. เพิ่ม Environment Variables ตามหัวข้อ 5
8. กด **Deploy**

ระบบปัจจุบันตั้ง **Production Branch เป็น `mail`** ดังนั้นทุก Commit ที่ Push เข้า `mail` จะสร้าง Production Deployment ใหม่อัตโนมัติ ส่วน branch อื่นและ Pull Request จะได้ Preview Deployment

ตั้งค่าได้ที่ Vercel → Project Settings → Environments → Production → Branch Tracking โดยกำหนด Matching pattern เป็น `mail`

ลำดับตั้งระบบใหม่ที่ปลอดภัย:

1. สร้าง Supabase Project และรัน `supabase/schema.sql`
2. สร้าง Supabase Admin และตรวจ RLS
3. Push Source Code ไป GitHub
4. Import GitHub Repository เข้า Vercel
5. เพิ่ม ENV ใน Vercel
6. Deploy แล้วทดสอบเว็บ/หลังบ้าน
7. ตั้ง Stripe Webhook ด้วย Production URL
8. ทดสอบ SMTP และ Stripe Test mode
9. เชื่อมโดเมนจริง แล้วอัปเดต URL ที่ Stripe/บริการภายนอกใช้

### 8.2 เพิ่มหรือแก้ ENV บน Vercel

1. เปิด Project ใน Vercel
2. ไปที่ **Settings → Environment Variables**
3. เพิ่มชื่อและค่าทีละรายการ
4. เลือก Environment อย่างน้อย **Production** และเลือก **Preview** หากต้องทดสอบ PR
5. กด Save
6. ไปที่ **Deployments**, เปิดเมนู Deployment ล่าสุด แล้วกด **Redeploy**

การแก้ ENV จะไม่กระทบ Deployment เดิมจนกว่าจะ Redeploy

Vercel มี System Environment Variable `VERCEL_PROJECT_PRODUCTION_URL` ซึ่งโค้ดใน `lib/site-url.ts` เลือกใช้ก่อน URL ของ Deployment ชั่วคราว เพื่อป้องกัน Canonical, Sitemap, Robots และ Social Preview ชี้ไป Git Branch URL ผิดตัว ส่วน Stripe Success/Cancel URL จะกลับมายัง Host เดียวกับหน้าที่เริ่ม Checkout เพื่อให้ Production และ Preview ไม่ปะปนกัน

### 8.3 ตั้งโดเมน

1. ไปที่ **Settings → Domains**
2. เพิ่มโดเมนที่ซื้อแล้ว
3. ตั้ง DNS ตามค่าที่ Vercel แสดง
4. รอให้สถานะ Valid และ HTTPS พร้อมใช้งาน
5. เปลี่ยน `NEXT_PUBLIC_SITE_URL` เป็นโดเมนหลักแบบ HTTPS แล้ว Redeploy

ควรใช้ URL หลักเพียงรูปแบบเดียว เช่น `https://www.example.com` หรือ `https://example.com` เพื่อให้ SEO, Stripe Webhook และลิงก์ Canonical ตรงกัน

หลังเปลี่ยนโดเมนให้ตรวจ `/robots.txt`, `/sitemap.xml`, Canonical Tag, Stripe Webhook URL และ `NEXT_PUBLIC_SITE_URL` อีกครั้ง

## 9. ตั้งค่า Stripe

### 9.1 API Keys

1. เปิด Stripe Dashboard
2. เริ่มจาก Test mode
3. คัดลอก Publishable Key และ Secret Key ไปใส่ Vercel ENV
4. อย่านำ Secret Key ไปใส่ตัวแปร `NEXT_PUBLIC_`

### 9.2 Webhook

สร้าง Endpoint URL:

```text
https://โดเมนจริง/api/stripe/webhook
```

เลือก Event อย่างน้อย:

```text
checkout.session.completed
```

จากนั้นคัดลอก Signing Secret ที่ขึ้นต้นด้วย `whsec_` ไปใส่ `STRIPE_WEBHOOK_SECRET` แล้ว Redeploy

ก่อนรับเงินจริง ให้ทดสอบ Checkout, Webhook, การสร้าง Order และการอัปเดตสต็อกใน Test mode ให้ครบ

ระบบปัจจุบันรับชำระผ่านบัตรและบันทึก Order เฉพาะ `checkout.session.completed` ที่มี `payment_status=paid` เท่านั้น Webhook ตรวจลายเซ็นและใช้ `stripe_checkout_session_id` ป้องกันการสร้าง Order ซ้ำ หากขั้นตอนสร้าง Order Item ล้มเหลว ระบบจะล้าง Order ที่ยังไม่สมบูรณ์เพื่อให้ Stripe Retry ได้ การตัดสต็อกใช้ค่าเดิมเป็นเงื่อนไขแบบ Optimistic Lock หากสต็อกเปลี่ยนระหว่างประมวลผล ระบบจะไม่เขียนทับยอดใหม่และตอบ HTTP 409 เพื่อป้องกันการขายเกินจำนวน

## 10. ตั้งค่า Gmail SMTP

1. ใช้บัญชีผู้ใหญ่ที่มีสิทธิ์ดูแลเว็บไซต์
2. เปิด 2-Step Verification ใน Google Account
3. สร้าง App Password สำหรับเว็บไซต์
4. ใส่ App Password ใน `SMTP_APP_PASSWORD` โดยไม่ใส่ในโค้ด
5. ตั้ง `SMTP_USER` และ `CONTACT_TO_EMAIL` เป็น `jiminun1@gmail.com`
6. Redeploy หลังแก้ ENV

ทดสอบทั้ง Contact Form และ Consignment Form แล้วตรวจ:

- เจ้าของเว็บไซต์ได้รับอีเมล
- ผู้ส่งได้รับอีเมลตอบกลับอัตโนมัติ
- อีเมลไม่ตก Spam
- ไม่มี App Password ปรากฏใน Vercel Logs

## 11. ขั้นตอนพัฒนาเว็บไซต์เนเน่

### 11.1 เพิ่มหรือแก้หน้าเว็บ

- หน้าไทยอยู่ใน `app/` และ Components ที่เกี่ยวข้อง
- หน้าอังกฤษอยู่ใน `app/en/`
- ข้อความสองภาษาต้องมีความหมายตรงกัน ไม่แปลชื่อเฉพาะหรือข้อมูลติดต่อผิด
- ทดสอบทั้งมือถือและเดสก์ท็อป
- รูปภาพควรมี `alt` ที่เหมาะสมทั้งไทยและอังกฤษ

### 11.2 แก้ข้อมูลเนเน่

ข้อมูลพื้นฐานอยู่ที่ `data/nene.ts` ระบบอายุควรคำนวณจากวันเกิดโดยอัตโนมัติ หลีกเลี่ยงการเขียนอายุแบบตายตัวใน UI

### 11.3 แก้คอนเทนต์ผ่าน Admin

1. เข้า `/admin`
2. Login ด้วย Supabase Admin
3. แก้สินค้า รูปสินค้า คำสั่งซื้อ ฝากขาย หรือคอนเทนต์
4. ตั้งสถานะ Published/Active เมื่อพร้อมแสดงหน้าเว็บ
5. เปิดหน้าบ้านภาษาไทยและอังกฤษเพื่อตรวจผล

คอนเทนต์ที่บันทึกใน Supabase มีผลกับข้อมูลหน้าเว็บโดยไม่ต้องแก้ Source Code แต่การแก้ Layout, Component หรือ Logic ต้อง Commit และ Deploy ใหม่

### 11.4 เพิ่มและจัดการสินค้า

1. เข้า **สินค้า → เพิ่มสินค้า**
2. กรอกชื่อและรายละเอียดทั้งภาษาไทย/อังกฤษ
3. Slug ใช้เฉพาะ `a-z`, `0-9` และ `-` และต้องไม่ซ้ำ
4. กรอกราคา ราคาเดิม สต็อก สภาพ ยี่ห้อ และ SKU
5. อัปโหลดรูปได้สูงสุด 8 รูป รูปแรกเป็นรูปปก
6. เริ่มด้วยสถานะ `draft` แล้วตรวจ Preview
7. เปลี่ยนเป็น `active` เมื่อพร้อมขาย

ระบบย่อรูปขนาดใหญ่เป็น WEBP ใน Browser ก่อนอัปโหลด ลบไฟล์ร่างที่ไม่ได้ใช้เมื่อกดยกเลิก และตรวจข้อมูลซ้ำที่ Server API เพื่อป้องกันค่าผิดประเภท

### 11.5 ระบบสองภาษา

- Layout `/en/*` เปลี่ยนภาษาเอกสารใน Browser เป็น `en` หลัง Hydration
- Loading Screen มีไทยที่ `app/loading.tsx` และอังกฤษที่ `app/en/loading.tsx`
- หน้า Privacy/Data Deletion มีทั้ง `/privacy`, `/data-deletion`, `/en/privacy`, `/en/data-deletion`
- Contact Form และอีเมลตอบกลับเลือกภาษาตามหน้าที่ส่ง
- เมื่อเพิ่มหน้าใหม่ ต้องเพิ่มลิงก์สลับภาษา, Metadata Alternate และรายการใน `app/sitemap.ts`

### 11.6 SEO

- Metadata หลักอยู่ใน `app/layout.tsx` และ Metadata รายหน้า
- Canonical Base คำนวณใน `lib/site-url.ts`
- `app/sitemap.ts` สร้าง URL ไทย/อังกฤษ
- `app/robots.ts` อนุญาตหน้าสาธารณะและไม่ให้ Crawl `/admin`, `/api/`
- รูปต้องมี Alt Text และ Social Preview ต้องใช้ URL แบบ HTTPS ที่เข้าถึงสาธารณะได้

## 12. Checklist ก่อน Deploy

- [ ] `npm run lint` ผ่าน
- [ ] `npm run build` ผ่าน
- [ ] หน้าไทยและอังกฤษแสดงถูกต้อง
- [ ] Mobile และ Desktop ไม่มีข้อความทับกัน
- [ ] Navigation, Bottom Navigation และ Scroll to Top ทำงาน
- [ ] รูปภาพและวิดีโอโหลดได้
- [ ] Loading Screen ทำงานทั้งไทยและอังกฤษ
- [ ] Contact Form และอีเมลทำงาน
- [ ] Supabase RLS เปิดทุกตารางสำคัญ
- [ ] Admin Login และสิทธิ์ใช้งานถูกต้อง
- [ ] Stripe อยู่ Test mode จนกว่าจะทดสอบครบ
- [ ] ไม่มี Secret ใน Git diff
- [ ] `npm audit --omit=dev --audit-level=high` ไม่มีช่องโหว่ระดับสูง
- [ ] `/robots.txt` และ `/sitemap.xml` สร้างได้
- [ ] Canonical ไม่ชี้ไป URL ที่มี `-git-` หรือ Deployment ชั่วคราว

คำสั่งตรวจหลัก:

```bash
git diff --check
npm run lint
npm run build
git status
```

## 13. Checklist หลัง Deploy

- [ ] Vercel Deployment มีสถานะ Ready
- [ ] เปิด `/`, `/en`, `/shop`, `/en/shop`, `/sell-with-nene`, `/en/sell-with-nene`
- [ ] เปิด `/privacy`, `/data-deletion`, `/en/privacy`, `/en/data-deletion`
- [ ] เปิด `/robots.txt` และ `/sitemap.xml`
- [ ] ตรวจหน้า `/admin` ด้วยบัญชีผู้ดูแล
- [ ] ทดสอบเพิ่ม/แก้รูปจาก Admin
- [ ] ส่ง Contact Form จริงหนึ่งครั้ง
- [ ] ส่งแบบฟอร์มฝากขายทดสอบหนึ่งครั้ง
- [ ] ทดสอบ Stripe Checkout ด้วยบัตรทดสอบ
- [ ] ตรวจ Stripe Webhook ว่าได้รับ HTTP 2xx
- [ ] ตรวจ Order ใน Supabase
- [ ] ตรวจ Browser Console และ Vercel Logs ว่าไม่มี Error
- [ ] ตรวจ Favicon, Site Logo, SEO Metadata และ Social Preview

## 14. การแก้ปัญหาที่พบบ่อย

### Vercel Build ไม่ผ่าน

รัน `npm run build` ในเครื่อง อ่าน Error บรรทัดแรกที่อ้างถึงไฟล์ของโปรเจกต์ แก้แล้ว Push ใหม่ หลีกเลี่ยงการ Redeploy Commit เดิมซ้ำหาก Source Code ยังผิด

### หน้าเว็บไม่เห็นการเปลี่ยนแปลง

ตรวจว่า Commit อยู่ใน `main`, Vercel Deployment ใหม่เป็น Production และเปิด URL หลัก จากนั้น Hard Refresh หรือทดสอบใน Private Window

### Supabase ขึ้น Unauthorized หรือไม่มีข้อมูล

ตรวจ URL/Key, สถานะ RLS, Policy, โปรไฟล์ Admin และว่า Vercel ENV อยู่ใน Environment ที่กำลังใช้งาน

### อัปโหลดรูปไม่ได้

ตรวจ Storage Bucket, Storage Policy, ขนาด/ชนิดไฟล์, Supabase Session และ Vercel Function Logs

### Stripe Webhook ไม่ทำงาน

ตรวจ URL ต้องลงท้าย `/api/stripe/webhook`, Event ที่เลือก, `STRIPE_WEBHOOK_SECRET`, Environment ระหว่าง Test/Live และ HTTP Response ใน Stripe Workbench

### SMTP ส่งอีเมลไม่ได้

ตรวจว่าใช้ App Password ไม่ใช่รหัส Gmail ปกติ, เปิด 2-Step Verification, Port เป็น `465`, Redeploy หลังแก้ ENV และดู Vercel Function Logs โดยไม่เผยแพร่ Secret

### Canonical หรือ Sitemap ชี้ไป URL เก่า

ตรวจ Production Deployment ว่ามี System ENV `VERCEL_PROJECT_PRODUCTION_URL` และตรวจ `NEXT_PUBLIC_SITE_URL` ว่าไม่ใช่ Branch URL หลังแก้ ENV ต้อง Redeploy และเปิด Source ของหน้าใหม่เพื่อตรวจ Canonical อีกครั้ง

### หน้าอังกฤษยังประกาศ `lang="th"`

ตรวจว่าหน้านั้นอยู่ใต้ `app/en/` และถูกครอบด้วย `app/en/layout.tsx` จากนั้น Hard Refresh แล้วตรวจ `<html lang="en">` ใน Developer Tools การตั้งค่าปัจจุบันเปลี่ยนค่าเมื่อ Client Hydrate; หากต้องการให้ HTML แรกจาก Server เป็น `en` ด้วย ควรแยก Root Layout ไทย/อังกฤษด้วย Route Group ในรอบ Refactor ถัดไป

### ฟอร์มถูก Spam

API มี Honeypot และ Rate Limit เบื้องต้น แต่หน่วยความจำของ Serverless Instance ไม่ใช่ Rate Limit แบบถาวร หากเริ่มมี Spam จริงควรเพิ่ม CAPTCHA หรือ Durable Rate Limiter และจำกัด Request ที่ Firewall/WAF

## 15. การสำรองและดูแลระบบ

- เปิดการป้องกัน Branch `main` เมื่อมีผู้ดูแลหลายคน
- สำรองฐานข้อมูล Supabase ตามรอบที่เหมาะสม
- บันทึกว่าใครเป็นเจ้าของ GitHub, Vercel, Supabase, Stripe และ Gmail
- เปิด 2FA ทุกบริการ
- หมุนเวียน Secret เมื่อมีคนออกจากทีม หรือสงสัยว่าค่ารั่วไหล
- ตรวจ Dependencies และอัปเดตอย่างระมัดระวัง พร้อม Build/Test ทุกครั้ง
- เก็บข้อมูลเด็กและลูกค้าเท่าที่จำเป็น และจำกัดสิทธิ์เข้าถึงรูปหรือข้อมูลส่วนตัว

## 16. Workflow สรุปสำหรับการอัปเดตทั่วไป

### 16.1 Workflow ปัจจุบันของโปรเจกต์นี้

เครื่องพัฒนาหลักตั้งค่าไว้ดังนี้:

- Git remote: `nene` → `https://github.com/GIEMYSTICK/nenes-little-world.git`
- Local/remote branch: `mail`
- Vercel Production Branch: `mail`
- GitHub credential: Fine-grained personal access token เก็บใน macOS Keychain
- ขอบเขต token: เฉพาะ `GIEMYSTICK/nenes-little-world`
- Repository permissions: Contents — Read and write, Metadata — Read-only
- วันหมดอายุ token ปัจจุบัน: 26 พฤศจิกายน 2026

คำสั่งอัปเดต Production:

```bash
git switch mail
npm run lint
npm run build
git add .
git commit -m "อธิบายสิ่งที่แก้ไข"
git push nene mail
```

หลัง Push ให้เปิด Vercel → Deployments และตรวจว่า Deployment ของ branch `mail` เป็น `Ready` จากนั้นทดสอบหน้าที่แก้ไขบนโดเมน Production จริง

ตรวจค่าที่ตั้งไว้ได้ด้วย:

```bash
git status --short --branch
git remote -v
git branch -vv
```

ห้ามบันทึกค่าจริงของ token ลงในคู่มือ, `.env`, remote URL หรือ Git history หาก token หมดอายุ ให้สร้าง Fine-grained token ใหม่โดยใช้ขอบเขตและ permissions เท่าเดิม แล้วอัปเดต credential ใน macOS Keychain

### 16.2 Workflow มาตรฐานสำหรับโปรเจกต์ที่ยังใช้ main

```bash
git pull --ff-only origin main
npm install
npm run dev
# แก้ไขและทดสอบเว็บไซต์
npm run lint
npm run build
git diff --check
git add .
git commit -m "Update Nene website"
git push origin main
```

จากนั้นเปิด Vercel เพื่อตรวจ Deployment และตรวจ Production ตาม Checklist หลัง Deploy

## 17. Rollback เมื่อ Production มีปัญหา

### Rollback เฉพาะเว็บไซต์

1. เปิด Vercel → Deployments
2. เลือก Deployment ล่าสุดที่ทำงานปกติ
3. กด Promote/Redeploy เป็น Production
4. สร้าง Git Revert สำหรับ Commit ที่มีปัญหาเพื่อให้ประวัติ Source Code ตรงกับ Production

```bash
git revert COMMIT_SHA
git push origin main
```

### Rollback ฐานข้อมูล

ห้ามใช้ `DROP TABLE` หรือ Restore โดยไม่ตรวจผลกระทบ ให้หยุดการ Deploy ก่อน สำรองข้อมูลปัจจุบัน อ่าน Migration ที่ทำให้เกิดปัญหา แล้วสร้าง Forward Fix SQL หากทำได้ การ Restore Database ควรเป็นทางเลือกสุดท้ายและต้องประสานข้อมูลคำสั่งซื้อที่เกิดหลัง Backup

## 18. ผลการตรวจ Project รอบล่าสุด

การตรวจวันที่ 25 สิงหาคม 2026 ครอบคลุม Source Code, Production Routes, API Validation, Secret Scan, Dependency Audit, Next.js Production Build และ Browser Route Test

รายการที่ตรวจและแก้แล้ว:

- แก้ Canonical/SEO Base ที่เคยชี้ไป Git Branch URL โดยใช้ Vercel Production Domain
- เพิ่ม `robots.txt` และ `sitemap.xml` สองภาษา พร้อมป้องกัน Search Engine Crawl หน้า Admin/API
- ทำให้ทุกหน้าใต้ `/en` เปลี่ยนภาษาเอกสารใน Browser เป็นอังกฤษ
- เพิ่ม Privacy และ Data Deletion ภาษาอังกฤษ
- แก้หน้านโยบายเก่าที่กล่าวถึง Facebook Comments ให้ตรงกับ Contact/Consignment/Shop ปัจจุบัน
- แปล Error และอีเมลตอบกลับของ Contact Form ภาษาอังกฤษ
- แก้ Honeypot ของฟอร์มฝากขายและเพิ่ม Rate Limit เบื้องต้น
- เพิ่ม Server Validation สำหรับแก้สินค้าและรูป พร้อมจำกัดสูงสุด 8 รูป
- ล้างไฟล์รูป Draft ที่ไม่ได้ใช้และลด Storage Orphan เมื่อการบันทึกรูปล้มเหลว
- ให้ Stripe สร้าง Order เฉพาะสถานะชำระแล้ว ตรวจผลการบันทึก Order Item และใช้ Optimistic Lock ป้องกันการตัดสต็อกชนกัน
- ตรวจ Route สาธารณะหลักตอบ HTTP 200 และ Admin API ที่ไม่มี Token ตอบ 401
- `npm audit --omit=dev` ไม่พบช่องโหว่
- `npm run lint`, TypeScript และ `npm run build` ผ่าน

ข้อจำกัดที่ต้องเข้าใจ:

- Rate Limit แบบ In-memory อาจรีเซ็ตเมื่อ Vercel Function เปลี่ยน Instance
- ค่า `lang` ของหน้าอังกฤษเปลี่ยนหลัง Client Hydration; หาก SEO ต้องการภาษาใน Server HTML ตั้งแต่ Byte แรก ควร Refactor เป็น Root Layout แยกภาษา
- ตัวนับผู้เข้าชมพึ่งพาบริการภายนอก หากบริการนั้นล่มจะแสดง `—` โดยไม่ทำให้เว็บหลักล่ม
- การทดสอบ SMTP จริง, Stripe Payment จริง และ Admin Upload จริงต้องใช้บัญชี/ENV ของ Production และควรทำตาม Checklist หลัง Deploy
