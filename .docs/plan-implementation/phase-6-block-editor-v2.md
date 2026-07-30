# Phase 6: Block Editor V2 — Config Panel & Renderers Hoàn Chỉnh

**Duration:** 10-14 days | **Depends on:** Phase 0-3
**TDD:** Bun test cho Zod schemas + unit tests cho editor state. Frontend manual QA.
**Ref:** Spec 12, BRD 11, Planning 09, BLOCK-EDITOR-BRAINSTORMING.md

---

## Module 6.0: Fix Critical Bugs (Foundation)

**Priority:** CRITICAL — Must fix before adding new features

### Task 6.0.1: Fix LeftPanel blocks có data rỗng

**What:** `apps/web/src/app/quan-tri-vien/bai-viet/tao-moi/page.tsx` — `addBlock` function

**Root cause:** Page dùng `setBlocks([...prev, { id, type, data: {} }])`, bỏ qua `getDefaultData()`

**Fix:** Dùng `editor.addBlock(type)` từ editorState thay vì tự push:
```typescript
const addBlock = (type: BlockType) => {
  editor.addBlock(type);
};
```

**Verify:** Thêm Heading từ LeftPanel → block.data chứa `{ level: 2, text: "", alignment: "left", weight: "bold", italic: false, underline: false, color: "inherit" }`

### Task 6.0.2: Verify typing trong inputs hoạt động

**What:** Debug data flow RightPanel → editorState → Center preview

**Verify steps:**
1. Thêm Heading → select block → gõ text trong config panel
2. Preview center hiển thị text ngay lập tức
3. Mỗi keystroke phản ánh không cần blur/Enter

**Potential fix areas:**
- `editorState.updateBlock` closure (verify blocks dependency)
- RightPanel `onChange` callback pattern

### Task 6.0.3: Delete dead code

**Files to delete:**
- `apps/web/src/components/admin/block-editor/useBlockEditor.ts` — 196 dòng, không được import ở đâu
- `apps/web/src/app/quan-tri-vien/bai-viet/tao-bai-viet/page.tsx` — stub
- `apps/web/src/app/quan-tri-vien/bai-viet/tao-bai-viet/loading.tsx` — orphan
- `apps/web/src/app/quan-tri-vien/bai-viet/chinh-sua-bai-viet/page.tsx` — stub
- `apps/web/src/app/quan-tri-vien/bai-viet/chinh-sua-bai-viet/loading.tsx` — orphan

### Task 6.0.4: Redirect stub pages

**What:** Add redirects trong `next.config.ts` hoặc middleware:
- `/quan-tri-vien/bai-viet/tao-bai-viet` → `/quan-tri-vien/bai-viet/tao-moi`
- `/quan-tri-vien/bai-viet/chinh-sua-bai-viet` → `/quan-tri-vien/bai-viet`

### Task 6.0.5: Refactor edit page to full editor layout

**What:** `apps/web/src/app/quan-tri-vien/bai-viet/[slug]/page.tsx`

**Changes:** Thêm LeftPanel + RightPanel integration (giống `tao-moi/page.tsx`):
- Wrap với BlockEditor full layout
- Load content_blocks từ API → parse JSON → set blocks
- LeftPanel có info panel (title, slug, excerpt, category, thumbnail, SEO)
- RightPanel hiển thị block config form khi chọn block

**Verify:** Mở edit page của bài viết có sẵn → thấy đầy đủ 3-panel layout, chọn block → config hiện bên phải

---

## Module 6.1: Schema Update (Types Package)

**Priority:** HIGH — Foundation for all other work

### Task 6.1.1: Define shared enum schemas

**What:** `packages/types/src/schemas/blocks.ts` — Add shared reusable schemas

