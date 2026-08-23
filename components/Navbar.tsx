"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  ["Home", "home"],
  ["About Nene", "about"],
  ["Milestones", "milestones"],
  ["Gallery", "gallery"],
  ["Memories", "memories"],
  ["Contact", "contact"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled || open ? "navbar--scrolled" : ""}`}>
      <a className="brand" href="#home" aria-label="กลับไปหน้าแรก">
        <span className="brand-logo">
          <Image src="/nene-logo-v2.png" alt="โลโก้ Nene's Little World" fill sizes="48px" priority />
        </span>
        <span>Nene&apos;s <i>little world</i></span>
      </a>
      <nav className="desktop-nav" aria-label="เมนูหลัก">
        {links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="mobile-nav" aria-label="เมนูมือถือ">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
