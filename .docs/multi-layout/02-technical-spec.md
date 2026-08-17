# Technical Specification: Multi-Layout Design System

**Date:** 09/08/2026  
**Version:** 1.0  
**Status:** Draft  

---

## 1. Data Model — site_settings Keys

Tất cả keys lưu trong bảng `site_settings` (key-value). Không cần schema migration — `PUT /api/settings/batch` upsert tự động.

### 1.1 Homepage

| Key | Type | Default | Valid Values | Description |
|-----|------|---------|--------------|-------------|
| `homepage_template` | `string` | `"default"` | `"default"` `"compact"` `"cinematic"` | Template bố cục section cho trang chủ |
| `homepage_portfolios_engine` | `string` | `"stacked"` | `"stacked"` `"masonry"` `"timeline"` `"grid-2col"` `"filmstrip"` `"fullwidth"` | Engine render card dự án trên homepage |
| `homepage_products_engine` | `string` | `"grid"` | `"grid"` `"masonry"` `"single-col"` | Engine render sản phẩm (khóa học + công cụ gộp chung) trên homepage |

### 1.2 Courses Page

| Key | Type | Default | Valid Values | Description |
|-----|------|---------|--------------|-------------|
| `courses_template` | `string` | `"default"` | `"default"` `"minimal"` `"full"` | Template bố cục section cho /khoa-hoc |
| `courses_list_engine` | `string` | `"grid"` | `"grid"` `"list"` `"carousel"` `"hero-grid"` `"cards-stagger"` `"masonry"` `"compact"` | Engine render danh sách khóa học |

### 1.3 Portfolio Page

| Key | Type | Default | Valid Values | Description |
|-----|------|---------|--------------|-------------|
| `portfolio_template` | `string` | `"default"` | `"default"` `"categorized"` `"showcase"` | Template bố cục section cho /san-pham |
| `portfolio_list_engine` | `string` | `"stacked"` | `"stacked"` `"masonry"` `"timeline"` `"grid-2col"` `"filmstrip"` `"fullwidth"` | Engine render danh sách dự án |

### 1.4 Presets Page

| Key | Type | Default | Valid Values | Description |
|-----|------|---------|--------------|-------------|
| `presets_template` | `string` | `"default"` | `"default"` `"featured"` | Template bố cục section cho /cong-cu |
| `presets_list_engine` | `string` | `"grid"` | `"grid"` `"masonry"` `"single-col"` | Engine render danh sách công cụ/preset |

### 1.5 Seed Strategy

Khi `site_settings` chưa có key → `getSiteSettings()` trả về `{}` → code dùng fallback default. Không cần seed data; mọi component đều fallback về giá trị mặc định khi key không tồn tại.

```typescript
const templateId = (settings.homepage_template || "default") as TemplateId;
const engineId = (settings.homepage_courses_engine || "grid") as CourseEngineId;
```

---

## 2. TypeScript Type Definitions

```typescript
// ── Content Types ──

type ContentType = "courses" | "portfolios" | "products";

// ── Template IDs ──

type HomepageTemplateId = "default" | "compact" | "cinematic";
type CoursesTemplateId = "default" | "minimal" | "full";
type PortfolioTemplateId = "default" | "categorized" | "showcase";
type PresetsTemplateId = "default" | "featured";

type TemplateId =
  | HomepageTemplateId
  | CoursesTemplateId
  | PortfolioTemplateId
  | PresetsTemplateId;

// ── Engine IDs ──

type CourseEngineId =
  | "grid" | "list" | "carousel" | "hero-grid"
  | "cards-stagger" | "masonry" | "compact";

type PortfolioEngineId =
  | "stacked" | "masonry" | "timeline"
  | "grid-2col" | "filmstrip" | "fullwidth";

type ProductEngineId = "grid" | "masonry" | "single-col";

type EngineId = CourseEngineId | PortfolioEngineId | ProductEngineId;

// ── Page Layout ──

interface PageLayout {
  template: TemplateId;
  engines: Record<ContentType, EngineId>;
}

// ── Concrete per-page layout types ──

interface HomepageLayout {
  template: HomepageTemplateId;
  engines: {
    portfolios: PortfolioEngineId;
    products: ProductEngineId;  // gộp cả courses + products
  };
}

interface CoursesPageLayout {
  template: CoursesTemplateId;
  engines: {
    courses: CourseEngineId;
  };
}

interface PortfolioPageLayout {
  template: PortfolioTemplateId;
  engines: {
    portfolios: PortfolioEngineId;
  };
}

interface PresetsPageLayout {
  template: PresetsTemplateId;
  engines: {
    products: ProductEngineId;
  };
}
```

