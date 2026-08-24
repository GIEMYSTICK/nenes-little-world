"use client";

import { FormEvent, useState } from "react";
import { Heart, Mail, Send } from "lucide-react";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm({ locale = "th" }: { locale?: "th" | "en" }) {
  const en = locale === "en";
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || "ข้อความถึงเนเน่");
    const body = String(data.get("message") || "");
    setState("sending"); setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, subject, message: body, website: data.get("website"), locale }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      form.reset(); setState("success");
      setMessage(en ? "Message sent. We’ve also emailed you a little thank-you note ♡" : "ส่งข้อความเรียบร้อยแล้ว พร้อมส่งอีเมลขอบคุณกลับไปให้คุณด้วยค่ะ ♡");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : (en ? "Unable to send right now" : "ไม่สามารถส่งข้อความได้ในขณะนี้"));
    }
  }

  return (
    <section className="comments-section section" id="contact" aria-labelledby="contact-form-title">
      <div className="comments-intro">
        <p className="eyebrow">Send Nene a little note</p>
        <h2 id="contact-form-title">{en ? "Send a message to Nene" : "ส่งข้อความหาเนเน่"} <span>♡</span></h2>
        <p>{en ? "Share a wish, a sweet story, or a heartfelt note. Nene’s family would love to hear from you." : "ฝากคำอวยพร เรื่องราวน่ารัก ๆ หรือข้อความจากใจไว้ให้เนเน่ พวกเรายินดีอ่านข้อความของคุณเสมอ"}</p>
        <div className="comments-login-note"><Heart size={17} /> {en ? "Every message goes directly to Nene’s family" : "ทุกข้อความจะถูกส่งถึงครอบครัวของเนเน่"}</div>
      </div>

      <div className="comments-card contact-card">
        <div className="comments-card-head">
          <div className="comments-icon"><Mail size={22} /></div>
          <div><b>{en ? "A note for Nene" : "ฝากข้อความถึงเนเน่"}</b><span>{en ? "We’ll prepare an email to Nene’s family for you." : "ระบบจะเตรียมอีเมลถึงครอบครัวของเนเน่ให้คุณ"}</span></div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-row">
            <label>{en ? "Your name" : "ชื่อของคุณ"}<input name="name" type="text" autoComplete="name" maxLength={80} required placeholder={en ? "Your name" : "ชื่อผู้ส่ง"} /></label>
            <label>{en ? "Email address" : "อีเมล"}<input name="email" type="email" autoComplete="email" maxLength={160} required placeholder="you@example.com" /></label>
          </div>
          <label>{en ? "Subject" : "หัวข้อ"}<input name="subject" type="text" maxLength={120} required placeholder={en ? "What would you like to tell Nene?" : "อยากบอกอะไรกับเนเน่"} /></label>
          <label>{en ? "Message" : "ข้อความ"}<textarea name="message" rows={6} minLength={5} maxLength={3000} required placeholder={en ? "Write your lovely message to Nene here..." : "เขียนข้อความน่ารัก ๆ ถึงเนเน่ตรงนี้ได้เลย..."} /></label>
          <label className="contact-honeypot" aria-hidden="true">เว็บไซต์<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <label className="contact-consent"><input type="checkbox" required /> <span>{en ? "I agree that this information may be used to reply to my message." : "ฉันยินยอมให้เว็บไซต์ใช้ข้อมูลนี้เพื่อติดต่อกลับเกี่ยวกับข้อความนี้"}</span></label>
          <button className="contact-submit" type="submit" disabled={state === "sending"}>
            <Send size={17} /> {state === "sending" ? (en ? "Sending…" : "กำลังส่ง…") : (en ? "Send message" : "ส่งข้อความหาเนเน่")}
          </button>
          <div className={`contact-result ${state}`} role="status" aria-live="polite">{message}</div>
        </form>
      </div>
    </section>
  );
}
