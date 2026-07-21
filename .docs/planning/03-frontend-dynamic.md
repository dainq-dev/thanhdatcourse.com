# Planning 03: Frontend Dynamic Conversion — Next.js Pages & Data Fetching

**Part of:** Delivery Planning
**Ref:** Specs 01-10, nextjs.prompt.md, DYNAMIC-CONVERSION-BLUEPRINT.md Section 4, 6
**Status:** Draft

---

## 1. Architecture: Server Components by Default

```
Page Data Flow:
────────────────

┌────────────────────────────────────────────────────────────┐
│                  NEXT.JS 16 SERVER                          │
│                                                             │
│  1. Request arrives at route (e.g., /khoa-hoc)              │
│  2. Server Component executes:                              │
│     - Fetch data from Hono API (RPC, type-safe)             │
│     - Apply cache (React cache() + unstable_cache)          │
│     - Generate metadata (SEO)                               │
│     - Render HTML                                           │
│  3. Stream HTML to browser (SSR)                            │
│                                                             │
│  Data fetching locations:                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Root Layout (app/layout.tsx)                         │   │
│  │   → getSiteSettings()  — 1 call, cached, passed down │   │
│  │                                                      │   │
│  │ Page (e.g., khoa-hoc/page.tsx)                       │   │
│  │   → api.courses.$get()  — public data                │   │
│  │   → api.faqs.$get()     — public data                │   │
│  │                                                      │   │
│  │ Page (e.g., khoa-hoc/[slug]/page.tsx)                │   │
│  │   → api.courses[':slug'].$get()                      │   │
│  │   → api.courses[':id'].modules.$get()                │   │
│  │   → api.courses[':id'].testimonials.$get()           │   │
│  │   → api.faqs.$get({ query: { course_id } })          │   │
│  │                                                      │   │
│  │ Admin Pages (quan-tri-vien/*)                        │   │
│  │   → 'use client' layout (sidebar needs pathname)     │   │
│  │   → Client-side data fetching (SWR/React Query)      │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                  BROWSER (HYDRATION)                        │
│                                                             │
│  'use client' components mount:                             │
│  - GSAP/ScrollTrigger animations (sections)                 │
│  - Counter animation (useCounterAnimation)                  │
│  - Form interactions (contact, login, register, admin forms) │
│  - Messenger button                                         │
│  - Block Editor (admin)                                     │
│  - Media Library modal (admin)                              │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Page Conversion Strategy: How Each Page Goes Dynamic

### Strategy: Replace mockData imports with API calls. Keep component structure intact.

#### Current Pattern (mockData)
```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
import { mockCourses, mockFAQs } from '@/lib/mockData';

export default function KhoaHocPage() {
  return (
    <div>
      {mockCourses.map(course => <Card key={course.id} data={course} />)}
      {mockFAQs.map(faq => <Accordion key={faq.question} data={faq} />)}
    </div>
  );
}
```

#### Dynamic Pattern (API)
```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
import { api } from '@/lib/rpc';

