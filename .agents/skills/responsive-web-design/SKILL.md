---
name: responsive-web-design
description: Best-practice responsive web design with Tailwind CSS. Fluid grids, container queries, fluid typography, mobile-first, touch targets, performance (Core Web Vitals), progressive disclosure, and real-device testing. Use when building interfaces that must work flawlessly across mobile, tablet, and desktop.
---

# Responsive Web Design Skill

## Core Principles

### 1. Mobile-First (Default)

Start with the smallest viewport and scale up using `min-width` breakpoints. This forces content prioritisation.

```tsx
/* Base: mobile styles (no media query) */
/* Tablet+ */  md:flex md:gap-6
/* Desktop+ */ lg:grid lg:grid-cols-3
```

Tailwind's breakpoints are mobile-first by default:
- `sm: 640px` — mobile landscape
- `md: 768px` — tablet
- `lg: 1024px` — small desktop
- `xl: 1280px` — desktop
- `2xl: 1536px` — large desktop

### 2. Fluid Grids

Use CSS Grid with `auto-fit` / `minmax` so columns adapt without breakpoints:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

For truly fluid grids (no breakpoint needed for column count):

```css
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
```

In Tailwind, use `grid-cols-1` as mobile base, then add breakpoint-specific column counts.

### 3. Fluid Typography with `clamp()`

Font sizes should scale smoothly, not jump at breakpoints:

```css
h1 { font-size: clamp(1.75rem, 4vw + 0.5rem, 3rem); }
p  { font-size: clamp(1rem, 1.5vw + 0.5rem, 1.25rem); }
```

In Tailwind, define these in `tailwind.config.js`:

```js
theme: {
  extend: {
    fontSize: {
      'fluid-hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.1' }],
      'fluid-body': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6' }],
    }
  }
}
```

### 4. Container Queries (`@container`)

Components should respond to their parent's width, not the viewport:

```tsx
<div className="container-type-inline-size">
  @container (min-width: 400px) {
    .card { display: grid; grid-template-columns: 200px 1fr; }
  }
</div>
```

Tailwind v4 supports `@container` natively. For v3, add the plugin `@tailwindcss/container-queries`.

**Use container queries for:** cards, sidebars, modals, data tables, any reusable component.

### 5. Flexible Media

Always prevent image overflow:

```tsx
<img className="max-w-full h-auto" ... />
```

Serve correctly sized images per viewport:

```tsx
<img
  src="/hero-800.webp"
  srcSet="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 1200px"
  alt=""
  width={1600}
  height={900}
  loading="lazy"
/>
```

**Always** include explicit `width` + `height` to prevent Cumulative Layout Shift (CLS). Use WebP or AVIF format. Set `fetchpriority="high"` on the LCP image.

### 6. Touch Targets

Minimum tap target: **44×44px** (Apple HIG) / **48×48px** (Material). Use padding to extend hit area:

```tsx
<button className="p-3 min-w-[44px] min-h-[44px]">...</button>
```

Space adjacent targets at least 8px apart.

### 7. Performance & Core Web Vitals

Responsive design directly impacts LCP, CLS, and INP.

| CWV Metric | Responsive Mitigation |
|------------|----------------------|
| **LCP** | Preload hero image, `fetchpriority="high"`, compress WebP/AVIF |
| **CLS** | Always set `width`/`height` on images, `aspect-ratio` on containers |
| **INP** | Avoid JS-heavy layout changes, use CSS `:has()` where possible |

