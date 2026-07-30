# Planning 08: Homepage Dynamic — Hook settings vào Trang chủ

**Part of:** Delivery Planning  
**Ref:** [Spec 01: Site Settings CMS](../specs/01-site-settings-cms.md), [Spec 11: Site Settings Live Preview](../specs/11-site-settings-live-preview.md), [Planning 07: Settings Live Preview](./07-settings-live-preview.md)  
**Status:** Draft  
**Date:** 2026-07-22

---

## 1. Problem Statement

Sau khi implement Live Preview Panel (Planning 07), admin có thể chỉnh sửa 55+ settings và thấy preview 1:1 trên hầu hết các trang. **Nhưng Trang chủ (`/`) vẫn hiển thị nội dung hardcoded** — không phản ánh bất kỳ setting nào.

**Root cause:** Tất cả section trên homepage đều là **hardcoded data trong client components**. Không component nào gọi `getSiteSettings()`.

**Impact:** 33/55 settings (60%) liên quan đến homepage không có hiệu lực trên preview. Admin chỉnh `hero_tagline`, `home_work_heading`, `home_about_text_1`... nhưng preview Trang chủ vẫn không đổi.

**Success criteria:**
- Admin thay đổi bất kỳ homepage setting nào → preview Trang chủ phản ánh ngay (qua cookie override)
- Live preview split-screen hoạt động đúng cho tab "Trang chủ"
- Animation GSAP vẫn hoạt động bình thường
- SEO không bị ảnh hưởng (giữ nguyên ISR)

---

## 2. SEO Impact Analysis

### 2.1 Priority: SSG > ISR > SSR > CSR

| Tier | Render Strategy | Hiện tại | Sau khi fix |
|------|----------------|----------|------------|
| **SSG** (Static Generation) | Pre-render HTML lúc build, serve từ CDN | ❌ Trang chủ đang `○` (static) | ⚠️ → `ƒ` (ISR) |
| **ISR** (Incremental Static Regeneration) | Render lần đầu, cache có TTL, re-fetch sau TTL | Các trang khác dùng ISR 60s | ✅ Giữ nguyên |
| **SSR** (Server-Side Render) | Render mỗi request | Không dùng | Không dùng |
| **CSR** (Client-Side Render) | JS render trong browser | ❌ SEO kém | Không dùng |

### 2.2 Tại sao homepage chuyển từ `○` (SSG) sang `ƒ` (ISR) là chấp nhận được

Hiện tại homepage build-time pre-rendered (SSG) — HTML tĩnh trong `.next/server/app/`. Sau khi fix, homepage gọi `getSiteSettings()` → dùng `cookies()` từ `next/headers` → Next.js phát hiện dynamic API → đánh dấu page là `ƒ` (dynamic rendering/ISR).

**ISR vẫn cực kỳ SEO-friendly:**
1. **HTML đầy đủ server-rendered** — Googlebot không cần execute JavaScript để thấy nội dung
2. **Cache 60s** — Render 1 lần, cache 60s, serve từ cache cho các request tiếp theo. Tốc độ ngang SSG 99% thời gian.
3. **Revalidate tự động** — Sau 60s, request tiếp theo trigger re-fetch settings mới nhất từ DB. Admin save → nội dung cập nhật sau tối đa 60s.
4. **Googlebot perspective** — Google thấy HTML hoàn chỉnh có `Cache-Control: public, max-age=60`. Không khác biệt so với SSG.
5. **Core Web Vitals** — LCP, CLS, INP không thay đổi vì HTML vẫn server-rendered.

**Kết luận ISR là tối ưu cho bài toán này:** SSG thuần túy thì không đọc được dynamic settings. ISR với cache 60s vừa nhanh vừa linh hoạt, SEO không bị ảnh hưởng.

---

## 3. Root Cause Analysis

### 3.1 Tech stack constraint

