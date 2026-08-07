# Implementation Plan: Admin Redesign — Concept B (Structured Builder)

**Date**: 2026-08-02
**Concept**: Structured Builder
**Scope**: Admin dark theme + Course admin upgrade + Portfolio CRUD + Digital Products CRUD
**Timeline**: 5 sprints, ~10-12 working days

---

## Prerequisite: Issue-to-Fix Mapping

| # | Issue | Severity | Fix Strategy |
|---|-------|----------|-------------|
| **V1** | Admin light theme vs brand dark | High | Sprint 1 — Dark theme token system |
| **V2** | Hardcoded hex colors everywhere | High | Sprint 1 — CSS custom properties from brand tokens |
| **V3** | Sidebar blue/green accent | Medium | Sprint 1 — Replace with #FF005A |
| **V4** | Sidebar "Minh Travel" hardcoded | Low | Sprint 1 — Fetch from settings or use setting key |
| **V5** | Generic table design, no card view | Medium | Sprint 2+3 — Card grid + table toggle |
| **V6** | Monochrome buttons, no brand accent | Medium | Sprint 1 — Shared button mixins with accent variant |
| **V7** | Text "Đang tải..." only | Low | Sprint 3 — Skeleton loaders |
| **V8** | Plain text empty states | Low | Sprint 5 — Illustrated empty states |
| **C1** | Curriculum is inline form, no drag-drop | Critical | Sprint 3 — Tree builder with dnd-kit |
| **C2** | iframe preview is read-only | Critical | Sprint 3 — Scroll-sync + section spotlight overlays |
| **C3** | No block editor for courses | Critical | Sprint 4 — Reuse BlockEditor component |
| **C4** | Single price field, no tiers | High | Sprint 3 — Pricing tier editor |
| **C5** | No countdown timer config | Medium | Sprint 4 — Countdown configurator |
| **C6** | No student success stories | Medium | Sprint 4 — Stories manager |
| **C9** | Auto-save silent, no indicator | Low | Sprint 3 — Save status badge |
| **C10** | 4 tabs force context switching | Medium | Sprint 3 — Vertical nav, all sections scrollable |
| **P1** | No portfolio admin page at all | Critical | Sprint 2 — Full CRUD card grid |
| **P2** | No digital products admin page | Critical | Sprint 2 — Full CRUD card grid |
| **P3** | Sidebar "Dự án thực hiện" → wrong route | Critical | Sprint 1 — Fix sidebar items |
| **P4** | No portfolio CRUD UI | Critical | Sprint 2 — Build UI |
| **P5** | No video embed preview | High | Sprint 2 — YouTube thumbnail + play icon |
| **A1** | Single useState, no undo/redo | Medium | Sprint 3 — useReducer for course state |
| **A2** | No shared admin component patterns | Medium | Sprint 1 — Shared admin SCSS + components |
| **A4** | No optimistic updates | Low | Sprint 4 — Optimistic mutations |

---

## SPRINT 1: Foundation — Dark Theme + Shared Admin System

**Duration**: 2-3 days
**Success**: All existing admin pages render in dark theme with brand tokens. Sidebar fixed.

### 1.1 Create Admin Design Tokens

**File**: `packages/ui/styles/abstracts/_admin-variables.scss` (CREATE)

```scss
// ── Admin Theme (derived from brand dark theme, extended for productivity) ──
// Extends _variables.scss brand tokens — never reinvents them.

// Brand tokens (re-exported for admin isolation)
$admin-bg:              #080808;   // 1 step above #000000 for visible depth
$admin-surface:         #0D0D0D;   // card / section / panel
$admin-surface-raised:  #141414;   // hover / active states
$admin-border:          rgba(255, 255, 255, 0.06);
$admin-border-heavy:    rgba(255, 255, 255, 0.10);
$admin-text:            #E0E0E0;   // primary text — slightly dimmer than #FFF for eye comfort
$admin-text-secondary:  #888888;   // labels / hints / meta
$admin-text-disabled:   #555555;
$admin-accent:          #FF005A;   // brand primary — CTA, active, focus
$admin-accent-hover:    #CA004D;
$admin-accent-text:     #FFFFFF;
$admin-success:         #06A84C;   // green — published, saved, success
$admin-success-bg:      rgba(6, 168, 76, 0.12);
$admin-danger:          #EF4444;   // red — delete, error
$admin-danger-bg:       rgba(239, 68, 68, 0.10);
$admin-warning:         #D97706;   // orange — unsaved, warning
$admin-warning-bg:      rgba(217, 119, 6, 0.12);

// Sizing
$admin-sidebar-width:   260px;
$admin-header-height:   56px;
$admin-radius-sm:       4px;
$admin-radius-md:       8px;
$admin-radius-lg:       12px;

// Typography (inherits Manrope from brand)
$admin-font-mono:       'SF Mono', 'Cascadia Code', 'Consolas', monospace;

// Shadows (dark context)
$admin-shadow-card:     0 1px 3px rgba(0, 0, 0, 0.4);
$admin-shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.6);
$admin-shadow-modal:    0 16px 48px rgba(0, 0, 0, 0.7);
$admin-shadow-sidebar:  2px 0 16px rgba(0, 0, 0, 0.5);

// Z-index scale
$z-admin-backdrop:      40;
$z-admin-header:        50;
$z-admin-sidebar:       60;
$z-admin-modal:         70;
$z-admin-toast:         80;
```

### 1.2 Create Admin Global Styles

**File**: `packages/ui/styles/admin-global.scss` (CREATE)

