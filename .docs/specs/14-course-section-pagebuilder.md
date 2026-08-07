# Spec 14: Course Section PageBuilder System

**Status:** Draft
**Created:** 2026-08-06
**Updated:** 2026-08-06 (BDD review fixes applied)
**Ref:** `minhtravel-clone.html`, `minhtravel-lone-v1.html` (2 template tĩnh đã client duyệt)
**Replaces:** Old `sections.ts` 22-type generic system (bị xóa — quá cẩu thả)

---

## Feature Description

Admin sử dụng Full PageBuilder (drag-drop, reorder, toggle on/off) để quản lý nội dung từng section của course detail page. Hệ thống gồm **14 section types** được trích xuất từ 2 template tĩnh đã client duyệt. Section render components clone **chính xác 100%** visual của template (white theme, font Be Vietnam Pro + Manrope, color tokens clone).

### Nguyên tắc cốt lõi

- **White theme** — clone chính xác CSS từ template, không dùng dark theme
- **Inner content only** — section render components chỉ render nội dung bên trong, không bao header/footer/layout
- **2 phần của course:** Phần 1 = thông tin chính (tên, slug, price...) lưu trong `courses` table. Phần 2 = section content lưu trong `sections` table qua PageBuilder
- **Singleton:** 13/14 section types chỉ có 1 instance per course
- **Multi-instance:** `rich_text` cho phép add nhiều lần (VD: WHY ONLINE + WHY 1 YEAR)
- **Max 30 sections** per course
- **Order cố định:** Giữ thứ tự giống template (top → bottom)
- **HTML Sanitization:** Tất cả fields có nội dung HTML (`description_html`, `content_html`, `story_html`, `answer_html`) — khi render ra public page PHẢI qua `DOMPurify.sanitize()` để chống XSS. KHÔNG render raw HTML từ admin input trực tiếp.
- **GSAP Deferred:** Animation sẽ được thêm ở phase sau. Phase hiện tại chỉ render tĩnh.

---

## Section Types (14 types — extracted from clone templates)

### Group 1: Hero & Brand (2 sections)

#### S1 — `hero_banner` `[Singleton]`

```ts
{
  badge_text: string,              // "ƯU ĐÃI GIẢM GIÁ 90%"
  badge_subtitle: string,          // "TIẾT LỘ BÍ QUYẾT TẠO RA HÀNG LOẠT VIDEO TRIỆU VIEW"
  title: string,                   // H1 text
  subtitle: string,                // Full subtitle text
  subtitle_highlight: string,      // Phần text trong subtitle được bôi màu hồng: "chỉ với một chiếc điện thoại!"
  video_thumbnail_url: string,     // Media URL
  video_youtube_url: string,       // YouTube link
  cta_text: string,                // "ĐĂNG KÝ NGAY!"
  cta_url: string,                 // Checkout link
  note_text: string,               // "Đăng ký ngay trước khi mức giá khoá học tăng lên"
}
```

**Render logic:** `subtitle` text được hiển thị. Nếu `subtitle_highlight` không rỗng, tìm first exact match (case-sensitive) trong subtitle và wrap phần đó với `<span class="pink">`. Nếu không tìm thấy match → bỏ qua highlight.

#### S2 — `brand_logos` `[Singleton]`

```ts
{
  title: string,                   // "Một số thương hiệu tôi vinh dự được hợp tác"
  logos: { image_url: string; alt: string }[],
  trusted_badge_url: string,
  student_count_title: string,     // "Tham gia cùng 1000+ học viên trên toàn quốc"
}
```

### Group 2: Offer & Trust (2 sections)

#### S3 — `countdown_offer` `[Singleton]`

```ts
{
  title: string,                   // "Ưu đãi giới hạn đặc biệt"
  title_highlight: string,         // Text highlight màu hồng: "giới hạn"
  banner_url: string,
  current_price: number,           // 996000
  original_price: number,          // 15472000
  bonus_count: number,             // Số ưu đãi bổ sung: 5 (clone) | 4 (v1)
  cta_text: string,
  cta_url: string,
  countdown_seconds: number,       // 7140s (clone) | 10740s (v1)
}
```

