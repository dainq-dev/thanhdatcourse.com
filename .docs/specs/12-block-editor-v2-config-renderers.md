# Spec 12: Block Editor V2 — Config Panel & Renderers Hoàn Chỉnh

**Status:** Draft
**Created:** 2026-07-24
**Ref:** `BLOCK-EDITOR-BRAINSTORMING.md` (brainstorming), `02-block-content-editor.md` (spec gốc)
**BRD:** `.docs/brd/11-block-editor-v2-config-renderers.md`
**Planning:** `.docs/planning/09-block-editor-v2.md`
**Implementation:** `.docs/plan-implementation/phase-6-block-editor-v2.md`

---

## Feature Description

Nâng cấp Block Editor từ trạng thái hiện tại (50% hoàn thiện) lên **100% hoàn thiện**:

1. **Cấu hình đầy đủ** cho từng block type — mỗi block có config panel với tất cả options cần thiết về typography, media styling, layout.
2. **4 block type hiện thiếu editor form** (columns, tabs, accordion, collapse) có config panel hoàn chỉnh với nested block editor.
3. **14 renderer stub** được implement thực tế (không còn placeholder text).
4. **Fix các lỗi kỹ thuật**: blocks thêm từ LeftPanel có data rỗng, dead code, stub pages.

---

## User Stories

### US-12.1: Admin cấu hình tất cả block types với config panel đầy đủ

> **As an** Administrator
> **I want to** configure every property of every block type via the right panel
> **So that** I have full control over content appearance without writing code

**Acceptance Criteria:**
- Mọi block type (22/22) khi click vào đều hiển thị config panel bên phải
- Không còn block nào hiển thị "chưa có form cấu hình"
- Các config type phổ biến (bo góc, shadow, căn lề, kích thước) dùng UI component nhất quán giữa các block
- Thay đổi config trong panel → preview center cập nhật ngay lập tức

---

### US-12.2: Config Typography Blocks (Typography Styling)

> **As an** Administrator
> **I want to** style headings and paragraphs with font weight, italic, underline, alignment, size, and color
> **So that** I can create visually expressive text content

**Heading Config (đầy đủ):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `text` | TextInput | `""` | string |
| `level` | Select | `2` | 1, 2, 3, 4, 5, 6 |
| `alignment` | ButtonGroup (icons) | `left` | left, center, right, justify |
| `weight` | Select | `bold` | regular, medium, semibold, bold |
| `italic` | Toggle | `false` | boolean |
| `underline` | Toggle | `false` | boolean |
| `color` | CSS Variable dropdown | `inherit` | inherit, --color-text, --color-primary, --color-accent, --color-muted |

**Paragraph Config (đầy đủ):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `text` | TextArea | `""` | string |
| `alignment` | ButtonGroup | `left` | left, center, right, justify |
| `dropCap` | Toggle | `false` | boolean |
| `fontSize` | Select | `md` | sm, md, lg |
| `lineHeight` | Select | `normal` | tight, normal, relaxed |
| `weight` | Select | `regular` | regular, medium, semibold |
| `color` | CSS Variable dropdown | `inherit` | inherit, --color-text, --color-primary, --color-accent, --color-muted |

**Quote Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `text` | TextArea | `""` | string |
| `author` | TextInput | `""` | string, optional |
| `style` | Select | `default` | default, bordered, pull |
| `icon` | **IconPicker** (Lucide) | `null` | optional, chọn từ bộ Lucide icons |

**Callout Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `text` | TextArea | `""` | string |
| `variant` | Select | `info` | info, warning, tip, danger |
| `icon` | IconPicker | `null` | optional |
| `title` | TextInput | `""` | string, optional |

**Code Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `code` | TextArea | `""` | string |
| `language` | Select | `plaintext` | javascript, typescript, python, html, css, bash, json, plaintext, ... |
| `showLineNumbers` | Toggle | `false` | boolean |
| `theme` | Select | `dark` | dark, light |
| `showCopyButton` | Toggle | `true` | boolean |

