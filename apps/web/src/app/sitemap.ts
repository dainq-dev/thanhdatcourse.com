import type { MetadataRoute } from "next";
import { api, extractData } from "@/lib/api";

const BASE_URL = "https://minhtravel.vn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/khoa-hoc`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bai-viet`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/san-pham`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/cong-cu`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lien-he`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  let coursePages: MetadataRoute.Sitemap = [];
  let postPages: MetadataRoute.Sitemap = [];

  interface SitemapEntry {
    slug: string;
    publishedAt?: string;
  }

  try {
    const res = await api.fetch("/api/courses?published=true&limit=1000");
    const json = await res.json();
    const items = extractData<SitemapEntry>(json.data ? json : { data: json });
    coursePages = items.map((c) => ({
      url: `${BASE_URL}/khoa-hoc/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  try {
    const res = await api.fetch("/api/posts?published=true&limit=1000");
    const json = await res.json();
    const items = extractData<SitemapEntry>(json.data ? json : { data: json });
    postPages = items.map((p) => ({
      url: `${BASE_URL}/bai-viet/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {}

  return [...staticPages, ...coursePages, ...postPages];
}