**Render logic:** Tự động format `current_price` và `original_price` thành VND display string. Price block: `"Nhận ngay ${bonus_count} ưu đãi bổ sung hoàn toàn miễn phí. Tất cả khóa học chỉ với {current_price} (giá gốc {original_price})."` Hiển thị countdown timer client-side (setInterval), khi về 0 reset về giá trị ban đầu.

#### S4 — `trust_badges` `[Singleton]`

```ts
{
  items: { text: string }[],       // 3 items: checkmark SVG icon + uppercase text
}
```

### Group 3: Curriculum (2 sections)

#### S5 — `curriculum_highlights` `[Singleton]`

```ts
{
  section_title: string,
  section_subtitle: string,
  section_subtitle_highlight: string,  // Text highlight màu hồng: "kiến thức giá trị"
  items: {
    number: string,                // "#1", "#5", etc.
    title: string,
    description_html: string,      // Sanitized HTML
    image_url: string,
  }[],
}
```

#### S6 — `lesson_accordion` `[Singleton]`

```ts
{
  section_title: string,
  side_image_url: string,          // Optional left-side image
  chapters: {
    title: string,
    lessons: string[],             // Plain text list (safe — no HTML needed)
  }[],
}
```

### Group 4: Bonuses (1 section)

#### S7 — `bonus_gifts` `[Singleton]`

```ts
{
  section_title: string,
  items: {
    title: string,
    title_highlight?: string,      // Cam kết hoàn tiền 100% (wrapped in pink for item 05)
    description_html: string,      // Sanitized HTML
    image_url: string,
    strikethrough_price?: string,  // "3.868.000đ" — display-only string
  }[],
}
```

### Group 5: Content (1 section, Multi-instance)

#### S8 — `rich_text` `[Multi-instance]`

```ts
{
  title: string,
  content_html: string,            // Sanitized HTML
  background: "white" | "soft",
}
```

### Group 6: Social Proof (2 sections)

#### S9 — `testimonial_videos` `[Singleton]`

```ts
{
  section_title: string,
  videos: { youtube_url: string; title: string }[],
  carousel_title: string,
  carousel_images: { image_url: string }[],
}
```

#### S10 — `featured_students` `[Singleton]`

```ts
{
  section_title: string,
  students: {
    name: string;
    role?: string;
    avatar_url: string;
    stats: { label: string; value: string }[];
    description: string;           // Plain text (safe — not HTML)
  }[],
  carousel_title: string,          // "99+ FEEDBACK TẠI CỘNG ĐỒNG..."
  carousel_images: { image_url: string }[],
}
```

**Visual:** White bg, section title, 2-column student cards. Below: horizontal carousel of student feedback screenshots. Carousel giống hệt template V1 line 609-618.

### Group 7: Instructor (1 section)

#### S11 — `instructor_journey` `[Singleton]`

```ts
{
  portrait_url: string,
  title: string,
  stats: { value: string; label: string }[],
  story_html: string,              // Sanitized HTML with expandable accordion
  cta_text: string,
  cta_url: string,
  brand_strip: { image_url: string; alt: string }[],
  background: "white" | "soft",    // Clone: white, V1: soft
}
```

### Group 8: Sales (2 sections)

#### S12 — `sales_story` `[Singleton]`

```ts
{
  title: string,
  content_html: string,            // Sanitized HTML
  image_left_url: string,
  image_right_url: string,
  background: "white" | "soft",
}
```

#### S13 — `pricing_card` `[Singleton]`

```ts
{
  card_image_url: string,
  title: string,
  price_text: string,              // "996.000đ (1 năm)" — display string
  features: { text: string; bold: boolean }[],
  cta_text: string,
  cta_url: string,
}
```

### Group 9: FAQ (1 section)

#### S14 — `faq_accordion` `[Singleton]`

```ts
{
  title: string,
  items: { question: string; answer_html: string }[],  // answer_html: Sanitized HTML
}
```

---

## Singleton vs Multi-Instance Summary

| Type | Singleton | Notes |
|---|---|---|
| hero_banner | ✓ | |
| brand_logos | ✓ | |
| countdown_offer | ✓ | |
| trust_badges | ✓ | |
| curriculum_highlights | ✓ | |
| lesson_accordion | ✓ | |
| bonus_gifts | ✓ | |
| rich_text | ✗ | Multi-instance, bounded by MAX_SECTIONS=30 |
| testimonial_videos | ✓ | |
| featured_students | ✓ | |
| instructor_journey | ✓ | |
| sales_story | ✓ | |
| pricing_card | ✓ | |
| faq_accordion | ✓ | |