**Acceptance Criteria:**
- Chọn "Heading" từ LeftPanel → hiện config panel với đầy đủ 8 field
- Chọn font weight "semibold" + italic toggle ON → preview heading hiển thị chữ semibold nghiêng
- Chọn màu accent từ dropdown → preview heading đổi màu
- Chọn alignment "justify" → text căn đều 2 bên

---

### US-12.3: Config Media Blocks (Image, Video, Gallery, Carousel, Before/After)

> **As an** Administrator
> **I want to** style media blocks with rounded corners, shadows, hover effects, and transitions
> **So that** images and videos look professional and polished

**Image Config (nâng cấp từ boolean → enum):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `mediaId` | MediaPicker | `""` | UUID string |
| `alt` | TextInput | `""` | string, optional |
| `caption` | TextInput | `""` | string, optional |
| `width` | Select | `wide` | full, wide, contained, inline |
| `rounded` | Select | `none` | none, sm (4px), md (8px), lg (16px), full (9999px) |
| `border` | Select | `none` | none, thin (1px), medium (2px), thick (4px) |
| `shadow` | Select | `none` | none, sm, md, lg, xl |
| `hoverZoom` | Toggle | `false` | boolean |
| `link` | TextInput | `""` | URL string, optional |
| `objectFit` | Select | `cover` | cover, contain, fill |

**Video Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `mediaId` | MediaPicker | `""` | UUID string |
| `caption` | TextInput | `""` | string, optional |
| `aspectRatio` | Select | `16:9` | 16:9, 4:3, 9:16, 1:1 |
| `rounded` | Select | `none` | none, sm, md, lg, full |
| `shadow` | Select | `none` | none, sm, md, lg |
| `autoplay` | Toggle | `false` | boolean |
| `loop` | Toggle | `false` | boolean |
| `showControls` | Toggle | `true` | boolean |
| `thumbnail` | MediaPicker | `""` | UUID string, optional — ảnh cover trước khi play |

**Gallery Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `images` | MediaPicker (multi) + caption per item | `[]` | array {mediaId, caption?} |
| `columns` | Select | `3` | 2, 3, 4 |
| `gap` | Select | `md` | sm, md, lg |
| `layout` | Select | `grid` | grid, masonry |
| `rounded` | Select | `none` | none, sm, md, lg |
| `shadow` | Select | `none` | none, sm, md, lg |
| `hoverZoom` | Toggle | `false` | boolean |
| `lightbox` | Toggle | `true` | boolean — click mở lightbox full màn hình |

**Carousel Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `slides` | MediaPicker (multi) + caption per item | `[]` | array {mediaId, caption?} |
| `autoplay` | Toggle | `false` | boolean |
| `interval` | NumberInput (1000-20000) | `5000` | ms, chỉ hiện khi autoplay ON |
| `showDots` | Toggle | `true` | boolean |
| `showArrows` | Toggle | `true` | boolean |
| `transition` | Select | `slide` | slide, fade, cube |
| `rounded` | Select | `none` | none, sm, md, lg |
| `shadow` | Select | `none` | none, sm, md, lg |
| `aspectRatio` | Select | `16:9` | 16:9, 4:3, 1:1, auto |
| `loop` | Toggle | `true` | boolean |
| `pauseOnHover` | Toggle | `true` | boolean |
| `slidesPerView` | Select | `1` | 1, 2, 3 |

**Before/After Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `beforeMediaId` | MediaPicker | `""` | UUID string |
| `afterMediaId` | MediaPicker | `""` | UUID string |
| `beforeLabel` | TextInput | `"Trước"` | string |
| `afterLabel` | TextInput | `"Sau"` | string |
| `caption` | TextInput | `""` | string, optional |
| `orientation` | Select | `horizontal` | horizontal, vertical |
| `rounded` | Select | `none` | none, sm, md, lg |
| `shadow` | Select | `none` | none, sm, md, lg |

