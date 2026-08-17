import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

export const metadata: Metadata = {
  title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
  description:
    "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel. Khóa học từ cơ bản đến nâng cao, presets & LUTs độc quyền.",
  openGraph: {
    title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
    description: "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel.",
    type: "website",
    locale: "vi_VN",
  },
};

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome: number;
  featuredOrder: number;
}

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  thumbnailUrl?: string;
}

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  tag?: string;
  isFeaturedOnHome: number;
}

async function fetchFeaturedPortfolios(): Promise<PortfolioItem[]> {
  try {
    const res = await api.fetch("/api/portfolios?featured=true", {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    return (json.data ?? json) as PortfolioItem[];
  } catch {
    return [];
  }
}

async function fetchFeaturedCourses(): Promise<CourseItem[]> {
  try {
    const res = await api.fetch("/api/courses?featured=true&published=true", {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return (json.data ?? json) as CourseItem[];
  } catch {
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<ProductItem[]> {
  try {
    const res = await api.fetch("/api/products?published=true", {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    const items: ProductItem[] = json.data ?? json;
    return items.filter((p) => p.isFeaturedOnHome === 1);
  } catch {
    return [];
  }
}

export default async function Homepage() {
  const [settings, portfolios, courses, products] = await Promise.all([
    getSiteSettings(),
    fetchFeaturedPortfolios(),
    fetchFeaturedCourses(),
    fetchFeaturedProducts(),
  ]);

  const { module } = getConcept(settings.site_concept);
  const HomepageView = module.Homepage;

  return (
    <HomepageView
      settings={settings}
      portfolios={portfolios}
      courses={courses}
      products={products}
    />
  );
}
