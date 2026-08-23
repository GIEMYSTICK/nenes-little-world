"use client";

import { FormEvent, useState } from "react";
import { Heart, Mail, Send } from "lucide-react";

type FormState = "idle" | "success";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || "ข้อความถึงเนเน่");
    const body = String(data.get("message") || "");
    const mailBody = `ชื่อ: ${name}\nอีเมลสำหรับติดต่อกลับ: ${email}\n\n${body}`;

    window.location.href = `mailto:nene.yanitah2026@gmail.com?subject=${encodeURIComponent(`[เว็บไซต์เนเน่] ${subject}`)}&body=${encodeURIComponent(mailBody)}`;
    setState("success");
    setMessage("เปิดแอปอีเมลให้แล้ว กรุณาตรวจข้อความและกดส่งอีกครั้งนะคะ ♡");
  }

  return (
    <section className="comments-section section" id="contact" aria-labelledby="contact-form-title">
      <div className="comments-intro">
        <p className="eyebrow">Send Nene a little note</p>
        <h2 id="contact-form-title">ส่งข้อความหาเนเน่ <span>♡</span></h2>
        <p>ฝากคำอวยพร เรื่องราวน่ารัก ๆ หรือข้อความจากใจไว้ให้เนเน่ พวกเรายินดีอ่านข้อความของคุณเสมอ</p>
        <div className="comments-login-note"><Heart size={17} /> ทุกข้อความจะถูกส่งถึงครอบครัวของเนเน่</div>
      </div>

      <div className="comments-card contact-card">
        <div className="comments-card-head">
          <div className="comments-icon"><Mail size={22} /></div>
          <div><b>ฝากข้อความถึงเนเน่</b><span>ระบบจะเตรียมอีเมลถึงครอบครัวของเนเน่ให้คุณ</span></div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-row">
            <label>ชื่อของคุณ<input name="name" type="text" autoComplete="name" maxLength={80} required placeholder="ชื่อผู้ส่ง" /></label>
            <label>อีเมล<input name="email" type="email" autoComplete="email" maxLength={160} required placeholder="you@example.com" /></label>
          </div>
          <label>หัวข้อ<input name="subject" type="text" maxLength={120} required placeholder="อยากบอกอะไรกับเนเน่" /></label>
          <label>ข้อความ<textarea name="message" rows={6} minLength={5} maxLength={3000} required placeholder="เขียนข้อความน่ารัก ๆ ถึงเนเน่ตรงนี้ได้เลย..." /></label>
          <label className="contact-honeypot" aria-hidden="true">เว็บไซต์<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <label className="contact-consent"><input type="checkbox" required /> <span>ฉันยินยอมให้เว็บไซต์ใช้ข้อมูลนี้เพื่อติดต่อกลับเกี่ยวกับข้อความนี้</span></label>
          <button className="contact-submit" type="submit">
            <Send size={17} /> เปิดอีเมลเพื่อส่งหาเนเน่
          </button>
          <div className={`contact-result ${state}`} role="status" aria-live="polite">{message}</div>
        </form>
      </div>
    </section>
  );
}