**Acceptance Criteria:**
- Chọn Image block → config panel có bo góc 5 lựa chọn (none/sm/md/lg/full)
- Chọn bo góc "lg" + shadow "md" → preview ảnh hiển thị bo góc 16px + shadow
- Chọn Carousel block → config panel có transition effect (slide/fade/cube)
- Chọn slidesPerView = 2 → carousel hiển thị 2 slide cùng lúc
- Các field điều kiện (ví dụ: interval chỉ hiện khi autoplay ON) hoạt động đúng

---

### US-12.4: Config Layout Blocks (Columns, Tabs, Divider, Spacer)

> **As an** Administrator
> **I want to** create structured layouts with columns, tabs, dividers, and spacers
> **So that** my content has professional visual hierarchy

**Columns Config (MỚI — hiện chưa có editor):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `columns` | Select | `2` | 2, 3, 4 |
| `gap` | Select | `md` | sm, md, lg |
| `columnRatios` | Select | `auto` | auto, 50-50, 33-33-33, 25-75, 75-25, 33-67, 67-33 |
| `content` | **Nested Block Editors** (expand-in-place) | `[[],[]]` | Mỗi column là 1 block[] |

**Tabs Config (MỚI — hiện chưa có editor):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `tabs` | Dynamic list: label + nested blocks per tab | `[{label:"Tab 1", content:[]}]` | array {label, content: Block[]} |
| `tabStyle` | Select | `top` | top, pills, vertical |
| `defaultTab` | NumberInput | `0` | 0-based index |

**Divider Config:** ✅ Đã đủ (style: solid/dashed/dotted/gradient)

**Spacer Config:** ✅ Đã đủ (height: 8-200px)

**Acceptance Criteria:**
- Chọn Columns 2 → config panel hiển thị columnRatios + gap selector + 2 zone nested editor
- Click vào column zone 1 → mở rộng nested editor cho phép thêm paragraph, image, etc.
- Đổi columnRatios sang "25-75" → preview hiển thị column trái 25%, phải 75%
- Chọn Tabs với tabStyle "pills" → preview hiển thị tabs dạng pill

---

### US-12.5: Config Interactive Blocks (Accordion, Collapse, Timeline, Table)

> **As an** Administrator
> **I want to** create interactive content blocks
> **So that** my content is engaging and scannable

**Accordion Config (MỚI — hiện chưa có editor):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `items` | Dynamic list: title + nested blocks per item | `[{title:"", content:[]}]` | array {title, content: Block[]} |
| `allowMultiple` | Toggle | `true` | boolean |
| `iconPosition` | Select | `right` | left, right |
| `defaultOpenIndex` | NumberInput | `-1` | -1 (none), 0, 1, 2... |
| `borderStyle` | Select | `bordered` | bordered, borderless |

**Collapse Config (MỚI — hiện chưa có editor):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `title` | TextInput | `""` | string |
| `content` | Nested Block Editor | `[]` | Block[] |
| `defaultOpen` | Toggle | `false` | boolean |
| `iconPosition` | Select | `right` | left, right |

**Timeline Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `events` | Dynamic list: date, title, description per event | `[]` | array {date, title, description} |
| `layout` | Select | `vertical` | vertical, horizontal, alternating |
| `iconPerEvent` | IconPicker (optional) | `null` | optional per event |
| `lineColor` | CSS Variable dropdown | `--color-border` | --color-border, --color-primary, --color-accent |

**Table Config:** ✅ Đã đủ

**Acceptance Criteria:**
- Chọn Accordion → config panel có iconPosition + borderStyle selectors + dynamic items với nested editor
- Thêm accordion item mới → hiện title input + nested editor zone
- Chọn Collapse → config panel có title + nested editor + defaultOpen toggle
- Chọn Timeline với layout "horizontal" → preview hiển thị timeline ngang

---

### US-12.6: Config Conversion Blocks (CTA, Pricing, Testimonial)