```typescript
export const roundedSchema = z.preprocess((val) => {
  if (typeof val === "boolean") return val ? "md" : "none";
  return val;
}, z.enum(["none", "sm", "md", "lg", "full"]).default("none"));

export const shadowSchema = z.enum(["none", "sm", "md", "lg", "xl"]).default("none");
export const iconSchema = z.string().nullable().default(null);
export const fontWeightSchema = z.enum(["regular", "medium", "semibold", "bold"]);
export const fontSizeSchema = z.enum(["sm", "md", "lg"]).default("md");
export const lineHeightSchema = z.enum(["tight", "normal", "relaxed"]).default("normal");
export const alignmentSchema = z.enum(["left", "center", "right", "justify"]).default("left");
export const colorSchema = z.enum(["inherit", "--color-text", "--color-text-muted", "--color-primary", "--color-accent", "--color-border"]).default("inherit");
export const cssVarColorSchema = z.enum(["--color-border", "--color-primary", "--color-accent"]).default("--color-border");
export const borderSchema = z.preprocess((val) => {
  if (typeof val === "boolean") return val ? "medium" : "none";
  return val;
}, z.enum(["none", "thin", "medium", "thick"]).default("none"));
```

### Task 6.1.2: Update heading schema

```typescript
const headingSchema = z.object({
  type: z.literal("heading"),
  level: z.number().min(1).max(6).default(2),
  text: z.string().min(1, "Tiêu đề không được để trống").default(""),
  alignment: alignmentSchema,
  weight: fontWeightSchema.default("bold"),
  italic: z.boolean().default(false),
  underline: z.boolean().default(false),
  color: colorSchema,
});
```

### Task 6.1.3: Update paragraph schema

```typescript
const paragraphSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1, "Nội dung không được để trống").default(""),
  alignment: alignmentSchema,
  dropCap: z.boolean().default(false),
  fontSize: fontSizeSchema,
  lineHeight: lineHeightSchema,
  fontWeight: fontWeightSchema.default("regular"),
  color: colorSchema,
});
```

### Task 6.1.4: Update quote schema

```typescript
const quoteSchema = z.object({
  type: z.literal("quote"),
  text: z.string().default(""),
  author: z.string().optional(),
  style: z.enum(["default", "bordered", "pull"]).default("default"),
  icon: iconSchema,
});
```

### Task 6.1.5: Update code schema

```typescript
const codeSchema = z.object({
  type: z.literal("code"),
  code: z.string().default(""),
  language: z.string().default("plaintext"),
  showLineNumbers: z.boolean().default(false),
  theme: z.enum(["dark", "light"]).default("dark"),
  showCopyButton: z.boolean().default(true),
});
```

### Task 6.1.6: Update callout schema

```typescript
const calloutSchema = z.object({
  type: z.literal("callout"),
  text: z.string().default(""),
  variant: z.enum(["info", "warning", "tip", "danger"]).default("info"),
  icon: iconSchema,
  title: z.string().optional().default(""),
});
```

### Task 6.1.7: Update image schema

```typescript
const imageSchema = z.object({
  type: z.literal("image"),
  mediaId: z.string(),
  alt: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  width: z.enum(["full", "wide", "contained", "inline"]).default("wide"),
  rounded: roundedSchema,
  border: borderSchema,
  shadow: shadowSchema,
  hoverZoom: z.boolean().default(false),
  link: z.string().optional().default(""),
  objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
});
```

### Task 6.1.8: Update video schema

```typescript
const videoSchema = z.object({
  type: z.literal("video"),
  mediaId: z.string(),
  caption: z.string().optional().default(""),
  aspectRatio: z.enum(["16:9", "4:3", "9:16", "1:1"]).default("16:9"),
  rounded: roundedSchema,
  shadow: shadowSchema,
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  showControls: z.boolean().default(true),
  thumbnail: z.string().optional().default(""),
});
```

### Task 6.1.9: Update gallery schema

```typescript
const gallerySchema = z.object({
  type: z.literal("gallery"),
  images: z.array(z.object({
    mediaId: z.string(),
    caption: z.string().optional(),
  })),
  columns: z.number().min(2).max(4).default(3),
  gap: z.enum(["sm", "md", "lg"]).default("md"),
  layout: z.enum(["grid", "masonry"]).default("grid"),
  rounded: roundedSchema,
  shadow: shadowSchema,
  hoverZoom: z.boolean().default(false),
  lightbox: z.boolean().default(true),
});
```

