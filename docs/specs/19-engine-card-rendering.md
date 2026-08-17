# Spec 19: Engine-Driven Card Rendering for 3 Content Pages

**Status:** Draft
**Created:** 2026-08-10
**Ref Brainstorming:** `.docs/v2-fix-three-pages-brainstorming.md`
**Depends on:** Multi-Layout Design System (`lib/layout-engine.ts`, 11 template components, `field-defs.ts`, `LayoutWizard`)

---

## Feature Description

Hoàn thiện hệ thống Multi-Layout Design System cho 3 trang còn lại: `/khoa-hoc`, `/san-pham`, `/cong-cu`. Mỗi template nhận thêm `engine` prop và tự switch card rendering — không cần engine component riêng. Wizard hỗ trợ chọn page. Fix 3 bug `void`.

---

## User Stories

### US-19.1: Admin chọn engine cho trang Khóa học

> **As an** Administrator
> **I want to** choose how course cards are displayed (grid/list)
> **So that** visitors see courses in the layout I prefer

**Acceptance Criteria:**
- Template `courses-default` nhận `engine` prop (grid/list)
- `engine = "grid"` → cards dạng lưới 2-3 cột (layout hiện tại)
- `engine = "list"` → mỗi khóa học hiển thị dạng row ngang: ảnh trái 280px, info phải (title, desc, price, CTA)
- Template `courses-minimal` và `courses-full` cũng hỗ trợ engine
- Settings key `courses_list_engine` quyết định engine mặc định
- Nếu key chưa set → default `grid`

### US-19.2: Admin chọn engine cho trang Dự án

> **As an** Administrator
> **I want to** choose how portfolio items are displayed (stacked/masonry)
> **So that** the portfolio page matches my creative vision

**Acceptance Criteria:**
- Template `portfolio-default` nhận `engine` prop
- `engine = "stacked"` → ảnh trái text phải (layout hiện tại)
- `engine = "masonry"` → grid masonry: `columns: 3; column-gap: 1rem`
- Template `portfolio-categorized` và `portfolio-showcase` cũng hỗ trợ engine
- Settings key `portfolio_list_engine` quyết định

### US-19.3: Admin chọn engine cho trang Công cụ

> **As an** Administrator
> **I want to** choose how product cards are displayed (grid/single-col)
> **So that** the presets page looks optimal for the number of products

**Acceptance Criteria:**
- Template `presets-default` nhận `engine` prop
- `engine = "grid"` → grid 3 cột (layout hiện tại)
- `engine = "single-col"` → mỗi product 1 row full-width
- Settings key `presets_list_engine` quyết định

### US-19.4: Admin chọn trang trong Wizard

> **As an** Administrator
> **I want to** switch between pages in the layout wizard
> **So that** I can configure layout for all pages from one place

**Acceptance Criteria:**
- Wizard header có dropdown "Trang đang chỉnh sửa" với 4 options: Trang chủ, Khóa học, Dự án, Công cụ
- Đổi trang → template selector hiển thị templates của trang đó
- Đổi trang → engine selector hiển thị content types của trang đó
- Đổi trang → preview iframe chuyển sang URL của trang đó
- Đổi trang → formData load settings của trang đó
- Cookie preview cũ bị xóa khi đổi trang

---

## BDD Scenarios

### Feature: Course Card Engines