> **As an** Administrator
> **I want to** create high-conversion CTA sections, pricing tables, and testimonials
> **So that** my content drives user action

**CTA Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `heading` | TextInput | `""` | string |
| `text` | TextArea | `""` | string, optional |
| `buttonText` | TextInput | `""` | string |
| `buttonUrl` | TextInput | `""` | URL string |
| `style` | Select | `primary` | primary, secondary, minimal |
| `backgroundMediaId` | MediaPicker | `""` | optional |
| `buttonStyle` | Select | `solid` | solid, outline, ghost |
| `buttonSize` | Select | `md` | sm, md, lg |
| `buttonIcon` | IconPicker | `null` | optional (Lucide) |

**Pricing Table Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `plans` | Dynamic list: name, price, period, description, features[], cta{text,url}, highlighted | `[]` | array |
| `currency` | TextInput | `"VNĐ"` | string |
| `billingPeriod` | Toggle (monthly/yearly) | `monthly` | monthly, yearly |
| `layout` | Select | `horizontal` | horizontal, vertical |

**Testimonial Config (bổ sung):**

| Field | UI Control | Default | Values |
|-------|-----------|---------|--------|
| `testimonialId` | Select (fetch từ API /api/testimonials) | `""` | string |
| `style` | Select | `card` | card, inline, large |
| `showAvatar` | Toggle | `true` | boolean |
| `showRating` | Toggle | `true` | boolean |
| `avatarSize` | Select | `md` | sm, md, lg |
| `background` | Select | `none` | none, light, dark, gradient |

**Acceptance Criteria:**
- Chọn CTA → thêm buttonStyle "outline" + buttonSize "lg" + icon ArrowRight → preview hiển thị nút outline to có icon
- Chọn Pricing → thêm 3 plans, toggle billingPeriod → hiển thị giá theo tháng/năm
- Chọn Testimonial → select testimonial từ dropdown API, showAvatar OFF → hiển thị testimonial không có ảnh đại diện

---

### US-12.7: Icon Picker Component (Shared)

> **As an** Administrator
> **I want to** pick an icon from the Lucide icon set
> **So that** I can add visual icons to callouts, quotes, CTAs, and timelines

**Acceptance Criteria:**
- IconPicker hiển thị grid icons từ Lucide (theo category: arrows, communication, media, etc.)
- Có search/filter để tìm icon nhanh
- Click icon → chọn, hiển thị preview icon được chọn
- Nút "X" để clear icon (về null)
- Dùng chung cho các block: quote, callout, cta, timeline

---

### US-12.8: Renderers Hoàn Chỉnh (Preview Center)

> **As an** Administrator
> **I want to** see a realistic preview of my content in the center panel
> **So that** I know exactly how content will look on the website

**Acceptance Criteria:**
- **Tất cả 22/22 block renderers** render nội dung thực tế (không còn "X: N images" placeholder)
- Image renderer: hiển thị ảnh từ mediaId (gọi media API), áp dụng rounded, border, shadow, hoverZoom
- Video renderer: hiển thị iframe YouTube với aspect ratio, thumbnail overlay nếu có
- Gallery renderer: grid/masonry layout với lightbox
- Carousel renderer: slideshow với dots, arrows, autoplay, transition effects
- Before/After renderer: slider kéo so sánh 2 ảnh
- Columns renderer: multi-column layout responsive (mobile: collapse 1 column)
- Tabs renderer: tab navigation với pills/style
- Accordion renderer: expandable sections với animation
- Collapse renderer: single expandable section
- Timeline renderer: vertical/horizontal/alternating layout
- Table renderer: responsive table với striped rows
- Pricing renderer: card layout plans
- Testimonial renderer: styled cards với avatar, rating stars
- CTA renderer: full-width section với background ảnh

---

### US-12.9: Fix Lỗi Kỹ Thuật

> **As a** Developer
> **I want to** fix critical bugs in the block editor
> **So that** the editor works reliably

