import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicSupabase } from "@/lib/supabase";
import { createMailTransport, escapeHtml, SITE_CONTACT_EMAIL } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  seller_name: z.string().trim().min(2).max(100), seller_email: z.string().email().max(160), seller_phone: z.string().trim().min(8).max(30),
  category_id: z.string().uuid().nullable().optional(), item_name: z.string().trim().min(2).max(160), brand: z.string().trim().max(100).optional(),
  condition: z.enum(["new", "like_new", "good", "fair"]), description: z.string().trim().min(10).max(3000), expected_price: z.number().min(0).max(1000000).nullable().optional(),
  image_urls: z.array(z.string().url()).max(6).default([]), locale: z.enum(["th", "en"]).default("th"), website: z.string().max(200).optional(),
});

const attempts = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 15 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    const requestedLocale = body && typeof body === "object" && body.locale === "en" ? "en" : "th";
    const en = requestedLocale === "en";
    if (!parsed.success) return NextResponse.json({ message: en ? "Please check that all required information is complete." : "กรุณาตรวจสอบข้อมูลให้ครบถ้วน" }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) return NextResponse.json({ message: en ? "Too many submissions. Please wait a moment and try again." : "ส่งข้อมูลบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" }, { status: 429 });
    const { locale } = parsed.data;
    const submission = {
      seller_name: parsed.data.seller_name, seller_email: parsed.data.seller_email, seller_phone: parsed.data.seller_phone,
      category_id: parsed.data.category_id, item_name: parsed.data.item_name, brand: parsed.data.brand,
      condition: parsed.data.condition, description: parsed.data.description, expected_price: parsed.data.expected_price,
      image_urls: parsed.data.image_urls,
    };
    const supabase = createPublicSupabase();
    if (!supabase) return NextResponse.json({ message: en ? "The consignment service is not configured yet." : "ระบบฝากขายยังตั้งค่าไม่ครบ" }, { status: 503 });
    const { data, error } = await supabase.from("consignment_submissions").insert(submission).select("reference_number").single();
    if (error) throw error;

    const mail = createMailTransport();
    if (mail) {
      await mail.transporter.sendMail({
        from: `"Nene's Little World" <${mail.user}>`, to: process.env.CONTACT_TO_EMAIL || SITE_CONTACT_EMAIL, replyTo: submission.seller_email,
        subject: `[ฝากขาย ${data.reference_number}] ${submission.item_name}`,
        html: `<div style="font-family:Arial,sans-serif;color:#21395d"><h2>มีรายการฝากขายใหม่ ♡</h2><p><b>เลขอ้างอิง:</b> ${data.reference_number}</p><p><b>ผู้ฝาก:</b> ${escapeHtml(submission.seller_name)}</p><p><b>โทร:</b> ${escapeHtml(submission.seller_phone)}</p><p><b>สินค้า:</b> ${escapeHtml(submission.item_name)}</p><p>${escapeHtml(submission.description)}</p></div>`,
      });
      await mail.transporter.sendMail({
        from: `"Nene's Little World" <${mail.user}>`, to: submission.seller_email,
        subject: locale === "en" ? `We received your item (${data.reference_number})` : `ได้รับข้อมูลฝากขายแล้ว (${data.reference_number})`,
        html: `<div style="font-family:Arial,sans-serif;color:#21395d"><h2>${locale === "en" ? "Thank you for reaching out" : "ขอบคุณที่สนใจฝากขายกับเนเน่"} ♡</h2><p>${locale === "en" ? "Our family will review the item and contact you soon." : "ครอบครัวของเนเน่จะตรวจสอบรายละเอียดและติดต่อกลับโดยเร็วค่ะ"}</p><p><b>${data.reference_number}</b></p></div>`,
      });
    }
    return NextResponse.json({ ok: true, reference: data.reference_number });
  } catch (error) {
    console.error("Consignment error", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