---

## HTML Sanitization

Tất cả fields có hậu tố `_html` (store rich text HTML từ admin) **PHẢI** được sanitize khi render qua `DOMPurify`:

```ts
import DOMPurify from "dompurify";

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "strong", "b", "em", "i", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}
```

Call site trong render components:

```tsx
<div dangerouslySetInnerHTML={{ __html: sanitize(config.story_html) }} />
```

Fields cần sanitize: `curriculum_highlights.items[].description_html`, `rich_text.content_html`, `instructor_journey.story_html`, `sales_story.content_html`, `faq_accordion.items[].answer_html`, `countdown_offer.price_html` (nếu dùng), `hero_banner.subtitle` (nếu chứa HTML inline).

Fields **không** cần sanitize (plain text): `lesson_accordion.chapters[].lessons[]`, `featured_students.students[].description`, tất cả `title`, `cta_text`, `note_text`.

---

## Design Token — White Theme (Clone CSS)

```scss
--font-primary: 'Be Vietnam Pro', 'Manrope', -apple-system, sans-serif;
--c-blue: #046bd2;
--c-blue-dark: #045cb4;
--c-dark: #1e293b;
--c-text: #334155;
--c-white: #ffffff;
--c-bg-soft: #f0f5fa;
--c-black: #111111;
--c-border: #d1d5db;
--c-pink: #f40572;
--c-pink-hover: #c40460;
--c-orange: #ea6e43;
--container: 1200px;
--section-padding: 50px 0;
```

---

## User Stories

### US-14.1: Admin quản lý sections của course qua PageBuilder

> **As an** Administrator
> **I want to** add, remove, reorder, toggle on/off sections for a course via PageBuilder
> **So that** I can control exactly what content appears on the course detail page

**Acceptance Criteria:**
- Truy cập `/quan-tri-vien/khoa-hoc/{slug}` → hiển thị PageBuilder với 3-panel layout
- Left panel: Catalog categorized by groups (9 groups, labels tiếng Việt)
- Mỗi catalog item hiển thị section label + icon
- Singleton section khi đã add → grayed out + badge "Đã thêm"
- Click section → add vào canvas → section hiển thị ở cuối list
- Drag & drop reorder sections
- Toggle on/off (Eye/EyeOff icon) → section ẩn, preview grayscale
- Xóa section (Trash icon) → confirmation dialog
- Max 30 sections warning
- Save All button → batch API + reorder API → success toast → reload
- "Có thay đổi chưa lưu" badge khi config bị thay đổi

### US-14.2: Admin cấu hình nội dung từng section

> **As an** Administrator
> **I want to** click on a section and see a config form panel
> **So that** I can fill in all content (text, images, URLs, etc.) for that section

**Acceptance Criteria:**
- Click section → right panel opens with config form (14 different forms)
- Text inputs: title, subtitle, descriptions
- Media pickers: dùng MediaTrigger component cho images/videos
- Array fields (logos, chapters, bonuses, FAQs, features): Add/Remove buttons
- Rich text fields: textarea (không embed BlockEditor — dùng HTML input thuần)
- Highlight fields: text input riêng cho phần highlight màu hồng
- Select fields: background (white/soft), style options
- Form validation: required fields marked *, error display
- Save config → PUT API per section
- Config thay đổi → preview realtime (dùng local state)

### US-14.3: Visitor xem course detail page với section render

> **As a** Website Visitor
> **I want to** view a course detail page that renders all sections in order
> **So that** I can see the full course information and decide to enroll

**Acceptance Criteria:**
- `/khoa-hoc/{slug}` là Server Component → fetch sections từ API
- Sections sorted by `sort_order`, filtered `is_published = true`
- Truyền sections config xuống `SectionRenderer` (Client Component)
- Mỗi section render component khớp chính xác CSS template clone
- Font: Be Vietnam Pro, white theme
- All HTML content sanitized qua DOMPurify
- Responsive breakpoints: 921px, 768px, 600px
- Config rỗng/lỗi → component render empty state (không crash)
- "Không render" khi section_type không có renderer registered (dev-time warning)