```gherkin
Feature: Course Card Engines

  Background:
    Given a course "TikTok Cơ Bản" exists
    And a course "Premiere Pro" exists
    And I am a website visitor

  Scenario: View courses in grid layout (default)
    Given settings.courses_list_engine is not set
    When I visit "/khoa-hoc"
    Then courses are displayed in a grid of 2-3 columns
    And each card shows: thumbnail, title, description, price, CTA button

  Scenario: View courses in list layout
    Given settings.courses_list_engine = "list"
    When I visit "/khoa-hoc"
    Then courses are displayed in vertical rows
    And each row has: thumbnail (280px left), title, description, price, CTA (right)
    And rows stack vertically with spacing

  Scenario: Grid is fallback for invalid engine
    Given settings.courses_list_engine = "nonexistent"
    When I visit "/khoa-hoc"
    Then courses are displayed in grid layout (fallback)


Feature: Portfolio Card Engines

  Scenario: View portfolios in stacked layout (default)
    Given settings.portfolio_list_engine is not set
    When I visit "/san-pham"
    Then portfolios are displayed with thumbnail left, info right
    And each item alternates layout direction

  Scenario: View portfolios in masonry layout
    Given settings.portfolio_list_engine = "masonry"
    When I visit "/san-pham"
    Then portfolios are displayed in a masonry grid
    And thumbnails keep their natural aspect ratio
    And items have no alternating layout


Feature: Product Card Engines

  Scenario: View products in grid layout (default)
    Given settings.presets_list_engine is not set
    When I visit "/cong-cu"
    Then products are displayed in a grid of 3 columns
    And each card shows: thumbnail, tag, title, description, price, "Mua ngay"

  Scenario: View products in single column layout
    Given settings.presets_list_engine = "single-col"
    When I visit "/cong-cu"
    Then each product is displayed as a full-width row
    And product info is shown alongside the thumbnail


Feature: Admin Changes Engine via Wizard

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"
    And I select tab "Giao diện"

  Scenario: Switch to courses page and change engine
    Given the wizard is showing homepage config
    When I select "Khóa học" from the page dropdown
    Then the wizard shows courses templates (Default, Minimal, Full)
    And the engine selector shows "Khóa học" dropdown
    When I change engine from "Lưới" to "Danh sách"
    Then the preview iframe reloads showing "/khoa-hoc"
    And courses are displayed in list layout

  Scenario: Switch to portfolio page and change engine
    When I select "Dự án" from the page dropdown
    And I change engine from "Xen kẽ" to "Masonry"
    Then the preview iframe shows "/san-pham" with masonry layout

  Scenario: Save engine settings for courses page
    Given I have changed courses engine to "list"
    When I click "Lưu thay đổi"
    Then PUT /api/settings/batch is called with courses_list_engine = "list"
    And the cookie preview_settings is cleared
    And a success toast is shown

  Scenario: Switching pages clears old preview
    Given I am editing homepage
    And I have unsaved changes (preview cookie exists)
    When I switch to "Khóa học" page
    Then the preview cookie is cleared
    And the wizard loads fresh settings from DB for courses page


Feature: Template Switch on 3 Pages

  Scenario: Courses page - switch to minimal template
    Given settings.courses_template = "minimal"
    When I visit "/khoa-hoc"
    Then the Brand section is NOT shown
    And only Hero → Courses → FAQ are visible
    And courses use the engine from settings.courses_list_engine

  Scenario: Courses page - switch to full template
    Given settings.courses_template = "full"
    When I visit "/khoa-hoc"
    Then the Trust section appears after Hero
    And the Brand section appears
    And the CTA section appears at the bottom

  Scenario: Portfolio page - switch to categorized template
    Given settings.portfolio_template = "categorized"
    When I visit "/san-pham"
    Then category filter buttons appear above the portfolio list

  Scenario: Portfolio page - switch to showcase template
    Given settings.portfolio_template = "showcase"
    And a portfolio "Featured Project" exists
    When I visit "/san-pham"
    Then the first portfolio is shown as a hero section
    And remaining portfolios are shown in the list below

  Scenario: Presets page - switch to featured template
    Given settings.presets_template = "featured"
    When I visit "/cong-cu"
    Then the first product is shown as a hero card
    And remaining products are shown in a smaller grid
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Engine implementation** | Switch inline trong template (không tách file riêng) |
| **Engine count per page** | 2 engines: default (giữ nguyên) + 1 new variant |
| **Fallback** | Engine ID không hợp lệ → fallback về default (grid/stacked/grid) |
| **Template Props** | Thêm `engine?: string` vào mỗi Props interface |
| **Wizard page selector** | Dropdown `<select>` với 4 PAGE_CONFIGS keys |
| **Wizard page switch** | Khi đổi page, reset formData về page mới, clear cookie cũ |
| **SCSS reuse** | Template tiếp tục import `../page.module.scss`, thêm class cho engine variant |

---

## Card Variant Specifications

### CourseRow (list engine)

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                │
│ │          │  Title (18px bold)                              │
│ │ Thumbnail│  Description text (2-3 lines, muted)            │
│ │ 280x180  │  Price (40px)           [Mua ngay button]       │
│ │          │                                                │
│ └──────────┘                                                │
└──────────────────────────────────────────────────────────────┘
```

