import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://routelapse.web.app/",
      lastModified: new Date("2026-09-27"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
