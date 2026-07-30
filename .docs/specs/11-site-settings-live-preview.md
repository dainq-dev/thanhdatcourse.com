# Spec 11: Site Settings — Live Preview

**Status:** Draft  
**Created:** 2026-07-22  
**Parent spec:** [01-site-settings-cms](./01-site-settings-cms.md)  

---

## Feature Description

Cung cấp chế độ **split-screen live preview** cho trang Cấu hình trang (`/quan-tri-vien/cai-dat`). Bên trái là form chỉnh sửa settings, bên phải là iframe hiển thị trang web công khai **realtime 1:1**, không cần lưu xuống database. Admin gõ nội dung — web preview phản ánh ngay lập tức.

**Nguyên lý hoạt động (Option B — localStorage override):**
1. Admin gõ form → formData được ghi vào `localStorage` với key `preview_settings`
2. iframe bên phải reload → `getSiteSettings()` server-side đọc cookie/header chứa preview data từ client → merge override lên settings thật
3. Khi admin nhấn **Lưu thay đổi** → commit API → xóa `localStorage` → preview hiển thị data thật từ DB

**Preview pages có thể chuyển:**
- Trang chủ (`/`)
- Khóa học (`/khoa-hoc`)
- Bài viết (`/bai-viet`)
- Dự án (`/san-pham`)
- Công cụ (`/cong-cu`)
- Liên hệ (`/lien-he`)

---

## User Stories

### US-11.1: Admin xem live preview khi gõ settings

> **As an** Administrator  
> **I want to** see how my settings changes look on the actual website while I type  
> **So that** I don't have to save, open a new tab, and manually check every page

**Acceptance Criteria:**
- Settings page bố cục 2 cột: trái (form) — phải (preview)
- Cột phải hiển thị iframe của trang web public (default: Trang chủ)
- Admin có thể chuyển preview sang bất kỳ public page nào qua tab bar phía trên iframe
- Khi admin gõ/chỉnh sửa bất kỳ field nào trong form, iframe **tự động reload** (debounce 800ms) hiển thị nội dung mới
- Preview phản ánh **chính xác 1:1** với cách public website render (không phải mock)
- Nếu chưa có thay đổi nào, preview hiển thị data thật từ database

### US-11.2: Admin lưu settings và xác nhận trên preview

> **As an** Administrator  
> **I want to** save my settings and see the saved version in the preview  
> **So that** I'm confident the live site will show exactly what I previewed

**Acceptance Criteria:**
- Sau khi nhấn "Lưu thay đổi", localStorage bị xóa
- iframe reload và hiển thị data từ database (đã được cập nhật)
- Preview sau khi save giống hệt preview trước khi save
- Nếu có lỗi khi save, form vẫn giữ unsaved changes và hiển thị thông báo lỗi

### US-11.3: Preview hoạt động trên nhiều public page

> **As an** Administrator  
> **I want to** preview settings trên từng trang cụ thể (khóa học, blog, liên hệ...)  
> **So that** I can verify page-specific settings như `courses_page_hero_title`, `contact_page_title` đúng context

**Acceptance Criteria:**
- Tab bar phía trên iframe có các nút: Trang chủ, Khóa học, Bài viết, Dự án, Công cụ, Liên hệ
- Khi chuyển tab, iframe điều hướng đến `/khoa-hoc`, `/bai-viet`, v.v...
- Mỗi trang preview hiển thị đúng settings liên quan của nó
- Có nút "↻ Tải lại" để refresh iframe thủ công

---

## BDD Scenarios

### Scenario: Admin mở Settings page và thấy split-screen layout

```gherkin
Feature: Live Preview Settings

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"

  Scenario: Settings page shows split-screen layout
    When the page loads
    Then the layout should have two columns
    And the left column should contain the settings form
    And the right column should contain an iframe displaying the homepage
    And the iframe src should be "/"
    And the preview tab "Trang chủ" should be active

  Scenario: Default preview shows actual saved settings
    Given the database has site_title = "Minh Travel"
    When the settings page loads
    Then the left form field "site_title" should show "Minh Travel"
    And the right preview iframe should render the page with site_title = "Minh Travel"
```

### Scenario: Admin gõ và thấy preview thay đổi

```gherkin
  Scenario: Typing updates live preview
    Given I am on the Settings page
    When I type "Minh Travel v2" into the "site_title" field
    And I wait 1 second
    Then the iframe should reload
    And the preview page title should display "Minh Travel v2"

  Scenario: Multiple fields update together
    Given I am on the Settings page
    When I change "site_title" to "New Title"
    And I change "site_description" to "New Description"
    And I wait 1 second
    Then the iframe should reload
    And the preview should reflect both changes

  Scenario: Unsaved changes indicator
    Given I am on the Settings page
    When I modify any field
    Then a badge should show "N thay đổi chưa lưu"
    And the count should update as I modify more or undo fields
```

### Scenario: Admin chuyển trang preview

