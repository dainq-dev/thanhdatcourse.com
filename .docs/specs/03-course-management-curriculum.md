# Spec 03: Course Management + Curriculum Builder

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.2-2.6, Section 10  

---

## Feature Description

Hệ thống quản lý khóa học toàn diện kiểu Udemy/Coursera. Admin có thể tạo khóa học với curriculum dạng Modules → Lessons. Mỗi lesson có type (video/text/quiz/assignment), duration, resources, free preview. Khóa học có learning outcomes, prerequisites, target audience, instructors. Trang detail hiển thị curriculum accordion, instructor profile, testimonials, FAQ.

**Entity chính:**
- **Course:** title, slug, description, price, thumbnail, trailer, learning_outcomes, prerequisites, level, certificate, instructors
- **Module:** title, description, learning_outcomes, sort_order (thuộc 1 course)
- **Lesson:** title, description, type (video\|text\|quiz\|assignment\|resource), duration, video_url, content_blocks, resources, is_free_preview, sort_order (thuộc 1 module)
- **Bonus:** name, value, icon (thuộc 1 course)
- **Instructor:** name, title, bio, avatar, rating, social_links
- **Course-Instructor:** many-to-many

---

## User Stories

### US-03.1: Admin quản lý danh sách khóa học

> **As an** Administrator  
> **I want to** view, search, and filter all courses  
> **So that** I can manage the course catalog efficiently

**Acceptance Criteria:**
- Table hiển thị: thumbnail, title, price, status (published/draft), featured, student count, updated date
- Sortable columns: title, price, status, updated
- Search by title (debounce 300ms)
- Filter: published/draft, featured/not, combo-only
- Pagination (20 items/page)
- "Tạo khóa học mới" button ở header

### US-03.2: Admin tạo/chỉnh sửa khóa học — Tab Thông tin

> **As an** Administrator  
> **I want to** fill in course metadata (title, description, price, thumbnail, etc.)  
> **So that** the course detail page shows complete information

**Acceptance Criteria:**
- Form các trường:
  - **Title** (required, min 10 chars)
  - **Slug** (auto-generated từ title, editable, unique)
  - **Subtitle** (optional)
  - **Description** (textarea, short intro)
  - **Content Blocks** (Block Editor từ Spec 02 — cho phần giới thiệu dài)
  - **Base Price** (integer, VND, required)
  - **Original Price** (optional, để hiển thị giá gốc gạch ngang)
  - **Thumbnail** (chọn từ Media Library)
  - **Trailer Video** (YouTube URL hoặc chọn từ Media Library YouTube items)
  - **External Checkout URL** (optional link mua ngoài)
  - **Level:** beginner | intermediate | advanced | all
  - **Language:** vi (mặc định)
  - **Certificate:** toggle (có cấp chứng chỉ không?)
  - **Is Published:** toggle
  - **Is Featured on Home:** toggle
  - **Is Combo Only:** toggle (nếu bật → hiện "Không Bán Rời")
  - **Custom Button Text:** optional (override text mặc định "Mua ngay")
  - **Learning Outcomes:** multi-input (thêm/xóa outcome, dạng checklist)
  - **Prerequisites:** multi-input
  - **Target Audience:** textarea

### US-03.3: Admin xây dựng Curriculum (Tab Curriculum)

> **As an** Administrator  
> **I want to** build a structured curriculum with modules and lessons  
> **So that** students can see exactly what they will learn

**Acceptance Criteria:**
- Tab "Curriculum" hiển thị tree view: Modules → Lessons
- Mỗi module có thể expand/collapse
- **Module form:** title, description, learning_outcomes (multi-input)
- **Lesson form (trong module):** title, description, type selector, duration (MM:SS), video URL, resources (name+url+type), free preview toggle
- Drag & drop để sắp xếp modules, drag & drop lessons trong module
- Nút "+" để thêm module mới, nút "+" trong module để thêm lesson
- Hiển thị tổng thời lượng module, tổng số bài
- Tự động tính `total_duration_seconds` và `total_lessons` của course

### US-03.4: Admin quản lý Bonuses (Tab Ưu đãi)

> **As an** Administrator  
> **I want to** add bonus items to a course  
> **So that** I can show extra value students get when enrolling

**Acceptance Criteria:**
- Tab "Ưu đãi" hiển thị list bonus items
- Mỗi bonus: name (text), value (text, VD: "3.868.000đ"), icon (emoji hoặc text, optional)
- Có thể sắp xếp thứ tự
- Nút thêm/xóa

### US-03.5: Admin gán giảng viên (Tab Giảng viên)

> **As an** Administrator  
> **I want to** assign instructors to a course  
> **So that** students know who is teaching

