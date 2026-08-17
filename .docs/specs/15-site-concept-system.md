# Spec 15: Site Concept System — Layout Toàn Site Đồng Bộ

**Status:** Draft
**Created:** 2026-08-18
**Ref:** `.docs/brainstorming-site-concept.md` (brainstorming 18/08)
**BRD:** (mới — chưa có, tạo khi cần)
**Thay thế:** cơ chế Template + Engine hiện tại (spec cũ: `12-block-editor-v2-config-renderers.md` không liên quan; thay thế trực tiếp phần `layout-engine.ts` + `layout-wizard`)

---

## 1. Feature Description

Thay cơ chế "Template + Engine" (hiện đang gây mơ hồ: engine chỉ đổi animation, homepage engine chết, skeleton tĩnh) bằng **1 hệ thống Concept toàn site**:

1. Admin chọn **1 concept** duy nhất → **toàn bộ website** (homepage, khóa học list+detail, dự án list+detail, công cụ, liên hệ, bài viết) đổi theo cùng 1 DNA thiết kế.
2. **5 concept** handcode Server Component (SSR), mỗi concept thật sự khác biệt ở 4 chiều: layout danh sách, thứ tự section, style visual, concept chủ đạo.
3. Preview trong admin dùng **dữ liệu thật render thu nhỏ** — admin nhìn là hiểu concept khác nhau chỗ nào.
4. Lưu **1 key `site_concept`**; bỏ hẳn các key template/engine cũ.

### 5 Concept (đã chốt)

| ID | Tên | DNA |
|---|---|---|
| `cinematic` | Điện ảnh | Full-viewport video/ảnh, typo lớn đè hình, parallax scrub (default) |
| `minimal` | Tối giản | Monochrome + hairline border, small-caps, kỷ luật lưới |
| `bento` | Bento | Lưới tile bo góc kích thước khác, mỗi loại nội dung 1 tile |
| `editorial` | Biên tập | Serif display lớn, grid bất đối xứng, pull-quote, whitespace rộng |
| `gallery` | Thư viện | Hình dẫn đầu, masonry/filmstrip, text overlay hover |

### Scope chính thức (sau review)

| Trang | Có áp concept? |
|---|---|
| Homepage `/` | ✅ |
| Khóa học list `/khoa-hoc` | ✅ |
| Khóa học detail `/khoa-hoc/[slug]` | ❌ **Loại khỏi scope** — giữ nguyên `SectionRenderer` hiện tại |
| Dự án list `/san-pham` | ✅ |
| Dự án detail `/san-pham/[id]` | ✅ |
| Công cụ `/cong-cu` | ✅ |
| Liên hệ `/lien-he` | ✅ |
| Bài viết `/bai-viet` + `[slug]` | ✅ |

---

## 2. User Stories

### US-15.1: Admin chọn concept toàn site với preview dữ liệu thật

> **As an** Administrator
> **I want to** chọn 1 concept từ danh sách và xem preview thật
> **So that** tôi hiểu chính xác website sẽ trông thế nào trước khi áp dụng

**Acceptance Criteria:**
- Tab "Giao diện" (`/quan-tri-vien/cai-dat`) hiển thị danh sách 5 concept (tên + mô tả + thumbnail tĩnh đại diện)
- Click 1 concept → khung preview bên phải (iframe) reload với concept đó qua cookie `preview_settings`
- Preview dùng **dữ liệu thật** (courses, portfolios, products, counters từ API) do SSR render — phản ánh đúng typography, layout danh sách, thứ tự section
- Concept hiện tại đang áp dụng được đánh dấu "Đang dùng"
- Cơ chế preview dùng **cookie** `preview_settings` (SSR đọc được qua `cookies()`), KHÔNG dùng localStorage/sessionStorage (Server Component không đọc được)

### US-15.2: 5 concept handcode, khác biệt thật

> **As a** Developer
> **I want to** handcode 5 concept là Server Component thuần
> **So that** mỗi concept cho ra layout khác biệt thật (không chỉ animation) và tương thích SSR

**Acceptance Criteria:**
- 5 concept đều là Server Component (không `"use client"` ở lớp layout; motion là progressive enhancement)
- Khác biệt tối thiểu giữa 2 concept bất kỳ phải ở **≥2 trong 4 chiều**: layout danh sách, thứ tự section, style visual, concept chủ đạo
- Không concept nào chỉ khác nhau ở animation/GSAP

### US-15.3: Concept áp lên toàn bộ trang (trừ course detail)

> **As a** Visitor
> **I want to** thấy cùng 1 concept đồng bộ trên mọi trang
> **So that** website có sự liên kết và nhất quán

