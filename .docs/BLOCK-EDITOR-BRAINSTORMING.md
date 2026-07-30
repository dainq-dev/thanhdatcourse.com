
# Block Editor — Brainstorming & Audit

**Date:** 2026-07-24
**Topic:** Hoàn thiện Block Editor — Config Panel & Preview/Panel không hoạt động
**Status:** Draft — Chờ review trước khi implement

---

## Phase 1: Problem Statement

### Root Problem (3 Whys)

1. **Why?** Components trong editor không hoạt động khi kéo vào và nhập dữ liệu.
2. **Why?** Vì config panel (RightPanel) thiếu form cho nhiều block, và preview (center) chỉ là stub.
3. **Why?** Vì chưa hoạch toán đầy đủ tất cả config cho từng block type ngay từ đầu — nhiều block chỉ có schema Zod mà không có editor form, nhiều block có editor form nhưng config còn quá cơ bản so với nhu cầu thực tế.

### Problem Statement (1 câu)

> Hệ thống Block Editor hiện tại chỉ hoàn thiện được **50%**: 4/22 block type không có config panel, hầu hết config còn quá cơ bản (thiếu typography styling, image styling, carousel mode, etc.), preview center không render thực tế, và blocks thêm từ panel có data rỗng.

### Define Success

- **100% block types** có config panel đầy đủ
- **Mỗi block type** có config chi tiết như bảng bên dưới
- **Preview center** hiển thị đúng nội dung đã nhập (real render, không phải stub)
- **Typing trong inputs** hoạt động bình thường
- **Blocks thêm từ LeftPanel** có default data chuẩn (không phải `{}`)

---

## Phase 2: Hiện trạng (Current State)

### File Inventory

| Layer | Files | Location |
|-------|-------|----------|
| Zod Schemas | `blocks.ts` (480 dòng) | `packages/types/src/schemas/` |
| Block Editor Core | `BlockEditor.tsx`, `editorState.ts`, `useBlockEditor.ts` | `apps/web/src/components/admin/block-editor/` |
| Panels | `LeftPanel.tsx`, `RightPanel.tsx`, `BlockPreview.tsx` | `apps/web/src/components/admin/block-editor/` |
| Config Forms | `block-editors.tsx` (1067 dòng) | `apps/web/src/components/admin/block-editor/` |
| Block Renderers | 22 files trong `typography/`, `media/`, `layout/`, `interactive/`, `conversion/` | `apps/web/src/components/blocks/` |
| Create Page | `tao-moi/page.tsx` (154 dòng) | `apps/web/src/app/quan-tri-vien/bai-viet/tao-moi/` |
| Edit Page | `[slug]/page.tsx` (224 dòng) | `apps/web/src/app/quan-tri-vien/bai-viet/[slug]/` |
| Stub Pages | `tao-bai-viet/`, `chinh-sua-bai-viet/` | `apps/web/src/app/quan-tri-vien/bai-viet/` |

### Block Types Status Summary

| # | Block Type | Schema | Editor Form | Renderer | Preview Center |
|---|-----------|--------|-------------|----------|---------------|
| 1 | heading | ✓ | ✓ (cơ bản) | ✓ | ✓ |
| 2 | paragraph | ✓ | ✓ (cơ bản) | ✓ | ✓ |
| 3 | quote | ✓ | ✓ | ✓ | ✓ |
| 4 | list | ✓ | ✓ | ✓ | ✓ |
| 5 | code | ✓ | ✓ | ✓ | ✓ |
| 6 | callout | ✓ | ✓ | ✓ | ✓ |
| 7 | image | ✓ | ✓ (cơ bản) | ✓ | ✓ |
| 8 | video | ✓ | ✓ (cơ bản) | ✓ | ✓ |
| 9 | gallery | ✓ | ✓ (cơ bản) | ✗ STUB | ✗ |
| 10 | carousel | ✓ | ✓ (cơ bản) | ✗ STUB | ✗ |
| 11 | beforeAfter | ✓ | ✓ | ✗ STUB | ✗ |
| 12 | divider | ✓ | ✓ | ✓ | ✓ |
| 13 | spacer | ✓ | ✓ | ✓ | ✓ |
| 14 | **columns** | ✓ | ✗ NO EDITOR | ✗ STUB | ✗ |
| 15 | **tabs** | ✓ | ✗ NO EDITOR | ✗ STUB | ✗ |
| 16 | **accordion** | ✓ | ✗ NO EDITOR | ✗ STUB | ✗ |
| 17 | **collapse** | ✓ | ✗ NO EDITOR | ✗ STUB | ✗ |
| 18 | timeline | ✓ | ✓ | ✗ STUB | ✗ |
| 19 | table | ✓ | ✓ | ✗ STUB | ✗ |
| 20 | cta | ✓ | ✓ | ✓ | ✓ |
| 21 | pricingTable | ✓ | ✓ | ✗ STUB | ✗ |
| 22 | testimonial | ✓ | ✓ | ✗ STUB | ✗ |

