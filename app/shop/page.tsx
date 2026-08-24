import type { Metadata } from "next";
import { ShopPage } from "@/components/ShopPage";

export const metadata: Metadata = { title: "ร้านของเนเน่ | Nene's Little World", description: "ของใช้แม่และเด็กที่คัดสรรแล้ว พร้อมบริการฝากขายและส่งต่อของดีอย่างใส่ใจ", alternates: { canonical: "/shop", languages: { "th-TH": "/shop", en: "/en/shop" } } };
export default function Page() { return <ShopPage locale="th" />; }
