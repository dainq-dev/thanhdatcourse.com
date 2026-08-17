# Spec 15: Presets & LUTs Management

**Status:** Draft
**Created:** 2026-08-09
**Ref Brainstorming:** `.docs/brainstorming-4-admin-modules.md`
**Related Backend:** `apps/api/src/routes/products.ts` (digital_products table)

---

## Feature Description

Quản lý preset/LUT entries dùng chung bảng `digital_products`. Admin CRUD preset/LUT entries (thumbnail, tên, mô tả, giá, tag, video demo YouTube, link mua ngoài). Public page `/cong-cu` hiển thị danh sách sản phẩm dạng grid, lọc theo tag.

**Pattern:** Giống `du-an` (portfolio) — danh sách + tạo mới + chỉnh sửa. Không dùng PageBuilder.

---

## User Stories

### US-15.1: Admin quản lý Presets & LUTs

> **As an** Administrator
> **I want to** create and manage preset/LUT entries
> **So that** visitors can browse and purchase them

**Acceptance Criteria:**
- CRUD preset/LUT entries (dùng `/api/products`)
- Fields: title (required), description (required), price (required, VND integer), thumbnail (media library), youtube_preview_id (video demo), external_checkout_url (link mua), tag ("LUT"/"Preset"), is_published, is_featured_on_home
- Admin list page `/quan-tri-vien/presets-luts` hiển thị grid/table: thumbnail, tên, tag, giá, trạng thái publish
- Filter theo tag (LUT/Preset/All), search theo tên (client-side filter trên data đã load, hoặc backend thêm query param `?tag=`)
- Toggle publish/unpublish ngay trên list
- Sắp xếp theo ngày tạo (mới nhất trước)

### US-15.2: Admin tạo preset/LUT mới (có custom tag)

> **As an** Administrator
> **I want to** create a new preset/LUT with full metadata
> **So that** I can add new products to sell

**Acceptance Criteria:**
- Form tạo: title, description (textarea), price (number), tag (select: LUT/Preset, hoặc nhập custom tag), thumbnail (MediaTrigger), youtube_preview_id (paste YouTube URL, auto-extract ID), external_checkout_url
- Live preview bên phải: hiển thị thumbnail, tên, giá, tag
- Toggle "Xuất bản" (is_published) và "Nổi bật trang chủ" (is_featured_on_home — nếu bật, sản phẩm sẽ hiển thị trong ProductSection trên homepage qua site_settings `home_products_card2_ref`)
- Submit → POST `/api/products` → redirect sang trang edit
- Validation: title và description required, price > 0

### US-15.3: Admin chỉnh sửa preset/LUT

> **As an** Administrator
> **I want to** edit existing preset/LUT information
> **So that** I can update pricing, description, or thumbnail

**Acceptance Criteria:**
- Trang edit `/quan-tri-vien/presets-luts/[id]`
- Pre-fill form với data hiện tại (fetch GET `/api/products/:id`)
- Cập nhật PUT `/api/products/:id`
- Nút "Xóa" với ConfirmDialog
- Nút "Quay lại danh sách"

### US-15.4: Trang Presets public (`/cong-cu`)

> **As a** Website Visitor
> **I want to** browse available LUTs and presets
> **So that** I can find and purchase color tools

**Acceptance Criteria:**
- Hiển thị grid các published products có tag "LUT" hoặc "Preset"
- Mỗi card: thumbnail, tên, mô tả ngắn, giá (format VND), nút "Mua ngay" → external_checkout_url
- Video demo (nếu có youtube_preview_id): hiển thị thumbnail YouTube + nút play → mở video
- Header section: title, subtitle từ site_settings (presets_page_title, presets_page_subtitle)
- Empty state nếu chưa có sản phẩm nào

---

## BDD Scenarios

### Feature: Admin Presets/LUTs Management

