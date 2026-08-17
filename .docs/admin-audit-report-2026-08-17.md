# Admin Panel — Comprehensive Bug & Tech Debt Report

**Date:** 17/08/2026
**Scope:** Toàn bộ phần quản trị viên (`/quan-tri-vien`, `/xac-thuc`), admin components, backend routes liên quan, và hệ thống multi-layout (homepage concept).
**Method:** Static code audit — đọc toàn bộ admin pages, media manager, layout-wizard, templates, engines, và các route API đối ứng.

---

## 1. Tổng quan

| Nhóm | Số finding | Mức nghiêm trọng |
|------|-----------|------------------|
| Media manager | 5 | 🔴 CRITICAL |
| Khuyến mãi | 1 | 🔴 CRITICAL |
| Homepage concept (multi-layout) | 11 | 🔴→🟢 |
| CRUD / listing pages | 6 | 🟠 HIGH |
| Chất lượng & bảo mật | 6 | 🟡 MEDIUM |
| Nợ kỹ thuật / consistency | 5 | 🟢 LOW |
| Fetch/env không thống nhất | 5 | 🟡 MEDIUM |

**Tổng: ~39 findings.**

**Nhận định chung:** Phần admin hoạt động được ở mức CRUD cơ bản, nhưng có 2 cụm hỏng nặng: (1) media manager — frontend gọi 5 endpoint mà backend không có hoặc ký sai contract; (2) multi-layout homepage — admin chọn template/engine nhưng render không thay đổi. Cả 2 cụm đều có chung triệu chứng: `.catch(() => {})` nuốt lỗi nên bug "im lặng", admin không biết tính năng đang hỏng.

---

## 2. 🔴 CRITICAL — Tính năng hỏng hoàn toàn

### 2.1 Cụm Media Manager (5 bug liên quan nhau)

| # | Bug | Evidence | Fix |
|---|-----|----------|-----|
| C1 | **Bulk delete không hoạt động** — gọi `DELETE /api/media/bulk` nhưng backend không có route `/bulk` (chỉ `/`, `/:id`). Request rơi vào `/:id` với `id="bulk"` → 404. | `index.logic.ts:119-120` vs `media.ts:87` | Thêm route `DELETE /api/media/bulk` ở backend. |
| C2 | **Thêm video YouTube hỏng** — gọi `POST /api/media/youtube` không tồn tại; route thật là `POST /external` và cần body `{source, url}` chứ không phải `{url}`. | `index.logic.ts:140-141` vs `media/index.ts:39` + `external.ts:7` | Sửa `addYoutubeVideo` gọi `POST /external` với `{source:"youtube", url}`. |
| C3 | **Thumbnail YouTube sai URL** — `getMediaUrl` dùng `file.diskPath` làm video ID, nhưng `external.ts:54` lưu `diskPath = external://...`; ID thật nằm ở cột `youtubeId` (không có trong type `MediaFile`). | `index.logic.ts:156-157` vs `external.ts:54` | Thêm `youtubeId` vào `MediaFile` type, dùng nó thay `diskPath`. |
| C4 | **Variant "Full" ảnh luôn 404** — `getMediaVariantUrls` liệt kê `/img/:id/full`, nhưng `IMAGE_VARIANTS` chỉ có `micro/thumbnail/medium/large/og`. | `index.logic.ts:187` vs `variants.ts:1` | Đổi "Full" → `large`, hoặc thêm variant `full`. |
| C5 | **Video không có thumbnail thật** — media grid dùng icon placeholder cho video thay vì thumbnail/preview. | `index.tsx:654-671` | (Ưu tiên thấp) generate video poster khi upload. |

### 2.2 Khuyến mãi

| # | Bug | Evidence | Fix |
|---|-----|----------|-----|
| C6 | **Không tắt/bật được khuyến mãi** — frontend gửi `PATCH .../toggle` body rỗng `{}`, backend bắt buộc `is_active: z.boolean()` → 400, frontend `.catch({})` nuốt lỗi. | `khuyen-mai/page.tsx:125` vs `promotions.ts:312-320` | Gửi `{ is_active: item.isActive === 0 }`. |

---

## 3. 🟠 HIGH — Logic sai nhưng không crash

