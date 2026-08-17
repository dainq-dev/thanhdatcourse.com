import type { Metadata } from "next";
import { getPortfolioEngine, type PortfolioTemplateId } from "@/lib/layout-engine";
import { api } from "@/lib/api";
import { getSiteSettings, parseSetting } from "@/lib/settings";
import { PortfolioDefault } from "./_templates/portfolio-default";
import { PortfolioCategorized } from "./_templates/portfolio-categorized";
import { PortfolioShowcase } from "./_templates/portfolio-showcase";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
}

interface CTAItem {
  text: string;
  href: string;
  target?: string;
  className?: string;
}

async function getPortfolios(): Promise<PortfolioItem[]> {
  try {
    return await api.fetchData<PortfolioItem>("/api/portfolios", {
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Dự án phim tiêu biểu của Minh Travel.",
};

const PORTFOLIO_TEMPLATES = {
  default: PortfolioDefault,
  categorized: PortfolioCategorized,
  showcase: PortfolioShowcase,
} as const;

export default async function PortfolioPage() {
  const [portfolios, settings] = await Promise.all([
    getPortfolios(),
    getSiteSettings(),
  ]);

  const ctaItems: CTAItem[] = parseSetting(settings, "portfolio_cta_items", [
    {
      text: "Liên hệ làm việc",
      href: "https://www.m.me/minhtravel11/",
      target: "_blank",
    },
    {
      text: "Xem nhiều video nữa",
      href: "https://www.youtube.com/@MinhTravel96",
      target: "_blank",
    },
  ]);

  const templateId = (settings.portfolio_template || "default") as PortfolioTemplateId;
  const Template = PORTFOLIO_TEMPLATES[templateId] ?? PortfolioDefault;
  const engine = getPortfolioEngine(settings);

  return (
    <Template settings={settings} portfolios={portfolios} ctaItems={ctaItems} engine={engine} />
  );
}
