import { z } from "zod";

// ── Section Type Enum ──
export const SectionTypeSchema = z.enum([
  "hero_banner",
  "brand_logos",
  "countdown_offer",
  "trust_badges",
  "curriculum_highlights",
  "lesson_accordion",
  "bonus_gifts",
  "rich_text",
  "testimonial_videos",
  "featured_students",
  "instructor_journey",
  "sales_story",
  "pricing_card",
  "faq_accordion",
]);

export type SectionType = z.infer<typeof SectionTypeSchema>;

// ── Singleton Types (only 1 instance per course) ──
export const SINGLETON_SECTION_TYPES: SectionType[] = [
  "hero_banner",
  "brand_logos",
  "countdown_offer",
  "trust_badges",
  "curriculum_highlights",
  "lesson_accordion",
  "bonus_gifts",
  "testimonial_videos",
  "featured_students",
  "instructor_journey",
  "sales_story",
  "pricing_card",
  "faq_accordion",
];

// ── Entity Section Map ──
export const ENTITY_SECTION_MAP: Record<string, SectionType[]> = {
  course: [
    "hero_banner",
    "brand_logos",
    "countdown_offer",
    "trust_badges",
    "curriculum_highlights",
    "lesson_accordion",
    "bonus_gifts",
    "rich_text",
    "testimonial_videos",
    "featured_students",
    "instructor_journey",
    "sales_story",
    "pricing_card",
    "faq_accordion",
  ],
  product: [],
  presets_page: [],
};

// ── Section Labels (Vietnamese) ──
export const SECTION_LABELS: Record<SectionType, string> = {
  hero_banner: "Hero Banner",
  brand_logos: "Thương hiệu hợp tác",
  countdown_offer: "Ưu đãi giới hạn",
  trust_badges: "Badge tin cậy",
  curriculum_highlights: "Điểm nổi bật chương trình",
  lesson_accordion: "Danh sách bài học",
  bonus_gifts: "Quà tặng ưu đãi",
  rich_text: "Nội dung văn bản",
  testimonial_videos: "Video Feedback",
  featured_students: "Học viên nổi bật",
  instructor_journey: "Hành trình giảng viên",
  sales_story: "Câu chuyện bán hàng",
  pricing_card: "Bảng giá",
  faq_accordion: "FAQ",
};

// ── Catalog Groups ──
export interface CatalogGroup {
  label: string;
  types: SectionType[];
}

export const SECTION_CATALOG_GROUPS: CatalogGroup[] = [
  { label: "Hero & Brand", types: ["hero_banner", "brand_logos"] },
  { label: "Ưu đãi & Tin cậy", types: ["countdown_offer", "trust_badges"] },
  {
    label: "Chương trình học",
    types: ["curriculum_highlights", "lesson_accordion"],
  },
  { label: "Quà tặng", types: ["bonus_gifts"] },
  { label: "Nội dung", types: ["rich_text"] },
  {
    label: "Phản hồi học viên",
    types: ["testimonial_videos", "featured_students"],
  },
  { label: "Giảng viên", types: ["instructor_journey"] },
  { label: "Bán hàng", types: ["sales_story", "pricing_card"] },
  { label: "Hỏi đáp", types: ["faq_accordion"] },
];

export const MAX_SECTIONS = 30;

// ── S1: hero_banner ──
export const HeroBannerConfigSchema = z.object({
  badge_text: z.string().default(""),
  badge_subtitle: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  subtitle_highlight: z.string().default(""),
  video_thumbnail_url: z.string().default(""),
  video_youtube_url: z.string().default(""),
  cta_text: z.string().default(""),
  cta_url: z.string().default(""),
  note_text: z.string().default(""),
});
export type HeroBannerConfig = z.infer<typeof HeroBannerConfigSchema>;

// ── S2: brand_logos ──
export const BrandLogosConfigSchema = z.object({
  title: z.string().default(""),
  logos: z
    .array(
      z.object({
        type: z.enum(["image", "text"]).default("image"),
        image_url: z.string().default(""),
        alt: z.string().default(""),
        text: z.string().default(""),
      }),
    )
    .default([]),
  trusted_badge_url: z.string().default(""),
  student_count_title: z.string().default(""),
});
export type BrandLogosConfig = z.infer<typeof BrandLogosConfigSchema>;

