"use client";

import { useEffect, useState } from "react";
import { Eye, Heart } from "lucide-react";

export function VisitorCounter({ locale = "th" }: { locale?: "th" | "en" }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const storageKey = "nene-visitor-counted-v1";
    const countStorageKey = "nene-visitor-count-v1";
    const alreadyCounted = window.localStorage.getItem(storageKey) === "yes";
    const savedCount = Number(window.localStorage.getItem(countStorageKey) || 0);
    fetch("/api/visitors", { method: alreadyCounted ? "GET" : "POST" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { count?: number }) => {
        if (typeof data.count === "number") {
          const latestCount = Math.max(savedCount, data.count);
          setCount(latestCount);
          window.localStorage.setItem(countStorageKey, String(latestCount));
        }
        if (!alreadyCounted) window.localStorage.setItem(storageKey, "yes");
      })
      .catch(() => setCount(null));
  }, []);

  const en = locale === "en";
  return (
    <div className="visitor-counter" aria-live="polite">
      <div className="visitor-counter-icon"><Eye aria-hidden="true" /></div>
      <div className="visitor-counter-copy">
        <span>{en ? "Visitors to Nene’s little world" : "ผู้มาเยือนโลกใบเล็กของเนเน่"}</span>
        <strong>{count === null ? "—" : count.toLocaleString(en ? "en-US" : "th-TH")}</strong>
        <small><Heart size={12} fill="currentColor" aria-hidden="true" /> {en ? "Thank you for stopping by" : "ขอบคุณที่แวะมาหากันนะคะ"}</small>
      </div>
    </div>
  );
}