**Acceptance Criteria:**
- Concept chi phối 7 loại trang: Homepage, Khóa học list, Dự án list, Dự án detail, Công cụ, Liên hệ, Bài viết (list + detail)
- **Course detail (`/khoa-hoc/[slug]`) nằm ngoài scope** — giữ nguyên `SectionRenderer` (14 section type) hiện tại, không bị concept chi phối
- Homepage: concept toàn quyền sắp xếp thứ tự + layout 6 section (hero, promotion, work, products, counter, about)
- List pages: concept quyết định layout danh sách (grid/list/masonry/tile)
- Liên hệ + bài viết: lần đầu có concept (hiện chưa có template)

### US-15.4: Lưu `site_concept`, bỏ key cũ

> **As a** Developer
> **I want to** dùng 1 key `site_concept` duy nhất và xóa key template/engine cũ
> **So that** không còn dữ liệu chết và code không còn 2 cơ chế song song

**Acceptance Criteria:**
- `site_concept` là key duy nhất quyết định concept (giá trị: `cinematic | minimal | bento | editorial | gallery`)
- Các key cũ bị bỏ: `homepage_template`, `homepage_portfolios_engine`, `homepage_products_engine`, `courses_template`, `courses_list_engine`, `portfolio_template`, `portfolio_list_engine`, `presets_template`, `presets_list_engine`
- Code `layout-engine.ts` + `layout-wizard/` + toàn bộ `_templates/*` (7 file homepage/courses/portfolio/presets) được xóa hoặc thay thế bằng cơ chế concept mới
- `homepage_motion` được gộp vào concept (mỗi concept tự định nghĩa motion mặc định; bỏ field chọn motion riêng + cập nhật `getHomepageMotion` cho 5 section component đang dùng)
- **Migrate**: map giá trị cũ sang concept để tránh visitor bị "nhảy layout" đột ngột — `homepage_template=compact` → `minimal`, `default` → `cinematic` (quyết định cuối ở PLAN)
- Fallback khi `site_concept` chưa set: `cinematic`

---

## 3. Kiến trúc đề xuất

```
apps/web/src/concepts/
├── index.ts                  // registry: id → Component + meta (label, description, tone)
├── shared/                   // tokens + helper dùng chung (parseSetting, motion)
├── cinematic/
│   ├── tokens.module.scss
│   ├── Homepage.tsx          // server
│   ├── CourseList.tsx
│   ├── PortfolioList.tsx
│   ├── PortfolioDetail.tsx
│   ├── Products.tsx
│   ├── Contact.tsx
│   ├── Blog.tsx
│   └── BlogDetail.tsx
├── minimal/ ...
├── bento/ ...
├── editorial/ ...
└── gallery/ ...

apps/web/src/app/(nguoi-dung)/
├── page.tsx                  // đọc site_concept → render Concept.Homepage
├── khoa-hoc/page.tsx         // → Concept.CourseList
├── khoa-hoc/[slug]/page.tsx  // KHÔNG đổi — giữ nguyên SectionRenderer
├── san-pham/page.tsx         // → Concept.PortfolioList
├── san-pham/[id]/page.tsx    // → Concept.PortfolioDetail
├── cong-cu/page.tsx          // → Concept.Products
├── lien-he/page.tsx          // → Concept.Contact
├── bai-viet/page.tsx         // → Concept.Blog
└── bai-viet/[slug]/page.tsx  // → Concept.BlogDetail
```

**Key đơn giản:** mỗi trang public chỉ cần `const Concept = getConcept(settings.site_concept); return <Concept.X ... />`. Data fetch giữ nguyên ở từng page (không chuyển vào concept).

---

## 4. BDD Scenarios

