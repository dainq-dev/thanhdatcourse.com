# BDD Spec: Page Builder & Section-based Architecture

**Feature**: Quản lý sections cho Khóa học, Sản phẩm và Presets & LUTs
**Scope**: `courses`, `products`, `presets_page`
**Version**: 1.0.0
**Date**: 2026-08-03

---

## Feature 1: Section Management (CRUD)

As an **Admin**, I want to **add/remove/reorder sections** for a course/product/presets page so that I can **build flexible landing pages without touching code**.

---

### Scenario: Admin adds a section to a course (happy path)

```
GIVEN Admin is authenticated with role "ADMIN"
  AND a course exists with slug "30-ngay-sang-tao-video-trieu-view"
  AND the course currently has 0 sections
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body:
    {
      "section_type": "hero_banner",
      "title": "Hero",
      "config": {
        "heading": "BẮT ĐẦU SỰ NGHIỆP CỦA BẠN",
        "subtitle": "Học quay dựng từ con số 0",
        "cta_text": "Mua ngay",
        "cta_url": "https://go.minhtravel.vn/..."
      }
    }
THEN response status is 201
  AND response contains the created section with id, sort_order = 0
  AND the section is_published = true
```

### Scenario: Admin adds a section with invalid section_type (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: { "section_type": "invalid_type", "config": {} }
THEN response status is 400
  AND response contains error message mentioning invalid section type
```

### Scenario: Admin adds a section with invalid config (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: {
    "section_type": "hero_banner",
    "config": { "heading": "" }
  }
THEN response status is 400
  AND response contains validation error for "heading" (min length)
```

### Scenario: Admin adds a section that is not allowed for entity type (error path)

```
GIVEN Admin is authenticated
  AND a product exists
WHEN Admin sends POST /api/product/{productId}/sections
  WITH body: { "section_type": "curriculum_grid", "config": {} }
THEN response status is 400
  AND response says "curriculum_grid" is not available for entity type "product"
```

### Scenario: Admin adds a section with missing required config field (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: {
    "section_type": "faq_accordion",
    "config": {}
    -- missing "items" array and "auto_fetch" not set
  }
THEN response status is 400
  AND response contains validation error
```

### Scenario: Admin adds a section to non-existent entity (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/course/non-existent-id/sections
  WITH body: { "section_type": "hero_banner", "config": { "heading": "Test" } }
THEN response status is 404
  AND response contains "entity not found"
```

### Scenario: Unauthenticated user tries to add a section (error path)

```
GIVEN user is NOT authenticated
WHEN user sends POST /api/course/{courseId}/sections
  WITH body: { "section_type": "hero_banner", "config": {} }
THEN response status is 401
  AND response contains "Unauthorized"
```

### Scenario: Non-admin user tries to add a section (error path)

```
GIVEN user is authenticated with role "USER"
WHEN user sends POST /api/course/{courseId}/sections
  WITH body: { "section_type": "hero_banner", "config": {} }
THEN response status is 403
  AND response contains "Forbidden"
```

---

### Scenario: Admin lists all sections of a course (happy path)

```
GIVEN a course has 3 sections:
    - section_1: type=hero_banner, sort_order=0
    - section_2: type=benefits_grid, sort_order=1
    - section_3: type=faq_accordion, sort_order=2
WHEN Admin sends GET /api/course/{courseId}/sections
THEN response status is 200
  AND response contains 3 sections
  AND sections are ordered by sort_order ascending
  AND each section has id, section_type, title, config, sort_order, is_published
```

### Scenario: Admin lists sections of an entity with no sections (happy path)

```
GIVEN a course has 0 sections
WHEN Admin sends GET /api/course/{courseId}/sections
THEN response status is 200
  AND response contains empty array
```

---

### Scenario: Admin updates a section config (happy path)

```
GIVEN a course has a section with id="sec-1", type="hero_banner"
WHEN Admin sends PUT /api/course/{courseId}/sections/sec-1
  WITH body: {
    "title": "Updated Hero",
    "config": { "heading": "NEW HEADING", "subtitle": "Updated" },
    "is_published": false
  }
THEN response status is 200
  AND the section's title is "Updated Hero"
  AND the section's config.heading is "NEW HEADING"
  AND the section's is_published is false
```

