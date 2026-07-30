# Planning 09: Block Editor V2 — Config Panel & Renderers

**Part of:** Delivery Planning
**Ref:** Specs 12, BRD 11; BLOCK-EDITOR-BRAINSTORMING.md
**Status:** Draft

---

## 1. Architecture Overview

### Problem: Current State (50% Complete)

```
CURRENT STATE (50%)
├── Zod Schemas      ████████████ 100% (22 types defined)
├── Editor Forms     ██████░░░░░░  82% (18/22, but basic configs)
├── Renderers        ████░░░░░░░░  36% (8/22 real, 14 stubs)
├── Nested Editor    ░░░░░░░░░░░░   0% (no nested editor UI)
├── Shared UI        ████░░░░░░░░  40% (no IconPicker, no ColorDropdown)
├── Bug-free         ██████░░░░░░  60% (5 known bugs)
```

### Target: V2 Complete

```
TARGET STATE V2 (100%)
├── Zod Schemas      ████████████ 100% (extended with 50+ new fields)
├── Editor Forms     ████████████ 100% (22/22, full configs)
├── Renderers        ████████████ 100% (22/22 real renderers)
├── Nested Editor    ████████████ 100% (expand-in-place)
├── Shared UI        ████████████ 100% (IconPicker, ColorDropdown, NestedEditor)
├── Bug-free         ████████████ 100% (5 bugs fixed)
```

---

## 2. Component Architecture

### 2.1 New & Updated Components

```
apps/web/src/components/
├── admin/
│   └── block-editor/
│       ├── BlockEditor.tsx          [UPDATE] Fix center click, integrate nested editor
│       ├── editorState.ts           [UPDATE] Expanded getDefaultData, new field defaults
│       ├── LeftPanel.tsx            [NO CHANGE]
│       ├── RightPanel.tsx           [UPDATE] Add 4 missing editors to registry
│       ├── BlockPreview.tsx         [NO CHANGE]
│       ├── block-editors.tsx        [MAJOR UPDATE] 22 full editors + 2 new shared components
│       ├── IconPicker.tsx           [NEW] Lucide icon grid with search
│       │   └── IconPicker.module.scss
│       ├── ColorDropdown.tsx        [NEW] CSS variable color picker
│       │   └── ColorDropdown.module.scss
│       ├── NestedBlockEditor.tsx    [NEW] Mini block editor for nested content
│       │   └── NestedBlockEditor.module.scss
│       └── workspace.module.scss    [UPDATE] New component styles
│
├── blocks/                          [22 renderers — 14 MAJOR UPDATE from stub → real]
│   ├── BlockRenderer.tsx            [NO CHANGE] Already maps all 22
│   ├── typography/
│   │   └── HeadingBlock.tsx         [UPDATE] weight, italic, underline, color
│   │   └── ParagraphBlock.tsx       [UPDATE] fontSize, lineHeight, weight, color
│   │   └── QuoteBlock.tsx           [UPDATE] icon support
│   │   └── CodeBlock.tsx            [UPDATE] theme, copy button
│   │   └── CalloutBlock.tsx         [UPDATE] title support
│   ├── media/
│   │   └── ImageBlock.tsx           [UPDATE] new rounded/border/shadow enums, hoverZoom, link
│   │   └── VideoBlock.tsx           [UPDATE] new styling, autoplay, loop, controls, thumbnail
│   │   └── GalleryBlock.tsx         [REWRITE] real grid/masonry + lightbox
│   │   └── CarouselBlock.tsx        [REWRITE] real carousel with transitions
│   │   └── BeforeAfterBlock.tsx     [REWRITE] real comparison slider
│   ├── layout/
│   │   └── ColumnsBlock.tsx         [REWRITE] real multi-column
│   │   └── TabsBlock.tsx            [REWRITE] real tabs
│   ├── interactive/
│   │   └── AccordionBlock.tsx       [REWRITE] real accordion
│   │   └── CollapseBlock.tsx        [REWRITE] real collapse
│   │   └── TimelineBlock.tsx        [REWRITE] real timeline
│   │   └── TableBlock.tsx           [REWRITE] real table
│   └── conversion/
│       └── CTABlock.tsx             [UPDATE] button style/size/icon
│       └── PricingBlock.tsx         [REWRITE] real pricing table
│       └── TestimonialBlock.tsx     [REWRITE] real testimonial cards
```

### 2.2 Component Dependency Graph

