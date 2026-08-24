import type { Metadata } from "next";
import { ConsignmentPage } from "@/components/ConsignmentPage";
export const metadata: Metadata = { title: "ฝากขายกับเนเน่ | Nene's Little World", description: "ส่งต่อของใช้แม่และเด็กสภาพดี ฝากขายอย่างใส่ใจไปยังครอบครัวใหม่" };
export default function Page() { return <ConsignmentPage locale="th" />; }
