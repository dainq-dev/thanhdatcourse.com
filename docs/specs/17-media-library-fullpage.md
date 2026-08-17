# Spec 17: Media Library Full-Page Admin

**Status:** Draft
**Created:** 2026-08-09
**Ref Brainstorming:** `.docs/brainstorming-4-admin-modules.md`
**Related Spec:** `.docs/specs/04-media-microservice.md`
**Related Component:** `apps/web/src/components/admin/media-manager/`

---

## Feature Description

Nâng cấp trang `/quan-tri-vien/media` từ stub rỗng thành full-page Media Library admin. Tận dụng MediaManager component đã có sẵn (hiện đang là modal) và mở rộng thành full-page với các tính năng: upload kéo-thả, paste từ clipboard, bulk select/delete, panel chi tiết, copy URL variant, sắp xếp, và upload folder.

---

## User Stories

### US-17.1: Admin duyệt và tìm kiếm media

> **As an** Administrator
> **I want to** browse and search all media files
> **So that** I can quickly find the assets I need

**Acceptance Criteria:**
- Grid masonry hiển thị tất cả media files
- Filter tabs: Tất cả / Ảnh / Video / YouTube
- Search bar: tìm theo tên file hoặc alt text (debounced 300ms)
- Pagination (40 items/page)
- Mỗi grid item: thumbnail preview, tên file (truncated), loại file icon
- Hover: hiển thị kích thước, ngày upload

### US-17.2: Admin upload file

> **As an** Administrator
> **I want to** upload files through multiple methods
> **So that** I can add media efficiently

**Acceptance Criteria:**
- **Click upload:** Nút "Tải lên" → chọn file từ máy
- **Drag-and-drop:** Kéo file từ desktop vào page → tự động upload
- **Paste từ clipboard:** Ctrl+V paste ảnh đã copy → upload
- **Upload folder:** Kéo folder → upload tất cả file trong folder
- Upload progress: progress bar hoặc % cho từng file đang upload
- Upload batch: cho phép chọn nhiều file cùng lúc
- Sau upload: thumbnail mới xuất hiện ở đầu grid ngay lập tức
- Hỗ trợ: JPEG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM, PDF

### US-17.3: Admin xem chi tiết và chỉnh sửa media

> **As an** Administrator
> **I want to** view media details and edit metadata
> **So that** I can manage alt text and copy different image sizes

**Acceptance Criteria:**
- Click 1 media item → mở panel chi tiết bên phải (hoặc modal)
- Panel hiển thị:
  - Preview lớn của ảnh/video
  - Tên file gốc, kích thước (KB/MB), kích thước ảnh (W×H)
  - MIME type, ngày upload
  - Alt text (editable inline, PATCH `/api/media/:id`)
  - Danh sách variants với kích thước + nút "Copy URL"
  - Nút "Copy Link" cho từng variant (thumbnail, medium, large, original)
- Double-click tên file trong grid → edit alt text inline

### US-17.4: Admin xóa media (single + bulk)

> **As an** Administrator
> **I want to** delete media files
> **So that** I can clean up unused or incorrect uploads

**Acceptance Criteria:**
- **Single delete:** Click "Xóa" trên 1 item → ConfirmDialog → DELETE
- **Bulk select:** Checkbox mode → chọn nhiều items → "Xóa đã chọn" → ConfirmDialog → DELETE từng cái
- Sau xóa: grid tự refresh
- File trên disk + variants + DB records đều bị xóa (backend đã handle)

### US-17.5: Admin đăng ký YouTube video

> **As an** Administrator
> **I want to** register YouTube videos as media references
> **So that** I can use YouTube thumbnails in courses and posts

**Acceptance Criteria:**
- Form nhỏ: paste YouTube URL → auto-extract video ID → lưu vào media DB (source = "youtube")
- YouTube thumbnail tự động fetch từ `https://img.youtube.com/vi/{id}/hqdefault.jpg`
- Item xuất hiện trong grid với tab "YouTube" filter

### US-17.6: Admin sắp xếp media

> **As an** Administrator
> **I want to** sort media by different criteria
> **So that** I can organize my library

**Acceptance Criteria:**
- Sort options: Mới nhất (default), Cũ nhất, Tên A-Z, Tên Z-A, Dung lượng lớn nhất
- Sort không reload page, chỉ re-fetch API với order param
- **Backend change needed:** Thêm query param `?sort=newest|oldest|name_asc|name_desc|size_desc` vào GET `/api/media`