**Lazy-load** images below the fold. **Ship only needed CSS** (Tailwind's PurgeCSS handles this).

### 8. Progressive Disclosure

Limited screen space = honest hierarchy decisions.

- Navigation → hamburger on mobile, inline on desktop
- Secondary content → accordions, tabs, drawers
- Filter/sort controls → full-screen overlay on mobile, sidebar on desktop
- CTA → fixed to bottom of viewport on mobile only

```tsx
<nav className="hidden md:flex"> {/* Desktop nav */} </nav>
<button className="md:hidden"> {/* Hamburger */} </button>
```

### 9. SVGs for Icons & Logos

SVGs scale infinitely, have small file size, and respond to CSS color (dark mode).

In Tailwind, use Phosphor, Radix, or Heroicons — all ship SVG-based icons.

### 10. Breakpoints That Follow Content

Do not target specific devices. Set breakpoints where your content breaks.

| Range | Typical context |
|-------|----------------|
| < 480px | Mobile portrait |
| 480–767px | Mobile landscape |
| 768–1023px | Tablet portrait |
| 1024–1279px | Tablet landscape / small desktop |
| 1280px+ | Desktop |

Test both portrait + landscape orientations for mobile and tablet.

---

## Tailwind-Specific Best Practices

### Configure PurgeCSS (built-in via `content`)

```js
// tailwind.config.js
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} }
}
```

This strips unused CSS in production — your final bundle stays lean.

### Customise `tailwind.config.js`

Extend the theme instead of using arbitrary values everywhere:

```js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a5f',
      }
    },
    screens: {
      'xs': '480px',  // extra small if needed
    }
  }
}
```

**Rule of thumb:** If you use `text-[#...]` or `w-[...]` more than 3 times, add it to the config.

### Use `@apply` for Repetitive Patterns

When the same utility combo repeats in many places, extract it:

```css
.btn-primary {
  @apply bg-brand-500 text-white font-semibold py-3 px-6 rounded-lg
         hover:bg-brand-900 transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2;
}
```

Use `@apply` **sparingly** — only for truly repeated patterns (buttons, cards, inputs). Overusing it defeats Tailwind's utility-first purpose.

## Responsive UIUX Rules

### Layout

- **Never** use `h-screen` → always `min-h-[100dvh]` (iOS Safari fix)
- **Never** use complex flexbox percentage math → always CSS Grid
- **Max-width** container: `max-w-7xl mx-auto` or `max-w-[1400px] mx-auto`
- **Section padding**: responsive via `py-16 md:py-24 lg:py-32`
- **3-column equal cards** is banned → use asymmetric grids, zig-zag, or horizontal scroll

### Typography

- Body max-width: `max-w-[65ch]` for readability
- Use `text-balance` or `text-wrap: pretty` to prevent orphaned words
- Always define `line-height` for headings: `leading-tight` or `leading-[1.1]`
- Fluid scale via `clamp()` instead of fixed breakpoints

### Navigation

- Desktop: single line, max 80px height
- Mobile: hamburger → full-screen overlay with staggered reveal
- Always keep one entry point visible (home, search, or back)

### Interactive States

Design full interaction cycles — not just the "happy path":

```tsx
<button
  className="
    bg-brand-500 text-white font-semibold px-6 py-3 rounded-lg
    hover:bg-brand-900
    active:scale-[0.98] transition-transform duration-150
    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  "
>
```

- **Loading** → skeleton loaders matching layout shape
- **Empty state** → composed composition, not "No data"
- **Error state** → clear inline message
- **Disabled** → reduced opacity + `cursor-not-allowed`

### Forms

- Label above input, error below
- Never use placeholder as label
- Touch targets min 44×44px
- Full-width inputs on mobile, constrained width on desktop

---

## Responsive Image Strategy

| Context | Approach |
|---------|----------|
| Hero image | `fetchpriority="high"`, preload, largest WebP/AVIF |
| Content images | `loading="lazy"`, `srcset` + `sizes`, correct aspect ratio |
| Icons | SVG only (Phosphor, Radix, Heroicons) |
| Backgrounds | CSS gradients or optimised JPEG/WebP |
| Avatars | `next/image` with `fill` + `sizes` or inline SVG |

---

## Testing Checklist

- [ ] Test on real devices (not just DevTools emulation)
- [ ] Test mid-range Android device (largest mobile traffic share)
- [ ] Test portrait AND landscape on mobile and tablet
- [ ] Run Lighthouse — LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Test touch targets — no overlapping, minimum 44×44px
- [ ] Test with slow network (3G throttling)
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Test both light and dark mode
- [ ] Test keyboard navigation + focus rings
- [ ] Verify no horizontal scrollbar appears at any breakpoint

---

## Anti-Patterns

- **Don't** hide content unconditionally on mobile — prioritise, don't hide
- **Don't** use device-specific breakpoints — use content-defined breakpoints
- **Don't** set font-size at only one breakpoint — use fluid `clamp()` or at minimum 2 breakpoints
- **Don't** use `h-screen` — use `min-h-[100dvh]`
- **Don't** ship images without `width`/`height` — causes CLS
- **Don't** use JPEG when WebP/AVIF is supported (all modern browsers)
- **Don't** let text overflow on small viewports — test with real content
- **Don't** overuse `@apply` — keep the utility-first spirit

---

## References

- [UXPin: Responsive Design Best Practices (2026)](https://www.uxpin.com/studio/blog/best-practices-examples-of-excellent-responsive-design/)
- [UXPin: Tailwind Best Practices](https://www.uxpin.com/studio/blog/tailwind-best-practices/)
- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Tailwind CSS Docs](https://tailwindcss.com/docs/responsive-design)
- [web.dev: Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
