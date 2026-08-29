"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { photos } from "@/data/nene";

type GalleryItem = { url?: unknown; src?: unknown; alt_th?: unknown; alt_en?: unknown; caption_th?: unknown; caption_en?: unknown };

export function Gallery({ locale = "th", items }: { locale?: "th" | "en"; items?: unknown[] }) {
  const [active, setActive] = useState<number | null>(null);
  const managedPhotos = (items || []).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const photo = item as GalleryItem;
    const src = typeof photo.url === "string" ? photo.url : typeof photo.src === "string" ? photo.src : "";
    if (!src) return [];
    return [{ src, alt: String(locale === "en" ? photo.alt_en || photo.alt_th || "Nene gallery photo" : photo.alt_th || photo.alt_en || "ภาพความทรงจำของเนเน่"), caption: String(locale === "en" ? photo.caption_en || photo.caption_th || "Little moment" : photo.caption_th || photo.caption_en || "ช่วงเวลาเล็ก ๆ") }];
  });
  const visiblePhotos = managedPhotos.length ? managedPhotos : photos.map((photo) => ({ ...photo, caption: locale === "en" ? photo.captionEn : photo.caption }));

  useEffect(() => {
    if (active === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((active + 1) % visiblePhotos.length);
      if (event.key === "ArrowLeft") setActive((active - 1 + visiblePhotos.length) % visiblePhotos.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, visiblePhotos.length]);

  const previous = () => setActive((current) => current === null ? 0 : (current - 1 + visiblePhotos.length) % visiblePhotos.length);
  const next = () => setActive((current) => current === null ? 0 : (current + 1) % visiblePhotos.length);

  return (
    <>
      <div className="gallery-grid">
        {visiblePhotos.map((photo, index) => (
          <button
            className={`gallery-item gallery-item--${index % 7}`}
            type="button"
            key={photo.src}
            onClick={() => setActive(index)}
            aria-label={locale === "en" ? `Open photo: ${photo.caption}` : `เปิดภาพ: ${photo.caption}`}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" unoptimized={photo.src.startsWith("http")} />
            <span>{photo.caption}</span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={locale === "en" ? "Large photo viewer" : "ดูรูปภาพขนาดใหญ่"}>
          <button className="lightbox-close" type="button" aria-label="ปิดรูปภาพ" onClick={() => setActive(null)}><X /></button>
          <button className="lightbox-arrow lightbox-arrow--left" type="button" aria-label="รูปก่อนหน้า" onClick={(event) => { event.stopPropagation(); previous(); }}><ChevronLeft /></button>
          <div className="lightbox-content">
            <Image src={visiblePhotos[active].src} alt={visiblePhotos[active].alt} fill sizes="95vw" priority unoptimized={visiblePhotos[active].src.startsWith("http")} />
            <p>{visiblePhotos[active].caption} <span>{active + 1} / {visiblePhotos.length}</span></p>
          </div>
          <button className="lightbox-arrow lightbox-arrow--right" type="button" aria-label="รูปถัดไป" onClick={(event) => { event.stopPropagation(); next(); }}><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