### Task 6.1.10: Update carousel schema

```typescript
const carouselSchema = z.object({
  type: z.literal("carousel"),
  slides: z.array(z.object({
    mediaId: z.string(),
    caption: z.string().optional(),
  })),
  autoplay: z.boolean().default(false),
  interval: z.number().min(1000).default(5000),
  showDots: z.boolean().default(true),
  showArrows: z.boolean().default(true),
  transition: z.enum(["slide", "fade", "cube"]).default("slide"),
  rounded: roundedSchema,
  shadow: shadowSchema,
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "auto"]).default("16:9"),
  loop: z.boolean().default(true),
  pauseOnHover: z.boolean().default(true),
  slidesPerView: z.number().min(1).max(3).default(1),
});
```

### Task 6.1.11: Update beforeAfter schema

```typescript
const beforeAfterSchema = z.object({
  type: z.literal("beforeAfter"),
  beforeMediaId: z.string(),
  afterMediaId: z.string(),
  beforeLabel: z.string().default("Trước"),
  afterLabel: z.string().default("Sau"),
  caption: z.string().optional().default(""),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  rounded: roundedSchema,
  shadow: shadowSchema,
});
```

### Task 6.1.12: Add columns schema (new fields)

```typescript
const columnsSchema = z.object({
  type: z.literal("columns"),
  columns: z.number().min(2).max(4).default(2),
  content: z.array(z.array(z.lazy(() => BlockSchema))).default([[], []]),
  gap: z.enum(["sm", "md", "lg"]).default("md"),
  columnRatios: z.enum(["auto", "50-50", "33-33-33", "25-75", "75-25", "33-67", "67-33"]).default("auto"),
});
```

### Task 6.1.13: Add tabs schema (new fields)

```typescript
const tabsSchema = z.object({
  type: z.literal("tabs"),
  tabs: z.array(z.object({
    label: z.string().default("Tab"),
    content: z.array(z.lazy(() => BlockSchema)).default([]),
  })).default([{ label: "Tab 1", content: [] }]),
  tabStyle: z.enum(["top", "pills", "vertical"]).default("top"),
  defaultTab: z.number().min(0).default(0),
});
```

### Task 6.1.14: Add accordion schema (new fields)

```typescript
const accordionSchema = z.object({
  type: z.literal("accordion"),
  items: z.array(z.object({
    title: z.string().default(""),
    content: z.array(z.lazy(() => BlockSchema)).default([]),
  })).default([{ title: "", content: [] }]),
  allowMultiple: z.boolean().default(true),
  iconPosition: z.enum(["left", "right"]).default("right"),
  defaultOpenIndex: z.number().min(-1).default(-1),
  borderStyle: z.enum(["bordered", "borderless"]).default("bordered"),
});
```

### Task 6.1.15: Add collapse schema (new fields)

```typescript
const collapseSchema = z.object({
  type: z.literal("collapse"),
  title: z.string().default(""),
  content: z.array(z.lazy(() => BlockSchema)).default([]),
  defaultOpen: z.boolean().default(false),
  iconPosition: z.enum(["left", "right"]).default("right"),
});
```

### Task 6.1.16: Update timeline schema

```typescript
const timelineSchema = z.object({
  type: z.literal("timeline"),
  events: z.array(z.object({
    date: z.string().default(""),
    title: z.string().default(""),
    description: z.string().default(""),
  })),
  layout: z.enum(["vertical", "horizontal", "alternating"]).default("vertical"),
  iconPerEvent: iconSchema,
  lineColor: cssVarColorSchema,
});
```

### Task 6.1.17: Update CTA schema

```typescript
const ctaSchema = z.object({
  type: z.literal("cta"),
  heading: z.string().default(""),
  text: z.string().optional().default(""),
  buttonText: z.string().default(""),
  buttonUrl: z.string().default(""),
  style: z.enum(["primary", "secondary", "minimal"]).default("primary"),
  backgroundMediaId: z.string().optional().default(""),
  buttonStyle: z.enum(["solid", "outline", "ghost"]).default("solid"),
  buttonSize: z.enum(["sm", "md", "lg"]).default("md"),
  buttonIcon: iconSchema,
});
```

