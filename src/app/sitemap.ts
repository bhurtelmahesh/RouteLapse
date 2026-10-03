import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://routelapse.web.app/",
      lastModified: new Date("2026-10-03"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://routelapse.web.app/guide",
      lastModified: new Date("2026-10-03"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
