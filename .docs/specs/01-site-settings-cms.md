# Spec 01: Site Settings CMS

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.1, Section 5.3  

---

## Feature Description

Cho phép Administrator cấu hình **toàn bộ text, link, brand, navigation** của website thông qua 1 trang Settings duy nhất trong Admin Dashboard. Mỗi setting là 1 key-value pair lưu trong bảng `site_settings`. Không cần deploy code khi muốn đổi nội dung.

**55 site_settings keys** được nhóm thành 6 tabs:
1. **Thông tin chung** — site_title, site_description, site_url, theme_color, logo, favicon, PWA config (15 keys)
2. **Navigation** — nav_items, lms_url, lms_cta_text, footer_nav, social_links, contact_email (7 keys)
3. **Hero Banner** — hero_youtube_id, hero_tagline, hero_btn1/btn2, hero_brands (9 keys)
4. **Trang chủ** — home_work_*, home_products_*, home_counters, home_about_* (21 keys)
5. **Messenger** — messenger_url, messenger_aria_label, messenger_title (3 keys)
6. **Trang con** — courses_page_*, portfolio_*, presets_*, contact_*, blog_* (19 keys)

---

## User Stories

### US-01.1: Admin xem danh sách toàn bộ settings

> **As an** Administrator  
> **I want to** see all site settings organized by category tabs  
> **So that** I can quickly find and edit any content on the website

**Acceptance Criteria:**
- Settings page hiển thị 6 tabs tương ứng 6 nhóm
- Mỗi tab hiển thị form với tất cả các key trong nhóm đó
- Mỗi field hiển thị: label (tiếng Việt), input/textarea, description tooltip
- Các field dạng JSON (nav_items, social_links, hero_brands, counters...) có UI editor riêng (không phải paste JSON thô)
- Field dạng URL/media có nút "Chọn từ Media Library"

### US-01.2: Admin chỉnh sửa settings theo tab

> **As an** Administrator  
> **I want to** edit settings in one tab and save them independently  
> **So that** I can update only what I need without affecting other sections

**Acceptance Criteria:**
- Mỗi tab có nút "Lưu thay đổi" riêng
- Khi submit 1 tab, chỉ các key trong tab đó được gửi lên API
- Hiển thị thông báo thành công/lỗi sau khi lưu
- Có indicator "Unsaved changes" nếu field bị thay đổi mà chưa lưu
- Có nút "Reset" để hoàn nguyên về giá trị đã lưu gần nhất

### US-01.3: Admin lưu nhiều settings 1 lần (Batch Save)

> **As an** Administrator  
> **I want to** save all changes across all tabs at once  
> **So that** I can review everything before publishing

**Acceptance Criteria:**
- Nút "Lưu tất cả" ở header của Settings page
- Khi click: validate tất cả fields, highlight lỗi nếu có
- Gửi PUT `/api/settings/batch` với object `{ key: value, ... }`
- Chỉ gửi các key có thay đổi (diff với giá trị hiện tại)

### US-01.4: Settings được cache và reflect ngay trên frontend

> **As a** Website Visitor  
> **I want to** see the updated content immediately after admin saves  
> **So that** the website always shows the latest information

**Acceptance Criteria:**
- API GET `/api/settings` có cache TTL 60 giây (stale-while-revalidate)
- Frontend `getSiteSettings()` dùng React `cache()` + deduplication
- Khi admin save, cache tự động invalidate
- Navigation items, footer, social links reflect changes immediately
- Site metadata (title, description) update sau lần deploy/revalidate tiếp theo

---

## BDD Scenarios

### Scenario: Admin mở Settings page lần đầu

```gherkin
Feature: Site Settings Management

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"

  Scenario: Settings page loads with all tabs
    When the page loads
    Then I should see 6 tabs: "Thông tin chung", "Navigation", "Hero Banner", "Trang chủ", "Messenger", "Trang con"
    And the "Thông tin chung" tab should be active by default
    And each field should display its current value from the database
    And JSON fields like "site_keywords" should show a tag editor, not raw JSON text

  Scenario: Empty state for unset settings
    Given the database has no value for "hero_tagline"
    When I navigate to the "Hero Banner" tab
    Then the hero_tagline field should show placeholder text "Chưa có giá trị"
    And saving an empty value should store empty string, not delete the key
```

### Scenario: Admin edits and saves a single tab

```gherkin
  Scenario: Save changes in one tab
    Given I am on the "Hero Banner" tab
    When I change "hero_tagline" to "Câu chuyện mới"
    And I change "hero_btn1_text" to "BẮT ĐẦU HỌC"
    And I click "Lưu thay đổi" in the Hero Banner tab
    Then a PUT request should be sent to "/api/settings/batch" with:
      | hero_tagline    | Câu chuyện mới |
      | hero_btn1_text  | BẮT ĐẦU HỌC   |
    And I should see a success toast "Đã lưu cài đặt Hero Banner"
    And the "Unsaved changes" indicator should disappear
    And other tabs' values should remain unchanged

  Scenario: Unsaved changes indicator
    Given I am on the "Navigation" tab
    When I modify "nav_items" by adding a new nav item
    Then an orange dot indicator should appear on the "Navigation" tab label
    And if I switch to another tab, the indicator should persist
    When I return to "Navigation" tab
    Then my unsaved changes should still be visible
```