// ── S3: countdown_offer ──
export const CountdownOfferConfigSchema = z.object({
  title: z.string().default(""),
  title_highlight: z.string().default(""),
  banner_url: z.string().default(""),
  current_price: z.number().int().positive().default(996000),
  original_price: z.number().int().positive().default(15472000),
  bonus_count: z.number().int().min(0).default(5),
  cta_text: z.string().default(""),
  cta_url: z.string().default(""),
  countdown_seconds: z.number().int().positive().default(7140),
});
export type CountdownOfferConfig = z.infer<typeof CountdownOfferConfigSchema>;

// ── S4: trust_badges ──
export const TrustBadgesConfigSchema = z.object({
  items: z
    .array(
      z.object({
        text: z.string(),
      }),
    )
    .default([
      { text: "KHÔNG CẦN CÓ KINH NGHIỆM" },
      { text: "KHÔNG CẦN CÓ NĂNG KHIẾU" },
      { text: "PHÙ HỢP BẤT CỨ ĐỘ TUỔI NÀO" },
    ]),
});
export type TrustBadgesConfig = z.infer<typeof TrustBadgesConfigSchema>;

// ── S5: curriculum_highlights ──
export const CurriculumHighlightsConfigSchema = z.object({
  section_title: z.string().default(""),
  section_subtitle: z.string().default(""),
  section_subtitle_highlight: z.string().default(""),
  items: z
    .array(
      z.object({
        number: z.string(),
        title: z.string(),
        description_html: z.string().default(""),
        image_url: z.string().default(""),
      }),
    )
    .default([]),
});
export type CurriculumHighlightsConfig = z.infer<
  typeof CurriculumHighlightsConfigSchema
>;

// ── S6: lesson_accordion ──
export const LessonAccordionConfigSchema = z.object({
  section_title: z.string().default(""),
  side_image_url: z.string().default(""),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        lessons: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});
export type LessonAccordionConfig = z.infer<typeof LessonAccordionConfigSchema>;

// ── S7: bonus_gifts ──
export const BonusGiftsConfigSchema = z.object({
  section_title: z.string().default(""),
  items: z
    .array(
      z.object({
        title: z.string(),
        title_highlight: z.string().default(""),
        description_html: z.string().default(""),
        image_url: z.string().default(""),
        strikethrough_price: z.string().optional(),
      }),
    )
    .default([]),
});
export type BonusGiftsConfig = z.infer<typeof BonusGiftsConfigSchema>;

// ── S8: rich_text (multi-instance) ──
export const RichTextConfigSchema = z.object({
  title: z.string().default(""),
  content_html: z.string().default(""),
  background: z.enum(["white", "soft"]).default("white"),
});
export type RichTextConfig = z.infer<typeof RichTextConfigSchema>;

// ── S9: testimonial_videos ──
export const TestimonialVideosConfigSchema = z.object({
  section_title: z.string().default(""),
  videos: z
    .array(
      z.object({
        type: z.enum(["youtube", "media"]).default("youtube"),
        youtube_url: z.string().default(""),
        media_url: z.string().default(""),
        title: z.string(),
      }),
    )
    .default([]),
  carousel_title: z.string().default(""),
  carousel_images: z
    .array(
      z.object({
        image_url: z.string(),
      }),
    )
    .default([]),
});
export type TestimonialVideosConfig = z.infer<
  typeof TestimonialVideosConfigSchema
>;

// ── S10: featured_students ──
export const FeaturedStudentsConfigSchema = z.object({
  section_title: z.string().default(""),
  students: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        avatar_url: z.string(),
        stats: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
            }),
          )
          .default([]),
        description: z.string().default(""),
      }),
    )
    .default([]),
  carousel_title: z.string().default(""),
  carousel_images: z
    .array(
      z.object({
        image_url: z.string(),
      }),
    )
    .default([]),
});
export type FeaturedStudentsConfig = z.infer<
  typeof FeaturedStudentsConfigSchema
>;

// ── S11: instructor_journey ──
export const InstructorJourneyConfigSchema = z.object({
  portrait_url: z.string().default(""),
  title: z.string().default(""),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .default([]),
  story_html: z.string().default(""),
  cta_text: z.string().default(""),
  cta_url: z.string().default(""),
  brand_strip: z
    .array(
      z.object({
        image_url: z.string(),
        alt: z.string().default(""),
      }),
    )
    .default([]),
  background: z.enum(["white", "soft"]).default("white"),
});
export type InstructorJourneyConfig = z.infer<
  typeof InstructorJourneyConfigSchema
>;

