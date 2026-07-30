# Block Editor — Restructure Plan

**Date:** 2026-07-31  
**Status:** Proposal — Chờ review trước khi implement  
**Focus:** Preview, Component Palette (Lucide Icons), Config Panel UI/UX

---

## Problem Statement

> Block editor hiện tại buộc người viết phải **nhấn "Xem trước" mới biết nội dung hiển thị như thế nào**, palette component dùng emoji/text icon **thiếu chuyên nghiệp**, và panel cấu hình block **chưa tối ưu về UI/UX** — các input không phù hợp với nội dung cần nhập, panel quá hẹp, form chưa nhóm logic rõ ràng.

---

## 1. Preview — Vấn đề cốt lõi & Giải pháp

### 1.1 Hiện trạng

Hiện tại preview đang hoạt động theo mô hình **toggle**:

- Nhấn nút "Xem trước" → render `BlockRenderer` trong layout admin
- Left panel, right panel, sidebar admin **vẫn hiển thị**
- Không có cảm giác bài viết thực tế

Cụ thể trong `BlockEditor.tsx`:

```tsx
// BlockEditor.tsx line 86-101
{isPreview ? (
  <div className={styles.previewPanel}><BlockPreview blocks={blocks} /></div>
) : (
  <div className={styles.editorPanel}>
    {titleInput}
    {blocks.length === 0 ? ( ... ) : ( <SortableBlockList ... /> )}
  </div>
)}
```

Preview chỉ là **render block list tại chỗ**, không tách khỏi admin layout.

### 1.2 Vấn đề chi tiết

| # | Vấn đề | Mức độ |
|---|--------|--------|
| 1 | Phải nhấn nút toggle mới xem được preview | **Cao** |
| 2 | Preview nằm trong layout admin — không phải context bài viết thật | **Cao** |
| 3 | Left panel / right panel vẫn chiếm diện tích khi preview | **Cao** |
| 4 | Không có "Focus Preview Mode" — toàn màn hình center content | Cao |
| 5 | Không có preview route thực tế (dùng page `/bai-viet/[slug]`) | Cao |
| 6 | Title bài viết và heading block lẫn lộn trong editor | Trung bình |
| 7 | Không có nút "Mở preview ở tab mới" | Trung bình |

### 1.3 Giải pháp đề xuất — Kiến trúc preview mới

#### Giải pháp A: Inline Live Preview (ưu tiên cao nhất)

**Không cần nhấn nút "Xem trước"** — nội dung được render trực tiếp ngay trong vùng soạn thảo, **WYSIWYG**.

Thay vì toggle giữa edit/preview, chuyển sang **single unified view**:

```
┌─────────────────────────────────────────────────┐
│ TopBar: undo/redo | blocks count | Save/Draft   │
│              | Publish | Preview in new tab      │
├──────────┬──────────────────────┬───────────────┤
│ Left     │ Content Area         │ Right Panel   │
│ Panel    │ (LIVE PREVIEW)       │ (Config form) │
│          │                      │               │
│ [Info]   │ ┌──────────────────┐ │ Selected: H2  │
│          │ │ Bài test preview │ │              │
│ [Comps]  │ │                  │ │ Level: [v H2] │
│          │ │ ## Heading hero   │ │ Weight: [Bold]│
│  Văn bản │ │ ← RENDER THẬT   │ │             │
│  ├─ H    │ │                  │ │ Text: [TA]... │
│  ├─ ¶    │ │ Đây là đoạn văn  │ │ ← TEXTAREA   │
│  ├─ "    │ │ mô tả dài...    │ │             │
│  ├─ ≡    │ │ ← RENDER THẬT   │ │ Align: [Left] │
│  └─ </>  │ │                  │ │             │
│          │ │ - Ý đầu tiên     │ │ Italic: [ ]   │
│  Media   │ │ ← RENDER THẬT   │ │ Under: [ ]    │
│  ...     │ └──────────────────┘ │              │
│          │                      │ [▲][▼][⧉][✕] │
└──────────┴──────────────────────┴───────────────┘
```

**Cốt lõi:** Mỗi block được render thật ngay trong danh sách, không cần toggle. Khi click vào block, nó được highlight và right panel mở form cấu hình.

