# Gap Analysis Report — Approved Frontend vs Documents

**Date:** 2026-07-21  
**Purpose:** Document all gaps between the client-approved frontend UI concept and the current Specs + BRDs. Each gap includes concrete remediation action.

---

## GAP-01: Footer Background Image Not in Settings

| Field | Detail |
|---|---|
| **Severity** | Low — missing 1 site_settings key |
| **Found in** | `packages/ui/src/organisms/SiteFooter.tsx:42` |
| **Current state** | Hardcoded URL: `https://minhtravel.vn/wp-content/uploads/2023/12/cover2-scaled.jpeg` as `background-image` |
| **Docs state** | Spec 01 / BRD 01: `footer_nav`, `social_links`, `contact_email`, `logo_url` exist but no `footer_background_url` |
| **Impact** | Admin cannot change footer background image without code change |

**Fix:** Add to site_settings:
```
Key: footer_background_url
Type: string (Media ID reference hoặc URL)
Description: Ảnh nền footer (1920x1080 recommended)
```

---

## GAP-02: Course Detail — Section Headings are Hardcoded

| Field | Detail |
|---|---|
| **Severity** | Medium — 6 hardcoded Vietnamese strings in course detail page |
| **Found in** | `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx` |
| **Current state** | These section headings are hardcoded JSX text, not from mockData: |
| | Line 54: `"Một số thương hiệu tôi vinh dự được hợp tác"` |
| | Line 69: `"Thành Thạo Quay dựng Triệu View Bằng Điện Thoại Dễ Dàng!"` |
| | Line 70: `"Đây là một vài kiến thức giá trị mà bạn sẽ được học trong khoá học!"` |
| | Line 86: `"Đây là các ưu đãi bạn sẽ nhận được khi đăng ký khoá học..."` |
| | Line 101: `"Feedback khoá học"` |
| | Line 113: Watermark `"FAQ"` |
| **Docs state** | Not covered in any spec or BRD — no settings keys for these |
| **Impact** | When admin creates new courses, these section headings remain the same static text. Cannot customize per-course or site-wide |

**Fix — Option A (site-wide):** Add to site_settings:
```
course_detail_brands_title     → "Một số thương hiệu tôi vinh dự được hợp tác"
course_detail_modules_title    → "Thành Thạo Quay dựng Triệu View Bằng Điện Thoại Dễ Dàng!"
course_detail_modules_subtitle → "Đây là một vài kiến thức..."
course_detail_bonuses_title    → "Đây là các ưu đãi bạn sẽ nhận được..."
course_detail_testimonials_title → "Feedback khoá học"
course_detail_faq_heading      → "FAQ"
```

**Fix — Option B (per-course):** Add columns to `courses` table:
```sql
ALTER TABLE courses ADD COLUMN modules_section_title TEXT;
ALTER TABLE courses ADD COLUMN modules_section_subtitle TEXT;
ALTER TABLE courses ADD COLUMN bonuses_section_title TEXT;
ALTER TABLE courses ADD COLUMN testimonials_section_title TEXT;
```
*(Use Option A — site-wide is sufficient since all courses currently share the same Vietnamese copy)*

---

## GAP-03: Course Detail — Hero Badge and Hero Subtitle are Hardcoded

| Field | Detail |
|---|---|
| **Severity** | Medium |
| **Found in** | `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx:41-42` |
| **Current state** | Line 41: `"ƯU ĐÃI GIẢM GIÁ 90%"` — hardcoded promotion badge |
| | Line 42: `"TIẾT LỘ BÍ QUYẾT TẠO RA HÀNG LOẠT VIDEO TRIỆU VIEW"` — hardcoded hero subtitle below badge |
| **Docs state** | Spec 07 / BRD 07: Promotions covered — `discount_percentage` từ active promotion |
| | **BUT:** No mapping từ course detail hero badge → promotion. No field for hero subtitle per course. |
| **Impact** | Hero badge always says "90%" regardless of actual promotion. Hero subtitle never changes. |

