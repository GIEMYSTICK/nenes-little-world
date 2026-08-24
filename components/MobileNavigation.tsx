"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Heart, Home, Mail, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./MobileNavigation.module.css";

export function MobileNavigation() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const en = pathname.startsWith("/en");
  const home = en ? "/en" : "/";

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 500);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: home, label: en ? "Home" : "หน้าหลัก", icon: Home, active: pathname === home },
    { href: `${home}#milestones`, label: en ? "Story" : "เรื่องราว", icon: Heart, active: false },
    { href: en ? "/en/shop" : "/shop", label: en ? "Shop" : "ร้านค้า", icon: ShoppingBag, active: pathname.includes("/shop") },
    { href: en ? "/en/sell-with-nene" : "/sell-with-nene", label: en ? "Sell" : "ฝากขาย", icon: ShoppingBag, active: pathname.includes("sell-with-nene") },
    { href: `${home}#contact`, label: en ? "Contact" : "ติดต่อ", icon: Mail, active: false },
  ];

  return <>
    <div className={styles.spacer} aria-hidden="true" />
    <nav className={styles.navigation} aria-label={en ? "Mobile navigation" : "เมนูด้านล่างสำหรับมือถือ"}>
      {links.map(({ href, label, icon: Icon, active }) => <Link href={href} className={active ? styles.active : ""} key={label}><Icon /><span>{label}</span></Link>)}
    </nav>
    <button className={`${styles.scrollTop} ${showTop ? styles.scrollTopVisible : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={en ? "Scroll to top" : "กลับขึ้นด้านบน"}><ArrowUp /></button>
  </>;
}