| # | Bug | Evidence |
|---|-----|----------|
| H1 | **Bộ lọc "Nháp" bài viết không hoạt động** — gửi `draft=true` nhưng `posts.ts` không có param `draft` (chỉ `courses.ts` có). Chọn "Nháp" vẫn hiện tất cả. | `bai-viet/page.tsx:31` vs `posts.ts:21-27` |
| H2 | **Tìm kiếm bài viết không debounce** — mỗi ký tự 1 request (race + tải server), khác với `khach-hang` (debounce 300ms). | `bai-viet/page.tsx:44-46` |
| H3 | **Ghi chú lead bị mất** — note chỉ save khi bấm đổi status; không có nút "lưu note", textarea không khởi tạo từ `adminNotes` cũ. | `khach-hang/page.tsx:116-122, 387-397` |
| H4 | **`initialData` kiểu `any`** trong trang sửa bài viết — mất type safety. | `bai-viet/[slug]/page.tsx:26` |
| H5 | **Auto-save + Save thủ công chồng nhau** — `du-an/[id]` & `presets-luts/[id]` vừa auto-save (debounce 1.5s) vừa có nút Lưu; manual save không hủy pending auto-save → có thể PUT 2 lần. | `du-an/[id]/page.tsx:96-146` |
| H6 | **Xóa item cuối của trang cuối** → ở lại trang trống (không lùi trang). | `khoa-hoc/page.tsx:94`, `du-an/page.tsx:79` |

---

## 4. 🟠 Homepage Concept (multi-layout) — làm rõ + bug

### 4.1 Cách hệ thống hoạt động

Homepage có 2 lớp cấu hình trong tab **"Giao diện"** (`/quan-tri-vien/cai-dat`, section `id="design"`):

```
LayoutWizard (components/admin/layout-wizard/)
├── Step 1: TemplateSelector  → default / compact / cinematic
├── Step 2: EngineSelector    → kiểu hiển thị cards (per content type)
└── Step 3: StepActions       → preview + "Lưu thay đổi"
```

- **Flow lưu:** `LayoutWizard.onSave()` → `cai-dat/page.tsx:290-324` collect tất cả design keys → `PUT /api/settings/batch` → bảng `site_settings`.
- **Flow render:** `(nguoi-dung)/page.tsx` đọc `settings.homepage_template` → chọn template → render `HeroBanner`, `PromotionBanner`, `WorkSection`, `ProductSection`, `CounterSection`, `AboutSection`.

### 4.2 Bug

| # | Mức | Vấn đề | Evidence |
|---|-----|--------|----------|
| M1 | 🔴 | **Toggle "Hiển thị mục này" không bao giờ hoạt động** — `FieldRow` toggle lưu `"1"`/`"0"` (`page.tsx:702`), nhưng `WorkSection`/`ProductSection` kiểm tra `!== "false"`. Với value `"0"` (tắt) hoặc `undefined` (chưa set), biểu thức luôn `true` → section luôn hiển thị. Admin bấm tắt section Dự án/Sản phẩm không có tác dụng. | `cai-dat/page.tsx:702` vs `work-section/index.tsx:30`, `product-section/index.tsx:39` |
| M2 | 🔴 | **Homepage engine không có tác dụng** — `page.tsx:91` gọi `void getHomepageEngines(settings)` rồi vứt kết quả; homepage templates không nhận prop `engine`, `WorkSection`/`ProductSection` không đọc setting engine nào. | `page.tsx:91`, `homepage-default.tsx:39-44` |
| M3 | 🔴 | **Template "Điện ảnh" (cinematic) là giả** — chỉ `export { HomepageDefault as HomepageCinematic }`. Chọn cinematic render đúng bố cục default. | `homepage-cinematic.tsx:1` |
| M4 | 🟠 | **Engine catalog lệch với template thực tế** — wizard hiển thị 7 course / 6 portfolio / 3 product engine, nhưng template chỉ implement 2 mỗi loại (courses: list, portfolio: masonry, presets: single-col). Còn lại fallback im lặng. | `courses-default.tsx:47-51`, `portfolio-default.tsx:42-64`, `presets-default.tsx:42` |
| M5 | 🟠 | **WorkSection không dùng engine** — luôn render `slice(0,2)` card cứng, không có stacked/masonry/timeline như catalog hứa. | `work-section/index.tsx:34-36` |
| M6 | 🟠 | **2 toggle ẩn là dead settings** — `home_counters_section_visible` và `home_about_section_visible` được khai báo trong field-defs nhưng `CounterSection`/`AboutSection` không đọc chúng (khác với Work/Product có check `visible`). Admin tắt "Số liệu"/"Giới thiệu" không có tác dụng. | `field-defs.ts:191,208` vs `counter-section/index.tsx`, `about-section/index.tsx` |
| M7 | 🟠 | **Reference field gần như vô dụng** — `home_work_card1_ref`/`home_products_card1_ref` mapping ghi title/desc/href, nhưng `WorkSection` ưu tiên dùng `portfolios.length >= 2` và `ProductSection` dùng `courses[0]`/`products[0]` (data auto-fetch từ DB) thay vì reference admin đã chọn. Reference chỉ rơi vào nhánh fallback khi không có data. | `cai-dat/page.tsx:1007-1034` vs `work-section/index.tsx:34-56`, `product-section/index.tsx:43-69` |
| M8 | 🟠 | **`homepage_products_engine` không có nghĩa về mặt khái niệm** — engine `products` (grid/masonry/single-col) giả định render *danh sách* sản phẩm, nhưng `ProductSection` là bento 2 card cố định (Khóa học + Preset), không phải list. Engine này áp lên gì cũng vô nghĩa. | `product-section/index.tsx:98-119` |
| M9 | 🟡 | **Race condition khi chuyển trang trong wizard** — `setPage` là async; `handleTemplateChange`/`handleEngineChange` đóng `config` từ closure, bấm nhanh sau đổi page có thể ghi nhầm key trang cũ. | `LayoutWizard.tsx:41-74` |
| M10 | 🟡 | **Field `type:"hidden"` không xử lý** — `FieldRow` không có nhánh "hidden"; khi search các engine key có thể lộ thành input thường. | `field-defs.ts:393-401` vs `cai-dat/page.tsx` (FieldRow) |
| M11 | 🟢 | **Step 3 hiển thị engine ID thô** (`"masonry"` thay vì "Masonry"). | `StepActions.tsx:47-51` |

