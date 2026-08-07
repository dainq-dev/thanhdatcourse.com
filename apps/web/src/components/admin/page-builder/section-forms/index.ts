"use client";

import { type ComponentType, type LazyExoticComponent, lazy } from "react";

export const HeroBannerForm = lazy(() =>
  import("./HeroBannerForm").then((m) => ({ default: m.HeroBannerForm })),
);
export const BrandLogosForm = lazy(() =>
  import("./BrandLogosForm").then((m) => ({ default: m.BrandLogosForm })),
);
export const CountdownOfferForm = lazy(() =>
  import("./CountdownOfferForm").then((m) => ({
    default: m.CountdownOfferForm,
  })),
);
export const TrustBadgesForm = lazy(() =>
  import("./TrustBadgesForm").then((m) => ({ default: m.TrustBadgesForm })),
);
export const CurriculumHighlightsForm = lazy(() =>
  import("./CurriculumHighlightsForm").then((m) => ({
    default: m.CurriculumHighlightsForm,
  })),
);
export const LessonAccordionForm = lazy(() =>
  import("./LessonAccordionForm").then((m) => ({
    default: m.LessonAccordionForm,
  })),
);
export const BonusGiftsForm = lazy(() =>
  import("./BonusGiftsForm").then((m) => ({ default: m.BonusGiftsForm })),
);
export const RichTextForm = lazy(() =>
  import("./RichTextForm").then((m) => ({ default: m.RichTextForm })),
);
export const TestimonialVideosForm = lazy(() =>
  import("./TestimonialVideosForm").then((m) => ({
    default: m.TestimonialVideosForm,
  })),
);
export const FeaturedStudentsForm = lazy(() =>
  import("./FeaturedStudentsForm").then((m) => ({
    default: m.FeaturedStudentsForm,
  })),
);
export const InstructorJourneyForm = lazy(() =>
  import("./InstructorJourneyForm").then((m) => ({
    default: m.InstructorJourneyForm,
  })),
);
export const SalesStoryForm = lazy(() =>
  import("./SalesStoryForm").then((m) => ({ default: m.SalesStoryForm })),
);
export const PricingCardForm = lazy(() =>
  import("./PricingCardForm").then((m) => ({ default: m.PricingCardForm })),
);
export const FAQAccordionForm = lazy(() =>
  import("./FAQAccordionForm").then((m) => ({ default: m.FAQAccordionForm })),
);

export const FORM_MAP: Record<
  string,
  LazyExoticComponent<ComponentType<any>>
> = {
  hero_banner: HeroBannerForm,
  brand_logos: BrandLogosForm,
  countdown_offer: CountdownOfferForm,
  trust_badges: TrustBadgesForm,
  curriculum_highlights: CurriculumHighlightsForm,
  lesson_accordion: LessonAccordionForm,
  bonus_gifts: BonusGiftsForm,
  rich_text: RichTextForm,
  testimonial_videos: TestimonialVideosForm,
  featured_students: FeaturedStudentsForm,
  instructor_journey: InstructorJourneyForm,
  sales_story: SalesStoryForm,
  pricing_card: PricingCardForm,
  faq_accordion: FAQAccordionForm,
};
