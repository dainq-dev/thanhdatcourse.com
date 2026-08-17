# UI Comparison Report: Reference vs Local — 3 Pages

**Date:** 09/08/2026
**Method:** Browser capture + CSS extraction + screenshots from both reference and local
**Ref pages:** minhtravel.vn (production) vs localhost:3000 (development)

---

## Design Read

**Reading this as:** cinematographer portfolio + course sales platform for content creators, with a cinematic-dark / editorial language, leaning toward clean dark palette + restrained motion + premium consumer aesthetic.

**Dials:** DESIGN_VARIANCE=7, MOTION_INTENSITY=5, VISUAL_DENSITY=3

---

## 1. /khoa-hoc vs minhtravel.vn/master-class/

### Screenshot Comparison

| Aspect | Reference (minhtravel.vn) | Local (localhost:3000) |
|--------|---------------------------|------------------------|
| Hero bg | Clean dark gradient (#000 → transparent) | External image from Google cache with blue overlay |
| Hero h1 | 56px, centered, white | 48px, left-aligned, white |
| Hero padding | 96px top / 48px bottom | 150px top / 70px bottom |
| Card bg | `#0B0F19` — deep near-black | `#203644` — teal-tinted dark |
| Card border | `1px solid rgba(255,255,255,0.08)` — subtle | `1px solid #192134` — slightly visible |
| Card shadow | None — flat, clean | `0 0 10px rgba(223,215,215,0.32)` — white-tinted, washed-out feel |
| Card radius | 12px | 12px |
| Card layout | Thumbnail → Title → Description → Price → CTA | Same layout |
| Brand section | Present (Sony, Canon, DJI, etc. logos) | Present (text-only brands) |
| FAQ accordion | Present | Present |

### ⚠️ Key Issues Found

**#1 — Card color mismatch with brand palette**
Reference: `#0B0F19` (near-black, consistent with site-wide dark theme).
Local: `#203644` (teal-blue tint). This card color does not match the overall dark theme — it looks like a color from a different design system mixed in.

**Fix:** Change card background to `#0B0F19` (or `#0b0f19`). Match reference's subtle border too.

**#2 — Unnecessary white-tinted box shadow**
Shadow `rgba(223,215,215,0.32)` on a dark background creates a weird glowing effect because the shadow is lighter than the card. On a dark site, shadows should be dark or non-existent. Reference has ZERO shadow — flat design is cleaner.

**Fix:** Remove `box-shadow` from cards entirely. Flat cards with subtle borders look more professional on dark themes.

**#3 — Hero background image quality**
Using `encrypted-tbn0.gstatic.com` (Google image cache thumb) as a hero background. It's a tiny thumbnail scaled up — looks pixelated and low-quality.

**Fix:** Replace with a proper high-resolution image, or use media service image, or remove entirely and use clean dark hero like reference.

**#4 — Hero padding excessive**
Reference: `96px top`. Local: `150px top`. Extra ~54px of wasted space before content.

**Fix:** Reduce to `96-100px` top padding. Content starts sooner → better above-fold experience.

**#5 — Trust icon path**
`trustIconUrl` from settings is a media service URL but may be broken/missing. Reference uses a WordPress-uploaded image path.

**Fix:** Ensure the trust icon is uploaded via media service or use a fallback text-only version.

---

## 2. /san-pham vs minhtravel.vn/work/

### Screenshot Comparison

| Aspect | Reference | Local |
|--------|-----------|-------|
| Layout | Thumbnail left → Info right (all projects same direction) | Thumbnail left → Info right (consistent) ✅ |
| Alternating | NO — all same direction | Removed alternating ✅ |
| Hero title | "Films by Minh Travel" — centered | Dynamic from settings — centered via PageHeader |
| Breadcrumbs | "TRANG CHỦ / SẢN PHẨM" | Added ✅ |
| Project card | Clean: thumbnail with play icon → title → category badge → description | Same pattern |
| Thumbnail | YouTube thumbnail with dark overlay + play button | Same ✅ |
| Category badge | Pink/red pill badge with transparent bg | Same (`rgba(255,0,90,0.1)`) ✅ |
| CTA section | "Bạn muốn làm việc cùng tôi?" + 2 buttons | Same ✅ |
| Desc font-size | ~17px, line-height 1.7, color #CECECE | Same ✅ |

### ⚠️ Key Issues

**#6 — Video thumbnails: all YouTube hqdefault**
Every project without a custom thumbnail falls back to `https://img.youtube.com/vi/{id}/hqdefault.jpg` (480x360). This looks grainy on large screens because the thumbnail area is ~600px wide on desktop.

**Fix:** Use `maxresdefault.jpg` or `sddefault.jpg` for better quality on larger displays. Or better — have admin upload custom thumbnails via media manager.

**#7 — Page header consistency**
Reference uses: `minhtravel.vn/wp-content/uploads/...` for images, WordPress-generated page headers. Local uses `@workspace/ui PageHeader` component. The `PageHeader` component should be verified — does it render a proper centered hero with brand-consistent styling?

---

## 3. /cong-cu vs minhtravel.vn/presets-luts/

### Screenshot Comparison

| Aspect | Reference | Local |
|--------|-----------|-------|
| Hero title | "LUTs & Presets by Minh Travel" — centered | Dynamic from settings — centered |
| Breadcrumbs | "Home / PRESET & LUTs" | Added ✅ |
| Hero subtitle | "Bộ công cụ giúp bạn..." | Same ✅ |
| Grid columns | 3 columns on desktop | 3 columns ✅ |
| Card media | Image with 16:9 aspect ratio | Same ✅ |
| Card tag | Positioned top-left, red bg | Same ✅ (`.tag` uses `$clr-primary`) |
| Card title | ~18px bold | Same (`1.125rem`) ✅ |
| Card price | 20px extrabold, red accent | Same ✅ |
| "Mua ngay" btn | Full width, primary color | Full width ✅ |
| Card bg | Similar dark card pattern | Uses `@include card-dark` mixin |
| Video demo | YouTube iframe in modal | YouTube iframe in modal ✅ |

### ⚠️ Key Issues

**#8 — Card description text too long**
Reference presets page has short descriptions (1-2 lines). Local cards can have long multi-line descriptions that make cards uneven heights.

**Fix:** Clamp description at 2-3 lines using `@include line-clamp(3)` (already implemented in `.desc` at page.module.scss). Verify it works correctly.

**#9 — Hero spacing tight**
Local hero uses `padding-block: $space-16 $space-8` which may be insufficient for a page that should feel "premium product showcase."

**Fix:** Increase to `padding-block: $space-24 $space-12` on desktop for better breathing room.

---

## Overall Cross-Page Issues

### #10 — Color Palette Inconsistency (CRITICAL)

The biggest problem across all 3 pages: **inconsistent color usage**.

| Element | Should be | Currently is in khoa-hoc |
|---------|-----------|--------------------------|
| Card bg | Deep near-black (`#0B0F19`) | Teal-blue (`#203644`) |
| Card border | `rgba(255,255,255,0.08)` | `#192134` |
| Card shadow | None | White-tinted glow |
| Page bg | `#000` or `#0B0F19` | `$clr-bg` (variable, likely #000) |

The reference site has a disciplined palette:
- **Background:** Pure `#000000` or near-black
- **Cards:** `#0B0F19` — consistent everywhere
- **Borders:** Thin white at 0.08 opacity — barely visible, elegant
- **Accent:** Single red/pink accent (`#FF005A` range)
- **Text:** White primary, muted gray secondary
- **No shadows** on dark theme

### #11 — Typography Hierarchy

| | Reference | Local | Assessment |
|---|-----------|-------|------------|
| Hero h1 | 56px, extrabold 800 | 48px, extrabold 800 | Close but smaller |
| Card title h3 | ~18-20px, bold | 28px — notably larger | Inconsistent |
| Card desc | ~14-15px, gray | Same | OK |
| Price | Large, clear | 40px — very large | Dominant, but looks good |

### #12 — Spacing & Layout Rhythm

**Reference:** Sections have generous but not excessive spacing. Cards are evenly spaced.

**Local:** Overall spacing is decent. Minor adjustments needed:
- Hero top padding too large on khoa-hoc
- Section gaps could be more generous on cong-cu

---

## Recommendation Summary

### High Priority (Visual Quality Impact)

| # | Page | Issue | Fix |
|---|------|-------|-----|
| 1 | khoa-hoc | Card bg `#203644` → wrong for dark theme | Change to `#0b0f19` or `$clr-bg-elevated` |
| 2 | khoa-hoc | White-tinted box shadow looks wrong on dark bg | Remove `box-shadow` from cards |
| 3 | khoa-hoc | Card border too dark for dark cards | Use `rgba(255,255,255,0.08)` |
| 4 | khoa-hoc | Hero padding excessive (150px) | Reduce to 96px top |
| 5 | khoa-hoc | Hero bg image: low-quality Google cache thumb | Replace or remove |

### Medium Priority

| # | Page | Issue | Fix |
|---|------|-------|-----|
| 6 | san-pham | Video thumb: hqdefault (480p) grainy at large sizes | Use maxresdefault or require custom thumbs |
| 7 | cong-cu | Hero padding too tight for premium feel | Increase to `py-24 py-12` |
| 8 | all | Card title font sizes inconsistent (28px vs 18px) | Standardize card title size across pages |

### Low Priority

| # | Page | Issue | Fix |
|---|------|-------|-----|
| 9 | all | Description line clamping consistency | Ensure all desc fields are clamped at 2-3 lines |
| 10 | khoa-hoc | Trust icon needs reliable CDN/upload source | Verify media service URL works |

---

## Architectural Decision: Card Color Palette

**Problem:** khoa-hoc cards currently use `#203644` (teal). Reference uses `#0B0F19` (near-black).

**Analysis:**
- Reference's `#0B0F19` cards are barely distinguishable from the `#000` background — they create a VERY subtle elevation effect via the thin white border
- This is the "premium dark" aesthetic: the card is a slightly-lighter version of the page background, with a hairline border for definition
- Local's `#203644` is a TEAL card on a BLACK background — this creates harsh contrast, not subtle elevation. It looks like cards from a different color scheme.

**Decision:** Adopt reference palette. Cards should be `#0B0F19` or `#10161f` (very slightly elevated from `#000`), with `1px solid rgba(255,255,255,0.08)` borders and no shadows.

**Impact:** This single change (card bg + border + shadow removal) will dramatically improve the khoa-hoc page's visual quality and brand consistency.

---

## Action Plan

1. **Fix card styling on khoa-hoc** (3 changes in `page.module.scss`): bg, border, shadow
2. **Reduce hero padding** on khoa-hoc: 150px → 96px
3. **Replace hero background image** with clean dark gradient
4. **Increase hero padding on cong-cu** for premium feel
5. **Standardize card title font sizes** to 18-20px bold across pages

**Verification:** After fixes, compare screenshots again. All 3 pages should feel like one cohesive dark-themed site with consistent card treatments, border treatments, and spacing rhythm.