### 4.3 Phân tích sâu hơn — tại sao homepage concept đang "vỡ"

Homepage đang tồn tại **2 cơ chế cấu hình chồng chéo nhưng không ăn khớp**:

**Cơ chế A — "Content settings" (đang hoạt động một phần):**
- Tab **"Trang chủ"** (section `homepage` + sub-sections) quản lý *nội dung*: hero text, `home_work_*`, `home_products_*`, `home_counters`, `home_about_*`, các toggle `*_section_visible`, và reference fields.
- Các section component đọc trực tiếp `settings.*`.

**Cơ chế B — "Multi-layout" (LayoutWizard):**
- Tab **"Giao diện"** (section `design`) quản lý *bố cục*: template + engine.

**Các mâu thuẫn giữa 2 cơ chế:**

1. **Toggle visibility là cơ chế A nhưng bị hỏng** (M1/M6): admin nghĩ rằng tắt section trong tab "Trang chủ" sẽ ẩn section, nhưng code so sánh sai kiểu dữ liệu (`"0"`/`"1"` vs `"false"`). Kết quả: không thể ẩn bất kỳ section nào.
2. **Template (cơ chế B) cũng quyết định section có hiện hay không** — nhưng chỉ `compact` bỏ `Work` + `PromotionBanner`. Nếu cả template `default` lẫn toggle `home_work_section_visible="0"` cùng áp dụng → toggle thua (vì code hỏng).
3. **Reference fields (cơ chế A) mâu thuẫn với auto-fetch featured data** — 2 nguồn dữ liệu cho cùng 1 card, code ưu tiên data tự fetch, reference bị phủ định.
4. **Engine products (cơ chế B) mâu thuẫn với bento 2-card layout** — engine giả định list, layout thực tế là 2 card tĩnh.
5. **`hero_banner`, `promotion_banner`, `counter`, `about` không có đối tượng engine tương ứng** — engine catalog chỉ có courses/portfolios/products, nên 4 section này không thể "đổi kiểu hiển thị" dù nằm trong template.

**Kiến trúc hợp lý hơn cần làm rõ:**
- (a) Template chỉ nên quản lý *thứ tự + sự hiện diện* section (bỏ engine khỏi các section không phải list).
- (b) Engine chỉ áp dụng cho các section *thực sự render danh sách* (WorkSection nếu đổi thành list portfolios, ProductSection nếu đổi thành grid products).
- (c) Toggle visibility phải sửa kiểu so sánh (`!== "0"` thay vì `!== "false"`) và phải được tôn trọng bởi template (template không hardcode bỏ section).
- (d) Reference field hoặc auto-fetch: chọn 1 nguồn duy nhất, không chồng chéo.

**Kết luận cụm này:** Homepage là nơi "rỗng" nhất của multi-layout, và vấn đề sâu hơn không chỉ là "chưa wire engine" mà là **2 cơ chế cấu hình (content settings vs layout wizard) chồng lấn và mâu thuẫn nhau**, trong đó toggle visibility hỏng khiến admin không thể kiểm soát được section nào hiển thị.

---

## 5. 🟡 MEDIUM — Chất lượng & bảo mật

