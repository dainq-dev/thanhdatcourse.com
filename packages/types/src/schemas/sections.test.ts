import { describe, expect, test } from "bun:test";
import {
  BonusGiftsConfigSchema,
  BrandLogosConfigSchema,
  CountdownOfferConfigSchema,
  CurriculumHighlightsConfigSchema,
  ENTITY_SECTION_MAP,
  FAQAccordionConfigSchema,
  FeaturedStudentsConfigSchema,
  getDefaultConfig,
  HeroBannerConfigSchema,
  InstructorJourneyConfigSchema,
  LessonAccordionConfigSchema,
  PricingCardConfigSchema,
  parseConfig,
  RichTextConfigSchema,
  SalesStoryConfigSchema,
  SectionSchema,
  SectionTypeSchema,
  SINGLETON_SECTION_TYPES,
  TestimonialVideosConfigSchema,
  TrustBadgesConfigSchema,
  validateSectionConfig,
} from "./sections";

// ── Section Type Enum ──
describe("SectionTypeSchema", () => {
  test("valid types pass", () => {
    expect(SectionTypeSchema.parse("hero_banner")).toBe("hero_banner");
    expect(SectionTypeSchema.parse("brand_logos")).toBe("brand_logos");
    expect(SectionTypeSchema.parse("rich_text")).toBe("rich_text");
  });
  test("invalid type fails", () => {
    expect(() => SectionTypeSchema.parse("invalid")).toThrow();
  });
});

// ── Singletons ──
describe("SINGLETON_SECTION_TYPES", () => {
  test("contains 13 types", () => {
    expect(SINGLETON_SECTION_TYPES).toHaveLength(13);
  });
  test("rich_text is NOT singleton", () => {
    expect(SINGLETON_SECTION_TYPES).not.toContain("rich_text");
  });
});

// ── ENTITY_SECTION_MAP ──
describe("ENTITY_SECTION_MAP", () => {
  test("course has all 14 types", () => {
    expect(ENTITY_SECTION_MAP.course).toHaveLength(14);
  });
  test("product and presets_page are empty", () => {
    expect(ENTITY_SECTION_MAP.product).toEqual([]);
    expect(ENTITY_SECTION_MAP.presets_page).toEqual([]);
  });
});

// ── S1: hero_banner ──
describe("HeroBannerConfigSchema", () => {
  test("empty config gets defaults", () => {
    const r = HeroBannerConfigSchema.parse({});
    expect(r.badge_text).toBe("");
    expect(r.subtitle_highlight).toBe("");
  });
  test("full config parses", () => {
    const r = HeroBannerConfigSchema.parse({
      badge_text: "SALE 90%",
      subtitle: "Học quay dựng...",
      subtitle_highlight: "quay dựng",
    });
    expect(r.badge_text).toBe("SALE 90%");
    expect(r.subtitle_highlight).toBe("quay dựng");
  });
});

// ── S2: brand_logos ──
describe("BrandLogosConfigSchema", () => {
  test("defaults have empty logos array", () => {
    const r = BrandLogosConfigSchema.parse({});
    expect(r.logos).toEqual([]);
  });
  test("logos with image_url and alt", () => {
    const r = BrandLogosConfigSchema.parse({
      logos: [{ image_url: "sony.png", alt: "Sony" }],
    });
    expect(r.logos).toHaveLength(1);
    expect(r.logos[0].alt).toBe("Sony");
  });
});

// ── S3: countdown_offer ──
describe("CountdownOfferConfigSchema", () => {
  test("default price 996K", () => {
    const r = CountdownOfferConfigSchema.parse({});
    expect(r.current_price).toBe(996000);
    expect(r.countdown_seconds).toBe(7140);
    expect(r.bonus_count).toBe(5);
  });
  test("price must be positive", () => {
    expect(() =>
      CountdownOfferConfigSchema.parse({ current_price: 0 }),
    ).toThrow();
  });
});