### Scenario: Admin updates a section with mismatched entity_type (error path)

```
GIVEN a course has section with id="sec-1"
WHEN Admin sends PUT /api/product/{otherProductId}/sections/sec-1
THEN response status is 404
  AND response contains "section not found for this entity"
```

### Scenario: Admin updates a section that doesn't exist (error path)

```
GIVEN a course exists
WHEN Admin sends PUT /api/course/{courseId}/sections/non-existent-id
  WITH body: { "config": {} }
THEN response status is 404
```

---

### Scenario: Admin deletes a section (happy path)

```
GIVEN a course has a section with id="sec-1"
WHEN Admin sends DELETE /api/course/{courseId}/sections/sec-1
THEN response status is 200
  AND the section no longer exists
  AND remaining sections' sort_order are intact
```

### Scenario: Admin deletes a section that doesn't exist (error path)

```
GIVEN a course exists
WHEN Admin sends DELETE /api/course/{courseId}/sections/non-existent-id
THEN response status is 404
```

---

## Feature 2: Section Reorder

As an **Admin**, I want to **reorder sections** via drag & drop so that I can **arrange the page layout visually**.

---

### Scenario: Admin reorders sections (happy path)

```
GIVEN a course has 3 sections:
    - sec-a: sort_order=0
    - sec-b: sort_order=1
    - sec-c: sort_order=2
WHEN Admin sends POST /api/course/{courseId}/sections/reorder
  WITH body: { "ordered_ids": ["sec-c", "sec-a", "sec-b"] }
THEN response status is 200
  AND sec-c has sort_order=0
  AND sec-a has sort_order=1
  AND sec-b has sort_order=2
```

### Scenario: Admin reorders with missing section id (error path)

```
GIVEN a course has 3 sections
WHEN Admin sends POST /api/course/{courseId}/sections/reorder
  WITH body: { "ordered_ids": ["sec-a", "sec-b"] }
    -- sec-c is missing from the array
THEN response status is 400
  AND response contains error: all section ids must be present
```

### Scenario: Admin reorders with invalid section id (error path)

```
GIVEN a course has 2 sections: sec-a, sec-b
WHEN Admin sends POST /api/course/{courseId}/sections/reorder
  WITH body: { "ordered_ids": ["sec-a", "sec-unknown", "sec-b"] }
THEN response status is 400
  AND response contains error: "sec-unknown" does not belong to this entity
```

### Scenario: Admin reorders with empty array (error path)

```
GIVEN a course exists
WHEN Admin sends POST /api/course/{courseId}/sections/reorder
  WITH body: { "ordered_ids": [] }
THEN response status is 400
  AND response contains validation error
```

---

## Feature 3: Entity Detail Page (Public API)

As a **Visitor**, I want to **view a course/product/presets detail page** with all published sections rendered in order.

---

### Scenario: Visitor views a course detail with sections (happy path)

```
GIVEN a course exists with slug "30-ngay-sang-tao-video-trieu-view"
  AND the course has 3 published sections (sorted):
    - type=hero_banner, sort_order=0
    - type=benefits_grid, sort_order=1
    - type=faq_accordion, sort_order=2
  AND the course has 1 disabled section (hidden)
WHEN Visitor sends GET /api/courses/30-ngay-sang-tao-video-trieu-view
THEN response status is 200
  AND response contains course meta (id, slug, title, price, thumbnail, description)
  AND response.sections has 3 items
  AND disabled section is NOT included
  AND sections are in correct sort_order
```

### Scenario: Visitor views a course with no sections (happy path)

```
GIVEN a course exists with 0 sections
WHEN Visitor sends GET /api/courses/{slug}
THEN response status is 200
  AND response.sections is an empty array
```

### Scenario: Visitor views a non-existent course (error path)

```
GIVEN no course with slug "non-existent"
WHEN Visitor sends GET /api/courses/non-existent
THEN response status is 404
```