**Acceptance Criteria:**
- Tab "Giảng viên" hiển thị danh sách instructors hiện có
- Multi-select dropdown để chọn instructors (từ bảng instructors)
- Có nút "Thêm giảng viên mới" mở modal quick-create
- Instructor card: avatar, name, title, bio, social links, rating

### US-03.6: Trang Course Detail hiển thị dynamic

> **As a** Website Visitor  
> **I want to** see a comprehensive course detail page  
> **So that** I can decide whether to enroll

**Acceptance Criteria:**
- **Hero:** Title, subtitle, description, price, rating, student count, trailer video, CTA button
- **Learning Outcomes:** Grid 2-3 columns, checklist style
- **Curriculum Accordion:** Modules expandable → Lessons (duration, free preview badge, description)
- **Instructor Section:** Card với avatar, bio, rating, student count, social links
- **Testimonials Section:** Cards từ testimonials table
- **FAQs:** Accordion từ FAQs table
- **Sticky CTA:** Hiện khi scroll xuống, hiển thị price + checkout button
- SEO metadata dynamic từ course data
- Not-found page nếu slug không tồn tại

---

## BDD Scenarios

```gherkin
Feature: Course Management

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khoa-hoc"

  Scenario: View course list
    When the course list page loads
    Then I should see a table with columns: Thumbnail, Title, Price, Status, Featured, Students, Updated
    And the table should be paginated (20 items per page)
    When I type "TikTok" in the search box
    Then the table should filter to show only courses with "TikTok" in the title
    When I click the "Published" filter dropdown and select "Draft"
    Then only draft courses should be shown
```

### Tạo khóa học mới

```gherkin
  Scenario: Create a new course successfully
    When I click "Tạo khóa học mới"
    Then I should be redirected to "/quan-tri-vien/khoa-hoc/tao-moi"
    And I should see tabs: "Thông tin", "Curriculum", "Ưu đãi", "Giảng viên", "Cài đặt"
    When I fill in:
      | Title       | Khóa học test                                 |
      | Description | Mô tả khóa học test                           |
      | Base Price  | 500000                                        |
      | Level       | beginner                                      |
    And I click "Lưu nháp"
    Then a POST request should be sent to "/api/courses"
    And the course should be saved with status "draft"
    And I should see a success toast

  Scenario: Slug auto-generation
    Given I am on the create course form
    When I type "Làm Chủ Tư Duy Chỉnh Màu Trong 2H" in the title field
    And I blur the title field
    Then the slug field should auto-fill with "lam-chu-tu-duy-chinh-mau-trong-2h"
    When I manually edit the slug to "chinh-mau-co-ban"
    Then the custom slug should be preserved
    And when I save, the API should check slug uniqueness

  Scenario: Validation errors
    Given I am on the create course form
    When I leave the title field empty
    And I click "Lưu nháp"
    Then the title field should be highlighted with error "Tiêu đề không được để trống"
    When I type "AB" in the title field
    Then the error should show "Tiêu đề phải có ít nhất 10 ký tự"
```

### Curriculum Builder

```gherkin
  Scenario: Build curriculum with modules and lessons
    Given I am on the "Curriculum" tab of a course
    When I click "+ Thêm chương"
    Then a new module form should appear with:
      - Title input ("Nhập tên chương...")
      - Description input ("Mô tả chương...")
      - Learning outcomes multi-input
    When I fill in title "Chương 1: Nhập môn"
    And I click "+ Thêm bài học" inside that module
    Then a lesson row should appear with:
      - Title input
      - Type dropdown (Video/Text/Quiz/Assignment/Resource)
      - Duration input (MM:SS)
      - Free preview toggle
    When I fill in lesson title "Bài 1: Giới thiệu" and duration "08:15"
    And I toggle "Free Preview" ON
    And I add a second lesson "Bài 2: Cơ bản" with duration "12:30"
    Then the module should show "2 bài • 20:45"

  Scenario: Drag to reorder modules
    Given the course has 3 modules: "Chương 1", "Chương 2", "Chương 3"
    When I drag "Chương 3" above "Chương 1"
    Then the module order should become: "Chương 3", "Chương 1", "Chương 2"
    And the sort_order values should be updated in the database

  Scenario: Delete a lesson
    Given the module "Chương 1" has 2 lessons
    When I click delete on the first lesson
    Then a confirmation dialog should appear: "Xóa bài học này?"
    When I confirm
    Then the lesson should be removed from the list

  Scenario: Curriculum auto-calculation
    Given the course has:
      - Module 1: 3 lessons, tổng 25:00
      - Module 2: 5 lessons, tổng 45:30
    Then the course header should show "2 Chương • 8 Bài • 1h 10ph"
    And total_duration_seconds in DB should be 4230
    And total_lessons in DB should be 8
```

### Bonuses & Instructors