// ── S12: sales_story ──
export const SalesStoryConfigSchema = z.object({
  title: z.string().default(""),
  content_html: z.string().default(""),
  image_left_url: z.string().default(""),
  image_right_url: z.string().default(""),
  background: z.enum(["white", "soft"]).default("white"),
});
export type SalesStoryConfig = z.infer<typeof SalesStoryConfigSchema>;

// ── S13: pricing_card ──
export const PricingCardConfigSchema = z.object({
  card_image_url: z.string().default(""),
  title: z.string().default(""),
  price_text: z.string().default(""),
  features: z
    .array(
      z.object({
        text: z.string(),
        bold: z.boolean().default(false),
      }),
    )
    .default([]),
  cta_text: z.string().default(""),
  cta_url: z.string().default(""),
});
export type PricingCardConfig = z.infer<typeof PricingCardConfigSchema>;

// ── S14: faq_accordion ──
export const FAQAccordionConfigSchema = z.object({
  title: z.string().default(""),
  items: z
    .array(
      z.object({
        question: z.string(),
        answer_html: z.string().default(""),
      }),
    )
    .default([]),
});
export type FAQAccordionConfig = z.infer<typeof FAQAccordionConfigSchema>;

// ── Discriminated Union (Section Config) ──
export const SectionConfigSchema = z.discriminatedUnion("section_type", [
  z.object({
    section_type: z.literal("hero_banner"),
    ...HeroBannerConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("brand_logos"),
    ...BrandLogosConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("countdown_offer"),
    ...CountdownOfferConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("trust_badges"),
    ...TrustBadgesConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("curriculum_highlights"),
    ...CurriculumHighlightsConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("lesson_accordion"),
    ...LessonAccordionConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("bonus_gifts"),
    ...BonusGiftsConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("rich_text"),
    ...RichTextConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("testimonial_videos"),
    ...TestimonialVideosConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("featured_students"),
    ...FeaturedStudentsConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("instructor_journey"),
    ...InstructorJourneyConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("sales_story"),
    ...SalesStoryConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("pricing_card"),
    ...PricingCardConfigSchema.shape,
  }),
  z.object({
    section_type: z.literal("faq_accordion"),
    ...FAQAccordionConfigSchema.shape,
  }),
]);

export type SectionConfig = z.infer<typeof SectionConfigSchema>;

// ── Section (full row) ──
export const SectionSchema = z.object({
  id: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  section_type: SectionTypeSchema,
  title: z.string().nullable().optional(),
  config: z.union([z.string(), z.record(z.string(), z.unknown())]),
  sort_order: z.number().int().min(0).default(0),
  is_published: z.union([z.number(), z.boolean()]).default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Section = z.infer<typeof SectionSchema>;

// ── Config Registry (map section_type → Zod schema) ──
const CONFIG_SCHEMA_MAP: Record<SectionType, z.ZodTypeAny> = {
  hero_banner: HeroBannerConfigSchema,
  brand_logos: BrandLogosConfigSchema,
  countdown_offer: CountdownOfferConfigSchema,
  trust_badges: TrustBadgesConfigSchema,
  curriculum_highlights: CurriculumHighlightsConfigSchema,
  lesson_accordion: LessonAccordionConfigSchema,
  bonus_gifts: BonusGiftsConfigSchema,
  rich_text: RichTextConfigSchema,
  testimonial_videos: TestimonialVideosConfigSchema,
  featured_students: FeaturedStudentsConfigSchema,
  instructor_journey: InstructorJourneyConfigSchema,
  sales_story: SalesStoryConfigSchema,
  pricing_card: PricingCardConfigSchema,
  faq_accordion: FAQAccordionConfigSchema,
};

// ── getDefaultConfig ──
export function getDefaultConfig(type: SectionType): Record<string, unknown> {
  const schema = CONFIG_SCHEMA_MAP[type];
  if (!schema) return {};
  return schema.parse({}) as Record<string, unknown>;
}

// ── parseConfig ──
export function parseConfig(
  raw: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && raw !== null) return raw;
  return {};
}

// ── validateSectionConfig ──
export function validateSectionConfig(
  sectionType: SectionType,
  config: unknown,
): Record<string, unknown> {
  const parsed = typeof config === "string" ? parseConfig(config) : config;
  const schema = CONFIG_SCHEMA_MAP[sectionType];
  if (!schema) {
    throw new Error(`Unknown section type: ${sectionType}`);
  }
  return schema.parse(parsed) as Record<string, unknown>;
}
