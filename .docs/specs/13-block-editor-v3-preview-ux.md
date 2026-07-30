# Spec 13: Block Editor V3 — Live Preview, Lucide Icons & Config Panel UX

**Status:** Draft — Reviewed 2026-07-31
**Created:** 2026-07-31
**Last review:** 2026-07-31 (bdd-review, 12 findings resolved)
**Ref:** `block-editor-restructure-plan.md` (proposal), `02-block-content-editor.md` (spec gốc), `12-block-editor-v2-config-renderers.md` (v2)

---

## Feature Description

Nâng cấp trải nghiệm Block Editor từ "kỹ thuật hoạt động được" lên **"chuyên nghiệp cho người soạn nội dung"** qua 3 trục chính:

1. **Live Preview:** Thay thế cơ chế toggle "Xem trước" bằng live render trực tiếp trong vùng soạn thảo (WYSIWYG). Bổ sung Focus Preview Mode (overlay toàn màn hình) và Preview Route thực tế.
2. **Lucide Component Palette:** Thay thế toàn bộ emoji/text icon trong LeftPanel, RightPanel, TopBar bằng Lucide React icons đồng nhất và chuyên nghiệp.
3. **Config Panel UX:** Tối ưu UI/UX right panel — textarea cho nội dung dài, grouping form field, color swatch trực quan, panel rộng hơn, tooltip cho mọi action.
4. **Media Path Fix:** Sửa ImageBlock render path đang dùng route không tồn tại `/api/media/:id/file` sang route chính xác của media service.

---

## User Stories

---

### US-13.1: Live Preview — Nội dung hiển thị trực tiếp không cần toggle

> **As an** Administrator
> **I want to** see my content rendered in real-time directly in the editor
> **So that** I know exactly what the article looks like without pressing any button

**Acceptance Criteria:**
- Tất cả block trong danh sách được render với `BlockRenderer` ở kích thước thật (full-width, không scale)
- CSS `transform: scale(0.55)` trong `.blockItemThumb` bị xóa
- Badge block type (nhãn "TIÊU ĐỀ", "ĐOẠN VĂN"...) được di chuyển sang strip bên trái cạnh drag handle, không đè lên nội dung
- Vùng center content có `max-width: 720px` với padding đủ để mô phỏng article page
- Nút "Xem trước" toggle hiện tại bị xóa — không còn chế độ toggle edit/preview
- Khi chưa chọn block nào, tất cả block hiển thị bình thường như article
- Khi chọn một block, block đó được highlight (border-left màu xanh) nhưng nội dung vẫn render bình thường không thay đổi
- Khi gõ text trong config panel bên phải, nội dung block trong center cập nhật ngay, không delay
- Khi xóa hết tất cả block, drop zone "Kéo block từ bên trái vào đây" hiển thị ở giữa vùng center
- Nested blocks (trong columns/tabs/accordion/collapse) render đúng kích thước trong block cha, không bị scale

---

### US-13.2: Focus Preview Mode — Overlay toàn màn hình

**Architecture Decision:** Admin sidebar nằm trong `quan-tri-vien/layout.tsx` (parent layout của page), do đó `BlockEditor` không thể ẩn sidebar từ bên trong. Giải pháp: **Focus Mode state được lift lên page level** (`tao-moi/page.tsx`, `[slug]/page.tsx`). Khi Focus Mode active, page render một full-screen overlay chứa nội dung article, che toàn bộ layout admin.

> **As an** Administrator
> **I want to** view my article in a full-screen overlay without any panels
> **So that** I can evaluate the reading experience as a real visitor would

**Acceptance Criteria:**
- Page-level state `isFocusMode` được quản lý bởi page component (`tao-moi/page.tsx` hoặc `[slug]/page.tsx`)
- Nút "Focus" trên TopBar gọi callback `onFocus()` do page truyền vào `BlockEditor`, page set `isFocusMode: true`
- Double-click vùng center cũng kích hoạt Focus Mode
- Khi `isFocusMode: true`, page render `<FocusOverlay>` — một full-screen `<div>` với `position: fixed; z-index: 1000; background: #0B0F19` che toàn bộ admin layout (sidebar, header, panels)
- FocusOverlay hiển thị: TopBar với "← Thoát Focus" + "Lưu", nội dung article canh giữa `max-width: 720px`
- Nhấn `Escape` → `isFocusMode: false`, overlay biến mất
- Nhấn "← Thoát Focus" → `isFocusMode: false`
- Save trong Focus Mode vẫn hoạt động bình thường, Focus Mode vẫn giữ