### US-14.4: PageBuilder section catalog có preview skeleton

> **As an** Administrator
> **I want to** see a visual preview of each section type in the catalog
> **So that** I know what it looks like before adding it

**Acceptance Criteria:**
- 14 SVG skeleton previews (240x120) trong `SectionSkeletonPreview`
- Preview phản ánh layout section (opacity-based, không ảnh thật)
- Catalog groups collapsible (expand/collapse)

---

## BDD Scenarios

```gherkin
Feature: Course Section PageBuilder

  Background:
    Given I am logged in as an Administrator
    And a course "TikTok 30 Ngày" exists with slug "30-ngay-sang-tao-video-tiktok"

  # === PageBuilder UI ===

  Scenario: Open PageBuilder for a course
    When I navigate to "/quan-tri-vien/khoa-hoc/30-ngay-sang-tao-video-tiktok"
    Then I should see the PageBuilder with 3 panels:
      - Left: section catalog (9 groups)
      - Center: canvas (drop zone)
      - Right: hidden (no section selected)
    And the header should show "Khóa học — 30-ngay-sang-tao-video-tiktok"

  Scenario: Add a hero_banner section from catalog
    Given the canvas is empty
    When I click "Hero Banner" in the catalog
    Then a new hero_banner section should appear in the canvas
    And the hero_banner catalog item should be grayed out with "Đã thêm"

  Scenario: Add a rich_text section (multi-instance)
    Given the canvas has 1 hero_banner section
    When I click "Nội dung" (rich_text) in the catalog
    Then a new rich_text section should appear in the canvas
    And the rich_text catalog item should NOT be grayed out (can add more)
    When I click "Nội dung" again
    Then a second rich_text section should appear

  Scenario: Cannot add singleton section when already present
    Given the canvas has 1 hero_banner section
    Then the hero_banner catalog item should be disabled

  Scenario: Toggle section visibility
    Given the canvas has 1 hero_banner section (published)
    When I click the eye icon on the section toolbar
    Then the section is_published should become false
    And the eye icon should change to eye-off

  Scenario: Delete a section
    Given the canvas has 1 hero_banner section
    When I click the trash icon on the section toolbar
    Then a confirmation dialog should appear: "Bạn có chắc muốn xóa section này?"
    When I confirm
    Then the section should be removed from the canvas

  Scenario: Reorder sections via drag and drop
    Given the canvas has 3 sections: [hero_banner, brand_logos, trust_badges]
    When I drag trust_badges above hero_banner
    Then the order should become: [trust_badges, hero_banner, brand_logos]

  Scenario: Config panel opens when clicking section
    Given the canvas has 1 hero_banner section
    When I click on the hero_banner section
    Then the right config panel should open
    And it should show the hero_banner config form

  Scenario: Save all sections
    Given the canvas has unsaved changes
    When I click "Lưu tất cả (3)"
    Then a POST /api/course/{slug}/sections/batch request should be sent
    And a POST /api/course/{slug}/sections/reorder request should be sent
    And a success toast should appear: "Đã lưu tất cả thay đổi"

  Scenario: Save error with retry
    Given the API is unavailable
    When I click "Lưu tất cả (3)"
    Then an error toast should appear: "Lỗi khi lưu. Vui lòng thử lại."
    And the toast should have a "Thử lại" button

  Scenario: Max sections warning
    Given the canvas has 30 sections
    Then the catalog should show a warning: "Đã đạt giới hạn 30 section"

  # === Section Config Forms ===

  Scenario: Configure hero_banner with highlight
    Given I have a hero_banner section
    When I fill in:
      | subtitle           | Khoá học hướng dẫn A-Z kỹ năng quay dựng chỉ với một chiếc điện thoại! |
      | subtitle_highlight | chỉ với một chiếc điện thoại!                                          |
    Then the preview should show subtitle with "chỉ với một chiếc điện thoại!" wrapped in <span class="pink">

  Scenario: Configure lesson_accordion section
    Given I have a lesson_accordion section
    When I add a chapter:
      | title   | Chương 1: Hướng dẫn học tập     |
      | lessons | Quy trình học hiệu quả          |
      | lessons | Hướng dẫn sử dụng Notion        |
    Then the config should have 1 chapter
    When I remove the chapter
    Then the config should have 0 chapters

  Scenario: Configure bonus_gifts with highlight
    Given I have a bonus_gifts section
    When I add a bonus item:
      | title               | Cam kết hoàn tiền 100% trong vòng 7 ngày |
      | title_highlight     | hoàn tiền 100%                    |
      | strikethrough_price |                                    |
    Then the preview should show "hoàn tiền 100%" in pink color

  # === Frontend Course Detail ===

  Scenario: Course detail page renders all published sections
    Given the course "TikTok 30 Ngày" has 14 sections all published
    When I navigate to "/khoa-hoc/30-ngay-sang-tao-video-tiktok"
    Then I should see, in order:
      - Hero banner with badge, title, video thumbnail, CTA
      - Brand logos grid
      - Countdown offer with timer
      - Trust badges
      - Curriculum highlights
      - Lesson accordion
      - Bonus gifts
      - Rich text "HỌC ONLINE CÓ HIỆU QUẢ KHÔNG?" (soft bg)
      - Rich text "VÌ SAO KHOÁ HỌC LẠI CÓ THỜI HẠN MỘT NĂM" (white bg)
      - Testimonial videos with carousel
      - Instructor journey
      - Sales story
      - Pricing card
      - FAQ accordion
    And all sections should use white theme CSS

  Scenario: course not found — public
    Given no course exists with slug "khong-ton-tai"
    When I navigate to "/khoa-hoc/khong-ton-tai"
    Then I should see a 404 page with "Không tìm thấy khóa học"

  Scenario: Section is not rendered when unpublished
    Given the course has hero_banner published and countdown_offer unpublished
    When I view the course detail page
    Then I should see the hero_banner
    And I should NOT see the countdown_offer

  Scenario: Rich text with soft background
    Given the course has a rich_text section with background "soft"
    When I view the course detail page
    Then the rich_text section should have background color #f0f5fa

  Scenario: Countdown timer runs client-side
    Given the course has a countdown_offer section
    When the page loads
    Then the countdown should display live numbers

  Scenario: Responsive layout — mobile
    Given I am viewing the course detail on a mobile device (width < 768px)
    Then the curriculum_highlights grid should be 1 column
    Then the brand_logos grid should be 2 columns

  # === Error States ===

  Scenario: API fetch fails on course detail page
    Given the API "/api/course/{slug}/sections" returns 500
    When I navigate to the course detail page
    Then the page should render with informational header
    And sections should not render
    And the page should NOT crash or show error overlay to visitor

  Scenario: PageBuilder fetch fails — shows empty canvas
    Given the API "/api/course/{slug}/sections" returns 500
    When I navigate to "/quan-tri-vien/khoa-hoc/{slug}"
    Then the PageBuilder canvas should show empty state
    And the header should still show the course slug

  Scenario: Section config JSON is malformed
    Given a section has config field containing invalid JSON "abc"
    When the course detail page renders this section
    Then the section should be silently skipped (no crash)
    And the remaining sections should render normally

  Scenario: API fetch fails on course detail page
    Given the API "/api/course/{slug}/sections" returns 500
    When I navigate to the course detail page
    Then the page should render with informational header
    And sections should not render
    And the page should NOT crash or show error overlay to visitor

  Scenario: Section type has no render component registered
    Given a section has section_type "unknown_future_type"
    When the course detail page renders
    Then that section should be silently skipped
    And a dev-mode console warning should be logged

  Scenario: HTML sanitization — XSS prevention
    Given a rich_text section has content_html with "<script>alert('xss')</script>"
    When the section is rendered to the public page
    Then the script tag should be stripped
    And only allowed tags (p, strong, em, br, span) should remain
```

