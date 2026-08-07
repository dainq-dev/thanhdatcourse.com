# BDD Spec: Page Builder Section Catalog v3 — Clone-Accurate

**Feature**: Tái kiến trúc toàn bộ section catalog của Page Builder dựa trên phân tích HTML clone thực tế từ minhtravel.vn
**Source**: `minhtravel-clone.html` (849 dòng) + `minhtravel-lone-v1.html` (807 dòng)
**Version**: 3.0.0
**Date**: 2026-08-05
**Previous Specs**: `page-builder-bdd.md` (v2 — deprecated), `page-builder-sections-rearchitecture.md` (v2 — deprecated)

---

## Context

2 clone HTML files được trích xuất từ view-source của các course page thực tế trên minhtravel.vn:
- **Clone 1**: "30 Ngày Sáng Tạo Video TikTok Triệu View"
- **Clone 2**: "Làm Chủ Máy Ảnh Quay Video Chuyên Nghiệp"

Cả 2 dùng cùng 1 design system với CSS variables giống hệt. Từ 2 clone này, trích xuất được **16 section types** thay thế toàn bộ 22 types cũ.

---

## Feature 1: 16 Section Types Derived from Clone HTML

As an **Admin**, I want to use section types that exactly match the real minhtravel.vn course pages.

### Catalog Definition

| # | Type ID | Clone Class | Singleton | Scope | Description |
|---|---------|-------------|-----------|-------|-------------|
| 1 | `hero_banner` | `.hero` | ✅ | all | gradient bg + eyebrow_top + eyebrow + h1 + subtitle + video-wrap + CTA + note |
| 2 | `brand_logos` | `.brands` | ❌ | all | heading + 4-col logo grid + trust badge + student count |
| 3 | `countdown_offer` | `.offer` | ✅ | all | heading + promo img + price block(old/new) + countdown timer + CTA |
| 4 | `benefits_grid` | `.feature-row` | ❌ | all | 3-col svg checkmark + h3 title, `<hr>` dividers |
| 5 | `curriculum_grid` | `.curriculum-item` | ❌ | course | intro heading + sub-h2 + items: num-badge + h3 + paragraphs + img (2-col) |
| 6 | `lesson_accordion` | `.accordion-item` | ❌ | course | heading + 2-col(img left + details/summary right), bg=soft |
| 7 | `bonus_gift_grid` | `.bonus-item` | ❌ | course | heading + items: number + h3 + price-tag(.orange s) + desc + img (2-col) |
| 8 | `info_block` | `.info-block` | ❌ | all | centered heading(1.8rem) + centered paragraphs(1.05rem) |
| 9 | `sales_story` | `.story` | ❌ | all | heading(1.9rem) + left paragraphs + optional 2-col image + sub-heading |
| 10 | `testimonials_video` | `.testi-grid` | ❌ | all | heading + YouTube iframe 2x2 grid |
| 11 | `featured_students` | `.student-card` | ❌ | course | heading + card grid 2x2: img + name + stats + desc |
| 12 | `feedback_carousel` | `.carousel-grid` | ❌ | all | heading + horizontal scroll images (200px columns) |
| 13 | `instructor_journey` | `.journey` | ✅ | all | portrait left + heading + stats + intro + expandable + sub + CTA + brand-strip |
| 14 | `pricing_card` | `.price-card` | ✅ | all | centered card 480px: banner img + h3 + price(.pink) + ul(✓) + CTA |
| 15 | `faq_accordion` | `.faq-item` | ❌ | all | heading(2rem) + details/summary items, arrows ⌄/⌃ |
| 16 | `divider` | `<hr>` | ❌ | all | simple `<hr>` between sections, no config |

### Scenario: Catalog contains exactly 16 section types
```
GIVEN the PageBuilder section catalog is loaded
WHEN examining the ENTITY_SECTION_MAP
THEN the course entity has exactly 16 section types
  AND the product entity has 12 section types (excludes: curriculum_grid, lesson_accordion, bonus_gift_grid, featured_students)
  AND the presets_page entity has 12 section types (same as product)
```

### Scenario: Singleton enforcement matches clone behavior
```
GIVEN the section catalog is defined
WHEN checking SINGLETON_SECTION_TYPES
THEN only these types are singletons: [hero_banner, countdown_offer, instructor_journey, pricing_card]
  AND divider is NOT a singleton (can appear multiple times)
```

---

## Feature 2: Catalog Grouping (Left Sidebar)

