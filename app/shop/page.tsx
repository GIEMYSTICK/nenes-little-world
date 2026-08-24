import type { Metadata } from "next";
import { ShopPage } from "@/components/ShopPage";

export const metadata: Metadata = {
  title: "ของใช้แม่และเด็ก | ร้านของเนเน่ ตัวจิ๋ว",
  description: "เลือกซื้อของใช้แม่และเด็ก ขวดนม ผ้าอ้อม รถเข็นเด็ก คาร์ซีท ของเล่น และของใช้เด็กมือสองสภาพดี ที่ร้านของเนเน่ ตัวจิ๋ว",
  keywords: ["ของใช้แม่และเด็ก", "ของใช้เด็ก", "ของใช้เด็กมือสอง", "ขวดนม", "ผ้าอ้อม", "รถเข็นเด็ก", "คาร์ซีท", "ของเล่นเด็ก", "ร้านของเนเน่", "เนเน่ ตัวจิ๋ว"],
  alternates: { canonical: "/shop", languages: { "th-TH": "/shop", en: "/en/shop" } },
  openGraph: {
    title: "ของใช้แม่และเด็ก | ร้านของเนเน่ ตัวจิ๋ว",
    description: "ของใช้สำหรับแม่และเด็กที่คัดสรรและบอกรายละเอียดสภาพอย่างตรงไปตรงมา",
    url: "/shop",
    type: "website",
  },
};
export default function Page() { return <ShopPage locale="th" />; }
