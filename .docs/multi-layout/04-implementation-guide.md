# IMPLEMENTATION GUIDE: Multi-Layout Design System

**Date:** 09/08/2026
**Version:** 1.0
**Phụ thuộc:** `spec-design-multi-layout-system.md`

---

## 0. Tổng quan

Hệ thống cho phép Admin chọn **Template** (thứ tự sections) và **Engine** (cách render cards) cho từng trang. Lưu qua `site_settings` → cookie `preview_settings` → iframe live preview.

**Layout = Template + Engines** — tách rời, chọn độc lập.

Dữ liệu lưu dạng key-value trong `site_settings`:

```
homepage_template         = "default" | "compact" | "cinematic"
homepage_courses_engine   = "grid" | "list" | "carousel" | ...
homepage_portfolios_engine = "stacked" | "masonry" | ...
homepage_products_engine  = "grid" | "masonry" | "single-col"
courses_template          = "default" | "minimal" | "full"
courses_list_engine       = "grid" | ...
portfolio_template        = "default" | "categorized" | "showcase"
portfolio_list_engine     = "stacked" | ...
presets_template          = "default" | "featured"
presets_list_engine       = "grid" | ...
```

---

## 1. File Structure

```
apps/web/src/
├── lib/
│   └── layout-engine.ts              ← [NEW] Registry: TEMPLATES, ENGINES, resolvers, types
│
├── components/
│   ├── engines/                       ← [NEW] Card engine components
│   │   ├── courses/
│   │   │   ├── grid.tsx               ← Render courses dạng lưới 2-3 cột
│   │   │   ├── list.tsx               ← Render courses dạng danh sách ngang full-width
│   │   │   ├── carousel.tsx           ← Render courses dạng băng chuyền scroll-snap
│   │   │   ├── hero-grid.tsx          ← 1 featured hero + grid nhỏ bên dưới
│   │   │   ├── cards-stagger.tsx      ← Grid với stagger animation delay
│   │   │   ├── masonry.tsx            ← Masonry layout chiều cao tự nhiên
│   │   │   └── compact.tsx            ← Cards nhỏ 4-5 cột
│   │   ├── portfolios/
│   │   │   ├── stacked.tsx            ← Xen kẽ ảnh trái/text phải
│   │   │   ├── masonry.tsx            ← Grid không đều
│   │   │   ├── timeline.tsx           ← Timeline dọc với dot connector
│   │   │   ├── grid-2col.tsx          ← Grid 2 cột, card vuông
│   │   │   ├── filmstrip.tsx          ← Film cuộn ngang
│   │   │   └── fullwidth.tsx          ← 100% width per project
│   │   └── products/
│   │       ├── grid.tsx               ← Grid 2-3 cột
│   │       ├── masonry.tsx            ← Masonry layout
│   │       └── single-col.tsx         ← Row full-width
│   │
│   └── admin/layout-wizard/           ← [NEW] Admin UI cho tab "Giao diện"
│       ├── LayoutWizard.tsx           ← Container: 3-step wizard + cookie + iframe
│       ├── TemplateSelector.tsx       ← Step 1: chọn template từ skeleton cards
│       ├── EngineSelector.tsx         ← Step 2: chọn engine per content type
│       ├── StepActions.tsx            ← Step 3: preview xác nhận + nút Lưu
│       ├── LayoutWizard.module.scss   ← Styles cho wizard
│       └── skeletons/
│           ├── PageSkeleton.tsx        ← Wireframe toàn page (scale + scroll)
│           ├── SectionSkeleton.tsx     ← Per-section type → rectangles SVG
│           ├── CarouselSkeleton.tsx    ← Carousel với CSS animation translateX
│           ├── GridSkeleton.tsx        ← Grid rectangles tĩnh
│           ├── ListSkeleton.tsx        ← Row rectangles tĩnh
│           ├── MasonrySkeleton.tsx     ← Masonry rectangles không đều
│           ├── TimelineSkeleton.tsx    ← Timeline dots + lines
│           └── skeletons.module.scss   ← @keyframes skeleton animations
│
├── app/(nguoi-dung)/
│   ├── page.tsx                       ← [MODIFY] Switch template + pass engines
│   ├── _templates/                    ← [NEW] Page-level template components
│   │   ├── homepage-default.tsx       ← Hero → Promo → Work → Products → Counter → About
│   │   ├── homepage-compact.tsx       ← Hero → Products → Counter → About
│   │   └── homepage-cinematic.tsx     ← Hero (full) → Work (carousel) → Products → Counter → About
│   ├── khoa-hoc/
│   │   ├── page.tsx                   ← [MODIFY] Switch courses template + pass engine
│   │   └── _templates/
│   │       ├── courses-default.tsx    ← Hero → Courses → Brand → FAQ
│   │       ├── courses-minimal.tsx    ← Hero → Courses → FAQ
│   │       └── courses-full.tsx       ← Hero → Trust → Courses → Brand → FAQ → CTA
│   ├── san-pham/
│   │   ├── page.tsx                   ← [MODIFY] Switch portfolio template + pass engine
│   │   └── _templates/
│   │       ├── portfolio-default.tsx  ← PageHeader → Portfolios → CTA
│   │       ├── portfolio-categorized.tsx ← PageHeader → CategoryFilter → Portfolios → CTA
│   │       └── portfolio-showcase.tsx ← PageHeader → Featured → Portfolios → CTA
│   └── cong-cu/
│       ├── page.tsx                   ← [MODIFY] Switch presets template + pass engine
│       └── _templates/
│           ├── presets-default.tsx    ← Hero → Products
│           └── presets-featured.tsx   ← Hero → Featured → Products (grid nhỏ)
│
└── app/quan-tri-vien/cai-dat/
    ├── field-defs.ts                  ← [MODIFY] Thêm section "design" + keys
    └── page.tsx                       ← [MODIFY] Render LayoutWizard cho design section
```

