import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article>
        <p className="eyebrow">Nene&apos;s Little World</p>
        <h1>นโยบายความเป็นส่วนตัว</h1>
        <p>เว็บไซต์นี้เป็นอัลบั้มความทรงจำของครอบครัว และไม่ได้สร้างบัญชีผู้ใช้หรือจัดเก็บรหัสผ่าน Facebook</p>
        <h2>ความคิดเห็นผ่าน Facebook</h2>
        <p>ส่วนความคิดเห็นให้บริการโดย Meta/Facebook เมื่อผู้เยี่ยมชมเลือกเข้าสู่ระบบหรือแสดงความคิดเห็น ข้อมูลดังกล่าวจะถูกประมวลผลตามนโยบายของ Meta และอาจรวมถึงชื่อ รูปโปรไฟล์ และเนื้อหาความคิดเห็นที่ผู้ใช้เลือกเผยแพร่</p>
        <h2>การติดต่อ</h2>
        <p>หากมีคำถามเกี่ยวกับข้อมูลบนเว็บไซต์ ติดต่อได้ที่ <a href="mailto:jiminun1@gmail.com">jiminun1@gmail.com</a></p>
        <Link href="/">← กลับสู่หน้าแรก</Link>
      </article>
    </main>
  );
}
