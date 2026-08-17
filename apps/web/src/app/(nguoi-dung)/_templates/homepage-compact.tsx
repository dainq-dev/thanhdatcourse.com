import { AboutSection } from "@/components/sections/about-section";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CounterSection } from "@/components/sections/counter-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";

import type { HomepagePortfolioItem, HomepageCourseItem, HomepageProductItem } from "./homepage-default";

interface Props {
  settings: Record<string, string>;
  portfolios: HomepagePortfolioItem[];
  courses: HomepageCourseItem[];
  products: HomepageProductItem[];
}

export function HomepageCompact({ settings, courses, products }: Props) {
  return (
    <>
      <HeroBanner settings={settings} />
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
