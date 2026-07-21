# Spec 07: FAQ, Testimonials & Promotions Management

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.6, 2.11  

---

## Feature Description

Ba module nhỏ dùng chung:
- **FAQ:** Câu hỏi thường gặp (global hoặc gắn với course cụ thể)
- **Testimonials:** Đánh giá học viên (gắn với course hoặc global)
- **Promotions:** Khuyến mãi (gắn với course hoặc toàn trang)

---

## User Stories

### US-07.1: Admin quản lý FAQ

> **As an** Administrator  
> **I want to** manage FAQ items  
> **So that** visitors' common questions are answered

**Acceptance Criteria:**
- CRUD FAQ items: question, answer, course_id (nullable = global), sort_order
- FAQ global list → hiển thị trên course listing page
- FAQ per course → hiển thị trên course detail page
- Drag reorder
- Markdown hỗ trợ cho answer field (hoặc dùng Block Editor mini)

### US-07.2: Admin quản lý Testimonials

> **As an** Administrator  
> **I want to** manage student testimonials  
> **So that** social proof is displayed on course pages

**Acceptance Criteria:**
- CRUD testimonials: user_name, user_role, user_avatar_url (media library), rating (1-5), content, title, course_id (nullable), is_featured, sort_order
- Featured testimonials hiển thị trên homepage
- Per-course testimonials hiển thị trên course detail
- Rating hiển thị sao (⭐)

### US-07.3: Admin quản lý Promotions

> **As an** Administrator  
> **I want to** create discount promotions  
> **So that** I can run marketing campaigns

**Acceptance Criteria:**
- CRUD promotions: campaign_name, course_id (nullable = toàn trang), discount_percentage, start_date, end_date, is_active
- Active promotion hiển thị badge trên course card (VD: "Giảm 90%")
- Tự động hết hạn khi end_date passed
- Chỉ 1 promotion active per course tại 1 thời điểm (validation)

---

## BDD Scenarios

```gherkin
Feature: FAQ Management

  Background:
    Given I am logged in as an Administrator

  Scenario: Create global FAQ
    When I navigate to "/quan-tri-vien/faq"
    And I click "Thêm FAQ"
    And I fill in question "Khóa học dành cho ai?"
    And I fill in answer "Mọi trình độ..."
    And I leave course empty (global)
    And I click "Lưu"
    Then the FAQ should appear in the list
    And it should be visible on the course listing page

  Scenario: Create course-specific FAQ
    When I create a FAQ with course "TikTok cơ bản"
    Then that FAQ should only appear on the TikTok course detail page
    And it should NOT appear on global FAQ listing

Feature: Testimonial Management

  Scenario: Create testimonial
    When I navigate to "/quan-tri-vien/danh-gia"
    And I click "Thêm đánh giá"
    And I fill in:
      | Name    | Nguyễn Văn A |
      | Role    | Học viên     |
      | Rating  | 5            |
      | Quote   | Khóa học tuyệt vời! |
    And I select avatar from Media Library
    And I toggle "Nổi bật"
    And I click "Lưu"
    Then the testimonial should appear with 5 stars

Feature: Promotion Management

  Scenario: Create active promotion
    When I navigate to "/quan-tri-vien/khuyen-mai"
    And I click "Tạo khuyến mãi"
    And I fill in:
      | Tên chiến dịch    | Flash Sale        |
      | Giảm giá (%)      | 90                |
      | Ngày bắt đầu      | 2026-08-01        |
      | Ngày kết thúc     | 2026-08-07        |
      | Khóa học          | TikTok cơ bản     |
    And I toggle "Kích hoạt"
    And I click "Lưu"
    Then the TikTok course should show "Giảm 90%" badge

  Scenario: Promotion expires automatically
    Given a promotion with end_date "2026-01-01" is active
    When the current date is "2026-01-02"
    Then the promotion should NOT be returned by active promotions query

  Scenario: Duplicate active promotion rejected
    Given course "TikTok" has an active promotion "Flash Sale"
    When I try to create another active promotion for course "TikTok"
    Then an error should show "Khóa học này đã có khuyến mãi đang hoạt động"
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Tables** | `faqs`, `testimonials`, `promotions` |
| **Avatar** | Media Library (Spec 04) |
| **Sort Order** | Integer, drag & drop reorder |
| **Promotion Validation** | Unique active per course (DB trigger hoặc API check) |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/faqs` | Public | List (query: course_id) |
| `POST/PUT/DELETE` | `/api/faqs` | Admin | CRUD |
| `GET` | `/api/testimonials` | Public | List (query: course_id, featured) |
| `POST/PUT/DELETE` | `/api/testimonials` | Admin | CRUD |
| `GET` | `/api/promotions` | Admin | List |
| `GET` | `/api/promotions/active` | Public | Get active for course |
| `POST/PUT/DELETE` | `/api/promotions` | Admin | CRUD |

---

## Dependencies

- Spec 01 (site_settings cho FAQ heading)
- Spec 03 (courses reference)
- Spec 04 (media library cho avatar)
- Spec 09, Spec 10

---

## Next Steps

`/bdd-review` → `/bdd-dev`
