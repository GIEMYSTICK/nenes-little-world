import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <main className="legal-page">
      <article>
        <p className="eyebrow">Nene&apos;s Little World</p>
        <h1>คำแนะนำการลบข้อมูล</h1>
        <p>เว็บไซต์นี้ไม่ได้จัดเก็บบัญชี รหัสผ่าน หรือ Access Token ของ Facebook ไว้ในฐานข้อมูลของเว็บไซต์</p>
        <h2>การลบความคิดเห็น</h2>
        <p>ผู้ใช้สามารถลบความคิดเห็นของตนจากกล่อง Facebook Comments บนเว็บไซต์ หรือตรวจสอบและลบการเชื่อมต่อแอปได้จากการตั้งค่า Apps and Websites ในบัญชี Facebook</p>
        <h2>ขอความช่วยเหลือ</h2>
        <p>หากต้องการความช่วยเหลือเพิ่มเติม ส่งคำขอพร้อมรายละเอียดความคิดเห็นมาที่ <a href="mailto:jiminun1@gmail.com">jiminun1@gmail.com</a></p>
        <Link href="/">← กลับสู่หน้าแรก</Link>
      </article>
    </main>
  );
}