**Tổng kết:**
- 4 block **không có editor form** (columns, tabs, accordion, collapse)
- 14/22 renderer là **STUB** (không render thực tế)
- 4 block có editor form nhưng **config quá cơ bản** (heading, paragraph, image, video, gallery, carousel)

---

## Phase 3: Brainstorming — Config Chi Tiết Cho Từng Block Type

### Notes
> - ✅ = Đã implement, đầy đủ
> - ⚠️ = Có nhưng thiếu config
> - ❌ = Chưa có

---

### NHÓM TYPOGRAPHY

#### 1. Heading (Tiêu đề) ⚠️

| Config | Schema | Editor | Ghi chú |
|--------|--------|--------|---------|
| Nội dung text | ✅ text | ✅ TextInput | |
| Cấp độ (H1-H6) | ✅ level (1-6) | ✅ Select | |
| **Căn lề** | ✅ alignment (left/center/right) | ✅ Select | **THIẾU: justify (căn đều)** |
| **Font weight** | ❌ | ❌ | Cần thêm: regular, medium, semibold, bold |
| **Italic** | ❌ | ❌ | Boolean toggle |
| **Underline** | ❌ | ❌ | Boolean toggle |
| **Màu chữ** | ❌ | ❌ | Color picker (theo theme) |

**Schema cần thêm:** `weight`, `italic`, `underline`

---

#### 2. Paragraph (Đoạn văn) ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Nội dung | ✅ textarea | ✅ |
| Căn lề | ✅ left/center/right | Thêm justify |
| Drop cap | ✅ toggle | ✅ |
| **Font size** | ❌ | small, medium, large |
| **Font weight** | ❌ | regular, semibold, bold (cho highlight đoạn) |
| **Màu chữ** | ❌ | Color picker |
| **Line height** | ❌ | tight, normal, relaxed |

**Schema cần thêm:** `fontSize`, `lineHeight`

---

#### 3. Quote (Trích dẫn) ✅ Gần đủ

| Config | Status |
|--------|--------|
| Nội dung | ✅ |
| Tác giả | ✅ |
| Style (default/bordered/pull) | ✅ |
| **Icon** | ❌ Cần thêm (icon tùy chọn đầu quote) |

---

#### 4. List (Danh sách) ✅ Đủ

| Config | Status |
|--------|--------|
| Style (ul/ol/checklist) | ✅ |
| Items (dynamic add/remove) | ✅ |

---

#### 5. Code ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Code text | ✅ textarea | ✅ |
| Ngôn ngữ | ✅ text input | ⚠️ Nên đổi thành Select (các ngôn ngữ phổ biến) |
| Show line numbers | ✅ toggle | ✅ |
| **Theme** | ❌ | light / dark |
| **Copy button** | ❌ | Toggle show/hide nút copy |

---

#### 6. Callout ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Nội dung | ✅ | ✅ |
| Variant (info/warning/tip/danger) | ✅ | ✅ |
| Icon | ✅ text input | ⚠️ Đổi thành icon picker |
| **Title** | ❌ | Optional title cho callout |

