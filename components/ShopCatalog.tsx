"use client";

import { useMemo, useState } from "react";
import { HeartHandshake, PackageSearch, SlidersHorizontal } from "lucide-react";
import { BuyButton } from "@/components/BuyButton";
import type { Category, Locale, Product } from "@/lib/commerce-types";

const conditionLabels = {
  th: { new: "สินค้าใหม่", like_new: "เหมือนใหม่", good: "สภาพดี", fair: "ผ่านการใช้งาน" },
  en: { new: "New", like_new: "Like new", good: "Good", fair: "Pre-loved" },
};

export function ShopCatalog({ products, categories, locale }: { products: Product[]; categories: Category[]; locale: Locale }) {
  const [category, setCategory] = useState("all");
  const en = locale === "en";
  const visible = useMemo(() => category === "all" ? products : products.filter((product) => product.category?.slug === category), [category, products]);

  return (
    <section className="shop-catalog" aria-labelledby="catalog-title">
      <div className="shop-catalog-head">
        <div><p className="eyebrow">Nene&apos;s curated little shop</p><h2 id="catalog-title">{en ? "Ready for a new little chapter" : "พร้อมส่งต่อให้ครอบครัวใหม่"}</h2></div>
        <label><SlidersHorizontal size={17} /><span className="sr-only">{en ? "Filter category" : "กรองหมวดหมู่"}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{en ? "All categories" : "ทุกหมวดหมู่"}</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.icon} {en ? item.name_en : item.name_th}</option>)}</select></label>
      </div>
      {visible.length === 0 ? (
        <div className="shop-empty"><PackageSearch size={40} /><h3>{en ? "New items are coming soon" : "กำลังเตรียมสินค้าน่ารัก ๆ"}</h3><p>{en ? "Nene’s family is carefully preparing the first collection." : "ครอบครัวเนเน่กำลังคัดสรรสินค้าและตรวจสอบรายละเอียดก่อนนำมาลงขายค่ะ"}</p><a href={en ? "/en/sell-with-nene" : "/sell-with-nene"}><HeartHandshake size={18} /> {en ? "Interested in consigning?" : "สนใจฝากขายกับเนเน่"}</a></div>
      ) : (
        <div className="product-grid">{visible.map((product) => {
          const image = product.product_images?.[0];
          const name = en ? product.name_en : product.name_th;
          const description = en ? product.description_en : product.description_th;
          return <article className="product-card" key={product.id}>
            <div className="product-image" style={image ? { backgroundImage: `url(${JSON.stringify(image.url).slice(1, -1)})` } : undefined}>{!image && <span>♡</span>}{product.featured && <b>{en ? "Nene’s pick" : "เนเน่แนะนำ"}</b>}</div>
            <div className="product-card-body"><div className="product-meta"><span>{conditionLabels[locale][product.condition]}</span><span>{en ? product.category?.name_en : product.category?.name_th}</span></div><h3>{name}</h3><p>{description}</p><div className="product-price"><strong>฿{Number(product.price).toLocaleString(locale === "th" ? "th-TH" : "en-US")}</strong>{product.compare_at_price && <del>฿{Number(product.compare_at_price).toLocaleString()}</del>}<small>{en ? `${product.stock_quantity} left` : `เหลือ ${product.stock_quantity} ชิ้น`}</small></div><BuyButton productId={product.id} disabled={product.stock_quantity < 1} locale={locale} /></div>
          </article>;
        })}</div>
      )}
    </section>
  );
}
