import type { Metadata, Viewport } from "next";
import { Mali, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { MobileNavigation } from "@/components/MobileNavigation";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
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
  title: "Nene's Little World | บันทึกความทรงจำของเนเน่",
  description: "เรื่องราวเล็ก ๆ ของเด็กผู้หญิงตัวน้อย ที่ทำให้โลกของเราสดใสขึ้นทุกวัน",
  keywords: ["Nene", "เนเน่", "Baby Memory", "Baby Diary", "Family Memories"],
  alternates: { canonical: "/", languages: { "th-TH": "/", en: "/en" } },
  openGraph: {
    title: "Nene's Little World",
    description: "ยินดีต้อนรับสู่โลกใบเล็ก ๆ ของเนเน่",
    images: [{ url: "/images/nene-card.png", width: 1122, height: 1402, alt: "Nene's Little World" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Nene's Little World", description: "ยินดีต้อนรับสู่โลกใบเล็ก ๆ ของเนเน่", images: ["/images/nene-card.png"] },
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
        <GoogleAnalytics />
      </body>
    </html>
  );
}