---

### US-13.3: Preview Route — Xem bài viết trong layout public thực tế

**Architecture Decision:** Route `/xem-truoc` được đặt trong `(nguoi-dung)/xem-truoc/` để kế thừa `NguoiDungLayout` (SiteHeader + SiteFooter), giúp preview chính xác layout public.

> **As an** Administrator
> **I want to** preview my draft article in the real public page layout
> **So that** I can verify spacing, typography, and overall appearance

**Acceptance Criteria:**
- Nút "Xem trước" (mới) trên TopBar mở tab mới tới route preview
- Preview route nằm ở `apps/web/src/app/(nguoi-dung)/xem-truoc/page.tsx`, kế thừa layout có SiteHeader + SiteFooter
- Block data được truyền qua `sessionStorage` (key: `preview-blocks`)
- Nếu không có data trong sessionStorage → hiển thị "Không có nội dung để xem trước"
- Nếu `sessionStorage.setItem` throw `QuotaExceededError` (nội dung quá lớn >5MB) → hiển thị thông báo "Nội dung quá lớn, không thể xem trước. Vui lòng lưu nháp và xem từ trang bài viết."
- Preview page không yêu cầu auth — dùng để xem nhanh
- Preview page không index (meta robots: noindex)

---

### US-13.4: Lucide Component Palette — Icon chuyên nghiệp đồng nhất

> **As an** Administrator
> **I want to** see professional, consistent icons in the component palette
> **So that** the editor looks polished and blocks are easy to identify

**Acceptance Criteria:**
- Tất cả icon trong LeftPanel (22 block types) dùng Lucide React components thay cho emoji/text symbol
- Mapping block type → Lucide icon:
  - `heading` → `Heading`
  - `paragraph` → `Pilcrow`
  - `quote` → `Quote`
  - `list` → `List`
  - `code` → `CodeXml`
  - `callout` → `AlertTriangle`
  - `image` → `Image`
  - `video` → `Video`
  - `gallery` → `LayoutGrid`
  - `carousel` → `Images`
  - `beforeAfter` → `Columns2`
  - `divider` → `Minus`
  - `spacer` → `ArrowUpDown`
  - `columns` → `Columns3`
  - `tabs` → `FolderKanban`
  - `accordion` → `ChevronsDownUp`
  - `collapse` → `ChevronDown`
  - `timeline` → `Clock`
  - `table` → `Table`
  - `cta` → `ArrowRight`
  - `pricingTable` → `DollarSign`
  - `testimonial` → `Star`
- Icon size: `size={16}`, strokeWidth mặc định, màu `#64748b`
- Icon được căn giữa trong vùng 20x20px
- Icon giữ nguyên màu sắc đồng nhất giữa các block, không thay đổi khi hover (chỉ background thay đổi)

---

### US-13.5: Lucide Action Buttons — Icon chuyên nghiệp cho thao tác

> **As an** Administrator
> **I want to** see clear, professional icons for block actions
> **So that** I can quickly identify move, duplicate, and delete actions

**Acceptance Criteria:**
- RightPanel action buttons thay thế unicode (▲▼⧉✕) bằng Lucide:
  - Move up: `ChevronUp`
  - Move down: `ChevronDown`
  - Duplicate: `Copy`
  - Delete: `Trash2`
- Mỗi nút có tooltip khi hover (vd: "Di chuyển lên")
- TopBar undo/redo đã dùng Lucide (`Undo2`, `Redo2`) — không đổi
- Delete button có màu đỏ khi hover (`#c53030`)
- Tất cả action icon có `size={17}`
- Drag handle dùng `GripVertical` icon từ Lucide thay vì text "⋮⋮"

---

### US-13.6: Config Panel — Input/Textarea phù hợp với nội dung

> **As an** Administrator
> **I want to** edit long text content comfortably in the config panel
> **So that** I can see and edit my full content without scrolling horizontally

**Acceptance Criteria:**
- Heading text field: chuyển từ `<input>` sang `<textarea>` với `rows={2}`, auto-resize khi nội dung dài
- Paragraph text field: `<textarea>` `rows={4}` → tăng lên `rows={6}`
- Quote text field: `<textarea>` `rows={3}` — giữ nguyên
- Callout text field: `<textarea>` `rows={3}` — giữ nguyên
- Code text field: `<textarea>` `rows={6}` — giữ nguyên
- Các field ngắn (alt, caption, author, URL, button text): giữ nguyên `<input>`
- Right panel width tăng từ 300px lên 360px để textarea có đủ không gian hiển thị