---

## 3. Template Registry

### 3.1 Core Interfaces

```typescript
interface SectionSlot {
  type: string;
  label: string;
  /**
   * Nếu section này render cards của một content type,
   * contentType chỉ định loại content mà engine sẽ nhận.
   * undefined cho các section không gắn content (hero, counter, about...)
   */
  contentType?: ContentType;
}

interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  /** Ordered list of sections in this template */
  sections: SectionSlot[];
  /** Content types that can accept engine selection in this template */
  applicableEngines: ContentType[];
}
```

### 3.2 Homepage Templates

```typescript
const HOMEPAGE_TEMPLATES: Record<HomepageTemplateId, TemplateDefinition> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Hero → Promo → Dự án → Sản phẩm → Số liệu → Giới thiệu",
    sections: [
      { type: "hero", label: "Banner chính" },
      { type: "promo", label: "Khuyến mãi" },
      { type: "portfolios", label: "Dự án nổi bật", contentType: "portfolios" },
      { type: "products", label: "Sản phẩm", contentType: "products" },
      { type: "counter", label: "Số liệu" },
      { type: "about", label: "Giới thiệu" },
    ],
    applicableEngines: ["portfolios", "products"],  // "products" renders both courses + products
  },
  compact: {
    id: "compact",
    label: "Tối giản",
    description: "Hero → Sản phẩm → Số liệu → Giới thiệu (bỏ Promo, Dự án)",
    sections: [
      { type: "hero", label: "Banner chính" },
      { type: "products", label: "Sản phẩm", contentType: "products" },
      { type: "counter", label: "Số liệu" },
      { type: "about", label: "Giới thiệu" },
    ],
    applicableEngines: ["products"],
  },
  cinematic: {
    id: "cinematic",
    label: "Điện ảnh",
    description: "Hero full-screen → Dự án carousel → Sản phẩm overlay → Số liệu → Giới thiệu",
    sections: [
      { type: "hero", label: "Banner full-screen" },
      { type: "portfolios", label: "Dự án", contentType: "portfolios" },
      { type: "products", label: "Sản phẩm", contentType: "products" },
      { type: "counter", label: "Số liệu" },
      { type: "about", label: "Giới thiệu" },
    ],
    applicableEngines: ["portfolios", "products"],
  },
};
```

### 3.3 Courses Page Templates

```typescript
const COURSES_TEMPLATES: Record<CoursesTemplateId, TemplateDefinition> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Hero → Khóa học → Brand → FAQ",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "courses", label: "Danh sách khóa học", contentType: "courses" },
      { type: "brand", label: "Thương hiệu" },
      { type: "faq", label: "Hỏi & Đáp" },
    ],
    applicableEngines: ["courses"],
  },
  minimal: {
    id: "minimal",
    label: "Tối giản",
    description: "Hero → Khóa học → FAQ (bỏ Brand)",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "courses", label: "Danh sách khóa học", contentType: "courses" },
      { type: "faq", label: "Hỏi & Đáp" },
    ],
    applicableEngines: ["courses"],
  },
  full: {
    id: "full",
    label: "Đầy đủ",
    description: "Hero → Trust → Khóa học → Brand → FAQ → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "trust", label: "Dòng tin cậy" },
      { type: "courses", label: "Danh sách khóa học", contentType: "courses" },
      { type: "brand", label: "Thương hiệu" },
      { type: "faq", label: "Hỏi & Đáp" },
      { type: "cta", label: "Kêu gọi hành động" },
    ],
    applicableEngines: ["courses"],
  },
};
```

