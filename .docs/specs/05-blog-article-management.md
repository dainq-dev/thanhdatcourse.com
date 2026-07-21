# Spec 05: Blog & Article Management

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.8, Section 6.6-6.7  

---

## Feature Description

Hệ thống quản lý bài viết/blog: CRUD danh mục, CRUD bài viết với Block Content Editor, publish/draft, SEO metadata, hiển thị listing + detail trên frontend với bài viết liên quan.

---

## User Stories

### US-05.1: Admin quản lý danh mục bài viết

> **As an** Administrator  
> **I want to** create and manage blog categories  
> **So that** articles can be organized by topic

**Acceptance Criteria:**
- Trang `/quan-tri-vien/danh-muc` hiển thị table: Name, Slug, Post Count
- Tạo/Xóa/Sửa danh mục (name, slug auto từ name)
- Slug unique, không được trùng
- Xóa danh mục: nếu có bài viết → cảnh báo + set category_id = NULL cho các bài đó

### US-05.2: Admin CRUD bài viết với Block Editor

> **As an** Administrator  
> **I want to** create and edit articles using the Block Editor  
> **So that** I can produce visually rich content easily

**Acceptance Criteria:**
- Trang danh sách bài viết: table với title, category, status, author, views, published date
- Filter: status (all/published/draft), category, search by title
- "Tạo bài viết mới" → Block Editor (Spec 02)
- Form metadata: title, slug (auto), excerpt, thumbnail (media library), category (dropdown), author, read_time (auto-calc hoặc manual), seo_description
- Publish/Draft toggle
- Save as draft hoặc publish
- Preview mode (mở tab mới với bản nháp)

### US-05.3: SEO metadata cho bài viết

> **As an** Administrator  
> **I want to** set SEO metadata per article  
> **So that** each article ranks well on search engines

**Acceptance Criteria:**
- SEO Description field (160 char counter)
- Auto-generate từ excerpt nếu không set
- Slug field (auto từ title, editable)
- Open Graph image tự động lấy thumbnail
- Structured data (JSON-LD: Article) tự generate

### US-05.4: Trang listing bài viết (frontend)

> **As a** Website Visitor  
> **I want to** browse blog articles  
> **So that** I can find content I'm interested in

**Acceptance Criteria:**
- Grid cards: thumbnail, title, excerpt, date, read time
- Chỉ hiển thị published articles
- Pagination (12 bài/trang)
- Page header: "Blog" (từ site_settings)
- Empty state nếu không có bài viết nào

### US-05.5: Trang chi tiết bài viết (frontend)

> **As a** Website Visitor  
> **I want to** read a full article with related content  
> **So that** I can learn more about the topic

**Acceptance Criteria:**
- Render content từ `content_blocks` qua BlockRenderer (Spec 02)
- Hiển thị: publish date, read time, author
- Related articles section (4 bài cùng category hoặc mới nhất, exclude current)
- SEO metadata dynamic từ bài viết
- Breadcrumbs: Home > [Category] > Article Title
- 404 nếu slug không tồn tại hoặc not published

---

## BDD Scenarios

```gherkin
Feature: Blog Management

  Background:
    Given I am logged in as an Administrator

  Scenario: Create a category
    When I navigate to "/quan-tri-vien/danh-muc"
    And I click "Tạo danh mục"
    And I fill in name "Kiến thức quay dựng"
    And I click "Lưu"
    Then a new category should appear in the table
    And its slug should be "kien-thuc-quay-dung"

  Scenario: Create article with Block Editor
    When I navigate to "/quan-tri-vien/bai-viet/tao-moi"
    Then I should see the Block Editor with one default paragraph block
    When I add a heading block "Hướng dẫn quay video"
    And I add an image block from Media Library
    And I add a paragraph block with content
    And I fill in excerpt "Mô tả ngắn"
    And I select category "Kiến thức quay dựng"
    And I click "Xuất bản"
    Then the article should be saved with status "published"
    And the content_blocks should contain 3 blocks as JSON

  Scenario: Article listing with filters
    Given there are 5 published and 3 draft articles
    When I view the article list page
    Then I should see all 8 articles
    When I filter by status "Published"
    Then I should see only 5 articles

  Scenario: Preview draft article
    Given I have a draft article
    When I click "Preview" on that article row
    Then a new tab should open with the article rendered
    And the article should NOT be accessible from public listing

Feature: Blog Frontend

  Scenario: Blog listing page
    Given there are 15 published articles
    When I navigate to "/bai-viet"
    Then I should see 12 article cards
    And pagination should show "Trang 1 / 2"
    When I click "Trang 2"
    Then I should see the remaining 3 articles

  Scenario: Blog detail page
    Given there is a published article with slug "huong-dan-quay-video"
    When I navigate to "/bai-viet/huong-dan-quay-video"
    Then I should see the full article content rendered from blocks
    And I should see related articles section
    And the page title should be the article title

  Scenario: Draft article returns 404
    Given there is a draft article with slug "bai-nhap"
    When I navigate to "/bai-viet/bai-nhap"
    Then I should see a 404 page
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Tables** | `post_categories`, `posts` |
| **Content** | `content_blocks TEXT` (Block Editor JSON) |
| **Pagination** | 12 posts/page trên frontend, 20/page trong admin |
| **SEO** | Dynamic metadata, JSON-LD Article schema |
| **Images** | Thumbnail từ Media Library (Spec 04) |
| **View Counter** | Tăng `views` khi xem detail (fingerprint/ip dedup) |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/posts` | Public | List (query: published, category, page, limit, search) |
| `GET` | `/api/posts/:slug` | Public | Get by slug |
| `POST` | `/api/posts` | Admin | Create |
| `PUT` | `/api/posts/:id` | Admin | Update |
| `DELETE` | `/api/posts/:id` | Admin | Delete |
| `GET/POST/PUT/DELETE` | `/api/categories` | Admin | Category CRUD |

---

## Dependencies

- **Spec 02:** Block Editor
- **Spec 04:** Media Library
- **Spec 09:** Auth
- **Spec 10:** Admin Shell

---

## Next Steps

1. `/bdd-review` → `/bdd-dev`
