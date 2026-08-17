# Comprehensive Audit Report — thanhdatcomputer.com

**Date:** 09/08/2026  
**Scope:** Public-facing website, backend API, database, SEO, performance, DSA  
**Method:** 4 specialized sub-agents running in parallel

---

## Overall Score: 5.8/10

| Dimension | Score | Agent |
|-----------|-------|-------|
| Business Logic & API Integration | 6/10 | Business auditor |
| SEO & Metadata | 4.7/10 | SEO auditor |
| Performance & Rendering | 5/10 | Performance auditor |
| DSA & Code Complexity | 6.5/10 | Complexity auditor |

---

## CRITICAL — Fix Immediately

| # | Category | Issue | File | Line |
|---|----------|-------|------|------|
| C1 | **API** | Course sections endpoint requires ADMIN auth → public users see no sections | `sections.ts` | 135 |
| C2 | **API** | Portfolio detail sections never loaded (type assertion `(item as any).sections`) | `san-pham/[id]/page.tsx` | 133 |
| C3 | **API** | N+1 queries: 1 DB call per module in course detail | `courses.ts` | 135-149 |
| C4 | **DB** | Migration SQL missing 4 columns for promotions table (banner, homepage, coupon, usage_limit) | `migrate.ts` | 110-115 |
| C5 | **DB** | Only 1 index in entire DB; 15+ missing indexes → full table scans | `migrate.ts` | 129 |
| C6 | **SEO** | No JSON-LD structured data anywhere | Entire site |
| C7 | **SEO** | Dual `<h1>` on courses page | `khoa-hoc/page.tsx` | 78, 144 |
| C8 | **SEO** | No `<h1>` on homepage | Hero banner section |
| C9 | **SEO** | Contact page has NO metadata (client component) | `lien-he/page.tsx` | 1 |
| C10 | **Perf** | `lien-he` entirely client-side → no SSR, no metadata | `lien-he/page.tsx` | 1 |
| C11 | **Perf** | Admin CSS loaded on all public pages | `layout.tsx` | 4 |

### C1-C2 Fix Details

**C1 — Course sections blocked for public:**

`sections.ts:135` has `authMiddleware("ADMIN")`. But `GET /api/courses/:slug` at `courses.ts:151-164` already returns `sections` in the response. The fix is to use those embedded sections:

```typescript
// khoa-hoc/[slug]/page.tsx - instead of calling getSections(),
// extract sections from the course response:
const course = await getCourse(slug);
const sections = (course as any).sections ?? []; // course response already includes sections
```

Or add `sections` to the `Course` interface and extract from the already-fetched course data.

**C2 — Portfolio sections never loaded:**

Either: (a) Call `GET /api/product/${id}/sections` from the page, or (b) Embed sections in the portfolio detail API response.

---

## HIGH Priority — Fix This Sprint

| # | Category | Issue | File | Effort |
|---|----------|-------|------|--------|
| H1 | **API** | 7 endpoints missing pagination (unbounded SELECT *) | products/portfolios/faqs etc. | Medium |
| H2 | **API** | Memory leak: rate limiter Map never purges old IPs | `rate-limit.ts` | Easy |
| H3 | **API** | 8 queries in admin stats run sequentially | `admin.ts` | Easy (Promise.all) |
| H4 | **API** | Batch settings update: sequential for loop, no transaction | `settings.ts` | Medium |
| H5 | **API** | Leads POST: no Zod validation on public input | `leads.ts` | Medium |
| H6 | **API** | Media count query ignores filters (wrong pagination total) | `media.ts` | Easy |
| H7 | **SEO** | No `<description>` on homepage | `page.tsx` | Easy |
| H8 | **SEO** | All images use raw `<img>` instead of `next/image` — CLS risk | 17 locations | Large |
| H9 | **SEO** | Missing OpenGraph `images` on blog detail, course detail, blog list | 4 pages | Medium |
| H10 | **SEO** | No canonical URLs on any page | All pages | Medium |
| H11 | **SEO** | Missing `viewport` export in root layout | `layout.tsx` | Easy |
| H12 | **Perf** | GSAP registered at module level in 7+ files → can't tree-shake | 7 files | Medium |
| H13 | **Perf** | `BlockRenderer` imports all 23 blocks statically | `BlockRenderer.tsx` | Medium |
| H14 | **Perf** | Sequential waterfall in blog detail (2 fetches not parallel) | `bai-viet/[slug]` | 1 line |
| H15 | **Perf** | YouTube embeds loaded eagerly (hero + portfolio) | `you-tube-embed` + `san-pham/[id]` | Medium |
| H16 | **DSA** | CarouselBlock: setInterval recreated every slide transition | `CarouselBlock.tsx` | Medium |
| H17 | **DSA** | SectionRenderer: no useMemo for filtered/sorted array | `SectionRenderer.tsx` | Easy |