**Bug Fixes:**

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | Blocks từ LeftPanel có `data: {}` | `tao-moi/page.tsx` dùng `addBlock` riêng, không gọi `getDefaultData()` | Dùng `editor.addBlock(type)` từ editorState |
| 2 | Dead code 196 dòng | `useBlockEditor.ts` không được import ở đâu | Xóa file |
| 3 | Stub pages thừa | `tao-bai-viet/page.tsx`, `chinh-sua-bai-viet/page.tsx` | Xóa hoặc redirect về route chính |
| 4 | Edit page không có full editor | `[slug]/page.tsx` không có LeftPanel + RightPanel | Refactor dùng chung layout với `tao-moi` |
| 5 | Preview center: typing input không cập nhật | Cần verify data flow từ RightPanel → BlockEditor → renderer | Debug và fix data flow |

**Acceptance Criteria:**
- Kéo Heading từ LeftPanel vào editor → block có default data `{ level: 2, text: "", alignment: "left", weight: "bold", italic: false, underline: false, color: "inherit" }`
- `useBlockEditor.ts` đã bị xóa, không còn import nào bị lỗi
- `/quan-tri-vien/bai-viet/tao-bai-viet` redirect về `/quan-tri-vien/bai-viet/tao-moi`
- `/quan-tri-vien/bai-viet/chinh-sua-bai-viet` redirect về danh sách bài viết
- Edit page `[slug]` có đầy đủ LeftPanel + RightPanel giống `tao-moi`
- Gõ text vào input trong config panel → preview center cập nhật ngay lập tức

---

## BDD Scenarios

### Spec 12.1: Config Panel Hiển Thị Cho Mọi Block Type

```gherkin
Feature: Config Panel cho tất cả Block Types

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario Outline: Mỗi block type đều có config panel đầy đủ
    When I add a "<block_type>" block from the Left Panel
    And I click on the block to select it
    Then the Right Panel should display a config form
    And the config form should NOT show "chưa có form cấu hình"
    And all schema-defined fields should be present as UI controls

    Examples:
      | block_type    |
      | heading       |
      | paragraph     |
      | quote         |
      | list          |
      | code          |
      | callout       |
      | image         |
      | video         |
      | gallery       |
      | carousel      |
      | beforeAfter   |
      | divider       |
      | spacer        |
      | columns       |
      | tabs          |
      | accordion     |
      | collapse      |
      | timeline      |
      | table         |
      | cta           |
      | pricingTable  |
      | testimonial   |
```

### Spec 12.2: Typography Styling

```gherkin
Feature: Typography Block Styling

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Configure heading with full typography options
    When I add a "heading" block
    And I select it
    Then the config panel should show: level, alignment, weight, italic, underline, color
    When I set text to "Tiêu đề nổi bật"
    And I set level to H2
    And I set weight to "semibold"
    And I toggle italic ON
    And I set color to "--color-primary"
    And I set alignment to "center"
    Then the preview center should display text "Tiêu đề nổi bật" as a centered H2 heading
    And the heading should be semibold, italic, with primary color

  Scenario: Configure paragraph with size and line height
    When I add a "paragraph" block
    And I select it
    Then the config panel should show: alignment, dropCap, fontSize, lineHeight, weight, color
    When I set text to "Nội dung bài viết dài..."
    And I set fontSize to "lg"
    And I set lineHeight to "relaxed"
    And I set alignment to "justify"
    Then the preview center should display the text justified with large font and relaxed line height

  Scenario: Quote with custom icon
    When I add a "quote" block
    And I set text to "Câu nói truyền cảm hứng"
    And I set author to "Tác giả"
    And I open the IconPicker
    And I search "quote"
    And I click the "Quote" icon from Lucide
    Then the preview center should display the quote with the selected icon

  Scenario: Code block with theme and copy button
    When I add a "code" block
    And I set language to "javascript"
    And I set theme to "light"
    And I toggle showCopyButton ON
    And I set code to "console.log('hello')"
    Then the preview center should display syntax-highlighted code with a copy button
```