Block hiện đã render thật trong list qua `BlockRenderer`:

```tsx
// BlockEditor.tsx line 161-163
<div className={styles.blockItemThumb}>
  <div className={styles.blockItemBadge}>{BLOCK_LABELS[block.type]}</div>
  <BlockRenderer blocks={[block]} />
</div>
```

Nhưng đang bị **scale(0.55)** trong CSS:

```scss
// workspace.module.scss line 427-432
.blockItemThumb > div:not(.blockItemBadge) {
  transform: scale(0.55);
  transform-origin: top left;
  width: calc(100% / 0.55);
  max-height: 200px;
}
```

**Cần sửa:**

1. **Bỏ `transform: scale(0.55)`** — render block ở kích thước thật (full-width trong vùng content)
2. **Bỏ toggle "Xem trước"** — không cần nữa vì mọi thứ đã hiển thị thật
3. **Thêm padding/spacing** cho vùng content để giống article page
4. **Thêm nút "Preview trong tab mới"** ở top bar — mở `/bai-viet/preview?draft=...` thực tế
5. **Mỗi block khi được chọn** → hiện border/highlight nhẹ, không cần chuyển chế độ

#### Giải pháp B: Focus Preview Mode (bổ trợ)

Người dùng có thể ẩn cả left panel và right panel để xem toàn màn hình:

```
┌─────────────────────────────────────────────────────────┐
│ TopBar: [← Thoát Focus]  |  Preview in new tab          │
├─────────────────────────────────────────────────────────┤
│                      Article Width (~720px)              │
│                                                         │
│              Bài test trải nghiệm preview                │
│                                                         │
│         ## Đây là heading hero mà tôi muốn thấy          │
│                                                         │
│         Đây là đoạn mô tả dài để kiểm tra preview...    │
│                                                         │
│         - Ý đầu tiên tôi muốn nhấn mạnh                  │
│                                                         │
│         ```js                                            │
│         const previewProblem = '...';                    │
│         ```                                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Trigger: **double-click vào vùng content** hoặc nút "Focus" trên top bar.

#### Giải pháp C: Real Preview Route (bổ trợ)

Thêm route preview thực tế:

- `app/(nguoi-dung)/bai-viet/preview/route.ts` hoặc `/xem-truoc/[...data]`
- Nhận block data qua query param hoặc session storage
- Render bằng **layout article thật** (cùng CSS, cùng component)
- Có thể mở trong tab mới từ editor

### 1.4 Implementation Plan — Preview

| Phase | Mô tả | File cần sửa | Priority |
|-------|-------|-------------|----------|
| **P0** | Bỏ scale(0.55), render block full-size trong list | `workspace.module.scss`, `BlockEditor.tsx` | 🔴 Critical |
| **P0** | Bỏ toggle preview, chuyển sang live render | `BlockEditor.tsx` | 🔴 Critical |
| **P1** | Thêm Focus Preview Mode (hide panels) | `BlockEditor.tsx` | 🟠 High |
| **P1** | Thêm nút "Preview in new tab" | `BlockEditor.tsx` | 🟠 High |
| **P2** | Tạo preview route thực tế | `apps/web/src/app/` | 🟡 Medium |
| **P2** | Thêm padding/spacing article chuẩn cho vùng content | `workspace.module.scss` | 🟡 Medium |

---

## 2. Component Palette — Lucide Icons

### 2.1 Hiện trạng

`LeftPanel.tsx` hiện dùng **emoji / text symbol** làm icon cho block:

```ts
// LeftPanel.tsx line 16-21
const BLOCK_ICONS: Record<string, string> = {
  heading: "H", paragraph: "¶", quote: '"', list: "≡", code: "</>", callout: "!",
  image: "🖼", video: "▶", gallery: "▦", carousel: "◀▶", beforeAfter: "⇔",
  divider: "—", spacer: "↕", columns: "▤", tabs: "📑", accordion: "☰",
  collapse: "▾", timeline: "◉", table: "⊞", cta: "→", pricingTable: "$", testimonial: "★",
};
```

Và được render trong:

```tsx
// LeftPanel.tsx line 70-73
<button ... onClick={() => onDrop(type as Block["type"])}>
  <span className={styles.blockTypeIcon}>{BLOCK_ICONS[type]}</span>
  <span className={styles.blockTypeLabel}>{BLOCK_LABELS[type]}</span>