---

### US-13.7: Config Panel — Grouping & Visual Hierarchy

> **As an** Administrator
> **I want to** see form fields organized in logical groups
> **So that** I can quickly find the right setting without confusion

**Acceptance Criteria:**
- Mỗi editor form có `<FieldGroup>` component với tiêu đề nhóm (vd: "Nội dung", "Định dạng", "Màu sắc")
- Các nhóm được phân cách bằng divider mỏng hoặc spacing rõ ràng
- HeadingEditor grouping:
  - **Nội dung:** text textarea
  - **Định dạng:** level + weight, alignment, italic + underline
  - **Màu sắc:** color select
- ParagraphEditor grouping:
  - **Nội dung:** text textarea
  - **Định dạng:** alignment, fontSize + lineHeight, weight + dropCap
  - **Màu sắc:** color select
- ImageEditor grouping:
  - **Ảnh:** mediaId picker
  - **Hiển thị:** width, objectFit
  - **Styling:** rounded, border, shadow, hoverZoom
  - **Metadata:** alt, caption, link
- Các block khác tuân theo pattern nhóm tương tự: Nội dung → Định dạng → Styling → Metadata

---

### US-13.8: Config Panel — Color Swatch Trực Quan

> **As an** Administrator
> **I want to** see a visual preview of each color option
> **So that** I can choose colors without guessing what CSS variable names look like

**Acceptance Criteria:**
- Mỗi option trong color Select có visual swatch (ô vuông màu) bên cạnh label text
- Swatch sử dụng hardcoded hex (fallback) vì CSS variables không thể resolve chính xác bằng inline style
- Swatch mapping:
  - `inherit`: gradient chéo xám (biểu thị kế thừa)
  - `--color-text`: `#f1f5f9` (fallback cho theme tối — text sáng)
  - `--color-text-muted`: `#94a3b8`
  - `--color-primary`: `#0ea5e9`
  - `--color-accent`: `#f59e0b`
  - `--color-border`: `#334155`
- Swatch kích thước 14x14px, border-radius 3px, border 1px solid rgba(0,0,0,0.1)
- Swatch nằm bên trái label text trong dropdown option
- Khi chọn một màu, swatch hiển thị ở trạng thái hiện tại của field (không phải trong dropdown) để người dùng thấy nhanh màu đang chọn

---

### US-13.9: Config Panel — Mini Block Preview

> **As an** Administrator
> **I want to** see a small live preview of the selected block in the config panel
> **So that** I can verify changes immediately without looking at the center area

**Acceptance Criteria:**
- Khi chọn một block, phần đầu của right panel (trên block info) hiển thị mini preview
- Mini preview là phiên bản thu nhỏ của block được render bằng `BlockRenderer`
- Mini preview có `max-height: 120px`, `overflow: hidden`, dùng `transform: scale(0.6); transform-origin: top left` để thu nhỏ
- Khi thay đổi config ở dưới, mini preview cập nhật ngay lập tức
- Block không có nội dung (text rỗng, chưa chọn ảnh) → hiển thị placeholder "Chưa có nội dung"

---

### US-13.10: Config Panel — Tooltip cho mọi field và action

> **As an** Administrator
> **I want to** understand what each field and button does
> **So that** I can use the editor confidently without trial and error

**Acceptance Criteria:**
- Mọi action button có tooltip tiếng Việt hiển thị khi hover 500ms:
  - Move up: "Di chuyển lên trên"
  - Move down: "Di chuyển xuống dưới"
  - Duplicate: "Nhân đôi block"
  - Delete: "Xóa block"
- Field label phức tạp (vd: "Object Fit", "Drop Cap", "Slides Per View") có icon `(?)` bên cạnh, hover hiện tooltip giải thích
- Tooltip dùng thuộc tính `title` native HTML cho đơn giản, hoặc CSS `::after` pseudo-element với `content: attr(data-tooltip)`

---

### US-13.11: Fix Media Path — ImageBlock render route chính xác

> **As an** Administrator
> **I want to** see images render correctly in the editor preview
> **So that** the live preview actually shows images, not broken placeholders