### Task 6.1.18: Update pricingTable schema

```typescript
const pricingTableSchema = z.object({
  type: z.literal("pricingTable"),
  plans: z.array(z.object({
    name: z.string().default(""),
    price: z.string().default(""),
    period: z.string().optional(),
    description: z.string().optional().default(""),
    features: z.array(z.string()).default([]),
    cta: z.object({
      text: z.string().default("Đăng ký"),
      url: z.string().default(""),
    }),
    highlighted: z.boolean().default(false),
  })),
  currency: z.string().default("VNĐ"),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
  layout: z.enum(["horizontal", "vertical"]).default("horizontal"),
});
```

### Task 6.1.19: Update testimonial schema

```typescript
const testimonialSchema = z.object({
  type: z.literal("testimonial"),
  testimonialId: z.string().default(""),
  style: z.enum(["card", "inline", "large"]).default("card"),
  showAvatar: z.boolean().default(true),
  showRating: z.boolean().default(true),
  avatarSize: z.enum(["sm", "md", "lg"]).default("md"),
  background: z.enum(["none", "light", "dark", "gradient"]).default("none"),
});
```

### Task 6.1.20: Update getDefaultData in editorState.ts

**What:** Cập nhật tất cả default values khớp với schema mới

**Verify:** `bun run test` — tất cả block test cases pass với schema mới

### Task 6.1.21: Write/update schema tests

**What:** `packages/types/src/schemas/blocks.test.ts` — Add tests for:
- Backward compat: boolean rounded/border → enum migration
- Every new field được parse đúng
- Unknown fields bị strip
- Default values áp dụng đúng

---

## Module 6.2: Shared UI Components

**Priority:** HIGH — Dependencies for all editors

### Task 6.2.1: IconPicker Component

**What:** `apps/web/src/components/admin/block-editor/IconPicker.tsx`

**Input:** `value: string | null`, `onChange: (name: string | null) => void`
**Output:** Popover grid of Lucide icons categorized, with search

**Implementation checklist:**
- [ ] Icon grid với category sections (Mũi tên, Giao tiếp, Media, Hành động, Thông báo, Chung)
- [ ] Search input filter icon theo tên
- [ ] Click icon → chọn, popover đóng
- [ ] Hiển thị preview icon đã chọn
- [ ] Nút "X" để clear selection
- [ ] Lazy load icons (chỉ render icons trong viewport nếu cần)

**Dependencies:** Lucide icons từ `@workspace/ui` (đã có sẵn)

### Task 6.2.2: ColorDropdown Component

**What:** `apps/web/src/components/admin/block-editor/ColorDropdown.tsx`

**Input:** `value: string` (CSS variable name), `onChange: (cssVar: string) => void`
**Output:** Dropdown với swatches màu từ theme CSS variables

**Colors:**
- `inherit` — Kế thừa
- `--color-text` — Trắng (text chính)
- `--color-text-muted` — Xám (text phụ)
- `--color-primary` — Xanh primary
- `--color-accent` — Vàng accent
- `--color-border` — Màu border (chỉ cho timeline line)

### Task 6.2.3: NestedBlockEditor Component

**What:** `apps/web/src/components/admin/block-editor/NestedBlockEditor.tsx`

**Input:** `blocks: Block[]`, `onChange: (blocks: Block[]) => void`, `label?: string`
**Output:** Mini block editor trong config panel với sortable list + add block menu

**Implementation checklist:**
- [ ] Hiển thị label zone (vd: "Cột 1", "Tab: Giới thiệu")
- [ ] Sortable block list (dùng @dnd-kit, compact style)
- [ ] Nút "+" để thêm block mới vào nested zone
- [ ] Mỗi nested block có: type icon + preview text + delete button
- [ ] Click nested block → expand-in-place sub-editor (hoặc set làm selected block của parent)
- [ ] Depth limit: không cho phép thêm nested block type chứa nested blocks ở depth 3

### Task 6.2.4: Update shared form components

**What:** `apps/web/src/components/admin/block-editor/block-editors.tsx` — Add new base controls