```gherkin
  Scenario: Manage bonuses
    Given I am on the "Ưu đãi" tab
    When I click "+ Thêm ưu đãi"
    Then a new bonus row should appear with name and value inputs
    When I fill in name "Bộ sound effect" and value "3.200.000đ"
    And I save
    Then the bonus should be saved to course_bonuses table

  Scenario: Assign instructor
    Given I am on the "Giảng viên" tab
    When I open the instructor dropdown
    Then I should see all existing instructors
    When I select "Minh Travel"
    Then the instructor card should appear below
    When I click "Thêm giảng viên mới"
    Then a modal should appear with instructor creation form
```

### Frontend Course Detail

```gherkin
Feature: Course Detail Page (Public)

  Scenario: View course detail page
    Given I am a visitor on the website
    When I navigate to "/khoa-hoc/lam-chu-tu-duy-chinh-mau-trong-2h"
    Then I should see:
      - Course title and description
      - Price (formatted VND)
      - Trailer video (if available)
      - Learning outcomes in a grid
      - Curriculum accordion with modules and lessons
      - Instructor profile card
      - Testimonials section
      - FAQ section
      - Sticky CTA on scroll

  Scenario: Curriculum accordion interaction
    Given I am on a course detail page
    When I click on "Chương 1: Nhập môn"
    Then the chapter should expand to show its lessons
    And I should see lesson titles, durations, and free preview badges
    When I click on "Chương 1" again
    Then the chapter should collapse

  Scenario: Course not found
    Given the slug "khong-ton-tai" does not exist
    When I navigate to "/khoa-hoc/khong-ton-tai"
    Then I should see a 404 page with "Không tìm thấy khóa học"

  Scenario: SEO metadata
    Given a published course with title "Test Course" and description "Test Desc"
    When I view the page source of "/khoa-hoc/test-course"
    Then the <title> should be "Test Course | Minh Travel"
    And the <meta name="description"> should contain "Test Desc"
    And the <meta property="og:title"> should be "Test Course"
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **API Endpoints** | CRUD courses/modules/lessons/bonuses, instructors, course_instructors |
| **DB Tables** | 6 tables: courses, course_modules, course_lessons, course_bonuses, instructors, course_instructors |
| **Slug Uniqueness** | Unique constraint trên `courses.slug`, check tại API với friendly error message |
| **Duration Format** | Lưu `duration_seconds INTEGER`, hiển thị "MM:SS" hoặc "HH:MM:SS" |
| **Auto Calculation** | `total_duration_seconds`, `total_lessons` được tính tự động từ lessons (trigger hoặc pre-save hook) |
| **Thumbnails** | Dùng Media Library (Spec 04) — media_id reference |
| **Trailer Video** | Dùng YouTube media items từ Media Library |
| **Price Format** | Integer (VND), format khi render: `new Intl.NumberFormat('vi-VN').format()` |
| **Content Blocks** | Course description/introduction dùng Block Editor (Spec 02) |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/courses` | Public | List (query: published, featured, search, page, limit) |
| `GET` | `/api/courses/:slug` | Public | Get by slug |
| `POST` | `/api/courses` | Admin | Create |
| `PUT` | `/api/courses/:id` | Admin | Update |
| `DELETE` | `/api/courses/:id` | Admin | Delete (soft?) |
| `GET` | `/api/courses/:id/curriculum` | Public | Full curriculum |
| `PUT` | `/api/courses/:id/curriculum/reorder` | Admin | Reorder modules/lessons |
| `GET` | `/api/courses/:id/modules` | Public | List modules |
| `POST` | `/api/courses/:id/modules` | Admin | Add module |
| `PUT` | `/api/modules/:id` | Admin | Update module |
| `DELETE` | `/api/modules/:id` | Admin | Delete module |
| `GET` | `/api/modules/:id/lessons` | Public | List lessons |
| `POST` | `/api/modules/:id/lessons` | Admin | Add lesson |
| `PUT` | `/api/lessons/:id` | Admin | Update lesson |
| `DELETE` | `/api/lessons/:id` | Admin | Delete lesson |
| `GET/POST/PUT/DELETE` | `/api/courses/:id/bonuses` | Admin | Bonuses CRUD |
| `GET/POST/PUT/DELETE` | `/api/instructors` | Admin | Instructors CRUD |
| `PUT` | `/api/courses/:id/instructors` | Admin | Update instructor assignments |

---

## Dependencies

- **Spec 02:** Block Content Editor (cho course content_blocks)
- **Spec 04:** Media Microservice (thumbnail, trailer)
- **Spec 07:** Testimonials & FAQs (hiển thị trên trang detail)
- **Spec 10:** Admin Dashboard Shell
- **Spec 09:** Authentication
- **Blueprint sections:** 2.2-2.6, 10

---

## Next Steps

1. `/bdd-review` — Challenge spec trước khi implement
2. `/bdd-dev` — Implement: DB migrations → API routes → Admin UI → Frontend detail page
