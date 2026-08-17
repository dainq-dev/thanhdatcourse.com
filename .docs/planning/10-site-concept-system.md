# PLAN — Site Concept System (Spec 15)

**Status:** Ready for DEV
**Created:** 2026-08-18
**Ref:** `.docs/specs/15-site-concept-system.md`, `.docs/brainstorming-site-concept.md`

---

## 1. Tổng quan

Thay cơ chế Template + Engine (đang vô hiệu một phần) bằng **1 concept toàn site** (`site_concept`), 5 concept Server Component. Scope: 7 loại trang (trừ course detail).

**Success criteria (đo được cho từng step):**
- [ ] `site_concept` = 1 trong 5 giá trị → render đúng concept ở 7 trang
- [ ] Build pass, không còn import `layout-engine` / `layout-wizard` / `_templates`
- [ ] Admin cài đặt chọn concept → preview iframe đổi → lưu → public đổi

---

## 2. Files sẽ đụng tới (đã xác minh bằng grep)

### 2.1 Xóa (cleanup)

| File | Lý do |
|---|---|
| `apps/web/src/lib/layout-engine.ts` | thay bằng `concepts/index.ts` |
| `apps/web/src/components/admin/layout-wizard/` (8 file) | thay bằng UI concept mới |
| `apps/web/src/app/(nguoi-dung)/_templates/` (3 file homepage) | dead |
| `apps/web/src/app/(nguoi-dung)/khoa-hoc/_templates/` (4 file) | dead |
| `apps/web/src/app/(nguoi-dung)/san-pham/_templates/` (3 file) | dead |
| `apps/web/src/app/(nguoi-dung)/cong-cu/_templates/` (2 file) | dead |

> Lưu ý: `course-cards.tsx` (CourseGrid/CourseList) nằm trong `khoa-hoc/_templates/` — cần di dời logic vào concept trước khi xóa.

### 2.2 Sửa (page public đọc concept)

| File | Thay đổi |
|---|---|
| `apps/web/src/app/(nguoi-dung)/page.tsx` | bỏ `getHomepageEngines` + `_templates`; render `Concept.Homepage` |
| `apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx` | render `Concept.CourseList` |
| `apps/web/src/app/(nguoi-dung)/san-pham/page.tsx` | render `Concept.PortfolioList` |
| `apps/web/src/app/(nguoi-dung)/san-pham/[id]/page.tsx` | render `Concept.PortfolioDetail` |
| `apps/web/src/app/(nguoi-dung)/cong-cu/page.tsx` | render `Concept.Products` |
| `apps/web/src/app/(nguoi-dung)/lien-he/page.tsx` | render `Concept.Contact` |
| `apps/web/src/app/(nguoi-dung)/bai-viet/page.tsx` | render `Concept.Blog` |
| `apps/web/src/app/(nguoi-dung)/bai-viet/[slug]/page.tsx` | render `Concept.BlogDetail` |

### 2.3 Sửa (motion + admin)

| File | Thay đổi |
|---|---|
| `apps/web/src/lib/motion.ts` | bỏ `getHomepageMotion`; concept tự quyết motion |
| 4 section component dùng `getHomepageMotion` (`about/product/counter/work-section`) | nhận motion từ concept prop |
| `apps/web/src/app/quan-tri-vien/cai-dat/page.tsx` | bỏ `PAGE_CONFIGS` + `LayoutWizard`; thay bằng concept selector UI |
| `apps/web/src/app/quan-tri-vien/cai-dat/field-defs.ts` | bỏ section `design` cũ (layout-template/hidden keys) + `homepage_motion` |
| `apps/web/src/lib/settings.ts` | KHÔNG đổi (dùng lại nguyên vẹn) |

### 2.4 Tạo mới

```
apps/web/src/concepts/
├── index.ts                  // registry + getConcept(id) + meta
├── shared/tokens.scss        // accent, spacing dùng chung
├── cinematic/  { tokens.module.scss, Homepage, CourseList, PortfolioList,
│                 PortfolioDetail, Products, Contact, Blog, BlogDetail }
├── minimal/    { ... 8 file }
├── bento/      { ... 8 file }
├── editorial/  { ... 8 file }
└── gallery/    { ... 8 file }
```

---

## 3. Risk & trade-off

