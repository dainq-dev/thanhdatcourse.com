# Spec 22: Admin Panel Bugfix — Toggle, Media Manager, Homepage Visibility & Fetch Unification

**Status:** Draft
**Created:** 2026-08-17
**Ref Report:** `.docs/admin-audit-report-2026-08-17.md`
**Scope:** Fix các bug CRITICAL/HIGH đã xác nhận bằng static audit ở phần quản trị viên + homepage concept.

---

## Feature Description

Sửa các tính năng đang hỏng hoặc lệch contract giữa frontend và backend trong phần quản trị viên:

1. Toggle bật/tắt khuyến mãi (hiện không hoạt động do contract `is_active` lệch).
2. Media manager: bulk delete, thêm YouTube video, thumbnail YouTube, variant "full".
3. Toggle visibility các section homepage (hiện không bao giờ ẩn được do so sánh sai kiểu dữ liệu).
4. Bộ lọc "Nháp" bài viết (không hoạt động do backend thiếu param `draft`).
5. Thống nhất fetch/env (bỏ raw fetch + `process.env` thủ công).

---

## User Stories

### US-22.1: Admin bật/tắt khuyến mãi

> **As an** Administrator
> **I want to** toggle a promotion active/inactive from the list
> **So that** I can stop an ongoing campaign immediately

**Acceptance Criteria:**
- Nút "Tắt" gửi `PATCH /api/promotions/:id/toggle` với body `{ is_active: false }`.
- Nút "Bật" gửi `{ is_active: true }`.
- Sau khi toggle thành công, list reload và trạng thái badge cập nhật.
- Khi request fail, hiển thị thông báo lỗi (không nuốt lỗi im lặng).

**Files:**
- `apps/web/src/app/quan-tri-vien/khuyen-mai/page.tsx` (sửa `handleToggle`)

### US-22.2: Media manager bulk delete

> **As an** Administrator
> **I want to** delete multiple media files at once
> **So that** I can clean up the library faster

**Acceptance Criteria:**
- Backend có route `DELETE /api/media/bulk` nhận body `{ ids: string[] }`.
- Xóa cả file trên disk lẫn DB record (cascade variants) cho từng id.
- Frontend gọi đúng route `/api/media/bulk` (đang gọi nhầm, backend chưa có).

**Files:**
- `apps/media/src/routes/media.ts` (thêm route bulk)
- `apps/web/src/components/admin/media-manager/index.logic.ts` (giữ nguyên nếu đúng, verify)

### US-22.3: Thêm video YouTube vào media library

> **As an** Administrator
> **I want to** add a YouTube video by URL into the media library
> **So that** I can reference YouTube videos alongside uploaded files

**Acceptance Criteria:**
- Frontend `addYoutubeVideo` gọi `POST /external` với body `{ source: "youtube", url }`.
- Backend extract video ID và trả về media record.
- Không còn gọi `POST /api/media/youtube` (route không tồn tại).

**Files:**
- `apps/web/src/components/admin/media-manager/index.logic.ts`

### US-22.4: Thumbnail YouTube đúng URL

> **As an** Administrator
> **I want to** see the correct YouTube thumbnail in the media grid
> **So that** I can identify YouTube entries visually

**Acceptance Criteria:**
- `getMediaUrl` dùng `youtubeId` (không phải `diskPath`) để tạo URL `https://img.youtube.com/vi/{youtubeId}/hqdefault.jpg`.
- `MediaFile` type bổ sung field `youtubeId`.

**Files:**
- `apps/web/src/components/admin/media-manager/types.ts`
- `apps/web/src/components/admin/media-manager/index.logic.ts`

### US-22.5: Variant "full" cho ảnh

> **As an** Administrator
> **I want to** copy the full-size image URL from media detail
> **So that** I can use the original resolution

**Acceptance Criteria:**
- `getMediaVariantUrls` không còn liệt kê variant `full` (không tồn tại trong `IMAGE_VARIANTS`).
- Thay bằng variant `large` (đã tồn tại).
- URL trả về resolve được (không 404).

**Files:**
- `apps/web/src/components/admin/media-manager/index.logic.ts`

### US-22.6: Toggle visibility section homepage