---

## Data Fetching Architecture (Next.js 16 App Router)

### Admin PageBuilder (`quan-tri-vien/khoa-hoc/[slug]/page.tsx`) — Server Component

```tsx
// Server Component — fetch sections at request time
export default async function CourseBuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sections = await fetchSections("course", slug); // no cache (dynamic)
  return <PageBuilder entityType="course" entityIdentifier={slug} initialSections={sections} />;
}
```

### Public Course Detail (`nguoi-dung/khoa-hoc/[slug]/page.tsx`) — Server + Client hybrid

```tsx
// Server Component — fetch sections (ISR: revalidate 60s)
export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sections = await fetch(`/api/course/${slug}/sections`, { next: { revalidate: 60 } });
  // Only published sections
  const published = sections.filter(s => s.is_published);
  return <SectionRenderer sections={published} />;
}
```

`SectionRenderer` is a Client Component (needs 'use client' for GSAP support in future phases).

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Table** | `sections` (existed): id, entity_type, entity_id, section_type, title, config (JSON), sort_order, is_published |
| **API Endpoints** | Already implemented in `apps/api/src/routes/sections.ts` |
| **Shared Types** | Rewrite `packages/types/src/schemas/sections.ts` — 14 Zod schemas |
| **PageBuilder Types** | Populate `types.ts` từ shared types |
| **Section Forms** | 14 form components, lazy-load vào `FORM_MAP` |
| **Section Renders** | 14 render components, register vào `SECTION_MAP` |
| **CSS Theme** | White theme, Be Vietnam Pro font |
| **HTML Sanitize** | `DOMPurify.sanitize()` trên tất cả `*_html` fields |
| **Singleton** | Frontend: disabled + badge. Backend: check in POST/PUT |
| **Multi-instance** | Only `rich_text`, bounded by MAX_SECTIONS=30 |
| **Highlights** | Dùng field riêng `*_highlight` thay vì inline HTML |
| **Animation** | Deferred to future phase — current render is static |
| **Responsive** | 921px, 768px, 600px breakpoints from clone templates |