As an **Admin**, I want sections grouped logically so I can find them quickly.

### Group Layout

```
▸ Mở đầu
    hero_banner      — Ảnh bìa
    brand_logos       — Logo đối tác

▸ Giá trị
    countdown_offer   — Ưu đãi giới hạn
    benefits_grid     — Lợi ích (3 cột)
    curriculum_grid   — Nội dung khóa học

▸ Nội dung
    lesson_accordion  — Danh sách bài học
    bonus_gift_grid   — Quà tặng kèm
    info_block        — Khối thông tin
    sales_story       — Câu chuyện bán hàng

▸ Uy tín
    testimonials_video    — Video đánh giá
    featured_students     — Học viên nổi bật
    feedback_carousel     — Ảnh feedback

▸ Thuyết phục
    instructor_journey    — Hành trình giảng viên

▸ Chốt đơn
    pricing_card      — Bảng giá
    faq_accordion      — Hỏi đáp

▸ Tiện ích
    divider           — Đường phân cách
```

### Scenario: Catalog groups are displayed in correct order
```
GIVEN Admin opens page builder for a course
WHEN viewing the left catalog panel
THEN 7 groups are displayed in order: Mở đầu, Giá trị, Nội dung, Uy tín, Thuyết phục, Chốt đơn, Tiện ích
  AND each group is collapsible
  AND groups are collapsed by default (all sections visible)
```

### Scenario: Product entity hides course-only sections from catalog
```
GIVEN Admin opens page builder for a product
WHEN viewing the left catalog panel
THEN curriculum_grid, lesson_accordion, bonus_gift_grid, featured_students do NOT appear
  AND groups with no remaining types are hidden entirely
```

---

## Feature 3: Clone-Accurate Styling

As a **Visitor**, I want section styling to be pixel-exact to the original minhtravel.vn course pages.

### Design Tokens (from clone `<style>` block)

```
Colors:
  --c-blue: #046bd2        Icon / Link / Checkmark / Stat number
  --c-blue-dark: #045cb4   Button hover
  --c-dark: #1e293b         Headings
  --c-text: #334155         Body text
  --c-bg-soft: #f0f5fa     Soft background
  --c-pink: #f40572         Highlight / CTA button / Num badge
  --c-orange: #ea6e43       Price strikethrough / "Vào học" button
  --c-border: #e2e8f0       Borders / dividers
  --c-muted: #64748b        Muted text / note

Typography:
  Font: 'Be Vietnam Pro', 'Manrope', sans-serif
  Headings: font-weight 600, line-height 1.3, color #1e293b
  Body: line-height 1.65 (default), 1.9 (info/story paras)
  Container: max-width 1200px, padding 0 20px

Spacing:
  Section: padding 60px 0
  Button CTA: padding 15px 40px, border-radius 6px

Buttons:
  .btn--cta: bg #f40572, color #fff, hover #c40460
  .btn: bg #fff, border 2px solid #1e293b, hover bg #045cb4 color #fff
```

### Scenario: Every section renderer uses SCSS module — no inline styles
```
GIVEN all 16 section components exist
WHEN checking each component's index.tsx file
THEN every component imports its own index.module.scss
  AND no component contains inline <style> tags
  AND no component uses inline style={{}} objects
```

### Scenario: Shared design tokens are centralized
```
GIVEN the project has a tokens file at packages/ui/styles/tokens/_clone.scss
WHEN checking any section's SCSS module
THEN it imports design tokens from a shared tokens file
  AND color values match clone CSS exactly (no variations)
```

### Scenario: Section background prop maps to clone classes
```
GIVEN a section config has background: "soft"
WHEN the section renders
THEN it applies background: #f0f5fa (matches .section--soft in clone)
GIVEN a section config has background: "white"
WHEN the section renders
THEN it applies background: #fff (matches default in clone)
```

### Scenario: Hero banner gradient matches clone exactly
```
GIVEN hero_banner section is rendered
THEN its background is linear-gradient(180deg, #fff 0%, #f0f5fa 100%)
  AND NOT a solid color
```

### Scenario: Brand logos have grayscale filter
```
GIVEN brand_logos section is rendered with logos
THEN each logo img has filter: grayscale(1) and opacity: 0.8
  AND max-height is 60px
  AND grid is 4 columns (2 on mobile <600px)
```

### Scenario: Countdown boxes use dark background
```
GIVEN countdown_offer section has active countdown
THEN countdown items have background: #1e293b, color: #fff, border-radius: 8px
  AND min-width is 80px
  AND number font-size is 2rem, font-weight 700
```