```gherkin
  Scenario: Switch to course page preview
    Given I am on the Settings page
    When I click the "Khóa học" preview tab
    Then the iframe src should change to "/khoa-hoc"
    And the preview should render the course listing page
    And page-specific settings like "courses_page_hero_title" should be reflected

  Scenario: Switch to contact page preview
    Given I have changed "contact_page_title" to "Liên Hệ Chúng Tôi"
    When I click the "Liên hệ" preview tab
    Then the iframe should navigate to "/lien-he"
    And the preview should show "Liên Hệ Chúng Tôi" as the page title

  Scenario: Manual reload button
    Given I am viewing the "/san-pham" preview
    When I click the "↻ Tải lại" button
    Then the iframe should reload
```

### Scenario: Admin lưu settings

```gherkin
  Scenario: Save changes and clear preview override
    Given I have modified "site_title" and "theme_color"
    And the preview reflects my unsaved changes
    When I click "Lưu thay đổi"
    Then a PUT request should be sent to "/api/settings/batch"
    And the response status should be 200
    Then the success message "Đã lưu N cài đặt" should appear
    And the unsaved changes badge should disappear
    And the iframe should reload showing saved data
    And the preview should match what I saw before saving

  Scenario: Save empty batch (no changes)
    Given I have not modified any fields
    When I click "Lưu thay đổi"
    Then the button should be disabled
    And no API request should be sent

  Scenario: Save fails and preserves unsaved changes
    Given I have modified "site_title"
    When I click "Lưu thay đổi"
    And the API returns a 500 error
    Then an error message "Lỗi khi lưu — thử lại" should appear
    And the form should still show my unsaved changes
    And the preview should still show my unsaved version
```

### Scenario: localStorage preview override mechanism

```gherkin
  Scenario: Preview data stored in localStorage
    Given I am on the Settings page
    When I modify "site_title" to "LocalStorage Test"
    Then the localStorage key "preview_settings" should contain {"site_title": "LocalStorage Test"}
    And the iframe should reload
    And the iframe should read `preview_settings` from localStorage as override

  Scenario: localStorage cleared after save
    Given I have unsaved changes in localStorage
    When I successfully save
    Then the localStorage key "preview_settings" should be removed
    And the iframe should reload
    And the preview should reflect database values (no override)

  Scenario: localStorage survives page refresh
    Given I have unsaved changes
    When I refresh the page
    Then the form fields should repopulate from localStorage if present
    And the unsaved changes indicator should still show
```

### Scenario: Search and filter settings

```gherkin
  Scenario: Search settings by keyword
    Given I am on the Settings page with 55+ fields visible
    When I type "khóa" in the search box
    Then only fields whose label or key contain "khóa" should be visible
    And other fields should be hidden

  Scenario: Search with no results
    Given I am on the Settings page
    When I type "xyzabc" in the search box
    Then a message "Không tìm thấy cài đặt nào phù hợp" should appear
    And the save button should be disabled (no visible fields to save)
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Preview mechanism** | iframe với `localStorage` override pattern |
| **Debounce** | 800ms sau lần gõ cuối cùng mới reload iframe |
| **localStorage key** | `preview_settings` — JSON object `{ key: value, ... }` |
| **Settings page layout** | CSS Grid 2 cột: `grid-template-columns: 1fr 1fr` với min-width cho mỗi cột |
| **Preview pages** | 6 pages: `/`, `/khoa-hoc`, `/bai-viet`, `/san-pham`, `/cong-cu`, `/lien-he` |
| **getSiteSettings() override** | Check header `X-Preview-Settings` hoặc cookie từ client trước khi fetch API |
| **Responsive** | Dưới 1024px: preview chuyển xuống dưới form (single column), iframe height = 60vh |
| **Fields scroll** | Cột trái form scroll độc lập với cột phải preview |
| **Auth** | Trang settings yêu cầu JWT admin token (đã có trong layout guard) |

---

## Implementation Notes

### Flow: onChange → preview update

```
Admin gõ field
  → setFormData(newState)
  → localStorage.setItem("preview_settings", JSON.stringify(formData))
  → debounce 800ms
  → setPreviewKey(k + 1)  // trigger iframe remount
  → iframe loads, client-side reads localStorage, passes override via cookie/header
  → getSiteSettings() server-side merges override
```

### Flow: Save → commit

```
Admin click "Lưu thay đổi"
  → PUT /api/settings/batch
  → on success:
      setSettings(formData)
      localStorage.removeItem("preview_settings")
      setPreviewKey(k + 1)  // reload without override
  → on error:
      keep localStorage intact
      show error toast
```

### File changes needed

| File | Change |
|---|---|
| `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` | Split-screen layout, iframe, localStorage logic |
| `apps/web/src/app/quan-tri-vien/cai-dat/page.module.scss` | 2-column grid, preview panel styles |
| `apps/web/src/lib/settings.ts` | Accept preview override from cookie/header |

---

## Dependencies

- **Spec 01:** Site Settings CMS (settings API, form fields)
- **Spec 09:** Authentication (JWT admin guard)
- **Spec 10:** Admin Dashboard Shell (sidebar layout)

---

## Next Steps

1. `/bdd-review` — Challenge spec trước khi implement
2. `/bdd-dev` — Implement theo TDD
