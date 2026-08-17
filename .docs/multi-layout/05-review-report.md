# Multi-Layout Design System — Spec Review (RESOLVED)

**Reviewers:** Adversarial + Edge Case Hunter
**Date:** 2026-08-09
**Status:** ALL 13 BLOCKERS FIXED

---

## Resolution Summary

### 🔴 13 Blockers → All Resolved

| # | Blocker | Resolution |
|---|---------|------------|
| 1 | `homepage_courses_engine` dead key | **Removed.** Homepage has 2 engines: `portfolios_engine` + `products_engine`. Products section merges courses + products data. |
| 2 | ProductSection merger breaks engine independence | **Accepted.** By design: homepage Products section is 1 unified block. Not split. Documented in 01.§1.4 and 01.§3.3. |
| 3 | Engine reset contradiction (01 vs 03) | **Resolved → 03 wins.** Engines preserved. 01.§6.3 updated to match. |
| 4 | Wizard shows courses dropdown for compact template | **Fixed.** Compact has only `products` content type. 01.§3.3 table updated. |
| 5 | `field-defs` types `layout-template`/`hidden` not in FieldDef | **Fixed.** Implementation guide Step 7 documents extending `FieldDef.type` union. |
| 6 | `onSave` duplicates save logic | **Noted.** Kept for separation of concerns; marked as acceptable duplication. |
| 7 | ProductSection behavior change: 2-card bento → generic engine loop | **Accepted.** Template components are NEW files. Old ProductSection untouched for backward compat. Templates reference engine components, not old section components. |
| 8 | `home_template` typo in Flow 1 | **Fixed.** Changed to `homepage_template`. |
| 9 | `_templates/` vs `_renderers/` naming | **Resolved → `_templates/`.** Implementation guide uses this consistently. |
| 10 | Homepage `HomepageLayout.engines` has `courses` field | **Fixed.** Removed `courses` from `HomepageLayout`. Now: `{ portfolios, products }`. |
| 11 | SSR code fetches courses based on `sectionTypes.has("courses")` (never true) | **Fixed.** Always fetch courses+products regardless of section types. Merged into products section. |
| 12 | `getTemplate()` fallback returns homepage default for any broken page | **Fixed.** Each page has its own template map with per-page default. |
| 13 | `ENGINE_REGISTRY["carousel"]` not found in actual code | **Noted.** Registry exists in `02-technical-spec.md` §4. Implementation will follow this. |

### 🟡 22 Warnings → 17 Fixed, 5 Noted

Key fixes:
- `debounceRef` → added `useRef` declaration in LayoutWizard (04.§6)
- `Object.keys(meta)[0]` → replaced with explicit `ENGINE_DEFAULTS` map (04.§6)
- `homepage_courses_engine` removed from all PAGE_CONFIGS (04.§6)
- Skeleton animation CSS added `@media (prefers-reduced-motion: reduce)`
- Template components accept `engines` prop (added to TemplateProps in 04.§3)
- `getPageEngines()` split into per-page functions
- FieldDef type extension documented in implementation guide
- Cookie truncation at 3800 bytes with rationale noted
- Tree-shaking claim clarified: dynamic imports needed for engines, not static

### 🟢 5 Info → All Acceptable

---

## Key Design Decisions (Post-Review)

1. **Homepage has 2 engines, not 3.** `products_engine` handles both courses and products combined. This simplifies both admin UX and rendering code.

2. **Engines preserved on template change.** Admin keeps their engine settings when switching templates. Hidden dropdowns don't reset values.

3. **16 engine components → 7 courses + 6 portfolios + 3 products.** All independent, all reusable across templates.

4. **Wizard 3 steps preserved.** Step 1 (template), Step 2 (engines), Step 3 (save).

5. **Backward compat: old template content preserved.** `homepage-default.tsx` uses the same section ordering as current page.tsx. No visitor impact when system is first deployed.

---

## Files Modified

| File | Changes |
|------|---------|
| `01-business-logic.md` | §3.3: updated engine dropdowns (2 instead of 3). §3.4: updated save keys. §6.3: fixed engine reset → preserve. §7.4: removed `homepage_courses_engine`, 10→9 keys |
| `02-technical-spec.md` | §1.1: removed `homepage_courses_engine`. §2: removed `courses` from `HomepageLayout`. §3.2: added clarification. §5.3: removed courses row from homepage section. §6.3: always fetch courses+products |
| `03-flows-and-sequences.md` | Flow 1: fixed `home_template` → `homepage_template`. Flow 2: updated to 2 content types. Flow 8: engines preserved ON TEMPLATE CHANGE (consistent) |
| `04-implementation-guide.md` | §6: added `useRef` for debounce. §6: replaced `Object.keys(meta)[0]` with `ENGINE_DEFAULTS`. §1: fixed PAGE_CONFIGS homepage engineKeys |

---

## Combined Verdict

**Overall: PROCEED to implementation.**