### Spec 12.3: Media Styling

```gherkin
Feature: Media Block Styling

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Image with rounded corners, border, and shadow
    When I add an "image" block
    And I select an image via MediaPicker with mediaId "img-123"
    And I set rounded to "lg"
    And I set border to "medium"
    And I set shadow to "md"
    And I set hoverZoom to ON
    Then the preview center should display the image with 16px border-radius, 2px border, and medium shadow

  Scenario: Video with custom styling
    When I add a "video" block
    And I select a video with mediaId "vid-456"
    And I set rounded to "md"
    And I set shadow to "lg"
    And I toggle autoplay ON
    And I toggle controls OFF
    Then the preview center should display the video with medium rounded corners and large shadow

  Scenario: Carousel with transition effect
    When I add a "carousel" block
    And I add 3 slides with images
    And I set transition to "fade"
    And I set slidesPerView to "2"
    And I toggle showDots ON
    And I toggle pauseOnHover ON
    Then the preview center should display a carousel showing 2 slides at a time with fade transition

  Scenario: Before/After with vertical orientation
    When I add a "beforeAfter" block
    And I select before image "img-before"
    And I select after image "img-after"
    And I set orientation to "vertical"
    Then the preview center should display a vertical before/after comparison slider
```

### Spec 12.4: Layout Blocks

```gherkin
Feature: Layout Block Configuration

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Columns with unequal ratios and nested content
    When I add a "columns" block
    And I set columns to 2
    And I set columnRatios to "25-75"
    And I set gap to "lg"
    Then the config panel should show 2 nested block zones
    And the left zone should be visibly narrower than the right zone
    When I add a "paragraph" block into column 1
    And I add an "image" block into column 2
    Then the preview center should display a 25%-75% column layout with text on left and image on right

  Scenario: Tabs with pill style
    When I add a "tabs" block
    And I set tabStyle to "pills"
    And I add tab "Giới thiệu" with a paragraph block inside
    And I add tab "Chi tiết" with an image block inside
    And I set defaultTab to 1
    Then the preview center should display pill-style tabs with "Chi tiết" tab active by default
```

### Spec 12.5: Interactive Blocks

```gherkin
Feature: Interactive Block Configuration

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Accordion with nested blocks and custom styling
    When I add an "accordion" block
    Then the config panel should show: dynamic items, allowMultiple toggle, iconPosition, defaultOpenIndex, borderStyle
    When I add item 1 with title "Câu hỏi 1" and a paragraph inside
    And I add item 2 with title "Câu hỏi 2" and an image + paragraph inside
    And I set allowMultiple to OFF
    And I set iconPosition to "left"
    And I set borderStyle to "borderless"
    Then the preview center should display an accordion with icon on the left, borderless, and only one item openable at a time

  Scenario: Collapse with nested content
    When I add a "collapse" block
    And I set title to "Xem thêm chi tiết"
    And I add a paragraph block inside the content area
    And I set defaultOpen to ON
    And I set iconPosition to "left"
    Then the preview center should display the collapse section expanded by default with icon on the left

  Scenario: Timeline with alternating layout and icons
    When I add a "timeline" block
    And I set layout to "alternating"
    And I add event "2026-01" with title "Bắt đầu" and description "Khởi động dự án"
    And I add event "2026-06" with title "Ra mắt" and description "Phát hành sản phẩm"
    And for each event I select a different Lucide icon
    And I set lineColor to "--color-primary"
    Then the preview center should display an alternating timeline with custom icons and primary color line
```

### Spec 12.6: Conversion Blocks