---

### NHÓM MEDIA

#### 7. Image (Ảnh) ⚠️

| Config | Hiện tại | Cần bổ sung |
|--------|----------|-------------|
| Chọn ảnh (MediaPicker) | ✅ | ✅ |
| Alt text | ✅ | ✅ |
| Caption | ✅ | ✅ |
| Width (full/wide/contained/inline) | ✅ | ✅ |
| **Bo góc (rounded)** | ✅ boolean toggle | ⚠️ **Đổi thành Select**: Không bo / Nhỏ (4px) / Vừa (8px) / Lớn (16px) / Tròn (full) |
| **Border** | ✅ boolean toggle | ⚠️ **Đổi thành Select**: Không / Mỏng (1px) / Vừa (2px) / Dày (4px) |
| **Shadow** | ❌ | Select: Không / Nhỏ (sm) / Vừa (md) / Lớn (lg) / XL |
| **Hover zoom** | ❌ | Boolean toggle: phóng to khi hover |
| **Link** | ❌ | URL tùy chọn khi click vào ảnh |
| **Object fit** | ❌ | cover / contain / fill (cho ảnh trong container cố định) |

**Schema cần cập nhật:** `rounded`, `border` từ boolean → enum; thêm `shadow`, `hoverZoom`, `link`, `objectFit`

---

#### 8. Video ⚠️

| Config | Hiện tại | Cần bổ sung |
|--------|----------|-------------|
| Chọn media (MediaPicker) | ✅ | ✅ |
| Caption | ✅ | ✅ |
| Aspect ratio (16:9/4:3/9:16/1:1) | ✅ | ✅ |
| **Bo góc** | ❌ | Select: Không / Nhỏ / Vừa / Lớn / Tròn |
| **Shadow** | ❌ | Select: Không / Nhỏ / Vừa / Lớn |
| **Autoplay** | ❌ | Boolean toggle |
| **Loop** | ❌ | Boolean toggle |
| **Show controls** | ❌ | Boolean toggle (mặc định true) |
| **Thumbnail** | ❌ | MediaPicker cho ảnh cover trước khi play |

---

#### 9. Gallery (Bộ sưu tập) ⚠️

| Config | Hiện tại | Cần bổ sung |
|--------|----------|-------------|
| Chọn nhiều ảnh | ✅ | ✅ |
| Số cột (2/3/4) | ✅ | ✅ |
| Khoảng cách (sm/md/lg) | ✅ | ✅ |
| Layout (grid/masonry) | ✅ | ✅ |
| **Bo góc từng ảnh** | ❌ | Select |
| **Shadow từng ảnh** | ❌ | Select |
| **Hover zoom** | ❌ | Boolean |
| **Lightbox** | ❌ | Boolean: click mở lightbox xem full |
| **Spacing giữa các ảnh** | ⚠️ | gap hiện có sm/md/lg → OK |

---

#### 10. Carousel ⚠️

| Config | Hiện tại | Cần bổ sung |
|--------|----------|-------------|
| Chọn nhiều ảnh (slides) | ✅ | ✅ |
| Autoplay | ✅ | ✅ |
| Interval (ms) | ✅ | ✅ |
| Show dots | ✅ | ✅ |
| Show arrows (prev/next) | ✅ | ✅ |
| **Transition effect** | ❌ | slide / fade / cube |
| **Bo góc** | ❌ | Select |
| **Shadow** | ❌ | Select |
| **Tỉ lệ khung hình** | ❌ | 16:9 / 4:3 / 1:1 / auto |
| **Loop** | ❌ | Boolean |
| **Pause on hover** | ❌ | Boolean |
| **Slide per view** | ❌ | 1 / 2 / 3 (hiển thị nhiều slide cùng lúc) |

---

#### 11. Before/After ⚠️

