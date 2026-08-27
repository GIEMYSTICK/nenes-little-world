/* eslint-disable @next/next/no-img-element -- product media is uploaded to the configured Supabase project */
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PackageCheck, ShieldCheck } from "lucide-react";
import { BuyButton } from "@/components/BuyButton";
import { CommerceHeader } from "@/components/CommerceHeader";
import { Footer } from "@/components/Footer";
import type { Locale, Product } from "@/lib/commerce-types";

const conditions = {
  th: { new: "สินค้าใหม่", like_new: "เหมือนใหม่", good: "สภาพดี", fair: "ผ่านการใช้งาน" },
  en: { new: "New", like_new: "Like new", good: "Good", fair: "Pre-loved" },
};

export function ProductDetail({ product, locale }: { product: Product; locale: Locale }) {
  const en = locale === "en";
  const name = en ? product.name_en : product.name_th;
  const description = en ? product.description_en : product.description_th;
  const images = product.product_images ?? [];
  return <main className="commerce-page">
    <CommerceHeader locale={locale} />
    <section className="product-detail section">
      <Link className="product-back" href={en ? "/en/shop" : "/shop"}><ArrowLeft size={18} /> {en ? "Back to shop" : "กลับหน้าร้าน"}</Link>
      <div className="product-detail-layout">
        <div className="product-detail-gallery">
          {images.length ? images.map((image, index) => <img key={image.id} className={index === 0 ? "primary" : ""} src={image.url} alt={(en ? image.alt_en : image.alt_th) || name} />) : <div className="product-detail-empty">♡</div>}
        </div>
        <article className="product-detail-copy">
          <p className="eyebrow">{en ? "Nene’s little shop" : "ร้านเล็ก ๆ ของเนเน่"}</p>
          <div className="product-meta"><span>{conditions[locale][product.condition]}</span>{product.category && <span>{en ? product.category.name_en : product.category.name_th}</span>}</div>
          <h1>{name}</h1>
          <div className="product-detail-price"><strong>฿{Number(product.price).toLocaleString(en ? "en-US" : "th-TH")}</strong>{product.compare_at_price && <del>฿{Number(product.compare_at_price).toLocaleString()}</del>}</div>
          <p className="product-detail-description">{description || (en ? "Please contact us for more details." : "สอบถามรายละเอียดเพิ่มเติมกับทางร้านได้เลยค่ะ")}</p>
          <dl className="product-detail-facts"><div><dt>{en ? "Availability" : "จำนวนคงเหลือ"}</dt><dd>{product.stock_quantity} {en ? "item(s)" : "ชิ้น"}</dd></div>{product.brand && <div><dt>{en ? "Brand" : "ยี่ห้อ"}</dt><dd>{product.brand}</dd></div>}{product.sku && <div><dt>SKU</dt><dd>{product.sku}</dd></div>}</dl>
          <BuyButton productId={product.id} disabled={product.stock_quantity < 1} locale={locale} />
          <div className="product-detail-assurance"><span><CheckCircle2 /> {en ? "Condition checked" : "ตรวจสอบสภาพแล้ว"}</span><span><PackageCheck /> {en ? "Packed with care" : "แพ็กด้วยความใส่ใจ"}</span><span><ShieldCheck /> {en ? "Secure checkout" : "ชำระเงินปลอดภัย"}</span></div>
        </article>
      </div>
    </section>
    <Footer locale={locale} />
  </main>;
}
