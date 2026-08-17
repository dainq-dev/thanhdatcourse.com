# BDD Review: Specs 19 & 20

**Reviewer:** Adversarial agent
**Date:** 2026-08-09
**Codebase snapshot:** Branch `main`

---

## Cross-Spec Consistency

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | **Duplicate user story** | 🔴 Blocking | US-19.4 "Admin chọn trang trong Wizard" và US-20.1 "Admin chọn trang trong Wizard" mô tả CÙNG MỘT tính năng. Phải merge vào 1 spec duy nhất, hoặc 1 spec refer đến spec kia. |
| 2 | **Props interface conflict** | 🔴 Blocking | Spec 19 "Files to Modify" nói sửa LayoutWizard.tsx để "Thêm page selector dropdown". Spec 20 đổi hoàn toàn Props interface: bỏ `page`, đổi `onSave: () => Promise<void>` thành `onSave: (keys: string[]) => Promise<void>`, đổi `onPreviewReload: () => void` thành `onPreviewReload: (path: string) => void`. Nếu dev làm tuần tự, spec 20 sẽ break code của spec 19. |
| 3 | **cai-dat/page.tsx integration not synced** | 🔴 Blocking | Spec 20 thay đổi `onSave` signature nhưng `cai-dat/page.tsx` hiện tại (line 286-294) truyền `page="homepage"`, `onSave={async () => { await handleSave(); }}`, `onPreviewReload={reloadPreview}`. Cả `handleSave` và `reloadPreview` đều không accept parameters. Integration plan giữa 2 spec thiếu rõ ràng. |
| 4 | **Spec 19 duplicate MODIFY section** | 🟡 Warning | Spec 19 có 2 heading "MODIFY" ở dòng 284 và 301 (cùng danh sách files). Bảng thứ hai chứa CSS files và ProductGrid.tsx — nên đặt tên khác cho phân biệt. |
| 5 | **Template engine support claims vs data model** | 🟡 Warning | Spec 19 nói "Engine count per page: 2 engines: default + 1 new variant". Nhưng `layout-engine.ts` define `CourseEngineId` có 7 variants, `PortfolioEngineId` có 6, `ProductEngineId` có 3. Wizard đã hiện tất cả engines này ở step 2. Các engines không được implement (carousel, hero-grid, cards-stagger, compact, timeline, filmstrip, fullwidth, masonry cho products) fallback về default. UX confusing. |
| 6 | **Spec 20 depends on Spec 19 implicitly** | 🟡 Warning | Spec 20 "Depends on LayoutWizard.tsx (đã có)" — nhưng thực tế phụ thuộc vào PAGE_CONFIGS changes từ Spec 19 và engine selector UI từ Spec 19. Nếu build spec 20 trước spec 19, course/portfolio/presets page dropdown sẽ không có engine selector tương ứng trong wizard. |

## Spec 19 Findings