```gherkin
Feature: Admin Presets & LUTs Management

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/presets-luts"

  Scenario: View presets/LUTs list
    Given there are 5 products: 3 LUTs and 2 Presets
    When the page loads
    Then I should see all 5 products in the grid
    And each card shows: thumbnail, title, tag, price

  Scenario: Filter by tag
    Given there are products with tags "LUT" and "Preset"
    When I select filter "LUT"
    Then I should see only products with tag "LUT"
    When I select filter "All"
    Then I should see all products

  Scenario: Search by title
    Given a product "Cinematic Gold LUT" exists
    When I search "Gold"
    Then I should see "Cinematic Gold LUT"
    When I search "xyznotfound"
    Then I should see empty state "Không tìm thấy sản phẩm nào"

  Scenario: Toggle publish status
    Given a product is published (is_published = 1)
    When I click the publish toggle on its card
    Then PUT /api/products/:id is called with is_published = false
    And the badge changes from "Đã xuất bản" to "Bản nháp"

  Scenario: Delete product with confirmation
    Given a product "Old LUT" exists
    When I click "Xóa" on its card
    Then a ConfirmDialog appears: "Bạn có chắc muốn xóa sản phẩm 'Old LUT'?"
    When I confirm
    Then DELETE /api/products/:id is called
    And the product is removed from the list

  Scenario: Delete cancelled
    When I click "Xóa" on a product
    And I click "Hủy" in the dialog
    Then no API call is made
    And the product remains in the list


Feature: Admin Create Preset/LUT

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/presets-luts/tao-moi"

  Scenario: Create a new LUT successfully (happy path)
    When I fill in:
      | title                  | Cinematic Gold LUT          |
      | description            | Warm cinematic color grade  |
      | price                  | 299000                      |
      | tag                    | LUT                         |
      | thumbnail_url          | [selected from media]       |
      | youtube_preview_id     | dQw4w9WgXcQ                 |
      | external_checkout_url  | https://gumroad.com/l/xxx   |
    And I toggle "Xuất bản"
    And I click "Tạo sản phẩm"
    Then POST /api/products is called with:
      | title                  | "Cinematic Gold LUT"        |
      | description            | "Warm cinematic color grade"|
      | price                  | 299000                      |
      | tag                    | "LUT"                       |
      | is_published           | true                        |
    And I am redirected to the edit page for the new product

  Scenario: Create with minimum required fields (happy path)
    When I fill in title, description, price
    And I leave tag empty, thumbnail empty, links empty
    And I click "Tạo sản phẩm"
    Then the product is created successfully
    And tag defaults to nothing, is_published defaults to false

  Scenario: Validation - missing required fields (error path)
    When I leave title empty
    And I click "Tạo sản phẩm"
    Then the form should show validation error on title field
    And no API call is made

  Scenario: Validation - price is zero or negative (error path)
    When I fill in title "Test", description "Test"
    And I enter price "-1000"
    And I click "Tạo sản phẩm"
    Then the form should show validation error "Giá phải lớn hơn 0"

  Scenario: API error on create (error path)
    Given the API returns 500
    When I fill all required fields and submit
    Then an error message is displayed
    And the form remains editable


Feature: Admin Edit Preset/LUT

  Background:
    Given I am logged in as an Administrator
    And a product "Cinematic Gold LUT" exists with id "prod-1"
    And I navigate to "/quan-tri-vien/presets-luts/prod-1"

  Scenario: Edit product details (happy path)
    Given the form is pre-filled with current data
    When I change title to "Cinematic Gold V2"
    And I change price to 399000
    And I click "Lưu"
    Then PUT /api/products/prod-1 is called with updated fields
    And a success message is shown

  Scenario: Edit - non-existent product (error path)
    When I navigate to "/quan-tri-vien/presets-luts/non-existent"
    Then I should see "Không tìm thấy sản phẩm"
    And a link "Quay lại danh sách" is shown

  Scenario: Delete product from edit page
    When I click "Xóa sản phẩm"
    Then a ConfirmDialog appears
    When I confirm
    Then DELETE /api/products/prod-1 is called
    And I am redirected to the list page


Feature: Presets Public Page (/cong-cu)

  Background:
    Given I am a website visitor

  Scenario: View presets/LUTs listing (happy path)
    Given there are 3 published products with tag "LUT" or "Preset"
    And there is 1 unpublished product
    When I navigate to "/cong-cu"
    Then I should see 3 product cards
    And the unpublished product is NOT shown
    And each card displays: thumbnail, title, description, formatted price, "Mua ngay" button

  Scenario: Product card with YouTube preview
    Given a product has youtube_preview_id
    When I view "/cong-cu"
    Then the card shows a YouTube thumbnail
    And clicking it opens the YouTube video in a modal or new tab

  Scenario: Product card with external checkout
    Given a product has external_checkout_url "https://gumroad.com/l/xxx"
    When I click "Mua ngay"
    Then I am redirected to "https://gumroad.com/l/xxx" in a new tab

  Scenario: Empty state
    Given there are no published products
    When I navigate to "/cong-cu"
    Then I should see "Chưa có sản phẩm nào"
    And a section "Sản phẩm đang được cập nhật" is shown

  Scenario: Page header from site_settings
    Given site_settings has presets_page_title = "LUTs & Presets"
    And presets_page_subtitle = "Bộ sưu tập công cụ màu sắc chuyên nghiệp"
    When I navigate to "/cong-cu"
    Then the page title is "LUTs & Presets"
    And the subtitle is "Bộ sưu tập công cụ màu sắc chuyên nghiệp"
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Table** | `digital_products` (dùng chung, phân biệt qua tag) |
| **API** | `/api/products` (CRUD hiện có, không cần route mới) |
| **Tags** | "LUT", "Preset" (select + custom free-text, admin tự nhập tag mới) |
| **Filter** | Client-side filter từ data đã load (hiệu quả với số lượng preset < 200). Nếu cần server-side: thêm query param `?tag=` vào API `/api/products` |
| **Admin Pattern** | Giống `du-an`: list page + tao-moi page + [id] edit page |
| **Public Page** | `/cong-cu` — Server Component, fetch API, hiển thị grid |
| **Media** | Dùng MediaTrigger component để chọn thumbnail từ media library |
| **YouTube** | Dùng `extractYoutubeId()` để parse YouTube URL/ID |

---

## API Endpoints (dùng lại, không tạo mới)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/products?published=true` | Public | List all published products |
| `GET` | `/api/products?published=false` | Admin | List all products (admin view) |
| `GET` | `/api/products/:id` | Public/Admin | Get single product |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

---

## Cleanup Tasks

- [ ] Xóa route `/api/presets-page` khỏi `apps/api/src/index.ts` (không cần nữa)
- [ ] Xóa file `apps/api/src/routes/presets.ts`
- [ ] Nếu sản phẩm có `is_featured_on_home = true` → cần cập nhật `site_settings` key `home_products_card2_ref` để trỏ đến `/cong-cu` hoặc `/cong-cu?id={product_id}` (optional, admin làm thủ công qua cài đặt)

---

## Dependencies

- Spec 04 (Media Microservice — thumbnail upload qua MediaTrigger)
- Spec 01 (site_settings cho presets_page_title, presets_page_subtitle)
- Backend: `apps/api/src/routes/products.ts` (đã có sẵn)

---

## Next Steps

`/bdd-review` → `/bdd-dev`
