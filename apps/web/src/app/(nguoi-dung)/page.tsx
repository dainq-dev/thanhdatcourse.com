import type { Metadata } from "next";
import { getHomepageEngines, type HomepageTemplateId } from "@/lib/layout-engine";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { HomepageDefault } from "./_templates/homepage-default";
import { HomepageCompact } from "./_templates/homepage-compact";
import { HomepageCinematic } from "./_templates/homepage-cinematic";

export const metadata: Metadata = {
  title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
  description: "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel. Khóa học từ cơ bản đến nâng cao, presets & LUTs độc quyền.",
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
    const res = await api.fetch("/api/portfolios?featured=true", { next: { revalidate: 300 } });
    const json = await res.json();
    return (json.data ?? json) as PortfolioItem[];
  } catch { return []; }
}

async function fetchFeaturedCourses(): Promise<CourseItem[]> {
  try {
    const res = await api.fetch("/api/courses?featured=true&published=true", { next: { revalidate: 60 } });
    const json = await res.json();
    return (json.data ?? json) as CourseItem[];
  } catch { return []; }
}

async function fetchFeaturedProducts(): Promise<ProductItem[]> {
  try {
    const res = await api.fetch("/api/products?published=true", { next: { revalidate: 300 } });
    const json = await res.json();
    const items: ProductItem[] = json.data ?? json;
    return items.filter((p) => p.isFeaturedOnHome === 1);
  } catch { return []; }
}

const HOMEPAGE_TEMPLATES = {
  default: HomepageDefault,
  compact: HomepageCompact,
  cinematic: HomepageCinematic,
} as const;

export default async function Homepage() {
  const [settings, portfolios, courses, products] = await Promise.all([
    getSiteSettings(),
    fetchFeaturedPortfolios(),
    fetchFeaturedCourses(),
    fetchFeaturedProducts(),
  ]);

  const templateId = (settings.homepage_template || "default") as HomepageTemplateId;
  const Template = HOMEPAGE_TEMPLATES[templateId] ?? HomepageDefault;
  void getHomepageEngines(settings);

  return (
    <Template settings={settings} portfolios={portfolios} courses={courses} products={products} />
  );
}
