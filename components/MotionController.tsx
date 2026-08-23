"use client";

import { useEffect } from "react";

const selector = [
  ".section-heading",
  ".profile-image",
  ".profile-copy",
  ".timeline-card",
  ".one-month-photo",
  ".one-month-copy",
  ".gallery-item",
  ".video-grid article",
  ".memory-card",
  ".letter-photo",
  ".letter-paper",
  ".comments-intro",
  ".comments-card",
].join(",");

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));

    root.classList.add("motion-ready");
    targets.forEach((target, index) => {
      target.dataset.reveal = "";
      target.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