| Component | Type | Có thể gọi `getSiteSettings()`? |
|-----------|------|--------------------------------|
| HeroBanner | `"use client"` | ❌ — client component không thể async |
| WorkSection | `"use client"` (GSAP) | ❌ |
| ProductSection | `"use client"` (GSAP) | ❌ |
| CounterSection | `"use client"` (GSAP Counter) | ❌ |
| AboutSection | Server component | ✅ — nhưng không import settings |
| MessengerButton | Server component | ✅ — nhưng link cứng |

`getSiteSettings()` là **async server function** (dùng `next/headers`, `fetch`, `React.cache`). Client components không thể gọi trực tiếp.

### 3.2 Solution: Server Component Wrapper Pattern

```
page.tsx (async server component — ISR)
  ├── await getSiteSettings()          ← đọc DB + cookie preview override
  ├── <HeroBanner settings={...} />     ← server truyền props → client
  ├── <WorkSection settings={...} />    ← server truyền props → client
  ├── <ProductSection settings={...} /> ← server truyền props → client
  ├── <CounterSection settings={...} /> ← server truyền props → client
  ├── <AboutSection settings={...} />   ← server component, nhận props trực tiếp
  └── <MessengerButton settings={...} />← server component, nhận props trực tiếp

Kết quả SEO:
  GET / → Next.js server → getSiteSettings() (cached 60s) → render HTML đầy đủ
  → Googlebot nhận HTML hoàn chỉnh có tất cả text, meta, OG tags
  → LCP/CLS/INP không đổi
```

---

## 4. Architecture: Server → Client Data Flow

```
                    ┌────────────────────────────────────────┐
                    │ page.tsx (Async Server Component — ISR) │
                    │  export default async function Home()   │
                    │  const s = await getSiteSettings()      │
                    │  ┌──────────────────────────────────┐   │
                    │  │ cookie "preview_settings" override│   │ ← admin preview
                    │  │ + DB site_settings (cached 60s)   │   │
                    │  │ merged → Record<string, string>   │   │
                    │  └──────────────────────────────────┘   │
                    │  HTML pre-rendered with full content     │
                    │  Response: Cache-Control: max-age=60     │
                    └──────────┬──────────────────────────────┘
                               │ settings prop
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────┐   ┌────────────┐   ┌──────────┐
      │HeroBanner│   │WorkSection │   │About     │
      │"use      │   │"use client"│   │Section   │
      │ client"  │   │GSAP-ready  │   │Server    │
      │ GSAP     │   │            │   │Component │
      └──────────┘   └────────────┘   └──────────┘
      settings      settings        settings
      prop          prop            prop
```

## 5. GSAP Compatibility

GSAP animations (ScrollTrigger, useGSAP) cần chạy trên client. After fix:

| Component | Before | After | GSAP OK? |
|-----------|--------|-------|----------|
| HeroBanner | `"use client"`, hardcoded | `"use client"`, props | ✅ |
| WorkSection | `"use client"`, hardcoded | `"use client"`, props | ✅ |
| ProductSection | `"use client"`, hardcoded | `"use client"`, props | ✅ |
| CounterSection | Server, hardcoded | Server, props | ✅ (Counter atom dùng GSAP bên trong) |
| AboutSection | Server, hardcoded | Server, props | ✅ (không dùng GSAP) |
| MessengerButton | Server, hardcoded | Server, props | ✅ (không dùng GSAP) |

Không cần thay đổi logic animation nào — chỉ thay đổi data source.

---

## 6. Rollback

Mỗi section component giữ fallback về giá trị hardcoded cũ nếu key không tồn tại trong settings. Ví dụ:

```typescript
const youtubeId = settings.hero_youtube_id || "utP7z6_Zcwg";
const tagline = settings.hero_tagline || "Kể câu chuyện của bạn qua từng khung hình";
```

Production không có cookie `preview_settings` → settings trả về DB values. Nếu DB chưa có key → fallback về hardcoded cũ. Không break gì.
