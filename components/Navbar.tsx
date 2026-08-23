"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Languages, Menu, X } from "lucide-react";

const linksTh = [
  ["หน้าแรก", "home"],
  ["รู้จักเนเน่", "about"],
  ["พัฒนาการ", "milestones"],
  ["แกลเลอรี", "gallery"],
  ["ความทรงจำ", "memories"],
  ["ติดต่อ", "contact"],
];

const linksEn = [["Home", "home"], ["About Nene", "about"], ["Milestones", "milestones"], ["Gallery", "gallery"], ["Memories", "memories"], ["Contact", "contact"]];

export function Navbar({ locale = "th" }: { locale?: "th" | "en" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = locale === "th" ? linksTh : linksEn;
  const languageHref = locale === "th" ? "/en" : "/";
  const languageLabel = locale === "th" ? "EN" : "ไทย";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled || open ? "navbar--scrolled" : ""}`}>
      <a className="brand" href="#home" aria-label={locale === "th" ? "กลับไปหน้าแรก" : "Back to home"}>
        <span className="brand-logo">
          <Image src="/nene-logo-v2.png" alt="โลโก้ Nene's Little World" fill sizes="48px" priority />
        </span>
        <span>Nene&apos;s <i>little world</i></span>
      </a>
      <nav className="desktop-nav" aria-label="เมนูหลัก">
        {links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
        <a className="language-switch" href={languageHref} aria-label={locale === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}><Languages size={15} /> {languageLabel}</a>
      </nav>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? (locale === "th" ? "ปิดเมนู" : "Close menu") : (locale === "th" ? "เปิดเมนู" : "Open menu")}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="mobile-nav" aria-label="เมนูมือถือ">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="language-switch" href={languageHref}><Languages size={17} /> {locale === "th" ? "English" : "ภาษาไทย"}</a>
        </nav>
      )}
    </header>
  );
}
