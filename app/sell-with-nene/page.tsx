import type { Metadata } from "next";
import { ConsignmentPage } from "@/components/ConsignmentPage";
export const metadata: Metadata = {
  title: "ฝากขายของใช้แม่และเด็ก | ฝากขายกับเนเน่",
  description: "รับฝากขายและส่งต่อของใช้แม่และเด็กมือสองสภาพดี เช่น ขวดนม รถเข็นเด็ก คาร์ซีท ของเล่น และของใช้เด็ก ไปยังครอบครัวใหม่อย่างใส่ใจ",
  keywords: ["ฝากขายของใช้แม่และเด็ก", "ฝากขายของใช้เด็ก", "ขายของใช้เด็กมือสอง", "ส่งต่อของใช้เด็ก", "รับฝากขายรถเข็นเด็ก", "ฝากขายกับเนเน่"],
  alternates: { canonical: "/sell-with-nene", languages: { "th-TH": "/sell-with-nene", en: "/en/sell-with-nene" } },
  openGraph: {
    title: "ฝากขายของใช้แม่และเด็ก | ฝากขายกับเนเน่",
    description: "ให้เนเน่ช่วยตรวจสอบและส่งต่อของใช้แม่และเด็กสภาพดีไปยังครอบครัวใหม่",
    url: "/sell-with-nene",
    type: "website",
  },
};
export default function Page() { return <ConsignmentPage locale="th" />; }