### Scenario: Curriculum badges use pink color
```
GIVEN curriculum_grid section is rendered with modules
THEN each num-badge has font-size: 2.2rem, font-weight: 800, color: #f40572
```

### Scenario: Lesson accordion arrows use +/- characters
```
GIVEN lesson_accordion section is rendered
THEN closed accordion items show "+" (1.4rem) via ::after pseudo-element
  AND open accordion items show "–" (1.4rem) via ::after pseudo-element
```

### Scenario: Bonus price tags are orange strikethrough
```
GIVEN bonus_gift_grid section has an item with price_tag
THEN the price is rendered as <s> with color: #ea6e43
```

### Scenario: Pricing card has correct border radius and shadow
```
GIVEN pricing_card section is rendered
THEN the card has border-radius: 16px
  AND box-shadow: 0 10px 40px rgba(0,0,0,0.08)
  AND max-width: 480px, centered
  AND features list uses "✓" ::before with color #046bd2
```

### Scenario: FAQ accordion uses unicode arrows
```
GIVEN faq_accordion section is rendered
THEN closed items show "⌄" (1.3rem) via ::after
  AND open items show "⌃" (1.3rem) via ::after
```

### Scenario: YouTube iframes have consistent styling
```
GIVEN testimonials_video section has videos
THEN each iframe has aspect-ratio: 16/9, border-radius: 10px, border: none
```

### Scenario: Student cards have card shadow
```
GIVEN featured_students section is rendered
THEN each card has border-radius: 12px, box-shadow: 0 4px 20px rgba(0,0,0,.06)
  AND image has aspect-ratio: 1/1, object-fit: cover
  AND stat numbers are blue (#046bd2), 1.1rem, bold
```

### Scenario: Feedback carousel uses native scroll
```
GIVEN feedback_carousel section is rendered with images
THEN container uses grid-auto-flow: column, grid-auto-columns: 200px
  AND overflow-x: auto (native scrollbar)
  AND images have border-radius: 8px
```

### Scenario: Instructor journey stats are blue numbers
```
GIVEN instructor_journey section has stats
THEN stat numbers are color: #046bd2, font-size: 1.6rem, font-weight: 700
  AND stat labels are color: #64748b, font-size: 0.85rem
```

### Scenario: Info block paragraphs are centered and larger
```
GIVEN info_block section is rendered
THEN paragraphs have text-align: center, font-size: 1.05rem, line-height: 1.9
```

### Scenario: Sales story paragraphs are left-aligned
```
GIVEN sales_story section is rendered
THEN paragraphs have text-align: left, line-height: 1.9, margin-bottom: 16px
```

### Scenario: Instructor journey brand strip has grayscale
```
GIVEN instructor_journey section has brand_logos
THEN brand logos use filter: grayscale(1), opacity: 0.8, max-height: 50px
  AND grid is 4 columns (2 on mobile <600px)
```

### Scenario: Mobile responsive breakpoints match clone
```
GIVEN any section is rendered on mobile (<768px)
WHEN checking responsive styles
THEN 2-column layouts (curriculum, bonus, lesson, journey) collapse to single column
  AND 4-column grids (brands, brand-strip) collapse to 2 columns at 600px
  AND 3-column feature row collapses to 1 column
  AND 2x2 testimonial grid collapses to 1 column
```

---

## Feature 4: Config Schema per Section

As an **Admin**, I want config fields that exactly map to HTML structure in the clone.

### Section Config Schemas

#### hero_banner
```
eyebrow_top?:  string     // <p class="eyebrow--top">ƯU ĐÃI GIẢM GIÁ 90%</p>
eyebrow?:      string     // <p class="eyebrow">TIẾT LỘ BÍ QUYẾT...</p>
heading:       string     // <h1>30 NGÀY SÁNG TẠO VIDEO TIKTOK TRIỆU VIEW!</h1>
subtitle?:     string     // <p class="subtitle">...<span class="pink">...</span></p>
media_id?:     string     // <img src="..."> trong .video-wrap
video_url?:    string     // href của thẻ <a> bọc img (YouTube link)
cta_text?:     string     // "ĐĂNG KÝ NGAY!"
cta_url?:      string     // href checkout
note?:         string     // <p class="note">Đăng ký ngay trước khi mức giá...</p>
background?:   "white"|"soft"  // default: white (hero gradient overrides)
```