### 3.4 Portfolio Page Templates

```typescript
const PORTFOLIO_TEMPLATES: Record<PortfolioTemplateId, TemplateDefinition> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Header → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "portfolios", label: "Danh sách dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi hành động" },
    ],
    applicableEngines: ["portfolios"],
  },
  categorized: {
    id: "categorized",
    label: "Phân loại",
    description: "Header → Filter → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "category-filter", label: "Bộ lọc danh mục" },
      { type: "portfolios", label: "Danh sách dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi hành động" },
    ],
    applicableEngines: ["portfolios"],
  },
  showcase: {
    id: "showcase",
    label: "Showcase",
    description: "Header → Featured → Dự án → CTA",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "featured-project", label: "Dự án nổi bật", contentType: "portfolios" },
      { type: "portfolios", label: "Danh sách dự án", contentType: "portfolios" },
      { type: "cta", label: "Kêu gọi hành động" },
    ],
    applicableEngines: ["portfolios"],
  },
};
```

### 3.5 Presets Page Templates

```typescript
const PRESETS_TEMPLATES: Record<PresetsTemplateId, TemplateDefinition> = {
  default: {
    id: "default",
    label: "Mặc định",
    description: "Hero → Công cụ",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "products", label: "Danh sách công cụ", contentType: "products" },
    ],
    applicableEngines: ["products"],
  },
  featured: {
    id: "featured",
    label: "Nổi bật",
    description: "Hero → Featured product → Grid nhỏ",
    sections: [
      { type: "page-header", label: "Tiêu đề trang" },
      { type: "products", label: "Sản phẩm nổi bật", contentType: "products" },
    ],
    applicableEngines: ["products"],
  },
};
```

### 3.6 Unified Lookup

```typescript
const ALL_TEMPLATES: Record<string, TemplateDefinition> = {
  ...HOMEPAGE_TEMPLATES,
  ...COURSES_TEMPLATES,
  ...PORTFOLIO_TEMPLATES,
  ...PRESETS_TEMPLATES,
};

function getTemplate(id: string): TemplateDefinition {
  return ALL_TEMPLATES[id] ?? HOMEPAGE_TEMPLATES.default;
}
```

---

## 4. Engine Registry

### 4.1 Core Interfaces

```typescript
import type { ComponentType } from "react";

interface EngineProps<T = unknown> {
  items: T[];
  settings: Record<string, string>;
}

interface SkeletonProps {
  animated?: boolean;
}

interface EngineDefinition<T = unknown> {
  id: string;
  label: string;
  description: string;
  contentType: ContentType;
  component: ComponentType<EngineProps<T>>;
  skeletonComponent: ComponentType<SkeletonProps>;
}
```

### 4.2 Course Engines

```typescript
interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnailUrl: string | null;
  basePrice: number;
  originalPrice: number | null;
}

const COURSE_ENGINES: Record<CourseEngineId, EngineDefinition<CourseCardData>> = {
  grid:         { id: "grid",         label: "Lưới",         description: "Grid 2-3 cột, card đầy đủ thông tin",   contentType: "courses", component: CoursesGrid,         skeletonComponent: GridSkeleton },
  list:         { id: "list",         label: "Danh sách",    description: "Row full-width, ảnh trái info phải",     contentType: "courses", component: CoursesList,         skeletonComponent: ListSkeleton },
  carousel:     { id: "carousel",     label: "Băng chuyền",  description: "Cards trượt ngang với scroll-snap",       contentType: "courses", component: CoursesCarousel,     skeletonComponent: CarouselSkeleton },
  "hero-grid":  { id: "hero-grid",   label: "Hero + Lưới",  description: "1 course hero to + grid nhỏ bên dưới",    contentType: "courses", component: CoursesHeroGrid,     skeletonComponent: HeroGridSkeleton },
  "cards-stagger": { id: "cards-stagger", label: "Cards động", description: "Grid cards với stagger delay animation", contentType: "courses", component: CoursesStagger,   skeletonComponent: StaggerSkeleton },
  masonry:      { id: "masonry",      label: "Masonry",      description: "Cards chiều cao tự nhiên xếp masonry",    contentType: "courses", component: CoursesMasonry,      skeletonComponent: MasonrySkeleton },
  compact:      { id: "compact",      label: "Nhỏ gọn",      description: "4-5 cột, chỉ ảnh + tên + giá",            contentType: "courses", component: CoursesCompact,      skeletonComponent: CompactSkeleton },
};
```

