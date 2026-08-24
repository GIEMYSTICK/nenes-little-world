import { BadgeCheck, HeartHandshake, Recycle, ShieldCheck, Sparkles } from "lucide-react";
import { CommerceHeader } from "@/components/CommerceHeader";
import { ShopCatalog } from "@/components/ShopCatalog";
import { Footer } from "@/components/Footer";
import { getCatalog, getSiteContent } from "@/lib/catalog";
import type { Locale } from "@/lib/commerce-types";

export async function ShopPage({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [{ products, categories, configured }, content] = await Promise.all([getCatalog(), getSiteContent("shop_hero", locale)]);
  return <main className="shop-page"><CommerceHeader locale={locale} />
    <section className="shop-hero"><div className="shop-hero-copy"><p className="eyebrow">Nene&apos;s little shop</p><h1>{content?.title || (en ? "Loved little things, ready for a new home." : "ของรักของเนเน่ พร้อมส่งต่ออย่างใส่ใจ")}</h1><p>{content?.body || (en ? "Thoughtfully selected essentials for babies and parents—with honest condition details and a story behind every item." : "สินค้าสำหรับแม่และเด็กที่คัดสรร ตรวจสอบสภาพ และบอกรายละเอียดอย่างตรงไปตรงมา เพื่อเริ่มต้นเรื่องราวบทใหม่กับครอบครัวของคุณ")}</p><div className="shop-hero-actions"><a href="#catalog"><Sparkles size={18} /> Shop Now</a><a href={en ? "/en/sell-with-nene" : "/sell-with-nene"}><HeartHandshake size={18} /> {en ? "Sell with Nene" : "ฝากขายกับเนเน่"}</a></div></div><div className={`shop-hero-art ${content?.payload?.image_url ? "has-image" : ""}`} style={typeof content?.payload?.image_url === "string" ? { backgroundImage: `url(${content.payload.image_url})` } : undefined}><div>🧸</div><span>🍼</span><i>♡</i><b>{en ? "Pre-loved with care" : "ส่งต่อด้วยความรัก"}</b></div></section>
    <section className="shop-values"><div><BadgeCheck /> <b>{en ? "Checked with care" : "ตรวจสอบสภาพก่อนลงขาย"}</b></div><div><ShieldCheck /> <b>{en ? "Secure Stripe checkout" : "ชำระเงินปลอดภัยผ่าน Stripe"}</b></div><div><Recycle /> <b>{en ? "Give good things a new life" : "ส่งต่อของดี ลดของเหลือทิ้ง"}</b></div></section>
    {!configured && <div className="shop-setup-note">{en ? "The store preview is ready. Connect Supabase to publish products." : "หน้าร้านพร้อมแล้ว เชื่อมต่อ Supabase เพื่อเริ่มเผยแพร่สินค้า"}</div>}
    <div id="catalog"><ShopCatalog products={products} categories={categories} locale={locale} /></div><Footer locale={locale} />
  </main>;
}