// ── S4: trust_badges ──
describe("TrustBadgesConfigSchema", () => {
  test("default 3 items", () => {
    const r = TrustBadgesConfigSchema.parse({});
    expect(r.items).toHaveLength(3);
    expect(r.items[0].text).toBe("KHÔNG CẦN CÓ KINH NGHIỆM");
  });
  test("custom items override defaults", () => {
    const r = TrustBadgesConfigSchema.parse({
      items: [{ text: "CUSTOM" }],
    });
    expect(r.items).toHaveLength(1);
    expect(r.items[0].text).toBe("CUSTOM");
  });
});

// ── S5: curriculum_highlights ──
describe("CurriculumHighlightsConfigSchema", () => {
  test("items array with description_html", () => {
    const r = CurriculumHighlightsConfigSchema.parse({
      items: [
        {
          number: "#1",
          title: "Chương 1",
          description_html: "<p>Mô tả</p>",
          image_url: "img.png",
        },
      ],
    });
    expect(r.items).toHaveLength(1);
    expect(r.items[0].description_html).toBe("<p>Mô tả</p>");
  });
});

// ── S6: lesson_accordion ──
describe("LessonAccordionConfigSchema", () => {
  test("chapters with string lessons", () => {
    const r = LessonAccordionConfigSchema.parse({
      chapters: [{ title: "Chương 1", lessons: ["Bài 1", "Bài 2"] }],
    });
    expect(r.chapters).toHaveLength(1);
    expect(r.chapters[0].lessons).toEqual(["Bài 1", "Bài 2"]);
  });
});

// ── S7: bonus_gifts ──
describe("BonusGiftsConfigSchema", () => {
  test("bonus with strikethrough_price", () => {
    const r = BonusGiftsConfigSchema.parse({
      items: [{ title: "Quà 1", strikethrough_price: "3.868.000đ" }],
    });
    expect(r.items[0].strikethrough_price).toBe("3.868.000đ");
  });
  test("bonus with title_highlight", () => {
    const r = BonusGiftsConfigSchema.parse({
      items: [
        {
          title: "Cam kết hoàn tiền 100% trong 7 ngày",
          title_highlight: "hoàn tiền 100%",
        },
      ],
    });
    expect(r.items[0].title_highlight).toBe("hoàn tiền 100%");
  });
});

// ── S8: rich_text ──
describe("RichTextConfigSchema", () => {
  test("default background is white", () => {
    const r = RichTextConfigSchema.parse({});
    expect(r.background).toBe("white");
  });
  test("soft background", () => {
    const r = RichTextConfigSchema.parse({ background: "soft" });
    expect(r.background).toBe("soft");
  });
  test("invalid background fails", () => {
    expect(() => RichTextConfigSchema.parse({ background: "red" })).toThrow();
  });
});

// ── S9: testimonial_videos ──
describe("TestimonialVideosConfigSchema", () => {
  test("videos and carousel", () => {
    const r = TestimonialVideosConfigSchema.parse({
      videos: [
        { youtube_url: "https://youtube.com/embed/abc", title: "Video 1" },
      ],
      carousel_images: [{ image_url: "screenshot.png" }],
    });
    expect(r.videos).toHaveLength(1);
    expect(r.carousel_images).toHaveLength(1);
  });
});

// ── S10: featured_students ──
describe("FeaturedStudentsConfigSchema", () => {
  test("student with stats array", () => {
    const r = FeaturedStudentsConfigSchema.parse({
      students: [
        {
          name: "Thợ Rừng",
          avatar_url: "avatar.png",
          stats: [{ label: "Follow Facebook", value: "1M" }],
          description: "Mô tả học viên",
        },
      ],
    });
    expect(r.students[0].stats).toHaveLength(1);
    expect(r.students[0].description).toBe("Mô tả học viên");
  });
  test("carousel_images included", () => {
    const r = FeaturedStudentsConfigSchema.parse({
      carousel_images: [{ image_url: "fb1.png" }],
    });
    expect(r.carousel_images).toHaveLength(1);
  });
});