```gherkin
Feature: Site Concept System

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"

  Scenario: Admin chọn concept và thấy preview dữ liệu thật
    When I open the "Giao diện" tab
    Then I should see a list of 5 concepts (name + description + thumbnail)
    And the current active concept should be marked "Đang dùng"
    When I click the "Minimal" concept
    Then the preview iframe should reload showing the homepage in Minimal concept
    And the "Minimal" card should be highlighted as selected

  Scenario: Lưu concept áp dụng cho toàn site
    Given I have selected the "Bento" concept
    When I click "Lưu"
    Then "site_concept" should be saved as "bento" in site_settings
    And the success message should show "Đã lưu concept Bento"
    When a visitor opens the homepage
    Then the homepage should render in Bento concept
    And opening "/khoa-hoc", "/san-pham", "/cong-cu", "/lien-he", "/bai-viet" should also render in Bento concept

  Scenario: Course detail không bị concept chi phối
    Given "site_concept" is set to "editorial"
    And a course exists with sections (hero_banner, curriculum_highlights, pricing_card)
    When a visitor opens "/khoa-hoc/<slug>"
    Then the page should render via SectionRenderer as before
    And the concept should have no effect on the course detail layout

  Scenario: Concept fallback khi chưa set
    Given "site_concept" is not set in site_settings
    When a visitor opens the homepage
    Then the homepage should render in Cinematic concept (default)

  Scenario: Khác biệt layout giữa 2 concept
    Given data has 6 courses, 6 portfolios, 4 products, 4 counters
    When I preview "Cinematic" concept
    Then the course list should render full-bleed with overlay text
    When I preview "Minimal" concept
    Then the course list should render as hairline-separated rows
    And the two layouts should be visibly different (not just animation)

  Scenario: Key cũ bị bỏ
    Given "site_concept" is set to "minimal"
    And legacy keys (homepage_template, courses_list_engine, etc.) still exist in DB
    When a visitor opens any page
    Then rendering should use only "site_concept"
    And legacy keys should have no effect on the layout

  Scenario: Admin đổi concept không mất data
    Given I am viewing "Cinematic" concept
    When I switch to "Gallery" concept
    Then all content data (courses, portfolios, products, counters, settings) should remain unchanged
    And only the presentation should change
```

---

## 5. Technical Constraints

| Constraint | Detail |
|---|---|
| **SSR** | Concept component là Server Component; GSAP/ScrollTrigger chỉ load ở client island (progressive enhancement) |
| **Key** | `site_concept` (enum: cinematic, minimal, bento, editorial, gallery) |
| **Fallback** | `cinematic` khi thiếu key |
| **Preview** | Dùng cookie `preview_settings` hiện có (`lib/settings.ts`); KHÔNG dùng localStorage/sessionStorage (SSR không đọc được) |
| **Course detail** | Nằm ngoài scope — giữ nguyên `SectionRenderer` + `section-render-map.tsx` |
| **Cleanup** | Xóa `layout-engine.ts`, `layout-wizard/`, toàn bộ `_templates/*` (7 file), field `homepage_motion` + các field `layout-template`/`hidden` trong `field-defs.ts` section `design` |
| **Data fetch** | Giữ nguyên ở từng page (không chuyển vào concept) — concept chỉ nhận data qua props |
| **Brand** | Mọi concept giữ accent `#FF005A` làm điểm nhấn; nền dark là mặc định, concept được phép đổi tone (VD editorial có thể dùng nền sáng) |
| **A11y** | `prefers-reduced-motion` tôn trọng; contrast đạt WCAG AA |
| **Responsive** | Mọi concept responsive mobile < 768px |

---

## 6. Dependencies

- `lib/settings.ts` (getSiteSettings + preview cookie) — dùng lại nguyên vẹn
- `lib/api.ts` (fetch server) — dùng lại
- UI atoms (`packages/ui`): Badge, Button, PageHeader, Breadcrumbs, Accordion, Counter, CourseCard, PortfolioCard, PresetCard — tái dùng, không viết lại
- Section components (hero-banner, work-section, product-section, counter-section, about-section, promotion-banner) — concept tái dùng hoặc thay thế bằng layout riêng

---

## 7. Implementation Phases

| Phase | Milestone | Deliverables |
|---|---|---|
| **0** | Foundation | `concepts/index.ts` registry + `getConcept()` + `site_concept` key + fallback + migrate map |
| **1** | 2 concept mẫu | Cinematic + Minimal (homepage + 3 list + detail + liên hệ + bài viết) |
| **2** | 3 concept còn lại | Bento + Editorial + Gallery |
| **3** | Admin UI | Thay layout-wizard bằng danh sách concept + preview iframe (cookie) |
| **4** | Cleanup | Xóa layout-engine, layout-wizard, `_templates/*`, key legacy, homepage_motion |
| **5** | Verify | Build + lint + test SSR render từng concept |

---

## 8. Open Questions (đã chốt trong session)

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Bao nhiêu concept? | 5 (Cinematic, Minimal, Bento, Editorial, Gallery) |
| 2 | Concept default? | `cinematic` |
| 3 | Course detail (14 section type)? | **Loại khỏi scope** — giữ nguyên SectionRenderer |
| 4 | `homepage_motion`? | Gộp vào concept, bỏ field riêng |
| 5 | Preview dùng cơ chế gì? | Cookie `preview_settings` (SSR đọc được) |
| 6 | Video nền hero (YouTube/upload)? | **Mọi concept đều có video nền** (làm nền mờ/khác layout); không phải riêng Cinematic |
| 7 | Tone màu từng concept? | **Tất cả dark tone** (accent `#FF005A`); Editorial dùng serif + grid bất đối xứng làm bản sắc, không dùng nền sáng (tránh conflict với component chung hardcode dark) |
