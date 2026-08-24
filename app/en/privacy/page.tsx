import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Nene's Little World",
  description: "How Nene's Little World collects, uses, and protects website information.",
  alternates: { canonical: "/en/privacy", languages: { "th-TH": "/privacy", en: "/en/privacy" } },
};

export default function EnglishPrivacyPage() {
  return <main className="legal-page"><article>
    <p className="eyebrow">Nene&apos;s Little World</p>
    <h1>Privacy Policy</h1>
    <p>This family memory website also provides contact, consignment, and shop services. We collect only the information needed to provide these services and handle it with care.</p>
    <h2>Information we may receive</h2>
    <p>The contact form may send your name, email, subject, and message. Consignment requests may include contact details, item information, expected price, and image links. When you buy an item, Stripe may provide the order details needed to fulfil it, including contact, delivery, payment status, and transaction references.</p>
    <h2>How information is used</h2>
    <p>We use information to reply to messages, review consignments, process and deliver orders, prevent misuse, and operate the private admin area. We do not sell personal information.</p>
    <h2>Service providers</h2>
    <p>The website uses Vercel for hosting, Supabase for database, authentication, and uploaded media, Stripe for payments, Gmail SMTP for email, and a visitor-counter service. Their own privacy terms may apply when they process data.</p>
    <h2>Visitor counter</h2>
    <p>Your browser stores a small Local Storage flag to reduce duplicate counting. It is not used to create a visitor account or store a password.</p>
    <h2>Retention and your choices</h2>
    <p>We retain information only as needed for communication, transactions, legal obligations, and security. You may request access, correction, or deletion using the address below.</p>
    <h2>Contact</h2>
    <p>Email privacy requests to <a href="mailto:jiminun1@gmail.com">jiminun1@gmail.com</a>.</p>
    <p><small>Last updated: 25 August 2026</small></p>
    <Link href="/en">← Back to home</Link>
  </article></main>;
}
