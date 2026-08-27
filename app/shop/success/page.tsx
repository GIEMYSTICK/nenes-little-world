import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
export default function Success() { return <main className="checkout-result"><div><CircleCheckBig /><p className="eyebrow">Payment received</p><h1>ขอบคุณที่อุดหนุน<br />ร้านของเนเน่ ♡</h1><p>เราได้รับคำสั่งซื้อแล้ว รายละเอียดจะถูกส่งไปยังอีเมลที่ใช้ชำระเงิน</p><Link href="/shop">กลับไปหน้าร้าน</Link></div></main>; }