| # | Severity | Scenario | Finding | Suggested Fix |
|---|----------|----------|---------|---------------|
| 1 | 🔴 Blocking | Engine inline in 3 templates | **Massive code duplication**: courses-default, courses-minimal, courses-full copy-paste cùng 50 dòng code (lines 64-112) cho grid rendering. Khi thêm engine switch inline, mỗi template phải thêm 2 branch (grid/list) × 3 templates = 6 lần copy-paste của CÙNG logic render. Portfolio cũng tương tự (3 templates × 2 branches). Tổng cộng ít nhất 9 copies của cùng switch logic. | Extract `CourseCardGrid` và `CourseCardList` thành sub-components trong `_templates/`. Hoặc đưa engine logic vào 1 shared component dùng chung cho cả 3 template. |
| 2 | 🔴 Blocking | `void getCoursesEngine(settings)` | Cả 3 `page.tsx` hiện tại gọi `void getCoursesEngine(settings)` / `void getPortfolioEngine(settings)` / `void getPresetsEngine(settings)` — đây là dead code (giá trị trả về bị throw away). Spec 19 nói "Xóa" nhưng không nói thay bằng gì. Engine hiện tại phải được lấy và **truyền vào template qua props**. | Spec phải ghi rõ: `const engine = getCoursesEngine(settings);` và `<Template engine={engine} .../>`. Hiện "Xóa void getCoursesEngine()" là mơ hồ. |
| 3 | 🔴 Blocking | All 8 template Props interfaces | courses-default/minimal/full đều có `interface Props { settings; courses; faqs }` — không có `engine`. portfolio-default/categorized/showcase đều có `interface Props { settings; portfolios; ctaItems }` — không có `engine`. presets-default/featured đều có `interface Props { settings; products }` — không có `engine`. Spec nói "Thêm engine?: string vào mỗi Props interface" nhưng không định nghĩa `engine` là gì — GameEngineId? string? union type? | Thêm `engine?: CourseEngineId`/`PortfolioEngineId`/`ProductEngineId` với type cụ thể từ `layout-engine.ts`. |
| 4 | 🔴 Blocking | Template switch + engine switch BDD | Scenario "Template Switch on 3 Pages" line 178: "courses use the engine from settings.courses_list_engine". Nhưng `courses-default` template không nhận `engine` prop, không đọc `settings.courses_list_engine`. Template hiện tại hoàn toàn không biết engine. Spec nói template dùng engine từ settings nhưng chính spec lại bảo engine được truyền qua props. | Clarify: engine đến từ `page.tsx` (đọc từ settings → truyền qua props vào template) HOẶC template tự đọc từ props.settings. Phải nhất quán. |
| 5 | 🟡 Warning | Portfolio showcase + engine masonry | US-19.2 line 42: "Template portfolio-showcase cũng hỗ trợ engine". Showcase có featured section (lines 47-79 trong portfolio-showcase.tsx) + list section. Khi engine="masonry", featured section vẫn là stacked, hay cả featured cũng masonry? Spec không đề cập. | Thêm clarifying scenario: "Given portfolio-showcase template AND engine=masonry, Then featured project remains stacked hero, And list section uses masonry grid". |
| 6 | 🟡 Warning | Category filter + masonry | US-19.3 scenario line 190: "category filter buttons appear above the portfolio list" — nhưng portfolio-categorized.tsx filter buttons hiện tại là **static** (không có state, không có `onClick`, không filter gì cả — lines 47-55). Khi engine="masonry", masonry grid vẫn chứa TẤT CẢ portfolios, filter buttons chỉ decoration. | Spec phải nói rõ filter có hoạt động không. Nếu filter chưa được implement (spec 06?), ghi rõ "filter buttons are visual-only in this iteration". |
| 7 | 🟡 Warning | presets-featured "hero card" vs current code | BDD Scenario line 200-203: "first product is shown as a hero card, remaining products are shown in a smaller grid". `presets-featured.tsx` đã có featured section riêng + ProductGrid cho list. "hero card" là tính năng ĐÃ TỒN TẠI, không phải thứ spec 19 thêm. Nhưng spec 19 nói thêm `engine?: string` vào presets-featured. Khi engine="single-col", featured section vẫn là stacked card lớn, hay cũng thành single-col? | Clarify engine chỉ ảnh hưởng đến ProductGrid (list items), không ảnh hưởng featured section. |
| 8 | 🟢 Info | Masonry CSS `columns: 3` với 1 item | CSS masonry bằng `columns: 3` flow top→bottom first. Với 1 portfolio duy nhất, nó nằm ở cột 1, 2 cột còn lại trống → aesthetically broken. | Consider fallback: if portfolios.length < 3, use `columns: auto` or switch to stacked instead. |
| 9 | 🟢 Info | Presets engine "masonry" exists but not in spec | `ProductEngineId = "grid" | "masonry" | "single-col"`. Spec 19 chỉ đề cập grid và single-col nhưng trong wizard, admin có thể chọn "Masonry" cho products. Template hiện tại chưa xử lý → fallback về grid. | Add scenario for masonry product engine fallback behavior. |

## Spec 20 Findings

