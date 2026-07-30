# Phase 5.2: Homepage Dynamic — Hook Settings vào Trang chủ

**Duration:** 2-3 hours | **Depends on:** Phase 5.1 (Settings Live Preview), Phase 2.1 (Site Settings)
**TDD:** Bun test cho unit logic. GSAP components: manual QA.
**Ref:** [Planning 08: Homepage Dynamic](../planning/08-homepage-dynamic-settings.md)
**Render priority:** ISR (server-rendered HTML, cache 60s) — tối ưu cho SEO

---

## SEO Analysis (Section 0 — bắt buộc đọc trước khi implement)

### Render strategy cho homepage

| Tiêu chí | Trước fix | Sau fix | SEO Impact |
|----------|-----------|---------|------------|
| **Render mode** | `○` SSG (build-time HTML) | `ƒ` ISR (server-rendered, cache 60s) | ⚠️ Chuyển từ pre-render build → first-request render |
| **Googlebot thấy gì?** | HTML tĩnh (hardcoded text) | HTML động nhưng hoàn chỉnh (server-rendered) | ✅ Googlebot thấy đầy đủ text, meta, OG |
| **Cache** | Cache forever (build artifact) | `Cache-Control: max-age=60` | ✅ Tốc độ ngang SSG 99% thời gian |
| **Revalidation** | Redploy toàn bộ | Tự động sau 60s khi admin save | ✅ Nội dung mới nhất |
| **Core Web Vitals** | LCP/CLS/INP không đổi | LCP/CLS/INP không đổi | ✅ HTML vẫn server-rendered, JS hydration giống hệt |
| **Sitemap / meta / OG** | Không đổi | Không đổi | ✅ |

### Tại sao SSG không khả thi với dynamic settings

SSG yêu cầu toàn bộ dữ liệu có sẵn lúc build. `getSiteSettings()` gọi API + đọc cookie → Next.js phát hiện dynamic data path → force dynamic rendering. **Không thể có cả 2**: SSG thuần túy VÀ admin live preview realtime. Phải chọn ISR.

### Chiến lược render hiện tại của toàn bộ website

| Page | Render | Lý do |
|------|--------|-------|
| `/` (homepage) | `ƒ` ISR 60s | Dùng `getSiteSettings()` — dynamic data |
| `/khoa-hoc` | `ƒ` ISR 60s | Dùng `getSiteSettings()` + fetch courses |
| `/khoa-hoc/[slug]` | `ƒ` ISR 60s | Dynamic data per course |
| `/bai-viet` | `○` SSG + ISR 60s | Cache 60s từ API |
| `/bai-viet/[slug]` | `ƒ` ISR 60s | Dynamic post content |
| `/san-pham` | `ƒ` ISR 300s | Dùng `getSiteSettings()` |
| `/cong-cu` | `ƒ` ISR 300s | Dùng `getSiteSettings()` |
| `/lien-he` | `○` SSG | Client-side form, không dynamic data |
| `/quan-tri-vien/*` | `○` CSR | Admin pages, không cần SEO |

**Kết luận**: ISR là điểm ngọt giữa SEO (HTML đầy đủ) và linh hoạt (admin đổi nội dung không cần redeploy). Toàn bộ user-facing pages đã dùng ISR, homepage cũng sẽ theo pattern này.

---

## Module 5.2: Homepage Settings Integration

> **Why this phase exists:** 33/55 settings thuộc về Trang chủ nhưng không được sử dụng — các section component hardcode toàn bộ nội dung. Fix bằng Server Component Wrapper Pattern: page.tsx async fetch settings → pass xuống section components qua props.

### Task 5.2.1: page.tsx — Async Server Component Wrapper

**What:** `apps/web/src/app/(nguoi-dung)/page.tsx` từ server component đồng bộ (không await) → async server component, gọi `getSiteSettings()`, pass settings object xuống tất cả section component.

**Before:**
```typescript
export default function Homepage() {
  return (
    <>
      <HeroBanner />
      <WorkSection />
      ...
    </>
  );
}
```

**After:**
```typescript
export default async function Homepage() {
  const settings = await getSiteSettings();
  return (
    <>
      <HeroBanner settings={settings} />
      <WorkSection settings={settings} />
      <ProductSection settings={settings} />
      <CounterSection settings={settings} />
      <AboutSection settings={settings} />
      <MessengerButton settings={settings} />
    </>
  );
}
```

**Props interface:** `{ settings: Record<string, string> }` cho mỗi section.

**Verification:** page.tsx renders in browser → settings flow to child components.

### Task 5.2.2: HeroBanner — Dynamic Settings