```
BlockEditor
├── LeftPanel
│   └── (unchanged)
├── Center
│   ├── BlockPreview
│   │   └── BlockRenderer → 22 Block Components
│   └── SortableBlockList (@dnd-kit)
│       └── MiniBlockPreview
└── RightPanel
    ├── HeadingEditor
    │   └── TextInput, Select, ButtonGroup, Toggle, ColorDropdown
    ├── ParagraphEditor
    │   └── TextArea, Select, ButtonGroup, Toggle, ColorDropdown
    ├── QuoteEditor
    │   └── TextArea, TextInput, Select, IconPicker
    ├── ... (22 editors)
    ├── ColumnsEditor [NEW]
    │   └── Select, Select (gap), Select (ratios), NestedBlockEditor × N
    ├── TabsEditor [NEW]
    │   └── Dynamic tabs, NestedBlockEditor per tab
    ├── AccordionEditor [NEW]
    │   └── Dynamic items, NestedBlockEditor per item
    ├── CollapseEditor [NEW]
    │   └── TextInput, NestedBlockEditor, Toggle, Select
    │
    ├── IconPicker [NEW shared]
    │   └── SearchBar + IconGrid (Lucide)
    ├── ColorDropdown [NEW shared]
    │   └── Color swatches from CSS variables
    └── NestedBlockEditor [NEW shared]
        └── Mini SortableBlockList + Add block button
```

---

## 3. Schema Extension Design

### 3.1 Migration Strategy: Boolean → Enum

```typescript
// BEFORE (image block)
rounded: z.boolean().default(false),
border: z.boolean().default(false),

// AFTER
rounded: z.enum(["none", "sm", "md", "lg", "full"]).default("none"),
border: z.enum(["none", "thin", "medium", "thick"]).default("none"),

// Backward compat: parse boolean thành enum
const roundedSchema = z.preprocess((val) => {
  if (typeof val === "boolean") return val ? "md" : "none";
  return val;
}, z.enum(["none", "sm", "md", "lg", "full"]).default("none"));
```

### 3.2 New Shared Types

```typescript
// packages/types/src/schemas/blocks.ts

// Shared enums used across multiple blocks
export const roundedSchema = z.enum(["none", "sm", "md", "lg", "full"]);
export const shadowSchema = z.enum(["none", "sm", "md", "lg", "xl"]);
export const iconSchema = z.string().nullable().default(null); // Lucide icon name
export const colorSchema = z.enum([
  "inherit", "--color-text", "--color-text-muted",
  "--color-primary", "--color-accent", "--color-border"
]).default("inherit");
export const fontWeightSchema = z.enum(["regular", "medium", "semibold", "bold"]);
export const cssVarColorSchema = z.enum([
  "--color-border", "--color-primary", "--color-accent"
]).default("--color-border");
```

### 3.3 Field Count Before/After

| Block Type | Before | After | New Fields |
|-----------|--------|-------|------------|
| heading | 3 | 8 | weight, italic, underline, color, justify alignment |
| paragraph | 3 | 7 | fontSize, lineHeight, weight, color, justify |
| quote | 3 | 4 | icon |
| code | 3 | 5 | theme, showCopyButton |
| callout | 3 | 4 | title |
| image | 7 | 11 | rounded(enum), border(enum), shadow, hoverZoom, link, objectFit |
| video | 3 | 9 | rounded, shadow, autoplay, loop, showControls, thumbnail |
| gallery | 4 | 8 | rounded, shadow, hoverZoom, lightbox |
| carousel | 5 | 12 | transition, rounded, shadow, aspectRatio, loop, pauseOnHover, slidesPerView |
| beforeAfter | 5 | 8 | orientation, rounded, shadow |
| columns | 3 | 4 | columnRatios |
| tabs | 1 | 3 | tabStyle, defaultTab |
| accordion | 2 | 5 | iconPosition, defaultOpenIndex, borderStyle |
| collapse | 3 | 4 | iconPosition |
| timeline | 1 | 4 | layout, iconPerEvent, lineColor |
| cta | 6 | 9 | buttonStyle, buttonSize, buttonIcon |
| pricingTable | 1 | 4 | currency, billingPeriod, layout |
| testimonial | 2 | 6 | showAvatar, showRating, avatarSize, background |

**Total new fields: 50+ across 17 block schemas**

---

## 4. Nested Block Editor Design

### Concept: Expand-in-Place

Khi admin click vào 1 column/accordion item/tab/collapse zone trong config panel, nested editor mở rộng ngay tại đó:

```
RightPanel:
┌─────────────────────────────────┐
│ COLUMNS CONFIG                   │
│ ─────────────────────────────── │
│ Columns: [2▼]  Gap: [md▼]       │
│ Ratios: [50-50▼]                │
│                                  │
│ ┌─ Column 1 ──────────────────┐ │
│ │ [+ Thêm block]              │ │
│ │ ┌──────────────────────┐    │ │
│ │ │ 📝 Paragraph         │    │ │
│ │ │ "Nội dung cột 1..."  │    │ │
│ │ │              [✕] [⋮⋮]│    │ │
│ │ └──────────────────────┘    │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─ Column 2 ──────────────────┐ │
│ │ [+ Thêm block]              │ │
│ │ (trống)                     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Implementation

```typescript
// NestedBlockEditor.tsx
interface NestedBlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  label?: string;
}

export function NestedBlockEditor({ blocks, onChange, label }: NestedBlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock = { id: crypto.randomUUID(), type, data: getDefaultData(type) };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className={styles.nestedEditor}>
      {label && <span className={styles.zoneLabel}>{label}</span>}
      <div className={styles.nestedBlockList}>
        {blocks.map(block => (
          <NestedBlockItem key={block.id} block={block} ... />
        ))}
      </div>
      <AddBlockMenu onSelect={addBlock} compact />
    </div>
  );
}
```

### Recursive Depth Limit

```typescript
// BlocksEditor mở trong nested chỉ hỗ trợ tối đa 3 levels
// Level 0: BlockEditor (main)
// Level 1: Columns/Accordion/Tabs/Collapse nested
// Level 2: Nested columns/accordion bên trong (max depth)
// Level 3: Không cho phép nested block chứa nested block nữa
```

---

## 5. Icon Picker Design

### Component Structure

```typescript
interface IconPickerProps {
  value: string | null;
  onChange: (iconName: string | null) => void;
}

// UI Flow:
// ┌──────────────────────┐
// │ [Chưa chọn] [Chọn]   │  ← Default state
// └──────────────────────┘
//
// Click "Chọn" →
// ┌──────────────────────────────────────┐
// │ 🔍 [Tìm icon...                    ] │  ← Search
// │ ──────────────────────────────────── │
// │ ← →   Arrows                         │
// │ ★ ⭐   Star    (clickable grid)       │
// │ ❤ 💚   Heart                         │
// │ ⚡ 💡   Zap/Bulb                      │
// │ ...                                   │
// └──────────────────────────────────────┘
//
// After select:
// ┌──────────────────────┐
// │ [Star ★] [✕] [Đổi]   │  ← Selected state
// └──────────────────────┘
```

### Icon Categories from Lucide

```typescript
const ICON_CATEGORIES: Record<string, string[]> = {
  "Mũi tên": ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown", "MoveRight", "MoveLeft"],
  "Giao tiếp": ["MessageCircle", "MessageSquare", "Mail", "Phone", "Send", "Share2", "AtSign"],
  "Media": ["Image", "Video", "Camera", "Play", "Pause", "Music", "Film"],
  "Hành động": ["Check", "X", "Plus", "Minus", "Search", "Trash2", "Edit", "Copy", "Download", "Upload", "ExternalLink", "Link"],
  "Thông báo": ["Bell", "AlertCircle", "AlertTriangle", "Info", "HelpCircle", "Zap", "Star", "Heart", "ThumbsUp", "Award"],
  "Chung": ["Globe", "Home", "User", "Users", "Settings", "Calendar", "Clock", "BookOpen", "FileText", "Quote", "Lightbulb", "Sparkles"]
};
```

---

## 6. Color Dropdown Design

### Theme CSS Variables

```scss
// Dựa trên các biến SCSS hiện có trong @workspace/ui
:root {
  --color-text: #FFFFFF;
  --color-text-muted: #94A3B8;
  --color-primary: #3B82F6;
  --color-accent: #F59E0B;
  --color-border: #334155;
}
```

### Component

```typescript
interface ColorDropdownProps {
  value: string;      // CSS variable name or "inherit"
  onChange: (cssVar: string) => void;
}

