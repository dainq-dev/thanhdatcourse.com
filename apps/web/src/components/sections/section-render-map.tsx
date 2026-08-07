"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const SECTION_RENDER_MAP: Record<
  string,
  ComponentType<{ config: Record<string, unknown> }>
> = {
  hero_banner: dynamic(() =>
    import("./hero-banner-section").then((m) => m.HeroBannerSection),
  ),
  brand_logos: dynamic(() =>
    import("./brand-logos-section").then((m) => m.BrandLogosSection),
  ),
  countdown_offer: dynamic(() =>
    import("./countdown-offer-section").then((m) => m.CountdownOfferSection),
  ),
  trust_badges: dynamic(() =>
    import("./trust-badges-section").then((m) => m.TrustBadgesSection),
  ),
  curriculum_highlights: dynamic(() =>
    import("./curriculum-highlights-section").then(
      (m) => m.CurriculumHighlightsSection,
    ),
  ),
  lesson_accordion: dynamic(() =>
    import("./lesson-accordion-section").then((m) => m.LessonAccordionSection),
  ),
  bonus_gifts: dynamic(() => import("./bonus-gifts-section")),
  rich_text: dynamic(() => import("./rich-text-section")),
  testimonial_videos: dynamic(() => import("./testimonial-videos-section")),
  featured_students: dynamic(() => import("./featured-students-section")),
  instructor_journey: dynamic(() => import("./instructor-journey-section")),
  sales_story: dynamic(() => import("./sales-story-section")),
  pricing_card: dynamic(() => import("./pricing-card-section")),
  faq_accordion: dynamic(() => import("./faq-accordion-section")),
};