### Scenario: Batch save all tabs

```gherkin
  Scenario: Save all changes across tabs
    Given I have unsaved changes in "Thông tin chung" and "Messenger" tabs
    When I click "Lưu tất cả" in the page header
    Then ALL changed keys from ALL tabs should be sent in a single PUT "/api/settings/batch"
    And all "Unsaved changes" indicators should disappear
    And a success toast should show "Đã lưu tất cả cài đặt"

  Scenario: Validation errors during batch save
    Given the "site_url" field is empty (required)
    When I click "Lưu tất cả"
    Then the form should NOT submit
    And the "Thông tin chung" tab should auto-activate
    And the "site_url" field should be highlighted with error "Trường này không được để trống"
```

### Scenario: Navigation JSON editor

```gherkin
  Scenario: Edit navigation items visually
    Given I am on the "Navigation" tab
    When I view the "nav_items" field
    Then I should see a list of nav items, each with:
      - A label input (text)
      - An href input (text, with dropdown for internal routes)
      - A drag handle to reorder
      - A delete button (✕)
    And at the bottom, a [+ Thêm mục] button
    When I click [+ Thêm mục]
    Then a new empty nav item row should appear
    When I drag the 3rd item above the 2nd
    Then the order should update visually
```

### Scenario: Social links editor

```gherkin
  Scenario: Edit social links visually
    Given I am on the "Navigation" tab
    When I view the "social_links" field
    Then I should see 4 predefined slots: YouTube, Instagram, TikTok, Facebook
    And each slot has a URL input
    And empty slots are allowed (hidden on frontend if URL is empty)
```

### Scenario: API - GET all settings

```gherkin
  Scenario: Public access to settings
    Given the database has settings: site_title = "Minh Travel", theme_color = "#0B0F19"
    When I send GET "/api/settings"
    Then the response status should be 200
    And the response body should be an array with items:
      | key          | value          |
      | site_title   | Minh Travel    |
      | theme_color  | #0B0F19        |
    And the response should have header "Cache-Control: public, max-age=60"

  Scenario: Empty database
    Given the database has no settings
    When I send GET "/api/settings"
    Then the response should be an empty array []
    And status should be 200
```

### Scenario: API - PUT batch settings (admin only)

```gherkin
  Scenario: Admin updates multiple settings
    Given I am authenticated as admin
    When I send PUT "/api/settings/batch" with body:
      {
        "site_title": "Minh Travel v2",
        "hero_tagline": "New tagline"
      }
    Then the response status should be 200
    And the response body should confirm 2 keys updated
    And the database should have site_title = "Minh Travel v2" and hero_tagline = "New tagline"

  Scenario: Unauthorized access
    Given I am NOT authenticated
    When I send PUT "/api/settings/batch" with body: { "site_title": "Hacked" }
    Then the response status should be 401

  Scenario: Non-admin user access
    Given I am authenticated as a regular USER
    When I send PUT "/api/settings/batch" with body: { "site_title": "Hacked" }
    Then the response status should be 403

  Scenario: Invalid key
    Given I am authenticated as admin
    When I send PUT "/api/settings/batch" with body: { "non_existent_key": "value" }
    Then the response should still be 200 (upsert behavior)
    And the key should be created in the database

  Scenario: Empty request body
    Given I am authenticated as admin
    When I send PUT "/api/settings/batch" with body: {}
    Then the response status should be 200
    And the response should indicate 0 keys updated
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **API Endpoints** | `GET /api/settings` (public), `GET /api/settings/:key` (public), `PUT /api/settings/batch` (admin) |
| **DB Table** | `site_settings(key TEXT PK, value TEXT NOT NULL, description TEXT, updated_at TEXT)` |
| **Zod Schema** | Không cần Zod riêng — value là `z.string()`, parse JSON tại client |
| **Cache** | Server-side: React `cache()` + `unstable_cache` với revalidate 60s. Client-side: SWR/React Query |
| **Admin UI** | Tabbed form, JSON fields có visual editor (tag input, key-value list, reorderable list) |
| **Auth** | PUT endpoints yêu cầu JWT admin token |
| **Seed Data** | Migration seed ~50 keys với giá trị mặc định từ mockData hiện tại |

---

## Dependencies

- **Spec 10:** Admin Dashboard Shell (layout, sidebar, auth guard)
- **Spec 09:** Authentication (JWT admin check)
- **Blueprint sections:** 2.1, 5.3, 6.1

---

## Next Steps

1. `/bdd-review` — Challenge spec trước khi implement
2. `/bdd-dev` — Implement theo TDD: viết test → code → refactor
