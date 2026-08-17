import { AboutSection } from "@/components/sections/about-section";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CounterSection } from "@/components/sections/counter-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { WorkSection } from "@/components/sections/work-section";

export interface HomepagePortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome: number;
  featuredOrder: number;
}

export interface HomepageCourseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  thumbnailUrl?: string;
}

export interface HomepageProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  tag?: string;
  isFeaturedOnHome: number;
}

interface Props {
  settings: Record<string, string>;
  portfolios: HomepagePortfolioItem[];
  courses: HomepageCourseItem[];
  products: HomepageProductItem[];
}

export function HomepageDefault({ settings, portfolios, courses, products }: Props) {
  return (
    <>
      <HeroBanner settings={settings} />
      <PromotionBanner />
      <WorkSection settings={settings} portfolios={portfolios} />
      <ProductSection settings={settings} courses={courses} products={products} />
      <AnimatedSection>
        <div className="reveal-item">
          <CounterSection settings={settings} />
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="reveal-item">
          <AboutSection settings={settings} />
        </div>
      </AnimatedSection>
    </>
  );
}