```gherkin
Feature: Conversion Block Configuration

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: CTA with custom button style
    When I add a "cta" block
    And I set heading to "Đăng ký ngay"
    And I set text to "Nhận ưu đãi đặc biệt"
    And I set buttonText to "Tham gia"
    And I set buttonUrl to "https://minhtravel.vn/khoa-hoc"
    And I set buttonStyle to "outline"
    And I set buttonSize to "lg"
    And I select icon "ArrowRight" from IconPicker
    Then the preview center should display a CTA section with a large outline button with arrow icon

  Scenario: Pricing table with billing period toggle
    When I add a "pricingTable" block
    And I set currency to "VNĐ"
    And I set layout to "vertical"
    And I add plan "Cơ bản" with price "499.000" and 3 features
    And I add plan "Pro" with price "999.000" and 5 features, highlighted ON
    And I toggle billingPeriod to "monthly"
    Then the preview center should display a vertical pricing table with monthly prices, Pro plan highlighted

  Scenario: Testimonial from API dropdown
    When I add a "testimonial" block
    And I open the testimonialId dropdown
    Then the dropdown should fetch and display testimonials from "/api/testimonials"
    When I select testimonial "test-001"
    And I set style to "large"
    And I set showAvatar to OFF
    And I set background to "gradient"
    Then the preview center should display a large testimonial card without avatar on gradient background
```

### Spec 12.7: IconPicker Component

```gherkin
Feature: Icon Picker

  Background:
    Given I am logged in as an Administrator
    And I have a block with icon config open (e.g., Callout)

  Scenario: Browse and select an icon
    When I click the "Chọn icon" button
    Then an IconPicker popover should appear with a grid of Lucide icons
    When I type "star" in the search bar
    Then the icon grid should filter to show only icons matching "star"
    When I click the "Star" icon
    Then the popover should close
    And the selected icon name should display next to the button
    And the preview center should render the block with the Star icon

  Scenario: Clear selected icon
    Given I have selected the "Star" icon
    When I click the "X" clear button
    Then the icon should be cleared
    And the preview should render without an icon

  Scenario: IconPicker empty state
    When I click "Chọn icon" for a new block
    Then the popover should show all icons in a grid
    And a search bar should be visible at the top
```

### Spec 12.8: Renderers

```gherkin
Feature: Block Renderers

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    And I toggle preview mode ON

  Scenario Outline: Every block type renders real content (no stubs)
    When the editor contains a "<block_type>" block with minimal valid data
    Then the preview should display real rendered content
    And it should NOT show placeholder text like "X: N images" or "Stub"

    Examples:
      | block_type    |
      | heading       |
      | paragraph     |
      | quote         |
      | list          |
      | code          |
      | callout       |
      | image         |
      | video         |
      | gallery       |
      | carousel      |
      | beforeAfter   |
      | divider       |
      | spacer        |
      | columns       |
      | tabs          |
      | accordion     |
      | collapse      |
      | timeline      |
      | table         |
      | cta           |
      | pricingTable  |
      | testimonial   |
```

### Spec 12.9: Bug Fixes

```gherkin
Feature: Block Editor Bug Fixes

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Blocks from LeftPanel have proper default data
    When I click "Heading" from the LeftPanel components tab
    Then a heading block should be added
    And the block's data should NOT be an empty object {}
    And the block's data should contain default values: level=2, text="", alignment="left", weight="bold", italic=false, underline=false, color="inherit"

  Scenario: Typing in config inputs updates preview immediately
    When I add a "heading" block and select it
    And I type "Hello World" in the text input of the config panel
    Then the preview center should display "Hello World" immediately
    And each keystroke should be reflected without requiring blur or Enter

  Scenario: Stub pages redirect correctly
    When I navigate to "/quan-tri-vien/bai-viet/tao-bai-viet"
    Then I should be redirected to "/quan-tri-vien/bai-viet/tao-moi"

    When I navigate to "/quan-tri-vien/bai-viet/chinh-sua-bai-viet"
    Then I should be redirected to "/quan-tri-vien/bai-viet"

  Scenario: Edit page has full editor layout
    Given a post exists with slug "bai-viet-mau"
    When I navigate to "/quan-tri-vien/bai-viet/bai-viet-mau"
    Then I should see the full 3-panel editor layout
    And the LeftPanel should be visible with Info and Components tabs
    And the RightPanel should be visible for block configuration

  Scenario: Dead code removed
    When I search the codebase for "useBlockEditor" import
    Then no file should import from "./useBlockEditor"
    And the file "useBlockEditor.ts" should not exist
```

