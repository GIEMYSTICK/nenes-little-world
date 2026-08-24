import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const pages = [
  { th: "", en: "/en", changeFrequency: "weekly" as const, priority: 1 },
  { th: "/shop", en: "/en/shop", changeFrequency: "daily" as const, priority: 0.9 },
  { th: "/sell-with-nene", en: "/en/sell-with-nene", changeFrequency: "monthly" as const, priority: 0.7 },
  { th: "/privacy", en: "/en/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { th: "/data-deletion", en: "/en/data-deletion", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  return pages.flatMap((page) => {
    const languages = { "th-TH": `${siteUrl}${page.th}`, en: `${siteUrl}${page.en}` };
    return [page.th, page.en].map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });
}