#### brand_logos
```
heading?:             string
logos?:               {url: string, alt?: string}[]  // optional — clone 2 không có logo grid
trust_badge_url?:     string
student_count_text?:  string      // "Tham gia cùng 1000+ học viên trên toàn quốc"
background?:          "white"|"soft"  // default: white
```

#### countdown_offer
```
heading?:             string    // hỗ trợ <span class="pink">
image_url?:           string
price_text?:          string    // "Nhận ngay 5 ưu đãi bổ sung..."
old_price_text?:      string    // "15.472K" — strikethrough
current_price_text?:  string    // "996K" — trong .pink
countdown_end?:       string    // ISO 8601 datetime (YYYY-MM-DDTHH:MM:SS), null = evergreen 2h tự reset
cta_text?:            string
cta_url?:             string
background?:          "white"|"soft"  // default: white
```

#### benefits_grid
```
heading?:       string    // clone KHÔNG có heading, chỉ cards
items:          {icon: string, title: string}[]
                             // icon: "check" (chỉ 1 loại SVG path trong clone)
                             // title: "KHÔNG CẦN CÓ KINH NGHIỆM"
show_dividers?: boolean   // <hr> trước và sau section. default: true
columns?:       2|3|4     // default: 3
background?:    "white"|"soft"  // default: white
```

#### curriculum_grid
```
heading?:       string    // "Thành Thạo Quay dựng TikTok Triệu View..."
sub_heading?:   string    // hỗ trợ <span class="pink">
modules:        {
                  badge: string,           // "#1"
                  title: string,           // "Chiến lược xây kênh tiktok"
                  paragraphs: string[],    // hỗ trợ <strong>
                  image_url: string
                }[]
cta_text?:      string    // CTA cuối section — phải có cùng với cta_url
cta_url?:       string    // CTA cuối section — phải có cùng với cta_text
background?:    "white"|"soft"  // default: white

Validation: (cta_text && !cta_url) || (!cta_text && cta_url) → error 400 "cta_text và cta_url phải cùng có hoặc cùng không"
```

#### lesson_accordion
```
heading?:    string    // "HƠN 50+ BÀI HỌC<br>làm chủ kỹ năng..."
image_url?:  string    // ảnh trái
chapters:    {title: string, lessons: string[]}[]
                        // lessons: ["– Quy trình học hiệu quả", "– Hướng dẫn..."]
background?: "white"|"soft"  // default: soft (clone dùng .section--soft)
```

#### bonus_gift_grid
```
heading?:    string    // hỗ trợ <span class="pink">
items:       {
               number: string,         // "01"
               title: string,          // "Quà Tặng 1: Khoá học..."
               price_tag?: string,     // "3.868.000đ" → <s class="price-tag">, màu orange
               description?: string,
               image_url: string
             }[]
background?: "white"|"soft"  // default: white
```

#### info_block
```
heading?:    string      // "HỌC ONLINE<br>CÓ HIỆU QUẢ KHÔNG?"
paragraphs:  string[]    // centered, 1.05rem, hỗ trợ <strong><br>
background?: "white"|"soft"  // default: soft
```

#### sales_story
```
heading?:          string      // "BÍ QUYẾT LÀM VIDEO..."
paragraphs:        string[]    // left-aligned, hỗ trợ <strong><br>
images:            {url: string}[]  // 0-2 images, nếu 2 → 2-col grid
sub_heading?:      string      // "SỰ THAY ĐỔI NHỎ NHƯNG HIỆU QUẢ..."
sub_paragraphs?:   string[]
background?:       "white"|"soft"  // default: soft (clone 1), white (clone 2)
```

#### testimonials_video
```
heading?:    string                    // "Feedback khoá học"
videos:      {youtube_id: string, title: string}[]
                                       // 2x2 grid iframes + h3 caption
background?: "white"|"soft"            // default: soft (clone dùng .section--soft)
```

#### featured_students
```
heading?:    string
students:    {
               image_url: string,
               name: string,
               role?: string,          // "Giám đốc tại Phun Xăm Thiên Kim"
               stats: {label: string, value: string}[],
                                        // [{value: "1M", label: "Follow Facebook"}, ...]
               description: string
             }[]
background?: "white"|"soft"  // default: white
```

#### feedback_carousel
```
heading?:    string          // "99+ FEEDBACK TẠI CỘNG ĐỒNG Minh Travel"
images:      {url: string}[] // horizontal scroll, 200px columns
background?: "white"|"soft"  // default: white
```

