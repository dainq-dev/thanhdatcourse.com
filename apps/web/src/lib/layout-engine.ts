export type HomepageTemplateId = "default" | "compact" | "cinematic";
export type CoursesTemplateId = "default" | "minimal" | "full";
export type PortfolioTemplateId = "default" | "categorized" | "showcase";
export type PresetsTemplateId = "default" | "featured";

export type CourseEngineId =
  | "grid"
  | "list"
  | "carousel"
  | "hero-grid"
  | "cards-stagger"
  | "masonry"
  | "compact";
export type PortfolioEngineId =
  | "stacked"
  | "masonry"
  | "timeline"
  | "grid-2col"
  | "filmstrip"
  | "fullwidth";
export type ProductEngineId = "grid" | "masonry" | "single-col";

export interface PageEngines {
  portfolios: PortfolioEngineId;
  products: ProductEngineId;
}

export interface ListEngine {
  list: CourseEngineId | PortfolioEngineId | ProductEngineId;
}

// ── Template metadata (for wizard skeleton) ──

export interface TemplateMeta {
  id: string;
  label: string;
  description: string;
  tone?: "default" | "compact" | "cinematic";
  sections: Array<{
    type: string;
    label: string;
    contentType?: "courses" | "portfolios" | "products";
  }>;
  contentTypes: Array<"courses" | "portfolios" | "products">;
}

export const HOMEPAGE_TEMPLATE_META: Record<HomepageTemplateId, TemplateMeta> =
  {
    default: {
      id: "default",
      label: "Mặc định",
      description: "Đầy đủ sections",
      tone: "default",
      sections: [
        { type: "hero", label: "Banner" },
        { type: "promo", label: "Khuyến mãi" },
        { type: "portfolios", label: "Dự án", contentType: "portfolios" },
        { type: "products", label: "Sản phẩm", contentType: "products" },
        { type: "counter", label: "Số liệu" },
        { type: "about", label: "Giới thiệu" },
      ],
      contentTypes: ["portfolios", "products"],
    },
    compact: {
      id: "compact",
      label: "Tối giản",
      description: "Bỏ Work & PromotionBanner",
      tone: "compact",
      sections: [
        { type: "hero", label: "Banner" },
        { type: "products", label: "Sản phẩm", contentType: "products" },
        { type: "counter", label: "Số liệu" },
        { type: "about", label: "Giới thiệu" },
      ],
      contentTypes: ["products"],
    },
    cinematic: {
      id: "cinematic",
      label: "Điện ảnh",
      description: "Full-screen + carousel",
      tone: "cinematic",
      sections: [
        { type: "hero", label: "Banner (full)" },
        { type: "portfolios", label: "Dự án", contentType: "portfolios" },
        { type: "products", label: "Sản phẩm", contentType: "products" },
        { type: "counter", label: "Số liệu" },
        { type: "about", label: "Giới thiệu" },
      ],
      contentTypes: ["portfolios", "products"],
    },
  };

export const COURSES_TEMPLATE_META: Record<CoursesTemplateId, TemplateMeta> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Hero → Khóa học → Brand → FAQ",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "courses", label: "Khóa học", contentType: "courses" },
      { type: "brand", label: "Thương hiệu" },
      { type: "faq", label: "Hỏi & Đáp" },
    ],
    contentTypes: ["courses"],
  },
  minimal: {
    id: "minimal",
    label: "Tối giản",
    description: "Hero → Khóa học → FAQ",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "courses", label: "Khóa học", contentType: "courses" },
      { type: "faq", label: "Hỏi & Đáp" },
    ],
    contentTypes: ["courses"],
  },
  full: {
    id: "full",
    label: "Đầy đủ",
    description: "Hero → Trust → Khóa học → Brand → FAQ → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "trust", label: "Tin cậy" },
      { type: "courses", label: "Khóa học", contentType: "courses" },
      { type: "brand", label: "Thương hiệu" },
      { type: "faq", label: "Hỏi & Đáp" },
      { type: "cta", label: "Kêu gọi" },
    ],
    contentTypes: ["courses"],
  },
};

export const PORTFOLIO_TEMPLATE_META: Record<
  PortfolioTemplateId,
  TemplateMeta
> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Header → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "portfolios", label: "Dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi" },
    ],
    contentTypes: ["portfolios"],
  },
  categorized: {
    id: "categorized",
    label: "Phân loại",
    description: "Header → Filter → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "category-filter", label: "Bộ lọc" },
      { type: "portfolios", label: "Dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi" },
    ],
    contentTypes: ["portfolios"],
  },
  showcase: {
    id: "showcase",
    label: "Showcase",
    description: "Header → Featured → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "featured-project", label: "Nổi bật", contentType: "portfolios" },
      { type: "portfolios", label: "Dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi" },
    ],
    contentTypes: ["portfolios"],
  },
};