### 4.3 Portfolio Engines

```typescript
interface PortfolioCardData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  youtubeVideoId: string | null;
}

const PORTFOLIO_ENGINES: Record<PortfolioEngineId, EngineDefinition<PortfolioCardData>> = {
  stacked:   { id: "stacked",   label: "Xen kẽ",      description: "Ảnh trái text phải, project sau đảo ngược",           contentType: "portfolios", component: PortfolioStacked,   skeletonComponent: StackedSkeleton },
  masonry:   { id: "masonry",   label: "Masonry",      description: "Grid không đều, ảnh tự nhiên",                        contentType: "portfolios", component: PortfolioMasonry,   skeletonComponent: MasonrySkeleton },
  timeline:  { id: "timeline",  label: "Timeline dọc", description: "Timeline với dot connector, mỗi project = 1 điểm",    contentType: "portfolios", component: PortfolioTimeline,  skeletonComponent: TimelineSkeleton },
  "grid-2col": { id: "grid-2col", label: "Grid 2 cột",  description: "Card vuông, hover play video",                       contentType: "portfolios", component: PortfolioGrid2Col,  skeletonComponent: Grid2ColSkeleton },
  filmstrip: { id: "filmstrip", label: "Film cuộn",    description: "Cards cuộn ngang kiểu film strip",                    contentType: "portfolios", component: PortfolioFilmstrip, skeletonComponent: FilmstripSkeleton },
  fullwidth: { id: "fullwidth", label: "Full-width",   description: "Mỗi project 100% width, ảnh to + overlay text",       contentType: "portfolios", component: PortfolioFullwidth, skeletonComponent: FullwidthSkeleton },
};
```

### 4.4 Product Engines

```typescript
interface ProductCardData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  tag: string | null;
}

const PRODUCT_ENGINES: Record<ProductEngineId, EngineDefinition<ProductCardData>> = {
  grid:       { id: "grid",       label: "Lưới",      description: "Grid 2-3 cột, card: ảnh → tên → mô tả → giá → CTA", contentType: "products", component: ProductGrid,       skeletonComponent: GridSkeleton },
  masonry:    { id: "masonry",    label: "Masonry",   description: "Cards cao thấp khác nhau",                              contentType: "products", component: ProductMasonry,    skeletonComponent: MasonrySkeleton },
  "single-col": { id: "single-col", label: "1 cột",    description: "Row full-width",                                      contentType: "products", component: ProductSingleCol,  skeletonComponent: SingleColSkeleton },
};
```

---

## 5. API Layer

### 5.1 No New Endpoints

Toàn bộ layout config lưu qua `PUT /api/settings/batch` hiện có (`apps/api/src/routes/settings.ts:16-35`). Endpoint này:

- Nhận `Record<string, string>` (Zod: `z.record(z.string(), z.string())`)
- Auth: `ADMIN` role
- Upsert từng key với `onConflictDoUpdate`
- Trả về `{ updated: number, keys: string[] }`

### 5.2 Reading Layout Config

`GET /api/settings` hiện tại trả về toàn bộ `site_settings` rows. Frontend `getSiteSettings()` (`apps/web/src/lib/settings.ts:62`) cache 60s với `cache()` + `fetch({ next: { revalidate: 60 } })`.