### Scenario: Visitor views a draft/unpublished course (error path)

```
GIVEN a course exists with is_published = 0
WHEN Visitor (not admin) sends GET /api/courses/{slug}
THEN response status is 404
```

### Scenario: Admin views a draft course (happy path — admin override)

```
GIVEN a course exists with is_published = 0
  AND Admin is authenticated
WHEN Admin sends GET /api/courses/{slug}
THEN response status is 200
  AND course is returned with all sections (including draft sections)
```

---

### Scenario: Visitor views product detail with sections (happy path)

```
GIVEN a product exists
  AND the product has sections: [hero_banner, before_after_slider, faq_accordion]
WHEN Visitor sends GET /api/products/{id}
THEN response status is 200
  AND response contains product meta + sections array
```

---

### Scenario: Visitor views presets page (happy path)

```
GIVEN presets_page singleton exists with sections: [hero_banner, product_grid, faq_accordion]
WHEN Visitor sends GET /api/presets-page
THEN response status is 200
  AND response.sections has 3 items
  AND section "product_grid" has config with product references
```

---

## Feature 4: Promotions (M2M)

As an **Admin**, I want to **create promotions and assign them to multiple courses** so that I can **run flexible discount campaigns**.

---

### Scenario: Admin creates a promotion and assigns to courses (happy path)

```
GIVEN Admin is authenticated
  AND 3 courses exist with ids: c1, c2, c3
WHEN Admin sends POST /api/promotions
  WITH body: {
    "campaign_name": "Flash Sale 50%",
    "discount_percentage": 50,
    "start_date": "2026-08-01T00:00:00Z",
    "end_date": "2026-08-15T23:59:59Z",
    "is_active": true,
    "course_ids": ["c1", "c2", "c3"]
  }
THEN response status is 201
  AND promotion is created
  AND 3 promotion_courses records are created
```

### Scenario: Admin creates a promotion with invalid percentage (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/promotions
  WITH body: {
    "campaign_name": "Invalid",
    "discount_percentage": 150,
    "course_ids": ["c1"]
  }
THEN response status is 400
  AND response says discount_percentage must be between 1 and 100
```

### Scenario: Admin creates a promotion with past end_date (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/promotions
  WITH body: {
    "campaign_name": "Expired",
    "discount_percentage": 20,
    "end_date": "2020-01-01T00:00:00Z",
    "course_ids": ["c1"]
  }
THEN response status is 400
  AND response says end_date must be in the future
```

### Scenario: Admin creates a promotion without any courses (error path)

```
GIVEN Admin is authenticated
WHEN Admin sends POST /api/promotions
  WITH body: {
    "campaign_name": "No courses",
    "discount_percentage": 30,
    "course_ids": []
  }
THEN response status is 400
  AND response says at least one course must be assigned
```

### Scenario: Admin assigns a promotion to additional courses (happy path)

```
GIVEN promotion "Flash Sale" exists and is assigned to [c1, c2]
WHEN Admin sends PUT /api/promotions/{promotionId}/courses
  WITH body: { "course_ids": ["c1", "c2", "c3", "c4"] }
THEN response status is 200
  AND promotion is now assigned to 4 courses
```

### Scenario: Admin removes all courses from a promotion (happy path)

```
GIVEN promotion "Flash Sale" is assigned to 3 courses
WHEN Admin sends PUT /api/promotions/{promotionId}/courses
  WITH body: { "course_ids": [] }
THEN response status is 200
  AND promotion has 0 courses
```

---

### Scenario: Course detail shows active promotion (happy path)

```
GIVEN a course "c1" has an active promotion with discount_percentage=50
  AND promotion's current date is between start_date and end_date
WHEN Visitor sends GET /api/courses/c1-slug
THEN response.active_promotion is not null
  AND response.active_promotion.discount_percentage = 50
  AND response.active_promotion.campaign_name = "Flash Sale 50%"
```

### Scenario: Course detail does not show expired promotion (happy path)