- `AlignmentGroup` — Button group 4 icons: left, center, right, justify (thay thế Select hiện tại)
- `WeightSelect` — Select với 4 options: regular, medium, semibold, bold
- `RoundedSelect` — Select với preview visual bo góc (none/sm/md/lg/full)
- `ShadowSelect` — Select 5 mức shadow (none/sm/md/lg/xl)
- `ConditionalField` — Wrapper chỉ render khi condition prop = true

---

## Module 6.3: Typography Editors Update

**Priority:** MEDIUM

### Task 6.3.1: HeadingEditor update

**What:** Add weight, italic, underline, color fields + change alignment to button group

**Fields layout:**
```
┌─ Block: Tiêu đề ──────────────────┐
│ Text:         [________________]  │
│ Cấp độ:       [ H2 ▼           ]  │
│ Căn lề:       [◀] [▶] [◎] [≡]   │  ← Button group
│ Độ đậm:       [ semibold ▼     ]  │
│ ───────────────────────────────── │
│ ☐ In nghiêng    ☐ Gạch chân      │  ← Toggle row
│ ───────────────────────────────── │
│ Màu chữ:      [ Kế thừa ▼      ]  │  ← ColorDropdown
└───────────────────────────────────┘
```

### Task 6.3.2: ParagraphEditor update

**What:** Add fontSize, lineHeight, weight, color + justify alignment

### Task 6.3.3: QuoteEditor update

**What:** Add IconPicker for quote icon

### Task 6.3.4: CodeEditor update

**What:** Change language input → Select với preset languages; add theme + showCopyButton

### Task 6.3.5: CalloutEditor update

**What:** Add title input; upgrade icon field to IconPicker

---

## Module 6.4: Media Editors Update

**Priority:** MEDIUM

### Task 6.4.1: ImageEditor update

**What:** Thay boolean rounded/border → Select enum; thêm shadow, hoverZoom, link, objectFit

**Fields layout:**
```
┌─ Block: Ảnh ──────────────────────┐
│ Chọn ảnh:     [img-123] [Chọn]    │
│ Alt text:     [_______________]   │
│ Chú thích:    [_______________]   │
│ ───────────────────────────────── │
│ Độ rộng:      [ Wide ▼         ]  │
│ Bo góc:       [ Lớn (16px) ▼  ]  │
│ Viền:         [ Vừa (2px) ▼   ]  │
│ Bóng đổ:      [ Trung bình ▼  ]  │
│ ───────────────────────────────── │
│ ☐ Phóng to khi hover              │
│ ☐ Fit ảnh:       [ Cover ▼    ]  │
│ Link (tùy chọn):[____________]    │
└───────────────────────────────────┘
```

### Task 6.4.2: VideoEditor update

**What:** Add rounded, shadow, autoplay, loop, showControls, thumbnail

### Task 6.4.3: GalleryEditor update

**What:** Add rounded, shadow, hoverZoom, lightbox toggles

### Task 6.4.4: CarouselEditor update

**What:** Add transition, rounded, shadow, aspectRatio, loop, pauseOnHover, slidesPerView

Conditional: `interval` chỉ hiện khi `autoplay = true`

### Task 6.4.5: BeforeAfterEditor update

**What:** Add orientation, rounded, shadow

---

## Module 6.5: Layout Editors (NEW)

**Priority:** HIGH — Unblocks 2/22 block types

### Task 6.5.1: ColumnsEditor

**What:** Config panel cho columns block với nested editor

**Fields:**
```
┌─ Block: Cột ──────────────────────┐
│ Số cột:       [ 2 ▼            ]  │
│ Khoảng cách:  [ Trung bình ▼   ]  │
│ Tỉ lệ cột:    [ Tự động ▼     ]  │
│ ───────────────────────────────── │
│ ┌─ Cột 1 ──────────────────────┐ │
│ │ [+ Thêm block]               │ │  ← NestedBlockEditor
│ │ (trống)                      │ │
│ └──────────────────────────────┘ │
│ ┌─ Cột 2 ──────────────────────┐ │
│ │ [+ Thêm block]               │ │
│ │ (trống)                      │ │
│ └──────────────────────────────┘ │
│ (Số cột zone thay đổi theo select)│
└───────────────────────────────────┘
```