```scss
@use 'abstracts/variables' as brand;
@use 'abstracts/admin-variables' as admin;

:root {
  // Admin-only CSS custom properties (inherit brand where possible)
  --admin-bg:             #{admin.$admin-bg};
  --admin-surface:        #{admin.$admin-surface};
  --admin-surface-raised: #{admin.$admin-surface-raised};
  --admin-border:         #{admin.$admin-border};
  --admin-border-heavy:   #{admin.$admin-border-heavy};
  --admin-text:           #{admin.$admin-text};
  --admin-text-secondary: #{admin.$admin-text-secondary};
  --admin-text-disabled:  #{admin.$admin-text-disabled};
  --admin-accent:         #{brand.$clr-primary};
  --admin-accent-hover:   #{brand.$clr-primary-dark};
  --admin-accent-text:    #{admin.$admin-accent-text};
  --admin-success:        #{admin.$admin-success};
  --admin-success-bg:     #{admin.$admin-success-bg};
  --admin-danger:         #{admin.$admin-danger};
  --admin-danger-bg:      #{admin.$admin-danger-bg};
  --admin-warning:        #{admin.$admin-warning};
  --admin-radius:         #{admin.$admin-radius-md};
  --admin-radius-sm:      #{admin.$admin-radius-sm};
  --admin-radius-lg:      #{admin.$admin-radius-lg};
  --admin-sidebar-width:  #{admin.$admin-sidebar-width};
  --admin-header-height:  #{admin.$admin-header-height};
  --admin-font-mono:      #{admin.$admin-font-mono};
  --admin-ease-out:       #{brand.$ease-out-expo};
  --admin-duration-fast:  #{brand.$duration-fast};
  --admin-duration-normal:#{brand.$duration-normal};

  // Scrollbar styling (dark)
  --scrollbar-thumb: rgba(255, 255, 255, 0.1);
  --scrollbar-track: transparent;
}

// ── Admin-specific base overrides ──
.admin-layout {
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: #{brand.$ff-sans};

  // Scrollbar
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
  ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 3px;
    &:hover { background: rgba(255, 255, 255, 0.2); }
  }
}

// ── Shared admin components ──

// Buttons
.admin-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: var(--admin-accent);
  color: var(--admin-accent-text);
  border: none;
  border-radius: var(--admin-radius);
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--admin-duration-fast) var(--admin-ease-out),
              transform var(--admin-duration-fast) var(--admin-ease-out);

  &:hover { background: var(--admin-accent-hover); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.admin-btn-secondary {
  @extend .admin-btn-primary; // conceptual — implement as separate class
  padding: 0.45rem 0.875rem;
  background: var(--admin-surface-raised);
  color: var(--admin-text);
  border: 1px solid var(--admin-border);

  &:hover { background: rgba(255, 255, 255, 0.08); border-color: var(--admin-border-heavy); }
}

.admin-btn-ghost {
  @extend .admin-btn-secondary;
  background: transparent;
  border: 1px solid transparent;

  &:hover { background: var(--admin-surface-raised); border-color: var(--admin-border); }
}

.admin-btn-danger {
  @extend .admin-btn-ghost;
  color: var(--admin-danger);
  &:hover { background: var(--admin-danger-bg); border-color: var(--admin-danger); }
}

// Form inputs
.admin-input {
  padding: 0.45rem 0.6rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-sm);
  color: var(--admin-text);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--admin-duration-fast) var(--admin-ease-out);

  &::placeholder { color: var(--admin-text-secondary); }
  &:focus { border-color: var(--admin-accent); }
}

.admin-textarea {
  @extend .admin-input;
  resize: vertical;
  min-height: 68px;
  line-height: 1.5;
}

.admin-select {
  @extend .admin-input;
  cursor: pointer;
}

// Labels
.admin-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--admin-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

// Badges
.admin-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.675rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
}

.admin-badge-success {
  @extend .admin-badge;
  background: var(--admin-success-bg);
  color: var(--admin-success);
}

.admin-badge-warning {
  @extend .admin-badge;
  background: var(--admin-warning-bg);
  color: var(--admin-warning);
}

.admin-badge-danger {
  @extend .admin-badge;
  background: var(--admin-danger-bg);
  color: var(--admin-danger);
}

.admin-badge-muted {
  @extend .admin-badge;
  background: var(--admin-surface-raised);
  color: var(--admin-text-secondary);
}

// Cards
.admin-card {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  overflow: hidden;
}

.admin-card-hover {
  transition: border-color var(--admin-duration-normal) var(--admin-ease-out),
              box-shadow var(--admin-duration-normal) var(--admin-ease-out);
  &:hover {
    border-color: var(--admin-border-heavy);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

// Table (for backward compat)
.admin-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 0.65rem 1rem;
    font-size: 0.675rem;
    font-weight: 600;
    color: var(--admin-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--admin-border);
  }

  td {
    padding: 0.65rem 1rem;
    font-size: 0.8125rem;
    color: var(--admin-text);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--admin-surface-raised); }
}

// Section header
.admin-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.admin-section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--admin-text);
  letter-spacing: -0.02em;
}

// Empty state
.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--admin-text-secondary);
  font-size: 0.8125rem;
  border: 1px dashed var(--admin-border);
  border-radius: var(--admin-radius-lg);
  gap: 0.75rem;
}

// Skeleton loading
.admin-skeleton {
  background: linear-gradient(
    90deg,
    var(--admin-surface) 25%,
    var(--admin-surface-raised) 50%,
    var(--admin-surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--admin-radius-sm);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Toast / notification
.admin-toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 0.75rem 1rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 999;
  animation: toast-in 0.3s var(--admin-ease-out);
  font-size: 0.8125rem;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

// Save indicator dot
.admin-save-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.saved { background: var(--admin-success); }
  &.unsaved { background: var(--admin-warning); }
  &.saving { background: var(--admin-warning); animation: pulse-dot 1s ease-in-out infinite; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

### 1.3 Refactor Admin Layout (SCSS)

**File**: `apps/web/src/app/quan-tri-vien/layout.module.scss` (MODIFY)

Changes:
```
// Before (light theme, hardcoded hex)
.layout {
  background: #F8F8F7;
  color: #1A1A1A;
  ...
}