**Acceptance Criteria:**
- `ImageBlock.tsx` sửa `src` từ `/api/media/${data.mediaId}/file` (route không tồn tại) sang `/img/${data.mediaId}/medium` (route có thật trong media service)
- `VideoBlock.tsx` sửa từ dùng `mediaId` làm YouTube ID sang logic phân biệt: nếu `source: "youtube"` thì render iframe YouTube, nếu là upload thì dùng `/raw/...`
- Trong block-editors, `MediaPicker` trả về `mediaId` string (UUID), không phải URL — đồng bộ contract giữa MediaPicker output và block renderer input
- Image block với mediaId rỗng hoặc ảnh không tồn tại → hiển thị placeholder "Chưa chọn ảnh" với style nhẹ nhàng (không hiển thị broken image icon)
- Video block với mediaId rỗng → hiển thị placeholder "Chưa chọn video"

---

## BDD Scenarios

```gherkin
Feature: Live Preview — Real-time Content Rendering

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Blocks render at full size in the editor
    When I add a "heading" block with text "Giới thiệu dự án"
    And I add a "paragraph" block with text "Đây là nội dung mô tả chi tiết..."
    Then the heading should be displayed at normal H2 font size in the center area
    And the paragraph should be displayed at normal paragraph font size
    And no content should be scaled down or truncated
    And the toggle "Xem trước" button should NOT be visible

  Scenario: Block type badge is outside content area
    Given I have a heading block with text "Tiêu đề bài viết"
    When I look at the block in the center area
    Then the block type badge "TIÊU ĐỀ" should be visible next to the drag handle
    And the badge should NOT overlap the heading text

  Scenario: Content updates instantly when editing in config panel
    Given I have a heading block selected
    When I type "Tiêu đề mới" in the text field in the right panel
    Then the heading in the center area should immediately display "Tiêu đề mới"
    And there should be no visible delay or flicker

  Scenario: Block is highlighted when selected
    Given I have 3 blocks in the editor
    When I click on the second block (paragraph)
    Then that block should have a left border highlight (green color)
    And the other 2 blocks should remain at normal opacity
    And the paragraph text should still be fully readable
    When I click on the center background (deselect)
    Then no block should be highlighted

  Scenario: Empty state when all blocks are removed
    Given I have 2 blocks in the editor
    When I delete both blocks
    Then the drop zone should appear in the center area
    And the drop zone should display "Kéo block từ bên trái vào đây"

  Scenario: Multiple consecutive same-type blocks are distinguishable
    Given I have 3 consecutive heading blocks with text "A", "B", "C"
    Then each heading should render at normal size
    And the border between selected and unselected blocks should be clearly visible

  Scenario: Nested columns block renders at full size
    When I add a "columns" block with 2 columns
    And I add a "paragraph" block with text "Cột trái" in column 1
    And I add an "image" block in column 2
    Then the columns should display side by side at normal width
    And "Cột trái" should be readable at normal paragraph size
    And the image should display at normal size (or broken placeholder if no image selected)

  Scenario: Nested accordion block renders at full size
    When I add an "accordion" block with 2 items
    And I add a "paragraph" with text "Nội dung accordion" inside item 1
    Then the accordion should display at normal width
    And "Nội dung accordion" should be visible inside the accordion item

  Scenario: Image block with empty mediaId shows placeholder
    When I add an "image" block without selecting an image
    Then the center area should display "Chưa chọn ảnh" placeholder
    And there should be no broken image icon or 404 error visible

  Scenario: Corrupted block data does not crash the editor
    Given the blocks state has a block with type "heading" and data set to {}
    When the editor renders
    Then the block should render without crashing
    And the heading should display with empty text and default styling
```

