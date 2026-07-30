import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CounterSection } from "@/components/sections/counter-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";
import { WorkSection } from "@/components/sections/work-section";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
};

export default async function Homepage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HeroBanner settings={settings} />
      <WorkSection settings={settings} />
      <ProductSection settings={settings} />
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