---

## 2. Implementation Steps (theo thứ tự code)

### Step 1: `lib/layout-engine.ts` — Engine Resolver + Template Registry

File này là core logic, định nghĩa tất cả registry và type. Không import component — chỉ export type và registry object.

```typescript
// lib/layout-engine.ts

// ── Type definitions ──

export type HomepageTemplateId = "default" | "compact" | "cinematic";
export type CoursesTemplateId = "default" | "minimal" | "full";
export type PortfolioTemplateId = "default" | "categorized" | "showcase";
export type PresetsTemplateId = "default" | "featured";

export type CourseEngineId =
  | "grid" | "list" | "carousel" | "hero-grid"
  | "cards-stagger" | "masonry" | "compact";

export type PortfolioEngineId =
  | "stacked" | "masonry" | "timeline"
  | "grid-2col" | "filmstrip" | "fullwidth";

export type ProductEngineId = "grid" | "masonry" | "single-col";

export interface PageEngines {
  courses: CourseEngineId;
  portfolios: PortfolioEngineId;
  products: ProductEngineId;
}

export interface ListEngine {
  list: CourseEngineId | PortfolioEngineId | ProductEngineId;
}

// ── Template metadata (dùng cho wizard skeleton) ──

export interface TemplateMeta {
  id: string;
  label: string;
  description: string;
  sections: Array<{
    type: "hero" | "promo" | "courses" | "portfolios" | "products" | "counter" | "about" | "brand" | "faq" | "cta" | "header" | "filter" | "featured";
    label: string;
    contentType?: "courses" | "portfolios" | "products";
  }>;
  contentTypes: Array<"courses" | "portfolios" | "products">;
}

export const HOMEPAGE_TEMPLATE_META: Record<HomepageTemplateId, TemplateMeta> = {
  default: {
    id: "default", label: "Mặc định", description: "Đầy đủ sections",
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
    id: "compact", label: "Tối giản", description: "Bỏ Work & PromotionBanner",
    sections: [
      { type: "hero", label: "Banner" },
      { type: "products", label: "Sản phẩm", contentType: "products" },
      { type: "counter", label: "Số liệu" },
      { type: "about", label: "Giới thiệu" },
    ],
    contentTypes: ["products"],
  },
  cinematic: {
    id: "cinematic", label: "Điện ảnh", description: "Full-screen hero + carousel",
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

// Tương tự cho COURSES_TEMPLATE_META, PORTFOLIO_TEMPLATE_META, PRESETS_TEMPLATE_META

// ── Engine metadata (dùng cho dropdown) ──

export interface EngineMeta {
  id: string;
  label: string;
  preview: "grid" | "list" | "carousel" | "masonry" | "timeline" | "stacked" | "fullwidth";
}

export const COURSE_ENGINE_META: Record<CourseEngineId, EngineMeta> = {
  grid:       { id: "grid", label: "Lưới", preview: "grid" },
  list:       { id: "list", label: "Danh sách", preview: "list" },
  carousel:   { id: "carousel", label: "Băng chuyền", preview: "carousel" },
  "hero-grid":{ id: "hero-grid", label: "Hero + Lưới", preview: "grid" },
  "cards-stagger": { id: "cards-stagger", label: "Cards động", preview: "grid" },
  masonry:    { id: "masonry", label: "Masonry", preview: "masonry" },
  compact:    { id: "compact", label: "Nhỏ gọn", preview: "grid" },
};

export const PORTFOLIO_ENGINE_META: Record<PortfolioEngineId, EngineMeta> = {
  stacked:  { id: "stacked", label: "Xen kẽ", preview: "stacked" },
  masonry:  { id: "masonry", label: "Masonry", preview: "masonry" },
  timeline: { id: "timeline", label: "Timeline", preview: "timeline" },
  "grid-2col": { id: "grid-2col", label: "Grid 2 cột", preview: "grid" },
  filmstrip: { id: "filmstrip", label: "Film cuộn", preview: "carousel" },
  fullwidth: { id: "fullwidth", label: "Full-width", preview: "fullwidth" },
};

export const PRODUCT_ENGINE_META: Record<ProductEngineId, EngineMeta> = {
  grid:       { id: "grid", label: "Lưới", preview: "grid" },
  masonry:    { id: "masonry", label: "Masonry", preview: "masonry" },
  "single-col": { id: "single-col", label: "1 cột", preview: "list" },
};

// ── Default fallbacks ──

export const DEFAULT_HOMEPAGE_ENGINES: PageEngines = {
  courses: "grid",
  portfolios: "stacked",
  products: "grid",
};

export function getPageEngines(settings: Record<string, string>, prefix: string): PageEngines {
  return {
    courses: (settings[`${prefix}_courses_engine`] as CourseEngineId) || DEFAULT_HOMEPAGE_ENGINES.courses,
    portfolios: (settings[`${prefix}_portfolios_engine`] as PortfolioEngineId) || DEFAULT_HOMEPAGE_ENGINES.portfolios,
    products: (settings[`${prefix}_products_engine`] as ProductEngineId) || DEFAULT_HOMEPAGE_ENGINES.products,
  };
}
```