```gherkin
Feature: Focus Preview Mode — Full-Screen Overlay

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I have added 3 blocks with content

  Scenario: Enter Focus Mode via button
    When I click the "Focus" button on the TopBar
    Then a full-screen overlay should appear covering the entire admin layout
    And the overlay should have dark background
    And the left panel should not be visible behind the overlay
    And the right panel should not be visible behind the overlay
    And the admin sidebar should not be visible behind the overlay
    And the overlay should display the article content centered at max-width 720px
    And the overlay should show a TopBar with "← Thoát Focus" and "Lưu nháp" buttons

  Scenario: Enter Focus Mode via double-click
    When I double-click on the center content area
    Then the Focus overlay should activate
    And all admin panels should be hidden behind the overlay

  Scenario: Exit Focus Mode via Escape key
    Given the Focus overlay is active
    When I press the Escape key
    Then the overlay should close
    And the 3-panel editor layout should be fully visible again
    And the admin sidebar should be visible again

  Scenario: Exit Focus Mode via button
    Given the Focus overlay is active
    When I click "← Thoát Focus"
    Then the overlay should close
    And all panels should be visible again

  Scenario: Save still works in Focus Mode
    Given the Focus overlay is active
    When I click "Lưu nháp"
    Then the content should be saved successfully
    And the Focus overlay should remain active

  Scenario: Focus overlay is rendered above everything
    Given the Focus overlay is active
    When I inspect the overlay element's CSS
    Then it should have position: fixed
    And it should have z-index of at least 1000
    And it should cover the full viewport (top: 0, left: 0, width: 100vw, height: 100vh)
```

```gherkin
Feature: Preview Route — Real Article Layout

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I have content with heading, paragraph, and list blocks

  Scenario: Open preview in new tab
    When I click "Xem trước" button on the TopBar
    Then a new browser tab should open
    And the URL should be "/xem-truoc"
    And the page should render with SiteHeader and SiteFooter (same layout as public)
    And the page should render the blocks with the same layout as public article page
    And the page should have the same typography, spacing, and container width as "/bai-viet/[slug]"

  Scenario: Preview page with no data
    When I navigate to "/xem-truoc" directly without block data in sessionStorage
    Then the page should display "Không có nội dung để xem trước"
    And the page should NOT crash or show a blank screen

  Scenario: Preview page with oversized content
    Given the editor has a very large article (100+ blocks with long text)
    When sessionStorage.setItem throws QuotaExceededError
    Then the preview page should display "Nội dung quá lớn, không thể xem trước. Vui lòng lưu nháp và xem từ trang bài viết."
    And the page should NOT crash

  Scenario: Preview page is not indexed
    When I view the page source of "/xem-truoc"
    Then the meta tag should contain: <meta name="robots" content="noindex">

  Scenario: Preview reflects latest editor state
    Given I have 3 blocks in the editor
    When I open preview in new tab
    Then the preview should show all 3 blocks
    When I go back to the editor and add a 4th block
    And I open preview again
    Then the preview should show all 4 blocks
```

```gherkin
Feature: Lucide Component Palette

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I click the "Components" tab in the left panel

  Scenario Outline: Each block type displays a Lucide icon
    When I look at the "<block_type>" button in the component palette
    Then it should show a Lucide icon, not an emoji or text symbol
    And the icon should be 16x16px with color #64748b

    Examples:
      | block_type    | expected_icon       |
      | heading       | Heading             |
      | paragraph     | Pilcrow             |
      | quote         | Quote               |
      | list          | List                |
      | code          | CodeXml             |
      | callout       | AlertTriangle       |
      | image         | Image               |
      | video         | Video               |
      | gallery       | LayoutGrid          |
      | carousel      | Images              |
      | beforeAfter   | Columns2            |
      | divider       | Minus               |
      | spacer        | ArrowUpDown         |
      | columns       | Columns3            |
      | tabs          | FolderKanban        |
      | accordion     | ChevronsDownUp      |
      | collapse      | ChevronDown         |
      | timeline      | Clock               |
      | table         | Table               |
      | cta           | ArrowRight          |
      | pricingTable  | DollarSign          |
      | testimonial   | Star                |

  Scenario: No emoji or text symbols remain in palette
    When I inspect the component palette HTML
    Then there should be no elements containing only a single character like "H", "¶", or "⊞"
    And there should be no emoji characters (U+1F300-U+1F9FF range)

  Scenario: Icon color is consistent across all blocks
    Given I am viewing the component palette
    Then all block icons should have the same color (#64748b)
    And no icon should have a different color by default
```