#### instructor_journey
```
portrait_url?:          string
heading?:               string    // "HÀNH TRÌNH XÂY KÊNH TRIỆU VIEW TỪ CON SỐ 0"
stats:                  {value: string, label: string}[]
                                   // [{value: "14.8K", label: "Instagram followers"}, ...]
paragraphs:             string[]  // hỗ trợ <strong>
expandable_paragraphs:  string[]  // hiển thị trong <details><summary>Đọc tiếp</summary>
sub_heading?:           string    // "Thu nhập của mình đến từ 3 nguồn chính"
sub_paragraphs?:        string[]
cta_text?:              string
cta_url?:               string
brand_logos:            {url: string, alt?: string}[]
                                   // grid 4-col cuối section, grayscale
background?:            "white"|"soft"  // default: white
```

#### pricing_card
```
heading?:    string      // "Khóa học quay dựng Tiktok bằng điện thoại"
price_text?: string      // "996.000đ (1 năm)" — hiển thị trong .pink
banner_url?: string      // ảnh trên cùng card
features:    string[]    // list ✓ checkmark, hỗ trợ <strong>
cta_text?:   string      // "ĐẶT MUA"
cta_url?:    string
background?: "white"|"soft"  // default: white
```

#### faq_accordion
```
heading?:    string
items:       {question: string, answer: string}[]
                          // answer hỗ trợ HTML (paragraphs)
background?: "white"|"soft"  // default: white
```

#### divider
```
// No config — renders <hr> with clone border style
background?: "white"|"soft"  // default: white (inherits parent)
```

### Scenario: Admin creates hero_banner with all clone fields
```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: {
    "section_type": "hero_banner",
    "config": {
      "eyebrow_top": "ƯU ĐÃI GIẢM GIÁ 90%",
      "eyebrow": "TIẾT LỘ BÍ QUYẾT TẠO RA HÀNG LOẠT VIDEO TRIỆU VIEW",
      "heading": "30 NGÀY SÁNG TẠO VIDEO TIKTOK TRIỆU VIEW!",
      "subtitle": "Khoá học hướng dẫn A-Z <span class='pink'>chỉ với một chiếc điện thoại!</span>",
      "media_id": "abc-123",
      "video_url": "https://youtu.be/1Em5sI0NMDY",
      "cta_text": "ĐĂNG KÝ NGAY!",
      "cta_url": "https://go.minhtravel.vn/...",
      "note": "Đăng ký ngay trước khi mức giá khoá học tăng lên"
    }
  }
THEN response status is 201
  AND all fields are stored in config JSON
```

### Scenario: Admin creates section with HTML in text fields
```
GIVEN Admin creates a curriculum_grid section
  WITH paragraphs containing <strong>bold text</strong>
WHEN the section renders on public page
THEN <strong> tags are rendered as bold via dangerouslySetInnerHTML
```

### Scenario: Config validation fails on missing required field
```
GIVEN Admin sends a hero_banner section without "heading"
THEN response status is 400
  AND response contains validation error: "heading is required"
```

---

## Feature 5: Section Renderer Registry

As a **Developer**, I want a clean SectionRenderer that maps type IDs to components.

### Scenario: SectionRenderer renders all 16 section types
```
GIVEN a course has 16 sections (one of each type), all published
WHEN SectionRenderer renders them
THEN all 16 sections are rendered in sort_order
  AND no console warnings about unknown types
  AND disabled sections (is_published=false) are skipped
```

### Scenario: Unknown section type is silently skipped
```
GIVEN a course has a section with type="deprecated_type"
  AND SectionRenderer has no component for this type
WHEN the page renders
THEN the section is skipped
  AND a console.warn appears in dev mode
  AND other sections render normally
```

### Scenario: Malformed config JSON is handled gracefully
```
GIVEN a section has config that fails JSON.parse
WHEN SectionRenderer renders that section
THEN an empty config {} is used as fallback
  AND the page does not crash
```

---

## Feature 6: Config Forms (Right Panel)

As an **Admin**, I want a config form for each section type with fields matching the clone structure.

### Scenario: Every section type has a corresponding config form
```
GIVEN the PageBuilder FORM_MAP is loaded
WHEN checking each of the 16 section types
THEN each type has a lazy-loaded config form component
  AND divider has the simplest form (no fields, just info text)
```