**Dynamic behavior:**
- Chọn columns = 3 → hiện 3 nested editor zones
- Chọn columnRatios = "25-75" → preview center hiển thị tỉ lệ tương ứng
- Thêm/xóa blocks trong nested zones → cập nhật `data.content[i]`

### Task 6.5.2: TabsEditor

**What:** Config panel cho tabs block

**Fields:**
```
┌─ Block: Tab ──────────────────────┐
│ Kiểu tab:     [ Pills ▼        ]  │
│ Tab mặc định: [ 0             ]  │
│ ─────────────────────────────────  │
│ ┌─ Tab 1 ──────────────────────┐  │
│ │ Nhãn: [Giới thiệu_________]  │  │
│ │ ┌─────────────────────────┐  │  │
│ │ │ [+ Thêm block]          │  │  │ ← NestedBlockEditor
│ │ └─────────────────────────┘  │  │
│ │                          [✕] │  │
│ └──────────────────────────────┘  │
│ ┌─ Tab 2 ──────────────────────┐  │
│ │ Nhãn: [Chi tiết___________]  │  │
│ │ ┌─────────────────────────┐  │  │
│ │ │ [+ Thêm block]          │  │  │
│ │ └─────────────────────────┘  │  │
│ │                          [✕] │  │
│ └──────────────────────────────┘  │
│ [+ Thêm tab]                      │
└───────────────────────────────────┘
```

---

## Module 6.6: Interactive Editors (NEW)

**Priority:** HIGH — Unblocks 2/22 block types

### Task 6.6.1: AccordionEditor

**What:** Config panel cho accordion block với nested editor per item

**Fields:**
```
┌─ Block: Accordion ────────────────┐
│ ☐ Cho phép mở nhiều item         │
│ Vị trí icon:  [ Phải ▼        ]  │
│ Mở mặc định: [ -1            ]  │
│ Kiểu viền:    [ Có viền ▼    ]  │
│ ─────────────────────────────────  │
│ ┌─ Item 1 ─────────────────────┐  │
│ │ Tiêu đề: [Câu hỏi 1______]  │  │
│ │ ┌─────────────────────────┐  │  │
│ │ │ [+ Thêm block]          │  │  │ ← NestedBlockEditor
│ │ └─────────────────────────┘  │  │
│ │                          [✕] │  │
│ └──────────────────────────────┘  │
│ [+ Thêm item]                     │
└───────────────────────────────────┘
```

### Task 6.6.2: CollapseEditor

**What:** Config panel cho collapse block với nested editor

**Fields:** title + nested editor + defaultOpen toggle + iconPosition select

### Task 6.6.3: TimelineEditor update

**What:** Add layout, iconPerEvent, lineColor

---

## Module 6.7: Conversion Editors Update

**Priority:** MEDIUM

### Task 6.7.1: CTAEditor update

**What:** Add buttonStyle, buttonSize, buttonIcon

### Task 6.7.2: PricingTableEditor update

**What:** Add currency, billingPeriod toggle, layout select

### Task 6.7.3: TestimonialEditor update

**What:** Change testimonialId text input → Select (fetch API); add showAvatar, showRating, avatarSize, background

**API integration:**
```typescript
// Trong TestimonialEditor, useEffect fetch testimonials
useEffect(() => {
  fetch('/api/testimonials')
    .then(res => res.json())
    .then(data => setTestimonials(data));
}, []);
```

---

## Module 6.8: Renderers Implementation

**Priority:** MEDIUM — Depends on Module 6.1 (schemas)

### Task 6.8.1: Update typography renderers

| Renderer | Scope |
|----------|-------|
| HeadingBlock | Apply weight, italic, underline, color qua CSS classes |
| ParagraphBlock | Apply fontSize, lineHeight, weight, color |
| QuoteBlock | Render icon nếu có |
| CodeBlock | Apply theme class + render copy button |
| CalloutBlock | Render title nếu có |