```gherkin
Feature: Lucide Action Buttons & Drag Handle

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I have added a heading block
    And I have selected the heading block

  Scenario Outline: Action buttons use Lucide icons
    When I look at the RightPanel block actions
    Then the "<action>" button should show icon "<icon>"

    Examples:
      | action        | icon          |
      | Move up       | ChevronUp     |
      | Move down     | ChevronDown   |
      | Duplicate     | Copy           |
      | Delete        | Trash2        |

  Scenario: Drag handle uses GripVertical icon
    When I look at the block's drag handle
    Then it should display a GripVertical icon from Lucide
    And the icon should be 14px, color #ccc

  Scenario: Action buttons show tooltips on hover
    When I hover over the Move up button for 500ms
    Then a tooltip should appear with text "Di chuyển lên trên"
    When I hover over the Delete button for 500ms
    Then a tooltip should appear with text "Xóa block"

  Scenario: Delete button turns red on hover
    When I hover over the Delete button
    Then the button background should change to a light red color
    And the icon color should change to #c53030
```

```gherkin
Feature: Config Panel — Input Types

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Heading uses textarea not input
    When I add a "heading" block and select it
    Then the text field in the config panel should be a <textarea> element, not <input>
    And the textarea should have rows={2}
    When I type a long heading text "Đây là một tiêu đề rất dài để kiểm tra khả năng hiển thị của textarea trong panel cấu hình block editor"
    Then all characters should be visible without horizontal scroll

  Scenario: Paragraph textarea is tall enough
    When I add a "paragraph" block and select it
    Then the textarea should have at least 6 visible rows
    And the textarea should use the full width of the panel

  Scenario: Short fields remain as input
    When I add an "image" block and select it
    Then the "Alt text" field should be <input type="text">
    Then the "Caption" field should be <input type="text">
    Then the "Link URL" field should be <input type="text">

  Scenario: Right panel is 360px wide
    When I inspect the right panel element
    Then its width should be 360px
    And its min-width should be 360px

  Scenario: Undo does not trigger on every keystroke in textarea
    Given I have a heading block selected with text "ABC"
    When I type "DEF" character by character in the textarea
    And I wait 1 second (debounce window)
    Then the undo history should NOT contain a separate entry for each character typed
    And pressing Ctrl+Z should revert the full "DEF" or the "ABCDEF" edit in one step
```

```gherkin
Feature: Config Panel — Field Grouping

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Heading editor has grouped fields
    When I add a "heading" block and select it
    Then the config panel should show group "Nội dung" containing the text textarea
    And the config panel should show group "Định dạng" containing level, weight, alignment, italic, underline
    And the config panel should show group "Màu sắc" containing the color select

  Scenario: Paragraph editor has grouped fields
    When I add a "paragraph" block and select it
    Then the config panel should show group "Nội dung"
    And the config panel should show group "Định dạng"
    And the config panel should show group "Màu sắc"

  Scenario: Image editor has grouped fields
    When I add an "image" block and select it
    Then the config panel should show group "Ảnh" with media picker
    And the config panel should show group "Hiển thị" with width and objectFit
    And the config panel should show group "Styling" with rounded, border, shadow, hoverZoom
    And the config panel should show group "Metadata" with alt, caption, link
```

```gherkin
Feature: Config Panel — Color Swatch

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I have a heading block selected

  Scenario: Color select shows visual swatches
    When I open the color dropdown in the heading config panel
    Then each option should display a colored square (14x14px) next to the label text
    And the "Kế thừa" option should show a gray diagonal gradient swatch
    And the "Trắng" option should show a light swatch (#f1f5f9)
    And the "Xám" option should show a gray swatch (#94a3b8)
    And the "Primary" option should show a blue swatch (#0ea5e9)
    And the "Accent" option should show an amber swatch (#f59e0b)

  Scenario: Color swatch is consistent across blocks
    Given I have a paragraph block selected
    When I open the color dropdown
    Then the swatches should use the same colors and sizes as the heading color dropdown

  Scenario: Selected color shows swatch in collapsed state
    Given I have a heading block selected
    And I have chosen color "--color-primary"
    When I look at the color field (before clicking to open dropdown)
    Then a small swatch of the selected color should be visible next to the select control
```

```gherkin
Feature: Config Panel — Mini Block Preview

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Selected block shows mini preview
    When I add a "heading" block with text "Tiêu đề minh họa"
    And I select the heading block
    Then the right panel should display a mini preview of the heading above the block info
    And the mini preview should show "Tiêu đề minh họa" rendered as a heading

  Scenario: Empty block shows placeholder in mini preview
    When I add a "heading" block without typing any text
    And I select the heading block
    Then the mini preview should display placeholder text "Chưa có nội dung"

  Scenario: Mini preview updates on config change
    Given I have a heading block selected with text "Cũ"
    When I change the text to "Mới" in the config panel
    Then the mini preview should immediately update to show "Mới"
    And the center area preview should also update to "Mới"

  Scenario: Mini preview has constrained height
    Given I have a paragraph block with very long text (500+ characters) selected
    Then the mini preview should not exceed 120px in height
    And overflow content should be hidden with a fade effect
```

