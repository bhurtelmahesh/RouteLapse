import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/seo-pages";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-04");
  return [
    {
      url: "https://routelapse.web.app/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://routelapse.web.app/guide",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...seoPages.map(({ slug }) => ({
      url: `https://routelapse.web.app/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];
}