**Fix:**
1. Hero badge text → derive from active promotion: `"ƯU ĐÃI GIẢM GIÁ {discount_percentage}%"` hoặc fallback từ site_settings key `course_detail_hero_badge_text`
2. Hero subtitle → add column `hero_subtitle TEXT` to `courses` table (khác với `subtitle` field hiện có — cái dùng trên listing card, cái này dùng trong hero section của detail page)

```sql
ALTER TABLE courses ADD COLUMN hero_subtitle TEXT;
```
**Update Spec 03:** Thêm field `hero_subtitle` vào course form (Tab Thông tin), hiển thị trong hero section của detail page.

---

## GAP-04: `CourseDetailExtras` — Brands and Target Badges Location Ambiguity

| Field | Detail |
|---|---|
| **Severity** | Low — architectural decision needed |
| **Found in** | `apps/web/src/lib/mockData.ts:11-41` — `COURSE_EXTRAS` object |
| **Current state** | `getCourseDetailExtras(slug)` returns the SAME data for ALL courses: 7 brands, 3 target badges, 8 modules, 5 bonuses, 4 testimonials |
| **Docs state** | Blueprint Section 1.1 lists `COURSE_EXTRAS` but does not document where these go in dynamic version |
| | Spec 01: `hero_brands` exists as site_settings key (for homepage hero) |
| | Spec 03: No `brands` or `target_badges` column on courses table |
| **Impact** | Unclear whether brands and target badges are site-wide (same for all courses) or per-course |

**Analysis:**
| Data | Same for all courses? | Recommendation |
|---|---|---|
| **Brands** (Sony, Canon, Fujifilm...) | Yes — 1 set for the entire brand | → Use `site_settings.hero_brands` — already exists. Course detail page reads from same key |
| **Target Badges** (KHÔNG CẦN CÓ KINH NGHIỆM, ...) | Likely same for all courses | → Use `site_settings.course_target_badges` (JSON array) — new key |
| **Modules** | Varies per course | → Already in Spec 03: `course_modules` + `course_lessons` tables |
| **Bonuses** | Varies per course | → Already in Spec 03: `course_bonuses` table |
| **Testimonials** | Varies per course | → Already in Spec 03: `testimonials` table |

**Fix:** Add to site_settings in Spec 01 / BRD 01:
```
Key: course_target_badges
Type: JSON array
Example: ["KHÔNG CẦN CÓ KINH NGHIỆM", "KHÔNG CẦN CÓ NĂNG KHIẾU", "PHÙ HỢP BẤT CỨ ĐỘ TUỔI NÀO"]
```
Update Spec 03: Ghi chú rằng course detail page lấy brands từ `site_settings.hero_brands` và target badges từ `site_settings.course_target_badges`.

---

## GAP-05: Blog Cards — White Background Exception Not Documented

| Field | Detail |
|---|---|
| **Severity** | Low — consistency note |
| **Found in** | `apps/web/src/app/(nguoi-dung)/bai-viet/page.module.scss` |
| **Current state** | Blog listing cards use `background: #FFFFFF` (white), dark text inside. This is the ONLY white-card pattern in an otherwise fully dark-themed website |
| **Docs state** | Spec 05 / BRD 05: No mention of this visual exception |
| **Impact** | Developer might accidentally "fix" this to match the dark theme during implementation |

**Fix:** Add note to Spec 05 and BRD 05:
```
Design Constraint: Blog listing cards retain white (#FFFFFF) background with dark (#0B0F19) text. 
This is an intentional design choice approved by client to differentiate blog content from 
course/product presentation. Do NOT apply dark theme card styles to blog cards.
```

---

## GAP-06: Course Listing Cards — Teal Background Not Documented