```gherkin
Feature: Media Block Rendering

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Image block renders from correct media route
    When I add an "image" block
    And I select an image with mediaId "abc-123-def"
    Then the image src should be "/img/abc-123-def/medium"
    And the image should NOT use "/api/media/abc-123-def/file"

  Scenario: Image block with non-existent media shows placeholder
    When I add an "image" block
    And I manually set mediaId to "non-existent-id"
    And the image fails to load (404 or error)
    Then "Chưa chọn ảnh" placeholder should be displayed
    And no broken image icon should be visible

  Scenario: Video block with YouTube source renders embed
    When I add a "video" block
    And I set source to "youtube" with youtubeId "dQw4w9WgXcQ"
    Then the video should render as a YouTube iframe embed
    And the iframe src should contain "youtube.com/embed/dQw4w9WgXcQ"

  Scenario: Video block with upload source renders raw video
    When I add a "video" block
    And I set source to "upload" with diskPath "data/uploads/2026/07/vid-123.mp4"
    Then the video should render using the /raw/ route
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Preview render** | Bỏ `transform: scale(0.55)` trong `.blockItemThumb`, render BlockRenderer ở kích thước tự nhiên |
| **Block badge** | Di chuyển từ `position: absolute` đè lên nội dung sang strip bên trái cạnh drag handle, dùng flexbox layout |
| **Focus Mode** | State `isFocusMode` ở page level (`tao-moi/page.tsx`, `[slug]/page.tsx`). Overlay `<FocusOverlay>` component với `position: fixed; z-index: 1000; background: #0B0F19` |
| **Preview Route** | `apps/web/src/app/(nguoi-dung)/xem-truoc/page.tsx` — client component, đọc `sessionStorage.getItem("preview-blocks")`, kế thừa NguoiDungLayout |
| **sessionStorage safety** | Wrap `setItem` trong try-catch, bắt `QuotaExceededError`, hiển thị fallback message |
| **Lucide Icons** | Import từ `lucide-react`, đã có sẵn trong `apps/web/package.json` |
| **Drag handle** | Dùng `GripVertical` icon từ Lucide thay thế text "⋮⋮" |
| **Textarea** | Component `TextArea` đã có trong `block-editors.tsx` với `composes: input`, chỉ cần đổi component gọi |
| **Undo granularity** | Textarea changes được debounce 500ms trước khi push vào undo history, tránh mỗi ký tự là 1 history entry |
| **FieldGroup** | Component mới trong `block-editors.tsx` (hoặc file riêng), nhận `title: string` + `children` |
| **Color Swatch** | Dùng hardcoded hex fallback (không resolve CSS variables qua inline style). Hiển thị swatch cả trong dropdown option và collapsed select state |
| **Mini Preview** | Dùng `BlockRenderer` với `transform: scale(0.6); transform-origin: top left; max-height: 120px; overflow: hidden` |
| **Tooltip** | Dùng thuộc tính `title` native HTML cho đơn giản |
| **Right Panel Width** | Đổi `width: 300px` → `width: 360px` trong `workspace.module.scss` |
| **Image render path** | `ImageBlock.tsx`: `/api/media/${id}/file` → `/img/${id}/medium` |
| **Video block logic** | Phân biệt `source: "youtube"` (iframe embed) vs `source: "upload"` (raw video route) |
| **MediaPicker contract** | `MediaPicker` output `mediaId` (UUID string), đồng bộ với block renderer input expectation |

---

## Dependencies

- **Spec 02:** Block Content Editor (block types, schema, renderers)
- **Spec 12:** Block Editor V2 — Config Panel & Renderers (config hoàn chỉnh cho 22 block types)
- **Spec 04:** Media Microservice (upload, img serving routes)
- **Package:** `lucide-react` — đã cài đặt trong `apps/web/package.json`
- **Package:** `@dnd-kit/core`, `@dnd-kit/sortable` — đang dùng cho drag/drop, không đổi

---

## File Impact

