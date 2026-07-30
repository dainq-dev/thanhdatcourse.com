# Phase 5: Post-Launch Enhancements — Settings Live Preview

**Duration:** 1-2 days | **Depends on:** Phase 2 (Module 2.1 Site Settings)
**TDD:** Bun test for `lib/settings.ts`. Frontend: manual QA.
**Ref:** [Spec 11: Site Settings Live Preview](../specs/11-site-settings-live-preview.md), [Planning 07](../planning/07-settings-live-preview.md)

---

## Module 5.1: Settings Live Preview Panel (Spec 11)

### Task 5.1.1: Cookie-Based Preview Override in getSiteSettings()

**What:** `apps/web/src/lib/settings.ts` — `getSiteSettings()` reads `preview_settings` cookie from incoming request, parses key-value pairs as JSON, and merges them as override on top of database values.

**Input:** Cookie `preview_settings={"site_title":"New Title","theme_color":"#fff"}` sent automatically by browser on same-origin requests.

**Output:** `Record<string, string>` — database values merged with preview overrides. Preview values take priority.

**Flow:**
```
getSiteSettings()
  → read 'cookie' header via next/headers() → extract 'preview_settings' value
  → JSON.parse(cookieValue) → { site_title: "New Title", ... }
  → fetch /api/settings from DB → { site_title: "Old Title", ... }
  → return { ...dbSettings, ...previewOverrides }
  → React cache() deduplicates within render pass
```

**Best Practices:**
- Use `next/headers` `cookies()` API — not raw string parsing
- `try { JSON.parse } catch { return dbSettings }` — malformed cookie → graceful fallback
- Only apply override on server-side render (SSR/SSG) — client navigation doesn't need it
- Cookie set with `path=/quan-tri-vien` so it never leaks to public pages
- Cookie `maxAge=600` (10 min auto-expire)

**Test Cases:**
```
[ ] Cookie override merges correctly onto database values
[ ] Malformed JSON in cookie → falls back to database values
[ ] Empty cookie → falls back to database values
[ ] Missing 'preview_settings' key → returns database values unchanged
[ ] Cookie with key not in database → key is added (new setting via preview)
[ ] Database fetch fails → returns preview values only (best-effort render)
[ ] React cache() deduplicates multiple calls in same request
```

### Task 5.1.2: Split-Screen Layout + iFrame Preview Panel

**What:** `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` — Rearchitecture from single-column form to split-screen: left panel (form) + right panel (live preview). Right panel contains tab bar for switching preview pages + `<iframe>` rendering actual website.

**Input:** Current `formData: Record<string, string>` state from settings form.

**Output:** 2-column layout rendering form fields in scrollable left panel and website preview in sticky right panel.

**Preview pages:**
```typescript
const PREVIEW_PAGES = [
  { label: "Trang chủ",   path: "/" },
  { label: "Khóa học",    path: "/khoa-hoc" },
  { label: "Bài viết",    path: "/bai-viet" },
  { label: "Dự án",       path: "/san-pham" },
  { label: "Công cụ",     path: "/cong-cu" },
  { label: "Liên hệ",     path: "/lien-he" },
];
```

**Layout (desktop ≥1024px):**
```
┌──────────────────────────┬──────────────────────────┐
│ LEFT: Form Panel         │ RIGHT: Preview Panel      │
│ (overflow-y: auto)       │ (position: sticky, top:0) │
│                          │                            │
│ [Search...]  [Lưu]       │ [Trang chủ] [Khóa học]... │
│ N thay đổi chưa lưu      │ [↻ Tải lại]               │
│                          │                            │
│ ┌────────────────────┐   │ ┌────────────────────────┐ │
│ │ site_title         │   │ │                        │ │
│ │ site_description   │   │ │   <iframe src="/" />   │ │
│ │ ...                │   │ │                        │ │
│ │ (55+ fields)       │   │ │                        │ │
│ └────────────────────┘   │ └────────────────────────┘ │
│                          │                            │
│ [Lưu thay đổi] (bottom)  │                            │
└──────────────────────────┴──────────────────────────┘
```

**Best Practices:**
- CSS Grid `1fr 1fr` with `gap: 1.5rem`
- Left panel scrolls independently (`max-height: calc(100dvh - 60px)` for header)
- Right panel iframe fills available space (`width: 100%; height: 100%`)
- iframe remounts via `key={previewKey}` state to trigger SSR re-render
- Search input filters fields client-side (no API call) via `field.label.includes(search)`
- Changed count computed via diff between `formData` and `settings`: `Object.keys(diff).length`
- Save button disabled when `changedCount === 0` or `saving === true`
- Success toast auto-dismiss after 3 seconds

**Test Cases (Manual QA):**
```
[ ] Split-screen renders with form on left, preview on right
[ ] Preview defaults to homepage (/)
[ ] Click preview tab "Khóa học" → iframe navigates to /khoa-hoc
[ ] Click preview tab "Dự án" → iframe navigates to /san-pham
[ ] Click "↻ Tải lại" → iframe refreshes
[ ] Search "khóa" shows only matching fields
[ ] Search "xyzabc" shows "Không tìm thấy cài đặt nào phù hợp"
[ ] Changed count badge shows "3 thay đổi chưa lưu" after 3 fields modified
[ ] Changed count badge disappears after reverting all changes
[ ] Save button disabled when no changes
[ ] Save button enabled when changes exist
```