Layout: `display: flex; gap: 2rem;` — thumbnail 280px fixed width, info flex-grow.

### Masonry Grid (portfolio masonry engine)

```
┌─────┐ ┌───┐ ┌──────┐
│     │ │   │ │      │
│     │ │   │ │      │
│     │ │   │ │      │
└─────┘ │   │ │      │
        │   │ └──────┘
┌───┐   └───┘
│   │   ┌─────┐
│   │   │     │
└───┘   │     │
        └─────┘
```

CSS: `columns: 3; column-gap: 1rem; break-inside: avoid;`

### Single Column (product single-col engine)

```
┌─────────────────────────────────────────┐
│ ┌──────────┐                            │
│ │ Thumbnail│  Title                     │
│ │ 400x300  │  Description               │
│ │          │  Price       [Mua ngay]   │
│ └──────────┘                            │
└─────────────────────────────────────────┘
```

Layout: `display: flex; gap: 2rem;` — thumbnail 400px, info flex-grow.

---

## API Endpoints (không thay đổi)

| Method | Endpoint | Auth | Dùng cho |
|--------|----------|------|----------|
| `GET` | `/api/settings` | Public | Đọc engine + template keys |
| `PUT` | `/api/settings/batch` | Admin | Lưu engine + template keys |

---

## Files to Create/Modify

### MODIFY

| File | Change |
|------|--------|
| `khoa-hoc/page.tsx` | Xóa `void getCoursesEngine()`, truyền `engine={engine}` vào Template |
| `san-pham/page.tsx` | Xóa `void getPortfolioEngine()`, truyền `engine={engine}` vào Template, xóa dead `getPortfolioItem` |
| `cong-cu/page.tsx` | Xóa `void getPresetsEngine()`, truyền `engine={engine}` vào Template |
| `khoa-hoc/_templates/courses-default.tsx` | Thêm `engine?: string`, switch grid/list |
| `khoa-hoc/_templates/courses-minimal.tsx` | Thêm `engine?: string`, switch grid/list |
| `khoa-hoc/_templates/courses-full.tsx` | Thêm `engine?: string`, switch grid/list |
| `san-pham/_templates/portfolio-default.tsx` | Thêm `engine?: string`, switch stacked/masonry |
| `san-pham/_templates/portfolio-categorized.tsx` | Thêm `engine?: string`, switch stacked/masonry |
| `san-pham/_templates/portfolio-showcase.tsx` | Thêm `engine?: string`, switch stacked/masonry |
| `cong-cu/_templates/presets-default.tsx` | Thêm `engine?: string`, switch grid/single-col |
| `cong-cu/_templates/presets-featured.tsx` | Thêm `engine?: string`, switch grid/single-col |
| `LayoutWizard.tsx` | Thêm page selector dropdown |

### MODIFY

| File | Change |
|------|--------|
| `khoa-hoc/page.module.scss` | Thêm `.listRow`, `.listThumb`, `.listInfo` cho list engine |
| `san-pham/page.module.scss` | Thêm `.masonryGrid`, `.masonryItem` cho masonry engine |
| `cong-cu/ProductGrid.tsx` | Thêm `layout?: string` prop, thêm single-col branch |

---

## Dependencies

- Multi-Layout Design System core (`lib/layout-engine.ts`)
- 11 template components (đã có)
- `LayoutWizard` (đã có)
- `field-defs.ts` (đã có section "Giao diện")

---

## Next Steps

`/bdd-review` → `/bdd-dev`