---

## Spec 12.10: Block Schema Validation Tests

```gherkin
Feature: Zod Schema Validation cho Block Configs Mới

  Scenario Outline: Block schema validates new config fields
    Given the Zod schema for "<block_type>"
    When I parse a valid data object with all new config fields
    Then it should pass validation
    And the parsed output should match the input

    Examples:
      | block_type    |
      | heading       |
      | paragraph     |
      | code          |
      | callout       |
      | image         |
      | video         |
      | gallery       |
      | carousel      |
      | beforeAfter   |
      | columns       |
      | tabs          |
      | accordion     |
      | collapse      |
      | timeline      |
      | cta           |
      | pricingTable  |
      | testimonial   |

  Scenario: Unknown config fields are stripped by Zod
    When I parse a heading block with an unknown field "unknownField: 'value'"
    Then the parsed output should NOT contain "unknownField"
    And the output should only contain known schema fields
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Shared UI Components** | `Select`, `Toggle`, `TextInput`, `TextArea`, `NumberInput` dùng chung từ `block-editors.tsx` base components |
| **IconPicker** | Component mới: `apps/web/src/components/admin/block-editor/IconPicker.tsx`, dùng Lucide icons |
| **CSS Var Dropdown** | Component mới: hiển thị grid màu từ CSS variables của theme |
| **Nested Block Editor** | Component mới: `NestedBlockEditor` — expand-in-place, mỗi nested zone là 1 mini editor với sortable blocks |
| **Media API Fetch** | TestimonialId dropdown gọi `GET /api/testimonials` |
| **Enum Migration** | `rounded`, `border` trong image schema: từ `z.boolean()` → `z.enum(["none","sm","md","lg","full"])` |
| **Backward Compat** | Các field cũ giữ nguyên hoặc deprecated dần (boolean rounded → auto-migrate sang "none"/"md") |
| **Schema File** | Cập nhật `packages/types/src/schemas/blocks.ts` |
| **Default Data** | Cập nhật `getDefaultData()` trong `editorState.ts` |
| **Tests** | Cập nhật `blocks.test.ts` cho tất cả schema mới |

---

## Dependencies

- **Spec 02:** Block-Based Content Editor (base)
- **Spec 04:** Media Microservice (MediaPicker integration)
- **BLOCK-EDITOR-BRAINSTORMING.md:** Full config reference

---

## Implementation Phases

| Phase | Milestone | Deliverables |
|-------|-----------|-------------|
| **Phase 0** | Fix Critical Bugs | Bug 1-5 fix (data {}, dead code, stub pages, edit page, typing) |
| **Phase 1** | Schema Update | Cập nhật 17 block schemas + default data + tests |
| **Phase 2** | Shared UI Components | IconPicker, CSS Var Dropdown, NestedBlockEditor |
| **Phase 3** | Typography Editors | Heading, Paragraph, Quote, Code, Callout editor + renderer update |
| **Phase 4** | Media Editors | Image, Video, Gallery, Carousel, BeforeAfter editor + renderer |
| **Phase 5** | Layout Editors | Columns, Tabs editor + renderer |
| **Phase 6** | Interactive Editors | Accordion, Collapse, Timeline editor + renderer |
| **Phase 7** | Conversion Editors | CTA, Pricing, Testimonial editor + renderer |
| **Phase 8** | Renderers Complete | Implement tất cả 14 renderer stub + verify full preview |

---

## Next Steps

1. Review spec này cùng `BLOCK-EDITOR-BRAINSTORMING.md`
2. `/bdd-review` — Challenge spec trước khi implement
3. `/bdd-dev` — Implement theo từng phase
