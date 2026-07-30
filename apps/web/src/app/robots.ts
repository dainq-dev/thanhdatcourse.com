import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/quan-tri-vien/", "/xac-thuc/"],
    },
    sitemap: "https://minhtravel.vn/sitemap.xml",
  };
}