| Config | Hiện tại | Cần bổ sung |
|--------|----------|-------------|
| Ảnh Before | ✅ | ✅ |
| Ảnh After | ✅ | ✅ |
| Label Before/After | ✅ | ✅ |
| Caption | ✅ | ✅ |
| **Orientation** | ❌ | horizontal / vertical |
| **Bo góc** | ❌ | Select |
| **Shadow** | ❌ | Select |

---

### NHÓM LAYOUT

#### 12. Divider ✅ Đủ

| Config | Status |
|--------|--------|
| Style (solid/dashed/dotted/gradient) | ✅ |

---

#### 13. Spacer ✅ Đủ

| Config | Status |
|--------|--------|
| Height (8-200px) | ✅ |

---

#### 14. Columns ❌ NO EDITOR

| Config | Cần implement |
|--------|--------------|
| Số cột (2/3/4) | ✅ Schema có |
| Khoảng cách (sm/md/lg) | ✅ Schema có |
| **Nội dung từng cột** | Blocks con (recursive) |
| **Phân bố tỉ lệ** | auto / 50-50 / 33-33-33 / 25-75 / 75-25 |

**Editor cần:** Select số cột + gap, rồi cho phép kéo block con vào từng cột (nested editor mini)

---

#### 15. Tabs ❌ NO EDITOR

| Config | Cần implement |
|--------|--------------|
| Danh sách tab (label + content blocks) | ✅ Schema có |
| **Tab style** | top tabs / pills / vertical tabs |
| **Default active tab** | Index |

---

### NHÓM INTERACTIVE

#### 16. Accordion ❌ NO EDITOR

| Config | Cần implement |
|--------|--------------|
| Danh sách items (title + content blocks) | ✅ Schema có |
| Allow multiple open | ✅ Schema có |
| **Icon vị trí** | left / right |
| **Default open index** | Number |
| **Border style** | bordered / borderless |

---

#### 17. Collapse ❌ NO EDITOR

| Config | Cần implement |
|--------|--------------|
| Title | ✅ Schema có |
| Content blocks (recursive) | ✅ Schema có |
| Default open | ✅ Schema có |
| **Icon vị trí** | left / right |

---

#### 18. Timeline ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Events (date, title, desc) | ✅ | ✅ |
| **Layout** | ❌ | vertical / horizontal / alternating |
| **Icon per event** | ❌ | Icon picker |
| **Line color** | ❌ | Color picker |

---

#### 19. Table ✅ Đủ

| Config | Status |
|--------|--------|
| Headers, rows, cells | ✅ |
| Striped, compact | ✅ |

---

### NHÓM CONVERSION

#### 20. CTA ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Heading, text, button | ✅ | ✅ |
| Style (primary/secondary/minimal) | ✅ | ✅ |
| Background image | ✅ | ✅ |
| **Button style** | ❌ | solid / outline / ghost |
| **Button size** | ❌ | sm / md / lg |
| **Button icon** | ❌ | Icon picker (arrow, etc.) |

---

#### 21. Pricing Table ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Plans (name, price, features, CTA) | ✅ | ✅ |
| **Currency** | ❌ | Text input (mặc định "VNĐ") |
| **Billing period toggle** | ❌ | monthly / yearly |
| **Layout** | ❌ | horizontal / vertical |
| **Color scheme** | ❌ | Theo theme |

---

#### 22. Testimonial ⚠️

| Config | Hiện tại | Cần |
|--------|----------|-----|
| Style (card/inline/large) | ✅ | ✅ |
| testimonialId | ✅ text input | ⚠️ Nên đổi thành Select từ danh sách testimonials |
| **Show avatar** | ❌ | Boolean |
| **Show rating stars** | ❌ | Boolean |
| **Avatar size** | ❌ | sm / md / lg |
| **Background** | ❌ | none / light / dark / gradient |

---

## Phase 4: Các lỗi kỹ thuật cần fix

### Bug 1: Blocks thêm từ LeftPanel có `data: {}`
- **File:** `apps/web/src/app/quan-tri-vien/bai-viet/tao-moi/page.tsx` dòng 40-43
- **Nguyên nhân:** Page dùng `addBlock` riêng push `{ id, type, data: {} }`, bỏ qua `getDefaultData()` trong `editorState.ts`
- **Fix:** Dùng `editor.addBlock(type)` thay vì tự push