```
GIVEN a course "c1" has a promotion with end_date = "2026-07-01T00:00:00Z"
  AND current date is 2026-08-03
WHEN Visitor sends GET /api/courses/c1-slug
THEN response.active_promotion is null
```

### Scenario: Course detail does not show inactive promotion (happy path)

```
GIVEN a course "c1" has a promotion with is_active = 0
WHEN Visitor sends GET /api/courses/c1-slug
THEN response.active_promotion is null
```

### Scenario: Course detail does not show future promotion (happy path)

```
GIVEN a course "c1" has a promotion with start_date = "2026-09-01T00:00:00Z"
  AND current date is 2026-08-03
WHEN Visitor sends GET /api/courses/c1-slug
THEN response.active_promotion is null
```

---

### Scenario: Admin toggles promotion active/inactive (happy path)

```
GIVEN promotion "Flash Sale" has is_active = 1
WHEN Admin sends PATCH /api/promotions/{promotionId}
  WITH body: { "is_active": false }
THEN response status is 200
  AND promotion.is_active = 0
```

---

## Feature 5: Presets & LUTs — Section `product_grid`

As a **Visitor**, I want to see a **grid of products on the Presets & LUTs page** with before/after examples.

---

### Scenario: Presets page renders product_grid with all products (happy path)

```
GIVEN 5 products exist
  AND presets_page has a section type="product_grid" with config: { "show_all": true }
WHEN Visitor views /presets-luts
THEN the product_grid section renders 5 ProductCards
```

### Scenario: Presets page renders product_grid with selected products (happy path)

```
GIVEN 8 products exist
  AND presets_page has a section with config: { "show_all": false, "product_ids": ["p1", "p3", "p5"] }
WHEN Visitor views /presets-luts
THEN the product_grid section renders exactly 3 ProductCards
  AND only products p1, p3, p5 are shown
```

### Scenario: product_grid with invalid product_id (edge case)

```
GIVEN presets_page has a section with config: { "product_ids": ["p1", "non-existent"] }
WHEN Visitor views /presets-luts
THEN only valid product p1 is rendered
  AND no error is shown to the user
```

---

## Feature 5b: Section Constraints (singleton + max + entity match)

---

### Scenario: Entity type mismatch on create (error path)

```
GIVEN Admin is authenticated
  AND a product exists with id="prod-1"
WHEN Admin sends POST /api/course/prod-1/sections
  WITH body: { "section_type": "hero_banner", "config": { "heading": "Test" } }
THEN response status is 400
  AND response says entity "prod-1" is not a course
```

### Scenario: Duplicate singleton section type (error path)

```
GIVEN a course already has a section type="hero_banner"
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: { "section_type": "hero_banner", "config": { "heading": "Second hero" } }
THEN response status is 400
  AND response says "hero_banner" can only appear once per entity

-- Singleton types: hero_banner, announcement_bar, sticky_pricing_cta, student_counter, lesson_count, instructor_story, product_grid
```

### Scenario: Max sections exceeded (error path)

```
GIVEN a course already has 30 sections
WHEN Admin sends POST /api/course/{courseId}/sections
  WITH body: { "section_type": "benefits_grid", "config": { "items": [] } }
THEN response status is 400
  AND response says maximum 30 sections allowed
```

---

## Feature 5c: Overlapping Promotions Resolution

---

### Scenario: Overlapping promotions — highest discount wins (happy path)

```
GIVEN course "c1" has 2 active promotions:
    - Promo A: discount_percentage=10
    - Promo B: discount_percentage=20
  AND current date is within both promo date ranges
WHEN Visitor sends GET /api/courses/c1-slug
THEN response.active_promotion.discount_percentage = 20
  AND response.active_promotion.campaign_name = Promo B's name
```

### Scenario: Promotions with same percentage — latest start_date wins (happy path)

```
GIVEN course "c1" has 2 active promotions:
    - Promo A: 20%, start_date = "2026-08-01"
    - Promo B: 20%, start_date = "2026-08-10"
WHEN Visitor views course "c1" on Aug 10
THEN response.active_promotion is Promo B (most recently started)
```

