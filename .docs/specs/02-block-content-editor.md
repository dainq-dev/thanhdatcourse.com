# Spec 02: Block-Based Content Editor

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 9  

---

## Feature Description

Thay thế Rich Text Editor (textarea HTML) bằng **Block-Based Content Editor** — admin tạo nội dung bằng cách thêm các block component: Heading, Paragraph, Image, Video, Gallery, Carousel, Accordion, CTA, Pricing Table, Columns... Mỗi block có cấu hình riêng. Nội dung được lưu dưới dạng JSON structured, render bằng React component tương ứng.

**21+ Block Types** chia thành 5 nhóm:
- **Typography:** heading, paragraph, quote, list, code, callout
- **Media:** image, video, gallery, carousel, beforeAfter
- **Layout:** divider, spacer, columns, tabs
- **Interactive:** accordion, collapse, timeline, table
- **Conversion:** cta, pricingTable, testimonial

---

## User Stories

### US-02.1: Admin tạo bài viết với Block Editor

> **As an** Administrator  
> **I want to** compose an article by adding and arranging content blocks  
> **So that** I can create visually rich, structured content without writing HTML

**Acceptance Criteria:**
- Mở trang tạo bài viết → hiển thị Block Editor với 1 paragraph block mặc định
- Thanh công cụ "+" ở đầu trang cho phép chọn block type từ dropdown phân nhóm
- Gõ `/` (slash command) trong block text để quick-add block mới
- Mỗi block có toolbar: drag handle, block type label, style options, delete button
- Hover giữa 2 blocks hiện nút "+" để chèn block vào giữa
- Có khung Preview bên cạnh (hoặc toggle chế độ Preview)

### US-02.2: Admin thêm và cấu hình từng Block Type

**Heading Block:**
> **As an** Administrator  
> **I want to** add heading blocks at different levels (H1-H6)  
> **So that** I can structure my content hierarchically

**Acceptance Criteria:**
- Chọn "Heading" từ menu → hiện input text + level selector (H1→H6 dropdown)
- Có alignment option: left, center, right
- Gõ `#` + space để tạo H1, `##` + space → H2 (Markdown-style shortcut)

**Image Block:**
> **As an** Administrator  
> **I want to** insert images from Media Library  
> **So that** my articles have visual elements

**Acceptance Criteria:**
- Chọn "Image" → hiện placeholder + nút "Chọn ảnh"
- Click "Chọn ảnh" mở Media Library modal (từ Spec 04)
- Sau khi chọn: hiển thị preview ảnh, caption input, width selector (full/wide/contained/inline)
- Có option border, rounded corners

**Video Block:**
> **As an** Administrator  
> **I want to** embed YouTube videos  
> **So that** I can include video tutorials in my content

**Acceptance Criteria:**
- Chọn "Video" → input để paste YouTube URL (hoặc chọn từ Media Library YouTube items)
- Tự động parse video ID, hiển thị preview thumbnail
- Option: aspect ratio (16:9, 4:3, 9:16, 1:1), caption, autoplay toggle

**Accordion Block:**
> **As an** Administrator  
> **I want to** create FAQ-style expandable sections  
> **So that** long content is organized and scannable

**Acceptance Criteria:**
- Chọn "Accordion" → hiện 1 accordion item với title input + nested block editor (có thể chứa paragraph, image, list...)
- Nút "+" để thêm item mới
- Option: allowMultiple (cho phép mở nhiều item cùng lúc)
- Title có thể chứa inline formatting (bold, italic)

**Columns Block:**
> **As an** Administrator  
> **I want to** create multi-column layouts  
> **So that** I can place content side by side

**Acceptance Criteria:**
- Chọn "Columns" → hiện selector 2/3/4 columns
- Mỗi column là 1 nested block editor (có thể chứa bất kỳ block nào)
- Drag divider để resize column width
- Gap option: sm/md/lg
- Responsive: trên mobile tự collapse thành 1 column

### US-02.3: Admin sắp xếp lại blocks bằng Drag & Drop

> **As an** Administrator  
> **I want to** reorder blocks by dragging them  
> **So that** I can easily restructure my content

**Acceptance Criteria:**
- Mỗi block có drag handle (⠿⋮⋮) bên trái
- Drag block lên/xuống → các block khác tự động shift
- Drop zone highlight khi drag qua
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) cho mọi thao tác (thêm, xóa, sắp xếp, edit)
- Tối thiểu 50 bước undo history

### US-02.4: Frontend render Block Content thành HTML

> **As a** Website Visitor  
> **I want to** see beautifully rendered content from blocks  
> **So that** the reading experience is professional and consistent

**Acceptance Criteria:**
- `BlockRenderer` component nhận `blocks: Block[]` và render từng block bằng component tương ứng
- Mỗi block type có SCSS module riêng, responsive
- Blocks có animation (fade-in on scroll) bằng GSAP
- Unknown block types → log warning, không crash trang
- Empty blocks array → render nothing (không hiện lỗi)

---

## BDD Scenarios

