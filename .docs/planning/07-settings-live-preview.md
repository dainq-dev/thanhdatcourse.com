# Planning 07: Site Settings — Live Preview Panel

**Part of:** Delivery Planning
**Ref:** [Spec 11: Site Settings Live Preview](../specs/11-site-settings-live-preview.md), [Spec 01: Site Settings CMS](../specs/01-site-settings-cms.md), [Planning 03: Frontend Dynamic](./03-frontend-dynamic.md), way-of-reasoning.prompt.md
**Status:** Draft
**Date:** 2026-07-22

---

## 1. Problem Statement

Admin thay đổi 55+ site settings qua form text nhưng không biết kết quả hiển thị trên web thực trông như thế nào cho đến khi Save → mở tab mới → kiểm tra từng trang. Workflow này tốn thời gian, dễ sai, và thiếu tự tin khi xuất bản.

**Root cause:** Settings page là form đơn thuần, không có render output. Không có visual feedback loop giữa input và kết quả.

**Success criteria:** Admin gõ nội dung → thấy ngay kết quả trên bản preview 1:1 của trang web thực, không cần Save, không cần mở tab mới.

---

## 2. Architecture: Cookie-Based Live Preview

```
┌─────────────────────────────────────────────────────────────────────┐
│                  SETTINGS PAGE (quan-tri-vien/cai-dat)               │
│                                                                      │
│  ┌──────────────────────┐   ┌──────────────────────────────────┐   │
│  │   LEFT: Form Panel    │   │   RIGHT: Preview Panel             │   │
│  │                       │   │                                    │   │
│  │  ┌─────────────────┐  │   │  ┌────────────────────────────┐   │   │
│  │  │ Search bar       │  │   │  │ Tab: Trang chủ | Khóa học │   │   │  │
│  │  │ Save button      │  │   │  │ Tab: Bài viết | Dự án...  │   │   │  │
│  │  └─────────────────┘  │   │  │           ↻ Tải lại        │   │   │  │
│  │                       │   │  └────────────────────────────┘   │   │
│  │  ┌─────────────────┐  │   │                                    │   │
│  │  │ Field 1          │  │   │  ┌────────────────────────────┐   │   │
│  │  │ Field 2          │  │   │  │                            │   │   │
│  │  │ ...              │  │   │  │    <iframe src="/" />      │   │   │
│  │  │ Field N          │  │   │  │    (full website preview)  │   │   │
│  │  └─────────────────┘  │   │  │                            │   │   │
│  │                       │   │  └────────────────────────────┘   │   │
│  └──────────────────────┘   └──────────────────────────────────┘   │
│                                                                      │
│  Data flow:                                                          │
│                                                                      │
│  Admin types in field                                                │
│    → setFormData(newState)                                           │
│    → document.cookie = "preview_settings=" + JSON(changed)           │
│       (path=/quan-tri-vien, max-age=600)                             │
│    → debounce 1500ms                                                 │
│    → setPreviewKey(k+1) → iframe remounts                            │
│    → iframe SSR request to Next.js                                   │
│    → getSiteSettings() reads cookie "preview_settings"               │
│    → merges override onto real DB settings                           │
│    → renders page with preview data                                  │
│                                                                      │
│  Admin clicks "Lưu thay đổi"                                          │
│    → PUT /api/settings/batch (changed keys only)                     │
│    → on success:                                                      │
│        setSettings(formData)                                          │
│        document.cookie = "preview_settings=; max-age=0" (clear)       │
│        setPreviewKey(k+1) → iframe reloads with real DB data          │
│    → on error: keep cookie, show error toast                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Why cookie instead of localStorage (from BDD Review C1):**

`getSiteSettings()` runs on the Next.js **server** (React Server Component). It cannot read `localStorage`. Cookies are sent automatically by the browser in every request to the same origin — including SSR requests from `<iframe>`. The server can read them via `next/headers`.

**Cookie constraints & mitigation:**

| Risk | Mitigation |
|------|-----------|
| Cookie size limit ~4KB | Only send **changed** keys (diff), not all 55 |
| Cookie leaks to public pages in same origin | `path=/quan-tri-vien` — only sent in admin scope |
| Stale cookie persists after tab close | `max-age=600` (10 min) auto-expire; cleared on save |

---

## 3. Implementation Plan

### 3.1 Files to change

| # | File | Change | Est. |
|---|------|--------|------|
| 1 | `apps/web/src/lib/settings.ts` | `getSiteSettings()` reads cookie `preview_settings`, parses JSON, merges as override | 15 min |
| 2 | `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` | Split-screen layout, iframe panel, cookie write/clear, debounce logic, preview tabs, search filter, changed count badge | 45 min |
| 3 | `apps/web/src/app/quan-tri-vien/cai-dat/page.module.scss` | 2-column grid, preview panel styles, responsive breakpoints | 20 min |

### 3.2 Step-by-step

```
Step 1: getSiteSettings() cookie override
  ├── Read "preview_settings" cookie via next/headers().get('cookie')
  ├── Parse: extract key=value pairs from cookie string
  ├── Merge: {...dbSettings, ...previewOverrides}
  └── Verify: bun test — existing settings tests still pass + new override test

Step 2: Split-screen layout (page.tsx)
  ├── CSS Grid: grid-template-columns: 1fr 1fr (min-width 1024px)
  ├── Left panel: scrollable form fields with search
  ├── Right panel: sticky preview with tab bar + iframe
  ├── Preview tabs: map PREVIEW_PAGES array → buttons → setPreviewPath
  ├── iframe: key={previewKey} src={previewPath}
  └── Responsive: single column below 1024px (form top, preview bottom)