### Bug 2: Click center panel deselects block
- **File:** `apps/web/src/components/admin/block-editor/BlockEditor.tsx` dòng 81
- **Hiện tượng:** `onClick={() => setSelectedId(null)}` trên center div
- **Đánh giá:** Design intent là deselect khi click ngoài block. Có thể gây khó chịu nếu vô tình click. Nên cân nhắc giữ lại nhưng đảm bảo RightPanel inputs không bị ảnh hưởng.

### Bug 3: Dead code `useBlockEditor.ts`
- **File:** `apps/web/src/components/admin/block-editor/useBlockEditor.ts` (196 dòng)
- **Trạng thái:** Không được import ở bất kỳ đâu
- **Action:** Xóa hoặc merge logic vào `editorState.ts`

### Bug 4: 14 renderer là STUB
- **Các file:** GalleryBlock, CarouselBlock, BeforeAfterBlock, ColumnsBlock, AccordionBlock, CollapseBlock, TabsBlock, TimelineBlock, TableBlock, PricingBlock, TestimonialBlock
- **Action:** Implement đầy đủ renderer

### Bug 5: Edit page `[slug]` không dùng full editor layout
- **File:** `apps/web/src/app/quan-tri-vien/bai-viet/[slug]/page.tsx`
- **Hiện tượng:** Dùng BlockEditor inline, không có LeftPanel + RightPanel
- **Action:** Refactor dùng chung layout với `tao-moi`

### Bug 6: Stub pages thừa
- **File:** `tao-bai-viet/page.tsx`, `chinh-sua-bai-viet/page.tsx`
- **Action:** Xóa hoặc redirect về routes chính

---

## Phase 5: Action Plan (Đề xuất thứ tự implement)

### Milestone 1: Fix lỗi nền tảng (Critical)
1. Fix Bug 1: Blocks từ LeftPanel có default data chuẩn
2. Verify typing trong inputs hoạt động
3. Xóa dead code `useBlockEditor.ts` (hoặc merge)
4. Xóa stub pages thừa

### Milestone 2: Schema update (Types package)
5. Cập nhật `blocks.ts` — thêm các field mới vào từng block schema:
   - heading: weight, italic, underline
   - paragraph: fontSize, lineHeight
   - image: rounded (enum), border (enum), shadow, hoverZoom, link, objectFit
   - video: rounded, shadow, autoplay, loop, showControls, thumbnail
   - gallery: rounded, shadow, hoverZoom, lightbox
   - carousel: transition, rounded, shadow, aspectRatio, loop, pauseOnHover, slidesPerView
   - beforeAfter: orientation, rounded, shadow
   - columns: columnRatios
   - tabs: tabStyle, defaultTab
   - accordion: iconPosition, defaultOpenIndex, borderStyle
   - collapse: iconPosition
   - timeline: layout, iconPerEvent, lineColor
   - cta: buttonStyle, buttonSize, buttonIcon
   - pricingTable: currency, billingPeriod, layout
   - testimonial: showAvatar, showRating, avatarSize, background
6. Cập nhật `getDefaultData()` với tất cả default values mới

### Milestone 3: Config Panel (RightPanel + block-editors.tsx)
7. Viết editor cho 4 block đang thiếu: ColumnsEditor, TabsEditor, AccordionEditor, CollapseEditor
8. Cập nhật tất cả editor hiện có với config mới từ schema
9. Implement MediaPicker thực sự (fetch từ media API thay vì text input)
10. Implement IconPicker component nhỏ
11. Implement ColorPicker (dùng CSS variables của theme)

### Milestone 4: Renderers (Preview center)
12. Implement đầy đủ 14 renderer đang là STUB
13. Đảm bảo renderer dùng config mới

### Milestone 5: Unify edit/create pages
14. Refactor `[slug]/page.tsx` dùng chung full editor layout
15. Thêm nút "Preview" thực sự (render như user thấy, không phải admin preview)