> **As an** Administrator
> **I want to** hide/show homepage sections (Dự án, Sản phẩm, Số liệu, Giới thiệu)
> **So that** I can control which sections appear on the homepage

**Acceptance Criteria:**
- Toggle lưu `"1"` (bật) / `"0"` (tắt) — giữ nguyên.
- Section component check `!== "0"` (thay vì `!== "false"` hiện tại).
- Khi toggle tắt, section biến mất khỏi homepage.
- Khi chưa set (value `undefined`), section mặc định hiển thị.
- Áp dụng cho cả 4 section: WorkSection, ProductSection, CounterSection, AboutSection (2 section sau hiện không đọc toggle).

**Files:**
- `apps/web/src/components/sections/work-section/index.tsx`
- `apps/web/src/components/sections/product-section/index.tsx`
- `apps/web/src/components/sections/counter-section/index.tsx` (thêm check)
- `apps/web/src/components/sections/about-section/index.tsx` (thêm check)

### US-22.7: Bộ lọc "Nháp" bài viết

> **As an** Administrator
> **I want to** filter blog posts by "Nháp" status
> **So that** I can find unpublished posts

**Acceptance Criteria:**
- Backend `GET /api/posts` hỗ trợ param `draft` (boolean), tương tự `courses.ts`.
- Khi `draft=true` và admin: trả về bài viết `is_published = 0`.
- Frontend gửi `draft=true` khi chọn filter "Nháp".

**Files:**
- `apps/api/src/routes/posts.ts` (thêm `draft` vào PostQuerySchema + logic)
- `apps/web/src/app/quan-tri-vien/bai-viet/page.tsx` (đã gửi draft, verify)

### US-22.8: Thống nhất fetch & env

> **As a** Developer
> **I want to** have a single source of truth for API/media base URL
> **So that** I stop duplicating env reads and raw fetch calls

**Acceptance Criteria:**
- Tạo `apps/web/src/lib/env.ts` export `API_URL` và `MEDIA_URL` (đọc `NEXT_PUBLIC_*` 1 lần, fallback tập trung).
- `lib/api.ts`, `lib/media-url.ts`, `media-manager/index.logic.ts` import từ `env.ts`.
- 3 chỗ raw fetch chuyển sang `api` client:
  - `xac-thuc/dang-nhap/page.tsx` → `api.submit("/api/auth/login", {...})`
  - `quan-tri-vien/layout.tsx` → `api.get("/api/auth/me")` (bonus: tự check `res.ok`)
  - `sections/promotion-banner/index.tsx` → `api.publicGet("/api/promotions/homepage-banner")`

**Files:**
- `apps/web/src/lib/env.ts` (mới)
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/media-url.ts`
- `apps/web/src/components/admin/media-manager/index.logic.ts`
- `apps/web/src/app/xac-thuc/dang-nhap/page.tsx`
- `apps/web/src/app/quan-tri-vien/layout.tsx`
- `apps/web/src/components/sections/promotion-banner/index.tsx`

---

## BDD Scenarios

### Feature: Promotion Toggle

```gherkin
Feature: Promotion Toggle

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khuyen-mai"
    And a promotion "SUMMER2026" is active (is_active = 1)

  Scenario: Deactivate an active promotion
    When I click "Tắt" on "SUMMER2026"
    Then PATCH /api/promotions/:id/toggle is called with body { is_active: false }
    And the list reloads
    And "SUMMER2026" status badge shows "Không hoạt động"

  Scenario: Activate an inactive promotion
    Given a promotion "WINTER" is inactive (is_active = 0)
    When I click "Bật" on "WINTER"
    Then PATCH /api/promotions/:id/toggle is called with body { is_active: true }
    And the list reloads
    And "WINTER" status badge shows "Đang hoạt động"

  Scenario: Toggle fails gracefully
    Given the toggle request returns 400
    When I click "Tắt"
    Then an error message is shown
    And the previous status remains displayed