</button>
```

**Vấn đề:**
- Emoji/text symbol nhìn không chuyên nghiệp
- Không đồng nhất về visual weight
- Không có hover state rõ ràng
- Không scale đồng bộ trên các OS/browser

### 2.2 Lucide đã được cài đặt

Project đã có `lucide-react` trong `apps/web/package.json` và đang dùng `Undo2`, `Redo2` trong `BlockEditor.tsx`.

```tsx
import { Redo2, Undo2 } from "lucide-react";
```

### 2.3 Mapping đề xuất — Lucide Icons cho từng block type

```ts
import {
  Heading,          // heading
  Pilcrow,          // paragraph
  Quote,            // quote
  List,             // list
  CodeXml,          // code
  AlertTriangle,    // callout
  Image,            // image
  Video,            // video
  LayoutGrid,       // gallery
  Images,           // carousel
  Columns2,         // beforeAfter (so sánh 2 ảnh)
  Minus,            // divider
  ArrowUpDown,      // spacer
  Columns3,         // columns
  FolderKanban,     // tabs
  ChevronsDownUp,   // accordion
  ChevronDown,      // collapse
  Clock,            // timeline
  Table,            // table
  ArrowRight,       // cta
  DollarSign,       // pricingTable
  Star,             // testimonial
} from "lucide-react";
```

```ts
const BLOCK_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  heading:        Heading,
  paragraph:      Pilcrow,
  quote:          Quote,
  list:           List,
  code:           CodeXml,
  callout:        AlertTriangle,
  image:          Image,
  video:          Video,
  gallery:        LayoutGrid,
  carousel:       Images,
  beforeAfter:    Columns2,
  divider:        Minus,
  spacer:         ArrowUpDown,
  columns:        Columns3,
  tabs:           FolderKanban,
  accordion:      ChevronsDownUp,
  collapse:       ChevronDown,
  timeline:       Clock,
  table:          Table,
  cta:            ArrowRight,
  pricingTable:   DollarSign,
  testimonial:    Star,
};
```

### 2.4 Implementation

`LeftPanel.tsx` chỉ cần thay đổi phần icon render:

```tsx
// Trước:
<span className={styles.blockTypeIcon}>{BLOCK_ICONS[type]}</span>

// Sau:
const IconComp = BLOCK_ICONS[type];
<span className={styles.blockTypeIcon}><IconComp size={16} /></span>
```

Đồng thời cập nhật CSS cho `.blockTypeIcon`:

```scss
.blockTypeIcon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
}
```

### 2.5 Implementation Plan — Icons

| Phase | Mô tả | File cần sửa | Priority |
|-------|-------|-------------|----------|
| **P0** | Thay emoji/text bằng Lucide icons trong LeftPanel | `LeftPanel.tsx` | 🔴 Critical |
| **P0** | Thay icon unicode trong RightPanel (▲▼⧉✕) bằng Lucide | `RightPanel.tsx` | 🔴 Critical |
| **P1** | Thay icons trong TopBar | `BlockEditor.tsx` | 🟠 High |
| **P1** | Thay icons trong nested editor menu | `nested-editors.tsx` | 🟠 High |
| **P2** | Đồng bộ icon style (size, color, strokeWidth) toàn editor | CSS | 🟡 Medium |

---

## 3. Config Panel (RightPanel) — Tối ưu UI/UX

### 3.1 Hiện trạng

Panel hiện tại có layout cơ bản:

```
┌───────────────────────┐
│ CẤU HÌNH BLOCK        │  ← header
├───────────────────────┤
│ HEADING  [▲][▼][⧉][✕] │  ← block info + actions
├───────────────────────┤
│ [H2  v] [Đậm  v]     │
│                       │
│ [Nhập tiêu đề...    ] │  ← <input> — VẤN ĐỀ: quá hẹp
│                       │
│ [Trái  v]            │
│                       │
│ [ ] In nghiêng        │
│ [ ] Gạch chân         │
│                       │
│ MÀU CHỮ               │
│ [Kế thừa  v]         │
└───────────────────────┘
       width: 300px