// ── S11: instructor_journey ──
describe("InstructorJourneyConfigSchema", () => {
  test("journey with stats and brand strip", () => {
    const r = InstructorJourneyConfigSchema.parse({
      stats: [
        { value: "14.8K", label: "Instagram" },
        { value: "110K", label: "YouTube" },
      ],
      brand_strip: [{ image_url: "sony.png", alt: "Sony" }],
    });
    expect(r.stats).toHaveLength(2);
    expect(r.brand_strip).toHaveLength(1);
  });
  test("background default white", () => {
    const r = InstructorJourneyConfigSchema.parse({});
    expect(r.background).toBe("white");
  });
});

// ── S12: sales_story ──
describe("SalesStoryConfigSchema", () => {
  test("story with two images", () => {
    const r = SalesStoryConfigSchema.parse({
      image_left_url: "left.png",
      image_right_url: "right.png",
      content_html: "<p>Story...</p>",
    });
    expect(r.image_left_url).toBe("left.png");
    expect(r.image_right_url).toBe("right.png");
  });
});

// ── S13: pricing_card ──
describe("PricingCardConfigSchema", () => {
  test("features with bold", () => {
    const r = PricingCardConfigSchema.parse({
      features: [
        { text: "40+ bài giảng", bold: true },
        { text: "Hỗ trợ 1 năm", bold: false },
      ],
    });
    expect(r.features[0].bold).toBe(true);
    expect(r.features[1].bold).toBe(false);
  });
});

// ── S14: faq_accordion ──
describe("FAQAccordionConfigSchema", () => {
  test("faq items with answer_html", () => {
    const r = FAQAccordionConfigSchema.parse({
      items: [
        {
          question: "Cách mua khóa học?",
          answer_html: "<p>Nhấn nút mua...</p>",
        },
      ],
    });
    expect(r.items[0].answer_html).toBe("<p>Nhấn nút mua...</p>");
  });
});

// ── getDefaultConfig ──
describe("getDefaultConfig", () => {
  test("returns parsed defaults for each type", () => {
    const hero = getDefaultConfig("hero_banner");
    expect(hero.badge_text).toBe("");
    expect(hero.subtitle_highlight).toBe("");

    const trust = getDefaultConfig("trust_badges");
    expect(trust.items).toHaveLength(3);

    const countdown = getDefaultConfig("countdown_offer");
    expect(countdown.current_price).toBe(996000);
  });
});

// ── SectionSchema (full row) ──
describe("SectionSchema", () => {
  test("valid full section passes", () => {
    const r = SectionSchema.parse({
      id: "sec-1",
      entity_type: "course",
      entity_id: "course-1",
      section_type: "hero_banner",
      config: JSON.stringify({ badge_text: "SALE" }),
      sort_order: 0,
      is_published: 1,
    });
    expect(r.section_type).toBe("hero_banner");
  });
});

// ── parseConfig ──
describe("parseConfig", () => {
  test("JSON string", () => {
    expect(parseConfig('{"a":1}')).toEqual({ a: 1 });
  });
  test("object passes through", () => {
    const obj = { x: 1 };
    expect(parseConfig(obj)).toBe(obj);
  });
  test("invalid JSON returns {}", () => {
    expect(parseConfig("bad")).toEqual({});
  });
  test("null returns {}", () => {
    expect(parseConfig(null)).toEqual({});
  });
  test("undefined returns {}", () => {
    expect(parseConfig(undefined)).toEqual({});
  });
});

// ── validateSectionConfig ──
describe("validateSectionConfig", () => {
  test("valid config passes", () => {
    const r = validateSectionConfig("hero_banner", {
      badge_text: "Test",
    });
    expect(r.badge_text).toBe("Test");
  });
  test("JSON string config is parsed", () => {
    const r = validateSectionConfig(
      "hero_banner",
      JSON.stringify({ badge_text: "Parsed" }),
    );
    expect(r.badge_text).toBe("Parsed");
  });
  test("unknown section type throws", () => {
    expect(() => validateSectionConfig("invalid_type" as any, {})).toThrow();
  });
});
