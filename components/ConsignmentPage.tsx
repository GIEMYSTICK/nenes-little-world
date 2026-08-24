import { BadgeCheck, Camera, HandHeart, SearchCheck } from "lucide-react";
import { CommerceHeader } from "@/components/CommerceHeader";
import { ConsignmentForm } from "@/components/ConsignmentForm";
import { Footer } from "@/components/Footer";
import { getCatalog } from "@/lib/catalog";
import type { Locale } from "@/lib/commerce-types";

export async function ConsignmentPage({ locale }: { locale: Locale }) {
  const en = locale === "en"; const { categories, configured } = await getCatalog();
  return <main className="consignment-page"><CommerceHeader locale={locale} /><section className="consignment-hero"><div><p className="eyebrow">Sell with Nene</p><h1>{en ? <>Let a little favourite<br /><em>find a new family.</em></> : <>ให้ของชิ้นโปรด<br /><em>ได้เริ่มเรื่องราวบทใหม่</em></>}</h1><p>{en ? "Have baby or parent essentials that are still in good condition? Share the details with us and Nene’s family will help review them for consignment." : "มีของใช้แม่และเด็กสภาพดีที่อยากส่งต่อหรือไม่? ส่งรายละเอียดมาให้เรา ครอบครัวเนเน่จะช่วยตรวจสอบก่อนนำมาฝากขายอย่างเหมาะสม"}</p></div><div className="consignment-steps"><article><Camera /><b>1</b><span>{en ? "Share item details" : "ส่งรายละเอียดและรูป"}</span></article><article><SearchCheck /><b>2</b><span>{en ? "Nene reviews it" : "เนเน่ช่วยตรวจสอบ"}</span></article><article><HandHeart /><b>3</b><span>{en ? "Meet a new family" : "ส่งต่อสู่บ้านใหม่"}</span></article></div></section>
    <section className="consignment-form-section"><div className="consignment-form-intro"><BadgeCheck /><p className="eyebrow">Honest & thoughtful</p><h2>{en ? "Consignment request" : "แบบฟอร์มฝากขาย"}</h2><p>{en ? "Submitting an item does not guarantee listing. We review suitability, safety, condition, and fair pricing before contacting you." : "การส่งข้อมูลยังไม่ถือว่าได้รับลงขาย เราจะพิจารณาความเหมาะสม ความปลอดภัย สภาพสินค้า และราคาที่เป็นธรรมก่อนติดต่อกลับ"}</p>{!configured && <div className="setup-warning">{en ? "Supabase must be connected before this form can submit." : "ต้องเชื่อมต่อ Supabase ก่อนแบบฟอร์มจะส่งข้อมูลได้"}</div>}</div><ConsignmentForm categories={categories} locale={locale} /></section><Footer locale={locale} /></main>;
}
