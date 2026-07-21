---
description:  Workflow hướng dẫn agent sử dụng responsive-web-design skill đúng chuẩn. Mobile-first, fluid grids, container queries, touch targets, performance (Core Web Vitals), testing trên real devices.
---


# Responsive Web Design Workflow

Root: `.agents/skills/responsive web design/`

---

## 1. Khi nào kích hoạt skill này

Kích hoạt `responsive-web-design` khi task liên quan đến:
- Xây dựng layout responsive từ đầu
- Làm cho trang web hoạt động tốt trên mọi thiết bị
- Tối ưu UIUX cho mobile/tablet/desktop
- Cải thiện Core Web Vitals (LCP, CLS, INP)
- Làm việc với Tailwind CSS và responsive breakpoints
- Thiết kế navigation, forms, images responsive

Skill này hoạt động **cùng** với `taste-skill`:
- `taste-skill` → quyết định aesthetic, layout, motion
- `responsive-web-design` → đảm bảo mọi quyết định đó hoạt động tốt trên mọi viewport

---

## 2. Progressive Disclosure

| Stage | Nội dung | Khi nào load |
|-------|----------|--------------|
| **Metadata** | `name` + `description` | Load khi khởi động |
| **Instructions** | Full `SKILL.md` body | Khi kích hoạt (task responsive) |
| **Resources** | References từ UXPin, MDN, Tailwind docs | Load khi cần chi tiết |

---

## 3. Execution Flow

### 3.1 Mobile-First Scaffold

1. Viết base styles cho mobile trước (không media query)
2. Thêm `sm:` cho mobile landscape
3. Thêm `md:` cho tablet
4. Thêm `lg:` / `xl:` cho desktop

### 3.2 Container → Content → Columns

- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Content**: viết nội dung đầy đủ, responsive tự nhiên
- **Columns**: Grid chuyển từ `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`

### 3.3 Typography Scale

- Headings: `text-[clamp(...)]` hoặc custom font-size trong config
- Body: `text-base` (`1rem`) on mobile, `text-lg` on desktop hoặc fluid
- Line-height: `leading-relaxed` (`1.6`) cho body, `leading-tight` cho heading

### 3.4 Images & Media

- Check image status: LCP image → preload + `fetchpriority="high"`
- Content images → lazy-load + `width`/`height` + WebP
- Icons → SVG (kiểm tra library có sẵn trong `package.json`)

### 3.5 Navigation

- Desktop: inline nav, single line, max 80px
- Mobile: hamburger → full-screen overlay
- Giữ ít nhất 1 entry point visible (home/back)

### 3.6 Forms & Interactive Elements

- Touch targets ≥ 44×44px
- Forms full-width on mobile, constrained on desktop
- States: loading/empty/error/disabled đầy đủ

---

## 4. Pre-Flight Check

Trước khi output, chạy checklist này:

- [ ] Mobile-first: base styles là mobile, breakpoints dùng `min-width`?
- [ ] Viewport stability: `min-h-[100dvh]` thay vì `h-screen`?
- [ ] Image CLS prevention: mọi `<img>` có `width` + `height`?
- [ ] Touch targets: tất cả interactive elements ≥ 44×44px?
- [ ] Forms: label above input, error below, không placeholder-as-label?
- [ ] No horizontal scroll: `overflow-x-hidden` trên wrapper nếu cần?
- [ ] Navigation: single line desktop, hamburger mobile?
- [ ] Typography readable: `max-w-[65ch]` cho body? Fluid scale cho headings?
- [ ] Layout: grid thay vì flexbox percentage math?
- [ ] Performance: LCP image preloaded, below-fold images lazy?
- [ ] Dark mode: tokens defined và tested?
- [ ] Reduced motion: `prefers-reduced-motion` respected?
- [ ] Tested on real devices? (ít nhất DevTools emulation at 375px, 768px, 1280px)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms?

---

## 5. Kết hợp với taste-skill

| Tình huống | taste-skill | responsive-web-design |
|------------|-------------|----------------------|
| Landing page | Thiết kế layout, aesthetic, motion | Đảm bảo layout responsive mọi breakpoint |
| Portfolio | Chọn dials, typography, bento grid | Grid collapse, image sizing, touch targets |
| Redesign | Audit, upgrade visual | Giữ nguyên IA, responsive states |
| Premium consumer | Color palette, glassmorphism | Fluid typography, mobile nav, performance |

---

## 6. References

- Skill file: `.agents/skills/responsive web design/SKILL.md`
- Agent Skills spec: https://agentskills.io/specification
- Tailwind responsive docs: https://tailwindcss.com/docs/responsive-design
- Core Web Vitals: https://web.dev/vitals/
