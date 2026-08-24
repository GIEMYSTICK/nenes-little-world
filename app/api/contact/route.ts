import { NextRequest, NextResponse } from "next/server";
import { createMailTransport, escapeHtml, SITE_CONTACT_EMAIL } from "@/lib/email";

export const runtime = "nodejs";

const attempts = new Map<string, number[]>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 15 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const name = clean(body.name, 80);
    const email = clean(body.email, 160).toLowerCase();
    const subject = clean(body.subject, 120);
    const message = clean(body.message, 3000);
    const website = clean(body.website, 200);

    if (website) return NextResponse.json({ ok: true });
    if (!name || !emailPattern.test(email) || !subject || message.length < 5) {
      return NextResponse.json({ message: "กรุณากรอกชื่อ อีเมล หัวข้อ และข้อความให้ครบถ้วน" }, { status: 400 });
    }

    const mail = createMailTransport();
    const recipient = process.env.CONTACT_TO_EMAIL || SITE_CONTACT_EMAIL;
    if (!mail) {
      return NextResponse.json({ message: "ระบบอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผ่านอีเมลในส่วนท้ายเว็บไซต์" }, { status: 503 });
    }

    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const brand = "Nene's Little World";

    await mail.transporter.sendMail({
      from: `"${brand}" <${mail.user}>`,
      to: recipient,
      replyTo: email,
      subject: `[เว็บไซต์เนเน่] ${subject}`,
      text: `ผู้ส่ง: ${name}\nอีเมล: ${email}\nหัวข้อ: ${subject}\n\n${message}`,
      html: `<div style="font-family:Arial,'Noto Sans Thai',sans-serif;max-width:640px;margin:auto;color:#21395d"><div style="padding:28px;background:#edf7ff;border-radius:24px 24px 0 0"><h1 style="margin:0;font-size:25px">มีข้อความใหม่ถึงเนเน่ ♡</h1></div><div style="padding:28px;border:1px solid #dce9f3;border-top:0;border-radius:0 0 24px 24px"><p><b>จาก:</b> ${safeName}</p><p><b>อีเมล:</b> ${escapeHtml(email)}</p><p><b>หัวข้อ:</b> ${safeSubject}</p><div style="margin-top:22px;padding:20px;background:#fff8ef;border-radius:16px;line-height:1.8">${safeMessage}</div><p style="margin-top:24px;color:#718198;font-size:12px">ตอบกลับอีเมลฉบับนี้เพื่อติดต่อผู้ส่งได้ทันที</p></div></div>`,
    });

    await mail.transporter.sendMail({
      from: `"${brand}" <${mail.user}>`,
      to: email,
      subject: "ขอบคุณที่ส่งข้อความถึงเนเน่ ♡",
      text: `สวัสดีคุณ ${name}\n\nเราได้รับข้อความ “${subject}” เรียบร้อยแล้ว ขอบคุณที่แวะมาฝากความรักและความทรงจำดี ๆ ให้เนเน่นะคะ\n\nด้วยรัก\nครอบครัวของเนเน่`,
      html: `<div style="font-family:Arial,'Noto Sans Thai',sans-serif;max-width:640px;margin:auto;color:#21395d"><div style="padding:34px;text-align:center;background:linear-gradient(135deg,#e9f7ff,#fff2f4);border-radius:26px"><div style="font-size:38px">♡</div><h1 style="margin:8px 0 4px;font-size:27px">ขอบคุณที่ส่งข้อความถึงเนเน่</h1><p style="margin:0;color:#6d8097">Nene's Little World</p></div><div style="padding:30px;line-height:1.9"><p>สวัสดีคุณ ${safeName}</p><p>เราได้รับข้อความเรื่อง <b>“${safeSubject}”</b> เรียบร้อยแล้ว ขอบคุณที่แวะมาฝากความรัก คำอวยพร และความทรงจำดี ๆ ให้เนเน่นะคะ</p><p>ข้อความของคุณมีความหมายกับครอบครัวของเรามาก ♡</p><p style="margin-top:28px"><b>ด้วยรัก</b><br />ครอบครัวของเนเน่</p></div><div style="padding:18px;text-align:center;background:#f7fafc;color:#8291a2;font-size:12px;border-radius:0 0 22px 22px">อีเมลตอบกลับอัตโนมัติจากเว็บไซต์ Nene's Little World</div></div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form email error", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "ไม่สามารถส่งข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