### Task 5.1.3: Cookie Write/Reload/Save Pipeline

**What:** Wiring the form changes → cookie write → iframe reload → preview update. Plus save commit flow.

**States managed:** `formData`, `settings` (saved baseline), `previewKey` (forces iframe remount), `saving` (loading), `success` (toast).

**On field change (`handleChange`):**
```
1. setFormData(prev => ({ ...prev, [key]: newValue }))
2. Compute diff: changedKeys = Object.entries(formData).filter(([k,v]) => v !== settings[k])
3. Write cookie: document.cookie = buildCookieString(changedKeys)
   - Format: preview_settings=<JSON.stringify(changedObj)>
   - Options: path=/quan-tri-vien; max-age=600; SameSite=Lax
4. Clear previous debounce timer
5. Set new debounce timer (1500ms)
6. On timer fire: setPreviewKey(prev => prev + 1) → triggers iframe remount
```

**On save (`handleSave`):**
```
1. setSaving(true)
2. Compute changed: filter formData entries where value !== settings[key]
3. If no changes → setSaving(false) → return
4. PUT /api/settings/batch with changed object
5. On success:
   - setSettings(formData)      // update baseline
   - document.cookie = clearCookie    // remove preview_settings
   - setPreviewKey(prev => prev + 1)  // reload iframe with real data
   - setSuccess(`Đã lưu ${count} cài đặt`)
   - setTimeout(() => setSuccess(''), 3000)
6. On error:
   - setSuccess('')               // clear any previous success
   - Keep cookie intact            // preserve unsaved changes
   - Keep formData unchanged       // allow retry
7. setSaving(false)
```

**Cookie helper (`buildCookieString`):**
```typescript
function buildPreviewCookie(changed: Record<string, string>): string {
  const json = JSON.stringify(changed);
  if (new Blob([json]).size > 3800) {
    // Truncate: take first N keys that fit under 3800 bytes
    const truncated: Record<string, string> = {};
    for (const [k, v] of Object.entries(changed)) {
      const trial = JSON.stringify({ ...truncated, [k]: v });
      if (new Blob([trial]).size > 3800) break;
      truncated[k] = v;
    }
    return `preview_settings=${encodeURIComponent(JSON.stringify(truncated))}`;
  }
  return `preview_settings=${encodeURIComponent(json)}`;
}
```

**Best Practices:**
- Debounce with `clearTimeout` to prevent rapid iframe reloads while typing
- 1500ms debounce: fast enough for visual feedback, slow enough to not hammer SSR
- Cookie truncated gracefully if > 4KB (only include first N changed keys that fit)
- Save button shows loading state: `{saving ? "Đang lưu..." : "Lưu thay đổi"}`
- Success toast auto-clears after 3s via `setTimeout`
- Bottom save button shown when scrolled past form (convenience)

**Test Cases (Manual QA):**
```
[ ] Type in site_title → 1.5s later → iframe reloads → preview title changes
[ ] Type rapidly in 3 fields → only 1 iframe reload after last keystroke + 1.5s
[ ] Click Save → PUT request sent with only changed keys
[ ] Click Save → success toast "Đã lưu 3 cài đặt" appears
[ ] Click Save → iframe reloads → preview shows saved (real DB) data
[ ] Modify field → Save fails (500) → error toast → form keeps dirty state
[ ] Save with no changes → button disabled, no request
[ ] Refresh page → fields show DB values, no unsaved badge, preview shows DB data
[ ] Save with 60 changed keys → cookie truncation works → only first ~30 go to preview
[ ] Bottom save button visible when scrolled past top of form
```

### Task 5.1.4: Responsive Breakpoints & Polish

**What:** `apps/web/src/app/quan-tri-vien/cai-dat/page.module.scss` — 2-column grid with responsive collapse, sticky preview, independent scroll zones, visual polish.

**Layout breakpoints:**

| Breakpoint | Layout |
|------------|--------|
| ≥ 1024px | 2 columns: `grid-template-columns: 1fr 1fr` |
| < 1024px | Single column: form top, iframe bottom at 50vh |

```scss
.page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  height: calc(100dvh - 56px); // minus admin header
}

.editor {
  overflow-y: auto;
  padding-right: 0.5rem;
}

.preview {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 56px);
}

.previewFrame {
  flex: 1;
  background: #F5F5F3;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  overflow: hidden;
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 1023px) {
  .page {
    grid-template-columns: 1fr;
    height: auto;
  }
  .preview { position: static; max-height: 50dvh; }
}
```

**Visual polish:**
- Preview tab bar: small buttons matching settings tab style
- Active preview tab: `color: #1A1A1A; font-weight: 600; border-bottom: 2px solid #1A1A1A`
- "↻ Tải lại" button: subtle, right-aligned in preview header
- iframe background: `#F5F5F3` during load (matches site background)
- Scrolled iframe: subtle box-shadow inset to indicate scrollable content
- Changed count badge: `background: #FEF3C7; color: #92400E; border-radius: 9999px; padding: 0.15rem 0.5rem`