---

### Step 2: Engine Components

Mỗi engine là một component nhận `{ items: T[], settings: Record<string, string> }`. Engine reuse các card components hiện có, thay đổi cách bố trí.

**Pattern cơ bản:**

```typescript
// components/engines/courses/grid.tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./grid.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface CourseItem {
  id: string; slug: string; title: string;
  description: string; basePrice: number; thumbnailUrl?: string;
}

interface Props {
  items: CourseItem[];
  settings: Record<string, string>;
}

export function CoursesGrid({ items, settings }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll("[data-course-card]");
    gsap.fromTo(cards, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none none" },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={styles.grid}>
      {items.map((course) => (
        <a key={course.id} data-course-card href={`/khoa-hoc/${course.slug}`} className={styles.card}>
          {course.thumbnailUrl && <img src={course.thumbnailUrl} alt="" className={styles.thumb} loading="lazy" />}
          <div className={styles.info}>
            <h3 className={styles.title}>{course.title}</h3>
            <p className={styles.desc}>{course.description}</p>
            <span className={styles.price}>
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.basePrice)}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
```

**Carousel engine pattern:**

```typescript
// components/engines/courses/carousel.tsx
"use client";

import { useRef } from "react";
import styles from "./carousel.module.scss";

export function CoursesCarousel({ items, settings }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.carousel}>
      <div ref={trackRef} className={styles.track}>
        {items.map((course) => (
          <div key={course.id} className={styles.slide}>
            {/* Card content giống grid nhưng dạng horizontal */}
          </div>
        ))}
      </div>
      <button className={styles.prev} onClick={() => { /* scroll left */ }}>‹</button>
      <button className={styles.next} onClick={() => { /* scroll right */ }}>›</button>
    </div>
  );
}
```

**Các engine import:**

Engine portfolio `stacked.tsx` sẽ reuse logic từ `WorkSection` hiện tại. Engine portfolio `masonry.tsx` dùng CSS columns. Engine products `grid.tsx` reuse phần grid từ `ProductSection`.

---

### Step 3: Template Components

Mỗi template là một Server Component, nhận toàn bộ data và engines, render sections theo thứ tự cố định.

```typescript
// app/(nguoi-dung)/_templates/homepage-default.tsx
import type { HomepageTemplateId, PageEngines } from "@/lib/layout-engine";
import { AboutSection } from "@/components/sections/about-section";
import { AnimatedSection } from "@/components/sections/animated-section";
import { CounterSection } from "@/components/sections/counter-section";
import { HeroBanner } from "@/components/sections/hero-banner";
import { ProductSection } from "@/components/sections/product-section";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { WorkSection } from "@/components/sections/work-section";

interface TemplateProps {
  settings: Record<string, string>;
  portfolios: PortfolioItem[];
  courses: CourseItem[];
  products: ProductItem[];
  engines: PageEngines;
}

export function HomepageDefault({ settings, portfolios, courses, products }: TemplateProps) {
  return (
    <>
      <HeroBanner settings={settings} />
      <PromotionBanner />
      <WorkSection settings={settings} portfolios={portfolios} />
      <ProductSection settings={settings} courses={courses} products={products} />
      <AnimatedSection>
        <div className="reveal-item"><CounterSection settings={settings} /></div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="reveal-item"><AboutSection settings={settings} /></div>
      </AnimatedSection>
    </>
  );
}
```

