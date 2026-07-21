# Phase 4: Integration, Deployment & Polish

**Duration:** 7-10 days | **Depends on:** Phase 3
**TDD:** Bun test backend. Integration verified via API test suites.

---

## Module 4.1: Portfolio & Products (Spec 06)

### Task 4.1.1: Portfolio/Product API + Admin

**What:** CRUD API + admin table/form. Portfolio items: title, description, category, thumbnail, video URL. Products: title, description, price, tag, checkout URL.

**Test Cases:** CRUD ops, featured toggle, product published/draft filter.

### Task 4.1.2: Portfolio/Product Frontend (Dynamic)

**What:** Replace mockData in `/san-pham` and `/cong-cu` with API calls. Use `PortfolioCard` and `PresetCard` molecules.

**Best Practices:** Keep alternating layout (reversed class on even items). Page headers from site_settings.

**Test Cases:** List renders from API, alternating layout preserved, product buy button links to checkout URL.

---

## Module 4.2: FAQ, Testimonials, Promotions (Spec 07)

### Task 4.2.1: FAQ API + Admin + Frontend

**What:** CRUD FAQ items. Per-course or global (course_id NULL). Display via Accordion molecules.

**Test Cases:** Global FAQ renders on listing pages, course FAQ renders on detail page, sort order works.

### Task 4.2.2: Testimonials API + Admin

**What:** CRUD testimonials. Rating 1-5 stars. Avatar from Media Library. Featured toggle.

**Test Cases:** Testimonial displays stars correctly, featured filter works, per-course filter works.

### Task 4.2.3: Promotions API + Admin

**What:** CRUD promotions. Active only when start <= now <= end. Auto-expiry. One active per course.

**Test Cases:** Active promotion returns for course, expired returns null, duplicate active rejected, 90% discount badge shows on course card.

---

## Module 4.3: Contact & Leads (Spec 08)

### Task 4.3.1: Contact Form + Lead API

**What:** POST /api/leads (public, rate limited). Admin GET list + PUT status + notes.

**Best Practices:** Rate limit 3/IP/hour, honeypot field for spam, validation required fields.

**Test Cases:** Form submission creates lead, rate limit blocks, admin filter by status, status transition NEW→CONTACTED→CONVERTED.

### Task 4.3.2: Contact Page (Dynamic)

**What:** Replace hardcoded contact info with site_settings. Form posts to API. Success message from settings.

**Test Cases:** Contact info renders from settings, form submits to API, success state shown.

---

## Module 4.4: Frontend Complete Hookup

### Task 4.4.1: Replace All mockData Imports

**What:** Remove `apps/web/src/lib/mockData.ts`. Every page now uses Hono RPC client. All hardcoded text → site_settings.

**Test Cases:** No mockData imports remain, all pages load from API, site settings reflected on all pages.

### Task 4.4.2: Use Shared Molecules

**What:** Replace inline rendering with CourseCard, ArticleCard, PortfolioCard, PresetCard, TestimonialCard, BonusCard molecules from `@workspace/ui`.

**Test Cases:** All pages use molecules, visual output matches client-approved design.

### Task 4.4.3: SEO — Sitemap, Robots, Metadata

**What:** `sitemap.ts` (dynamic from courses + posts), `robots.ts` (disallow /quan-tri-vien/), generateMetadata on all detail pages.

**Test Cases:** Sitemap contains all published slugs, robots disallows admin, OG tags present.

---

## Module 4.5: Deployment

### Task 4.5.1: Dockerfiles

**What:** `Dockerfile` for each app using `oven/bun:alpine`. `apps/api`, `apps/web`, `apps/media`.

**Test Cases:** Docker build succeeds, container starts, health check responds.

### Task 4.5.2: Nginx Config + docker-compose

**What:** Nginx reverse proxy: `/` → web:3000, `/api/` → api:3001, `/img/` → media static serve. docker-compose.yml with 4 services + volumes.

**Test Cases:** Routes proxied correctly, static images served from disk, /upload proxied to media service.

### Task 4.5.3: Environment Variables + Backup

**What:** `.env.example`, cronjob backup SQLite files to cloud every 24h.

**Test Cases:** Services start with env vars, backup cron creates valid SQLite dump.