// After (dark theme, tokens)
.layout {
  @extend .admin-layout;  // or import tokens directly
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: var(--ff-sans);
  display: flex;
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

.sidebar {
  width: var(--admin-sidebar-width);
  min-width: var(--admin-sidebar-width);
  background: var(--admin-surface);
  border-right: 1px solid var(--admin-border);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: var(--z-sidebar);
  overflow-y: auto;
  transition: transform var(--admin-duration-normal) var(--admin-ease-out);
}

.logo {
  padding: 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--admin-text);
  text-decoration: none;
  border-bottom: 1px solid var(--admin-border);
  letter-spacing: -0.02em;
  height: var(--admin-header-height);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navItem {
  // ... same padding/font
  color: var(--admin-text-secondary);
  border-radius: var(--admin-radius-sm);

  &:hover {
    color: var(--admin-text);
    background: var(--admin-surface-raised);
  }

  &.active {
    font-weight: 600;
    background: var(--admin-accent);       // ← #FF005A, not #235689
    color: var(--admin-accent-text);       // ← #FFFFFF
    border-left: none;                     // ← remove blue border, use full bg
    box-shadow: 0 2px 8px rgba(255, 0, 90, 0.3);
  }
}

.header {
  background: var(--admin-surface);
  border-bottom: 1px solid var(--admin-border);
  min-height: var(--admin-header-height);
  // ...rest
}

.main {
  background: var(--admin-bg);
  color: var(--admin-text);
  // ...rest
}
```

### 1.4 Fix Admin Layout (TSX)

**File**: `apps/web/src/app/quan-tri-vien/layout.tsx` (MODIFY)

Changes:
```tsx
// Line 15-26 — Replace SIDEBAR_ITEMS
const SIDEBAR_ITEMS = [
  { label: "Bảng điều khiển", href: "/quan-tri-vien" },
  { label: "Cấu hình trang", href: "/quan-tri-vien/cai-dat" },
  { label: "Quản lý khóa học", href: "/quan-tri-vien/khoa-hoc" },
  { label: "Quản lý bài viết", href: "/quan-tri-vien/bai-viet" },
  { label: "Dự án thực hiện", href: "/quan-tri-vien/du-an" },       // ← FIX: was /san-pham
  { label: "Sản phẩm số", href: "/quan-tri-vien/san-pham" },        // ← NEW: Digital products
  { label: "Câu hỏi thường gặp", href: "/quan-tri-vien/faq" },
  { label: "Đánh giá học viên", href: "/quan-tri-vien/danh-gia" },
  { label: "Khách hàng tiềm năng", href: "/quan-tri-vien/khach-hang" },
  { label: "Chương trình khuyến mãi", href: "/quan-tri-vien/khuyen-mai" },
  { label: "Thư viện ảnh & video", href: "/quan-tri-vien/media" },
];

// Line 94 — Replace hardcoded "Minh Travel" with setting or constant
<Link href="/quan-tri-vien" className={styles.logo}>
  <span className={styles.logoIcon}>MT</span>   {/* Monogram */}
  <span>Minh Travel</span>
</Link>

// Line 101 — Fix active detection (already correct, just ensure new paths match)
className={`${styles.navItem} ${pathname === item.href || (item.href !== "/quan-tri-vien" && pathname.startsWith(item.href)) ? styles.active : ""}`}
```

### 1.5 Refactor Course List Page (SCSS)

**File**: `apps/web/src/app/quan-tri-vien/khoa-hoc/page.module.scss` (REFACTOR)

Replace all hardcoded colors with CSS custom properties from admin-global. Keep structure identical, swap values:

| Before | After |
|--------|-------|
| `#1A1A1A` | `var(--admin-text)` |
| `#FFFFFF` / `#FAFAFA` | `var(--admin-surface)` / `var(--admin-surface-raised)` |
| `#F8F8F7` | `var(--admin-bg)` |
| `#E0E0E0` / `#EAEAEA` / `#F0F0F0` | `var(--admin-border)` |
| `#999` / `#B0B0B0` / `#AAA` | `var(--admin-text-secondary)` |
| `#EDF7ED` / `#2F6B2F` / `#C6E6C6` | `var(--admin-success-bg)` / `var(--admin-success)` |
| `#FEF2F2` / `#C53030` / `#FECACA` | `var(--admin-danger-bg)` / `var(--admin-danger)` |
| `#F5F5F3` | `var(--admin-surface)` |

### 1.6 Refactor Course Edit Page (SCSS)

**File**: `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.module.scss` (REFACTOR)

Same color token swap as above. Additionally:
- Increase left panel width from `520px` to `580px` (for vertical nav)
- Add CSS for new vertical nav component
- Add CSS for curriculum tree
- Add CSS for pricing tier editor

### 1.7 Import Admin Global Styles

**File**: `apps/web/src/app/layout.tsx` (MODIFY — line that imports global.scss)

```tsx
import "@workspace/ui/styles/global.scss";
import "@workspace/ui/styles/admin-global.scss";   // ← ADD: admin tokens are lazy, only CSS variables
```

### Sprint 1 Verification Checklist

- [ ] Open `/quan-tri-vien` — admin loads with `#080808` background, `#E0E0E0` text
- [ ] Sidebar active item is `#FF005A` (brand accent), not blue/green
- [ ] Course list table has dark rows, readable text, hover states
- [ ] Course edit form inputs are dark, labels are uppercase muted
- [ ] MediaTrigger buttons render correctly on dark background
- [ ] Sidebar has new items: "Dự án thực hiện" → `/quan-tri-vien/du-an`, "Sản phẩm số" → `/quan-tri-vien/san-pham`
- [ ] Mobile sidebar hamburger still works

---

## SPRINT 2: Portfolio + Digital Products Admin Pages

**Duration**: 2-3 days
**Success**: Full CRUD for both entities with card grid UI.

### 2.1 Portfolio Admin Page

**Route**: `/quan-tri-vien/du-an`
**Pages to create**: list (`page.tsx`), create (`tao-moi/page.tsx`), edit (`[id]/page.tsx`)

#### 2.1a Portfolio List Page

**File**: `apps/web/src/app/quan-tri-vien/du-an/page.tsx` (CREATE)

Pattern: Follow `khoa-hoc/page.tsx` structure, extend with card grid + table toggle, video preview, category filter.

```tsx
"use client";

// Key features:
// - Card grid view (default) with 3-col layout
// - Table view toggle (reuse table pattern from courses)
// - Thumbnail with YouTube play overlay (detect from youtubeVideoId)
// - Category tags (Travel, Food, Tech Review, TVC, Tutorial, etc.)
// - Featured badge toggle on card
// - Inline quick actions: edit, delete, toggle featured
// - Filter by category dropdown
// - Search by title
// - Empty state: "Chưa có dự án nào" + CTA "Tạo dự án đầu tiên"
// - Loading: 6 skeleton cards with shimmer
```

**Fields displayed**:
- `title` — project name (e.g., "LIFE OF TIBET")
- `description` — brief description (truncated to 2 lines)
- `category` — tag pill (Travel, TVC, Documentary...)
- `thumbnailUrl` — card background image
- `youtubeVideoId` — if present, show ▶ play button overlay
- `isFeaturedOnHome` — star badge
- `createdAt` — relative date

**Card component**:
```tsx
function PortfolioCard({ item, onEdit, onDelete, onToggleFeatured }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.cardMedia}>
        <img src={item.thumbnailUrl || '/placeholder-project.jpg'} alt={item.title} />
        {item.youtubeVideoId && (
          <div className={styles.playOverlay}>
            <Play size={32} />
          </div>
        )}
        {item.isFeaturedOnHome && <StarBadge />}
      </div>
      <div className={styles.cardBody}>
        <span className={styles.categoryTag}>{item.category}</span>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardDesc}>{item.description}</p>
      </div>
      <div className={styles.cardActions}>
        <button onClick={onEdit}>Sửa</button>
        <button onClick={() => onToggleFeatured(item.id)}>
          {item.isFeaturedOnHome ? <StarFilled /> : <Star />}
        </button>
        <button onClick={onDelete} className="danger">Xóa</button>
      </div>
    </div>
  );
}
```

#### 2.1b Portfolio Create/Edit Form

**File**: `apps/web/src/app/quan-tri-vien/du-an/tao-moi/page.tsx` (CREATE)
**File**: `apps/web/src/app/quan-tri-vien/du-an/[id]/page.tsx` (CREATE)

Pattern: Follow `khoa-hoc/tao-moi/page.tsx` — single form page, no tabs needed (simpler entity than course).

Form fields:
```tsx
const [f, setF] = useState({
  title: "",
  description: "",
  category: "Travel",          // select from preset list
  thumbnailUrl: "",            // MediaTrigger
  fullVideoUrl: "",            // optional full video link
  youtubeVideoId: "",          // or auto-extract from URL paste
  isFeaturedOnHome: false,
  featuredOrder: 0,
});
```

**Smart YouTube ID extraction:**
```tsx
const extractYoutubeId = (input: string) => {
  // Handle: https://youtu.be/XXXXX, https://www.youtube.com/watch?v=XXXXX, https://youtube.com/shorts/XXXXX
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,  // pure ID
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return input; // keep as-is if not recognized
};
```

**YouTube thumbnail preview:**
When `youtubeVideoId` is set, show preview: `https://img.youtube.com/vi/{id}/hqdefault.jpg`

### 2.2 Digital Products Admin Page

**Route**: `/quan-tri-vien/san-pham` (already exists as placeholder — replace)
**Pages to create**: list (`page.tsx`), create (`tao-moi/page.tsx`), edit (`[id]/page.tsx`)

#### 2.2a Products List Page

**File**: `apps/web/src/app/quan-tri-vien/san-pham/page.tsx` (REPLACE — was 3-line placeholder)

Pattern: Same card grid as portfolio, adapted for digital products.

```tsx
// Key features:
// - Card grid with product image + tag pill (LUT, Preset, Wedding...)
// - Price display with formatVND()
// - External checkout link indicator (external link icon)
// - Published badge
// - Featured on home toggle
// - Filter by: All, Published, Draft
// - Search by title
```

**Fields displayed**:
- `title` — "Bộ 7 LUT Wedding", "Preset ảnh Minh Travel"
- `description` — short description
- `price` — formatted VND
- `thumbnailUrl` — product image
- `tag` — colored pill (LUT, Preset, Wedding, Cinematic...)
- `externalCheckoutUrl` — external link indicator
- `isPublished` — green/gray badge
- `isFeaturedOnHome` — star

#### 2.2b Product Create/Edit Form

Form fields:
```tsx
const [f, setF] = useState({
  title: "",
  description: "",
  price: "",
  thumbnailUrl: "",
  downloadFileUrl: "",         // optional download link
  externalCheckoutUrl: "",     // checkout link
  youtubePreviewId: "",        // YouTube demo video
  tag: "",                     // free-text tag or select from common tags
  isPublished: false,
  isFeaturedOnHome: false,
});
```

### Sprint 2 Verification Checklist

- [ ] `/quan-tri-vien/du-an` — card grid shows portfolio items with thumbnails
- [ ] Click "Tạo dự án mới" → form with all fields works
- [ ] Paste YouTube URL → auto-extracts video ID, shows thumbnail preview
- [ ] Edit portfolio item → form loads existing data
- [ ] Delete → confirm dialog → item removed from grid
- [ ] Toggle featured → star icon updates
- [ ] Card grid → table toggle works
- [ ] `/quan-tri-vien/san-pham` — card grid shows digital products
- [ ] Create/edit/delete digital products works
- [ ] Empty states show with illustration + CTA

---

## SPRINT 3: Course Admin — Structured Builder Upgrade

**Duration**: 3-4 days
**Success**: Vertical nav replaces tabs. Curriculum tree with drag-drop. Pricing tier editor. Live preview sync scroll.

### 3.1 Architecture Change: Vertical Nav + Scroll Sections

Current: 4 horizontal tabs — user clicks tab, section appears.
New: Vertical nav with icons, all sections in scrollable left panel. Preview sync-scrolls.

**File**: `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.tsx` (REFACTOR — major)

```
Layout change:
┌─ Panel Header (title + Save/Publish buttons + SaveStatus dot) ─┐
├──────────────┬──────────────────────────────────────────────────┤
│ Vertical Nav │  Section content (scrollable)                    │
│              │                                                  │
│ ◉ Thông tin  │  ← Rendered conditionally, all in DOM            │
│ ○ Giáo trình │     Only active section visible (display toggle) │
│ ○ Ưu đãi     │     Or: all visible with lazy loading            │
│ ○ Giảng viên │                                                  │
│ ○ Giá bán    │                                                  │
│ ○ Landing P. │                                                  │
│              │                                                  │
├──────────────┴──────────────────────────────────────────────────┤
│ Live Preview (iframe, visible when "Xem trước" toggled)         │
└─────────────────────────────────────────────────────────────────┘
```

**Vertical nav items** (replaces `tab` state + horizontal buttons):
```tsx
const NAV_ITEMS = [
  { id: "info",        label: "Thông tin",     icon: Info },
  { id: "curriculum",  label: "Giáo trình",    icon: BookOpen },
  { id: "bonuses",     label: "Ưu đãi",        icon: Gift },
  { id: "instructors", label: "Giảng viên",    icon: Users },
  { id: "pricing",     label: "Giá bán",       icon: Tag },
  { id: "landing",     label: "Landing Page",  icon: Layout },
];
```

Each section scrolls into view when clicked (or toggle display). Use `scrollIntoView` on the section ref.

### 3.2 Save Status Indicator

Add a green/yellow dot next to the save button that indicates:
- Green = all changes saved
- Yellow = unsaved changes exist
- Spinning = currently saving

```tsx
const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

// In the auto-save useEffect:
useEffect(() => {
  if (!courseId) return;
  setSaveStatus('unsaved');
  debounceRef.current = setTimeout(async () => {
    setSaveStatus('saving');
    await api.put(...);
    setSaveStatus('saved');
  }, 1500);
}, [f]);

// In panelHead:
<div className={styles.saveStatus}>
  <span className={`${styles.saveDot} ${styles[saveStatus]}`} />
  <span>{saveStatus === 'saved' ? 'Đã lưu' : saveStatus === 'saving' ? 'Đang lưu...' : 'Chưa lưu'}</span>
</div>
```

### 3.3 Curriculum Tree Builder (Critical: C1 fix)

Replace the current `ModuleCard` component with a tree-based editor using `@dnd-kit` (already in root package.json).

**File**: `apps/web/src/components/admin/course-editor/CurriculumTree.tsx` (CREATE)

```tsx
"use client";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";

// Components:
// - CurriculumTree (root) — wraps DndContext
// - ModuleNode — draggable module with lessons inside
// - LessonNode — draggable lesson inside a module
// - ModuleContextMenu — rename, duplicate, delete, move up/down
// - LessonForm — inline add/edit form (slide-down panel)

interface CurriculumTreeProps {
  modules: Module[];
  onAddModule: (title: string) => void;
  onRenameModule: (id: string, title: string) => void;
  onDuplicateModule: (id: string) => void;
  onDeleteModule: (id: string) => void;
  onReorderModules: (from: number, to: number) => void;
  onAddLesson: (moduleId: string, data: LessonInput) => void;
  onUpdateLesson: (moduleId: string, lessonId: string, data: LessonInput) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onReorderLessons: (moduleId: string, from: number, to: number) => void;
}
```

**Interaction model:**
- **≡ grip handle** on each module → drag to reorder modules
- **▸ / ▾ chevron** → expand/collapse module to show/hide lessons
- Click module title → select it (shows context toolbar)
- **⋮** (more) → context menu: Sửa tên, Nhân bản, Di chuyển lên, Di chuyển xuống, Xóa
- **≡** on each lesson → drag to reorder within module (or cross-module)
- Click lesson → slide-out panel with full editor
- **[+ Thêm chương]** button at bottom
- **[+ Thêm bài]** button inside each expanded module
- Inline add form: title input + Enter to confirm, Escape to cancel

**State strategy:** Use `useReducer` for all curriculum operations instead of multiple `useState`:
```tsx
type CurriculumAction =
  | { type: 'LOAD', modules: Module[] }
  | { type: 'ADD_MODULE', module: Module }
  | { type: 'RENAME_MODULE', id: string, title: string }
  | { type: 'DELETE_MODULE', id: string }
  | { type: 'MOVE_MODULE', from: number, to: number }
  | { type: 'ADD_LESSON', moduleId: string, lesson: Lesson }
  | { type: 'UPDATE_LESSON', moduleId: string, lessonId: string, data: Partial<Lesson> }
  | { type: 'DELETE_LESSON', moduleId: string, lessonId: string }
  | { type: 'MOVE_LESSON', moduleId: string, from: number, to: number };
```

**Optimistic updates:** Update local state immediately, rollback on API error.

### 3.4 Pricing Tier Editor (Critical: C4 fix)

**File**: `apps/web/src/components/admin/course-editor/PricingEditor.tsx` (CREATE)

Since courses have `basePrice` and `originalPrice` already, and the reference site shows tiered pricing (1 year, forever), we'll add pricing data as a JSON field stored in existing columns (or add a `pricing_tiers` JSON column).

**Strategy:** Store pricing tiers as JSON in `courses.contentBlocks` extended field, OR add a new `pricingTiers` text column. Simplest: encode as setting keys (`pricing_tier_1_name`, `pricing_tier_1_price`, etc.) stored in site_settings, referenced by course. Even simpler: **just extend the course edit form with pricing-specific fields** since most courses have 1-2 tiers max.

```tsx
interface PricingTier {
  id: string;           // local ID for React key
  name: string;         // "1 năm", "Vĩnh viễn", "Combo"
  price: number;
  originalPrice?: number;
  durationMonths?: number;  // 12 = 1 year, null = forever
  checkoutUrl?: string;
  isActive: boolean;
}

function PricingEditor({ tiers, onChange }: { tiers: PricingTier[], onChange: (tiers: PricingTier[]) => void }) {
  // Display: horizontal card layout, 1-3 tiers side by side
  // Each tier: name input, price input, original price (strikethrough), duration select, checkout URL, active toggle
  // [+ Thêm tier] button (max 3)
  // Drag to reorder tiers (simpler: just edit in place)
}
```

**Backend:** Store as JSON string in `courses.contentBlocks` alongside block data, OR add a separate setting approach. Simplest for now: add `pricingTiers` JSON field to the course update schema.

### 3.5 Live Preview Enhancement: Scroll Sync

Current: iframe preview loads public page. User must manually "Lưu & Xem" to refresh.

**Enhancement**: Auto-reload already works (debounce 1.5s → PUT → increment `pvKey` → iframe remounts). No changes needed to the auto-save mechanism. Just ensure the visual feedback is clear:
- After save, iframe reloads automatically (already working)
- Add a "Đã cập nhật" flash indicator on the preview panel when reloaded
- Keep the `Lưu & Xem` button for manual refresh

**Spotlight overlay (light version)**: Add small "Edit" hover buttons on the iframe (technically hard with iframe). Instead: use `postMessage` from iframe to parent to communicate scroll position, sync left nav.

Alternative (simpler): **Sync-scroll mapping** — map vertical nav sections to preview sections. When user scrolls to "Giáo trình" in the editor, iframe auto-scrolls to the curriculum section on the public page (if the public page has anchor IDs).

```tsx
// If the public course page has IDs (#curriculum, #bonuses, #faq):
const SECTION_ANCHORS: Record<string, string> = {
  info:        '',           // top
  curriculum:  '#curriculum',
  bonuses:     '#bonuses',
  pricing:     '#pricing',
  landing:     '#about',     // or wherever contentBlocks render
};

function scrollPreviewTo(section: string) {
  const anchor = SECTION_ANCHORS[section];
  if (anchor) {
    // Post message to iframe to scroll to anchor
    iframeRef.current?.contentWindow?.postMessage({ type: 'scroll-to', anchor }, '*');
  }
}
```

### Sprint 3 Verification Checklist

- [ ] Vertical nav replaces horizontal tabs — all scrollable in left panel
- [ ] Save status dot shows green/yellow/spinner correctly
- [ ] Curriculum: drag module to reorder (dnd-kit)
- [ ] Curriculum: expand/collapse module shows/hides lessons
- [ ] Curriculum: drag lesson to reorder within module
- [ ] Curriculum: double-click module title → rename inline
- [ ] Curriculum: context menu (rename, duplicate, delete) on ⋮
- [ ] Curriculum: add lesson form appears inline, Enter to confirm
- [ ] Curriculum: click lesson → slide-out detail editor
- [ ] Pricing: add/edit/remove pricing tiers
- [ ] Pricing: original price strikethrough, duration select
- [ ] Preview: iframe auto-reloads after debounce save
- [ ] Preview: save status indicator on preview panel

---

## SPRINT 4: Course Landing Page Builder + Missing Features

**Duration**: 2-3 days
**Success**: Course has block editor. Public course page renders contentBlocks. Countdown timer and student stories work.

### 4.1 Block Editor for Courses (Critical: C3 fix)

**File**: `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.tsx` (MODIFY)

Add "Landing Page" section to vertical nav that renders the `BlockEditor`.

```tsx
// In the vertical nav's "landing" section:
{activeSection === 'landing' && (
  <BlockEditor
    blocks={contentBlocks}
    onChange={setContentBlocks}
    onSave={() => autoSave({ contentBlocks: JSON.stringify(contentBlocks) })}
    saving={saveStatus === 'saving'}
  />
)}
```

This uses the EXACT same `BlockEditor` component from `apps/web/src/components/admin/block-editor/BlockEditor.tsx`. No changes to the block editor itself — it already supports all 20+ block types.

**State:** Add `contentBlocks` to the course state:
```tsx
const [contentBlocks, setContentBlocks] = useState<Block[]>([]);

// On course load:
setContentBlocks(course.contentBlocks ? JSON.parse(course.contentBlocks) : []);

// On auto-save, include contentBlocks:
await api.put(`/api/courses/${courseId}`, {
  ...fields,
  contentBlocks: JSON.stringify(contentBlocks),
});
```

### 4.2 Public Course Page: Render contentBlocks

**File**: `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx` (MODIFY)

After the FAQ section, render content blocks:
```tsx
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

// In the page component, after FAQ section:
{course.contentBlocks && (
  <section className={styles.contentBlocks}>
    <BlockRenderer
      blocks={typeof course.contentBlocks === 'string'
        ? JSON.parse(course.contentBlocks)
        : course.contentBlocks}
    />
  </section>
)}
```

### 4.3 Countdown Timer Config (C5 fix)

**File**: `apps/api/src/db/schema.ts` (MODIFY)

Add to `courses` table:
```typescript
saleEndDate: text("sale_end_date"),     // ISO date string — countdown end
saleTitle: text("sale_title"),           // "ƯU ĐÃI GIẢM GIÁ 90%"
```

**File**: `apps/web/src/components/admin/course-editor/CountdownConfig.tsx` (CREATE)

```tsx
function CountdownConfig({ saleEndDate, saleTitle, onChange }: Props) {
  return (
    <div className={styles.countdownSection}>
      <div className={styles.fld}>
        <span className={styles.lbl}>Hiển thị countdown</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={!!saleEndDate} onChange={...} />
          <span>Bật</span>
        </label>
      </div>

      {saleEndDate && (
        <>
          <div className={styles.fld}>
            <span className={styles.lbl}>Ngày kết thúc</span>
            <input type="datetime-local" value={saleEndDate} onChange={...} />
          </div>
          <div className={styles.fld}>
            <span className={styles.lbl}>Text ưu đãi</span>
            <input type="text" value={saleTitle} onChange={...} placeholder="ƯU ĐÃI GIẢM GIÁ 90%" />
          </div>
        </>
      )}
    </div>
  );
}
```

### 4.4 Student Success Stories (C6 fix)

**File**: `apps/api/src/db/schema.ts` (MODIFY)

Add table:
```typescript
export const studentStories = sqliteTable("student_stories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentRole: text("student_role"),           // "Chủ shop thời trang", "YouTuber"
  title: text("title"),                         // "CHỦ SHOP THỜI TRANG HỌC QUAY FASHION"
  content: text("content"),                     // Long description
  highlightMetric: text("highlight_metric"),    // "2M followers", "5000$/month"
  thumbnailUrl: text("thumbnail_url"),
  facebookStat: text("facebook_stat"),          // "0 M", "432.6K"
  youtubeStat: text("youtube_stat"),
  tiktokStat: text("tiktok_stat"),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

**File**: `apps/api/src/routes/student-stories.ts` (CREATE)

Standard CRUD route (follow patterns from `bonuses.ts` or `testimonials.ts`):
- `GET /api/courses/:courseId/stories`
- `POST /api/courses/:courseId/stories` (ADMIN)
- `PUT /api/courses/:courseId/stories/:id` (ADMIN)
- `DELETE /api/courses/:courseId/stories/:id` (ADMIN)

**File**: `apps/web/src/components/admin/course-editor/StoriesManager.tsx` (CREATE)

Simple list + form:
```tsx
function StoriesManager({ courseId, stories, onChange }: Props) {
  // List of story cards — each shows name, role, thumbnail, metrics
  // Add/Edit form in a modal or expandable panel
  // Drag to reorder
  // Delete with confirm
}
```

### Sprint 4 Verification Checklist

- [ ] Block editor renders in "Landing Page" section of course edit
- [ ] Blocks save to DB via auto-save, load back on page refresh
- [ ] Public course page renders contentBlocks below FAQ
- [ ] Countdown timer shows/hides, date picker works
- [ ] Student stories CRUD works in course edit
- [ ] Student stories render on public course detail page

---

## SPRINT 5: Polish — Empty States, Keyboard Shortcuts, a11y

**Duration**: 1-2 days
**Success**: Admin feels polished and production-ready.

### 5.1 Empty State Components

Create a shared empty state component:

**File**: `apps/web/src/components/admin/EmptyState.tsx` (CREATE)

```tsx
function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="admin-empty">
      <div className={styles.emptyIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="admin-btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
```

Use in: courses list, posts list, portfolios list, products list, FAQs list, testimonials list, promotions list.

### 5.2 Skeleton Loading States

Replace text "Đang tải..." with skeleton loaders in all list pages.

Example for course list:
```tsx
{loading ? (
  <div className={styles.skeletonGrid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className="admin-skeleton" style={{ height: 24, width: '60%', marginBottom: 8 }} />
        <div className="admin-skeleton" style={{ height: 14, width: '40%', marginBottom: 4 }} />
        <div className="admin-skeleton" style={{ height: 14, width: '30%' }} />
      </div>
    ))}
  </div>
) : ...}
```

### 5.3 Keyboard Shortcuts

Add to admin layout or individual pages:
- `⌘S` / `Ctrl+S` — Save (prevent default, trigger save)
- `⌘B` / `Ctrl+B` — Back to list
- `Escape` — Close modal, cancel inline edit

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [save]);
```

