"use client";

import { useState } from "react";
import { LoaderCircle, QrCode } from "lucide-react";
import type { Locale } from "@/lib/commerce-types";

export function BuyButton({ productId, disabled, locale }: { productId: string; disabled?: boolean; locale: Locale }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const en = locale === "en";

  async function checkout() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1, locale }) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.message || "Checkout failed");
      window.location.href = data.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (en ? "Checkout is unavailable" : "ยังไม่สามารถชำระเงินได้"));
      setLoading(false);
    }
  }

  return <div className="buy-action"><button type="button" onClick={checkout} disabled={disabled || loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <QrCode size={17} />}{disabled ? (en ? "Sold out" : "สินค้าหมด") : loading ? (en ? "Opening…" : "กำลังเปิด…") : (en ? "Card or PromptPay" : "บัตรหรือสแกน PromptPay")}</button>{error && <span role="alert">{error}</span>}</div>;
}
