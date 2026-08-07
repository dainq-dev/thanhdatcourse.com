# Brainstorming Session: Admin Redesign — Quản lý Khóa học & Dự án

**Date**: 2026-08-02
**Technique(s) used**: SCAMPER, Six Thinking Hats, Feasibility Matrix
**Reference**: minhtravel.vn (WordPress), thanhdatcomputer.com (Next.js 16)
**Design principles**: Hallmark v1.1.0, taste-skill v2, way-of-reasoning

---

## Phase 1: Frame the Problem

### Problem Statement (one sentence)
Admin giao diện quản lý Khóa học và Dự án **thiếu config-driven live preview, dùng form đơn giản thay vì purpose-built editor, không có visual feedback real-time, UI lạc tone với brand chính.**

### Ask "Why?" 3 times

| # | Why? | Answer |
|---|------|--------|
| 1 | **Why** is the current admin not meeting the requirement? | Form-based editing feels like a database entry, not a content creation tool. No WYSIWYG visual editing for course landing pages. The iframe "preview" is just the public page — not a live editor view. |
| 2 | **Why** does this matter for the business? | Minh Travel sells premium courses (2-10 million VND). The course page IS the sales page. If admin can't craft the sales page well, conversion drops. Reference site shows course detail pages are long-form landing pages with countdowns, bonus grids, hero sections, pricing tiers. |
| 3 | **Why** can't the current approach be improved incrementally? | The split layout (520px form + iframe) works for simple data entry. But courses need: visual curriculum builder, pricing tier editor, block-based content editor, brand asset management. These don't fit in a form. Portfolio needs video embed, thumbnail management, category ordering. |

