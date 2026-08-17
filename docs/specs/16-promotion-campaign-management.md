# Spec 16: Promotion (Khuyến mãi) Campaign Management

**Status:** Draft
**Created:** 2026-08-09
**Ref Brainstorming:** `.docs/brainstorming-4-admin-modules.md`
**Related BRD:** `.docs/brd/07-faq-testimonials-promotions.md`

---

## Feature Description

Quản lý chiến dịch khuyến mãi cho khóa học. Mỗi chiến dịch có: tên, % giảm giá, thời gian hiệu lực (từ-đến), banner ảnh, gán nhiều khóa học, toggle hiển thị banner ra homepage, mã giảm giá (coupon code), giới hạn số lần dùng. Banner tự động ẩn khi hết hạn.

---

## User Stories

### US-16.1: Admin tạo chiến dịch khuyến mãi

> **As an** Administrator
> **I want to** create promotion campaigns with banners and course assignments
> **So that** I can run time-limited discounts to boost sales

**Acceptance Criteria:**
- Form tạo chiến dịch: tên chiến dịch (required), % giảm giá (required, 1-100), thời gian bắt đầu/kết thúc (date picker), chọn nhiều khóa học (multi-select), upload banner ảnh (MediaTrigger), toggle "Hiển thị banner homepage", mã giảm giá (optional), giới hạn số lần dùng (optional)
- Submit → POST `/api/promotions` với `course_ids` (array), `banner_image_url`, `show_on_homepage`, `coupon_code`, `usage_limit`
- Validation: tên không được trống, discount 1-100%, course_ids phải có ít nhất 1 khóa học, end_date phải sau start_date và trong tương lai

### US-16.2: Admin chỉnh sửa chiến dịch

> **As an** Administrator
> **I want to** edit existing promotion campaigns
> **So that** I can update discounts, dates, or course assignments

**Acceptance Criteria:**
- Click "Sửa" → form pre-filled với data hiện tại (fetch GET `/api/promotions/:id`)
- Cập nhật thông tin chiến dịch: PUT `/api/promotions/:id`
- Cập nhật course assignment: PUT `/api/promotions/:id/courses`
- Upload banner mới hoặc giữ banner cũ

### US-16.3: Admin quản lý danh sách chiến dịch

> **As an** Administrator
> **I want to** view and manage all promotion campaigns
> **So that** I can see which campaigns are active, expired, or upcoming

**Acceptance Criteria:**
- Table/list hiển thị: tên chiến dịch, % giảm, số khóa học gán, thời gian, trạng thái (Đang hoạt động/Sắp diễn ra/Đã kết thúc/Không hoạt động)
- Toggle active/inactive ngay trên list (PATCH `/api/promotions/:id/toggle`)
- Filter: Tất cả / Đang hoạt động / Đã kết thúc
- Nút "Sửa" và "Xóa" (ConfirmDialog)

### US-16.4: Banner khuyến mãi trên Homepage

> **As a** Website Visitor
> **I want to** see active promotion banners on the homepage
> **So that** I know about current discounts

**Acceptance Criteria:**
- Homepage gọi API lấy active promotion có `show_on_homepage = true`
- Hiển thị banner ảnh + countdown timer (GSAP) đến ngày kết thúc
- Banner tự động biến mất khi:
  - Hết thời gian (end_date < now) → backend trả null
  - Admin tắt toggle homepage hoặc deactivate → mất ngay
- Banner có link → trang khóa học hoặc landing page chiến dịch
- Chỉ hiển thị 1 banner (campaign có `show_on_homepage = true` và active). Nếu nhiều campaign cùng bật → ưu tiên campaign có end_date gần nhất (sắp kết thúc sớm nhất). Nếu không có end_date → ưu tiên tạo mới nhất.

### US-16.5: Badge giảm giá trên Course Card

> **As a** Website Visitor
> **I want to** see discount badges on discounted courses
> **So that** I can identify courses on sale

