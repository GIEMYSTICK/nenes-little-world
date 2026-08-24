import type { Metadata, Viewport } from "next";
import { Mali, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { MobileNavigation } from "@/components/MobileNavigation";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { getSiteUrl } from "@/lib/site-url";

const noto = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

const mali = Mali({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "เนเน่ ตัวจิ๋ว | Nene's Little World",
  description: "เว็บไซต์ของเนเน่ ตัวจิ๋ว บันทึกเรื่องราว พัฒนาการ และการผจญภัยเล็ก ๆ ของเด็กจิ๋ว พร้อมความทรงจำแสนอบอุ่นของครอบครัว",
  keywords: ["เนเน่ ตัวจิ๋ว", "เนเน่ตัวจิ๋ว", "เนเน่ เด็กจิ๋ว", "เด็กจิ๋ว", "การผจญภัยของเนเน่", "ของใช้แม่และเด็ก", "ของใช้เด็ก", "ร้านของเนเน่", "ฝากขายของใช้แม่และเด็ก", "Nene's Little World"],
  alternates: { canonical: "/", languages: { "th-TH": "/", en: "/en" } },
  openGraph: {
    title: "เนเน่ ตัวจิ๋ว | Nene's Little World",
    description: "ติดตามเรื่องราว พัฒนาการ และการผจญภัยเล็ก ๆ ของเนเน่ ตัวจิ๋ว",
    images: [{ url: "/images/nene-card.png", width: 1122, height: 1402, alt: "เนเน่ ตัวจิ๋ว - Nene's Little World" }],
    type: "website",
    locale: "th_TH",
    siteName: "Nene's Little World",
  },
  twitter: { card: "summary_large_image", title: "เนเน่ ตัวจิ๋ว | Nene's Little World", description: "เรื่องราวและการผจญภัยเล็ก ๆ ของเนเน่ ตัวจิ๋ว", images: ["/images/nene-card.png"] },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/icon.png",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fbff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${noto.variable} ${mali.variable}`}>
        <GoogleTagManager />
        {children}
        <MobileNavigation />
      </body>
    </html>
  );
}