### Define Success
After redesign, admin user can:
1. See **real-time visual feedback** as they edit course/portfolio content — what you configure is what visitors see
2. Use **purpose-built editors** for curriculum (tree drag-drop), pricing (tier comparison), portfolio (video grid)
3. Navigate a **cohesive dark-themed admin** that matches the brand identity (#000000 bg, #FF005A accent)
4. Complete a course landing page build in < 10 minutes from scratch

### Identify Assumptions

| # | Assumption | Challenge |
|---|-----------|-----------|
| 1 | "Admin needs to be light theme for readability" | The brand IS dark. Notion, Linear, Stripe all have dark admin panels. Readability is about contrast, not light mode. |
| 2 | "iframe preview is good enough" | iframe has no edit capabilities. Real editors (Shopify, Webflow, Framer) all use canvas-based editing with live DOM manipulation. |
| 3 | "Modules/lessons need to be in a collapsible tree" | True but current implementation is nested inline forms — no drag-to-reorder, no bulk operations, no visual relationship view. |
| 4 | "Portfolio management is just a table" | Reference site shows video portfolio — needs thumbnail preview, YouTube embed, brand partner tag, drag ordering. |
| 5 | "We need separate pages for create/edit settings" | A single unified editor with context switching is faster and reduces mental context switching. |

---

## Phase 2: Current UI Audit (What's Wrong)

### 2.1 Visual Design Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| V1 | Admin is **light theme** (`#F8F8F7` bg, `#1A1A1A` text) while the public site is **dark theme** (`#000000` bg, `#FF005A` accent) | High | `layout.module.scss` |
| V2 | No design token usage — all colors are hardcoded hex values | High | All `*.module.scss` files |
| V3 | Sidebar active state uses `#235689` (blue) and `#06a84c` (green) accent — neither is the brand primary `#FF005A` | Medium | `layout.module.scss:66-68` |
| V4 | Sidebar logo text is "Minh Travel" hardcoded — not reactive to settings | Low | `layout.tsx:94` |
| V5 | Table design is generic — no density options, no card view alternative | Medium | `page.module.scss:71-101` |
| V6 | Buttons are plain monochrome (`#1A1A1A` bg) — no brand accent usage | Medium | Multiple files |
| V7 | No skeleton loading states — only text "Đang tải..." | Low | `page.module.scss:181` |
| V8 | Empty states are just text — no illustration or call-to-action | Low | `page.module.scss:182` |

### 2.2 UX Issues — Course Admin

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| C1 | Curriculum editor is a **collapsible inline form** — no drag-to-reorder modules, no bulk lesson management | **Critical** | `[slug]/page.tsx:157-166` |
| C2 | The iframe preview shows the **public page** — not an editable canvas | **Critical** | `[slug]/page.tsx:199-208` |
| C3 | No **block editor** for course content (posts have it, courses don't) | **Critical** | API supports `contentBlocks` but admin form doesn't expose it |
| C4 | Price is a single field — no **pricing tier editor** (1 year, forever, combo) | High | `tao-moi/page.tsx:55` |
| C5 | No **countdown timer** config for sales urgency | Medium | Not implemented |
| C6 | No **student success stories** management | Medium | Not implemented |
| C7 | No **bonus/ưu đãi visual preview** — just text list | Low | `[slug]/page.tsx:169-180` |
| C8 | Modules/lessons: no **bulk import** (copy-paste from Google Sheets) | Low | Not implemented |
| C9 | Auto-save is silent — no visual indicator when saving | Low | `[slug]/page.tsx:77-97` |
| C10 | 4 tabs force context switching — can't see Info while editing Curriculum | Medium | `[slug]/page.tsx:115-120` |

### 2.3 UX Issues — Portfolio Admin

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| P1 | **No admin page exists** — 3-line placeholder | **Critical** | `san-pham/page.tsx:1-3` |
| P2 | **No admin page for Digital Products/Presets** — same placeholder | **Critical** | `san-pham/page.tsx` |
| P3 | Sidebar link "Dự án thực hiện" points to wrong route (`/san-pham` which is public page, not admin) | **Critical** | `layout.tsx:20` |
| P4 | No portfolio CRUD UI at all | **Critical** | API exists, no UI |
| P5 | No video embed preview for YouTube links | High | Not implemented |

### 2.4 Architectural Issues

| # | Issue | Severity |
|---|-------|----------|
| A1 | All course edit state is in a single `useState` object — no reducer, no undo/redo for courses | Medium |
| A2 | No shared component library between admin pages — each page has its own SCSS with duplicated patterns | Medium |
| A3 | API client requires localStorage token — no middleware-based auth refresh | Low |
| A4 | No optimistic updates — every save waits for API response | Low |

---

## Phase 3: Ideation — Structured Solutions

### 3.1 SCAMPER Analysis

#### SUBSTITUTE: What can we replace?

| Current | Proposed | Benefit |
|---------|----------|---------|
| Form-based course editor | **Canvas-based visual editor** (like Shopify sections or Webflow) | Real-time visual feedback |
| Light theme admin | **Dark theme matching brand** (#000000 bg, #FF005A accent) | Brand consistency |
| Text-based iframe preview | **Live canvas with edit overlays** | Direct manipulation |
| Separate create/edit pages | **Unified editor with new/save/save-as** | Fewer clicks |
| Inline form for modules | **Drag-drop tree builder** | Visual curriculum |
| Table view for courses list | **Card grid + table toggle** | Better visual scanning |
| Placeholder portfolio | **Video grid manager** with thumbnails | Functionality |

#### COMBINE: What can we merge?

| Combine | Result |
|---------|--------|
| Course settings + live preview | **Split-pane with sync scroll** — left edits, right shows immediately in context |
| Block editor + course landing pages | **Unified block system** — posts AND courses use same blocks |
| Portfolio + product management | **Unified "Content" hub** — portfolio + presets under one tab, shared media picker |
| Pricing tiers + countdown timer + bonuses | **"Sales Page Builder"** — one tab that handles all conversion elements |
| Testimonials + Student Stories | **"Social Proof" manager** — manage all social proof in one place |

#### ADAPT: What can we borrow from great tools?

| Inspiration | What to Adapt | For What |
|-------------|--------------|----------|
| **Notion** | Sidebar navigation, block-based editing, / command, drag-drop | Block editor, navigation |
| **Shopify Sections** | Per-section editing with live preview, reorder sections | Course landing page builder |
| **Linear** | Keyboard shortcuts, command palette (⌘K), minimal dark UI | Admin productivity |
| **Framer** | Canvas-based visual editing with property panel on right | Visual course editor |
| **Webflow CMS** | Collection-based content with visual preview, publish/draft | Content management |
| **Stripe Dashboard** | Data density, clear hierarchy, status badges, quick actions | Dashboard redesign |

#### MODIFY: What can we change about current features?

| Current | Modification |
|---------|-------------|
| 4 tabs in course edit | → **Vertical nav + full-height scroll** — no tab switching, all visible |
| iframe preview | → **Canvas panel with overlay controls** — click on elements to edit |
| Text-only modules list | → **Visual tree** with drag handles, collapse/expand, color coding |
| Single price field | → **Pricing tier table** with columns: name, price, original, duration, checkout URL, active |
| No course content blocks | → **Full block editor** (same as posts) for course landing pages |
| Plain bonus list | → **Card grid preview** showing exactly how bonuses render on frontend |

#### PUT TO OTHER USE: Repurpose existing components

| Existing Component | New Use |
|--------------------|---------|
| Block editor (from posts) | Course landing page builder |
| Media manager modal | Portfolio video picker |
| Settings page preview | Course live preview canvas |
| Reference field auto-fill | Course → instructor auto-populate |

#### ELIMINATE: What can we remove?

| Remove | Why |
|--------|-----|
| Separate `/tao-moi` (create) page | Replace with "New Course" dialog or empty editor state |
| The blue/green accent colors in sidebar | Replace with brand #FF005A |
| Manual slug input | Auto-generate with option to customize (already exists, keep) |
| "Hủy" back buttons | Replace with unsaved changes dialog |
| Text "Đang tải..." spinners | Replace with skeleton loaders |

#### REVERSE: What if we flipped the approach?

| Reverse | Insight |
|---------|---------|
| Instead of admin CRUD-ing data → public page renders it | **Content is the editor.** Admin sees the exact public layout with inline edit controls. Edit-in-place. |
| Instead of left-form + right-preview | **Full-width canvas with floating property panel.** The content IS the editor. |
| Instead of separate "save" action | **Auto-save always, with version history.** Every change persists. "Publish" is the only manual action. |

### 3.2 Design Concept: 3 Candidate Directions

#### Concept A: "Content Canvas" (Recommended)
**Like:** Shopify Sections + Notion blocks + Framer canvas

```
 ┌──────────────────────────────────────────────────────────────┐
 │ [⌘K]  ⌂ Dashboard  /  Khóa học  /  {Tên khóa học}           │
 ├──────────────────┬───────────────────────────────────────────┤
 │ SECTIONS         │                                           │
 │ ─────────        │  ┌──────────────────────────────────┐     │
 │ ● Hero Banner    │  │   ƯU ĐÃI GIẢM GIÁ 90%          │     │
 │ ○ Brand Partners │  │                                  │     │
 │ ○ Target Badges  │  │   30 NGÀY SÁNG TẠO VIDEO        │     │
 │ ○ Curriculum     │  │   TIKTOK TRIỆU VIEW!            │     │
 │ ○ Bonuses        │  │                                  │     │
 │ ○ Testimonials   │  │   [Edit tiêu đề ✎]              │     │
 │ ○ FAQ            │  │   [Edit mô tả ✎]               │     │
 │ ○ CTA / Pricing  │  │   [ĐĂNG KÝ NGAY!] → Edit URL    │     │
 │ ─────────        │  │                                  │     │
 │ [+ Add Section]  │  └──────────────────────────────────┘     │
 │                  │                                           │
 │ PUBLISH STATUS   │  ↑ This is the LIVE page, split-scroll   │
 │ ○ Draft          │  ↔ Click any element to edit directly    │
 │                  │                                           │
 └──────────────────┴───────────────────────────────────────────┘
```

**Pros:**
- Edit-in-place = WYSIWYG
- Section-based = matches minhtravel.vn landing page structure
- Expandable = add custom sections via block editor
- Familiar = Shopify merchants, Notion users

**Cons:**
- More complex to build (canvas overlay system)
- Needs CSS isolation for edit overlays
- Might be overkill for simple courses

#### Concept B: "Structured Builder" (Lean Alternative)
**Like:** Linear project settings + Notion database properties

```
 ┌──────────────────────────────────────────────────────────────┐
 │ ← Back to courses    {Tên khóa học}    [💾 Saved]  [Publish]│
 ├─────────────┬────────────────────────────────────────────────┤
 │             │                                                │
 │ ◉ Thông tin │  ┌─────────────────────────────────┐          │
 │ ○ Giáo trình│  │ Ảnh thumbnail  │  Video trailer │          │
 │ ○ Ưu đãi    │  │ [chọn ảnh]     │ [chọn video]   │          │
 │ ○ Giảng viên│  └─────────────────────────────────┘          │
 │ ○ Giá bán   │                                                │
 │ ○ Landing   │  Tiêu đề *                                      │
 │   Page →    │  ┌──────────────────────────────────┐          │
 │             │  │ 30 Ngày Sáng Tạo Video...         │          │
 │ → Live View │  └──────────────────────────────────┘          │
 │             │  Slug: 30-ngay-sang-tao-video-trieu-view       │
 │             │                                                │
 │             │  Mô tả *                                       │
 │             │  ┌──────────────────────────────────┐          │
 │             │  │ Khoá học hướng dẫn A-Z...        │          │
 │             │  │                                  │          │
 │             │  └──────────────────────────────────┘          │
 │             │                                                │
 │             │  Giá (VND) *           Link thanh toán         │
 │             │  [996000           ]   [https://go.minh... ]   │
 │             │                                                │
 │             │  Cấp độ                 CTA Text               │
 │             │  [Tất cả          ▾]   [Mua ngay          ]   │
 │             │                                                │
 │             │  ☑ Xuất bản  ☑ Nổi bật  ☐ Chỉ bán combo      │
 │             │                                                │
 ├─────────────┴────────────────────────────────────────────────┤
 │                                                               │
 │  ┌────────────────── LIVE PREVIEW ──────────────────────┐    │
 │  │                                                       │    │
 │  │  (Real-time preview of the course page updates        │    │
 │  │   as you edit — synced scroll with editor)            │    │
 │  │                                                       │    │
 │  │  [Course page renders here with current settings]     │    │
 │  │                                                       │    │
 │  └───────────────────────────────────────────────────────┘    │
 └────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Simpler to implement (extends current layout)
- Vertical nav = no tab switching, scroll through all
- Live preview = instant feedback
- Lower risk, faster delivery

**Cons:**
- Still form-based, not canvas-based
- Not true edit-in-place
- Harder to add custom sections

#### Concept C: "Split Canvas" (Middle Ground)
**Like:** VS Code split editor + Webflow

```
 ┌──────────────────────────────────────────────────────────────┐
 │ Course Editor: {Tên}              [💾 Auto-saved]  [Publish]│
 ├────────────────────────────────┬─────────────────────────────┤
 │ Page Structure                 │                             │
 │ ┌────────────────────────┐     │  ┌───────────────────────┐ │
 │ │ ▲ Hero Section         │     │  │   30 NGÀY SÁNG TẠO   │ │
 │ │   Title: ...           │     │  │   VIDEO TIKTOK        │ │
 │ │   CTA: Đăng ký ngay    │     │  │   TRIỆU VIEW!         │ │
 │ │   Badge: Off           │     │  │                        │ │
 │ │ ─────────────────────  │     │  │   [Edit] ← hover      │ │
 │ │ ▼ Brands Section       │     │  └───────────────────────┘ │
 │ │   Logos: Sony,Canon... │     │                             │
 │ │ ─────────────────────  │     │  ┌───────────────────────┐ │
 │ │ ▼ Curriculum Section   │     │  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │ │
 │ │   Module 1: ...        │     │  │ │S │ │C │ │D │ │F │ │ │
 │ │   Module 2: ...        │     │  │ └──┘ └──┘ └──┘ └──┘ │ │
 │ │ ─────────────────────  │     │  └───────────────────────┘ │
 │ │ ▼ Bonuses Section      │     │                             │
 │ │   Bonus 1: ...         │     │  ┌───────────────────────┐ │
 │ │   Bonus 2: ...         │     │  │ BẮT ĐẦU SỰ NGHIỆP...  │ │
 │ │ ─────────────────────  │     │  │ CỦA BẠN               │ │
 │ │ [+ Add Section]        │     │  └───────────────────────┘ │
 │ └────────────────────────┘     │                             │
 │                                │  Full-page live preview     │
 │ ┌────────────────────────┐     │  with section indicators    │
 │ │ Selected: Hero Section  │     │  Click section → edit      │
 │ │ ─────────────────────   │     │                             │
 │ │ Title:                  │     │                             │
 │ │ [30 Ngày Sáng Tạo...]  │     │                             │
 │ │ Subtitle:               │     │                             │
 │ │ [TIẾT LỘ BÍ QUYẾT...]  │     │                             │
 │ │ Description:            │     │                             │
 │ │ [Khoá học hướng dẫn...]│     │                             │
 │ │ CTA Button:             │     │                             │
 │ │ Text: [ĐĂNG KÝ NGAY!]  │     │                             │
 │ │ URL:  [https://go...]   │     │                             │
 │ └────────────────────────┘     │                             │
 └────────────────────────────────┴─────────────────────────────┘
```

**Pros:**
- Section tree = organized content structure
- Click on preview to select section
- Property panel reflects selected section
- Full-page preview with interactive overlay

**Cons:**
- More complex than Concept B
- Section tree management overhead
- Need to build preview overlay system

---

## Phase 4: Organize and Prioritize

### 4.1 Feasibility Matrix

Scoring: Desirability (1-5) / Feasibility (1-5) / Viability (1-5)

| Idea | D | F | V | Score | Priority |
|------|---|---|---|--------|----------|
| **Dark theme admin redesign** | 5 | 5 | 5 | 15 | **P0** |
| **Portfolio CRUD admin page** | 5 | 5 | 5 | 15 | **P0** |
| **Digital Products admin page** | 5 | 5 | 5 | 15 | **P0** |
| **Real-time live preview (sync scroll)** | 5 | 4 | 4 | 13 | **P1** |
| **Visual curriculum tree (drag-drop)** | 4 | 4 | 4 | 12 | **P1** |
| **Pricing tier editor** | 4 | 5 | 5 | 14 | **P1** |
| **Block editor for course landing pages** | 5 | 3 | 4 | 12 | **P2** |
| **Course sales page builder (sections)** | 4 | 2 | 3 | 9 | **P3** |
| **Edit-in-place canvas overlay** | 4 | 2 | 3 | 9 | **P3** |
| **Auto-save with version history** | 3 | 3 | 4 | 10 | **P2** |
| **Bulk lesson import** | 3 | 4 | 4 | 11 | **P2** |
| **Student success stories** | 3 | 4 | 4 | 11 | **P2** |
| **Countdown timer config** | 3 | 5 | 4 | 12 | **P2** |
| **Sidebar: fix brand name + accent** | 4 | 5 | 5 | 14 | **P1** |
| **Skeleton loading states** | 4 | 5 | 5 | 14 | **P1** |
| **Empty state illustrations** | 3 | 4 | 4 | 11 | **P3** |
| **⌘K command palette** | 3 | 3 | 4 | 10 | **P3** |
| **Shared admin SCSS tokens** | 5 | 5 | 5 | 15 | **P0** |

### 4.2 Top 5 Ideas (Recommended Implementation Order)

#### #1: Shared Admin Design Tokens + Dark Theme (P0)
Create `/packages/ui/styles/admin/_variables.scss` extending the project design system:
```scss
// Admin theme — derived from brand dark theme
--admin-bg: #080808;           // slightly lighter than #000000
--admin-surface: #111111;      // card/section bg
--admin-border: rgba(255,255,255,0.06);
--admin-text: #E0E0E0;
--admin-text-muted: #888;
--admin-accent: #FF005A;       // brand primary
--admin-accent-hover: #CA004D;
--admin-accent-text: #FFFFFF;
--admin-success: #06a84c;
--admin-danger: #C53030;
--admin-warning: #D97706;
--admin-radius: 8px;
--admin-sidebar-width: 260px;
--admin-header-height: 56px;
```
Then refactor all admin SCSS files to use these tokens via CSS custom properties.

#### #2: Portfolio + Digital Products Admin Pages (P0)
Build from scratch using the shared patterns:

**Portfolio page** (`quan-tri-vien/du-an/`):
- Card grid view (default) + table view toggle
- Each card: thumbnail, YouTube play button overlay, title, category tag, "Nổi bật" badge
- Inline edit: click card → expand to show edit form
- Drag-to-reorder for featured items
- Create: modal dialog or inline form
- Delete: confirm with thumbnail preview

**Digital Products page** (`quan-tri-vien/presets/`):
- Similar card grid with product type pill (LUT, Preset, Wedding)
- External checkout URL management
- YouTube preview embed for product demos
- Featured on home toggle

#### #3: Course Admin — Structured Builder Enhancement (P1)

Extend the current split layout with improvements:

**Left panel changes:**
- Replace 4 horizontal tabs with **vertical nav** (icons + labels)
- Add 2 new tabs: "Giá bán" (pricing tiers) and "Landing Page" (block editor)
- Each section scrolls independently — scroll to see all, no tab switching
- Auto-save indicator (green dot = saved, yellow dot = unsaved changes, spinner = saving)

**Right panel changes:**
- Live preview now supports **spotlight overlays** — hover over a section to see "Edit" button
- Click "Edit" → left panel scrolls to that section
- Preview reloads automatically on save (already works, keep)
- Add mobile/desktop preview toggle

**New: Pricing Tier Editor ("Giá bán" tab)**
```
 ┌─────────────────────────────────────────┐
 │ Giá bán                          [+Tier]│
 ├─────────────────────────────────────────┤
 │ ┌─ Tier 1 (Chính) ────────────────────┐ │
 │ │ Tên:     [1 năm                  ]  │ │
 │ │ Giá:     [996000              ] đ  │ │
 │ │ Giá gốc: [3868000             ] đ  │ │
 │ │ Duration:[12 tháng             ]   │ │
 │ │ Link TT: [https://go.minh...   ]   │ │
 │ │ ☑ Active  ☑ Hiển thị           │ │
 │ └─────────────────────────────────────┘ │
 │ ┌─ Tier 2 (Vĩnh viễn) ────────────────┐ │
 │ │ Tên:     [Vĩnh viễn              ]  │ │
 │ │ Giá:     [1996000              ] đ  │ │
 │ │ ...                                  │ │
 │ └─────────────────────────────────────┘ │
 └─────────────────────────────────────────┘
```

**New: Curriculum Tree Builder**
Replace the current inline module card with a proper tree:
```
 ┌─────────────────────────────────────────┐
 │ Giáo trình (3 chương, 15 bài)   [+Module]│
 ├─────────────────────────────────────────┤
 │ ≡ Chương 1: Tư duy & kịch bản  ⋮   ▾   │
 │   ≡ Bài 1: Các bước lên kịch bản ⋮     │
 │   ≡ Bài 2: Chiến lược xây kênh    ⋮     │
 │   ≡ Bài 3: Lỗi vi phạm chính sách ⋮    │
 │   [+ Thêm bài học]                       │
 │                                          │
 │ ≡ Chương 2: Chiến lược Youtube   ⋮   ▾  │
 │   ...                                    │
 │                                          │
 │ ≡ Chương 3: Kỹ thuật quay video  ⋮   ▾  │
 │   ...                                    │
 └─────────────────────────────────────────┘
```
- **≡** drag handle to reorder
- **⋮** click for context menu (rename, duplicate, delete, move up/down)
- **▾** expand/collapse
- Double-click to rename inline
- Inline add for quick lesson entry
- Click lesson → slide-out panel with full editor (title, video URL, duration, free preview, published)

#### #4: Block Editor for Course Landing Pages (P2)

Reuse the existing block editor from posts (`BlockEditor` component) for course `contentBlocks`. This allows the course detail page to have rich content between sections (like testimonials, about-text, story sections) that the reference site has.

```
 ┌─────────────────────────────────────────┐
 │ Landing Page               [Preview] [✓]│
 ├─────────────────────────────────────────┤
 │  ┌─── Block Editor ──────────────────┐  │
 │  │ [Undo] [Redo] [+ Add Block] [⚙]  │  │
 │  │ ───────────────────────────────── │  │
 │  │                                    │  │
 │  │  # HỌC ONLINE CÓ HIỆU QUẢ KHÔNG? │  │
 │  │                                    │  │
 │  │  Trong tám năm qua, gần như tất   │  │
 │  │  cả kiến thức của mình...         │  │
 │  │                                    │  │
 │  │  ──────────────────────────────── │  │
 │  │                                    │  │
 │  │  # VÌ SAO KHOÁ HỌC CÓ THỜI HẠN?  │  │
 │  │                                    │  │
 │  │  Trong những năm qua mình đã có   │  │
 │  │  hàng ngàn học viên...            │  │
 │  │                                    │  │
 │  │  ──────────────────────────────── │  │
 │  │                                    │  │
 │  │  # Feedback khoá học              │  │
 │  │  ┌──────────┐ ┌──────────┐       │  │
 │  │  │Testimony │ │Testimony │       │  │
 │  │  └──────────┘ └──────────┘       │  │
 │  │                                    │  │
 │  └────────────────────────────────────┘  │
 └─────────────────────────────────────────┘
```

#### #5: Countdown Timer + Story + FAQ Quick Config (P2)

Add simple config panels for the remaining course page elements:

**Countdown Timer:**
```
┌─────────────────────────────────────────┐
│ Countdown Timer                         │
├─────────────────────────────────────────┤
│ ☑ Hiển thị countdown                    │
│ Ngày kết thúc: [2026-08-15        📅]  │
│ Text trước:   [Ưu đãi kết thúc sau:]   │
│ Giá sale:     [996000              ] đ  │
│ Giá gốc:      [3868000             ] đ  │
│                                          │
│ PREVIEW:                                 │
│ ┌────────────────────────────────────┐  │
│ │ Ưu đãi kết thúc sau: 12d 05h 32m  │  │
│ │ 996.000đ ~~3.868.000đ~~           │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 4.3 What NOT to Build (scope boundary)

| Don't Build | Why |
|-------------|-----|
| Full Framer/Webflow-level canvas editor | Overkill for a personal brand site. Shopify-sections level is enough. |
| Drag-drop section reordering for course pages | Course pages have a fixed structure (hero → brands → curriculum → bonuses → testimonials → FAQ). Section reordering is for blog posts (block editor already handles this). |
| Multi-language admin | Vietnamese-only project |
| Real-time collaboration (multiple admins) | Single admin user |
| A/B testing for course pages | Premature optimization |
| Media editing (crop, filter) in admin | Already handled by media microservice |
| Full LMS (lesson player, progress tracking) | External LMS at hoc.minhtravel.vn |

---

## Phase 5: Action Plan — Recommended Implementation

### Implementation Sprint Plan

```
Sprint 1: Foundation (2-3 days)
├── 1.1 Create admin design tokens (SCSS variables + CSS custom properties)
├── 1.2 Refactor admin layout to dark theme
├── 1.3 Fix sidebar (brand accent, logo, menu items)
├── 1.4 Build shared admin SCSS patterns (card, table, form, badge, button, modal)
└── Verify: All existing admin pages render correctly in dark theme

Sprint 2: Portfolio + Products (2-3 days)
├── 2.1 Build portfolio list page (card grid + table toggle)
├── 2.2 Build portfolio create/edit form (modal or inline)
├── 2.3 Build digital products list page
├── 2.4 Build digital products create/edit form
├── 2.5 Add sidebar menu items (Dự án, Sản phẩm số)
└── Verify: Full CRUD works for both entities

Sprint 3: Course Admin Upgrade (3-4 days)
├── 3.1 Replace tabs with vertical nav + scroll sections
├── 3.2 Build pricing tier editor
├── 3.3 Build curriculum tree (drag-drop, context menu)
├── 3.4 Enhance live preview (section spotlight overlays)
├── 3.5 Add auto-save indicator
├── 3.6 Add skeleton loading states
└── Verify: Course editing UX is significantly smoother

Sprint 4: Course Landing Page Builder (2-3 days)
├── 4.1 Integrate block editor into course edit
├── 4.2 Add contentBlock rendering to course detail public page
├── 4.3 Build countdown timer config
├── 4.4 Build student success stories management
└── Verify: Course detail page matches minhtravel.vn reference quality

Sprint 5: Polish (1-2 days)
├── 5.1 Add empty state illustrations
├── 5.2 Add keyboard shortcuts (⌘S save, ⌘B back, etc.)
├── 5.3 Add unsaved changes warning
├── 5.4 Audit all contrast & a11y
├── 5.5 Test on mobile viewport
└── Verify: Admin passes WCAG AA, works on tablet
```

### Key Architectural Decisions

1. **Keep existing API routes** — they work. Only add new endpoints if needed (pricing tiers, story config).
2. **Extend SCSS token system** — add admin tokens to `packages/ui/styles/abstracts/_variables.scss`, don't create a separate system.
3. **Reuse Block Editor** — the post block editor is the best component in the codebase. Extend it for courses.
4. **React 19 + Server Components** — Admin pages stay client-side (they're behind auth), but public course detail becomes server-rendered with block content.
5. **No new dependencies** — the project has dnd-kit, GSAP, lucide-react. Use these for drag-drop, animations, icons. Don't add new libs.
6. **Database changes** — add `pricing_tiers` table (JSON field on courses is simpler), `countdown_end_date` to courses, `student_stories` table.

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/ui/styles/abstracts/_admin-variables.scss` | CREATE | Admin design tokens |
| `packages/ui/styles/admin-global.scss` | CREATE | Admin global styles (dark theme reset) |
| `apps/web/src/app/quan-tri-vien/layout.module.scss` | MODIFY | Apply admin tokens |
| `apps/web/src/app/quan-tri-vien/layout.tsx` | MODIFY | Fix sidebar items, add brand logo |
| `apps/web/src/app/quan-tri-vien/du-an/page.tsx` | CREATE | Portfolio list page |
| `apps/web/src/app/quan-tri-vien/du-an/page.module.scss` | CREATE | Portfolio styles |
| `apps/web/src/app/quan-tri-vien/du-an/tao-moi/page.tsx` | CREATE | Portfolio create page |
| `apps/web/src/app/quan-tri-vien/du-an/[id]/page.tsx` | CREATE | Portfolio edit page |
| `apps/web/src/app/quan-tri-vien/presets/page.tsx` | CREATE | Digital products list page |
| `apps/web/src/app/quan-tri-vien/presets/page.module.scss` | CREATE | Products styles |
| `apps/web/src/app/quan-tri-vien/presets/tao-moi/page.tsx` | CREATE | Product create page |
| `apps/web/src/app/quan-tri-vien/presets/[id]/page.tsx` | CREATE | Product edit page |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.tsx` | REFACTOR | Vertical nav + new tabs + tree + block editor |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.module.scss` | REFACTOR | Apply admin tokens, improve layout |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/page.tsx` | ENHANCE | Card grid view, skeleton loading |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/page.module.scss` | REFACTOR | Apply admin tokens |
| `apps/web/src/components/admin/course-editor/` | CREATE | Shared course editor components |
| `apps/web/src/components/admin/pricing-editor/` | CREATE | Pricing tier editor component |
| `apps/web/src/components/admin/curriculum-tree/` | CREATE | Curriculum tree builder component |
| `apps/web/src/components/admin/countdown-config/` | CREATE | Countdown timer configurator |
| `apps/api/src/db/schema.ts` | MODIFY | Add countdown_end_date to courses |

### Success Metrics

After implementation:
- [ ] Admin loads in dark theme matching brand
- [ ] Portfolio: create, list, edit, delete a portfolio item < 30 seconds
- [ ] Product: create, list, edit, delete a digital product < 30 seconds
- [ ] Course: build a full course landing page (hero, curriculum, bonuses, pricing tiers, FAQ) < 10 minutes
- [ ] Course: curriculum tree supports drag-reorder, inline rename, bulk add
- [ ] Course: live preview reflects edits in real-time (≤ 1.5s debounce)
- [ ] All admin pages score WCAG AA contrast
- [ ] Mobile sidebar + hamburger menu works at < 1024px

### Open Questions

1. **Should pricing tiers be a separate DB table or JSON field on courses?** — Recommend JSON field initially (simpler, no migration overhead). Can migrate to table later if querying becomes necessary.
2. **Should the course block editor be the same instance as the post block editor?** — Yes, share the `BlockEditor` component. Pass different `allowedBlocks` if needed.
3. **Should portfolio items have categories (Travel, Food, Tech Review, TVC)?** — Yes, `category` field already exists in DB. Add filter by category in admin.
4. **Should we keep the separate `tao-moi` pages or switch to inline creation?** — Keep separate pages for now (simpler mental model). Can add quick-create modal later.

---

## Appendix: Visual Reference — Before vs After

### Current: Course Edit Page
```
 ┌─────────┐ ┌───────────────────────────────────────────────┐
 │ Sidebar │ │ [Minimal form inputs]    │ [iframe preview]    │
 │ light   │ │ Title:   [___________]  │ (static public      │
 │ blue/   │ │ Slug:    [___________]  │  page, no edit       │
 │ green   │ │ Price:   [___]          │  capability)         │
 │ accent  │ │ [Tabs: Info | Curricu-  │                      │
 │         │ │  lum | Bonuses | Inst-  │                      │
 │         │ │  ructors]               │                      │
 │"Minh    │ │                         │                      │
 │ Travel" │ │ Inline module forms     │                      │
 │         │ │ (no drag, no tree)      │                      │
 └─────────┘ └───────────────────────────────────────────────┘
```
**Issues:** Light theme, no brand accent, form-based, no visual curriculum, iframe is read-only.

### After: Course Edit Page (Concept B — Structured Builder)
```
 ┌─────────┐ ┌───────────────────────────────────────────────────────────────┐
 │ Sidebar │ │ ┌─────────────────────────────────────────────────────────┐   │
 │ dark    │ │ │ ← Back    {Tên khóa học}    [💾 Đã lưu]  [Xuất bản]    │   │
 │ #FF005A │ │ └─────────────────────────────────────────────────────────┘   │
 │ accent  │ │                                                                │
 │         │ │ ◉ Thông tin ──────────────────────────────────────────────    │
 │         │ │ ┌──────────────┬──────────────┐                                │
 │         │ │ │ Ảnh thumbnail│ Video trailer│                                │
 │         │ │ │ [    Ảnh    ]│ [   Video   ]│                                │
 │         │ │ └──────────────┴──────────────┘                                │
 │         │ │ Tiêu đề: [30 Ngày Sáng Tạo Video TikTok...            ]       │
 │         │ │ Mô tả:   [Khoá học hướng dẫn A-Z kỹ năng quay dựng... ]       │
 │         │ │ Giá: [996000] Link TT: [https://go.minhtravel.vn/...  ]       │
 │         │ │ ☑ Xuất bản  ☑ Nổi bật  ☐ Chỉ bán combo                       │
 │         │ │                                                                │
 │         │ │ ○ Giáo trình ────────────────────────────────────────────      │
 │         │ │ ┌─ Giáo trình (3 chương, 15 bài) ───────────────────────┐      │
 │         │ │ │ ≡ Chương 1: Tư duy & kịch bản                   ⋮  ▾ │      │
 │         │ │ │   ≡ Bài 1: Các bước lên kịch bản                ⋮    │      │
 │         │ │ │   ≡ Bài 2: Chiến lược xây kênh                  ⋮    │      │
 │         │ │ │   [+ Thêm]                                            │      │
 │         │ │ │ ≡ Chương 2: Chiến lược Youtube               ⋮  ▾    │      │
 │         │ │ └───────────────────────────────────────────────────────┘      │
 │         │ │                                                                │
 │         │ │ ○ Giá bán ────────────────────────────────────────────────     │
 │         │ │ ┌─ Tier 1: 1 năm — 996.000đ (gốc 3.868.000đ) ──────────┐      │
 │         │ │ └───────────────────────────────────────────────────────┘      │
 │         │ │                                                                │
 │         │ │ ○ Landing Page ─────────────────────────────────────────       │
 │         │ │ ┌─ Block Editor ────────────────────────────────────────┐      │
 │         │ │ │                                                         │      │
 │         │ │ └───────────────────────────────────────────────────────┘      │
 │         │ │                                                                │
 ├─────────┤ ├────────────────────────────────────────────────────────────────┤
 │         │ │                                                                │
 │         │ │ ┌─── LIVE PREVIEW ───────────────────────────────────────────┐ │
 │         │ │ │                                                             │ │
 │         │ │ │  (Real-time preview — scroll synced with editor sections)   │ │
 │         │ │ │                                                             │ │
 │         │ │ │  ┌─────────────────────────────────────────────────────────┐│ │
 │         │ │ │  │   30 NGÀY SÁNG TẠO VIDEO TIKTOK TRIỆU VIEW!             ││ │
 │         │ │ │  │   Khoá học hướng dẫn A-Z...                             ││ │
 │         │ │ │  │   [ĐĂNG KÝ NGAY!]                                       ││ │
 │         │ │ │  └─────────────────────────────────────────────────────────┘│ │
 │         │ │ │  [Brand logos row]                                          │ │
 │         │ │ │  [Target badges]                                            │ │
 │         │ │ │  [Curriculum: Module 1, Module 2...]                        │ │
 │         │ │ │  [Bonuses grid]                                             │ │
 │         │ │ │  [Testimonials]                                             │ │
 │         │ │ │  [FAQ accordion]                                            │ │
 │         │ │ │  [Sticky CTA]                                               │ │
 │         │ │ └─────────────────────────────────────────────────────────────┘ │
 └─────────┘ └────────────────────────────────────────────────────────────────┘
```

### Concept C: Portfolio Admin — Card Grid
```
 ┌─────────┐ ┌───────────────────────────────────────────────────────────────┐
 │ Sidebar │ │ Dự án thực hiện                          [+ Thêm dự án mới]   │
 │ dark    │ │                                                                │
 │ #FF005A │ │ [≡≡≡≡] [≡≡≡] [🔍 Tìm kiếm...          ] [Tất cả ▾]          │
 │ accent  │ │                                                                │
 │         │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 │         │ │ │    ▶         │ │    ▶         │ │    ▶         │            │
 │         │ │ │              │ │              │ │              │            │
 │         │ │ │ LIFE OF TIBET│ │ LIFE OF CÔ TÔ│ │ LIFE OF      │            │
 │         │ │ │              │ │              │ │ CAT BA       │            │
 │         │ │ │ 32 ngày, lái │ │ Minh Travel  │ │              │            │
 │         │ │ │ xe 12.000km..│ │ x VTV        │ │ Minh Travel  │            │
 │         │ │ │              │ │              │ │ x Sony       │            │
 │         │ │ │ ⭐ Nổi bật   │ │ Travel       │ │ Travel       │            │
 │         │ │ │ [Sửa] [Xóa]  │ │ [Sửa] [Xóa]  │ │ [Sửa] [Xóa]  │            │
 │         │ │ └──────────────┘ └──────────────┘ └──────────────┘            │
 │         │ │                                                                │
 │         │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 │         │ │ │    ▶         │ │    ▶         │ │    ▶         │            │
 │         │ │ │              │ │              │ │              │            │
 │         │ │ │ ƯỚC MƠ BỊ   │ │ VTV x MINH   │ │ CÁCH QUAY    │            │
 │         │ │ │ BỎ QUÊN     │ │ TRAVEL       │ │ VIDEO ĐẸP    │            │
 │         │ │ │              │ │              │ │              │            │
 │         │ │ │ Minh Travel  │ │ Hình Ảnh     │ │ Như Lý Tử    │            │
 │         │ │ │ x Honda      │ │ Cuộc Sống    │ │ Thất         │            │
 │         │ │ │              │ │              │ │              │            │
 │         │ │ │ Automotive   │ │ Documentary  │ │ Tutorial     │            │
 │         │ │ │ [Sửa] [Xóa]  │ │ [Sửa] [Xóa]  │ │ [Sửa] [Xóa]  │            │
 │         │ │ └──────────────┘ └──────────────┘ └──────────────┘            │
 └─────────┘ └───────────────────────────────────────────────────────────────┘
```

---

*End of brainstorming report. Next step: review top 5 ideas with stakeholder, confirm priority, begin Sprint 1 implementation.*
