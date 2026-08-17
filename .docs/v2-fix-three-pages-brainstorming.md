# Brainstorming: Giải quyết 3 trang còn lại + Engine + Wizard

**Date:** 09/08/2026
**Focus:** `/khoa-hoc`, `/san-pham`, `/cong-cu`

---

## Phase 1: Frame the Problem — ĐÚNG vấn đề

### 3 bug thực sự trong code hiện tại

| # | Bug | File | Line | 
|---|-----|------|------|
| 1 | `void getCoursesEngine(settings)` — gọi rồi vứt, không ai dùng kết quả | `khoa-hoc/page.tsx` | 70 |
| 2 | `void getPortfolioEngine(settings)` — tương tự | `san-pham/page.tsx` | 81 |
| 3 | `void getPresetsEngine(settings)` — tương tự | `cong-cu/page.tsx` | 50 |

**Gốc rễ:** Template components có Props interface `{ settings, courses, faqs }` — **không có `engine` prop**. Không thể truyền engine vào nếu Props không chấp nhận.

### 3 vấn đề thiết kế chưa giải quyết

| # | Vấn đề | Tại sao chưa xong |
|---|--------|-------------------|
| A | Không có engine component nào (grid, list, carousel, masonry...) | 16 components chưa code |
| B | Template render cards cứng (inline JSX), không switch engine | Templates chỉ extract section ordering, chưa có engine resolution |
| C | Wizard chỉ hoạt động cho homepage (`page="homepage"` cứng) | Chưa có page selector UI trong wizard |

---

## Phase 2: SCAMPER — Giải pháp cho từng vấn đề

### Vấn đề A: Không có engine components

**S (Substitute):** Thay vì code 16 engine components, dùng chính card JSX hiện tại làm engine "default" (grid). Chỉ cần code **1 engine mới cho mỗi trang** để chứng minh concept:

| Trang | Engine có sẵn (dùng luôn code hiện tại) | Engine mới cần code |
|-------|----------------------------------------|---------------------|
| /khoa-hoc | `grid` (code courses-default.tsx đã là grid) | `list` — row dọc thay vì grid |
| /san-pham | `stacked` (code portfolio-default.tsx đã là stacked) | `masonry` — grid không đều |
| /cong-cu | `grid` (code presets-default.tsx đã là grid) | `single-col` — 1 cột |

**C (Combine):** Mỗi template component TỰ chứa code render cards. Không cần engine component riêng. Thay vào đó, template có `renderCards` function bên trong, switch theo engine ID.

```tsx
// Trong courses-default.tsx
function renderCourses(engine: string, courses: Course[], settings) {
  switch (engine) {
    case "list": return <CoursesListView courses={courses} settings={settings} />;
    default:    return <CoursesGridView courses={courses} settings={settings} />;
  }
}
```

**A (Adapt):** Pattern này giống `SectionRenderer.tsx` — có 1 map, lookup component theo key. Scale lên page level.

**M (Modify):** Templates đã là Server Components. Engine components cũng là Server Components. Không cần state, không cần "use client".

**E (Eliminate):** Bỏ `void getXxxEngine()` — nếu không dùng thì xóa luôn, không gọi lãng phí.

**R (Reverse):** Thay vì "engine là component riêng", nghĩ ngược: **engine là config CSS**. Cùng 1 HTML structure, thay đổi class name dựa trên engine:

```tsx
<div className={`course-list ${engine === "list" ? "list-layout" : "grid-layout"}`}>
```

---

### Vấn đề B: Template render cards cứng

**Giải pháp chọn: Combine + Adapt**

Không tách engine component riêng. Mỗi template nhận thêm `engine` prop và tự switch rendering bên trong. Đây là cách đơn giản nhất, ít file nhất.

```
Trước:
<Template settings={settings} courses={courses} faqs={faqs} />

Sau:
<Template settings={settings} courses={courses} faqs={faqs} engine={engine} />

Trong template:
{courses.map(course => (
  engine === "list" 
    ? <CourseRow key={course.id} course={course} />
    : <CourseCard key={course.id} course={course} />
))}
```

**Cần làm:**
1. Thêm `engine` vào Props interface của mỗi template
2. Trong template, switch card rendering dựa trên engine
3. Code 1-2 card variant component cho mỗi content type
4. page.tsx truyền engine vào template (bỏ `void`)

---

### Vấn đề C: Wizard chỉ cho homepage

**Giải pháp:** Thêm dropdown "Trang đang chỉnh sửa" vào Wizard header.

```
┌──────────────────────────────────┐
│ Bố cục: [Trang chủ    ▼]  ● ○ ○ │  ← Dropdown chọn trang
│                                  │
│ [Template skeleton cards...]     │
└──────────────────────────────────┘
```