| # | Severity | Scenario | Finding | Suggested Fix |
|---|----------|----------|---------|---------------|
| 1 | 🔴 Blocking | `onSave(keys: string[])` integration gap | Spec 20 line 167: `onSave: (keys: string[]) => Promise<void>` — nhưng `handleSave` trong `cai-dat/page.tsx` (line 122-143) collect **tất cả changed keys** từ toàn bộ `formData`, không filter theo page. LayoutWizard gọi `onSave(keys)` với page-specific keys, nhưng `handleSave` ignore parameter này, vẫn save tất cả. **All pages' unsaved changes get saved together.** | `handleSave` phải accept keys parameter và filter: `const changed = keys.filter(k => formData[k] !== settings[k]).reduce(...)`. |
| 2 | 🔴 Blocking | `onPreviewReload(path: string)` unsupported | Spec 20 đổi `onPreviewReload: (path: string)` — nhưng `reloadPreview` trong cai-dat/page.tsx (line 167-170) chỉ `setPreviewKey(k => k+1)`, không có parameter path. `previewPath` state là riêng của cai-dat/page.tsx. Khi LayoutWizard gọi `onPreviewReload("/khoa-hoc")`, iframe vẫn load URL cũ. | `reloadPreview` phải update `setPreviewPath(path)` + `setPreviewKey(k => k+1)`. Hoặc LayoutWizard nhận `setPreviewPath` prop riêng. |
| 3 | 🔴 Blocking | Race condition: `page` state + config derivation | Spec 20 pseudocode line 175-179: `setPage(newPage); setStep(1); onPreviewReload(PAGE_CONFIGS[newPage].previewPath)`. Trong cùng 1 closure, `config` vẫn là `PAGE_CONFIGS[page]` (page cũ) vì `setPage` là async. Template cards và engine selector sẽ render sai trong frame hiện tại. Chỉ render đúng ở cycle sau. | Dùng `const newConfig = PAGE_CONFIGS[newPage]` local variable để các callbacks trong cùng handler dùng newConfig, không rely on `config` derived từ state. |
| 4 | 🟡 Warning | Step reset → lost engine selections | Spec 20 line 107-109: "Given I am on Step 2 (engine selection) for homepage, When I switch to 'Khóa học' page, Then wizard goes back to Step 1". Step reset về 1 — nhưng engine selection cho homepage (đã thay đổi ở step 2, chưa save) **đã được write vào formData** (qua `onChange`). Khi chuyển sang page khác, formData vẫn giữ engine cũ cho homepage. Khi quay lại homepage, engine selection khôi phục từ formData (correct behavior). Nhưng cookie bị clear (spec line 167). Preview for homepage now shows DB values instead of unsaved engine selection. | Explicitly state: formData is preserved across page switches (in cai-dat memory). Only preview cookie is reset. |
| 5 | 🟡 Warning | Engine "default" label mapping | Scenario line 133-135: "engine dropdown shows 'Lưới' (default) selected. And engine value 'grid' is used for rendering". Nhưng default portolio engine là "stacked", label "Xen kẽ", không phải "Lưới". Label mapping ở `layout-engine.ts` line 288: courses engineKeys = `{ courses: "courses_list_engine" }` → default engine là `getCoursesEngine` → "grid" → label "Lưới". OK cho courses. Nhưng spec 20 line 89: "engine selector shows: Dự án (1 content type)" — engine default là "stacked" (Xen kẽ), không phải "grid" (Lưới). | Kiểm tra lại label mặc định cho từng page trong spec. |
| 6 | 🟡 Warning | Current cai-dat/page.tsx hardcodes `page="homepage"` | Line 287: `<LayoutWizard page="homepage" ... />`. Spec 20 muốn bỏ prop này. Nhưng page state trong LayoutWizard default là "homepage" (line 172 spec 20). Vậy integration thực tế: xóa `page="homepage"` khỏi cai-dat, LayoutWizard tự init. Việc này không conflict với spec 19 — spec 19 thêm dropdown, spec 20 đổi props. Nhưng thứ tự thực hiện quan trọng. | Sequence: implement spec 20 props change trước, then spec 19 UI change sau. |
| 7 | 🟢 Info | Page-specific save scope vs cookie | Spec 20 line 44: "Mỗi lần lưu → chỉ cập nhật setting của trang đang chỉnh sửa". Nhưng `buildPreviewCookie` trong cai-dat/page.tsx (line 40-52) write cookie với ALL changed keys, không filter theo page. Sau khi save, cookie được clear (`writePreviewCookie({})`). Behavior này OK cho save flow. Nhưng preview flow: khi admin đổi trang, cookie cũ bị clear và chỉ set keys của trang mới. Cookie không chứa multi-page preview data — điều này đúng với spec. | No change needed; document decision. |
| 8 | 🟢 Info | Toast message implementation | Spec 20 line 123: "toast shows 'Đã lưu giao diện Khóa học'". `handleSave` hiện tại dùng `setSuccess('Đã lưu N thay đổi')` — không nhận tên trang. | `handleSave` needs to accept/adjust success message based on page context. Could be a layout wizard's `onSave` returning the page name. |

## Edge Cases Not Covered

