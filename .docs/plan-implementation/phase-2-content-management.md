# Phase 2: Content Management — Settings, Courses, Media

**Duration:** 10-14 days | **Depends on:** Phase 1
**TDD:** Bun test backend. Frontend pages: manual QA + integration verified via API tests.

---

## Module 2.1: Site Settings CMS (Spec 01)

### Task 2.1.1: Settings API Routes

**What:** `apps/api/src/routes/settings.ts` — GET /api/settings (public), PUT /api/settings/batch (admin).

**Input:** GET returns all key-value pairs. PUT receives `{ key: value, ... }` object.

**Output:** GET returns JSON array. PUT returns `{ updated: N, keys: [...] }`.

**Best Practices:**
- Upsert: `INSERT OR REPLACE` cho mỗi key
- Cache header: `Cache-Control: public, max-age=60`
- Cache invalidation sau PUT

**Test Cases:** GET returns all settings, empty DB returns empty array, PUT creates new key, PUT updates existing key, unauthorized PUT returns 401, batch update returns correct count.

### Task 2.1.2: Settings Admin Page

**What:** `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` — 6 tabs, visual editors for JSON fields (nav items, social links, brands).

**Best Practices:** Tab-based form, each tab saves independently. JSON fields use visual editor (not raw JSON text). Unsaved changes indicator. Media Library modal for logo/favicon.

**Test Cases:** 6 tabs render, form values match DB, save one tab doesn't affect others, JSON editor renders, batch save works.

### Task 2.1.3: Frontend Settings Integration

**What:** Create `apps/web/src/lib/settings.ts` — `getSiteSettings()` with React `cache()`. Root layout fetches once, passes to children.

**Best Practices:** React `cache()` for dedup within render pass. `parseSetting<T>()` helper for JSON values with fallback.

**Test Cases:** Settings fetched successfully, cache deduplicates calls, JSON values parsed correctly, fallback applied when key missing.

---

## Module 2.2: Course Management (Spec 03 — Phase 1)

### Task 2.2.1: Course CRUD API

**What:** `apps/api/src/routes/courses.ts` — GET list, GET by slug, POST create, PUT update, DELETE.

**Best Practices:** Public GET filters `is_published=1`. Admin GET returns all. Slug auto-generated from title (slugify). Unique slug check before insert.

**Test Cases:** List returns published only (public), search filters by title, duplicate slug returns 409, PUT updates all fields, DELETE removes record.

### Task 2.2.2: Course Admin Page (List + Form)

**What:** Table list (`/quan-tri-vien/khoa-hoc`) + create/edit form with metadata fields.

**Best Practices:** Table: sortable, searchable, paginated. Form: all fields from spec (title, slug auto, price, thumbnail via media picker, learning outcomes multi-input, toggles).

**Test Cases:** List renders with correct data, add course + curriculum + bonuses flow works.

### Task 2.2.3: Course Listing Frontend (Dynamic)

**What:** Replace `mockCourses` with `api.courses.$get()` in `/khoa-hoc/page.tsx`. Replace `CourseCard` molecule.

**Best Practices:** Server Component with async data fetch. `generateMetadata` for SEO.

**Test Cases:** Courses load from API, empty state when no courses, search/filter works, SEO metadata dynamic.

---

## Module 2.3: Media Service (Spec 04 — Phase 1)

### Task 2.3.1: Media Upload API

**What:** `apps/media/src/routes/upload.ts` — POST /upload (multipart), validate + store file.

**Best Practices:** Magic bytes check for real MIME, UUID filename, size limits (50MB image), auth required.

**Test Cases:** Valid image uploads, invalid extension rejected, oversized file rejected, unauth returns 401, original saved to /data/uploads/.

### Task 2.3.2: Media Optimizer (Sharp)

**What:** `apps/media/src/services/optimizer.ts` — resize, strip EXIF, convert WebP+AVIF.

**Best Practices:** Max 2560px, `withoutEnlargement`, strip all metadata, WebP q82, AVIF q65.

**Test Cases:** 4000px image resized to 2560px, EXIF stripped, WebP smaller than original, AVIF smaller than WebP.

### Task 2.3.3: Variant Generator

**What:** Generate 5 variants (micro 16px, thumbnail 400px, medium 800px, large 1400px, og 1200px).

**Test Cases:** All 5 variants generated, correct dimensions, formats match (webp for 4, jpeg for og).

### Task 2.3.4: Image Serving Routes

**What:** GET /img/:id, GET /img/:id/:variant, GET /img/:id?w=&f=&q= for on-the-fly resize.

**Best Practices:** Cache-Control immutable for variants. Dynamic resize cached on disk.

**Test Cases:** Pre-generated variant served, on-the-fly resize works, 404 for non-existent, Accept header detection.