Không cần endpoint mới. Layout keys nằm chung trong response cùng các key content khác.

### 5.3 field-defs.ts Update

Thêm section `"design"` vào `SECTIONS` array trong `apps/web/src/app/quan-tri-vien/cai-dat/field-defs.ts`:

```typescript
{
  id: "design",
  title: "Giao diện",
  description: "Chọn bố cục trang và kiểu hiển thị nội dung.",
  previewPath: "/",
  fields: [
    { key: "homepage_template",         label: "Trang chủ — Bố cục",      type: "select", options: [
      { label: "Mặc định", value: "default" },
      { label: "Tối giản", value: "compact" },
      { label: "Điện ảnh", value: "cinematic" },
    ]},
    { key: "homepage_portfolios_engine", label: "Trang chủ — Dự án",       type: "select", options: [
      { label: "Xen kẽ", value: "stacked" },
      { label: "Masonry", value: "masonry" },
      { label: "Timeline", value: "timeline" },
      { label: "Grid 2 cột", value: "grid-2col" },
      { label: "Film cuộn", value: "filmstrip" },
      { label: "Full-width", value: "fullwidth" },
    ]},
    { key: "homepage_products_engine",   label: "Trang chủ — Sản phẩm",    type: "select", options: [
      { label: "Lưới", value: "grid" },
      { label: "Masonry", value: "masonry" },
      { label: "1 cột", value: "single-col" },
    ]},

    { key: "courses_template",           label: "Khóa học — Bố cục",       type: "select", options: [
      { label: "Mặc định", value: "default" },
      { label: "Tối giản", value: "minimal" },
      { label: "Đầy đủ", value: "full" },
    ]},
    { key: "courses_list_engine",        label: "Khóa học — Hiển thị",     type: "select", options: [
      { label: "Lưới", value: "grid" },
      { label: "Danh sách", value: "list" },
      { label: "Băng chuyền", value: "carousel" },
      { label: "Hero + Lưới", value: "hero-grid" },
      { label: "Cards động", value: "cards-stagger" },
      { label: "Masonry", value: "masonry" },
      { label: "Nhỏ gọn", value: "compact" },
    ]},

    { key: "portfolio_template",         label: "Dự án — Bố cục",          type: "select", options: [
      { label: "Mặc định", value: "default" },
      { label: "Phân loại", value: "categorized" },
      { label: "Showcase", value: "showcase" },
    ]},
    { key: "portfolio_list_engine",      label: "Dự án — Hiển thị",        type: "select", options: [
      { label: "Xen kẽ", value: "stacked" },
      { label: "Masonry", value: "masonry" },
      { label: "Timeline", value: "timeline" },
      { label: "Grid 2 cột", value: "grid-2col" },
      { label: "Film cuộn", value: "filmstrip" },
      { label: "Full-width", value: "fullwidth" },
    ]},

    { key: "presets_template",           label: "Công cụ — Bố cục",        type: "select", options: [
      { label: "Mặc định", value: "default" },
      { label: "Nổi bật", value: "featured" },
    ]},
    { key: "presets_list_engine",        label: "Công cụ — Hiển thị",      type: "select", options: [
      { label: "Lưới", value: "grid" },
      { label: "Masonry", value: "masonry" },
      { label: "1 cột", value: "single-col" },
    ]},
  ],
}
```

### 5.4 Cookie Preview Mechanism

**Không thay đổi.** Cơ chế hiện tại trong `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx`:

1. Admin thay đổi field → `handleChange(key, value)` (line 97-113)
2. Gọi `writePreviewCookie(changed)` (line 105) → set cookie `preview_settings` (max-age 600s)
3. Debounce 500ms → `setPreviewKey(k => k + 1)` → iframe reload
4. SSR: `getSiteSettings()` (line 62, `lib/settings.ts`) đọc cookie `preview_settings`, merge override vào DB values
5. → Page render với layout mới