---

## Feature 7b: `auto_fetch` Toggle Behavior

---

### Scenario: Toggle auto_fetch OFF preserves manual data (happy path)

```
GIVEN course has a section curriculum_grid:
    config = { "auto_fetch": true, "modules": [{ "title": "Old manual", ... }] }
WHEN Admin edits config and sets auto_fetch = false
THEN the section renders using the "Old manual" modules from config
  AND manual data was NOT deleted during the auto_fetch period
```

### Scenario: Toggle auto_fetch ON hides manual data (happy path)

```
GIVEN course has section with config: { "auto_fetch": false, "modules": [...] }
WHEN Admin edits config and sets auto_fetch = true
  AND saves
THEN the section renders from course_modules table
  AND manual "modules" config is preserved in DB (not deleted)
  AND changing auto_fetch back to false restores manual data
```

---

## Feature 8b: Detail Page Performance (N+1 Prevention)

---

### Scenario: auto_fetch sections resolved in single batch query (happy path)

```
GIVEN a course detail page has 5 sections with auto_fetch=true:
    - curriculum_grid, testimonials_carousel, faq_accordion, bonus_gift_grid, featured_students
WHEN Visitor sends GET /api/courses/{slug}
THEN API responds in < 300ms (warm cache)
  AND all auto_fetch data is resolved server-side
  AND the response contains all resolved data inline (no client-side sub-fetches)
```

---

## Feature 6: Admin UI — Page Builder

As an **Admin**, I want to use a **visual page builder** to manage sections for each entity.

---

### Scenario: Admin opens page builder for a course (happy path)

```
GIVEN Admin is logged in and navigates to /quan-tri-vien/khoa-hoc/{slug}
WHEN the page loads
THEN left panel shows available section types grouped by category
  AND right panel shows current sections in order (or empty state if none)
  AND each section shows: type icon, title, enable/disable toggle, drag handle
```

### Scenario: Admin drags a section type from catalog to page (happy path)

```
GIVEN Admin is on the course page builder
  AND the course has existing sections: [hero_banner]
WHEN Admin drags "benefits_grid" from catalog and drops after hero_banner
THEN a new benefits_grid section is created with default config
  AND the section appears in preview at position 2
  AND sort_order is auto-assigned properly
```

### Scenario: Admin drags an existing section to reorder (happy path)

```
GIVEN course has sections in order: [hero_banner, benefits_grid, faq_accordion]
WHEN Admin drags faq_accordion above benefits_grid
THEN new order is: [hero_banner, faq_accordion, benefits_grid]
  AND API reorder call is made successfully
  AND preview reflects new order immediately
```

### Scenario: Admin clicks a section to edit its config (happy path)

```
GIVEN course has a benefits_grid section
WHEN Admin clicks on the benefits_grid section in preview
THEN right panel slides open with config form
  AND form shows current config values
  AND Admin can modify items, colors, etc.
WHEN Admin clicks "Lưu thay đổi"
THEN section config is updated via API
  AND preview reflects changes
```

### Scenario: Admin toggles section visibility (happy path)

```
GIVEN course has a section with is_published = true
WHEN Admin clicks the visibility toggle on that section
THEN section's is_published becomes false
  AND section appears dimmed/faded in preview
  AND section does NOT render on public page
```

### Scenario: Admin tries to add section type not allowed for entity (error path)

```
GIVEN Admin is on a product's page builder
THEN section types like "curriculum_grid", "lesson_count", "student_counter"
     are grayed out or hidden in the catalog
  AND hovering shows tooltip: "Chỉ dành cho Khóa học"
```

### Scenario: Admin discards unsaved config changes (edge case)

```
GIVEN Admin opens config form for a section
  AND makes changes without saving
WHEN Admin clicks away or presses Escape
THEN the form closes
  AND the section preview does NOT update
  AND original config is preserved
```

### Scenario: Network error during section save (error path)

```
GIVEN Admin edits a section config
WHEN Admin clicks "Lưu thay đổi"
  AND API call fails (network error / 500)
THEN an error toast appears: "Không thể lưu. Vui lòng thử lại."
  AND the config form stays open with changes preserved
  AND Admin can retry saving
```