---

## MEDIUM Priority — Fix Next Sprint

| # | Category | Issue | File | Effort |
|---|----------|-------|------|--------|
| M1 | **API** | Unnecessary re-fetch of just-inserted promotionCourses data | `promotions.ts` | Easy |
| M2 | **API** | Duplicated courseId validation in promotions handlers | `promotions.ts` | Medium |
| M3 | **API** | In-memory section filtering instead of DB WHERE clause | `courses.ts` | Easy |
| M4 | **API** | sections table has no FK constraints → orphaned sections | `schema.ts` | Low |
| M5 | **API** | No periodic cleanup for orphaned upload files | media service | Medium |
| M6 | **SEO** | No `error.tsx` boundaries in public pages | All (nguoi-dung) | Medium |
| M7 | **SEO** | Portfolio detail pages not in sitemap | `sitemap.ts` | Easy |
| M8 | **SEO** | Missing `alternates` (hreflang) for multilingual | Root layout | Medium |
| M9 | **Perf** | `promotion-banner` fetches data client-side instead of SSR | `promotion-banner/index.tsx` | Medium |
| M10 | **Perf** | Missing `loading="lazy"` on most images | 10+ locations | Easy |
| M11 | **Perf** | Duplicate settings fetch in lien-he | `lien-he/page.tsx` | Free (part of H1) |
| M12 | **DSA** | No error boundary for public-facing pages | Missing | Medium |
| M13 | **DSA** | No request body size limit at framework level | `upload.ts` | Medium |

---

## LOW Priority — Technical Debt

| # | Category | Issue | Effort |
|---|----------|-------|--------|
| L1 | **API** | Duplicate select-after-mutate pattern in all routes | Easy |
| L2 | **API** | UUID text PKs instead of integer autoincrement (acceptable at current scale) | Hard |
| L3 | **SEO** | `dangerouslySetInnerHTML` on blog excerpt (admin XSS risk) | Easy |
| L4 | **SEO** | Kolker Brush font loaded via blocking `<link>` → should use `next/font/google` | Easy |
| L5 | **SEO** | `lastModified` always `new Date()` in sitemap | Easy |
| L6 | **SEO** | Blog detail openGraph missing `publishedTime`, `author` | Easy |
| L7 | **SEO** | PWA manifest missing `screenshots` array | Easy |
| L8 | **Perf** | No `preconnect` hints for external origins (youtube, minhtravel.vn) | Easy |
| L9 | **Perf** | Duplicate `parseSetting` in settings.ts and parse-setting.ts | Easy |
| L10 | **Perf** | `@dnd-kit` packages in root instead of web app scope | Easy |
| L11 | **Perf** | Missing `sizes` attribute on responsive images | Easy |
| L12 | **DSA** | `daily_course_stats` column not used anywhere (dead column) | Low |
| L13 | **DSA** | `alt=""` on 10+ images — content images need descriptive alt text | Easy |

---

## Quick Wins (Highest ROI / Least Effort — Do These TODAY)

