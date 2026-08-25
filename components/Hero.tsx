import { ArrowDown, ShoppingBag } from "lucide-react";
import { NeneAgeBadge } from "@/components/NeneAge";
import type { SiteContent } from "@/lib/commerce-types";

export function Hero({
  locale = "th",
  content,
}: {
  locale?: "th" | "en";
  content?: SiteContent | null;
}) {
  const en = locale === "en";
  return (
    <section className="hero" id="home">
      <div className="hero-decoration cloud cloud-one" aria-hidden="true" />
      <div className="hero-decoration cloud cloud-two" aria-hidden="true" />
      <span className="sparkle sparkle-one" aria-hidden="true">
        ✦
      </span>
      <span className="sparkle sparkle-two" aria-hidden="true">
        ✧
      </span>
      <span className="tiny-heart" aria-hidden="true">
        ♡
      </span>
      <div className="bubbles" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">A tiny place full of love</p>
        <h1 className={en ? "" : "hero-title-th"}>
          {en ? (
            <>
              Nene&apos;s
              <br />
              <em>Little World</em>
            </>
          ) : (
            <>
              <span>เนเน่</span>
              <em>ตัวจิ๋ว</em>
            </>
          )}
        </h1>
        <p className="hero-welcome">
          {content?.title ||
            (en
              ? "Welcome to my little world"
              : "ยินดีต้อนรับสู่โลกใบเล็ก ๆ ของเนเน่ ตัวจิ๋ว")}{" "}
          <span>♡</span>
        </p>
        <p className="hero-thai">
          {content?.body ||
            (en
              ? "A little corner filled with smiles, wonder, and love."
              : "ติดตามเรื่องราว พัฒนาการ และการผจญภัยเล็ก ๆ ของเด็กจิ๋วที่ทำให้โลกของเราสดใสขึ้นทุกวัน")}
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#milestones">
            {en ? "Discover Nene’s story" : "ดูเรื่องราวของเนเน่"}{" "}
            <ArrowDown size={18} />
          </a>
          <a className="hero-shop-button" href={en ? "/en/shop" : "/shop"}>
            <ShoppingBag size={18} /> Shop Now
          </a>
        </div>
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
            poster={
              typeof content?.payload?.image_url === "string"
                ? content.payload.image_url
                : "/images/nene-wink.jpeg"
            }
            aria-label={
              en ? "Nene's introduction video" : "วิดีโอแนะนำตัวน้องเนเน่"
            }
          >
            <source src="/videos/nene-introduction.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/captions/nene-th.vtt"
              srcLang="th"
              label="คำบรรยายภาษาไทย"
            />
          </video>
        </div>
        <div className="hero-badge">
          <NeneAgeBadge />
        </div>
        <p className="hero-note">
          {en ? "Hello, I’m Nene ☀" : "สวัสดีค่ะ หนูเนเน่ ☀"}
        </p>
        <span className="hero-photo-heart" aria-hidden="true">
          ♡
        </span>
      </div>
      <div className="hero-bottom-copy">
        {en ? (
          <>
            The little story of a tiny girl
            <br />
            who brightens our world every day.
          </>
        ) : (
          <>
            เรื่องราวเล็ก ๆ ของเด็กผู้หญิงตัวน้อย
            <br />
            ที่ทำให้โลกของเราสดใสขึ้นทุกวัน
          </>
        )}
      </div>
    </section>
  );
}