Flow này hoạt động cho layout keys giống hệt content keys — chỉ cần key name có trong cookie.

---

## 6. SSR Flow

### 6.1 Visitor (no preview cookie)

```
1. Browser request GET /
2. Next.js Server Component page.tsx gọi getSiteSettings()
3. getSiteSettings() → fetchSettings() → GET /api/settings (cache 60s)
4. Response: [{ key: "homepage_template", value: "compact" }, ...]
5. parse thành Record<string,string>: { homepage_template: "compact", ... }
6. Không có preview cookie → dùng DB values
7. resolve template: TEMPLATES[settings.homepage_template || "default"]
8. resolve engines: { courses: settings.homepage_courses_engine || "grid", ... }
9. Render template component với engines object
```

### 6.2 Admin (with preview cookie)

```
1. Admin thay đổi "Trang chủ — Bố cục" từ "default" → "compact" trong panel admin
2. Client: writePreviewCookie({ homepage_template: "compact" })
3. Client: iframe reload GET /
4. Next.js Server Component gọi getSiteSettings()
5. fetchSettings() → GET /api/settings → DB values
6. getPreviewOverrides() → cookieStore.get("preview_settings") → { homepage_template: "compact" }
7. Merge: { ...dbValues, ...previewOverrides }
8. Template resolves to HomepageCompact
9. Engine resolves to current engine settings (merged)
10. HTML returned to iframe → admin sees compact layout
```

### 6.3 Code: page.tsx (example)

```typescript
// apps/web/src/app/(nguoi-dung)/page.tsx
import { getSiteSettings } from "@/lib/settings";
import { getTemplate } from "@/lib/registry/templates";
import { resolveEngine } from "@/lib/registry/engines";
import { api } from "@/lib/api";

export default async function HomePage() {
  const settings = await getSiteSettings();

  const templateId = (settings.homepage_template || "default") as HomepageTemplateId;
  const template = getTemplate(templateId);

  const engines = {
    courses: resolveEngine("courses", settings.homepage_courses_engine || "grid"),
    portfolios: resolveEngine("portfolios", settings.homepage_portfolios_engine || "stacked"),
    products: resolveEngine("products", settings.homepage_products_engine || "grid"),
  };

  // Fetch data for sections that exist in this template
  const sectionTypes = new Set(template.sections.map(s => s.type));
  const [portfolios, courses, products] = await Promise.all([
    sectionTypes.has("portfolios") ? api.publicGet("/api/portfolios") : null,
    api.publicGet("/api/courses"),    // always fetch — merged into products section
    api.publicGet("/api/products"),   // always fetch — merged into products section
  ]);

  return (
    <HomepageRenderer
      template={template}
      engines={engines}
      settings={settings}
      data={{ portfolios, courses, products }}
    />
  );
}
```

### 6.4 Template Renderer

```typescript
// apps/web/src/app/(nguoi-dung)/_renderers/homepage-renderer.tsx
interface HomepageRendererProps {
  template: TemplateDefinition;
  engines: Record<string, EngineDefinition>;
  settings: Record<string, string>;
  data: {
    portfolios: PortfolioCardData[] | null;
    courses: CourseCardData[] | null;
    products: ProductCardData[] | null;
  };
}

export function HomepageRenderer({ template, engines, settings, data }: HomepageRendererProps) {
  return template.sections.map((slot, i) => {
    switch (slot.type) {
      case "hero":
        return <HeroBanner key={i} settings={settings} />;
      case "promo":
        return <PromoBanner key={i} settings={settings} />;
      case "portfolios": {
        const Engine = engines.portfolios?.component;
        return Engine && data.portfolios
          ? <Engine key={i} items={data.portfolios} settings={settings} />
          : null;
      }
      case "products": {
        const Engine = engines.products?.component;
        if (!Engine) return null;
        // Merge courses + products for combined "Sản phẩm" section
        const items = [...(data.courses ?? []), ...(data.products ?? [])];
        return <Engine key={i} items={items} settings={settings} />;
      }
      case "counter":
        return <CounterSection key={i} settings={settings} />;
      case "about":
        return <AboutSection key={i} settings={settings} />;
      default:
        return null;
    }
  });
}
```