Step 3: Cookie write on change
  ├── handleChange() → compute diff → JSON.stringify → document.cookie
  ├── Debounce: setTimeout 1500ms → setPreviewKey(prev => prev + 1)
  ├── Clear on save success
  └── Changed count badge: Object.keys(diff).length

Step 4: Responsive & polish
  ├── Mobile: iframe height 60vh below form
  ├── Left panel: independent scroll (overflow-y: auto)
  ├── Right panel: sticky top (position: sticky; top: 0)
  ├── Loading state in iframe: skeleton overlay
  └── Reload button forces iframe refresh
```

### 3.3 Dependency graph

```
settings.ts
  └── page.tsx (consumes cookie)
        ├── page.module.scss (styles)
        └── api.ts (already exists for PUT batch)
```

No new dependencies. No backend changes. No database changes. Pure frontend enhancement.

---

## 4. States & Edge Cases

### 4.1 Component states

| State | Behavior |
|-------|----------|
| **Loading** | Skeleton for form fields + empty iframe placeholder |
| **Empty** | All fields show saved values, preview shows live site |
| **Dirty (unsaved)** | Changed count badge visible, save button enabled |
| **Saving** | Save button disabled + "Đang lưu..." text |
| **Saved** | Success toast 3s, badge cleared, iframe reloaded |
| **Error (save)** | Error toast, dirty state preserved, cookie preserved |
| **Search active** | Only matching fields visible, others hidden (not removed) |
| **Search no results** | "Không tìm thấy cài đặt nào phù hợp" message |

### 4.2 Edge cases

| Case | Behavior |
|------|----------|
| Cookie > 4KB | Silently truncate — only include first N changed keys that fit |
| Empty cookie value | `getSiteSettings()` ignores empty/undefined preview_settings |
| Malformed JSON in cookie | `getSiteSettings()` catches JSON.parse error, falls back to DB only |
| Multiple rapid saves | Button disabled during save, prevents double-submit |
| Tab switch while dirty | Preview reloads on new path, still with unsaved cookie |
| Settings page unmount | Cookie persists 10 min (intentional — survive accidental close) |
| iframe fails to load | Native browser error page in iframe — user clicks "↻ Tải lại" |
| Concurrent admin sessions | Cookies are per-browser, no conflict between admins |

---

## 5. Responsive Strategy

```
Desktop (≥1024px):
  ┌──────────────┬──────────────┐
  │   Form       │   Preview    │
  │   (scroll)   │   (sticky)    │
  │              │              │
  └──────────────┴──────────────┘

Mobile (<1024px):
  ┌──────────────────────────────┐
  │   Form (collapse by default)  │
  ├──────────────────────────────┤
  │   Preview (60vh fixed)       │
  │                              │
  └──────────────────────────────┘
```

- Below 1024px: single column, iframe height = `60dvh`, form scrolls above
- Search bar sticky at top on mobile
- Tab bar scrollable horizontally if tabs overflow

---

## 6. Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| iframe reload = full page SSR re-render | Debounce 1500ms + only reload on blur (not every keystroke) |
| 55+ fields re-rendering on every keystroke | React already efficient with controlled inputs; search filter reduces visible count |
| iframe consuming memory when hidden | Tab switch does NOT destroy iframe — just changes src. Single iframe instance. |
| Cookie parsing on every SSR request | `getSiteSettings()` is wrapped in React `cache()` — parsed once per request |

---

## 7. Testing Strategy

### 7.1 Unit test: `settings.ts` cookie override

```typescript
// settings.test.ts
describe("getSiteSettings with preview cookie", () => {
  test("merges preview overrides onto database settings", async () => {
    // Mock: database returns { site_title: "Old" }
    // Mock: cookie "preview_settings" = "site_title=New&theme_color=%23fff"
    const result = await getSiteSettings();
    expect(result.site_title).toBe("New");
    expect(result.theme_color).toBe("#fff");
  });

  test("falls back to database when cookie is malformed JSON", async () => { ... });
  test("ignores preview cookie when value is empty string", async () => { ... });
  test("handles cookie > 4KB gracefully", async () => { ... });
});
```

### 7.2 Manual QA checklist

- [ ] Open `/quan-tri-vien/cai-dat` → see split-screen layout
- [ ] Type in `site_title` → wait 1.5s → iframe preview title changes
- [ ] Switch preview tab to "Khóa học" → iframe navigates to `/khoa-hoc`
- [ ] Click "Lưu thay đổi" → success toast → preview reflects saved data
- [ ] Refresh page → form shows saved values, preview shows saved values
- [ ] Modify field, close tab without saving → reopen → cookie expired, data from DB
- [ ] Test on mobile viewport (<1024px) → single column layout
- [ ] Search "khóa" → only matching fields shown
- [ ] Search "xyz" → "Không tìm thấy" message

---

## 8. Rollback Plan

Feature is purely additive — zero backend changes. If something goes wrong:

1. Comment out `<div className={styles.preview}>` block in `page.tsx` → back to single-column form
2. Comment out cookie read in `getSiteSettings()` → back to DB-only settings
3. Both changes are one-line reverts, no migration needed

---

## 9. Next Steps

```
1. [ ] /bdd-review results → update spec 11-...md
2. [ ] Implement Step 1: settings.ts cookie override
3. [ ] Implement Step 2: split-screen layout + iframe
4. [ ] Implement Step 3: cookie write/debounce/save flow
5. [ ] Implement Step 4: responsive + polish
6. [ ] Manual QA checklist
7. [ ] bun run build → verify no regressions
```