| # | Issue | Fix | Time |
|---|-------|-----|------|
| 1 | Admin CSS loaded on all public pages | Move import to admin layout | 1 min |
| 2 | Sequential waterfall in blog detail | `Promise.all([getPost, getPublishedPosts])` | 1 min |
| 3 | 8 admin stats queries serial | `Promise.all([...])` | 5 min |
| 4 | CarouselBlock interval re-creation | Use ref for current index | 10 min |
| 5 | SectionRenderer no useMemo | Wrap in `useMemo(() => ..., [sections])` | 2 min |
| 6 | Rate limiter memory leak | Add `setInterval` cleanup every 10 min | 10 min |
| 7 | Missing `loading="lazy"` on images | Add attribute to all `<img>` | 15 min |
| 8 | Kolker Brush font | Convert to `next/font/google` | 5 min |
| 9 | No `<h1>` on homepage | Add semantic heading to hero section | 5 min |
| 10 | No `description` on homepage | Add metadata description | 1 min |

---

## API Integration Status (All Public Endpoints)

| Endpoint | Auth | Public Works? | Issue |
|----------|------|---------------|-------|
| `GET /api/settings` | Public | ✅ | OK |
| `GET /api/products?published=true` | Public | ✅ | OK |
| `GET /api/courses?published=true` | Public | ✅ | OK |
| `GET /api/courses/:slug` | Public | ✅ | OK (includes sections, but front-end doesn't extract them) |
| `GET /api/course/:entityId/sections` | **ADMIN** | ❌ | **BLOCKED** — public 401. Use embedded sections instead. |
| `GET /api/faqs` | Public | ✅ | OK |
| `POST /api/leads` | Public | ✅ | OK (rate-limited 3/hr, no Zod schema) |
| `GET /api/posts?published=true` | Public | ✅ | OK |
| `GET /api/posts/:slug` | Public | ✅ | OK |
| `GET /api/portfolios` | Public | ✅ | OK |
| `GET /api/portfolios/:id` | Public | ✅ | OK (but no sections field) |
| `GET /api/promotions/homepage-banner` | Public | ✅ | OK |
| `GET /api/product/:entityId/sections` | **ADMIN** | ❌ | Same as course sections |

---

## Image Optimization Status

| Location | Has `next/image`? | Has dimensions? | Has `loading="lazy"`? |
|----------|-------------------|-----------------|----------------------|
| Homepage hero logo | ❌ | ❌ | ❌ |
| Course cards | ❌ | ❌ | ✅ |
| Blog cards | ❌ | ❌ | ❌ |
| Blog detail thumbnails | ❌ | ❌ | ❌ |
| Portfolio cards | ❌ | ❌ | ❌ |
| Portfolio detail hero | ❌ | ❌ | ❌ |
| Presets product grid | ❌ | ❌ | ❌ |
| SiteHeader logo | ❌ | ❌ | ❌ |
| SiteFooter logo | ❌ | ❌ | ❌ |
| ImageBlock (content) | ❌ | ❌ | ✅ |
| GalleryBlock (content) | ❌ | ❌ | ✅ |
| CarouselBlock (content) | ❌ | ❌ | ✅ |

---

## Rendering Strategy Status

| Page | Render | Should Be | Issue |
|------|--------|-----------|-------|
| `/` (homepage) | Dynamic (ƒ) | Dynamic | OK — uses cookies for preview |
| `/cong-cu` | Dynamic (ƒ) | ISR (60s) | OK |
| `/khoa-hoc` | Dynamic (ƒ) | ISR (60s) | OK |
| `/khoa-hoc/[slug]` | Dynamic (ƒ) | Dynamic | BROKEN — sections 401 |
| `/bai-viet` | Dynamic (ƒ) | ISR (300s) | OK |
| `/bai-viet/[slug]` | Dynamic (ƒ) | ISR (60s) | Sequential waterfall |
| `/san-pham` | Dynamic (ƒ) | ISR (300s) | OK — dead code `getPortfolioItem` |
| `/san-pham/[id]` | Dynamic (ƒ) | Dynamic | BROKEN — sections missing |
| `/lien-he` | Dynamic (ƒ) | **Static + island** | Entire page is client component |
| `/xem-truoc` | Dynamic (ƒ) | Dynamic | OK — needs sessionStorage |

---

## Database Index Audit

### Existing indexes: 1 (only `idx_sections_entity`)

### Missing indexes (15+):

| Table | Column(s) | Query pattern |
|-------|-----------|---------------|
| `leads` | `status` | WHERE status = ? |
| `leads` | `created_at` | ORDER BY DESC |
| `courses` | `is_published` | WHERE is_published = 1 |
| `courses` | `is_featured_on_home` | WHERE is_featured_on_home = 1 |
| `posts` | `category_id` | WHERE category_id = ? |
| `posts` | `is_published` | WHERE is_published = 1 |
| `posts` | `created_at` | ORDER BY DESC |
| `digital_products` | `is_published` | WHERE is_published = 1 |
| `portfolios` | `is_featured_on_home` | WHERE is_featured_on_home = 1 |
| `promotions` | `(is_active, start_date, end_date)` | Composite: active+date range |
| `testimonials` | `course_id` | WHERE course_id = ? |
| `faqs` | `course_id` | WHERE course_id = ? |
| `sections` | `is_published` | WHERE is_published = 1 |
| `media` | `mime_type` | WHERE mime_type LIKE |
| `media` | `uploaded_at` | ORDER BY DESC |

---

## Complexity Summary

| Pattern | Instances | Severity |
|---------|-----------|----------|
| N+1 queries | 1 (lessons per module) | CRITICAL |
| O(n) unbounded SELECT | 7 endpoints | HIGH |
| Sequential DB ops (not parallel) | admin stats (8), batch settings (N) | HIGH |
| Missing indexes | 15+ tables | HIGH |
| Memory leak | rate limiter Map | HIGH |
| No Zod validation on input | leads POST, media PATCH | MEDIUM |
| Client component isolation issues | lien-he page, promotion-banner | MEDIUM |
| Unnecessary re-fetch after insert | promotions | MEDIUM |
| UUID text PKs | All tables | LOW (acceptable) |

---

## Next Steps

1. **Fix 2 critical API bugs** (C1-C2) — course sections + portfolio sections
2. **Fix DB migration** (C4) — add missing promotions columns to migrate.ts
3. **Quick wins** (10 items, ~1 hour total)
4. **Add JSON-LD structured data** (C6) — Organization, Article, Course, BreadcrumbList
5. **Switch to `next/image`** (H8) — all public page images
6. **Add DB indexes** (C5) — 15+ missing
7. **Add pagination** to 7 endpoints (H1)
8. **Refactor lien-he** to Server Component + form island (C10)

---

## Đã làm được
- 4 sub-agents chạy song song audit: Business/API, SEO/Metadata, Performance/Rendering, DSA/Complexity
- 55+ findings được phân loại: 11 CRITICAL, 17 HIGH, 13 MEDIUM, 13 LOW
- Tất cả API endpoints được trace và verify field name mapping
- Tất cả public pages được audit rendering strategy
- Database schema + migration audit với 15+ missing indexes
- Image optimization audit 12 vị trí
- 10 quick wins liệt kê để fix ngay

## Chưa làm được
- Chưa chạy Lighthouse/Web Vitals thực tế (cần môi trường production)
- Chưa chạy `EXPLAIN QUERY PLAN` cho index recommendations (cần DB connection)
- Chưa test runtime API flow (chỉ static code audit)
- Chưa audit admin pages

## Vì sao chưa làm được
- Lighthouse cần production deployment với real data
- EXPLAIN cần database connection + data thực
- Admin pages ngoài scope "public-facing website"