export const PRESETS_TEMPLATE_META: Record<PresetsTemplateId, TemplateMeta> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Hero → Công cụ",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "products", label: "Công cụ", contentType: "products" },
    ],
    contentTypes: ["products"],
  },
  featured: {
    id: "featured",
    label: "Nổi bật",
    description: "Hero → Featured → Grid nhỏ",
    sections: [
      { type: "page-header", label: "Tiêu đề" },
      { type: "products", label: "Công cụ", contentType: "products" },
    ],
    contentTypes: ["products"],
  },
};

// ── Engine metadata ──

export interface EngineMeta {
  id: string;
  label: string;
  preview: string;
}

export const COURSE_ENGINE_META: Record<CourseEngineId, EngineMeta> = {
  grid: { id: "grid", label: "Lưới", preview: "grid" },
  list: { id: "list", label: "Danh sách", preview: "list" },
  carousel: { id: "carousel", label: "Băng chuyền", preview: "carousel" },
  "hero-grid": { id: "hero-grid", label: "Hero + Lưới", preview: "grid" },
  "cards-stagger": {
    id: "cards-stagger",
    label: "Cards động",
    preview: "grid",
  },
  masonry: { id: "masonry", label: "Masonry", preview: "masonry" },
  compact: { id: "compact", label: "Nhỏ gọn", preview: "grid" },
};

export const PORTFOLIO_ENGINE_META: Record<PortfolioEngineId, EngineMeta> = {
  stacked: { id: "stacked", label: "Xen kẽ", preview: "stacked" },
  masonry: { id: "masonry", label: "Masonry", preview: "masonry" },
  timeline: { id: "timeline", label: "Timeline", preview: "timeline" },
  "grid-2col": { id: "grid-2col", label: "Grid 2 cột", preview: "grid" },
  filmstrip: { id: "filmstrip", label: "Film cuộn", preview: "carousel" },
  fullwidth: { id: "fullwidth", label: "Full-width", preview: "fullwidth" },
};

export const PRODUCT_ENGINE_META: Record<ProductEngineId, EngineMeta> = {
  grid: { id: "grid", label: "Lưới", preview: "grid" },
  masonry: { id: "masonry", label: "Masonry", preview: "masonry" },
  "single-col": { id: "single-col", label: "1 cột", preview: "list" },
};

// ── Defaults ──

export const DEFAULT_HOMEPAGE_ENGINES: PageEngines = {
  portfolios: "stacked",
  products: "grid",
};

export function getHomepageEngines(
  settings: Record<string, string>,
): PageEngines {
  return {
    portfolios:
      (settings.homepage_portfolios_engine as PortfolioEngineId) ||
      DEFAULT_HOMEPAGE_ENGINES.portfolios,
    products:
      (settings.homepage_products_engine as ProductEngineId) ||
      DEFAULT_HOMEPAGE_ENGINES.products,
  };
}

export function getCoursesEngine(
  settings: Record<string, string>,
): CourseEngineId {
  return (settings.courses_list_engine as CourseEngineId) || "grid";
}

export function getPortfolioEngine(
  settings: Record<string, string>,
): PortfolioEngineId {
  return (settings.portfolio_list_engine as PortfolioEngineId) || "stacked";
}

export function getPresetsEngine(
  settings: Record<string, string>,
): ProductEngineId {
  return (settings.presets_list_engine as ProductEngineId) || "grid";
}

// ── Wizard page config ──

export interface PageConfig {
  label: string;
  templateMeta: Record<string, TemplateMeta>;
  templateKey: string;
  engineKeys: Record<string, string>;
  previewPath: string;
}

export const PAGE_CONFIGS: Record<string, PageConfig> = {
  homepage: {
    label: "Trang chủ",
    templateMeta: HOMEPAGE_TEMPLATE_META,
    templateKey: "homepage_template",
    engineKeys: {
      portfolios: "homepage_portfolios_engine",
      products: "homepage_products_engine",
    },
    previewPath: "/",
  },
  courses: {
    label: "Khóa học",
    templateMeta: COURSES_TEMPLATE_META,
    templateKey: "courses_template",
    engineKeys: { courses: "courses_list_engine" },
    previewPath: "/khoa-hoc",
  },
  portfolio: {
    label: "Dự án",
    templateMeta: PORTFOLIO_TEMPLATE_META,
    templateKey: "portfolio_template",
    engineKeys: { portfolios: "portfolio_list_engine" },
    previewPath: "/san-pham",
  },
  presets: {
    label: "Công cụ",
    templateMeta: PRESETS_TEMPLATE_META,
    templateKey: "presets_template",
    engineKeys: { products: "presets_list_engine" },
    previewPath: "/cong-cu",
  },
};