| Field | Detail |
|---|---|
| **Severity** | Low — consistency note |
| **Found in** | `apps/web/src/app/(nguoi-dung)/khoa-hoc/page.module.scss` |
| **Current state** | Course listing cards use `background: #203644` (teal-dark). This is NOT a design token from `_variables.scss` and does not match the `$clr-bg-card` (#0B0F19) used elsewhere |
| **Docs state** | Spec 03 / BRD 03: No mention of this card background color |
| **Impact** | Developer might normalize to `$clr-bg-card` during implementation, changing the approved look |

**Fix:** Add note to Spec 03 and BRD 03:
```
Design Constraint: Course listing cards retain teal-dark (#203644) background. 
This is an intentional design choice approved by client. Do NOT change to $clr-bg-card (#0B0F19).
Future: consider adding $clr-course-card-bg to design tokens in packages/ui/styles/abstracts/_variables.scss.
```

---

## GAP-07: Portfolio Alternating Layout Not Documented

| Field | Detail |
|---|---|
| **Severity** | Low — layout behavior note |
| **Found in** | `apps/web/src/app/(nguoi-dung)/san-pham/page.tsx:41-54` |
| **Current state** | Portfolio items alternate: even-index items get `reversed` class → grid direction `rtl` on desktop breakpoint. This creates a zigzag layout: image-left-text-right, then image-right-text-left |
| **Docs state** | Spec 06 / BRD 06: No mention of alternating/reversed layout |
| **Impact** | Developer might render all items in uniform layout, losing the dynamic visual rhythm |

**Fix:** Add note to Spec 06 and BRD 06:
```
Layout Constraint: Portfolio items render with alternating grid direction on desktop (>=1024px).
Even-index items (idx % 2 === 1) receive CSS class "reversed" which flips image-text order.
This zigzag pattern is an approved visual design choice. On mobile, all items stack vertically in normal order.
```

---

## GAP-08: Animation Strategy Not Preserved in Documents

| Field | Detail |
|---|---|
| **Severity** | Medium — risk of losing approved motion design |
| **Found in** | 6 animation patterns across the frontend |
| **Current state** | |
| | 1. `hero-banner/index.logic.ts` — ScrollTrigger parallax on YouTube video (`y: 18%`, `scrub: 1.2`) + timeline fade-in |
| | 2. `work-section/index.tsx` — Inline useGSAP: cards `fromTo` opacity/y/scale, stagger 0.15 |
| | 3. `product-section/index.tsx` — Inline useGSAP: items `fromTo` opacity/y, stagger 0.2 |
| | 4. `animated-section/index.logic.ts` — Blur+fade reveal (`.reveal-item` children), stagger 0.12 |
| | 5. `stagger-reveal/index.logic.ts` — Fade+scale reveal (`[data-reveal]` children), stagger 0.06-0.08 |
| | 6. `khoa-hoc/[slug]/StickyCTA.logic.ts` — ScrollTrigger bottom-bar reveal |
| | ALL respect `prefers-reduced-motion: reduce` |
| | ALL use `power3.out` easing |
| **Docs state** | No document mentions animation preservation strategy |
| **Impact** | During dynamic conversion, developer might remove GSAP animations or change easing/timing — breaking the approved motion design |

**Fix:** Add to Blueprint Section 1 (after "Nguyên tắc thiết kế"):
```
### Animation Strategy (Preserved)

Tất cả GSAP/ScrollTrigger animations hiện tại **được giữ nguyên 100%**. Data source thay đổi (mockData → API) 
không ảnh hưởng đến animation layer. Các animation component vẫn import và hoạt động như cũ:

| Animation | File | Behavior | Trigger |
|-----------|------|----------|---------|
| Hero parallax | hero-banner/index.logic.ts | Video y: 18% scrub | ScrollTrigger |
| Work cards | work-section/index.tsx | opacity/y/scale, stagger 0.15 | top 75% |
| Product cards | product-section/index.tsx | opacity/y, stagger 0.2 | top 75% |
| Blur+fade reveal | animated-section/index.logic.ts | blur(8px)→0, y:50→0, stagger 0.12 | top 82% |
| Stagger reveal | stagger-reveal/index.logic.ts | opacity/y/scale, stagger 0.06-0.08 | top 85% |
| Sticky CTA bar | StickyCTA.logic.ts | y:40→0, fade in | bottom 105% |

Thêm animation mới → thêm component mới. Không refactor animation hiện có trừ khi được yêu cầu.
```

---

## GAP-09: Shared Molecules Not Used by Current Pages — Missing Migration Plan

| Field | Detail |
|---|---|
| **Severity** | Medium — code quality |
| **Found in** | `packages/ui/src/molecules/` vs inline rendering in pages |
| **Current state** | 9 molecules exist in shared UI library but are **NOT used** by any current page: |
| | `CourseCard` — exists but `/khoa-hoc/page.tsx` renders cards inline |
| | `ArticleCard` — exists but `/bai-viet/page.tsx` renders cards inline |
| | `PortfolioCard` — exists but `/san-pham/page.tsx` renders items inline |
| | `PresetCard` — exists but `/cong-cu/page.tsx` renders items inline |
| | `TestimonialCard` — exists, completely unused anywhere |
| | `HeroBanner` — exists but homepage uses custom `hero-banner` section component instead |
| | `FeatureCard` — exists, completely unused |
| | `BonusCard` — exists, completely unused |
| | `StickyPricing` — exists but course detail uses custom `CourseStickyCTA` instead |
| **Docs state** | Blueprint Phase 3.5 mentions "Use Shared Molecules" but no specific mapping or scenarios |
| **Impact** | Duplicate code, inconsistent styling, harder to maintain. Molecules may drift from actual usage patterns |

**Fix:** Add to Blueprint Section 3.5 — explicit migration mapping:

| Page | Current (inline) | Replace With |
|------|-----------------|-------------|
| `/khoa-hoc` | Inline card JSX | `<CourseCard slug title thumbnail price ratingCount externalCheckoutUrl isComboOnly buttonText />` |
| `/bai-viet` | Inline card JSX | `<ArticleCard slug title excerpt thumbnail author readTime publishedAt />` |
| `/san-pham` | Inline project JSX | `<PortfolioCard title description thumbnail category />` |
| `/cong-cu` | Inline product JSX | `<PresetCard name description price thumbnail tag />` |
| `/khoa-hoc/[slug]` (testimonials) | Inline card JSX | `<TestimonialCard name role quote avatar />` |
| `/khoa-hoc/[slug]` (bonuses) | Inline bonus JSX | `<BonusCard name value icon />` |
| `/khoa-hoc/[slug]` (sticky CTA) | Custom `CourseStickyCTA` | `<StickyPricing price originalPrice />` |

Each molecule's Props interface must be verified against actual data usage. If molecule Props are missing fields used by current pages, extend the Props interface.

---

## GAP-10: `CourseDetailExtras` Module Format vs DB Schema Mismatch

| Field | Detail |
|---|---|
| **Severity** | Low — format difference |
| **Found in** | `apps/web/src/lib/mockData.ts:18-27` vs Spec 03 DB schema |
| **Current state** | Mock modules have: `{ num: "#1", title: "...", desc: "..." }` — where `num` is a display string like "#1", "#5", "#8" |
| **DB Schema** | `course_modules`: `id, course_id, title, description, sort_order` — no `num` field |
| **Impact** | Module numbering ("#1", "#5") in current UI is a display artifact. With sort_order, numbering becomes sequential (1, 2, 3...) — this is actually BETTER and more logical. |

**Fix:** No schema change needed. Module display number becomes `sort_order + 1` or auto-index. Document this as intentional improvement in Spec 03:
```
Note: Module numbering in dynamic version is sequential (1, 2, 3...) based on sort_order, 
replacing the static non-sequential numbering ("#1", "#5", "#8") from mock data. 
This provides a more logical curriculum structure for students.
```

---

## GAP-11: Contact Page CSS Variable Pattern Inconsistency

| Field | Detail |
|---|---|
| **Severity** | Low — style inconsistency |
| **Found in** | `apps/web/src/app/(nguoi-dung)/lien-he/page.module.scss` |
| **Current state** | Contact form SCSS uses `var(--clr-text-primary)`, `var(--clr-border)` — CSS custom properties pattern. All other SCSS files use `$clr-text`, `$clr-border` — SCSS variable pattern |
| **Docs state** | Not relevant to specs |
| **Impact** | Inconsistency between SCSS files. No functional impact but may confuse developers |

**Fix:** Standardize to SCSS variables `$clr-*` pattern used throughout the rest of the codebase. Move to `packages/ui/styles/abstracts/_variables.scss` tokens.

---

## GAP-12: Blog Content — HTML String vs Block Content Transition

| Field | Detail |
|---|---|
| **Severity** | Low — known migration |
| **Found in** | `apps/web/src/lib/mockData.ts` — all articles have `content: "<p>Nội dung đang được cập nhật...</p>"` |
| **Current state** | Blog detail page renders `dangerouslySetInnerHTML` from article.content (HTML string) |
| **After migration** | Spec 02: content becomes `content_blocks` (JSON Block[]) → rendered via BlockRenderer |
| **Docs state** | Spec 02 & Spec 05 cover this transition |
| **Impact** | Seed data needs migration: placeholder HTML → empty blocks array or 1 paragraph block with placeholder text |

**Fix:** In seed migration script:
```typescript
// For articles with placeholder HTML content:
content_blocks = JSON.stringify([{
  id: crypto.randomUUID(),
  type: 'paragraph',
  data: { text: 'Nội dung đang được cập nhật...', alignment: 'left' }
}])
```
Document this in Spec 05 seed data section.

---

## GAP-13: `generateMetadata` Pattern — No Error Handling for Missing Entities

| Field | Detail |
|---|---|
| **Severity** | Low — edge case |
| **Found in** | `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx:8-20` |
| **Current state** | `generateMetadata` uses `mockCourses.find()` — if not found, returns `{ title: 'Không tìm thấy' }` |
| **After migration** | API call may fail (network error, DB error, slug not found) |
| **Docs state** | Not covered in any spec |
| **Impact** | Unhandled promise rejection in metadata generation |

**Fix:** Add to relevant specs (03, 05):
```gherkin
Scenario: generateMetadata handles API error gracefully
  Given the API is unavailable
  When the course detail page tries to generate metadata
  Then it should return default metadata { title: "Minh Travel" }
  And the page should still render with a fallback UI
```

---

## Summary

| # | Gap | Severity | Action |
|---|-----|----------|--------|
| GAP-01 | Footer bg image | Low | Add `footer_background_url` to site_settings |
| GAP-02 | Course detail section headings | Medium | Add 6 keys to site_settings (Option A) |
| GAP-03 | Course detail hero badge + subtitle | Medium | Badge → promotion. Subtitle → add `hero_subtitle` column to courses |
| GAP-04 | Brands/badges location ambiguity | Low | Brands → `hero_brands`. Badges → new `course_target_badges` key |
| GAP-05 | Blog white cards | Low | Add design constraint note to Spec/BRD 05 |
| GAP-06 | Course teal cards | Low | Add design constraint note to Spec/BRD 03 |
| GAP-07 | Portfolio alternating layout | Low | Add layout constraint note to Spec/BRD 06 |
| GAP-08 | Animation strategy | Medium | Add Animation Strategy section to Blueprint |
| GAP-09 | Molecules unused | Medium | Add explicit molecule migration mapping to Blueprint |
| GAP-10 | Module numbering | Low | Document as intentional improvement |
| GAP-11 | CSS variable inconsistency | Low | Standardize to SCSS variables |
| GAP-12 | HTML → Block content migration | Low | Document seed migration approach |
| GAP-13 | Metadata error handling | Low | Add error scenario to BDD specs |

### Action Plan

**Immediate (update documents before implementation):**
1. Add 7 new site_settings keys → `Spec 01` / `BRD 01`
2. Add `hero_subtitle` column → `Spec 03` / `BRD 03`
3. Add `course_target_badges` key → `Spec 01` / `BRD 01`
4. Add Animation Strategy section → `Blueprint` Section 1
5. Add Molecule Migration Mapping → `Blueprint` Section 3.5

**During Implementation (add notes):**
6. Blog white cards → code comment + Spec 05 note
7. Course teal cards → code comment + Spec 03 note
8. Portfolio alternating → code comment + Spec 06 note
9. Module sequential numbering → Spec 03 note
10. HTML→Blocks seed migration → Spec 05 seed section
11. Metadata error handling → Spec 03/05 BDD scenarios

**Low Priority (code cleanup):**
12. CSS variable standardization → during refactor Phase 3