// Renders:
// ┌─────────────────────┐
// │ [Màu chữ ▼]         │
// ├─────────────────────┤
// │ ○ Kế thừa           │  ← "inherit"
// │ ● Trắng             │  ← "--color-text"
// │ ● Xám               │  ← "--color-text-muted"
// │ ● Xanh (primary)    │  ← "--color-primary"
// │ ● Vàng (accent)     │  ← "--color-accent"
// └─────────────────────┘
```

---

## 7. File Change Summary

### Files to Create
| # | File | Lines (est.) |
|---|------|-------------|
| 1 | `IconPicker.tsx` | ~150 |
| 2 | `IconPicker.module.scss` | ~60 |
| 3 | `ColorDropdown.tsx` | ~80 |
| 4 | `ColorDropdown.module.scss` | ~50 |
| 5 | `NestedBlockEditor.tsx` | ~200 |
| 6 | `NestedBlockEditor.module.scss` | ~80 |

### Files to Modify
| # | File | Scope |
|---|------|-------|
| 7 | `packages/types/src/schemas/blocks.ts` | Major: 50+ new fields, migrations |
| 8 | `packages/types/src/schemas/blocks.test.ts` | Update tests for new schemas |
| 9 | `apps/web/src/components/admin/block-editor/editorState.ts` | Expanded getDefaultData |
| 10 | `apps/web/src/components/admin/block-editor/RightPanel.tsx` | Add 4 missing editors |
| 11 | `apps/web/src/components/admin/block-editor/block-editors.tsx` | Major: update 14 editors, add 4 new |
| 12 | `apps/web/src/components/admin/block-editor/block-editors.module.scss` | Styles for new controls |
| 13 | `apps/web/src/components/admin/block-editor/BlockEditor.tsx` | Fix bugs + nested editor support |
| 14 | `apps/web/src/components/admin/block-editor/workspace.module.scss` | Updated layout |
| 15 | `apps/web/src/components/blocks/typography/HeadingBlock.tsx` | New style props |
| 16 | `apps/web/src/components/blocks/typography/HeadingBlock.module.scss` | New CSS |
| 17 | `apps/web/src/components/blocks/typography/ParagraphBlock.tsx` | New style props |
| 18 | `apps/web/src/components/blocks/typography/ParagraphBlock.module.scss` | New CSS |
| 19 | `apps/web/src/components/blocks/media/ImageBlock.tsx` | New style props |
| 20 | `apps/web/src/components/blocks/media/ImageBlock.module.scss` | New CSS |
| 21 | 14 renderer rewrites | From stub → real |
| 22 | `apps/web/src/app/quan-tri-vien/bai-viet/tao-moi/page.tsx` | Fix addBlock bug |
| 23 | `apps/web/src/app/quan-tri-vien/bai-viet/[slug]/page.tsx` | Full editor layout |

### Files to Delete
| # | File | Reason |
|---|------|--------|
| 24 | `useBlockEditor.ts` | Dead code, never imported |
| 25 | `tao-bai-viet/page.tsx` | Stub page |
| 26 | `chinh-sua-bai-viet/page.tsx` | Stub page |
| 27 | `tao-bai-viet/loading.tsx` | Orphan |
| 28 | `chinh-sua-bai-viet/loading.tsx` | Orphan |

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema migration breaks existing data | High | Preprocess hook auto-converts boolean → enum |
| Nested editor recursion too deep | Medium | Depth limit = 3, UI indicates max depth |
| Performance with 50+ blocks | Low | Virtual scroll not needed (content editor, not data grid) |
| Icon Picker too many icons | Low | Categorize + search filter, lazy render |
| Backward compat: old blocks loaded into new editor | Medium | All new fields have `.default()` in Zod schema |

---

## 9. Rollout Strategy

| Rollout # | Scope | Verification |
|-----------|-------|-------------|
| R1 — Schema + Default Data | Types package only, no UI change | `bun test` passes for all schemas |
| R2 — Shared UI Components | IconPicker, ColorDropdown, NestedEditor | Manual QA in Storybook-like setup |
| R3 — Typography Editors | Heading, Paragraph, Quote, Code, Callout | Test each config → preview updates |
| R4 — Media Editors | Image, Video, Gallery, Carousel, BeforeAfter | Test media picker + styling |
| R5 — Layout Editors | Divider, Spacer, Columns, Tabs | Test nested editor + ratios |
| R6 — Interactive Editors | Accordion, Collapse, Timeline, Table | Test nested editor + dynamics |
| R7 — Conversion Editors | CTA, Pricing, Testimonial | Test testimonial API dropdown |
| R8 — Bug Fixes + Cleanup | All 5 bugs, delete dead code | Verify typing, default data, redirects |