```

### 3.2 Vấn đề chi tiết

| # | Vấn đề | Ảnh hưởng |
|---|--------|-----------|
| 1 | `width: 300px` quá hẹp cho form dài | Người dùng khó thấy hết nội dung input |
| 2 | Dùng `<input>` cho text dài (heading, paragraph) | Không đọc được hết nội dung đã nhập |
| 3 | Không có visual preview nhỏ của block trong panel | Phải nhìn sang center để thấy kết quả |
| 4 | Form field chỉ xếp dọc, không grouping rõ | Khó scan khi có nhiều field |
| 5 | Block actions (▲▼⧉✕) chiếm space nhưng ít dùng | Lãng phí không gian đầu panel |
| 6 | Không có tooltip/label giải thích cho các options | Người mới khó hiểu |
| 7 | Color picker dùng select với CSS variable name | Không trực quan |
| 8 | Không có "Reset to default" cho từng field | Khó undo từng field riêng lẻ |

### 3.3 Vấn đề cụ thể: Input vs Textarea

**Heading editor hiện tại** — `block-editors.tsx`:

```tsx
// HeadingEditor — line 141-161
<TextInput value={d.text || ""} onChange={...} placeholder="Tiêu đề..." />
```

`TextInput` = `<input type="text">` — single line, **truncated** khi text dài.

Panel rộng 300px, padding 8px mỗi bên → input còn khoảng 250px.  
Với nội dung như `"Đây là heading hero mà tôi muốn nhìn thấy rõ như bài viết thật"`, người dùng chỉ thấy khoảng 30-35 ký tự đầu.

**Cần sửa thành:** `<textarea>` với `rows={2}` hoặc auto-resize.

Tương tự cho **Paragraph editor**, **Quote editor**, **Callout editor** — tất cả text field nên là textarea khi nội dung có thể dài.

### 3.4 Giải pháp tổng thể — Config Panel 2.0

#### 3.4.1 Tăng chiều rộng panel

```scss
// workspace.module.scss
.rightPanel {
  width: 360px;      // tăng từ 300px
  min-width: 360px;
  // ...
}
```

360px là cân bằng tốt giữa không gian form và không lấn center.

#### 3.4.2 Field type mapping mới

| Field | Hiện tại | Đề xuất |
|-------|---------|---------|
| Heading text | `<input>` | `<textarea rows={2} />` |
| Paragraph text | `<textarea rows={4}>` | ✅ OK, có thể tăng `rows={6}` |
| Quote text | `<textarea rows={3}>` | ✅ OK |
| Callout text | `<textarea rows={3}>` | ✅ OK |
| Code block | `<textarea rows={6}>` | ✅ OK |
| Alt text, Caption | `<input>` | ✅ OK (ngắn) |
| URL fields | `<input>` | ✅ OK |
| Author, Label | `<input>` | ✅ OK |
| Button text | `<input>` | ✅ OK |

#### 3.4.3 Grouping form fields

Mỗi editor form nên nhóm field theo chức năng:

```tsx
// HeadingEditor mới:
<div className={styles.editorBody}>
  <FieldGroup title="Nội dung">
    <TextArea value={d.text} onChange={...} placeholder="Tiêu đề..." rows={2} />
  </FieldGroup>
  
  <FieldGroup title="Định dạng">
    <div className={styles.inlineRow}>
      <Select value={String(d.level)} ... />  {/* H1-H6 */}
      <Select value={d.weight} ... />         {/* Font weight */}
    </div>
    <Select value={d.alignment} ... />
    <div className={styles.inlineRow}>
      <Toggle label="In nghiêng" ... />
      <Toggle label="Gạch chân" ... />
    </div>
  </FieldGroup>
  
  <FieldGroup title="Màu sắc">
    <Select value={d.color} ... />
  </FieldGroup>