---

## BDD Scenarios

### Feature: Media Library Full-Page

```gherkin
Feature: Media Library Full-Page Admin

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/media"

  Scenario: View media grid (happy path)
    Given there are 50 media files in the library
    When the page loads
    Then I should see a grid of 40 media items (page 1)
    And pagination shows "1 / 2"
    And each item shows a thumbnail preview and file name

  Scenario: Filter by type (happy path)
    When I click filter tab "Ảnh"
    Then the grid shows only image files (mime_type LIKE 'image/%')
    When I click filter tab "Video"
    Then the grid shows only video files
    When I click filter tab "YouTube"
    Then the grid shows only YouTube references

  Scenario: Search by name (happy path)
    Given there is a file "banner-hero.webp"
    When I type "banner" in the search bar
    Then after 300ms, the grid shows only files matching "banner"
    And "banner-hero.webp" is visible

  Scenario: Search no results (edge case)
    When I type "xyznonexistent" in the search bar
    Then the grid shows empty state "Không tìm thấy file nào"

  Scenario: Pagination navigation
    Given there are 80 media files
    When I click "Sau →"
    Then page 2 loads with remaining files
    And the "← Trước" button is enabled
    When I click "← Trước"
    Then page 1 loads again

  Scenario: Empty library
    Given there are 0 media files
    When the page loads
    Then I should see "Chưa có file nào"
    And "Tải lên ảnh hoặc video để bắt đầu"


Feature: Media Upload

  Background:
    Given I am on "/quan-tri-vien/media"

  Scenario: Upload via button click (happy path)
    When I click "Tải lên"
    And I select 3 image files from my computer
    Then for each file, a progress bar appears
    And after all 3 complete, the grid refreshes showing the new files at the top

  Scenario: Drag-and-drop upload (happy path)
    When I drag a file "photo.jpg" from my desktop
    And I drop it onto the upload zone
    Then the file is uploaded
    And "photo.jpg" appears in the grid

  Scenario: Paste from clipboard (happy path)
    Given I have an image copied to clipboard
    When I press Ctrl+V on the page
    Then the image is uploaded
    And appears in the grid

  Scenario: Upload unsupported file type (error path)
    When I try to upload "document.exe"
    Then I should see error "Định dạng file không được hỗ trợ"

  Scenario: Upload file too large (error path)
    When I try to upload a 600MB video file
    Then I should see error "Kích thước file vượt quá giới hạn (tối đa 500MB)"

  Scenario: Upload folder
    When I drag a folder containing 10 images onto the upload zone
    Then all 10 images are uploaded
    And the grid shows 10 new items


Feature: Media Detail Panel

  Background:
    Given I am on "/quan-tri-vien/media"
    And there is an image file "hero-banner.webp" (1920×1080, 245KB)

  Scenario: Open detail panel (happy path)
    When I click on "hero-banner.webp"
    Then a detail panel opens on the right side
    And it shows:
      - Large preview of the image
      - File name: "hero-banner.webp"
      - Size: "245 KB"
      - Dimensions: "1920 × 1080"
      - Upload date
      - Alt text field (editable)
    And a list of variant URLs with "Copy" buttons

  Scenario: Edit alt text inline (happy path)
    Given the detail panel is open for "hero-banner.webp"
    When I type "Hero banner for homepage" in the alt text field
    And I press Enter or click outside
    Then PATCH /api/media/:id is called with alt_text = "Hero banner for homepage"
    And a brief "Đã lưu" indicator appears

  Scenario: Copy variant URL
    Given the detail panel is open
    When I click "Copy" next to the "medium" variant
    Then the URL is copied to clipboard
    And a toast "Đã copy URL" appears

  Scenario: Close detail panel
    When I click the close button or click another area
    Then the detail panel closes


Feature: Media Delete

  Background:
    Given I am on "/quan-tri-vien/media"

  Scenario: Delete single file (happy path)
    Given there is a file "old-banner.jpg"
    When I click "Xóa" on "old-banner.jpg"
    Then a ConfirmDialog appears: "Bạn có chắc muốn xóa file 'old-banner.jpg'?"
    When I click "Xóa" to confirm
    Then DELETE /api/media/:id is called
    And the file is removed from the grid
    And a toast "Đã xóa" appears

  Scenario: Cancel delete
    When I click "Xóa" on a file
    And I click "Hủy" in the dialog
    Then the file remains in the grid

  Scenario: Bulk select and delete (happy path)
    When I click "Chọn nhiều" to enter multi-select mode
    And I check 3 files
    And I click "Xóa 3 file đã chọn"
    Then a ConfirmDialog appears: "Bạn có chắc muốn xóa 3 file?"
    When I confirm
    Then all 3 files are deleted
    And the grid refreshes


Feature: YouTube Registration

  Background:
    Given I am on "/quan-tri-vien/media"

  Scenario: Register YouTube video (happy path)
    When I click "Thêm YouTube"
    And I paste URL "https://youtu.be/dQw4w9WgXcQ"
    And I click "Lưu"
    Then POST /external is called with youtube URL
    And a new item appears in the grid under "YouTube" tab
    And the item shows the YouTube thumbnail

  Scenario: Invalid YouTube URL (error path)
    When I click "Thêm YouTube"
    And I paste "not-a-valid-url"
    And I click "Lưu"
    Then I should see error "URL YouTube không hợp lệ"


Feature: Media Sorting

  Scenario: Sort by newest (default)
    Given there are files uploaded on different dates
    When the page loads
    Then files are sorted by upload date, newest first

  Scenario: Sort by name A-Z
    When I select sort "Tên A-Z"
    Then files are re-sorted alphabetically by name

  Scenario: Sort by size
    When I select sort "Dung lượng lớn nhất"
    Then files are re-sorted by file size descending
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Component Base** | `MediaManager` (có sẵn ở `components/admin/media-manager/index.tsx`) |
| **Refactor cần** | Tách MediaManager thành 2 mode: modal (giữ nguyên) + full-page (new) |
| **API** | Media service port 3002 — GET/POST/PATCH/DELETE `/api/media`, POST `/upload`, POST `/external` |
| **Upload** | Multipart form data, max 50MB ảnh, 500MB video |
| **Progress** | Dùng XMLHttpRequest + `progress` event (fetch API không hỗ trợ upload progress) |
| **Clipboard** | `navigator.clipboard.read()` + `ClipboardItem` API |
| **Drag-and-drop** | HTML5 Drag and Drop API + `dataTransfer.files` |
| **Grid** | CSS Grid masonry hoặc CSS columns cho layout ảnh đa kích thước. Do kích thước ảnh không đồng nhất trong masonry layout, mỗi grid item sẽ có aspect-ratio cố định (1:1 square) hoặc dùng chiều cao cố định với object-fit: cover, tránh layout shift. |
| **Video items** | Video trong grid hiển thị icon play + nền tối. Click để mở preview panel (không tự động play). |
| **Bulk delete safety** | Khi xóa file, kiểm tra xem file có đang được sử dụng ở đâu không (course thumbnail, post image, site settings...) trước khi xóa. Nếu có → hiển thị cảnh báo. Implementation: backend check khi DELETE, client chỉ xác nhận 1 lần. |

---

## Existing Component Audit

```
MediaManager (336 dòng) — ĐÃ CÓ:
  ✅ Modal overlay
  ✅ Grid thumbnail
  ✅ Filter tabs (all/image/video/youtube)
  ✅ Search (debounced)
  ✅ Pagination
  ✅ Upload button (single file, no progress)
  ✅ Delete with confirm
  ✅ Preview bar (single file)
  ✅ Multi-select mode

MediaTrigger (49 dòng) — ĐÃ CÓ:
  ✅ Button trigger mở modal
  ✅ Preview thumbnail của giá trị hiện tại

CẦN THÊM cho full-page mode:
  ❌ Drag-and-drop upload zone
  ❌ Paste from clipboard
  ❌ Upload progress bar (XMLHttpRequest)
  ❌ Bulk delete UI
  ❌ Detail panel (alt text edit, variant URLs, copy button)
  ❌ Sort dropdown
  ❌ YouTube registration form
```

---

## API Endpoints (Media Service — đã có sẵn)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/media` | Admin | List (query: type, search, page, limit) |
| `GET` | `/api/media/:id` | Admin | Get single + variants |
| `PATCH` | `/api/media/:id` | Admin | Update altText |
| `DELETE` | `/api/media/:id` | Admin | Delete file + variants |
| `POST` | `/upload` | Admin | Upload file |
| `POST` | `/external` | Admin | Register YouTube/external URL |

---

## Dependencies

- Spec 04 (Media Microservice — backend đã hoàn chỉnh)
- `MediaManager` component hiện tại (cần refactor để hỗ trợ full-page mode)

---

## Next Steps

`/bdd-review` → `/bdd-dev`