**Test Cases (Manual QA):**
```
[ ] Desktop (≥1024px): 2 columns visible side by side
[ ] Mobile (<1024px): single column, form above preview
[ ] Scroll left panel independently without affecting preview
[ ] Preview stays sticky (not scrolling) when left panel scrolls
[ ] Preview tabs wrap on narrow iframe
[ ] "↻ Tải lại" refreshes iframe
[ ] No horizontal scrollbar at any viewport
```

### Task 5.1.5: Final Verification

**What:** End-to-end smoke test: login → settings page → modify → preview → save → verify on live site.

**Checklist:**
```
[ ] bun run dev starts all 3 services without port conflicts
[ ] Login at /xac-thuc/dang-nhap with admin@minhtravel.vn / admin123 → redirects to dashboard
[ ] Navigate to Cấu hình trang → split-screen renders
[ ] Change site_title → debounce → iframe homepage shows new title
[ ] Change courses_page_hero_title → switch preview to Khóa học → title reflects change
[ ] Change contact_page_title → switch preview to Liên hệ → title reflects change
[ ] Click Lưu thay đổi → success toast → preview reloads → data matches saved
[ ] Refresh page → form shows saved data, preview shows live DB data (no override)
[ ] bun run build → passes without errors
[ ] bun run lint → 0 noExplicitAny errors (warnings OK)
```

---

## TDD Convention (per README)

```
For each task:
1. Write Bun tests → RED
2. Implement code → GREEN
3. Refactor → still GREEN
4. Biome lint + format → clean
5. TypeScript typecheck → 0 errors
```

Tasks 5.1.2-5.1.4 là frontend UI (React component + SCSS) → manual QA thay cho automated test vì DOM testing không nằm trong scope Bun test.

---

## Task Summary

| Task | File(s) | Effort | Test Type | TDD Steps |
|------|---------|--------|-----------|-----------|
| 5.1.1 Cookie override | `lib/settings.ts` | 45 min | Bun test | 1→2→3→4→5 |
| 5.1.2 Split-screen layout | `cai-dat/page.tsx` | 60 min | Manual QA | 2→4→5 |
| 5.1.3 Cookie write/save | `cai-dat/page.tsx` | 45 min | Manual QA | 2→4→5 |
| 5.1.4 Responsive polish | `cai-dat/page.module.scss` | 30 min | Manual QA | 2→4→5 |
| 5.1.5 Final verification | — | 15 min | Smoke test | Build + lint check |

**Total estimate: ~3.5 hours (0.5 day)**

---

## Task Execution Order (TDD)

### 5.1.1: Cookie Override — TDD Cycle

```
Step 1: Write tests
  Touch: apps/web/src/lib/settings.test.ts
  Test cases:
    - returns merged override when cookie is valid JSON
    - falls back to DB when cookie is malformed
    - falls back to DB when cookie is empty string
    - falls back to DB when 'preview_settings' key missing
    - adds key when cookie has key not in DB (new setting preview)
    - returns empty object when DB fetch fails (best-effort)
    - React cache() deduplicates multiple calls in same request
  Run: bun test → RED (all fail — code not written yet)

Step 2: Implement
  Touch: apps/web/src/lib/settings.ts
  Read 'preview_settings' cookie via cookies() from next/headers
  JSON.parse → merge { ...dbSettings, ...previewOverrides }
  try/catch → graceful fallback to DB values
  Run: bun test → GREEN (all pass)

Step 3: Refactor
  Review: extract cookie reading to pure helper function for testability
  Ensure: no side effects outside getSiteSettings()
  Run: bun test → still GREEN

Step 4: Lint
  biome lint apps/web/src/lib/settings.ts apps/web/src/lib/settings.test.ts
  Fix any errors (noExplicitAny = error)

Step 5: Typecheck
  tsc --noEmit → 0 errors
```

### 5.1.2-5.1.4: Frontend UI — Manual QA Cycle

```
For each task:
  Step 2: Write code → hot reload → visual verify in browser
  Step 4: biome lint apps/web/src/app/quan-tri-vien/cai-dat/ → clean
  Step 5: tsc --noEmit → 0 errors
```

### 5.1.5: Final Verification

```
Step: bun run build → 0 errors
Step: bun run lint → 0 noExplicitAny
Step: Manual smoke test per checklist (login → modify → preview → save)
```

---

## Dependencies & Prerequisites

```
Phase 5.1
  ├── Phase 2.1 (Site Settings CMS)  ✅ DONE
  ├── Phase 1.1 (Authentication)     ✅ DONE
  └── Phase 1.2 (Admin Shell)       ✅ DONE
```

---

## Rollback

Feature is purely additive. Reverse by:
1. Remove `<div className={styles.preview}>` block in `page.tsx` → back to single-column form
2. Remove cookie read logic in `getSiteSettings()` → back to DB-only
3. CSS grid → back to `max-width: 720px` form

No database migrations. No API changes. Safe to revert in 2 line changes.