---

## API Endpoints (đã implement)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/api/course/:slug/sections` | Public | List sections, sorted by sort_order |
| `POST` | `/api/course/:slug/sections` | Admin | Create single |
| `POST` | `/api/course/:slug/sections/batch` | Admin | Batch create |
| `PUT` | `/api/course/:slug/sections/:id` | Admin | Update config |
| `DELETE` | `/api/course/:slug/sections/:id` | Admin | Delete |
| `POST` | `/api/course/:slug/sections/reorder` | Admin | Reorder |

---

## Section Catalog Groups

| Group | Label | Types |
|---|---|---|
| Hero & Brand | Hero & Brand | hero_banner, brand_logos |
| Offer & Trust | Ưu đãi & Tin cậy | countdown_offer, trust_badges |
| Curriculum | Chương trình học | curriculum_highlights, lesson_accordion |
| Bonuses | Quà tặng | bonus_gifts |
| Content | Nội dung | rich_text |
| Social Proof | Phản hồi học viên | testimonial_videos, featured_students |
| Instructor | Giảng viên | instructor_journey |
| Sales | Bán hàng | sales_story, pricing_card |
| FAQ | Hỏi đáp | faq_accordion |

---

## Implementation Phases

### Phase 1: Types & Config (P0)
1. Rewrite `packages/types/src/schemas/sections.ts` — 14 Zod schemas
2. Export all: SectionType, SectionConfig, labels, groups, singletons, getDefaultConfig
3. `bun test` in packages/types

### Phase 2: PageBuilder Types Wire-up (P0)
4. Rewrite `types.ts` — import from @workspace/types
5. Populate CATALOG_GROUPS, LABELS, SINGLETONS, ENTITY_MAP, getDefaultConfig

### Phase 3: Section Config Forms (P0-P2)
6. Build 14 section config form components
7. Lazy-load register vào `FORM_MAP`
8. Reuse shared form components from block-editors pattern

### Phase 4: Section Render Components (P0-P2)
9. Build 14 render components with clone CSS
10. Register vào `SECTION_MAP`
11. Test with sample config data

### Phase 5: Integration (P1-P2)
12. Update `/khoa-hoc/[slug]` → SectionRenderer (Server Component fetch + Client renderer)
13. End-to-end test: Admin → PageBuilder → Save → View

### Phase 6: Polish (P3)
14. Section skeleton SVG previews
15. Responsive testing
16. GSAP animation integration (deferred spec)

---

## Dependencies

- **Spec 03:** Course Management — slug, metadata
- **Spec 04:** Media Microservice — image/video upload
- **Spec 09:** Authentication — admin guard
- **Spec 10:** Admin Dashboard Shell — admin layout
- **Block Editor System:** Shared form components (Field, MediaPicker, etc.)
- **DOMPurify:** HTML sanitization library (thêm vào dependencies)

---

## Next Steps

1. `/bdd-dev` — Implement theo phases
