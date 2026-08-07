# Spec: Page Builder & Section-based Architecture

**Status**: Spec
**Date**: 2026-08-03
**Version**: 2.0.0
**Scope**: Khóa học (list + detail), Sản phẩm (list + detail), Presets & LUTs (trang đơn)

---

## 1. Problem Statement

Content chi tiết của course và product đang hardcode vào schema:
- `courses` → `course_modules` → `course_lessons` (cứng)
- `digital_products` → `product_showcases` (cứng)

Dẫn đến: không tái sử dụng được layout, muốn đổi page phải sửa code.

**Giải pháp**: Section Builder — mỗi entity detail page được xây từ danh sách sections có thể reorder, enable/disable, configure. Riêng Presets & LUTs là 1 trang đơn với section builder riêng.

---

## 2. Scope & Page Mapping

| Page | URL Pattern | Type | Section Builder? |
|------|------------|------|-----------------|
| Danh sách khóa học | `/khoa-hoc` | List | No (card grid, fetch meta) |
| Chi tiết khóa học | `/khoa-hoc/[slug]` | Detail | **Yes** |
| Danh sách sản phẩm | `/san-pham` | List | No (card grid, fetch meta) |
| Chi tiết sản phẩm | `/san-pham/[id]` | Detail | **Yes** |
| Presets & LUTs | `/presets-luts` | Standalone | **Yes** (single page, no list) |

---

## 3. Section Catalog (filtered by scope)

### 🎯 Hero & Announcement

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 1 | `hero_banner` | All | heading, subtitle, background_media_id, cta_text, cta_url, height |
| 2 | `announcement_bar` | Course | text, bg_color, show_countdown, countdown_end, cta_text, cta_url |

### 📊 Social Proof & Credibility

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 3 | `benefits_grid` | Course | items: [{icon, title, subtitle}] — max 6 |
| 4 | `brand_logos` | Course | logos: [{media_id, alt}] — carousel |
| 5 | `stats_counter` | All | items: [{label, value, suffix}] |
| 6 | `student_counter` | Course | title, count, subtitle |
| 7 | `guarantee_section` | All | icon, title, description |

### 📚 Content & Learning (Course only)

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 8 | `curriculum_grid` | Course | auto_fetch (bool) or modules: [{title, lessons: [{title, duration}]}] |
| 9 | `lesson_count` | Course | count, label, icon |
| 10 | `bonus_gift_grid` | Course | items: [{name, value, description, icon}] |

### 🎬 Media

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 11 | `video_showcase` | All | videos: [{youtube_id, title, thumbnail_media_id}] |
| 12 | `before_after_slider` | Product, Presets | pairs: [{before_media_id, after_media_id, label}] |
| 13 | `image_gallery` | All | images: [{media_id, caption}], columns, lightbox |

### 💬 Testimonials & Community (Course only)

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 14 | `testimonials_carousel` | All | auto_fetch (bool) or items: [{name, role, avatar_media_id, content, rating}] |
| 15 | `featured_students` | Course | students: [{name, title, avatar_media_id, description}] |
| 16 | `community_proof` | Course | images: [{media_id}], caption |

### 📝 Content Copy

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 17 | `instructor_story` | Course | heading, content_blocks (BlockEditor), signature |
| 18 | `rich_content` | All | blocks: Block[] (22 block types) |

### 🔄 Conversion

| # | Type | Scope | Key Config |
|---|------|-------|-----------|
| 19 | `cta_section` | All | heading, text, button_text, button_url, background_media_id, button_style |
| 20 | `faq_accordion` | All | auto_fetch (bool) or items: [{question, answer}] |
| 21 | `pricing_comparison` | Course, Product | plans: [{name, price, period, features[], cta_text, cta_url, highlighted}] |
| 22 | `product_grid` | Presets | show_all (bool) or product_ids: [{id}] — render ProductCards |

---

## 4. Database Design

### 4.1 New Table: `sections`

```sql
CREATE TABLE sections (
  id            TEXT PRIMARY KEY DEFAULT (uuid()),
  entity_type   TEXT NOT NULL,  -- 'course' | 'product' | 'presets_page'
  entity_id     TEXT NOT NULL,  -- course_id/product_id, hoặc 'singleton' cho presets
  section_type  TEXT NOT NULL,
  title         TEXT,
  config        TEXT NOT NULL,  -- JSON
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_published  INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sections_entity ON sections(entity_type, entity_id, sort_order);
```

Entity types:
- `course` — entity_id = courses.id
- `product` — entity_id = digital_products.id
- `presets_page` — entity_id = `"singleton"` (chỉ có 1 bản ghi duy nhất)

### 4.2 Promotions M2M (refactor)

```sql
CREATE TABLE promotions (
  id                  TEXT PRIMARY KEY DEFAULT (uuid()),
  campaign_name       TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  discount_amount     INTEGER,
  start_date          TEXT,
  end_date            TEXT,
  is_active           INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE promotion_courses (
  promotion_id TEXT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  course_id    TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, course_id)
);

-- future: promotion_products, promotion_presets
```

### 4.3 Columns to remove

| Table | Remove Column | Replaced By |
|-------|--------------|------------|
| `courses` | `content_blocks` | section `rich_content` |
| `courses` | `learning_outcomes` | section `curriculum_grid` |

Tables to keep: `course_modules`, `course_lessons`, `testimonials`, `faqs`, `instructors` — data source cho sections có `auto_fetch`.

---

## 5. API Design

### 5.1 Section CRUD

