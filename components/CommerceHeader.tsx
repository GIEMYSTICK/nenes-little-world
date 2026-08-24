import Image from "next/image";
import { Languages, LayoutDashboard, ShoppingBag } from "lucide-react";
import type { Locale } from "@/lib/commerce-types";

export function CommerceHeader({ locale = "th" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <header className="commerce-header">
      <a className="brand" href={en ? "/en" : "/"}>
        <span className="brand-logo"><Image src="/nene-logo-v2.png" alt="Nene's Little World" fill sizes="48px" priority /></span>
        <span>Nene&apos;s <i>little world</i></span>
      </a>
      <nav aria-label={en ? "Shop navigation" : "เมนูร้านค้า"}>
        <a href={en ? "/en" : "/"}>{en ? "Memories" : "ความทรงจำ"}</a>
        <a href={en ? "/en/shop" : "/shop"}><ShoppingBag size={16} /> {en ? "Shop" : "ร้านค้า"}</a>
        <a href={en ? "/en/sell-with-nene" : "/sell-with-nene"}>{en ? "Sell with Nene" : "ฝากขายกับเนเน่"}</a>
        <a className="commerce-language" href={en ? "/shop" : "/en/shop"}><Languages size={15} /> {en ? "ไทย" : "EN"}</a>
      </nav>
      <a className="admin-shortcut" href="/admin" aria-label="Admin"><LayoutDashboard size={18} /></a>
    </header>
  );
}