**What:** `apps/web/src/components/sections/hero-banner/index.tsx` accept `settings` prop, thay thế 9 hardcoded values.

**Mapping:**

| Hardcoded | Settings key | Fallback |
|-----------|-------------|----------|
| `"utP7z6_Zcwg"` | `hero_youtube_id` | `"utP7z6_Zcwg"` |
| `"THE FORGOTTEN..."` | `hero_video_title` | `"THE FORGOTTEN DREAM..."` |
| `"Kể câu chuyện..."` | `hero_tagline` | `"Kể câu chuyện của bạn..."` |
| Logo src URL | `hero_logo_url` | `"https://minhtravel.vn/.../logo-...png"` |
| `"KHOÁ HỌC CỦA TÔI"` | `hero_btn1_text` | `"KHOÁ HỌC CỦA TÔI"` |
| `"https://hoc.minhtravel.vn/"` | `hero_btn1_url` | `"https://hoc.minhtravel.vn/"` |
| `"ĐĂNG KÝ HỌC"` | `hero_btn2_text` | `"ĐĂNG KÝ HỌC"` |
| `"/khoa-hoc"` | `hero_btn2_url` | `"/khoa-hoc"` |
| `<li>sony</li>...` (8 brands) | `hero_brands` (JSON) | `[{name:"sony"},{name:"lg"},...]` |

**Best Practices:**
- Parse `hero_brands` via `parseSetting()` helper
- GSAP animation vẫn hoạt động (giữ `"use client"`, `useHeroAnimation`)
- Empty string fallback → dùng default value

**Test Cases:**
```
[ ] HeroBanner renders from settings prop (not hardcoded)
[ ] hero_tagline from settings overrides default
[ ] hero_youtube_id from settings changes video
[ ] hero_btn1_text/url from settings changes button
[ ] hero_brands JSON parses correctly
[ ] Empty/undefined settings → falls back to hardcoded defaults
[ ] GSAP animation still works (video parallax scrim)
```

### Task 5.2.3: WorkSection — Dynamic Settings

**What:** `apps/web/src/components/sections/work-section/index.tsx` accept `settings` prop, đọc 8 `home_work_*` keys.

**Current hardcoded:**
```typescript
// Heading
<h2>Làm việc</h2>

// Card 1
<h3>Thanhdatcomputer.com</h3>
<p>Thiết kế & xây dựng...</p>
<Link>Xem dự án</Link>
href="/san-pham"

// Card 2
<h3>Minh Travel x Honda Winner X</h3>
<p>TV commercial...</p>
<Link>Xem dự án</Link>
href="/san-pham"
```

**Mapping:**

| Hardcoded | Settings key |
|-----------|-------------|
| `"Làm việc"` | `home_work_heading` |
| `"Thanhdatcomputer.com"` | `home_work_card1_title` |
| `"Thiết kế..."` | `home_work_card1_desc` |
| `"Xem dự án"` | `home_work_card1_link_text` |
| `"/san-pham"` | `home_work_card1_href` |
| `"Minh Travel x Honda..."` | `home_work_card2_title` |
| `"TV commercial..."` | `home_work_card2_desc` |
| `"Xem dự án"` | `home_work_card2_link_text` |
| `"/san-pham"` | `home_work_card2_href` |

**Test Cases:**
```
[ ] WorkSection renders heading from settings
[ ] Card 1 shows dynamic title/description/link
[ ] Card 2 shows dynamic title/description/link
[ ] ScrollTrigger GSAP animation still works
```

### Task 5.2.4: ProductSection — Dynamic Settings

**What:** `apps/web/src/components/sections/product-section/index.tsx` accept `settings` prop, đọc 8 `home_products_*` keys.

**Mapping:**

| Hardcoded | Settings key |
|-----------|-------------|
| `"Sản phẩm"` | `home_products_heading` |
| Card labels/titles/descriptions/hrefs | `home_products_card1/2_label/title/desc/href` |

**Test Cases:**
```
[ ] ProductSection renders heading from settings
[ ] Card 1 shows dynamic label/title/description/link
[ ] Card 2 shows dynamic label/title/description/link
[ ] GSAP animation still works
```

### Task 5.2.5: CounterSection — Dynamic Settings

**What:** `apps/web/src/components/sections/counter-section/index.tsx` accept `settings` prop, parse `home_counters` JSON string thành array.

**Before:**
```typescript
const COUNTER_DATA = [
  { label: "Facebook followers", value: 38760 },
  ...
];
```

