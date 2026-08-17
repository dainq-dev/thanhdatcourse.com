# Spec: Multi-Layout Design System for Site Settings

**Date:** 09/08/2026
**Version:** 1.0
**Status:** Draft → Ready for review

---

## 0. Executive Summary

Admin vào `/quan-tri-vien/cai-dat` → Wizard 3 bước trong panel trái → chọn Page Template (section ordering) → chọn Card Engine per content type → preview iframe bên phải live update → lưu → website production đổi layout.

**Layout = Template (section ordering) + Engines (cách render cards) — TÁCH RỜI.**

---

## 1. What is a Layout?

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYOUT DEFINITION                        │
│                                                             │
│  site_layout (per page) = {                                │
│    template: "default" | "compact" | "cinematic"           │
│    engines: {                                              │
│      courses: "grid" | "list" | "carousel" | "hero-grid"  │
│      portfolios: "stacked" | "masonry" | "timeline"        │
│      products: "grid" | "masonry" | "single-col"           │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Template = sections và thứ tự của chúng (cứng)              │
│  Engine   = cách hiển thị cards trong mỗi section (chọn được)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Template Catalog (Section Ordering) — 3 trang cố định, 1 dynamic

### Homepage Templates

| ID | Tên | Sections (theo thứ tự) |
|----|-----|------------------------|
| `default` | Mặc định | Hero → PromotionBanner → Work → Products → Counter → About |
| `compact` | Tối giản | Hero → Products → Counter → About (bỏ Work, PromotionBanner) |
| `cinematic` | Điện ảnh | Hero (full-screen) → Work (carousel) → Products (overlay) → Counter → About |

### Courses Page Templates

| ID | Tên | Sections |
|----|-----|----------|
| `default` | Mặc định | Hero → Courses → Brand → FAQ |
| `minimal` | Tối giản | Hero → Courses → FAQ (bỏ Brand) |
| `full` | Đầy đủ | Hero → Trust → Courses → Brand → FAQ → CTA |

### Portfolios Page Templates

| ID | Tên | Sections |
|----|-----|----------|
| `default` | Mặc định | PageHeader → Portfolios → CTA |
| `categorized` | Phân loại | PageHeader → CategoryFilter → Portfolios → CTA |
| `showcase` | Showcase | PageHeader → Featured Project (hero) → Portfolios → CTA |

### Presets Page Templates

| ID | Tên | Sections |
|----|-----|----------|
| `default` | Mặc định | Hero → Products |
| `featured` | Nổi bật | Hero → Featured Product (hero card) → Products (grid nhỏ) |

---

## 3. Card Engine Catalog (per content type)

### Course Card Engines (5-7 loại)

| ID | Tên | Mô tả | Skeleton animation |
|----|-----|-------|-------------------|
| `grid` | Lưới | Grid 2-3 cột, card: ảnh → tên → mô tả → giá → CTA | Tĩnh, grid hiển thị card rectangles |
| `list` | Danh sách | Row full-width, ảnh trái, info phải | Tĩnh |
| `carousel` | Băng chuyền | Cards trượt ngang, scroll-snap | CSS `@keyframes translateX` chạy ngang |
| `hero-grid` | Hero + lưới | 1 course hero to (featured đầu tiên) + grid nhỏ bên dưới | Tĩnh, hero card to hơn |
| `cards-stagger` | Cards động | Grid cards, mỗi card enter với stagger delay | CSS `animation-delay` cascade |
| `masonry` | Masonry | Cards chiều cao tự nhiên, xếp kiểu masonry | Tĩnh |
| `compact` | Nhỏ gọn | Cards nhỏ, 4-5 cột, chỉ hiện ảnh + tên + giá | Tĩnh |

### Portfolio Card Engines (5-6 loại)

| ID | Tên | Mô tả | Skeleton animation |
|----|-----|-------|-------------------|
| `stacked` | Xen kẽ | Ảnh trái text phải, project sau đảo ngược | Tĩnh |
| `masonry` | Masonry | Grid không đều, ảnh tự nhiên | Tĩnh |
| `timeline` | Timeline dọc | Timeline với dot connector, mỗi project = 1 điểm | Tĩnh |
| `grid-2col` | Grid 2 cột | Card vuông, hover play video | Tĩnh |
| `filmstrip` | Film cuộn | Cards cuộn ngang, kiểu film strip | CSS `@keyframes translateX` |
| `fullwidth` | Full-width | Mỗi project chiếm 100% width, ảnh to + overlay text | Tĩnh |

### Product Card Engines (3 loại)

| ID | Tên | Mô tả | Skeleton animation |
|----|-----|-------|-------------------|
| `grid` | Lưới | Grid 2-3 cột, card: ảnh → tên → mô tả → giá → CTA | Tĩnh |
| `masonry` | Masonry | Card cao thấp khác nhau | Tĩnh |
| `single-col` | 1 cột | Row full-width | Tĩnh |

---

## 4. Settings Data Model

### site_settings keys

```json
{
  "homepage_template": "default",
  "homepage_courses_engine": "grid",
  "homepage_portfolios_engine": "stacked",
  "homepage_products_engine": "grid",
  
  "courses_template": "default",
  "courses_list_engine": "grid",
  
  "portfolio_template": "default",
  "portfolio_list_engine": "stacked",
  
  "presets_template": "default",
  "presets_list_engine": "grid"
}
```

**Template key:** `{page}_template` — giá trị là ID template  
**Engine key:** `{page}_{content_type}_engine` — giá trị là ID engine  

---

## 5. Admin UX — Wizard 3 bước

### Layout của panel trái (restructured)

```
┌──────────────────────────────┐
│  ⚙ Cài đặt trang            │
│                              │
│  [Nội dung] [Giao diện]      │  ← Tab bar: content ↔ design mode
│                              │
│  ┌────────────────────────┐  │
│  │ TRANG ĐANG CHỈNH SỬA   │  │
│  │ [/] Trang chủ      [▼] │  │  ← Dropdown chọn trang
│  └────────────────────────┘  │
│                              │
│  ┌ WIZARD ─────────────────┐ │
│  │                          │ │
│  │ STEP 1: Chọn Bố cục     │ │
│  │ ┌──────┐ ┌──────┐ ┌───┐ │ │
│  │ │Default│ │Compact│ │Cine│ │ │  ← Skeleton cards (wireframe dọc tỉ lệ)
│  │ │      │ │      │ │   │ │ │
│  │ └──────┘ └──────┘ └───┘ │ │
│  │                          │ │
│  │ STEP 2: Kiểu hiển thị   │ │
│  │ Khóa học:  [Grid ▼]    │ │  ← Engine dropdown per content type
│  │ Dự án:     [Stacked ▼] │ │
│  │ Công cụ:   [Grid ▼]    │ │
│  │                          │ │
│  │ STEP 3: Xem trước & Lưu │ │
│  │ [Xem trước trên iframe] │ │  ← Hướng dẫn: "Preview bên phải đã cập nhật"
│  │ [Lưu thay đổi]          │ │  ← Nút lưu
│  │                          │ │
│  └──────────────────────────┘ │
│                              │
└──────────────────────────────┘
         PANEL TRÁI (520px)
```

### Wizard interaction flow

```mermaid
sequenceDiagram
    actor Admin
    participant Panel as Panel trái (Wizard)
    participant Cookie as preview_settings
    participant Iframe as Preview iframe phải

    Note over Admin: === STEP 1: Chọn template ===

    Admin->>Panel: Thấy 3 skeleton cards (Default, Compact, Cinematic)
    Note over Panel: Skeleton = wireframe dọc tỉ lệ scale 0.4
    Note over Panel: Có CSS animation (carousel chạy, stagger delay)
    
    Admin->>Panel: Click card "Compact"
    Panel->>Panel: Active state: border accent + checkmark
    Panel->>Cookie: writePreviewCookie({ homepage_template: "compact" })
    Panel->>Iframe: Reload iframe
    Iframe->>Iframe: Hiển thị layout compact (không có Work & PromotionBanner)

    Note over Admin: === STEP 2: Chọn engine ===

    Panel->>Panel: Hiển thị engine dropdowns PER content type trong template này
    Note over Panel: Dropdown Khóa học: [Grid | List | Carousel | Hero+Grid | ...]
    Note over Panel: Dropdown Dự án: [Stacked | Masonry | Timeline | ...]
    
    Admin->>Panel: Đổi Khóa học: Grid → Carousel
    Panel->>Cookie: writePreviewCookie({ homepage_courses_engine: "carousel" })
    Panel->>Iframe: Reload iframe
    Note over Iframe: Courses section hiển thị carousel ngang

    Admin->>Panel: Đổi Dự án: Stacked → Masonry
    Panel->>Cookie: writePreviewCookie({ homepage_portfolios_engine: "masonry" })
    Panel->>Iframe: Reload iframe

    Note over Admin: === STEP 3: Lưu ===

    Admin->>Panel: Bấm "Lưu thay đổi"
    Panel->>Panel: PUT /api/settings/batch {
        homepage_template: "compact",
        homepage_courses_engine: "carousel",
        homepage_portfolios_engine: "masonry",
        homepage_products_engine: "grid"
    }
    Panel-->>Admin: Toast "Đã lưu giao diện"
```

---

## 6. Skeleton Preview System

### Nguyên tắc

- **Wireframe dọc tỉ lệ** (scale ~0.3-0.4) hiển thị trong panel trái
- Skeleton bao gồm toàn bộ sections của template
- Lấy cảm hứng từ SectionSkeletonPreview.tsx nhưng cho cả page
- **CSS animation** cho các layout có chuyển động (carousel, stagger)

### Skeleton component

```tsx
// components/admin/layout-skeleton/PageSkeleton.tsx
"use client";

interface SectionSkeleton {
  type: "hero" | "promo" | "courses" | "portfolios" | "products" | "counter" | "about" | "brand" | "faq" | "cta";
  label: string;
  heightRatio: number; // tỉ lệ chiều cao (% của page)
  engine?: string; // engine đang chọn (để skeleton biết vẽ carousel hay grid)
}

interface Props {
  sections: SectionSkeleton[];
  width?: number;
  scale?: number;
}

export function PageSkeleton({ sections, width = 360, scale = 0.4 }: Props) {
  const totalHeight = sections.reduce((sum, s) => sum + s.heightRatio, 0);
  
  return (
    <div style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
      {sections.map((s, i) => (
        <div key={i} style={{ height: (s.heightRatio / totalHeight) * 900 * scale }}>
          {/* Render per-section skeleton */}
          <SectionSkeleton type={s.type} engine={s.engine} label={s.label} />
        </div>
      ))}
    </div>
  );
}
```

### Per-section skeleton variants

```tsx
function SectionSkeleton({ type, engine, label }: { type: string; engine?: string; label: string }) {
  switch (type) {
    case "hero":
      return <HeroSkeleton />; // Hero bar + heading + CTA rectangles
    case "courses":
      switch (engine) {
        case "carousel":
          return <CarouselSkeleton />; // Cards trượt ngang với CSS animation
        case "list":
          return <ListSkeleton />; // Rows dọc
        default:
          return <GridSkeleton columns={3} />; // Grid rectangles
      }
    case "portfolios":
      switch (engine) {
        case "masonry":
          return <MasonrySkeleton />;
        case "timeline":
          return <TimelineSkeleton />;
        default:
          return <StackedSkeleton />;
      }
    // ... other section types
  }
}
```

### Carousel skeleton animation (CSS)

```css
@keyframes skeleton-carousel-scroll {
  0%, 100% { transform: translateX(0); }
  40% { transform: translateX(-50%); }
  60% { transform: translateX(-50%); }
}

.carousel-track {
  display: flex;
  gap: 8px;
  width: max-content;
  animation: skeleton-carousel-scroll 4s ease-in-out infinite;
}
```

---

## 7. Implementation Architecture

### File Structure

```
apps/web/src/
├── app/(nguoi-dung)/
│   ├── page.tsx                    ← switch template + pass engines to sections
│   ├── _templates/                  ← page-level template components
│   │   ├── homepage-default.tsx
│   │   ├── homepage-compact.tsx
│   │   └── homepage-cinematic.tsx
│   ├── khoa-hoc/
│   │   ├── page.tsx
│   │   └── _templates/
│   │       ├── courses-default.tsx
│   │       ├── courses-minimal.tsx
│   │       └── courses-full.tsx
│   ├── san-pham/
│   │   ├── page.tsx
│   │   └── _templates/
│   │       ├── portfolio-default.tsx
│   │       ├── portfolio-categorized.tsx
│   │       └── portfolio-showcase.tsx
│   └── cong-cu/
│       ├── page.tsx
│       └── _templates/
│           ├── presets-default.tsx
│           └── presets-featured.tsx
│
├── components/
│   ├── engines/                     ← card engine components
│   │   ├── courses/
│   │   │   ├── grid.tsx
│   │   │   ├── list.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── hero-grid.tsx
│   │   │   └── ...
│   │   ├── portfolios/
│   │   │   ├── stacked.tsx
│   │   │   ├── masonry.tsx
│   │   │   ├── timeline.tsx
│   │   │   └── ...
│   │   └── products/
│   │       ├── grid.tsx
│   │       ├── masonry.tsx
│   │       └── single-col.tsx
│   │
│   └── admin/
│       ├── layout-selector/         ← admin wizard component
│       │   ├── LayoutWizard.tsx      ← Wizard 3 bước
│       │   ├── TemplateSelector.tsx   ← Step 1: skeleton grid
│       │   ├── EngineSelector.tsx     ← Step 2: dropdowns per type
│       │   ├── StepActions.tsx        ← Step 3: preview + save
│       │   └── skeletons/            ← skeleton components
│       │       ├── PageSkeleton.tsx
│       │       ├── SectionSkeleton.tsx
│       │       ├── HeroSkeleton.tsx
│       │       ├── CarouselSkeleton.tsx
│       │       ├── GridSkeleton.tsx
│       │       └── ...
│       │
│       └── cai-dat/field-defs.ts    ← CẬP NHẬT: thêm tab "Giao diện"
│
├── lib/
│   └── layout-engine.ts             ← helper: resolve template + engine → render
```

### Data Flow (page.tsx example)

```typescript
// app/(nguoi-dung)/page.tsx
import { HomepageDefault } from "./_templates/homepage-default";
import { HomepageCompact } from "./_templates/homepage-compact";
import { HomepageCinematic } from "./_templates/homepage-cinematic";
import { resolveEngine } from "@/lib/layout-engine";

const TEMPLATES = {
  default: HomepageDefault,
  compact: HomepageCompact,
  cinematic: HomepageCinematic,
} as const;

export default async function Homepage() {
  const [settings, portfolios, courses, products] = await Promise.all([...]);

  const templateId = (settings.homepage_template || "default") as keyof typeof TEMPLATES;
  const Template = TEMPLATES[templateId] ?? HomepageDefault;

  const engines = {
    courses: settings.homepage_courses_engine || "grid",
    portfolios: settings.homepage_portfolios_engine || "stacked",
    products: settings.homepage_products_engine || "grid",
  };

  return (
    <Template
      settings={settings}
      portfolios={portfolios}
      courses={courses}
      products={products}
      engines={engines}
    />
  );
}
```

### Template component example

```typescript
// _templates/homepage-compact.tsx
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";
import { CounterSection } from "@/components/sections/counter-section";
import { AboutSection } from "@/components/sections/about-section";

export function HomepageCompact({ settings, courses, products, engines }) {
  return (
    <>
      <HeroBanner settings={settings} />
      <ProductSection
        settings={settings}
        courses={courses}
        products={products}
        engine={engines.products}
      />
      <CounterSection settings={settings} />
      <AboutSection settings={settings} />
    </>
  );
}
```

### Engine resolver

```typescript
// lib/layout-engine.ts

import { CoursesGrid } from "@/components/engines/courses/grid";
import { CoursesList } from "@/components/engines/courses/list";
import { CoursesCarousel } from "@/components/engines/courses/carousel";
// ... import all engines

const COURSE_ENGINES = {
  grid: CoursesGrid,
  list: CoursesList,
  carousel: CoursesCarousel,
  "hero-grid": CoursesHeroGrid,
  "cards-stagger": CoursesStagger,
  masonry: CoursesMasonry,
  compact: CoursesCompact,
} as const;

const PORTFOLIO_ENGINES = {
  stacked: PortfolioStacked,
  masonry: PortfolioMasonry,
  timeline: PortfolioTimeline,
  "grid-2col": PortfolioGrid2Col,
  filmstrip: PortfolioFilmstrip,
  fullwidth: PortfolioFullwidth,
} as const;

const PRODUCT_ENGINES = {
  grid: ProductGrid,
  masonry: ProductMasonry,
  "single-col": ProductSingleCol,
} as const;

type CourseEngineId = keyof typeof COURSE_ENGINES;
type PortfolioEngineId = keyof typeof PORTFOLIO_ENGINES;
type ProductEngineId = keyof typeof PRODUCT_ENGINES;

export function resolveCourseEngine(id: string) {
  return COURSE_ENGINES[id as CourseEngineId] ?? CoursesGrid;
}

export function resolvePortfolioEngine(id: string) {
  return PORTFOLIO_ENGINES[id as PortfolioEngineId] ?? PortfolioStacked;
}

export function resolveProductEngine(id: string) {
  return PRODUCT_ENGINES[id as ProductEngineId] ?? ProductGrid;
}
```

---

## 8. Integration vào Settings Page

### field-defs.ts — Thêm tab "Giao diện"

```typescript
// Thêm vào SECTIONS array
{
  id: "design",
  title: "Giao diện",
  description: "Chọn bố cục trang và kiểu hiển thị nội dung.",
  previewPath: "/",
  fields: [
    { key: "homepage_template", label: "", type: "page-template" },
    { key: "homepage_courses_engine", label: "", type: "hidden" },
    { key: "homepage_portfolios_engine", label: "", type: "hidden" },
    { key: "homepage_products_engine", label: "", type: "hidden" },
    
    { key: "courses_template", label: "", type: "page-template" },
    { key: "courses_list_engine", label: "", type: "hidden" },
    
    { key: "portfolio_template", label: "", type: "page-template" },
    { key: "portfolio_list_engine", label: "", type: "hidden" },
    
    { key: "presets_template", label: "", type: "page-template" },
    { key: "presets_list_engine", label: "", type: "hidden" },
  ],
}
```

### cai-dat/page.tsx — Render Wizard cho tab "Giao diện"

Khi section.id === "design", render `<LayoutWizard>` thay vì form fields thông thường.

```tsx
// Trong renderSection hoặc renderField
if (section.id === "design") {
  return (
    <LayoutWizard
      settings={formData}
      section={section}
      onChange={(key, value) => {
        handleFieldChange(key, value);
        writePreviewCookie({ ...previewChanges, [key]: value });
      }}
      previewPath={"/"} // hoặc dynamic theo section
    />
  );
}
```

---

## 9. Preview Cookie Integration

### Key insight: TEMPLATE thay đổi cần reload iframe

Khi admin chọn template, cookie set `homepage_template = "compact"`. Iframe reload → SSR đọc cookie → `layout-engine.ts` resolve template → render template mới.

Khi admin chọn engine, cookie set `homepage_courses_engine = "carousel"`. Iframe reload → engine đổi → section hiển thị carousel.

**Không cần localStorage, chỉ cần cookie.**

### Cookie keys cho design

```
preview_settings = {
  // ... các key content khác (hero_video_type, ...)
  homepage_template: "compact",
  homepage_courses_engine: "carousel",
  homepage_portfolios_engine: "masonry",
  homepage_products_engine: "grid",
}
```

---

## 10. Pre-Flight Checklist

Trước khi triển khai, confirm:

- [ ] 5-7 course card engines — đã agree loại nào? (grid, list, carousel, hero-grid, Cards-Stagger, masonry, compact)
- [ ] 5-6 portfolio card engines — đã agree loại nào? (stacked, masonry, timeline, Grid-2-Col, filmstrip, fullwidth)
- [ ] 3 product card engines — đã agree (grid, masonry, single-col)
- [ ] Homepage templates: default, compact — có cần cinematic không?
- [ ] Courses templates: default, minimal, full — đủ chưa?
- [ ] Portfolios templates: default, categorized, showcase — đủ chưa?
- [ ] Presets templates: default, featured — đủ chưa?
- [ ] Engine thay đổi → iframe reload tự động (debounce 500ms?)
- [ ] Skeleton animation CSS keyframes — đủ diễn tả ý tưởng chưa?
- [ ] Wizard 3 bước trong panel trái — UX flow có rõ ràng không?

---

## 11. Implementation Plan

### Phase 1: Core Engine Components (2-3 ngày)
1. Xây dựng 7 course card engines
2. Xây dựng 6 portfolio card engines  
3. Xây dựng 3 product card engines
4. `lib/layout-engine.ts` — engine resolver

### Phase 2: Template Components + Page Integration (2 ngày)
5. Homepage templates (3)
6. Courses templates (3)
7. Portfolio templates (3)
8. Presets templates (2)
9. Update page.tsx files → switch template + engines

### Phase 3: Admin Wizard UI (2-3 ngày)
10. Skeleton components (SectionSkeleton, CarouselSkeleton, GridSkeleton...)
11. LayoutWizard component (Wizard 3 bước)
12. TemplateSelector (Step 1)
13. EngineSelector (Step 2)
14. Update field-defs.ts (tab "Giao diện")
15. Update cai-dat/page.tsx (render wizard)

### Phase 4: Preview & Polish (1 ngày)
16. Cookie integration testing
17. Animation skeleton refinement
18. Edge cases: page có data rỗng, engine không tương thích

**Tổng: ~8-9 ngày cho 4 trang.**

---

## 12. Open Questions

1. **Cần bao nhiêu engine variants cho mỗi content type?** 5-7 courses, 5-6 portfolios, 3 products như trên?
2. **Homepage có cần cinematic template không?** Hay chỉ default + compact?
3. **Engine thay đổi có cần reload full iframe không?** Hay chỉ reload partial? (Reload full an toàn hơn)
4. **Skeleton wireframe dọc tỉ lệ: scale factor bao nhiêu?** 0.3 hay 0.4?
5. **Wizard 3 bước có nên có nút "Back" để quay lại step trước không?**

---

## Next Steps

`/bdd-review` → `/bdd-dev`
