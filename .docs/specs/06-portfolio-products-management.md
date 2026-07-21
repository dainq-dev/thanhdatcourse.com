# Spec 06: Portfolio & Digital Products Management

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.9-2.10, Section 6.8-6.9  

---

## Feature Description

Quản lý Portfolio (dự án phim) và Digital Products (LUTs, Presets). Portfolio dùng để showcase video dự án (YouTube, travel films, TVC). Digital Products là sản phẩm số (LUT màu, preset ảnh) có link mua ngoài.

---

## User Stories

### US-06.1: Admin quản lý Portfolio

> **As an** Administrator  
> **I want to** create and manage portfolio items  
> **So that** I can showcase my best work on the website

**Acceptance Criteria:**
- CRUD portfolio items
- Fields: title, description, category (Travel/Commercial/TV/Tutorial...), thumbnail (media library), full_video_url, youtube_video_id, is_featured_on_home, featured_order
- Grid table trong admin: thumbnail, title, category, featured
- Featured items hiển thị trên homepage (nếu có flag)

### US-06.2: Admin quản lý Digital Products

> **As an** Administrator  
> **I want to** manage digital products (LUTs, presets)  
> **So that** visitors can discover and purchase them

**Acceptance Criteria:**
- CRUD digital products
- Fields: title, description, price, thumbnail (media library), external_checkout_url, youtube_preview_id, tag (LUT/Preset...), is_published, is_featured_on_home
- Product card hiển thị: thumbnail, name, description, price, "Mua ngay" button → external link

### US-06.3: Trang Portfolio (frontend)

> **As a** Website Visitor  
> **I want to** browse portfolio projects  
> **So that** I can see the creator's work

**Acceptance Criteria:**
- Page header dynamic từ site_settings
- List portfolio items: title, description, category
- CTA section ở cuối trang: "Bạn muốn làm việc cùng tôi?" với buttons
- CTA items lấy từ site_settings

### US-06.4: Trang Presets (frontend)

> **As a** Website Visitor  
> **I want to** browse LUTs and presets  
> **So that** I can purchase color tools

**Acceptance Criteria:**
- Page header dynamic từ site_settings
- List digital products: name, description, price
- "Mua ngay" button → external_checkout_url
- Chỉ hiển thị published products

---

## BDD Scenarios

```gherkin
Feature: Portfolio Management

  Background:
    Given I am logged in as an Administrator

  Scenario: Create portfolio item
    When I navigate to "/quan-tri-vien/san-pham" (Portfolio tab)
    And I click "Tạo dự án mới"
    And I fill in:
      | Title       | Life of Tibet |
      | Description | Cinematic travel film |
      | Category    | Travel |
    And I select a thumbnail from Media Library
    And I paste YouTube video ID "abc123"
    And I click "Lưu"
    Then the portfolio item should appear in the list

  Scenario: Toggle featured on home
    Given a portfolio item exists
    When I click the star/featured toggle
    Then is_featured_on_home should be set to true
    And the item should appear on homepage portfolio section

Feature: Digital Products

  Scenario: Create digital product
    When I navigate to "/quan-tri-vien/san-pham" (Products tab)
    And I click "Tạo sản phẩm mới"
    And I fill in:
      | Name        | Bộ 7 LUT Wedding |
      | Description | Bộ LUT màu cưới... |
      | Price       | 199000 |
      | Tag         | LUT |
      | External Checkout URL | https://go.minhtravel.vn/... |
    And I click "Lưu"
    Then the product should appear in the products list

Feature: Portfolio & Products Frontend

  Scenario: Portfolio listing page
    Given there are 7 portfolio items
    When I navigate to "/san-pham"
    Then I should see all 7 items
    And the page header should show from site_settings
    And the CTA section should show with buttons from site_settings

  Scenario: Presets listing page
    Given there are 3 published digital products
    When I navigate to "/cong-cu"
    Then I should see all 3 products with buy buttons
    And draft products should NOT be visible
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Tables** | `portfolios`, `digital_products`, `product_showcases` |
| **Images** | Media Library (Spec 04) |
| **CTA** | Lấy từ site_settings (Spec 01) |
| **Auth** | Admin-only CRUD |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/portfolios` | Public | List |
| `GET` | `/api/portfolios/:id` | Public | Single |
| `POST` | `/api/portfolios` | Admin | Create |
| `PUT` | `/api/portfolios/:id` | Admin | Update |
| `DELETE` | `/api/portfolios/:id` | Admin | Delete |
| `GET` | `/api/products` | Public | List (query: published) |
| `GET` | `/api/products/:id` | Public | Single |
| `POST` | `/api/products` | Admin | Create |
| `PUT` | `/api/products/:id` | Admin | Update |
| `DELETE` | `/api/products/:id` | Admin | Delete |

---

## Dependencies

- Spec 01 (site_settings cho page header, CTA)
- Spec 04 (Media Library cho thumbnail)
- Spec 09, Spec 10

---

## Next Steps

`/bdd-review` → `/bdd-dev`
