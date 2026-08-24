import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "การขอลบข้อมูล | Nene's Little World",
  description: "ขั้นตอนขอลบข้อมูลที่ส่งผ่านเว็บไซต์ Nene's Little World",
  alternates: { canonical: "/data-deletion", languages: { "th-TH": "/data-deletion", en: "/en/data-deletion" } },
};

export default function DataDeletionPage() {
  return <main className="legal-page"><article>
    <p className="eyebrow">Nene&apos;s Little World</p>
    <h1>การขอลบข้อมูล</h1>
    <p>คุณสามารถขอลบข้อมูลที่เคยส่งผ่านแบบฟอร์มติดต่อ แบบฟอร์มฝากขาย หรือข้อมูลลูกค้าที่เชื่อมโยงกับคำสั่งซื้อได้ โดยส่งอีเมลจากที่อยู่เดียวกับที่ใช้กรอกข้อมูล</p>
    <h2>ข้อมูลที่ควรแจ้ง</h2>
    <p>ระบุชื่อ อีเมล ประเภทคำขอ และเลขอ้างอิงรายการฝากขายหรือเลขคำสั่งซื้อ (ถ้ามี) ห้ามส่งรหัสผ่าน เลขบัตรเต็ม หรือข้อมูลลับอื่นมาทางอีเมล</p>
    <h2>ขั้นตอนดำเนินการ</h2>
    <p>ส่งคำขอไปที่ <a href="mailto:jiminun1@gmail.com?subject=ขอลบข้อมูลจากเว็บไซต์เนเน่">jiminun1@gmail.com</a> ครอบครัวของเนเน่จะตรวจสอบตัวตนและแจ้งผลกลับ ข้อมูลบางรายการอาจต้องเก็บต่อเมื่อจำเป็นต่อกฎหมาย บัญชี หรือการป้องกันการทุจริต</p>
    <h2>ลบข้อมูลใน Browser</h2>
    <p>คุณสามารถล้าง Local Storage หรือข้อมูลเว็บไซต์ผ่านการตั้งค่า Privacy/Site Data ของ Browser เพื่อลบสถานะตัวนับผู้เข้าชมที่บันทึกไว้ในอุปกรณ์</p>
    <Link href="/">← กลับสู่หน้าแรก</Link>
  </article></main>;
}