```
GET    /api/:entity_type/:entity_id/sections
POST   /api/:entity_type/:entity_id/sections
PUT    /api/:entity_type/:entity_id/sections/:id
DELETE /api/:entity_type/:entity_id/sections/:id
POST   /api/:entity_type/:entity_id/sections/reorder
```

Với presets_page: `GET /api/presets_page/singleton/sections`

### 5.2 Entity list vs detail

```
GET /api/courses              → Meta only (no sections) — card grid
GET /api/courses/:slug        → Meta + sections[]    — detail SSR
GET /api/products             → Meta only
GET /api/products/:id         → Meta + sections[]
GET /api/presets-page         → sections[] (singleton)
```

### 5.3 Detail response

```json
{
  "id": "...",
  "slug": "30-ngay-sang-tao-video-trieu-view",
  "title": "...",
  "price": 996000,
  "original_price": 3868000,
  "thumbnail_url": "...",
  "description": "...",
  "active_promotion": { "discount_percentage": 90, "campaign_name": "..." },
  "sections": [
    { "id": "...", "type": "hero_banner", "config": { ... }, "sort_order": 0 },
    { "id": "...", "type": "benefits_grid","config": { ... }, "sort_order": 1 }
  ]
}
```

---

## 6. Frontend Architecture

### 6.1 Section Registry

```typescript
// apps/web/src/components/sections/registry.ts
const SECTION_MAP: Record<string, SectionRenderer> = {
  hero_banner:           HeroBannerSection,
  announcement_bar:      AnnouncementBarSection,
  benefits_grid:         BenefitsGridSection,
  brand_logos:           BrandLogosSection,
  stats_counter:         StatsCounterSection,
  student_counter:       StudentCounterSection,
  guarantee_section:     GuaranteeSection,
  curriculum_grid:       CurriculumGridSection,
  lesson_count:          LessonCountSection,
  bonus_gift_grid:       BonusGiftGridSection,
  video_showcase:        VideoShowcaseSection,
  before_after_slider:   BeforeAfterSliderSection,
  image_gallery:         ImageGallerySection,
  testimonials_carousel: TestimonialsCarouselSection,
  featured_students:     FeaturedStudentsSection,
  community_proof:       CommunityProofSection,
  instructor_story:      InstructorStorySection,
  rich_content:          RichContentSection,
  cta_section:           CTASection,
  faq_accordion:         FAQAccordionSection,
  pricing_comparison:    PricingComparisonSection,
  product_grid:          ProductGridSection,
};

export function SectionRenderer({ sections, meta }: { sections: Section[]; meta: EntityMeta }) {
  return sections
    .filter(s => s.is_published)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(s => {
      const Comp = SECTION_MAP[s.type];
      return Comp ? <Comp key={s.id} config={s.config} entityMeta={meta} /> : null;
    });
}
```

### 6.2 Page Pattern

```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx
export default async function CourseDetail({ params }: Props) {
  const course = await api.fetchData(`/api/courses/${params.slug}`);
  return (
    <>
      <SectionRenderer sections={course.sections} meta={course} />
      <StickyPricingCTA course={course} />
    </>
  );
}

// apps/web/src/app/(nguoi-dung)/presets-luts/page.tsx
export default async function PresetsPage() {
  const data = await api.fetchData("/api/presets-page");
  return <SectionRenderer sections={data.sections} meta={data} />;
}
```

---

## 7. Admin UI

3 tab trong admin, mỗi tab có page builder:

| Tab | URL | Entity |
|-----|-----|--------|
| Khóa học | `/quan-tri-vien/khoa-hoc/[slug]` | Section builder cho course detail |
| Sản phẩm | `/quan-tri-vien/san-pham/[id]` | Section builder cho product detail |
| Presets & LUTs | `/quan-tri-vien/presets-luts` | Section builder cho presets page |

Mỗi tab: left panel = catalog section types có sẵn, right panel = live preview + drag-drop reorder + click-to-edit config. Dùng `@dnd-kit/core`.

---

## 8. Migration Plan

| Phase | Work | Days |
|-------|------|------|
| 1 | Schema: `sections` table + promotions M2M + Zod types | 1 |
| 2 | API: Section CRUD + update entity detail endpoints | 1-2 |
| 3 | Frontend: 22 section components + registry + page wiring | 2-3 |
| 4 | Admin: Page builder UI + dnd-kit reorder + config forms | 2-3 |
| 5 | Cleanup: remove old columns, migration script, test | 1 |

---

## 9. BDD Scenarios

```gherkin
Feature: Section builder cho khóa học

  Scenario: Admin thêm section mới
    Given Admin ở trang quản lý sections của khóa học "30 ngày TikTok"
    When Admin chọn section "benefits_grid" và điền 3 items
    And Admin nhấn "Lưu"
    Then Section hiển thị trên page chi tiết với đúng config

  Scenario: Admin reorder sections
    Given Khóa học có sections: [hero_banner, benefits_grid, faq_accordion]
    When Admin kéo faq_accordion lên trên benefits_grid
    Then Thứ tự render: [hero_banner, faq_accordion, benefits_grid]

Feature: Promotions M2M

  Scenario: Gán promotion cho nhiều khóa học
    Given Promotion "Flash Sale 50%" active
    When Admin gán vào 3 khóa học
    Then Cả 3 hiển thị giá giảm 50% + giá gốc strikethrough

  Scenario: Promotion hết hạn
    Given Promotion đã qua end_date
    When User xem khóa học
    Then Giá hiển thị giá gốc, không hiện giảm giá
```