---

## 7. Fallback Strategy

| Scenario | Behavior |
|----------|----------|
| Key không có trong `site_settings` | Fallback về default value trong code (`|| "default"`) |
| key có nhưng value không hợp lệ (typo) | `getTemplate()` trả về default template; `resolveEngine()` trả về default engine |
| Template không có section X nhưng page.tsx gọi API cho X | API trả về `null` → section bỏ qua (conditional render) |
| Engine component chưa implemented | TypeScript compile error — không thể xảy ra runtime |
| Cookie `preview_settings` parse fail | `getPreviewOverrides()` return `null` → dùng DB values |
| Cookie vượt 3800 bytes | `buildPreviewCookie()` (line 39-51) truncate các key thừa |

---

## 8. File Structure

```
apps/web/src/
├── lib/
│   └── registry/
│       ├── templates.ts        ← TemplateDefinition + tất cả TEMPLATES record
│       └── engines.ts          ← EngineDefinition + COURSE/PORTFOLIO/PRODUCT_ENGINES + resolveEngine()

├── app/(nguoi-dung)/
│   ├── page.tsx                ← homepage: resolve template + engines → HomepageRenderer
│   ├── _renderers/
│   │   ├── homepage-renderer.tsx
│   │   ├── courses-renderer.tsx
│   │   ├── portfolio-renderer.tsx
│   │   └── presets-renderer.tsx
│   ├── khoa-hoc/
│   │   └── page.tsx
│   ├── san-pham/
│   │   └── page.tsx
│   └── cong-cu/
│       └── page.tsx

├── components/
│   └── engines/
│       ├── courses/
│       │   ├── grid.tsx
│       │   ├── list.tsx
│       │   ├── carousel.tsx
│       │   ├── hero-grid.tsx
│       │   ├── cards-stagger.tsx
│       │   ├── masonry.tsx
│       │   └── compact.tsx
│       ├── portfolios/
│       │   ├── stacked.tsx
│       │   ├── masonry.tsx
│       │   ├── timeline.tsx
│       │   ├── grid-2col.tsx
│       │   ├── filmstrip.tsx
│       │   └── fullwidth.tsx
│       └── products/
│           ├── grid.tsx
│           ├── masonry.tsx
│           └── single-col.tsx
```

---

## 9. TypeScript Module Resolution

Để tránh circular imports, các file registry KHÔNG import component implementations trực tiếp. Thay vào đó dùng lazy pattern:

```typescript
// lib/registry/engines.ts
import type { ComponentType } from "react";

const COURSE_ENGINE_REGISTRY: Record<CourseEngineId, () => Promise<{ default: ComponentType<EngineProps<CourseCardData>> }>> = {
  grid:         () => import("@/components/engines/courses/grid"),
  list:         () => import("@/components/engines/courses/list"),
  carousel:     () => import("@/components/engines/courses/carousel"),
  "hero-grid":  () => import("@/components/engines/courses/hero-grid"),
  // ...
};
```

Tuy nhiên vì đây là Server Components (SSR), dynamic import không cần thiết trừ khi muốn code-splitting. Với số lượng engine nhỏ (~16), static import và tree-shaking của Next.js đã đủ hiệu quả.

---

## 10. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| 16 engine components bundle size | Next.js tree-shaking: chỉ import engines được dùng trong template hiện tại |
| API call /api/settings mỗi request | `fetch({ next: { revalidate: 60 } })` + React `cache()` — 1 call/60s |
| Renderer switch-case O(n) sections | Mỗi template có ≤6 sections → O(1) effectively |
| Skeleton components cho admin | Code-split riêng, không bundle vào visitor pages |
| Cookie size limit (4KB) | `buildPreviewCookie()` đã truncate >3800 bytes |