| # | Bug | Evidence |
|---|-----|----------|
| P1 | `media.ts` PATCH `/:id` + `external.ts` POST không Zod validation, không giới hạn body size. | `media.ts:74-86`, `external.ts:7-59` |
| P2 | `leads.ts` PUT `/:id` parse JSON thủ công, không nhất quán với route khác (dùng `zValidator`). | `leads.ts:98-106` |
| P3 | `khuyen-mai/page.tsx` `getStatus()` trả `"all"` cho inactive — lạm dụng type `StatusFilter`. | `khuyen-mai/page.tsx:26-34` |
| P4 | 3 trang list lặp gần như nguyên văn (khoa-hoc / du-an / presets-luts): card grid + table + ConfirmDialog + skeleton, ~500 dòng × 3. Cần extract component chung. | — |
| P5 | `bai-viet/[slug]` dùng `window.confirm()`, các trang khác dùng `ConfirmDialog` — UX không nhất quán. | `bai-viet/[slug]/page.tsx:65` |
| P6 | `layout.tsx` admin: `fetch().then(res=>res.json())` không check `res.ok`, chỉ check `data.role` — fragile. | `quan-tri-vien/layout.tsx:50-60` |

---

## 6. 🟢 LOW — Nợ kỹ thuật

| # | Bug |
|---|-----|
| L1 | `dang-ky`, `quen-mat-khau`, `/xac-thuc` đều `redirect("/vi")` → route `/vi` không tồn tại → 404. Dead routes. |
| L2 | `du-an/[id]` dùng `id` cho URL, `khoa-hoc/[slug]` dùng `slug` — không nhất quán định danh. |
| L3 | Media grid video hiển thị icon placeholder, không có thumbnail. |
| L4 | Auth dựa hoàn toàn vào `localStorage` token, không refresh/logout server. |

---

## 7. Fetch / env không thống nhất

Đã có `lib/api.ts` (ApiClient singleton) nhưng vẫn còn 5 chỗ bypass:

### A. Bypass `api` client (base :3001)

| # | File | Hiện tại | Nên dùng |
|---|------|----------|----------|
| F1 | `xac-thuc/dang-nhap/page.tsx:7,27` | khai `API_URL` + `fetch` | `api.submit("/api/auth/login", {email,password})` |
| F2 | `quan-tri-vien/layout.tsx:28,50` | khai `API_URL` + `fetch` (thiếu `res.ok` check) | `api.get("/api/auth/me")` |
| F3 | `sections/promotion-banner/index.tsx:35-36` | khai `BASE` + `fetch` | `api.publicGet("/api/promotions/homepage-banner")` |

### B. Media service (base :3002) — env khai 2 nơi

| # | File | Vấn đề |
|---|------|--------|
| F4 | `media-manager/index.logic.ts:3` | khai `MEDIA_BASE` + 8 lệnh `fetch` thủ công |
| F5 | `lib/media-url.ts:14` | khai riêng `MEDIA_BASE` (fallback `""` khác F4) |

**Root cause:** không có single source of truth cho base URL. `NEXT_PUBLIC_API_URL` hardcode fallback ở 3 nơi, `NEXT_PUBLIC_MEDIA_URL` ở 2 nơi.

**Đề xuất:**
1. Tạo `lib/env.ts` export `API_URL`/`MEDIA_URL` duy nhất, đọc env 1 lần.
2. `api.ts`, `media-url.ts`, `index.logic.ts` import từ đó.
3. Refactor F1-F3 sang `api` client (bonus: F2 được `res.ok` check tự động).

---

## 8. Ưu tiên hành động đề xuất

| Bước | Nội dung | Effort |
|------|----------|--------|
| 1 | Fix C6 (toggle khuyến mãi — 2 dòng) | 5 phút |
| 2 | Fix M1/M6 (toggle visibility so sánh `"0"` thay vì `"false"`) | 15 phút |
| 3 | Fix cụm media C1-C5 (thêm route `/bulk`, sửa `addYoutubeVideo`, sửa `getMediaUrl`, đổi variant `full`→`large`) | 1-2 giờ |
| 4 | Unify fetch/env (mục 7) | 1 giờ |
| 5 | Wire homepage engines (M2-M8) + bỏ hoặc implement cinematic thật + giải quyết mâu thuẫn content settings vs layout wizard | 1 ngày |
| 6 | Fix H1-H6 (draft filter, debounce, note lead, type any, auto-save, pagination sau delete) | nửa ngày |
| 7 | P4 (extract shared list component) + P1-P2 (Zod validation) | 1 ngày |
| 8 | L1-L4 (dead routes, cleanup) | tùy chọn |

---

## Đã làm được
- Trace toàn bộ admin pages, media manager, layout-wizard, templates, engines, và route API đối ứng.
- Xác định ~35 findings kèm evidence `file:line`.

## Chưa làm được
- Chưa fix code (REVIEW only).
- Chưa chạy runtime test (chỉ static audit).

## Vì sao chưa làm được
- Chưa được yêu cầu fix; đang ở phase REVIEW.

## Phase tiếp theo đề xuất
PLAN → DEV theo thứ tự ưu tiên mục 8.