**Acceptance Criteria:**
- Course card/public page gọi GET `/api/promotions/active?course_id=X`
- Nếu có active promotion → hiển thị badge "Giảm X%" + giá gốc gạch ngang + giá sau giảm
- Tự động cập nhật khi hết hạn (badge biến mất). Giá hiển thị dựa trên discount_percentage, không dùng discount_amount (nếu có cả 2, ưu tiên %)

---

## BDD Scenarios

### Feature: Admin Promotion Management

```gherkin
Feature: Admin Promotion Management

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khuyen-mai"
    And there are 2 courses: "TikTok Cơ Bản" (id: course-1), "Premiere Pro" (id: course-2)


  Scenario: View all promotions list
    Given there are 3 promotions: 1 active, 1 upcoming, 1 expired
    When the page loads
    Then I should see all 3 promotions in the table
    And each row shows: campaign name, discount %, course count, date range, status badge

  Scenario: Filter active promotions
    When I select filter "Đang hoạt động"
    Then I should see only the active promotion
    And expired/upcoming promotions are hidden

  Scenario: Toggle promotion active state
    Given a promotion is inactive (is_active = 0)
    When I click the active toggle
    Then PATCH /api/promotions/:id/toggle is called with is_active = true
    And the status badge changes to "Đang hoạt động"

  Scenario: Delete promotion with confirmation
    Given a promotion exists
    When I click "Xóa"
    Then a ConfirmDialog appears
    When I confirm
    Then the promotion is deleted and removed from list

  Scenario: Empty state
    Given there are 0 promotions
    When the page loads
    Then I should see "Chưa có chiến dịch khuyến mãi nào"
    And a button "Tạo chiến dịch đầu tiên"


Feature: Admin Create Promotion

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khuyen-mai/tao-moi"

  Scenario: Create a campaign with all fields (happy path)
    When I fill in:
      | campaign_name          | Flash Sale Hè 2026          |
      | discount_percentage    | 30                          |
    And I select courses: course-1, course-2
    And I set start_date = 2026-08-15, end_date = 2026-08-30
    And I upload a banner image via media library
    And I toggle "Hiển thị banner trang chủ" ON
    And I enter coupon_code = "HE2026"
    And I enter usage_limit = 100
    And I click "Tạo chiến dịch"
    Then POST /api/promotions is called with:
      | campaign_name       | "Flash Sale Hè 2026"        |
      | discount_percentage | 30                          |
      | course_ids          | ["course-1", "course-2"]   |
      | start_date          | "2026-08-15T00:00:00Z"     |
      | end_date            | "2026-08-30T23:59:59Z"     |
      | banner_image_url    | [uploaded media URL]        |
      | show_on_homepage    | true                        |
      | coupon_code         | "HE2026"                    |
      | usage_limit         | 100                         |
      | is_active           | true                        |
    And I see a success message
    And I am redirected to the promotion list

  Scenario: Create with minimum required fields (happy path)
    When I fill in:
      | campaign_name       | "Flash Sale"                |
      | discount_percentage | 20                          |
    And I select 1 course
    And I leave start_date, end_date, banner, coupon, usage_limit empty
    And I leave "Hiển thị banner trang chủ" OFF
    And I click "Tạo chiến dịch"
    Then the campaign is created successfully
    And no banner is shown on homepage
    And the campaign has no expiry date (evergreen)

  Scenario: Validation - missing required fields (error path)
    When I leave campaign_name empty
    And I click "Tạo chiến dịch"
    Then I should see validation error "Vui lòng nhập tên chiến dịch"

  Scenario: Validation - discount out of range (error path)
    When I enter discount_percentage = 0
    And I click "Tạo chiến dịch"
    Then I should see validation error "Giảm giá phải từ 1% đến 100%"

  Scenario: Validation - no courses selected (error path)
    When I fill in campaign name and discount
    But I don't select any course
    And I click "Tạo chiến dịch"
    Then I should see validation error "Phải chọn ít nhất 1 khóa học"

  Scenario: Validation - end_date before start_date (error path)
    When I set start_date = 2026-08-20, end_date = 2026-08-10
    And I click "Tạo chiến dịch"
    Then I should see validation error "Ngày kết thúc phải sau ngày bắt đầu"

  Scenario: Validation - end_date in the past (error path)
    When I set end_date = 2024-01-01
    And I click "Tạo chiến dịch"
    Then the API returns 400 with error "end_date phải là ngày trong tương lai"


Feature: Admin Edit Promotion

  Background:
    Given a promotion "Flash Sale Hè 2026" exists with id "promo-1"
    And it has 2 courses assigned

  Scenario: Edit campaign details (happy path)
    Given I navigate to "/quan-tri-vien/khuyen-mai/promo-1"
    And the form is pre-filled with current data
    When I change discount to 40%
    And I click "Lưu"
    Then PUT /api/promotions/promo-1 is called with discount_percentage = 40
    And a success message is shown

  Scenario: Update course assignments (happy path)
    Given the current campaign has course-1 assigned
    When I add course-2 and remove course-1
    And I click "Lưu"
    Then PUT /api/promotions/promo-1/courses is called with course_ids = ["course-2"]
    And the assignment is updated

  Scenario: Replace banner image
    Given the campaign has an existing banner
    When I upload a new banner image
    And I click "Lưu"
    Then the banner_image_url is updated

  Scenario: Toggle homepage banner off
    Given show_on_homepage is currently true
    When I toggle "Hiển thị banner trang chủ" OFF
    And I click "Lưu"
    Then the banner is hidden from homepage immediately


Feature: Homepage Promotion Banner (Public)

  Background:
    Given it is 2026-08-20 (within campaign date range)

  Scenario: Active campaign banner shown on homepage
    Given a promotion "Flash Sale" is active
    And show_on_homepage = true
    And banner_image_url = "https://media.minhtravel.vn/img/banner-1/medium"
    And end_date = "2026-08-30"
    When I visit the homepage
    Then I should see the campaign banner
    And I should see a countdown timer showing "10 ngày còn lại"
    And clicking the banner navigates to the relevant course page

  Scenario: No active homepage campaign
    Given no promotion has show_on_homepage = true and is_active = true
    When I visit the homepage
    Then no banner is shown
    And the page layout is unaffected (no empty banner space)

  Scenario: Banner disappears when campaign expires
    Given a promotion expired yesterday
    When I visit the homepage
    Then GET /api/promotions/active?show_on_homepage=true returns null
    And no banner is shown

  Scenario: Banner disappears when admin deactivates
    Given a promotion is currently showing on homepage
    When admin toggles show_on_homepage to false
    Then on next page load, the banner is gone


Feature: Course Card Discount Badge (Public)

  Scenario: Discount badge shown on discounted course
    Given course "TikTok Cơ Bản" has an active promotion with 30% off
    When I view the course listing page
    Then the course card shows a badge "Giảm 30%"
    And the original price is shown with strikethrough
    And the discounted price is displayed

  Scenario: No badge for non-discounted course
    Given course "Premiere Pro" has no active promotion
    When I view the course listing
    Then no discount badge is shown
    And only the regular price is displayed

  Scenario: Badge disappears when promotion expires
    Given course "TikTok Cơ Bản" had a promotion that just expired
    When I view the course listing
    Then the badge is no longer shown
```