---

## Phase 6: Open Questions

1. Color picker dùng thư viện nào? (react-colorful? native input[type=color]? hay custom CSS variable dropdown?)
2. Icon picker: dùng icon set nào? (Lucide? Heroicons? Custom SVG?)
3. MediaPicker: đã có MediaManager component, cần tích hợp gọi API `/api/media` từ media service chưa?
4. Nested blocks (accordion > columns > paragraph): config panel xử lý nested editor thế nào? (Expand in place? Modal?)
5. Có cần Undo/Redo cho từng block riêng (ngoài undo/redo toàn cục đã có) không?

---

## Phase 7: Tổng quan Config Mở Rộng (Quick Reference)

### Typography Blocks

| Config | heading | paragraph | quote | code | callout |
|--------|:-------:|:---------:|:-----:|:----:|:-------:|
| Font weight | **NEW** | **NEW** | - | - | - |
| Italic | **NEW** | - | - | - | - |
| Underline | **NEW** | - | - | - | - |
| Font size | - | **NEW** | - | - | - |
| Line height | - | **NEW** | - | - | - |
| Color | **NEW** | **NEW** | - | - | - |
| Justify align | **NEW** | **NEW** | - | - | - |
| Code theme | - | - | - | **NEW** | - |
| Copy button | - | - | - | **NEW** | - |
| Title | - | - | - | - | **NEW** |
| Icon picker | - | - | **NEW** | - | ⚠️ upgrade |

### Media Blocks

| Config | image | video | gallery | carousel | beforeAfter |
|--------|:-----:|:-----:|:-------:|:--------:|:-----------:|
| Bo góc (select) | ⚠️ upgrade | **NEW** | **NEW** | **NEW** | **NEW** |
| Border (select) | ⚠️ upgrade | - | - | - | - |
| Shadow (select) | **NEW** | **NEW** | **NEW** | **NEW** | **NEW** |
| Hover zoom | **NEW** | - | **NEW** | - | - |
| Link | **NEW** | - | - | - | - |
| Object fit | **NEW** | - | - | - | - |
| Autoplay/Loop | - | **NEW** | - | - | - |
| Show controls | - | **NEW** | - | - | - |
| Thumbnail | - | **NEW** | - | - | - |
| Transition effect | - | - | - | **NEW** | - |
| Aspect ratio | - | - | - | **NEW** | - |
| Pause on hover | - | - | - | **NEW** | - |
| Slides per view | - | - | - | **NEW** | - |
| Lightbox | - | - | **NEW** | - | - |
| Orientation | - | - | - | - | **NEW** |

### Layout Blocks

| Config | columns | tabs |
|--------|:-------:|:----:|
| Column ratios | **NEW** | - |
| Tab style | - | **NEW** |
| Default active tab | - | **NEW** |

### Interactive Blocks

| Config | accordion | collapse | timeline |
|--------|:---------:|:--------:|:--------:|
| Icon position | **NEW** | **NEW** | - |
| Default open index | **NEW** | - | - |
| Border style | **NEW** | - | - |
| Layout (vertical/horizontal) | - | - | **NEW** |
| Icon per event | - | - | **NEW** |
| Line color | - | - | **NEW** |

### Conversion Blocks

| Config | cta | pricingTable | testimonial |
|--------|:---:|:------------:|:-----------:|
| Button style | **NEW** | - | - |
| Button size | **NEW** | - | - |
| Button icon | **NEW** | - | - |
| Currency | - | **NEW** | - |
| Billing period | - | **NEW** | - |
| Layout | - | **NEW** | - |
| Show avatar | - | - | **NEW** |
| Show rating | - | - | **NEW** |
| Avatar size | - | - | **NEW** |
| Background | - | - | **NEW** |

---

**Legend:**
- ✅ Đã có, đầy đủ
- ⚠️ Có nhưng cần upgrade
- ❌ / **NEW** Chưa có, cần implement mới
- `-` Không áp dụng cho block này