### 5.4 Unsaved Changes Warning

Before navigating away from a form with unsaved changes:
```tsx
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (saveStatus === 'unsaved') {
      e.preventDefault();
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [saveStatus]);
```

### 5.5 a11y Audit

- All form inputs have associated `<label>` (or `aria-label`)
- All buttons have discernible text
- Focus styles visible on all interactive elements
- Keyboard navigation works through all forms
- Color contrast: all text ≥ 4.5:1 on background (WCAG AA)

### Sprint 5 Verification Checklist

- [ ] Empty states on all list pages (courses, posts, portfolios, products, FAQs, etc.)
- [ ] Skeleton loaders on all list pages during loading
- [ ] ⌘S saves the current form
- [ ] Escape closes modals and inline editors
- [ ] Unsaved changes warning on page leave
- [ ] WCAG AA contrast on all text elements
- [ ] Keyboard Tab order is logical through all forms

---

## APPENDIX A: File Inventory — All Changes

### New Files

| File | Sprint | Description |
|------|--------|-------------|
| `packages/ui/styles/abstracts/_admin-variables.scss` | 1 | Admin SCSS tokens |
| `packages/ui/styles/admin-global.scss` | 1 | Admin global styles + CSS custom properties |
| `apps/web/src/app/quan-tri-vien/du-an/page.tsx` | 2 | Portfolio list page |
| `apps/web/src/app/quan-tri-vien/du-an/page.module.scss` | 2 | Portfolio list styles |
| `apps/web/src/app/quan-tri-vien/du-an/tao-moi/page.tsx` | 2 | Portfolio create page |
| `apps/web/src/app/quan-tri-vien/du-an/tao-moi/page.module.scss` | 2 | Portfolio create styles |
| `apps/web/src/app/quan-tri-vien/du-an/[id]/page.tsx` | 2 | Portfolio edit page |
| `apps/web/src/app/quan-tri-vien/du-an/[id]/page.module.scss` | 2 | Portfolio edit styles |
| `apps/web/src/app/quan-tri-vien/san-pham/tao-moi/page.tsx` | 2 | Product create (replace existing placeholder list) |
| `apps/web/src/app/quan-tri-vien/san-pham/tao-moi/page.module.scss` | 2 | Product create styles |
| `apps/web/src/app/quan-tri-vien/san-pham/[id]/page.tsx` | 2 | Product edit page |
| `apps/web/src/app/quan-tri-vien/san-pham/[id]/page.module.scss` | 2 | Product edit styles |
| `apps/web/src/components/admin/course-editor/CurriculumTree.tsx` | 3 | Drag-drop curriculum tree |
| `apps/web/src/components/admin/course-editor/CurriculumTree.module.scss` | 3 | Tree styles |
| `apps/web/src/components/admin/course-editor/PricingEditor.tsx` | 3 | Pricing tier editor |
| `apps/web/src/components/admin/course-editor/PricingEditor.module.scss` | 3 | Pricing styles |
| `apps/web/src/components/admin/course-editor/VerticalNav.tsx` | 3 | Vertical nav component |
| `apps/web/src/components/admin/course-editor/SaveStatus.tsx` | 3 | Save status indicator |
| `apps/web/src/components/admin/course-editor/CountdownConfig.tsx` | 4 | Countdown configurator |
| `apps/web/src/components/admin/course-editor/StoriesManager.tsx` | 4 | Student stories manager |
| `apps/api/src/routes/student-stories.ts` | 4 | Student stories API route |
| `apps/web/src/components/admin/EmptyState.tsx` | 5 | Shared empty state component |
| `apps/web/src/components/admin/EmptyState.module.scss` | 5 | Empty state styles |