| # | Risk | Mức | Mitigation |
|---|---|---|---|
| K1 | 5 concept × 8 trang = 40 file, khối lượng lớn | Cao | Phase 1 chỉ làm 2 concept mẫu (Cinematic+Minimal), verify xong mới nhân 3 còn lại |
| K2 | Xóa `_templates` ảnh hưởng `CourseGrid/CourseList` đang dùng | Cao | Di dời sang `concepts/shared/` trước khi xóa |
| K3 | Migrate layout cũ (compact→minimal) có thể đổi UI đột ngột | Trung | Seed/one-off script map key cũ → `site_concept` khi deploy |
| K4 | 7 trang public mỗi trang fetch data riêng — trùng logic | Thấp | Giữ data fetch ở page, concept chỉ nhận props (đã chốt) |
| K5 | Preview cookie chỉ 1 key nhỏ — an toàn, nhưng layout-wizard cũ ghi nhiều key | Thấp | Cleanup writePreviewCookie chỉ ghi `site_concept` |

**Trade-off chính:** Giữ data fetch ở page (không đưa vào concept) → concept là "presentation-only", dễ tái dùng, đúng R10 "toàn quyền layout + style" nhưng không chạm data layer.

---

## 4. Phương án (đã chọn)

**Chọn Option A — Component Switch** (từ brainstorming cũ đã validate 10/10 feasibility):
- Mỗi concept = 1 bộ component, registry map `id → { Homepage, CourseList, ... }`.
- Page public chỉ `getConcept(settings.site_concept)` → destructure component.
- SSR, tree-shaking, type-safe.

**Không chọn** Option B (JSON section config) — phức tạp drag-drop, không cần vì concept là layout cố định handcode. Không chọn Option C (CSS theme) — không đổi layout.

---

## 5. Task breakdown

### Phase 0 — Foundation
1. Tạo `concepts/index.ts`: `CONCEPT_IDS`, `getConcept(id)` fallback `cinematic`, `CONCEPT_META` (label + description + tone).
2. Tạo `concepts/shared/tokens.scss` (accent + spacing + breakpoint dùng chung).
3. Thêm key `site_concept` vào flow đọc (dùng `getSiteSettings` sẵn có).
   - *Verify:* `getConcept("bento")` trả meta bento; `getConcept(undefined)` trả cinematic.

### Phase 1 — 2 concept mẫu (Cinematic + Minimal)
4. Cinematic: 8 file (Homepage, CourseList, PortfolioList, PortfolioDetail, Products, Contact, Blog, BlogDetail) — Server Component.
5. Minimal: 8 file.
6. Di dời `CourseGrid/CourseList` sang `concepts/shared/` (dùng chung).
7. Wire 7 trang public đọc `getConcept`.
   - *Verify:* `bun run build` pass; `/` render cinematic, `/khoa-hoc` render cinematic.

### Phase 2 — 3 concept còn lại
8. Bento, Editorial, Gallery (mỗi 8 file).
   - *Verify:* build pass; chuyển `site_concept` qua 5 giá trị không lỗi.

### Phase 3 — Admin UI
9. `cai-dat/page.tsx`: bỏ LayoutWizard, thêm ConceptSelector (list 5 concept + thumbnail + click → write cookie `preview_settings = {site_concept}` + reload iframe).
10. `field-defs.ts`: bỏ section `design` cũ + `homepage_motion`.
   - *Verify:* mở `/quan-tri-vien/cai-dat` → chọn concept → iframe đổi → lưu → public đổi.

### Phase 4 — Cleanup + migrate
11. Xóa `layout-engine.ts`, `layout-wizard/`, 12 file `_templates/`.
12. Bỏ `getHomepageMotion`; cập nhật 4 section component nhận motion từ concept.
13. Script migrate: `homepage_template=compact→site_concept=minimal`, `default→cinematic`.
   - *Verify:* `grep -r "layout-engine\|layout-wizard\|_templates" apps/web/src` → empty; build + lint pass.

---

## 6. Effort estimate

| Phase | Effort | Ghi chú |
|---|---|---|
| 0 Foundation | 0.5 ngày | registry + tokens |
| 1 Cinematic + Minimal | 2-3 ngày | 16 file + wire 7 trang |
| 2 Bento + Editorial + Gallery | 3-4 ngày | 24 file |
| 3 Admin UI | 1 ngày | ConceptSelector + preview |
| 4 Cleanup + migrate | 0.5-1 ngày | xóa + script |
| **Total** | **~7-9 ngày** | |

---

## 7. Phase tiếp theo đề xuất

Sau khi PLAN được duyệt → **DEV** theo Phase 0 → 1 → 2 → 3 → 4, mỗi phase verify build/lint trước khi qua phase sau.
