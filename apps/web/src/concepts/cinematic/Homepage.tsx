import { AboutSection } from "@/components/sections/about-section";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CounterSection } from "@/components/sections/counter-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { WorkSection } from "@/components/sections/work-section";
import type { HomepageProps, PortfolioItem } from "../types";

export function Homepage({
  settings,
  portfolios,
  courses,
  products,
}: HomepageProps) {
  const workPortfolios = portfolios as Array<
    PortfolioItem & { featuredOrder: number }
  >;
  return (
    <>
      <HeroBanner settings={settings} />
      <PromotionBanner />
      <WorkSection settings={settings} portfolios={workPortfolios} />
      <ProductSection
        settings={settings}
        courses={courses}
        products={products}
      />
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