</div>
```

#### 3.4.4 Thêm mini block preview trong panel

Ở đầu panel (dưới block info), hiển thị preview nhỏ của block đang được chọn:

```
┌──────────────────────────────┐
│ CẤU HÌNH BLOCK               │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ ## Preview heading...    │ │  ← mini preview (read-only)
│ └──────────────────────────┘ │
│ HEADING  [▲][▼][⧉][✕]      │
├──────────────────────────────┤
│ NỘI DUNG                     │
│ ┌──────────────────────────┐ │
│ │ Đây là heading hero...  │ │  ← textarea
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ ĐỊNH DẠNG                    │
│ [H2  v] [Đậm  v]           │
│ [Trái  v]                   │
│ [ ] In nghiêng  [ ] Gạch chân│
│                              │
│ MÀU SẮC                      │
│ [Kế thừa  v]                │
└──────────────────────────────┘
```

#### 3.4.5 Color field cải tiến

Hiện tại dùng `<Select>` với option text:

```tsx
<Select value={d.color || "inherit"} onChange={...} options={[
  { label: "Kế thừa", value: "inherit" },
  { label: "White", value: "--color-text" },
  { label: "Gray", value: "--color-text-muted" },
  { label: "Primary", value: "--color-primary" },
  { label: "Accent", value: "--color-accent" },
  { label: "Border", value: "--color-border" },
]} />
```

**Đề xuất:** Thêm visual swatch trước mỗi option:

```tsx
{ label: "White", value: "--color-text", swatch: "#ffffff" },
{ label: "Primary", value: "--color-primary", swatch: "var(--color-primary)" },
```

#### 3.4.6 Action buttons tối ưu

Hiện tại:

```
[▲] [▼] [⧉] [✕]    ← 4 nút nhỏ, icon unicode
```

Đề xuất dùng Lucide + tooltip:

```
[ChevronUp] [ChevronDown] [Copy] [Trash2]
```

Với tooltip rõ ràng khi hover:
- "Di chuyển lên"
- "Di chuyển xuống"
- "Nhân đôi"
- "Xóa"

### 3.5 Implementation Plan — Config Panel

| Phase | Mô tả | File cần sửa | Priority |
|-------|-------|-------------|----------|
| **P0** | Đổi `<input>` thành `<textarea>` cho heading text | `block-editors.tsx` | 🔴 Critical |
| **P0** | Tăng panel width 300→360px | `workspace.module.scss` | 🔴 Critical |
| **P0** | Thay action button icons (▲▼⧉✕) bằng Lucide | `RightPanel.tsx` | 🔴 Critical |
| **P1** | Group form fields với `<FieldGroup>` | `block-editors.tsx` | 🟠 High |
| **P1** | Thêm mini block preview trong panel | `RightPanel.tsx` | 🟠 High |
| **P1** | Color field có visual swatch | `block-editors.tsx` | 🟠 High |
| **P2** | Thêm tooltip cho mọi action/field | `block-editors.tsx` | 🟡 Medium |
| **P2** | Thêm "Reset to default" cho field | `block-editors.tsx` | 🟡 Medium |
| **P2** | Responsive: panel có thể resize kéo thả | `workspace.module.scss` | 🟢 Low |

---

## 4. Tổng quan Implementation Roadmap

### Phase 0 — Critical (tuần 1)

Mục tiêu: **Xóa bỏ toggle preview, render live, icon chuyên nghiệp, form input hợp lý.**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1 | Bỏ `scale(0.55)` trong blockItemThumb, render full-size | `workspace.module.scss`, `BlockEditor.tsx` | 30p |
| 2 | Bỏ toggle preview — chuyển sang always-live render | `BlockEditor.tsx` | 60p |
| 3 | Thay toàn bộ emoji/text icon bằng Lucide trong LeftPanel | `LeftPanel.tsx` | 30p |
| 4 | Đổi `<input>` → `<textarea>` cho heading, paragraph, quote, callout | `block-editors.tsx` | 30p |
| 5 | Tăng rightPanel width 300→360px | `workspace.module.scss` | 5p |
| 6 | Thay action buttons (▲▼⧉✕) bằng Lucide + tooltip | `RightPanel.tsx` | 30p |

**Total effort Phase 0:** ~3.5h

### Phase 1 — High (tuần 2)

Mục tiêu: **Focus Preview Mode, preview route thực, group form field, color swatch.**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 7 | Thêm Focus Preview Mode (hide panels) | `BlockEditor.tsx` | 60p |
| 8 | Thêm nút "Preview in new tab" | `BlockEditor.tsx`, new route | 90p |
| 9 | Group form fields với `<FieldGroup>` component | `block-editors.tsx` | 60p |
| 10 | Thêm mini block preview trong panel | `RightPanel.tsx` | 45p |
| 11 | Color field có visual swatch | `block-editors.tsx` | 30p |

**Total effort Phase 1:** ~5h

### Phase 2 — Medium (tuần 3)

Mục tiêu: **Tooltip, reset field, resize panel, polish.**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 12 | Tooltip cho mọi action/field | `block-editors.tsx` | 30p |
| 13 | "Reset to default" cho từng field | `block-editors.tsx` | 45p |
| 14 | Panel có thể resize kéo thả | `workspace.module.scss`, `BlockEditor.tsx` | 60p |
| 15 | Đồng bộ icon style toàn editor | CSS | 20p |

**Total effort Phase 2:** ~2.5h

---

## 5. File Impact Summary

| File | Phase 0 | Phase 1 | Phase 2 | Total changes |
|------|---------|---------|---------|---------------|
| `BlockEditor.tsx` | ✅ | ✅ | ✅ | Restructure |
| `LeftPanel.tsx` | ✅ | - | - | Icons |
| `RightPanel.tsx` | ✅ | ✅ | - | Icons + preview |
| `block-editors.tsx` | ✅ | ✅ | ✅ | Forms |
| `workspace.module.scss` | ✅ | - | ✅ | Layout |
| `block-editors.module.scss` | - | ✅ | ✅ | Styling |
| `nested-editors.tsx` | - | - | ✅ | Icons (cleanup) |
| New: preview route | - | ✅ | - | New file |
| New: `<FieldGroup>` | - | ✅ | - | New component |

---

## 6. Success Criteria

Sau khi hoàn thành Phase 0+1:

- [x] **Không cần nhấn nút** để xem nội dung — hiển thị trực tiếp trong editor
- [x] **Icon chuyên nghiệp** — toàn bộ Lucide, đồng nhất visual
- [x] **Form input phù hợp** — textarea cho nội dung dài, input cho field ngắn
- [x] **Panel đủ rộng** — 360px, đọc được nội dung trong form
- [x] **Focus Preview Mode** — xem toàn màn hình không panel
- [x] **Preview route** — mở tab mới xem bài viết trong layout thật
- [x] **Form grouping** — field được nhóm rõ ràng theo chức năng
- [x] **Color swatch** — thấy màu trước khi chọn

---

## 7. Risks & Open Questions

| Risk | Mitigation |
|------|-----------|
| Bỏ scale(0.55) có thể làm list quá dài | Giới hạn `max-height` và dùng `overflow: hidden` với gradient fade |
| Focus preview có thể mất context panel | Có nút "← Thoát Focus" rõ ràng, và escape key |
| Preview route cần truyền block data | Dùng `sessionStorage` hoặc URL hash (có giới hạn độ dài) |
| Nested editor icons cần sync | Dùng chung `BLOCK_ICONS` map từ một file constants |

**Open questions:**
1. Có nên giữ toggle "Xem trước" như một chế độ phụ (focus mode shortcut)?
2. Preview route nên dùng `/xem-truoc` hay `/bai-viet/preview`?
3. Có cần preview trên mobile viewport không?

---

## 8. Kết luận

Ba vấn đề người dùng gặp phải:

1. **Preview kém** → giải quyết bằng **live render (bỏ toggle) + Focus Mode + Preview Route**
2. **Icon thiếu chuyên nghiệp** → giải quyết bằng **Lucide icons toàn bộ**
3. **Config panel chưa tối ưu** → giải quyết bằng **textarea cho text dài, panel rộng hơn, grouping, color swatch**

Tổng effort ước tính **~11h** cho cả 3 phase.  
Có thể bắt đầu ngay với Phase 0 để thấy kết quả trong 1-3 ngày làm việc.