| File | Change | Type |
|------|--------|------|
| `BlockEditor.tsx` | Bỏ toggle preview, expose `onFocus` callback, accept `titleInput`/`leftPanel`, block badge layout | **Modify** |
| `LeftPanel.tsx` | Thay BLOCK_ICONS string → Lucide component map | **Modify** |
| `RightPanel.tsx` | Thay action icons unicode → Lucide, thêm mini preview, thêm tooltip | **Modify** |
| `block-editors.tsx` | Heading text input→textarea, thêm FieldGroup, thêm color swatch, thêm TextArea rows, thêm undo debounce | **Modify** |
| `workspace.module.scss` | Xóa scale(0.55), tăng rightPanel 300→360px, thêm fieldGroup styles, thêm badge strip styles, thêm focus overlay styles | **Modify** |
| `block-editors.module.scss` | Thêm .fieldGroup, .fieldGroupTitle, .colorSwatch styles | **Modify** |
| `tao-moi/page.tsx` | Thêm `isFocusMode` state + `<FocusOverlay>` render | **Modify** |
| `bai-viet/[slug]/page.tsx` | Thêm `isFocusMode` state + `<FocusOverlay>` render | **Modify** |
| `apps/web/src/app/(nguoi-dung)/xem-truoc/page.tsx` | **New** — preview route với layout article thật | **New** |
| `ImageBlock.tsx` | Fix render path `/api/media/:id/file` → `/img/:id/medium` | **Fix** |
| `VideoBlock.tsx` | Phân biệt youtube vs upload source | **Fix** |
| `MediaPicker` (in block-editors) | Đảm bảo trả về mediaId string (UUID), không phải URL | **Fix** |

---

## Out of Scope (Cho Spec sau)

- Virtual scroll cho >50 blocks
- Inline text formatting (bold/italic trong paragraph)
- Mobile responsive editor layout
- Collaborative editing (multi-user)
- AI-assisted content generation trong editor
- Preview trên mobile viewport
- Panel resize kéo thả
- Fix toàn bộ media contract cho tất cả block (chỉ fix Image + Video trong spec này)

---

## Review Resolution Log

| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| A1 | Focus Mode không thể ẩn admin sidebar từ BlockEditor | 🔴 Blocking | **FIXED**: Lift state lên page level, render `<FocusOverlay>` full-screen overlay với `position: fixed; z-index: 1000` che toàn bộ admin layout |
| A2 | ImageBlock `/api/media/:id/file` không tồn tại | 🔴 Blocking | **FIXED**: Sửa thành `/img/:id/medium`, thêm US-13.11 + scenarios, cập nhật File Impact |
| A3 | Color swatch `#ffffff` sai với theme | 🟡 Warning | **FIXED**: Swatch dùng hardcoded hex fallback, `--color-text` → `#f1f5f9` (text sáng cho theme tối). Document rõ approach trong Technical Constraints |
| A4 | sessionStorage 5MB limit | 🟡 Warning | **FIXED**: Thêm QuotaExceededError scenario với fallback message. Wrap setItem trong try-catch |
| A5 | Preview route layout không rõ | 🟡 Warning | **FIXED**: Route đặt trong `(nguoi-dung)/xem-truoc/` để kế thừa NguoiDungLayout (SiteHeader + SiteFooter) |
| A6 | Badge che nội dung ở full-size | 🟡 Warning | **FIXED**: Relocate badge sang strip bên trái cạnh drag handle, thêm scenario verify |
| A7 | Thiếu nested block scenarios | 🟡 Warning | **FIXED**: Thêm 2 scenarios cho columns và accordion nested rendering |
| E1 | Undo granularity khi gõ textarea | 🟡 Warning | **FIXED**: Document debounce approach, thêm scenario verify undo không trigger per-character |
| E2 | Empty state khi xóa hết blocks | 🟡 Warning | **FIXED**: Thêm scenario |
| E3 | Block data corrupted/empty | 🟡 Warning | **FIXED**: Thêm scenario verify không crash |
| E4 | Nhiều block cùng loại liên tiếp | 🟡 Warning | **FIXED**: Thêm scenario verify distinguishability |
| E5 | Click vào nested block | 🟡 Warning | **NOTED**: Sẽ được xử lý trong implementation — click vào nested block chọn block cha |

---

## Next Steps

1. `/bdd-dev` — Implement theo file impact table
2. Manual QA: đăng nhập admin → tạo bài viết → thêm block → verify live render, Focus Mode overlay, icons, textarea, image rendering
