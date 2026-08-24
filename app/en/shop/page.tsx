import type { Metadata } from "next";
import { ShopPage } from "@/components/ShopPage";

export const metadata: Metadata = { title: "Nene's Little Shop | Baby & Parent Essentials", description: "Thoughtfully selected and pre-loved essentials for babies and parents.", alternates: { canonical: "/en/shop", languages: { "th-TH": "/shop", en: "/en/shop" } } };
export default function Page() { return <ShopPage locale="en" />; }