```typescript
// app/(nguoi-dung)/_templates/homepage-compact.tsx
export function HomepageCompact({ settings, courses, products }: TemplateProps) {
  return (
    <>
      <HeroBanner settings={settings} />
      <ProductSection settings={settings} courses={courses} products={products} />
      <AnimatedSection>
        <div className="reveal-item"><CounterSection settings={settings} /></div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="reveal-item"><AboutSection settings={settings} /></div>
      </AnimatedSection>
    </>
  );
}
```

**Courses page template:**

```typescript
// app/(nguoi-dung)/khoa-hoc/_templates/courses-default.tsx
import { resolveCourseEngine } from "@/lib/layout-engine";
import type { ListEngine } from "@/lib/layout-engine";

export function CoursesDefault({ settings, courses, engine }: { settings: Record<string, string>; courses: CourseItem[]; engine: ListEngine }) {
  const Engine = resolveCourseEngine(engine.list);

  return (
    <>
      <CoursesHero settings={settings} />
      <section className="courses-list-section">
        <h2>{settings.courses_page_hero_title || "Khóa học"}</h2>
        <Engine items={courses} settings={settings} />
      </section>
      <BrandLogosSection settings={settings} />
      <FaqAccordionSection settings={settings} faqs={faqs} />
    </>
  );
}
```

---

### Step 4: Update page.tsx Files — Switch Template + Pass Engines

**Homepage:**

```typescript
// app/(nguoi-dung)/page.tsx
import { HomepageDefault } from "./_templates/homepage-default";
import { HomepageCompact } from "./_templates/homepage-compact";
import { HomepageCinematic } from "./_templates/homepage-cinematic";
import { getPageEngines, type HomepageTemplateId } from "@/lib/layout-engine";
import { getSiteSettings } from "@/lib/settings";
import { api } from "@/lib/api";

const HOMEPAGE_TEMPLATES: Record<HomepageTemplateId, React.ComponentType<TemplateProps>> = {
  default: HomepageDefault,
  compact: HomepageCompact,
  cinematic: HomepageCinematic,
};

export default async function Homepage() {
  const [settings, portfolios, courses, products] = await Promise.all([
    getSiteSettings(),
    fetchFeaturedPortfolios(),
    fetchFeaturedCourses(),
    fetchFeaturedProducts(),
  ]);

  const templateId = (settings.homepage_template || "default") as HomepageTemplateId;
  const Template = HOMEPAGE_TEMPLATES[templateId] ?? HomepageDefault;
  const engines = getPageEngines(settings, "homepage");

  return (
    <Template settings={settings} portfolios={portfolios} courses={courses} products={products} engines={engines} />
  );
}
```

**Courses page:**

```typescript
// app/(nguoi-dung)/khoa-hoc/page.tsx
const COURSES_TEMPLATES = {
  default: CoursesDefault,
  minimal: CoursesMinimal,
  full: CoursesFull,
} as const;

export default async function CoursesPage() {
  const [settings, courses] = await Promise.all([getSiteSettings(), fetchCourses()]);
  const templateId = (settings.courses_template || "default") as CoursesTemplateId;
  const Template = COURSES_TEMPLATES[templateId] ?? CoursesDefault;
  const engine = { list: (settings.courses_list_engine || "grid") as CourseEngineId };

  return <Template settings={settings} courses={courses} engine={engine} />;
}
```

Pattern tương tự cho `san-pham/page.tsx` (portfolio) và `cong-cu/page.tsx` (presets).

---

### Step 5: Skeleton Components

**PageSkeleton** — Wireframe toàn page với scale và scroll:

```typescript
// components/admin/layout-wizard/skeletons/PageSkeleton.tsx
"use client";

import type { TemplateMeta } from "@/lib/layout-engine";
import { SectionSkeleton } from "./SectionSkeleton";
import styles from "./skeletons.module.scss";

interface Props {
  template: TemplateMeta;
  engines?: Record<string, string>;
}

export function PageSkeleton({ template, engines = {} }: Props) {
  return (
    <div className={styles.pageSkeleton}>
      {template.sections.map((section, i) => (
        <SectionSkeleton
          key={`${section.type}-${i}`}
          type={section.type}
          engine={section.contentType ? engines[section.contentType] : undefined}
          label={section.label}
        />
      ))}
    </div>
  );
}
```

**SectionSkeleton** — Per-section type dispatcher:

```typescript
// components/admin/layout-wizard/skeletons/SectionSkeleton.tsx
import { CarouselSkeleton } from "./CarouselSkeleton";
import { GridSkeleton } from "./GridSkeleton";
import { ListSkeleton } from "./ListSkeleton";
import { MasonrySkeleton } from "./MasonrySkeleton";
import { TimelineSkeleton } from "./TimelineSkeleton";
import styles from "./skeletons.module.scss";

interface Props {
  type: string;
  engine?: string;
  label: string;
}

export function SectionSkeleton({ type, engine, label }: Props) {
  return (
    <div className={styles.sectionSkeleton}>
      <span className={styles.sectionLabel}>{label}</span>
      {type === "hero" && <div className={styles.heroBlock} />}
      {type === "promo" && <div className={styles.promoBlock} />}
      {type === "counter" && <GridSkeleton columns={4} rows={1} height={40} />}
      {type === "about" && (
        <div className={styles.aboutBlock}>
          <div className={styles.aboutLine} style={{ width: "70%" }} />
          <div className={styles.aboutLine} style={{ width: "90%" }} />
          <div className={styles.aboutLine} style={{ width: "60%" }} />
        </div>
      )}
      {type === "courses" && renderEngineSkeleton(engine, "courses")}
      {type === "portfolios" && renderEngineSkeleton(engine, "portfolios")}
      {type === "products" && renderEngineSkeleton(engine, "products")}
      {type === "brand" && <GridSkeleton columns={4} rows={1} height={28} />}
      {type === "faq" && <ListSkeleton count={3} />}
      {type === "cta" && <div className={styles.ctaBlock} />}
    </div>
  );
}

function renderEngineSkeleton(engine: string | undefined, contentType: string) {
  switch (engine) {
    case "carousel":
    case "filmstrip":
      return <CarouselSkeleton />;
    case "list":
    case "single-col":
      return <ListSkeleton count={4} />;
    case "masonry":
      return <MasonrySkeleton />;
    case "timeline":
      return <TimelineSkeleton />;
    case "stacked":
      return <ListSkeleton count={2} wide />;
    default:
      return <GridSkeleton columns={contentType === "products" ? 2 : 3} rows={2} />;
  }
}
```

**CarouselSkeleton** — CSS animation translateX:

```typescript
// components/admin/layout-wizard/skeletons/CarouselSkeleton.tsx
import styles from "./skeletons.module.scss";

export function CarouselSkeleton() {
  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.carouselTrack}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.carouselCard}>
            <div className={styles.cardThumb} />
            <div className={styles.cardLine1} />
            <div className={styles.cardLine2} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**CSS animations:**

```scss
// skeletons.module.scss

@keyframes skeleton-carousel {
  0%, 100% { transform: translateX(0); }
  35% { transform: translateX(-40%); }
  65% { transform: translateX(-40%); }
}