---

## Database Changes

**Migration: thêm 4 cột vào bảng `promotions` (Drizzle schema + SQL migration)**

Cập nhật `apps/api/src/db/schema.ts` (Drizzle):
```typescript
export const promotions = sqliteTable("promotions", {
  // ... existing fields ...
  bannerImageUrl: text("banner_image_url"),
  showOnHomepage: integer("show_on_homepage").notNull().default(0),
  couponCode: text("coupon_code"),
  usageLimit: integer("usage_limit"),
});
```

Tạo file `apps/api/src/db/migrations/0002_add_promotion_fields.sql`:
```sql
ALTER TABLE promotions ADD COLUMN banner_image_url TEXT;
ALTER TABLE promotions ADD COLUMN show_on_homepage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN coupon_code TEXT;
ALTER TABLE promotions ADD COLUMN usage_limit INTEGER;
```

**Note:** Nếu dùng `drizzle-kit push`, chỉ cần cập nhật schema.ts và chạy `drizzle-kit push`. SQL thủ công dùng nếu migrate bằng tay.

**Usage limit enforcement (V2):** `usage_limit` hiện tại là field reference trong DB nhưng chưa có logic enforcement. Implementation V2 sẽ: (1) thêm bảng `promotion_usage` để track số lần dùng, (2) endpoint `POST /api/promotions/:id/redeem` để check + tăng counter. V1 chỉ lưu field, chưa enforce.