export default async function KhoaHocPage() {
  const [coursesRes, faqsRes] = await Promise.all([
    api.courses.$get({ query: { published: 'true' } }),
    api.faqs.$get({ query: {} }), // global FAQs
  ]);
  const courses = await coursesRes.json();
  const faqs = await faqsRes.json();

  return (
    <div>
      {courses.map(course => <Card key={course.id} data={course} />)}
      {faqs.map(faq => <Accordion key={faq.id} data={faq} />)}
    </div>
  );
}
```

### Conversion Mapping per Page

| Page | Data Needed | API Calls | Keep/Drop |
|------|-------------|-----------|-----------|
| **Homepage** | siteSettings only | `getSiteSettings()` in layout, pass via props | Keep: all section components. Refactor: accept settings props instead of hardcode. |
| `/khoa-hoc` | Courses + global FAQs + siteSettings | `api.courses`, `api.faqs`, settings from layout | Keep: card layout, stagger animation. Drop: `mockCourses`, `mockFAQs`. Replace: `CourseCard` molecule. |
| `/khoa-hoc/[slug]` | Course + curriculum + testimonials + FAQs + promotion | 5 parallel API calls | Keep: hero, brand, target badges, modules, bonus, testimonial sections, sticky CTA. Drop: `mockCourses`, `getCourseDetailExtras`. |
| `/bai-viet` | Posts + siteSettings | `api.posts`, settings from layout | Keep: card layout. Drop: `mockArticles`. Replace: `ArticleCard` molecule. Add: real pagination. |
| `/bai-viet/[slug]` | Post + related posts | `api.posts[':slug']`, `api.posts` (related) | Keep: layout. Drop: `mockArticles`. Replace: `dangerouslySetInnerHTML` → `BlockRenderer`. |
| `/san-pham` | Portfolios + siteSettings | `api.portfolios`, settings from layout | Keep: alternating layout. Drop: `mockPortfolioItems`. Replace: `PortfolioCard` molecule. |
| `/cong-cu` | Products + siteSettings | `api.products`, settings from layout | Keep: layout. Drop: `mockPresets`. Replace: `PresetCard` molecule. |
| `/lien-he` | siteSettings | Settings from layout | Keep: form. Replace: hardcoded info → settings. Add: real form POST. |

---

## 3. Global Data Fetching Strategy

### Site Settings Cache

```typescript
// apps/web/src/lib/settings.ts
import { api } from './rpc';
import { cache } from 'react';

// React cache() deduplicates calls within a single render pass
export const getSiteSettings = cache(async () => {
  const res = await api.settings.$get();
  const settings = await res.json();

  // Convert array of {key, value} to flat object
  const map: Record<string, string> = {};
  for (const item of settings) {
    map[item.key] = item.value;
  }
  return map;
});

