import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings, parseSetting } from "@/lib/settings";
import { getConcept, type CtaItem } from "@/concepts";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
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

export default async function PortfolioPage() {
  const [portfolios, settings] = await Promise.all([
    getPortfolios(),
    getSiteSettings(),
  ]);

  const ctaItems: CtaItem[] = parseSetting(settings, "portfolio_cta_items", [
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

  const { module } = getConcept(settings.site_concept);
  const PortfolioListView = module.PortfolioList;

  return (
    <PortfolioListView
      settings={settings}
      portfolios={portfolios}
      ctaItems={ctaItems}
    />
  );
}
