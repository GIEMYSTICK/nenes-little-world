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

  try {
    const body = await request.json();
    const en = body.locale === "en";
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: en ? "Too many messages. Please wait a moment and try again." : "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" }, { status: 429 });
    }
    const name = clean(body.name, 80);
    const email = clean(body.email, 160).toLowerCase();
    const subject = clean(body.subject, 120);
    const message = clean(body.message, 3000);
    const website = clean(body.website, 200);

    if (website) return NextResponse.json({ ok: true });
    if (!name || !emailPattern.test(email) || !subject || message.length < 5) {
      return NextResponse.json({ message: en ? "Please complete your name, email, subject, and message." : "กรุณากรอกชื่อ อีเมล หัวข้อ และข้อความให้ครบถ้วน" }, { status: 400 });
    }

    const mail = createMailTransport();
    const recipient = process.env.CONTACT_TO_EMAIL || SITE_CONTACT_EMAIL;
    if (!mail) {
      return NextResponse.json({ message: en ? "Email is temporarily unavailable. Please use the address in the website footer." : "ระบบอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อผ่านอีเมลในส่วนท้ายเว็บไซต์" }, { status: 503 });
    }

    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const brand = "Nene's Little World";
    const submittedAt = new Intl.DateTimeFormat("th-TH", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    }).format(new Date());
    const safeSubmittedAt = escapeHtml(submittedAt);
    const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`ตอบกลับ: ${subject}`)}`;

    await mail.transporter.sendMail({
      from: `"Nene Website Contact" <${mail.user}>`,
      to: recipient,
      replyTo: email,
      subject: `[Contact Form] ${subject} — ${name}`,
      text: `มีข้อความใหม่จากแบบฟอร์มติดต่อเว็บไซต์\n\nชื่อ: ${name}\nอีเมล: ${email}\nหัวข้อ: ${subject}\nส่งเมื่อ: ${submittedAt}\n\nข้อความ:\n${message}\n\nกด Reply เพื่อตอบกลับไปยัง ${email}`,
      html: `<div style="display:none;max-height:0;overflow:hidden">ข้อความใหม่จาก ${safeName}: ${safeSubject}</div><div style="margin:0;background:#f4f8fb;padding:24px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#21395d"><div style="max-width:640px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;border:1px solid #dce9f3"><div style="padding:28px 30px;background:#21395d;color:#fff"><p style="margin:0 0 7px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#b9d7e9">Nene's Little World · Contact Form</p><h1 style="margin:0;font-size:25px;line-height:1.35">มีข้อความใหม่จากเว็บไซต์</h1></div><div style="padding:28px 30px"><table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px"><tr><td style="padding:8px 0;color:#718198;width:100px">ชื่อผู้ติดต่อ</td><td style="padding:8px 0;font-weight:700">${safeName}</td></tr><tr><td style="padding:8px 0;color:#718198">อีเมล</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}" style="color:#39789e">${escapeHtml(email)}</a></td></tr><tr><td style="padding:8px 0;color:#718198">หัวข้อ</td><td style="padding:8px 0;font-weight:700">${safeSubject}</td></tr><tr><td style="padding:8px 0;color:#718198">ส่งเมื่อ</td><td style="padding:8px 0">${safeSubmittedAt} น.</td></tr></table><div style="margin:22px 0;padding:20px 22px;background:#f7fafc;border-left:4px solid #7db4d2;border-radius:8px;line-height:1.8;color:#344b68">${safeMessage}</div><a href="${replyHref}" style="display:inline-block;background:#21395d;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700">ตอบกลับผู้ติดต่อ</a><p style="margin:22px 0 0;color:#8291a2;font-size:12px;line-height:1.6">อีเมลนี้ส่งอัตโนมัติจากแบบฟอร์มติดต่อ การกด Reply จะส่งคำตอบไปยังผู้ติดต่อโดยตรง กรุณาตรวจสอบข้อความก่อนตอบและอย่าส่งข้อมูลสำคัญที่ไม่จำเป็น</p></div></div></div>`,
    });

    try {
      await mail.transporter.sendMail({
        from: `"${brand}" <${mail.user}>`,
        to: email,
        replyTo: recipient,
        subject: en ? `We received your message: ${subject}` : `เราได้รับข้อความของคุณแล้ว: ${subject}`,
        text: en
          ? `Hello ${name},\n\nThis is an automatic confirmation that Nene's family received your message about “${subject}”. We normally reply within 1–3 business days when a response is needed.\n\nA copy of your message:\n${message}\n\nIf you did not submit this form, you can ignore this email. Please do not send passwords or sensitive information by email.\n\nNene's family\n${recipient}`
          : `สวัสดีคุณ ${name}\n\nอีเมลฉบับนี้เป็นการยืนยันอัตโนมัติว่า ครอบครัวของเนเน่ได้รับข้อความเรื่อง “${subject}” แล้ว หากข้อความจำเป็นต้องตอบกลับ โดยปกติเราจะติดต่อกลับภายใน 1–3 วันทำการ\n\nสำเนาข้อความของคุณ:\n${message}\n\nหากคุณไม่ได้ส่งแบบฟอร์มนี้ สามารถละเว้นอีเมลฉบับนี้ได้ และโปรดอย่าส่งรหัสผ่านหรือข้อมูลสำคัญทางอีเมล\n\nครอบครัวของเนเน่\n${recipient}`,
        html: `<div style="display:none;max-height:0;overflow:hidden">${en ? "We received your message and will reply if needed." : "เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับหากจำเป็น"}</div><div style="margin:0;background:#f4f8fb;padding:24px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#21395d"><div style="max-width:640px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;border:1px solid #dce9f3"><div style="padding:32px 30px;text-align:center;background:linear-gradient(135deg,#e9f7ff,#fff2f4)"><div style="font-size:36px">♡</div><h1 style="margin:8px 0 5px;font-size:26px">${en ? "We received your message" : "เราได้รับข้อความของคุณแล้ว"}</h1><p style="margin:0;color:#6d8097">Nene's Little World</p></div><div style="padding:28px 30px;line-height:1.8"><p>${en ? "Hello" : "สวัสดีคุณ"} ${safeName},</p><p>${en ? `This automatic email confirms that Nene's family received your message about <b>“${safeSubject}”</b>. If a reply is needed, we normally respond within <b>1–3 business days</b>.` : `อีเมลฉบับนี้ยืนยันอัตโนมัติว่า ครอบครัวของเนเน่ได้รับข้อความเรื่อง <b>“${safeSubject}”</b> แล้ว หากจำเป็นต้องตอบกลับ โดยปกติเราจะติดต่อภายใน <b>1–3 วันทำการ</b>`}</p><div style="margin:22px 0;padding:18px 20px;background:#f7fafc;border-radius:12px"><p style="margin:0 0 8px;color:#718198;font-size:12px;font-weight:700;text-transform:uppercase">${en ? "Your message" : "สำเนาข้อความของคุณ"}</p><div style="color:#415873">${safeMessage}</div></div><p>${en ? "Thank you for contacting us." : "ขอบคุณที่ติดต่อเข้ามานะคะ"}</p><p style="margin-top:24px"><b>${en ? "Nene's family" : "ครอบครัวของเนเน่"}</b><br><a href="mailto:${escapeHtml(recipient)}" style="color:#39789e">${escapeHtml(recipient)}</a></p><p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #e4edf3;color:#8291a2;font-size:12px;line-height:1.6">${en ? "This is an automatic confirmation. If you did not submit this form, you can ignore this email. Please do not email passwords or sensitive information." : "นี่คืออีเมลยืนยันอัตโนมัติ หากคุณไม่ได้ส่งแบบฟอร์มนี้ สามารถละเว้นอีเมลได้ และโปรดอย่าส่งรหัสผ่านหรือข้อมูลสำคัญทางอีเมล"}</p></div></div></div>`,
      });
    } catch (error) {
      console.error("Contact auto-reply error", error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form email error", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "ไม่สามารถส่งข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง / Unable to send your message right now." }, { status: 500 });
  }
}
