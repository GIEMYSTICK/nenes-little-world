"use client";

import { FormEvent, useState } from "react";
import { Heart, Mail, Send } from "lucide-react";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json() as { message?: string };

      if (!response.ok) throw new Error(result.message || "ส่งข้อความไม่สำเร็จ");

      form.reset();
      setState("success");
      setMessage("ส่งข้อความถึงเนเน่เรียบร้อยแล้ว ขอบคุณที่แวะมาทักทายกันนะคะ ♡");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
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
          <div><b>ฝากข้อความถึงเนเน่</b><span>เราจะส่งอีเมลขอบคุณกลับไปหาคุณอัตโนมัติ</span></div>
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
          <button className="contact-submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "กำลังส่งข้อความ..." : <><Send size={17} /> ส่งข้อความหาเนเน่</>}
          </button>
          <div className={`contact-result ${state}`} role="status" aria-live="polite">{message}</div>
        </form>
      </div>
    </section>
  );
}