`PAGE_CONFIGS` đã định nghĩa sẵn 4 page configs. Chỉ cần:
1. Thêm state `page` vào LayoutWizard
2. Render dropdown với 4 options từ `Object.entries(PAGE_CONFIGS)`
3. Khi đổi page → reset formData về settings của page đó → cookie update → iframe reload

---

## Phase 3: Action Plan

### Step 1: Fix 3 bug `void` (5 phút)

Xóa 3 dòng `void getXxxEngine(settings)` trong 3 file page.tsx. Chưa dùng thì đừng gọi.

### Step 2: Thêm engine vào Templates (30 phút)

**Courses templates (3 files):**
- Thêm `engine: string` vào Props
- Render `engine === "list"` → `<CourseRow />` thay vì `<div className={styles.card}>`
- Fallback về grid mặc định

**Portfolio templates (3 files):**
- Thêm `engine: string` vào Props
- `engine === "masonry"` → `<div className={styles.masonryGrid}>`
- Fallback về stacked

**Presets templates (2 files):**
- Thêm `engine: string` vào Props
- `engine === "single-col"` → single column layout
- Fallback về grid

### Step 3: Code Card Variant Components (1-2 giờ)

**Cho courses:**
- `CourseRow` — Row ngang: thumbnail 280px trái, info phải (title, desc, price, CTA) — reuse SCSS từ page.module.scss
- Giữ nguyên `CourseCard` hiện tại cho grid

**Cho portfolios:**
- CSS `.masonryGrid` — `columns: 3; column-gap: 1rem;` cho layout masonry
- Giữ nguyên stacked hiện tại

**Cho presets:**
- Single column: mỗi product 1 row full-width
- Giữ nguyên grid hiện tại

### Step 4: page.tsx truyền engine vào Template (5 phút)

```tsx
// khoa-hoc/page.tsx
const engine = getCoursesEngine(settings);
return <Template settings={settings} courses={courses} faqs={faqs} engine={engine} />;

// san-pham/page.tsx
const engine = getPortfolioEngine(settings);
return <Template settings={settings} portfolios={portfolios} ctaItems={ctaItems} engine={engine} />;

// cong-cu/page.tsx
const engine = getPresetsEngine(settings);
return <Template settings={settings} products={products} engine={engine} />;
```

### Step 5: Wizard multi-page (30 phút)

Thêm page selector dropdown trong LayoutWizard header, cho phép admin chuyển giữa 4 pages. Khi đổi page → gọi onChange với keys của page mới.

---

## Phase 4: So sánh với cách "engine components riêng"

| Tiêu chí | Engine components riêng (spec gốc) | Engine trong template (cách mới) |
|----------|-----------------------------------|----------------------------------|
| Số file cần tạo | 16 engine component files | 0 (dùng code trong template) |
| Số file cần sửa | 16 + 4 page.tsx + 11 templates | 11 templates + 3 page.tsx |
| Reusability | Engine dùng được nhiều nơi | Engine chỉ trong template đó |
| Tách biệt | Rõ ràng, mỗi engine 1 file | Code lẫn trong template |
| Time to ship | 2-3 ngày | 3-4 giờ |
| Phù hợp khi | Có 10+ engine, dùng nhiều lần | Có 2-3 engine per page, prototype |

**Chọn: Engine trong template (cách mới)** — vì:
1. Mỗi trang chỉ có 2-3 engine options
2. Card rendering code đã có sẵn trong template
3. Nhanh hơn 80% so với tách file riêng
4. Dễ maintain: code card + code template trong cùng 1 file
5. Khi cần scale → có thể extract ra engine component sau (refactor, không phải rewrite)

---

## Phase 5: Edge Cases

| Case | Xử lý |
|------|-------|
| Engine ID không hợp lệ (typo) | Fallback về grid mặc định |
| Engine là `undefined` (key chưa set) | `engine || "grid"` → grid |
| Templates không có engine prop (cũ) | TypeScript báo lỗi compile → buộc phải sửa |
| `getPortfolioItem` dead code trong san-pham/page.tsx | Xóa function |
| Category filter trong portfolio-categorized | Thêm state `activeCategory`, filter portfolios |
| CSS cho masonry không hoạt động trên Firefox? | `columns` CSS được hỗ trợ từ Firefox 52+, OK |
| SCSS module import trong template → có conflict? | Template import `../page.module.scss` — đã hoạt động |

---

## Kết luận

**Không cần 16 engine component. Chỉ cần 3 card variant + sửa 11 template + fix 3 page.tsx + wizard page selector.** 

Engine = function bên trong template, switch render dựa trên prop. Đơn giản, nhanh, đủ dùng cho 2-3 engine per page.