| # | Edge Case | Which spec | Suggested fix |
|---|-----------|------------|---------------|
| 1 | `engine = undefined` → fallback behavior | 19 | Spec line 214 nói: "Engine ID không hợp lệ → fallback về default". Nhưng `undefined` không phải "invalid ID" — nó là "missing prop". Template code hiện tại không check `engine === undefined`. Khi page.tsx chưa truyền engine (sau khi xóa `void getCoursesEngine`), prop sẽ là undefined. | Template dùng: `const engine = props.engine || "grid"` (default specified per page). |
| 2 | `engine = ""` (empty string) | 19 | Template sẽ check `if (engine === "list")` — empty string sẽ fall qua tất cả if branches và render nothing cho list section. Spec không định nghĩa empty string behavior. | Normalize: `const e = engine || "grid"` hoặc `const e = COURSE_ENGINE_META[engine] ? engine : "grid"` |
| 3 | Empty data: 0 courses, 0 portfolios, 0 products | 19 | Courses templates: không có empty state → `.courseGrid` div rỗng với StaggerReveal nhưng không có children. Portfolio templates: `.projectList` div rỗng. Product: có empty message (`"Chưa có sản phẩm nào"`). | Thêm empty state cho courses (`"Chưa có khóa học nào"`) và portfolios (`"Chưa có dự án nào"`). |
| 4 | Masonry grid với 1 portfolio, `columns: 3` | 19 | 1 item cột 1, cột 2 và 3 trống → layout trông như bug. | Đã ghi nhận ở Spec 19 finding #8. |
| 5 | `featuredProject = portfolios[0]` khi `portfolios` rỗng | 19 | `portfolio-showcase.tsx` line 37: featuredProject = undefined khi portfolios rỗng. Code đã check `if (featuredProject)` trước khi render (line 47) — SAFE. Nhưng `listItems` = whole portfolios array (line 41 fallback). Khi portfolios rỗng, listItems = [] → `.projectList` rỗng — no crash, just empty page. | Existing code is safe. Document in spec that showcase with 0 portfolios shows only page header + CTA. |
| 6 | `presets-featured` với 1 product, engine="single-col" | 19 | Featured product section hiển thị card lớn (lines 47-82). ProductGrid nhận `listItems` (0 items sau khi trừ featured). Không crash, chỉ hiển thị "Chưa có sản phẩm nào khác". | Document expected behavior. Could hide the "no other products" message when total count = 1. |
| 7 | Single-col engine + ProductGrid video modal | 19 | ProductGrid là "use client" với `activeVideo` state. Spec nói thêm `layout?: string` prop. Single-col layout vẫn giữ nguyên video modal (tốt). Nhưng single-col SCSS cần copy-paste toàn bộ video modal CSS từ grid styles? | Verify SCSS selector hierarchy — if `.singleCol` wrapper preserves `.videoModal` selector specificity, no additional CSS needed. |
| 8 | Cookie size with 4 pages preview data | 20 | Spec 20 line 102-103: cookie cleared on page switch, "new cookie set with courses settings from DB". Cookie chỉ chứa keys của trang hiện tại. `buildPreviewCookie` limit 3800 bytes — dư sức cho 1 page. | Safe. No multi-page cookie needed. |
| 9 | Admin đang ở tab "Giao diện" section nhưng LayoutWizard is inside a collapsible section | 20 | LayoutWizard nằm trong `section.id === "design"` block (line 285-294). Nếu admin collapse "Giao diện" section giữa chừng while editing page 2? React state preserved trong Wizard (page state, step state) vẫn intact khi expand lại. | OK unless section collapse triggers unmount. Verify `expandedSections` toggle unmounts or just hides. |
| 10 | Preview iframe loading indicator during page switch | 20 | Spec 20 line 78: "preview iframe reloads to /khoa-hoc". `handleIframeLoad` set `previewLoading = false`. Race condition: if admin switches pages rapidly (spam clicks), multiple `setPreviewKey` calls fire, iframe reloads multiple times, loading indicator flickers. | Debounce page switch (reuse existing 500ms debounce pattern from LayoutWizard) hoặc disable dropdown during loading. |

## Combined Verdict

- Total findings: **29**
- Blocking (🔴): **10**
- Warnings (🟡): **9**
- Info (🟢): **10**

### Major blocking issues summary:

1. **Code duplication disaster**: Engine switch inline trong 8 templates (~11 template files) sẽ tạo ít nhất 9 copies của cùng grid/list/masonry/single-col logic. Phải extract shared components.

2. **Spec 19 + 20 Props conflict**: LayoutWizard.tsx cần được sửa bởi cả 2 spec với 2 Props interface khác nhau. Cần 1 unified plan.

3. **`onSave`/`onPreviewReload` integration broken**: Spec 20's new signatures not supported by cai-dat/page.tsx — cần rewrite cả `handleSave` và `reloadPreview`.

4. **`void getCoursesEngine()` removal incomplete**: Spec 19 nói "xóa" nhưng không nói thay bằng gì. Engine không được truyền vào template.

5. **Race condition in handlePageChange**: `setPage(newPage)` + `setStep(1)` trong cùng handler nhưng `config` derivation từ `page` state không update sync.

6. **Engine count advertised (2) ≠ actual (7/6/3)**: Wizard shows all engines but templates only handle 2 each. UX for other engines will fallback silently.

**Overall: REVISE** — Do not proceed to `/bdd-dev` until 10 blocking issues are resolved. Recommended approach: merge spec 19 & 20 into one unified spec, then address all blocking issues before development.