### Task 6.8.2: Update media renderers

| Renderer | Scope |
|----------|-------|
| ImageBlock | Apply rounded/border/shadow/hoverZoom/link/objectFit |
| VideoBlock | Apply rounded/shadow, autoplay/loop/controls, thumbnail overlay |

### Task 6.8.3: Rewrite media renderers (from stub)

| Renderer | Implementation |
|----------|---------------|
| GalleryBlock | CSS Grid với layout grid/masonry, lightbox (click mở modal full ảnh), hoverZoom |
| CarouselBlock | Slideshow với dots/arrows, autoplay, transition (CSS slide/fade), pauseOnHover |
| BeforeAfterBlock | Slider kéo so sánh 2 ảnh (CSS range input or custom drag), orientation support |

### Task 6.8.4: Rewrite layout renderers

| Renderer | Implementation |
|----------|---------------|
| ColumnsBlock | Multi-column flexbox/grid với columnRatios, responsive collapse mobile |
| TabsBlock | Tab navigation + content panels, tabStyle (top line/pills/vertical) |

### Task 6.8.5: Rewrite interactive renderers

| Renderer | Implementation |
|----------|---------------|
| AccordionBlock | Expandable sections, allowMultiple, iconPosition, borderStyle, defaultOpenIndex |
| CollapseBlock | Single expandable section, iconPosition |
| TimelineBlock | Vertical/horizontal/alternating layout, icon per event, line color |
| TableBlock | Responsive table with striped, compact modes |

### Task 6.8.6: Rewrite conversion renderers

| Renderer | Implementation |
|----------|---------------|
| PricingBlock | Card layout plans, highlighted plan, billing period toggle, currency display |
| TestimonialBlock | Card/inline/large styles, avatar, rating stars, background variants |
| CTABlock | Apply buttonStyle/size/icon to existing renderer |

---

## Module 6.9: Integration & Testing

**Priority:** MEDIUM

### Task 6.9.1: RightPanel registry update

**What:** Add 4 new editors to `EDITORS` record + update existing editor references

### Task 6.9.2: Full workflow test

**Test plan (manual QA):**
1. Login admin → `/quan-tri-vien/bai-viet/tao-moi`
2. Thêm từng block type (22 lần) → verify config panel hiển thị
3. Thay đổi mọi config field → verify preview cập nhật
4. Kéo thả sort blocks → verify order thay đổi
5. Undo/Redo → verify lịch sử hoạt động
6. Nested blocks: thêm Columns → thêm block con vào cột → verify
7. Save bài viết → reload → verify blocks vẫn đúng
8. Frontend `/bai-viet/[slug]` → verify renderer hiển thị đúng
9. Backward compat: mở bài viết cũ (schema cũ) → verify parse OK, hiển thị đúng

### Task 6.9.3: Build verification

**What:** `bun run build` từ root monorepo → 0 errors, 0 warnings

### Task 6.9.4: Type check

**What:** `bunx tsc --noEmit` → 0 type errors

---

## Rollout Sequence

```
Day 1-2:   Module 6.0 (Bug Fixes)
Day 2-3:   Module 6.1 (Schema Update) — can parallel with 6.2
Day 3-4:   Module 6.2 (Shared UI: IconPicker, ColorDropdown, NestedEditor)
Day 4-5:   Module 6.3 (Typography Editors)
Day 5-6:   Module 6.4 (Media Editors)
Day 6-7:   Module 6.5 (Layout Editors — NEW)
Day 7-8:   Module 6.6 (Interactive Editors — NEW)
Day 8-9:   Module 6.7 (Conversion Editors)
Day 9-12:  Module 6.8 (Renderers — all 14 rewrites + 7 updates)
Day 12-14: Module 6.9 (Integration + QA + Build)
```

---

## Dependencies

- **Phase 0:** Foundation (Bun + Turborepo + Biome)
- **Phase 1:** Core Admin (Auth + Dashboard Shell)
- **Phase 2:** Content Management (Posts CRUD API)
- **Spec 04:** Media Microservice (MediaPicker integration)
