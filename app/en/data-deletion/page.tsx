import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion | Nene's Little World",
  description: "How to request deletion of information submitted to Nene's Little World.",
  alternates: { canonical: "/en/data-deletion", languages: { "th-TH": "/data-deletion", en: "/en/data-deletion" } },
};

export default function EnglishDataDeletionPage() {
  return <main className="legal-page"><article>
    <p className="eyebrow">Nene&apos;s Little World</p>
    <h1>Data Deletion Request</h1>
    <p>You may request deletion of information submitted through the contact form, a consignment request, or customer information associated with an order. Please email us from the same address used for the submission.</p>
    <h2>What to include</h2>
    <p>Include your name, email, request type, and consignment reference or order number when available. Never send a password, full card number, or other secret by email.</p>
    <h2>How the request is handled</h2>
    <p>Send your request to <a href="mailto:jiminun1@gmail.com?subject=Nene%20website%20data%20deletion%20request">jiminun1@gmail.com</a>. Nene&apos;s family will verify the request and reply. Some records may need to be retained for legal, accounting, or fraud-prevention purposes.</p>
    <h2>Browser data</h2>
    <p>You can clear Local Storage through your browser&apos;s Privacy or Site Data settings to remove the visitor-counter flag stored on your device.</p>
    <Link href="/en">← Back to home</Link>
  </article></main>;
}