### Scenario: Config form fields match section config schema 1:1
```
GIVEN Admin opens hero_banner config form
WHEN viewing form fields
THEN exactly 10 fields are displayed:
    eyebrow_top, eyebrow, heading, subtitle, media_id (MediaTrigger),
    video_url, cta_text, cta_url, note, background (select)
  AND no extra fields are present
  AND no required fields from config schema are missing from the form
```

### Scenario: MediaTrigger is used for all image/video fields
```
GIVEN Admin opens any config form with image fields
WHEN clicking on the image selector
THEN the MediaManager modal opens (MediaTrigger component)
  AND selected media URL is stored in the config
  AND a preview thumbnail is shown
```

### Scenario: Array fields support add/remove items
```
GIVEN Admin opens benefits_grid config form
WHEN clicking "Thêm" on items list
THEN a new empty item {icon: "check", title: ""} is added
  AND the counter updates (e.g., "1/6")
WHEN clicking trash icon on an item
THEN that item is removed
```

### Scenario: Max items enforcement
```
GIVEN benefits_grid has 6 items (max)
WHEN viewing the form
THEN the "Thêm" button is disabled or hidden
  AND a hint says "(6/6 — đã đạt tối đa)"
```

### Scenario: Config changes are not persisted until save
```
GIVEN Admin edits a section's config in the form
  AND does NOT click save
WHEN Admin closes the form or clicks away
THEN the section's config in preview does NOT change
  AND the original config is preserved
```

### Scenario: HTML hint text for text fields
```
GIVEN Admin opens a form with text fields that support HTML
WHEN viewing the field
THEN a hint is shown: "Có thể dùng <strong> và <br> trong text"
```

---

## Feature 7: Save Strategy

As a system, sections should be batch-saved efficiently.

### Scenario: Batch create new sections in one API call
```
GIVEN Admin added 3 new sections to an empty course
WHEN Admin clicks "Lưu tất cả"
THEN one POST /api/course/{slug}/sections/batch is sent
  WITH all 3 sections in the payload
  AND after success, one POST /api/course/{slug}/sections/reorder is sent
```

### Scenario: Reorder existing sections only
```
GIVEN Admin reordered 5 existing sections (no new sections)
WHEN Admin clicks "Lưu tất cả"
THEN no batch create call is made
  AND one POST /api/course/{slug}/sections/reorder is sent
  WITH ordered_ids matching the new order
```

### Scenario: Save failure shows toast with retry
```
GIVEN Admin clicks "Lưu tất cả"
WHEN the API call fails (network error)
THEN an error toast appears: "Lỗi khi lưu. Vui lòng thử lại."
  AND the toast has a "Thử lại" button
  AND clicking "Thử lại" retries the save
```

### Scenario: Unsaved changes warning on page leave
```
GIVEN Admin has unsaved changes in the page builder
WHEN Admin navigates away or closes the tab
THEN browser shows "Are you sure you want to leave?" dialog
  AND changes are not lost if Admin stays
```

---

## Feature 8: Section Labels (Vietnamese)

As an **Admin**, I want section labels in Vietnamese matching common terminology.

### Labels
```
hero_banner           → "Hero Banner"
brand_logos           → "Logo đối tác"
countdown_offer       → "Ưu đãi giới hạn"
benefits_grid         → "Lợi ích (3 cột)"
curriculum_grid       → "Nội dung khóa học"
lesson_accordion      → "Danh sách bài học"
bonus_gift_grid       → "Quà tặng kèm"
info_block            → "Khối thông tin"
sales_story           → "Câu chuyện bán hàng"
testimonials_video    → "Video đánh giá"
featured_students     → "Học viên nổi bật"
feedback_carousel     → "Ảnh feedback"
instructor_journey    → "Hành trình giảng viên"
pricing_card          → "Bảng giá"
faq_accordion         → "Hỏi đáp (FAQ)"
divider               → "Đường phân cách"
```

### Scenario: All 16 section labels are in Vietnamese
```
GIVEN the SECTION_LABELS constant is defined
WHEN checking each of the 16 section types
THEN every label is in Vietnamese
  AND no English-only labels remain
```

---

## Summary

| Feature | Scenarios |
|---------|-----------|
| 16 Section Types Definition | 2 |
| Catalog Grouping | 2 |
| Clone-Accurate Styling (19 CSS checks) | 19 |
| Config Schema per Section | 3 |
| Section Renderer Registry | 3 |
| Config Forms | 7 |
| Save Strategy | 4 |
| Section Labels | 1 |
| **Total** | **41 scenarios** |