@keyframes skeleton-stagger {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

.pageSkeleton {
  width: 100%;
  max-width: 280px;
  padding: 8px;
  border: 1px dashed var(--admin-border, #e5e7eb);
  border-radius: 8px;
  background: var(--admin-bg-secondary, #f9fafb);
  overflow: hidden;
}

.sectionSkeleton {
  padding: 6px 0;
  border-bottom: 1px solid var(--admin-border-subtle, #f3f4f6);

  &:last-child { border-bottom: none; }
}

.sectionLabel {
  font-size: 9px;
  color: var(--admin-text-tertiary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.heroBlock {
  height: 40px;
  background: var(--admin-skeleton, #e5e7eb);
  border-radius: 4px;
  opacity: 0.5;
}

.promoBlock {
  height: 16px;
  background: repeating-linear-gradient(
    45deg, transparent, transparent 4px,
    var(--admin-skeleton, #e5e7eb) 4px, var(--admin-skeleton, #e5e7eb) 8px
  );
  border-radius: 2px;
  opacity: 0.4;
}

.carouselWrapper {
  overflow: hidden;
  width: 100%;
}

.carouselTrack {
  display: flex;
  gap: 6px;
  animation: skeleton-carousel 4s ease-in-out infinite;
  width: max-content;
  padding: 4px 0;
}

.carouselCard {
  flex-shrink: 0;
  width: 90px;
  background: var(--admin-bg-card, #fff);
  border-radius: 4px;
  padding: 6px;
  border: 1px solid var(--admin-border, #e5e7eb);
}

.cardThumb {
  height: 30px;
  background: var(--admin-skeleton, #e5e7eb);
  border-radius: 2px;
  margin-bottom: 4px;
}

.cardLine1 {
  height: 6px;
  width: 70%;
  background: var(--admin-skeleton, #e5e7eb);
  border-radius: 2px;
  margin-bottom: 3px;
}

.cardLine2 {
  height: 4px;
  width: 50%;
  background: var(--admin-skeleton-light, #f3f4f6);
  border-radius: 2px;
}

.aboutBlock {
  padding: 4px 0;
}

.aboutLine {
  height: 6px;
  background: var(--admin-skeleton, #e5e7eb);
  border-radius: 2px;
  margin-bottom: 4px;

  &:last-child { margin-bottom: 0; }
}

.ctaBlock {
  height: 22px;
  background: var(--admin-accent-light, #dbeafe);
  border-radius: 4px;
  opacity: 0.6;
}
```

---

### Step 6: LayoutWizard — Admin UI Component

```typescript
// components/admin/layout-wizard/LayoutWizard.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { TemplateSelector } from "./TemplateSelector";
import { EngineSelector } from "./EngineSelector";
import { StepActions } from "./StepActions";
import {
  HOMEPAGE_TEMPLATE_META, COURSES_TEMPLATE_META,
  PORTFOLIO_TEMPLATE_META, PRESETS_TEMPLATE_META,
  type TemplateMeta, type HomepageTemplateId,
} from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

const PAGE_CONFIGS: Record<string, {
  label: string;
  templateMeta: Record<string, TemplateMeta>;
  templateKey: string;
  engineKeys: Record<string, string>;
  previewPath: string;
}> = {
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
    engineKeys: { list: "courses_list_engine" },
    previewPath: "/khoa-hoc",
  },
  portfolio: {
    label: "Dự án",
    templateMeta: PORTFOLIO_TEMPLATE_META,
    templateKey: "portfolio_template",
    engineKeys: { list: "portfolio_list_engine" },
    previewPath: "/san-pham",
  },
  presets: {
    label: "Công cụ",
    templateMeta: PRESETS_TEMPLATE_META,
    templateKey: "presets_template",
    engineKeys: { list: "presets_list_engine" },
    previewPath: "/cong-cu",
  },
};

type PageId = keyof typeof PAGE_CONFIGS;

interface Props {
  page: PageId;
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: () => Promise<void>;
  onPreviewReload: () => void;
}

export function LayoutWizard({ page, settings, onChange, onSave, onPreviewReload }: Props) {
  const [step, setStep] = useState(1);
  const config = PAGE_CONFIGS[page];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const templateId = (settings[config.templateKey] || "default") as string;
  const template = config.templateMeta[templateId] ?? Object.values(config.templateMeta)[0];

  const currentEngines: Record<string, string> = {};
  for (const [ct, key] of Object.entries(config.engineKeys)) {
    currentEngines[ct] = settings[key] || "grid";
  }

  const handleTemplateChange = useCallback((id: string) => {
    onChange(config.templateKey, id);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(onPreviewReload, 500);
  }, [config.templateKey, onChange, onPreviewReload]);

  const handleEngineChange = useCallback((contentType: string, engineId: string) => {
    const key = config.engineKeys[contentType];
    if (key) onChange(key, engineId);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(onPreviewReload, 500);
  }, [config.engineKeys, onChange, onPreviewReload]);

  return (
    <div className={styles.wizard}>
      <div className={styles.wizardHeader}>
        <span className={styles.wizardTitle}>Bố cục: {config.label}</span>
        <div className={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <span key={s} className={`${styles.stepDot} ${s === step ? styles.active : ""} ${s < step ? styles.done : ""}`} />
          ))}
        </div>
      </div>

      <div className={styles.wizardBody}>
        {step === 1 && (
          <TemplateSelector
            templates={config.templateMeta}
            value={templateId}
            engines={currentEngines}
            onChange={handleTemplateChange}
          />
        )}
        {step === 2 && (
          <EngineSelector
            contentTypeEngines={template.contentTypes}
            values={currentEngines}
            onChange={handleEngineChange}
          />
        )}
        {step === 3 && (
          <StepActions
            template={template}
            engines={currentEngines}
            page={page}
            onSave={onSave}
          />
        )}
      </div>

      <div className={styles.wizardNav}>
        {step > 1 && (
          <button className={styles.navBack} onClick={() => setStep((s) => s - 1)}>
            ← Quay lại
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < 3 && (
          <button className={styles.navNext} onClick={() => setStep((s) => s + 1)}>
            Tiếp theo →
          </button>
        )}
      </div>
    </div>
  );
}
```

**TemplateSelector — Step 1:**

```typescript
// components/admin/layout-wizard/TemplateSelector.tsx
"use client";

import { PageSkeleton } from "./skeletons/PageSkeleton";
import type { TemplateMeta } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

interface Props {
  templates: Record<string, TemplateMeta>;
  value: string;
  engines: Record<string, string>;
  onChange: (id: string) => void;
}

export function TemplateSelector({ templates, value, engines, onChange }: Props) {
  const list = Object.values(templates);

  return (
    <div>
      <p className={styles.stepTitle}>Bước 1: Chọn bố cục trang</p>
      <div className={styles.templateGrid}>
        {list.map((t) => (
          <button
            key={t.id}
            className={`${styles.templateCard} ${value === t.id ? styles.templateActive : ""}`}
            onClick={() => onChange(t.id)}
          >
            <PageSkeleton template={t} engines={engines} />
            <span className={styles.templateName}>{t.label}</span>
            <span className={styles.templateDesc}>{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**EngineSelector — Step 2:**

```typescript
// components/admin/layout-wizard/EngineSelector.tsx
"use client";

import {
  COURSE_ENGINE_META, PORTFOLIO_ENGINE_META, PRODUCT_ENGINE_META,
  type CourseEngineId, type PortfolioEngineId, type ProductEngineId,
} from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

interface Props {
  contentTypeEngines: Array<"courses" | "portfolios" | "products">;
  values: Record<string, string>;
  onChange: (contentType: string, engineId: string) => void;
}

const ENGINE_REGISTRY = {
  courses: COURSE_ENGINE_META,
  portfolios: PORTFOLIO_ENGINE_META,
  products: PRODUCT_ENGINE_META,
} as const;

const CONTENT_LABELS = {
  courses: "Khóa học",
  portfolios: "Dự án",
  products: "Công cụ",
} as const;

const ENGINE_DEFAULTS: Record<string, string> = {
  courses: "grid",
  portfolios: "stacked",
  products: "grid",
};

export function EngineSelector({ contentTypeEngines, values, onChange }: Props) {
  return (
    <div>
      <p className={styles.stepTitle}>Bước 2: Kiểu hiển thị nội dung</p>
      {contentTypeEngines.map((ct) => {
        const meta = ENGINE_REGISTRY[ct];
        const current = values[ct] || ENGINE_DEFAULTS[ct] || "grid";

        return (
          <div key={ct} className={styles.engineRow}>
            <label className={styles.engineLabel}>{CONTENT_LABELS[ct]}</label>
            <select
              className={styles.engineSelect}
              value={current}
              onChange={(e) => onChange(ct, e.target.value)}
            >
              {Object.values(meta).map((eng) => (
                <option key={eng.id} value={eng.id}>{eng.label}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
```

**StepActions — Step 3:**

```typescript
// components/admin/layout-wizard/StepActions.tsx
"use client";

import { useState } from "react";
import type { TemplateMeta } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

interface Props {
  template: TemplateMeta;
  engines: Record<string, string>;
  page: string;
  onSave: () => Promise<void>;
}

export function StepActions({ template, engines, page, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className={styles.stepTitle}>Bước 3: Xem trước & Lưu</p>
      <div className={styles.summary}>
        <p>Bố cục: <strong>{template.label}</strong></p>
        {Object.entries(engines).map(([ct, eng]) => (
          <p key={ct}>Kiểu {ct}: <strong>{eng}</strong></p>
        ))}
      </div>
      <p className={styles.previewHint}>
        Bản xem trước bên phải đã được cập nhật. Nhấn <strong>Lưu</strong> để áp dụng.
      </p>
      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Đang lưu..." : done ? "Đã lưu!" : "Lưu thay đổi"}
      </button>
    </div>
  );
}
```

---

### Step 7: Update field-defs.ts — Thêm Design Section

```typescript
// Thêm vào cuối SECTIONS array trong field-defs.ts
{
  id: "design",
  title: "Giao diện",
  description: "Chọn bố cục trang và kiểu hiển thị nội dung.",
  previewPath: "/",
  fields: [
    { key: "homepage_template",      label: "Trang chủ — Template",     type: "layout-template", placeholder: "homepage" },
    { key: "homepage_courses_engine",   label: "", type: "hidden" },
    { key: "homepage_portfolios_engine", label: "", type: "hidden" },
    { key: "homepage_products_engine",  label: "", type: "hidden" },
    { key: "courses_template",       label: "Khóa học — Template",      type: "layout-template", placeholder: "courses" },
    { key: "courses_list_engine",    label: "", type: "hidden" },
    { key: "portfolio_template",     label: "Dự án — Template",         type: "layout-template", placeholder: "portfolio" },
    { key: "portfolio_list_engine",  label: "", type: "hidden" },
    { key: "presets_template",       label: "Công cụ — Template",       type: "layout-template", placeholder: "presets" },
    { key: "presets_list_engine",    label: "", type: "hidden" },
  ],
},
```

Các key có `type: "hidden"` được quản lý bởi LayoutWizard (không render input riêng). `type: "layout-template"` dùng làm trigger để render LayoutWizard.

---

### Step 8: Update cai-dat/page.tsx — Render LayoutWizard

Trong render loop hiện tại của `page.tsx`, thêm branch cho section có `id === "design"`:

```typescript
// Trong render của SettingsPage, thay vì render fields:
{isOpen && (
  <div className={styles.sectionBody}>
    {section.id === "design" ? (
      <LayoutWizard
        key={section.id}
        page="homepage"
        settings={formData}
        onChange={(key, value) => handleChange(key, value)}
        onSave={async () => {
          const designKeys = section.fields.map((f) => f.key);
          const batch: Record<string, string> = {};
          for (const key of designKeys) {
            if (formData[key]) batch[key] = formData[key];
          }
          // Gọi API batch save
          await api.put("/api/settings/batch", batch);
          setSettings({ ...formData });
          writePreviewCookie({});
          setPreviewLoading(true);
          setPreviewKey((k) => k + 1);
          setSuccess("Đã lưu giao diện");
          setTimeout(() => setSuccess(""), 3000);
        }}
        onPreviewReload={reloadPreview}
      />
    ) : (
      <>
        {/* Render fields như hiện tại */}
        {section.fields.map((field) => ( ... ))}
        {section.subSections?.map((sub) => ( ... ))}
      </>
    )}
  </div>
)}
```

**Lưu ý:** Phải import `LayoutWizard` từ `@/components/admin/layout-wizard/LayoutWizard`.

---

## 3. Data Flow Minh Họa

```
┌──────────────────────┐     cookie preview_settings     ┌─────────────────────┐
│  Admin /cai-dat      │ ──────────────────────────────> │  iframe (user page) │
│                      │                                  │                     │
│  LayoutWizard        │                                  │  page.tsx (SSR)     │
│    ↓ template change │                                  │    ↓                │
│    writeCookie()     │                                  │  getSiteSettings()  │
│    reloadIframe()    │                                  │    ↓                │
│                      │                                  │  resolve template   │
│  PUT /api/settings   │ ─── save batch ───────────────> │  resolve engines    │
│  /batch              │                                  │    ↓                │
│                      │                                  │  render Template    │
└──────────────────────┘                                  └─────────────────────┘
```

Cookie flow: `LayoutWizard.onChange(key, value)` → `handleChange(key, value)` trong page.tsx → `writePreviewCookie(changed)` → `reloadPreview()` → iframe SSR đọc `preview_settings` cookie trong `settings.ts` → merge với DB settings → render page với template/engine mới.

Save flow: `StepActions.onSave()` → `PUT /api/settings/batch` → `setSettings(formData)` → `writePreviewCookie({})` (xóa cookie) → `reloadPreview()` → iframe lấy data từ DB mới.

---

## 4. Pattern: Engine Component Template

```typescript
// Template cho mọi engine component
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./xxx.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  items: T[];
  settings: Record<string, string>;
}

export function EngineName({ items, settings }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current || items.length === 0) return;
    // Animate cards với stagger nếu là grid
    const cards = ref.current.querySelectorAll("[data-card]");
    gsap.fromTo(cards, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
    });
  }, { scope: ref });

  if (items.length === 0) return null;

  return <div ref={ref} className={styles.engine}>{/* layout */}</div>;
}
```

---

## 5. Các edge case cần xử lý

| Case | Xử lý |
|------|-------|
| Items rỗng | Engine trả về `null` (không render section) |
| Engine ID không tồn tại | Resolver fallback về default (grid/stacked) |
| Template ID không tồn tại | page.tsx fallback về `default` |
| Cookie quá lớn | `buildPreviewCookie()` đã có truncation 3800 bytes |
| Template không có content type đó | EngineSelector chỉ hiện các contentType từ template |
| Admin bấm save khi chưa có thay đổi | StepActions có thể thêm check dirty |
| Preview iframe lỗi | `onError` handler trên iframe |

---

## 6. Dependency Graph

```
layout-engine.ts          ← Không import component, chỉ type + registry
    ↓
Engine components         ← Import từ layout-engine (type), reuse section components
    ↓
Template components       ← Import engine components + section components
    ↓
page.tsx files            ← Import template components + layout-engine
    ↓
LayoutWizard              ← Import skeleton components + layout-engine
    ↓
cai-dat/page.tsx          ← Import LayoutWizard
cai-dat/field-defs.ts     ← Thêm section design (chỉ thêm data, không import)
```

---

## 7. Checklist Trước Khi Code

- [ ] `lib/layout-engine.ts` — type + registry + meta (không import component)
- [ ] 7 course engine components — grid, list, carousel, hero-grid, cards-stagger, masonry, compact
- [ ] 6 portfolio engine components — stacked, masonry, timeline, grid-2col, filmstrip, fullwidth
- [ ] 3 product engine components — grid, masonry, single-col
- [ ] 3 homepage template components — default, compact, cinematic
- [ ] 3 courses template components — default, minimal, full
- [ ] 3 portfolio template components — default, categorized, showcase
- [ ] 2 presets template components — default, featured
- [ ] Skeleton system — Page, Section, Carousel, Grid, List, Masonry, Timeline
- [ ] LayoutWizard — TemplateSelector, EngineSelector, StepActions
- [ ] `field-defs.ts` — thêm section `design`
- [ ] `cai-dat/page.tsx` — render LayoutWizard cho design section
- [ ] `(nguoi-dung)/page.tsx` — switch template + engines
- [ ] `khoa-hoc/page.tsx` — switch template + engine
- [ ] `san-pham/page.tsx` — switch template + engine
- [ ] `cong-cu/page.tsx` — switch template + engine

---

## Tham chiếu

- `spec-design-multi-layout-system.md` — Spec gốc
- `apps/web/src/lib/settings.ts` — Cookie preview mechanism
- `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` — Settings page pattern
- `apps/web/src/components/admin/page-builder/SectionSkeletonPreview.tsx` — SVG skeleton pattern