```

### Feature: Media Manager

```gherkin
Feature: Media Manager

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/media"

  Scenario: Bulk delete media
    Given 3 media files are selected
    When I click "Xóa đã chọn"
    Then DELETE /api/media/bulk is called with { ids: [3 ids] }
    And the 3 files are removed from the grid
    And their disk files and variants are deleted

  Scenario: Add YouTube video by URL
    When I paste "https://www.youtube.com/watch?v=abc123def45" and click "Thêm"
    Then POST /external is called with { source: "youtube", url }
    And a new YouTube media entry appears in the grid
    And its thumbnail shows https://img.youtube.com/vi/abc123def45/hqdefault.jpg

  Scenario: YouTube thumbnail URL resolution
    Given a media entry has source "youtube" and youtubeId "abc123def45"
    When the grid renders that entry
    Then its thumbnail src is https://img.youtube.com/vi/abc123def45/hqdefault.jpg

  Scenario: Copy full image variant URL
    Given an uploaded image media entry
    When I open its detail panel
    Then the "Full" variant URL resolves to /img/:id/large (not /img/:id/full)
```

### Feature: Homepage Section Visibility

```gherkin
Feature: Homepage Section Visibility

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"

  Scenario: Hide "Dự án nổi bật" section
    Given the toggle "Hiển thị mục này" for "Mục Dự án nổi bật" is ON
    When I toggle it OFF
    And I save
    Then home_work_section_visible is saved as "0"
    And the WorkSection is not rendered on the homepage

  Scenario: Hide "Số liệu" section
    When I toggle OFF "Số liệu"
    And I save
    Then home_counters_section_visible is saved as "0"
    And the CounterSection is not rendered on the homepage

  Scenario: Section visible by default
    Given home_work_section_visible is not set
    When the homepage renders
    Then the WorkSection is rendered

  Scenario: Toggle ON re-shows section
    Given home_work_section_visible is "0"
    When I toggle ON "Mục Dự án nổi bật" and save
    Then home_work_section_visible is "1"
    And the WorkSection is rendered
```

### Feature: Blog Post Draft Filter

```gherkin
Feature: Blog Post Draft Filter

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/bai-viet"
    And there are 2 published posts and 1 draft post

  Scenario: Filter drafts
    When I select filter "Nháp"
    Then GET /api/posts is called with draft=true
    And only the draft post is shown

  Scenario: Filter all
    When I select filter "Tất cả"
    Then all 3 posts are shown

  Scenario: Filter published
    When I select filter "Đã xuất bản"
    Then GET /api/posts is called with published=true
    And only the 2 published posts are shown
```

### Feature: Fetch Unification

```gherkin
Feature: Fetch Unification

  Scenario: Login uses api client
    Given I am on the login page
    When I submit credentials
    Then the request goes through api.submit("/api/auth/login", ...)
    And no direct fetch or NEXT_PUBLIC_API_URL is referenced in the page

  Scenario: Admin guard uses api client
    Given the admin layout loads
    When it checks the current user
    Then the request goes through api.get("/api/auth/me")
    And an invalid token redirects to login (via ApiError)

  Scenario: Promotion banner uses api client
    Given the homepage renders
    When the promotion banner fetches data
    Then the request goes through api.publicGet("/api/promotions/homepage-banner")

  Scenario: Single env source
    Given the codebase
    Then NEXT_PUBLIC_API_URL and NEXT_PUBLIC_MEDIA_URL are read only in lib/env.ts
```

---

## Edge Cases

| # | Case | Expected |
|---|------|----------|
| 1 | Toggle visibility value là `"false"` (data cũ) | Xử lý như tắt (backward compatible): `!== "0" && !== "false"` |
| 2 | Bulk delete gửi `ids: []` | Trả về success, không xóa gì |
| 3 | Bulk delete id không tồn tại | Bỏ qua id đó, xóa các id còn lại |
| 4 | YouTube URL không hợp lệ | Backend trả 400, frontend hiện lỗi |
| 5 | `draft=true` nhưng user không phải admin | Bỏ qua draft filter, chỉ trả published |
| 6 | `MEDIA_URL` không set (local dev) | Fallback `http://localhost:3002` tập trung ở env.ts |

---

## Out of Scope (làm sau, không trong spec này)

- Wire homepage engines (M2-M8 report) — cần spec riêng vì liên quan kiến trúc template/engine.
- Implement template cinematic thật.
- Ghi chú lead (H3), debounce tìm kiếm (H2), type `any` (H4), auto-save chồng (H5), pagination sau delete (H6).
- Extract shared list component (P4).