### Modified Files

| File | Sprint | Description |
|------|--------|-------------|
| `apps/web/src/app/layout.tsx` | 1 | Import admin-global.scss |
| `apps/web/src/app/quan-tri-vien/layout.tsx` | 1 | Fix sidebar items, brand logo |
| `apps/web/src/app/quan-tri-vien/layout.module.scss` | 1 | Dark theme colors |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/page.module.scss` | 1 | Dark theme + skeleton |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.tsx` | 1,3,4 | Vertical nav, sections, block editor, countdown, stories |
| `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.module.scss` | 1,3 | Dark theme + new component styles |
| `apps/web/src/app/quan-tri-vien/san-pham/page.tsx` | 2 | Replace placeholder → full product list |
| `apps/web/src/app/quan-tri-vien/san-pham/page.module.scss` | 2 | Product list styles |
| `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx` | 4 | Render contentBlocks + student stories |
| `apps/api/src/db/schema.ts` | 4 | Add saleEndDate, saleTitle, studentStories |
| `apps/api/src/index.ts` | 4 | Route student-stories |

### Deleted/Replaced Files

| File | Sprint | Description |
|------|--------|-------------|
| None — all changes are additive or refactors | | |

---

## APPENDIX B: Database Migration (Sprint 4)

```sql
-- Add sale-related fields to courses (if not exists)
ALTER TABLE courses ADD COLUMN sale_end_date TEXT;
ALTER TABLE courses ADD COLUMN sale_title TEXT DEFAULT 'ƯU ĐÃI GIẢM GIÁ';

-- Student success stories table
CREATE TABLE IF NOT EXISTS student_stories (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_role TEXT,
  title TEXT,
  content TEXT,
  highlight_metric TEXT,
  thumbnail_url TEXT,
  facebook_stat TEXT,
  youtube_stat TEXT,
  tiktok_stat TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

Or use Drizzle push in dev:
```bash
bun run --filter @workspace/api db:push
```

---

## APPENDIX C: Dependency Check

| Dependency | Already installed? | Where | Notes |
|-----------|-------------------|-------|-------|
| `@dnd-kit/core` | Yes | Root `package.json` | Used for drag-drop curriculum tree |
| `@dnd-kit/sortable` | Yes | Root `package.json` | For sortable modules/lessons |
| `@dnd-kit/utilities` | Yes | Root `package.json` | `CSS` transform helper |
| `lucide-react` | Yes | `apps/web/package.json` | Icons for nav, cards, actions |
| `react` 19.2 | Yes | `apps/web/package.json` | useReducer, Server Components |
| `gsap` | Yes | `apps/web/package.json` | ScrollTrigger (if needed for scroll sync) |
| `@gsap/react` | Yes | `apps/web/package.json` | React GSAP integration |

**No new dependencies needed.** Everything is already in the project.

---

*End of implementation plan. Ready for stakeholder review and sprint kickoff.*
