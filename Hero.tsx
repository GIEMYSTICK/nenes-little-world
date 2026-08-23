import { ArrowDown } from "lucide-react";
import { NeneAgeBadge } from "@/components/NeneAge";

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-decoration cloud cloud-one" aria-hidden="true" />
      <div className="hero-decoration cloud cloud-two" aria-hidden="true" />
      <span className="sparkle sparkle-one" aria-hidden="true">✦</span>
      <span className="sparkle sparkle-two" aria-hidden="true">✧</span>
      <span className="tiny-heart" aria-hidden="true">♡</span>
      <div className="bubbles" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">A tiny place full of love</p>
        <h1>Nene&apos;s<br /><em>Little World</em></h1>
        <p className="hero-welcome">Welcome to my little world <span>♡</span></p>
        <p className="hero-thai">ยินดีต้อนรับสู่โลกใบเล็ก ๆ ของเนเน่</p>
        <a className="primary-button" href="#milestones">ดูเรื่องราวของเนเน่ <ArrowDown size={18} /></a>
      </div>
      <div className="hero-visual">
        <div className="hero-photo-wrap">
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            poster="/images/nene-wink.jpeg"
            aria-label="วิดีโอแนะนำตัวน้องเนเน่"
          >
            <source src="/videos/nene-introduction.mp4" type="video/mp4" />
            <track kind="captions" src="/captions/nene-th.vtt" srcLang="th" label="คำบรรยายภาษาไทย" />
          </video>
        </div>
        <div className="hero-badge"><NeneAgeBadge /></div>
        <p className="hero-note">สวัสดีค่ะ หนูเนเน่ ☀</p>
        <span className="hero-photo-heart" aria-hidden="true">♡</span>
      </div>
      <div className="hero-bottom-copy">เรื่องราวเล็ก ๆ ของเด็กผู้หญิงตัวน้อย<br />ที่ทำให้โลกของเราสดใสขึ้นทุกวัน</div>
    </section>
  );
}