**After:**
```typescript
const counters = parseSetting(settings, "home_counters", [
  { label: "Facebook followers", value: 38760 },
  { label: "Instagram followers", value: 14856 },
  { label: "YouTube subscribers", value: 112287 },
  { label: "Tiktok followers", value: 443238 },
]);
```

**Test Cases:**
```
[ ] CounterSection renders from parsed JSON settings
[ ] Empty settings → falls back to 4 default counters
[ ] Invalid JSON → falls back to default values
[ ] Counter numbers animate with GSAP
```

### Task 5.2.6: AboutSection — Dynamic Settings

**What:** `apps/web/src/components/sections/about-section/index.tsx` accept `settings` prop, đọc `home_about_text_1` và `home_about_text_2`.

**Before:**
```tsx
<p>Minh Travel nổi bật với phong cách...</p>
<p>Minh nổi tiếng với việc không ngừng...</p>
```

**After:**
```tsx
<p>{settings.home_about_text_1 || "Minh Travel nổi bật với..."}</p>
<p>{settings.home_about_text_2 || "Minh nổi tiếng với việc..."}</p>
```

**Test Cases:**
```
[ ] AboutSection renders from settings
[ ] Empty text → falls back to default paragraphs
```

### Task 5.2.7: MessengerButton — Dynamic Settings

**What:** `apps/web/src/components/sections/messenger-button/index.tsx` accept `settings` prop, đọc `messenger_url`, `messenger_aria_label`, `messenger_title`.

**Before:**
```tsx
<a href="https://www.messenger.com/t/137051212834178/"
   aria-label="Chat qua Messenger"
   title="Chat với Minh Travel">
```

**After:**
```tsx
<a href={settings.messenger_url || "https://m.me/minhtravel11/"}
   aria-label={settings.messenger_aria_label || "Chat qua Messenger"}
   title={settings.messenger_title || "Chat với Minh Travel"}>
```

**Test Cases:**
```
[ ] MessengerButton uses settings for href/aria-label/title
[ ] Empty settings → falls back to defaults
[ ] SVG icon still renders
```

---

### Task 5.2.8: Final Build & Smoke Test

**What:** Build verification + manual QA end-to-end.

**Checklist:**
```
[ ] bun run build → 0 errors
[ ] bun run lint → 0 noExplicitAny errors
[ ] bun dev starts all 3 services
[ ] Navigate to /quan-tri-vien/cai-dat
[ ] Change hero_tagline to "TEST TAGLINE 123"
[ ] Switch preview tab to "Trang chủ" → hero text changes to "TEST TAGLINE 123"
[ ] Change home_work_heading → preview shows new heading
[ ] Change home_about_text_1 → preview shows new text
[ ] Change messenger_url → preview button link changes
[ ] Click "Lưu thay đổi" → settings persist
[ ] Open / in new tab → settings applied (no cookie, real DB values)
```

---

## Task Summary

| Task | File(s) | Effort | Test Type |
|------|---------|--------|-----------|
| 5.2.1 page.tsx async wrapper | `(nguoi-dung)/page.tsx` | 10 min | Manual QA |
| 5.2.2 HeroBanner | `hero-banner/index.tsx` | 20 min | Manual QA |
| 5.2.3 WorkSection | `work-section/index.tsx` | 15 min | Manual QA |
| 5.2.4 ProductSection | `product-section/index.tsx` | 15 min | Manual QA |
| 5.2.5 CounterSection | `counter-section/index.tsx` | 10 min | Manual QA |
| 5.2.6 AboutSection | `about-section/index.tsx` | 5 min | Manual QA |
| 5.2.7 MessengerButton | `messenger-button/index.tsx` | 5 min | Manual QA |
| 5.2.8 Final verification | — | 10 min | Build + smoke test |

**Total estimate: ~1.5 hours (0.25 day)**

---

## Dependencies & Prerequisites

```
Phase 5.2
  ├── Phase 5.1 (Settings Live Preview) ✅ DONE
  ├── Phase 2.1 (Site Settings CMS)      ✅ DONE
  ├── Phase 1.1 (Authentication)         ✅ DONE
  └── Planning 08 (Homepage Dynamic)     ✅ DONE
```

---

## TDD Convention

```
For each task:
1. Code → hot reload verify in browser
2. Biome lint → clean
3. TypeScript typecheck → 0 errors
4. Manual QA per checklist
```

Tasks là frontend UI (React component + GSAP) → manual QA thay cho automated test.

---

## Rollback

Mỗi section giữ fallback về hardcoded cũ nếu key chưa tồn tại trong settings. Production không có cookie `preview_settings` → settings = DB values. DB chưa có → fallback hardcoded. Không break.
