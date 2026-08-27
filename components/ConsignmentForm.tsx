"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import type { Category, Locale } from "@/lib/commerce-types";

export function ConsignmentForm({
  categories,
  locale,
  configured = true,
}: {
  categories: Category[];
  locale: Locale;
  configured?: boolean;
}) {
  const en = locale === "en";
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setState("sending"); setMessage("");
    const form = event.currentTarget; const data = new FormData(form);
    const urls = String(data.get("image_urls") || "").split(/\n|,/).map((value) => value.trim()).filter(Boolean);
    const payload = {
      seller_name: data.get("seller_name"), seller_email: data.get("seller_email"), seller_phone: data.get("seller_phone"),
      category_id: data.get("category_id") || null, item_name: data.get("item_name"), brand: data.get("brand"), condition: data.get("condition"), description: data.get("description"),
      expected_price: data.get("expected_price") ? Number(data.get("expected_price")) : null, image_urls: urls, locale, website: data.get("website"),
    };
    try {
      const response = await fetch("/api/consignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      form.reset(); setState("success"); setMessage(en ? `Submitted successfully. Reference: ${result.reference}` : `ส่งข้อมูลสำเร็จ เลขอ้างอิง: ${result.reference}`);
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : (en ? "Submission failed" : "ส่งข้อมูลไม่สำเร็จ")); }
  }

  return <form className="consignment-form" onSubmit={submit}>
    <div className="form-section-title"><span>01</span><div><b>{en ? "Your contact details" : "ข้อมูลผู้ฝากขาย"}</b><small>{en ? "So Nene’s family can contact you" : "เพื่อให้ครอบครัวเนเน่ติดต่อกลับ"}</small></div></div>
    <div className="consignment-row"><label>{en ? "Name" : "ชื่อผู้ติดต่อ"}<input name="seller_name" required minLength={2} maxLength={100} /></label><label>{en ? "Phone" : "เบอร์โทรศัพท์"}<input name="seller_phone" required minLength={8} maxLength={30} inputMode="tel" /></label></div>
    <label>{en ? "Email" : "อีเมล"}<input name="seller_email" type="email" required /></label>
    <div className="form-section-title"><span>02</span><div><b>{en ? "Tell us about the item" : "รายละเอียดสินค้า"}</b><small>{en ? "Honest details help us review it faster" : "รายละเอียดตรงไปตรงมาช่วยให้ตรวจสอบได้เร็วขึ้น"}</small></div></div>
    <div className="consignment-row"><label>{en ? "Item name" : "ชื่อสินค้า"}<input name="item_name" required minLength={2} maxLength={160} /></label><label>{en ? "Brand (optional)" : "ยี่ห้อ (ถ้ามี)"}<input name="brand" maxLength={100} /></label></div>
    <div className="consignment-row"><label>{en ? "Category" : "หมวดหมู่"}<select name="category_id"><option value="">{en ? "Select category" : "เลือกหมวดหมู่"}</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.icon} {en ? category.name_en : category.name_th}</option>)}</select></label><label>{en ? "Condition" : "สภาพสินค้า"}<select name="condition" required defaultValue="good"><option value="new">{en ? "New" : "สินค้าใหม่"}</option><option value="like_new">{en ? "Like new" : "เหมือนใหม่"}</option><option value="good">{en ? "Good" : "สภาพดี"}</option><option value="fair">{en ? "Pre-loved" : "ผ่านการใช้งาน"}</option></select></label></div>
    <label>{en ? "Description" : "รายละเอียดและตำหนิ (ถ้ามี)"}<textarea name="description" rows={6} required minLength={10} maxLength={3000} /></label>
    <div className="consignment-row"><label>{en ? "Expected price (THB)" : "ราคาที่ต้องการ (บาท)"}<input name="expected_price" type="number" min="0" step="1" /></label><label>{en ? "Image URLs (optional)" : "ลิงก์รูปภาพ (ถ้ามี)"}<textarea className="compact-textarea" name="image_urls" rows={2} placeholder={en ? "One URL per line" : "หนึ่งลิงก์ต่อหนึ่งบรรทัด"} /></label></div>
    <label className="contact-honeypot">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="consignment-consent"><input type="checkbox" required /> {en ? "I confirm that the information is accurate and I own this item." : "ฉันยืนยันว่าข้อมูลถูกต้องและเป็นเจ้าของสินค้านี้"}</label>
    <button type="submit" disabled={!configured || state === "sending"}>{state === "sending" ? <LoaderCircle className="spin" /> : <Send />} {state === "sending" ? (en ? "Sending…" : "กำลังส่ง…") : (en ? "Submit item" : "ส่งข้อมูลฝากขาย")}</button>
    {message && <div className={`consignment-result ${state}`} role="status">{state === "success" && <CheckCircle2 />} {message}</div>}
  </form>;
}
