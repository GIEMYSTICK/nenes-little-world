"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { photos } from "@/data/nene";

const englishCaptions = ["A tiny wink", "One month of love", "Today’s little smile", "My favourite blue hat", "Warm and cosy", "Wide awake", "Sweet dreams", "A delicious little meal", "Ready for an adventure", "Nene’s Sunday", "Hooray, my little world!"];

export function Gallery({ locale = "th" }: { locale?: "th" | "en" }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((active + 1) % photos.length);
      if (event.key === "ArrowLeft") setActive((active - 1 + photos.length) % photos.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  const previous = () => setActive((current) => current === null ? 0 : (current - 1 + photos.length) % photos.length);
  const next = () => setActive((current) => current === null ? 0 : (current + 1) % photos.length);

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            className={`gallery-item gallery-item--${index % 7}`}
            type="button"
            key={photo.src}
            onClick={() => setActive(index)}
            aria-label={locale === "en" ? `Open photo: ${englishCaptions[index]}` : `เปิดภาพ: ${photo.caption}`}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" />
            <span>{locale === "en" ? englishCaptions[index] : photo.caption}</span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={locale === "en" ? "Large photo viewer" : "ดูรูปภาพขนาดใหญ่"}>
          <button className="lightbox-close" type="button" aria-label="ปิดรูปภาพ" onClick={() => setActive(null)}><X /></button>
          <button className="lightbox-arrow lightbox-arrow--left" type="button" aria-label="รูปก่อนหน้า" onClick={(event) => { event.stopPropagation(); previous(); }}><ChevronLeft /></button>
          <div className="lightbox-content">
            <Image src={photos[active].src} alt={photos[active].alt} fill sizes="95vw" priority />
            <p>{locale === "en" ? englishCaptions[active] : photos[active].caption} <span>{active + 1} / {photos.length}</span></p>
          </div>
          <button className="lightbox-arrow lightbox-arrow--right" type="button" aria-label="รูปถัดไป" onClick={(event) => { event.stopPropagation(); next(); }}><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