```gherkin
Feature: Block-Based Content Editor

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet/tao-moi"

  Scenario: Editor loads with default paragraph block
    When the page loads
    Then I should see a single paragraph block with placeholder "Bắt đầu nhập nội dung..."
    And the "+" button should be visible above the block
    And typing should directly edit the paragraph content

  Scenario: Add a heading block via menu
    When I click the "+" button at the top
    Then a dropdown menu should appear with block type categories
    And "Typography" category should contain: Heading, Paragraph, Quote, List, Code, Callout
    When I click "Heading"
    Then a new heading block should appear below the paragraph block
    And the block should have a level selector defaulting to H2
    And the block should have text input with placeholder "Tiêu đề..."

  Scenario: Add a block via slash command
    Given I am typing in a paragraph block
    When I type "/heading" and press Enter
    Then the current paragraph block should be replaced by a heading block
    And the typed "/heading" text should be removed

  Scenario: Add an image block from Media Library
    When I click "+" and select "Image"
    Then an image block should appear with a placeholder
    When I click "Chọn ảnh" in the image block toolbar
    Then the Media Library modal should open (from media microservice)
    When I select image "abc-123" from the library
    Then the modal should close
    And the image block should show a preview of the selected image
    And the block data should contain: mediaId = "abc-123"

  Scenario: Add a video block
    When I click "+" and select "Video"
    And I paste "https://www.youtube.com/watch?v=dQw4w9WgXcQ" into the video URL input
    And I press Enter
    Then the block should auto-extract the video ID "dQw4w9WgXcQ"
    And the block should show a thumbnail preview
    And aspect ratio should default to "16:9"

  Scenario: Drag to reorder blocks
    Given I have 3 blocks: Heading, Paragraph, Image
    When I drag the Image block (3rd) above the Paragraph block (2nd)
    Then the order should become: Heading, Image, Paragraph
    And the block IDs should remain unchanged (only order changes)

  Scenario: Delete a block
    Given I have a Callout block selected
    When I click the delete (🗑️) button in the block toolbar
    Then the block should be removed
    And the blocks below should shift up
    When I press Ctrl+Z
    Then the deleted block should reappear at its original position

  Scenario: Undo/Redo across multiple operations
    Given I have a paragraph block
    When I add a heading block
    And I add an image block
    And I press Ctrl+Z
    Then the image block should be removed
    When I press Ctrl+Z again
    Then the heading block should be removed
    When I press Ctrl+Shift+Z
    Then the heading block should reappear

  Scenario: Columns block with nested content
    When I add a "Columns" block with 2 columns
    Then the block should show 2 side-by-side column zones
    And each column should have its own "+" button to add blocks
    When I add a Paragraph in column 1 and an Image in column 2
    Then both blocks should be visible in their respective columns

  Scenario: Accordion block with nested blocks
    When I add an "Accordion" block
    Then one accordion item should appear with title input and nested editor
    When I add a Paragraph and an Image inside the accordion item
    Then both nested blocks should render inside the accordion
    When I click "+" to add a second accordion item
    Then a second title + empty editor should appear

  Scenario: Save blocks as JSON
    When I have composed content with 3 blocks
    And I click "Lưu nháp"
    Then the blocks should be serialized as a JSON array
    And each block must have: id (UUID), type (string), data (object)
    And the JSON should be valid and parseable
    And the JSON should be saved to the "content_blocks" column in the database

  Scenario: Load saved blocks back into editor
    Given the database has a post with content_blocks containing a Heading and Image
    When I open the post for editing
    Then the editor should display the Heading block with its text
    And the editor should display the Image block with its preview
    And the block order should match the saved order
```

### Block Type-Specific Scenarios

```gherkin
  Scenario Outline: Each block type has required data fields
    Given I add a "<block_type>" block
    When the block renders in the editor
    Then it should show the appropriate editor UI for its type

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

  Scenario: Gallery block requires minimum 2 images
    When I add a "Gallery" block
    And I select only 1 image from Media Library
    Then an error message should show "Cần ít nhất 2 ảnh cho Gallery"
    And the save button should be disabled for this block
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Storage Format** | JSON array `Block[]` lưu trong cột `content_blocks TEXT` |
| **Zod Schema** | Discriminated union — `packages/types/src/schemas/blocks.ts` |
| **Block IDs** | UUID v4, generated client-side khi tạo block mới |
| **Nested Blocks** | `columns`, `accordion`, `tabs`, `collapse` hỗ trợ nested `Block[]` |
| **Recursive Type** | Zod schema dùng `z.lazy()` cho recursive reference |
| **Drag & Drop** | Sử dụng thư viện `@dnd-kit/core` (nhẹ, tree-shakeable) |
| **Undo/Redo** | Custom hook `useUndoHistory<Block[]>` với max 50 steps |
| **Block Toolbar** | Hiện khi hover/focus block, position absolute không ảnh hưởng layout |
| **Media Integration** | Image/Video/Gallery blocks mở modal từ Media Library (Spec 04) |
| **Performance** | Editor chỉ render blocks trong viewport + 2 blocks buffer (virtual scroll nếu >50 blocks) |

---

## Dependencies

- **Spec 04:** Media Microservice (Media Library modal)
- **Spec 05:** Blog & Article Management (nơi sử dụng editor)
- **Spec 03:** Course Management (nơi sử dụng editor cho course content)
- **Blueprint section:** 9

---

## Next Steps

1. `/bdd-review` — Challenge spec trước khi implement
2. `/bdd-dev` — Implement: Zod schemas → BlockRenderer → Block Editor Admin UI → Integration