### Scenario: Admin deletes a section from builder (happy path)

```
GIVEN course has a section "benefits_grid"
WHEN Admin clicks delete icon on the section
  AND confirms "Bạn có chắc muốn xóa section này?"
THEN section is removed from preview
  AND API DELETE call succeeds
  AND remaining sections are renumbered
```

---

## Feature 7: `auto_fetch` Behavior

Some sections can auto-fetch data from related tables instead of manual config.

---

### Scenario: curriculum_grid with auto_fetch from course_modules (happy path)

```
GIVEN a course has 3 modules in course_modules table, each with lessons
  AND course has a section type="curriculum_grid" with config: { "auto_fetch": true }
WHEN Visitor views the course detail
THEN the section renders 3 modules
  AND each module shows its lesson count
  AND sort_order from course_modules table is respected
```

### Scenario: curriculum_grid with manual config (happy path)

```
GIVEN a course has a section type="curriculum_grid" with manual config:
  { "modules": [{ "title": "Module 1", "lessons": [{ "title": "Bài 1", "duration": "10:00" }] }] }
WHEN Visitor views the course detail
THEN the section renders modules from config only
  AND course_modules table data is ignored
```

### Scenario: testimonials_carousel with auto_fetch (happy path)

```
GIVEN testimonials table has 10 records for course "c1"
  AND course has a section type="testimonials_carousel" with config: { "auto_fetch": true }
WHEN Visitor views the course detail
THEN the section renders a carousel with up to 10 testimonials
```

### Scenario: testimonials_carousel with manual items (happy path)

```
GIVEN course has a section with config: { "auto_fetch": false, "items": [{ "name": "A", ... }] }
WHEN Visitor views the course detail
THEN only manual items are rendered
  AND testimonials table is ignored
```

### Scenario: faq_accordion with auto_fetch (happy path)

```
GIVEN faqs table has 5 records with course_id = "c1"
  AND course has a section type="faq_accordion" with config: { "auto_fetch": true }
WHEN Visitor views the course detail
THEN 5 FAQ items are rendered as accordion
  AND sort_order from faqs table is respected
```

---

## Feature 8: Frontend Section Rendering

As a **Developer / Admin**, I want **unknown section types to degrade gracefully** so that the page doesn't crash.

---

### Scenario: Unknown section type in data (edge case)

```
GIVEN a course has a section with type="deprecated_old_type"
  AND the section renderer registry has no component for this type
WHEN the page renders
THEN the section is silently skipped (no render)
  AND other sections still render normally
  AND a console.warn is logged in dev mode
```

### Scenario: Section with malformed JSON config (edge case)

```
GIVEN a course has a section with type="hero_banner" but config is not valid JSON
WHEN the page renders
THEN the section is skipped (or renders with safe defaults)
  AND the page does NOT crash
  AND other sections render normally
```

### Scenario: Section with null/empty config (edge case)

```
GIVEN a course has a section with config = null
WHEN the page renders
THEN the section uses default config values
  AND the page does NOT crash
```

---

## Summary

| Feature | Scenarios |
|---------|-----------|
| Section CRUD | 10 (5 happy, 5 error) |
| Section Reorder | 4 (1 happy, 3 error) |
| Section Constraints (singleton, max, entity match) | 3 (0 happy, 3 error) |
| Entity Detail Page (public) | 6 (5 happy, 1 error) |
| Promotions M2M | 11 (7 happy, 4 error) |
| Overlapping Promotions Resolution | 2 (2 happy, 0 error) |
| Presets product_grid | 3 (2 happy, 1 edge) |
| Admin UI — Page Builder | 9 (6 happy, 2 error, 1 edge) |
| auto_fetch behavior | 7 (7 happy, 0 error) |
| Detail Page Performance (N+1) | 1 (1 happy, 0 error) |
| Frontend rendering resilience | 3 (0 happy, 3 edge) |
| **Total** | **59 scenarios** |