// Helper: parse a JSON setting with type safety + fallback
export function parseSetting<T>(settings: Record<string, string>, key: string, fallback: T): T {
  try {
    const val = settings[key];
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
```

### Root Layout — Fetch Once, Pass Down

```typescript
// apps/web/src/app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="vi">
      <body>
        <SiteHeader settings={settings} />
        <main>{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
```

### Metadata Generation — Dynamic from API

```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await api.courses[':slug'].$get({ param: { slug: params.slug } });
    if (!res.ok) return { title: 'Không tìm thấy' };
    const course = await res.json();

    return {
      title: `${course.title}`,
      description: course.description,
      openGraph: {
        title: course.title,
        description: course.description,
        images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [],
      },
    };
  } catch {
    return { title: 'Minh Travel' };
  }
}
```

---

## 4. Animation Preservation Rule

```
CRITICAL RULE: All GSAP/ScrollTrigger animations are PRESERVED AS-IS.
───────────────────────────────────────────────────────────────────

Animation components that MUST NOT BE MODIFIED:
  - hero-banner/index.logic.ts       (parallax video)
  - hero-banner/index.tsx            (timeline fade-in)
  - animated-section/index.logic.ts   (blur+fade reveal)
  - stagger-reveal/index.logic.ts     (stagger fade+scale)
  - work-section/index.tsx            (card reveal, inline useGSAP)
  - product-section/index.tsx         (card reveal, inline useGSAP)
  - counter-section/Counter.logic.ts  (number count animation)
  - khoa-hoc/[slug]/StickyCTA.logic.ts (sticky bar reveal)

Data source changes (mockData → API) DO NOT AFFECT animations.
The animation triggers (ScrollTrigger) and targets (data- attributes)
remain identical. Only the CONTENT rendered inside changes.
```

---

## 5. Client vs Server Component Decision Matrix

| Component | Server/Client | Reason |
|-----------|---------------|--------|
| Root Layout | Server | Fetch settings, generate metadata |
| Public Pages (listing/detail) | Server | Fetch data, SSR for SEO |
| SiteHeader | Client (already) | `usePathname()` for active nav state, scroll listener |
| SiteFooter | Server | Static content from settings |
| HeroBanner | Client (already) | GSAP ScrollTrigger animations |
| WorkSection | Client (already) | GSAP ScrollTrigger animations |
| ProductSection | Client (already) | GSAP ScrollTrigger animations |
| CounterSection | Client (already) | `useCounterAnimation` with scroll trigger |
| AboutSection | Server | Pure text render, no interactivity |
| MessengerButton | Client (already) | Fixed position FAB |
| Course/Blog Cards | Server | Render in page, no interactivity |
| Accordion (FAQ) | Client (already) | Toggle open/close state |
| Breadcrumbs | Server | Static from URL |
| Contact Form | Client | Form state, submission |
| Auth Pages | Client | Form state, validation |
| Admin Layout | Client | `usePathname()`, session check |
| Admin Pages | Client | Forms, tables, modals — heavy interactivity |
| Block Editor | Client | Drag-drop, state management |
| BlockRenderer (public) | Server | Pure render, no interactivity |
| Media Library Modal | Client | Modal state, upload |

---

## 6. Hono RPC Client Setup

```typescript
// apps/web/src/lib/rpc.ts
import { hc } from 'hono/client';
import type { AppType } from '@workspace/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Server-side client (for Server Components)
export const api = hc<AppType>(API_URL);

// Optional: Client-side wrapper with auth token injection
export function createAuthenticatedClient(token: string) {
  return hc<AppType>(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

---

## 7. SEO-First Rendering Strategy

### Priority Hierarchy: SSR > SSG > ISR > CSR

```
┌─────────────────────────────────────────────────────────────────┐
│                   SEO PRIORITY PYRAMID                           │
│                                                                  │
│                         ┌─────┐                                  │
│                         │ SSR │  ← Default cho mọi public page   │
│                         └──┬──┘     SEO tối đa, data luôn fresh  │
│                            │                                     │
│                     ┌──────┴──────┐                              │
│                     │     SSG     │  ← Chỉ dùng khi data KHÔNG   │
│                     │ pre-render │     đổi (contact page)        │
│                     └──────┬──────┘                              │
│                            │                                     │
│                     ┌──────┴──────┐                              │
│                     │     ISR     │  ← Pre-render + revalidate   │
│                     │ revalidate  │     định kỳ. Hữu ích cho     │
│                     │   periodic  │     page ít thay đổi.        │
│                     └──────┬──────┘                              │
│                            │                                     │
│                     ┌──────┴──────┐                              │
│                     │     CSR     │  ← CHỈ dùng cho Admin        │
│                     │ client-only │     Dashboard (behind auth)  │
│                     └─────────────┘     KHÔNG DÙNG cho public    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Rule: Public Pages = SSR First

Website `(nguoi-dung)` cần SEO điểm cao → mọi public page **phải** render trên server. HTML được gửi đầy đủ cho crawler (Google, Facebook, Twitter). Không có public page nào là CSR.

### Rule: Admin Pages = CSR (Client-Only)

Admin Dashboard `/quan-tri-vien/*` nằm sau auth, không cần SEO → dùng Client Components 100%.
- Không SSR admin pages (tốn tài nguyên vô ích, không ai index)
- Admin layout có `'use client'` ở đầu file
- Tất cả data fetching trong admin dùng client-side (SWR/React Query hoặc fetch trực tiếp)

### Rendering Decision Matrix

| Page | Strategy | Reason |
|------|----------|--------|
| **Homepage** | SSR + Cache 60s | Content changes via site_settings. Server render đảm bảo meta tags, OG tags luôn fresh. |
| `/khoa-hoc` | SSR | Courses change often (pricing, publish/draft), filter/search query params. Crawler cần thấy full course list. |
| `/khoa-hoc/[slug]` | SSG (generateStaticParams) + ISR 300s | Course detail pages pre-rendered at build time. ISR revalidate every 5 min for price changes. |
| `/bai-viet` | SSR | Pagination với `searchParams`. New articles published → crawler thấy ngay. |
| `/bai-viet/[slug]` | SSG (generateStaticParams) + ISR 300s | Blog posts pre-rendered. ISR for edits. |
| `/san-pham` | SSG + ISR 600s | Portfolio rarely changes. Pre-render all, revalidate every 10 min. |
| `/cong-cu` | SSG + ISR 600s | Products rarely change. Same as portfolio. |
| `/lien-he` | SSG (Static) | Pure content from site_settings. No DB queries. Build once, serve forever. |
| `/xac-thuc/*` | CSR | Login/register forms. No SEO value. |
| **Admin `/quan-tri-vien/*`** | CSR | Behind auth. No SEO. 100% Client Components. |

### Implementation Patterns

#### Pattern A: SSR — Server Component with revalidate (for dynamic data)
```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
export const revalidate = 60; // ISR fallback: re-generate every 60s if no request
// But page is SSR by default due to searchParams usage

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams; // ← Using searchParams → Dynamic Rendering (SSR)

  const res = await api.courses.$get({
    query: { published: 'true', page: page || '1', limit: '12' },
  });
  const { courses, total } = await res.json();

  return <CourseGrid courses={courses} total={total} />;
}
```

#### Pattern B: SSG + ISR (for semi-static content)
```typescript
// apps/web/src/app/(nguoi-dung)/san-pham/page.tsx
export const revalidate = 600; // ISR: re-generate every 10 minutes

export default async function PortfolioPage() {
  const res = await api.portfolios.$get();
  const portfolios = await res.json();

  return <PortfolioList items={portfolios} />;
}
```

#### Pattern C: SSG — generateStaticParams (pre-render all known slugs)
```typescript
// apps/web/src/app/(nguoi-dung)/bai-viet/[slug]/page.tsx

// Pre-render all published post slugs at build time
export async function generateStaticParams() {
  const res = await api.posts.$get({ query: { published: 'true', limit: '1000' } });
  const posts = await res.json();
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

// ISR: revalidate individual pages on demand
export const revalidate = 300;

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await api.posts[':slug'].$get({ param: { slug } });
  if (!res.ok) return { title: 'Không tìm thấy' };
  const post = await res.json();

  return {
    title: post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // ...render
}
```

#### Pattern D: Static — Build once, never re-fetch
```typescript
// apps/web/src/app/(nguoi-dung)/lien-he/page.tsx
export const dynamic = 'force-static'; // SSG, build once

export default function ContactPage() {
  // All content from site_settings fetched in layout (already static)
  return <ContactForm />;
}
```

#### Pattern E: CSR — Admin pages (Client Components only)
```typescript
// apps/web/src/app/quan-tri-vien/layout.tsx
'use client'; // ← Entire admin layout is client-side

import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  if (isLoading) return <AdminSkeleton />;
  if (!user || user.role !== 'ADMIN') {
    router.replace('/xac-thuc/dang-nhap');
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

### On-Demand Revalidation (When Admin Updates Content)

Khi admin save (VD: edit course, publish article), API gọi Next.js revalidation:

```typescript
// In admin page or API route:
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function publishCourse(courseId: string) {
  // ... save to DB via Hono API
  revalidatePath('/khoa-hoc');                    // Revalidate listing page
  revalidatePath(`/khoa-hoc/${courseSlug}`);      // Revalidate detail page
  revalidateTag('courses');                       // Revalidate all cached course queries
}
```

### SEO Special Files

```typescript
// apps/web/src/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://minhtravel.vn';

  // Static pages
  const staticPages = ['', '/khoa-hoc', '/bai-viet', '/san-pham', '/cong-cu', '/lien-he']
    .map(path => ({ url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: 'weekly' as const }));

  // Dynamic: courses
  const coursesRes = await api.courses.$get({ query: { published: 'true', limit: '1000' } });
  const courses = await coursesRes.json();
  const coursePages = courses.map((c: { slug: string }) => ({
    url: `${BASE}/khoa-hoc/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }));

  // Dynamic: blog posts
  const postsRes = await api.posts.$get({ query: { published: 'true', limit: '1000' } });
  const posts = await postsRes.json();
  const postPages = posts.map((p: { slug: string }) => ({
    url: `${BASE}/bai-viet/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return [...staticPages, ...coursePages, ...postPages];
}
```

```typescript
// apps/web/src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/quan-tri-vien/' },
    sitemap: 'https://minhtravel.vn/sitemap.xml',
  };
}
```

---

## 8. Loading, Error & Not Found States

---

## 8. Loading & Error States

```typescript
// Loading state — loading.tsx (colocated with page.tsx)
export default function Loading() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="card-skeleton" />
      ))}
    </div>
  );
}

// Error state — error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-state">
      <h2>Đã xảy ra lỗi</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}

// Not found — not-found.tsx
export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Không tìm thấy</h1>
      <p>Trang hoặc nội dung bạn đang tìm không tồn tại.</p>
    </div>
  );
}
```