**Updated Zod schema (backend):**

```typescript
const CreatePromotionSchema = z.object({
  campaign_name: z.string().min(1),
  discount_percentage: z.number().int().min(1).max(100),
  course_ids: z.array(z.string()).min(1),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  is_active: z.boolean().optional().default(true),
  banner_image_url: z.string().optional(),
  show_on_homepage: z.boolean().optional().default(false),
  coupon_code: z.string().optional(),
  usage_limit: z.number().int().positive().optional(),
}).refine(data => {
  if (data.end_date && data.start_date && new Date(data.end_date) <= new Date(data.start_date)) {
    return false;
  }
  if (data.end_date && new Date(data.end_date) <= new Date()) {
    return false;
  }
  return true;
}, { message: "end_date must be in the future and after start_date" });
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Table** | `promotions` + `promotion_courses` (junction) |
| **Migration** | Thêm 4 cột mới |
| **Multi-select course** | Dùng checkboxes hoặc tag-select component |
| **Banner upload** | Dùng MediaTrigger với accept="image/*" |
| **Homepage API** | Thêm endpoint mới `GET /api/promotions/homepage-banner` (public). Chi tiết bên dưới. |
| **Countdown timer** | GSAP timeline hoặc setInterval, hiển thị ngày/giờ/phút/giây còn lại |
| **Coupon code** | Field reference trong DB, không có logic validation tự động. Dùng để admin theo dõi (VD: gửi coupon riêng cho từng khách). Nếu cần validate khi checkout → V2 |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/promotions` | Admin | List all campaigns |
| `GET` | `/api/promotions/:id` | Admin | Get single + course_ids |
| `POST` | `/api/promotions` | Admin | Create campaign |
| `PUT` | `/api/promotions/:id` | Admin | Update campaign info |
| `PUT` | `/api/promotions/:id/courses` | Admin | Update course assignments |
| `PATCH` | `/api/promotions/:id/toggle` | Admin | Toggle is_active |
| `DELETE` | `/api/promotions/:id` | Admin | Delete campaign |
| `GET` | `/api/promotions/active?course_id=` | Public | Get active promo for a course |
| `GET` | `/api/promotions/homepage-banner` | Public | Get active campaign with `show_on_homepage = true`. Returns highest-priority banner *(new)* |

### New Endpoint: `GET /api/promotions/homepage-banner`

**Purpose:** Public endpoint to fetch the current homepage banner.

**Priority logic:** Trả về campaign đang active (`is_active = 1` AND `show_on_homepage = 1` AND `start_date <= now` AND `end_date >= now`), ưu tiên:
1. Campaign có `end_date` gần nhất (sắp kết thúc → urgency cao)
2. Nếu không có `end_date`, ưu tiên `created_at` mới nhất

**Response:**
```json
{
  "id": "promo-1",
  "campaign_name": "Flash Sale Hè 2026",
  "discount_percentage": 30,
  "banner_image_url": "https://media.minhtravel.vn/img/abc/medium",
  "end_date": "2026-08-30T23:59:59Z",
  "course_ids": ["course-1", "course-2"]
}
```

**No active banner →** trả về `null`:
```json
null
```

---

## Dependencies

- Spec 01 (site_settings có thể thêm promotion banner toggle global)
- Spec 03 (Course Management — course listing/detail hiển thị badge)
- Spec 04 (Media Microservice — banner upload)
- Homepage: cần thêm `PromotionBanner` section component

---

## Next Steps

`/bdd-review` → `/bdd-dev`
