# Tài liệu Nghiệp vụ: Multi-Layout Design System

**Ngày:** 09/08/2026
**Dự án:** Minh Travel — Website Khóa học & Portfolio
**Đối tượng:** Developer, Admin, Product Owner

---

## 1. Khái niệm cốt lõi

### 1.1. Layout là gì?

```
Layout = Template + Engines
```

Một **Layout** là tập hợp đầy đủ cách một trang được tổ chức và hiển thị. Layout được tạo thành từ hai thành phần **tách rời**:

| Thành phần | Định nghĩa | Ai quản lý | Ví dụ |
|-----------|-----------|-----------|-------|
| **Template** | Danh sách các section + thứ tự cứng của chúng | Developer định nghĩa, Admin chọn | Hero → Work → Products → Counter → About |
| **Engine** | Cách hiển thị cards trong **từng** section | Developer code, Admin chọn từ catalog | Course cards: Grid / Carousel / List / Masonry |

### 1.2. Template là gì?

Template là **bộ khung** của một trang — quyết định **có những section nào** và **thứ tự của chúng**. Template do developer code cứng (hardcoded), admin chỉ được chọn từ catalog có sẵn.

Ví dụ template `compact` cho homepage:

```
Hero → Products → Counter → About
```

Template này **không có** section `Work` và `PromotionBanner`. Admin không thể tự thêm/xóa/sắp xếp section — chỉ có thể chọn template khác.

### 1.3. Engine là gì?

Engine là **cách render cards** bên trong một section. Mỗi content type (Khóa học, Dự án, Công cụ) có một catalog engine riêng.

Ví dụ cho section Courses:
- `grid` — Lưới 2-3 cột
- `list` — Danh sách dọc, ảnh trái text phải
- `carousel` — Băng chuyền trượt ngang
- `hero-grid` — 1 card hero to + grid nhỏ bên dưới
- `masonry` — Masonry chiều cao tự nhiên
- `cards-stagger` — Grid với hiệu ứng stagger animation
- `compact` — Thẻ nhỏ gọn 4-5 cột

Admin chọn engine cho từng content type qua dropdown trong Wizard.

### 1.4. Tại sao tách Template và Engine?

**Tách rời để tăng tổ hợp mà không cần code mới.**

| Kịch bản | Không tách (cũ) | Có tách (mới) |
|----------|----------------|---------------|
| Đổi Courses từ Grid → Carousel | Phải code template mới `default-carousel` | Admin đổi 1 dropdown, không code |
| Giữ nguyên template, đổi cách hiển thị Dự án | Không làm được | Đổi `portfolios_engine: stacked → masonry` |
| Thêm engine mới "Timeline" cho Dự án | Phải tạo template mới cho từng tổ hợp | Chỉ code 1 engine, mọi template có thể dùng |

**Ví dụ cụ thể:** Cùng 1 template `default`, admin có thể:
- Chọn `courses_engine: grid` + `portfolios_engine: stacked` — như hiện tại
- Chọn `courses_engine: carousel` + `portfolios_engine: masonry` — layout mới hoàn toàn

Không cần tạo template mới. Chỉ đổi dropdown.

---

## 2. Các đối tượng sử dụng

### 2.1. Developer

| Hành động | Mô tả |
|----------|-------|
| **Code template mới** | Tạo file `homepage-cinematic.tsx` trong `_templates/`, định nghĩa sections + thứ tự |
| **Code engine mới** | Tạo file `carousel.tsx` trong `components/engines/courses/` |
| **Đăng ký vào catalog** | Thêm entry vào `TEMPLATE_CATALOG` và `ENGINE_CATALOG` trong `lib/layout-registry.ts` |
| **Thêm vào field-defs** | Thêm key `{page}_template` và `{page}_{type}_engine` vào `site_settings` |

Developer không cần sửa page.tsx mỗi khi thêm template/engine mới — chỉ cần đăng ký vào catalog.

### 2.2. Admin (Minh Travel)

| Hành động | Mô tả |
|----------|-------|
| **Chọn template** | Từ catalog template có sẵn (không thể tự tạo) |
| **Chọn engine** | Từ dropdown per content type (chỉ những engine khả dụng cho content type đó) |
| **Preview** | Xem iframe bên phải cập nhật real-time theo lựa chọn |
| **Lưu** | Bấm "Lưu" → layout được persist vào `site_settings` |
| **Hoàn tác** | Đổi lại template/engine cũ → Lưu lại |

Admin **không** can thiệp được: thứ tự section, code HTML/CSS, thêm section mới.

### 2.3. Visitor (Người dùng cuối)

| Trải nghiệm | Mô tả |
|------------|-------|
| **SSR** | Trang được render server-side với template + engine admin đã chọn |
| **Không biết có layout system** | Thấy giao diện bình thường như mọi website |
| **Performance** | Không ảnh hưởng — template/engine đều được tree-shake, chỉ load code của layout đang dùng |

---

## 3. Quy trình nghiệp vụ

### 3.1. Admin vào cài đặt

1. Admin đăng nhập → vào `/quan-tri-vien/cai-dat`
2. Trang cài đặt hiện tại có các section: Trang chủ, Khóa học, Dự án, Công cụ, Liên hệ
3. **Mới:** Xuất hiện tab "Giao diện" bên cạnh tab "Nội dung"
4. Admin bấm tab "Giao diện" → panel trái chuyển sang Wizard, panel phải là preview iframe

### 3.2. Bước 1: Chọn Template

1. Admin thấy dropdown "Trang đang chỉnh sửa" → chọn trang muốn đổi (Trang chủ, Khóa học, Dự án, Công cụ)
2. Panel hiển thị **3 skeleton cards** dạng wireframe dọc tỉ lệ nhỏ (~scale 0.4):
   - **Default** — Wireframe có đầy đủ sections (Hero → Banner → Work → Products → Counter → About)
   - **Compact** — Wireframe ngắn hơn (Hero → Products → Counter → About)
   - **Cinematic** — Wireframe với hero toàn màn hình + carousel animation
3. Admin click chọn 1 card → card active (viền accent + checkmark)
4. Preview iframe bên phải **tự động reload** → hiển thị template mới

### 3.3. Bước 2: Chọn Engine

1. Dựa trên template đã chọn, panel hiển thị các engine dropdown cho từng content type **có trong template đó**
2. Mỗi dropdown có mini skeleton preview bên cạnh để admin hình dung

**Ví dụ template default Homepage có 2 content types (portfolios, products):**

| Content Type | Dropdown | Các lựa chọn | Ghi chú |
|-------------|----------|-------------|---------|
| Dự án | "Dự án hiển thị dạng:" | Xen kẽ, Masonry, Timeline, Grid 2 cột, Film cuộn, Full-width | Dùng cho section Work |
| Sản phẩm | "Sản phẩm hiển thị dạng:" | Lưới, Masonry, 1 cột | Dùng cho section Products (render cả khóa học + công cụ) |

> **Quan trọng:** Trên homepage, section "Sản phẩm" hiển thị cả khóa học VÀ công cụ trong cùng 1 layout, dùng chung 1 engine (`homepage_products_engine`). Không có engine riêng cho khóa học trên homepage — đây là quyết định thiết kế: section Products là 1 khối thống nhất, không tách rời.

3. Admin chọn engine cho từng content type → mỗi lần đổi, preview iframe bên phải tự reload và hiển thị section với engine mới

### 3.4. Bước 3: Xác nhận & Lưu

1. Admin xem preview iframe bên phải — đây là giao diện **thật**, không phải skeleton
2. Nếu ưng → bấm nút **"Lưu thay đổi"**
 3. Hệ thống gọi `PUT /api/settings/batch` với các key:
    - `homepage_template: "compact"`
    - `homepage_portfolios_engine: "masonry"`
    - `homepage_products_engine: "grid"`
4. Toast hiện "Đã lưu giao diện" → preview cookie bị xóa → iframe reload với data từ DB

### 3.5. Kết quả cho Visitor

1. Visitor truy cập `minhtravel.vn/`
2. Next.js SSR gọi `getSiteSettings()` → đọc từ DB
3. `settings.homepage_template = "compact"` → render `HomepageCompact`
4. `settings.homepage_courses_engine = "carousel"` → section Courses dùng `CoursesCarousel`
5. HTML được trả về với layout admin đã chọn

---

## 4. Template Catalog

### 4.1. Homepage (`/`)

| ID | Tên | Mô tả | Sections (theo thứ tự) |
|----|-----|-------|------------------------|
| `default` | Mặc định | Layout đầy đủ, như hiện tại | Hero → PromotionBanner → Work → Products → Counter → About |
| `compact` | Tối giản | Rút gọn, tập trung vào sản phẩm | Hero → Products → Counter → About |
| `cinematic` | Điện ảnh | Hero toàn màn hình, work dạng carousel | Hero (full-screen) → Work (carousel) → Products (overlay) → Counter → About |

**Khác biệt giữa các template:**

| Section | Default | Compact | Cinematic |
|---------|---------|---------|-----------|
| Hero | Có, kèm video nền | Có, kèm video nền | Có, full-screen + parallax |
| PromotionBanner | Có | **Không có** | **Không có** |
| Work (Dự án) | Có, 2 cards ngang | **Không có** | Có, carousel toàn màn hình |
| Products (SP) | Có, bento 2 cards | Có, bento 2 cards | Có, overlay trên nền tối |
| Counter | Có | Có | Có |
| About | Có | Có | Có |

### 4.2. Trang Khóa học (`/khoa-hoc`)

| ID | Tên | Mô tả | Sections |
|----|-----|-------|----------|
| `default` | Mặc định | Layout hiện tại | Hero → Courses → Brand → FAQ |
| `minimal` | Tối giản | Bỏ phần thương hiệu | Hero → Courses → FAQ |
| `full` | Đầy đủ | Thêm Trust + CTA | Hero → Trust → Courses → Brand → FAQ → CTA |

**Khác biệt:**

| Section | Default | Minimal | Full |
|---------|---------|---------|------|
| Hero | Có | Có | Có |
| Trust (dòng tin cậy) | Có (trong hero) | Có (trong hero) | Có (section riêng, nổi bật hơn) |
| Courses | Có | Có | Có |
| Brand (thương hiệu) | Có | **Không có** | Có |
| FAQ | Có | Có | Có |
| CTA (kêu gọi) | **Không có** | **Không có** | Có |

### 4.3. Trang Dự án (`/san-pham`)

| ID | Tên | Mô tả | Sections |
|----|-----|-------|----------|
| `default` | Mặc định | Layout hiện tại | PageHeader → Portfolios → CTA |
| `categorized` | Phân loại | Có filter theo category | PageHeader → CategoryFilter → Portfolios → CTA |
| `showcase` | Showcase | 1 dự án nổi bật ở đầu | PageHeader → Featured Project (hero) → Portfolios → CTA |

**Khác biệt:**

| Section | Default | Categorized | Showcase |
|---------|---------|-------------|----------|
| PageHeader | Có | Có | Có |
| CategoryFilter | **Không có** | Có (tab/capsule filter) | **Không có** |
| Featured Project | **Không có** | **Không có** | Có (1 project hero to) |
| Portfolios | Có | Có (đã filter) | Có |
| CTA | Có | Có | Có |

### 4.4. Trang Công cụ (`/cong-cu`)

| ID | Tên | Mô tả | Sections |
|----|-----|-------|----------|
| `default` | Mặc định | Layout hiện tại | Hero → Products |
| `featured` | Nổi bật | 1 sản phẩm nổi bật ở đầu | Hero → Featured Product (hero card) → Products (grid nhỏ) |

**Khác biệt:**

| Section | Default | Featured |
|---------|---------|----------|
| Hero | Có (title + subtitle) | Có (title + subtitle) |
| Featured Product | **Không có** | Có (1 product hero card) |
| Products | Có (grid) | Có (grid nhỏ hơn) |

---

## 5. Engine Catalog

### 5.1. Course Card Engines (7 loại)

| ID | Tên hiển thị | Mô tả | Nên dùng khi |
|----|-------------|-------|-------------|
| `grid` | Lưới | Grid 2-3 cột, card: ảnh → tên → mô tả → giá → CTA | Mặc định, hiển thị nhiều khóa học |
| `list` | Danh sách | Row full-width, ảnh trái, thông tin phải | Muốn nhấn mạnh mô tả chi tiết từng khóa học |
| `carousel` | Băng chuyền | Cards trượt ngang, scroll-snap | Có nhiều khóa học, muốn tiết kiệm không gian dọc |
| `hero-grid` | Hero + lưới | 1 khóa học hero to (featured) + grid nhỏ bên dưới | Có 1 khóa học chủ lực muốn nổi bật |
| `cards-stagger` | Cards động | Grid với stagger animation khi scroll | Muốn hiệu ứng thị giác ấn tượng |
| `masonry` | Masonry | Cards chiều cao tự nhiên, xếp kiểu masonry | Ảnh thumbnail có tỉ lệ khác nhau |
| `compact` | Nhỏ gọn | Cards nhỏ, 4-5 cột, chỉ ảnh + tên + giá | Danh sách dài, muốn hiển thị nhiều trong 1 màn hình |

### 5.2. Portfolio Card Engines (6 loại)

| ID | Tên hiển thị | Mô tả | Nên dùng khi |
|----|-------------|-------|-------------|
| `stacked` | Xen kẽ | Ảnh trái text phải, project sau đảo ngược | Mặc định, layout hiện tại |
| `masonry` | Masonry | Grid không đều, ảnh giữ tỉ lệ gốc | Nhiều ảnh dọc/ngang xen kẽ |
| `timeline` | Timeline dọc | Timeline với dot connector, mỗi project = 1 điểm | Kể chuyện theo thời gian, dự án có trình tự |
| `grid-2col` | Grid 2 cột | Card vuông, hover phát video | Portfolio nhiều video, muốn grid đều |
| `filmstrip` | Film cuộn | Cards cuộn ngang kiểu film strip | Muốn giao diện cinematic, giống reel Instagram |
| `fullwidth` | Full-width | Mỗi project chiếm 100% width, ảnh to + overlay text | Ít project, muốn mỗi cái thật ấn tượng |

### 5.3. Product Card Engines (3 loại)

| ID | Tên hiển thị | Mô tả | Nên dùng khi |
|----|-------------|-------|-------------|
| `grid` | Lưới | Grid 2-3 cột, card: ảnh → tên → mô tả → giá → CTA | Mặc định, hiện tại đang dùng |
| `masonry` | Masonry | Card cao thấp khác nhau theo nội dung | Ảnh sản phẩm có tỉ lệ không đồng đều |
| `single-col` | 1 cột | Row full-width, ảnh to + chi tiết | Ít sản phẩm, muốn mô tả chi tiết từng cái |

---

## 6. Edge Cases & Constraints

### 6.1. Template không có section chứa content type đó

**Quy tắc:** Engine dropdown chỉ hiển thị cho những content type **có trong template đã chọn**.

| Trường hợp | Hành vi |
|-----------|---------|
| Template `compact` (Homepage) không có Work section | Dropdown "Dự án hiển thị dạng" bị **ẩn hoặc disable** |
| Template `minimal` (Khóa học) không có Brand section | Không có engine nào liên quan đến Brand |
| Engine key tương ứng trong DB | **Vẫn được lưu** nhưng không dùng đến khi render |

### 6.2. Content type không có data

| Trường hợp | Hành vi |
|-----------|---------|
| Chưa có sản phẩm LUT/Preset nào | Section Products **vẫn render** nhưng hiển thị empty state ("Chưa có sản phẩm nào") |
| Chưa có dự án portfolio nào | Section Work hiển thị empty state hoặc skeleton placeholder |
| Chưa có khóa học nào | Section Courses hiển thị empty state |

**Quy tắc:** Template quyết định **có section hay không**. Data quyết định **section hiển thị gì**. Không có data → empty state, không ẩn section.

### 6.3. Admin đổi template → engine selection

**Quy tắc:** Khi admin đổi template, engine settings được **giữ nguyên** trong formData (không reset). Các content types không có trong template mới bị ẩn dropdown, nhưng giá trị engine vẫn tồn tại trong state. Khi admin quay về template cũ, engine settings trước đó vẫn còn.

| Hành động | Kết quả |
|----------|---------|
| Đang chọn template `default` + `portfolios_engine: masonry` | — |
| Đổi sang template `compact` | Compact không có section portfolios → dropdown portfolios bị ẩn. Nhưng `homepage_portfolios_engine: "masonry"` vẫn giữ trong formData |
| Đổi lại template `default` | Portfolios dropdown hiện lại với giá trị "masonry" đã chọn trước đó |
| Lý do | Giữ engine settings giúp admin thử nghiệm template khác nhau mà không lo mất cấu hình. Chỉ save key có thay đổi so với DB. |

### 6.4. Nhiều admin cùng sửa

**Cơ chế:** Hệ thống dùng **cookie per browser** cho preview, không có cơ chế lock.

| Tình huống | Kết quả |
|-----------|---------|
| Admin A (máy A) đổi template → preview | Chỉ ảnh hưởng cookie trên máy A |
| Admin B (máy B) cũng vào cài đặt | Thấy layout từ DB, không thấy thay đổi của Admin A |
| Admin A lưu trước → Admin B lưu sau | Admin B ghi đè (last write wins) |
| Cả 2 cùng mở 1 máy, 2 tab | Cookie dùng chung → preview sync giữa 2 tab |

**Không cần** cơ chế lock phức tạp vì: chỉ 1 admin thực tế (Minh Travel), conflict probability ≈ 0.

### 6.5. Tính tương thích ngược

| Trường hợp | Hành vi |
|-----------|---------|
| `homepage_template` chưa được set (lần đầu) | Default về `default` |
| `homepage_courses_engine` chưa set | Default về `grid` |
| Engine ID không tồn tại trong catalog (đã bị xóa) | Fallback về engine `default` cho content type đó |
| Template ID không tồn tại | Fallback về template `default` cho trang đó |

### 6.6. Mobile responsive

- Template và Engine **không phân biệt mobile/desktop** — mỗi engine tự responsive
- Admin không chọn layout riêng cho mobile
- Mọi engine phải hỗ trợ mobile (grid → 1 cột, carousel → swipe, v.v.)

---

## 7. Phân biệt với cơ chế hiện tại

### 7.1. Cơ chế hiện tại

```
site_settings table:
  hero_video_type    = "youtube"
  home_work_heading  = "Dự án nổi bật"
  home_about_text_1  = "Xin chào..."
  ...

→ Admin chỉ đổi được CONTENT (text, ảnh, link)
→ Layout (thứ tự section, cách hiển thị cards) DO CODE QUYẾT ĐỊNH
→ Muốn đổi layout: phải gọi developer sửa code → deploy
```

### 7.2. Cơ chế mới (Multi-Layout)

```
site_settings table (mở rộng):
  # Content (giữ nguyên)
  hero_video_type    = "youtube"
  home_work_heading  = "Dự án nổi bật"
  home_about_text_1  = "Xin chào..."

  # Layout (MỚI)
  homepage_template          = "compact"
  homepage_courses_engine    = "carousel"
  homepage_portfolios_engine = "masonry"
  homepage_products_engine   = "grid"

→ Admin đổi được cả CONTENT lẫn LAYOUT
→ Content (text, ảnh, video) không bị ảnh hưởng khi đổi layout
→ Layout do developer định nghĩa catalog, admin chọn từ catalog
```

### 7.3. So sánh chi tiết

| Khía cạnh | Hiện tại | Mới |
|----------|----------|-----|
| Admin đổi được gì? | Text, ảnh, link, toggle on/off | Thêm: template, engine cho từng content type |
| Ai tạo layout mới? | Developer (code + deploy) | Developer code 1 lần → admin tự chọn |
| Thời gian đổi layout | Vài giờ → vài ngày (code → review → deploy) | Vài giây (chọn dropdown → preview → save) |
| Số layout khả dụng | 1 per page | 3 templates × N engines = hàng chục tổ hợp |
| A/B test | Không thể | Có thể (đổi layout, xem analytics, đổi lại nếu không tốt) |
| Content (text, ảnh) | Quản lý trong site_settings | **Giữ nguyên**, quản lý riêng |
| Preview | Cookie `preview_settings` | **Dùng chung cơ chế cookie** — thêm template/engine keys |
| SSR | Đọc site_settings từ DB | **Không đổi** — đọc thêm template/engine keys |

### 7.4. Data model mở rộng

Các key mới trong `site_settings`:

| Key | Ý nghĩa | Giá trị mặc định |
|-----|---------|-----------------|
| `homepage_template` | Template trang chủ | `default` |
| `homepage_portfolios_engine` | Engine hiển thị dự án trên homepage | `stacked` |
| `homepage_products_engine` | Engine hiển thị sản phẩm (khóa học + công cụ) trên homepage | `grid` |
| `courses_template` | Template trang khóa học | `default` |
| `courses_list_engine` | Engine hiển thị danh sách khóa học | `grid` |
| `portfolio_template` | Template trang dự án | `default` |
| `portfolio_list_engine` | Engine hiển thị danh sách dự án | `stacked` |
| `presets_template` | Template trang công cụ | `default` |
| `presets_list_engine` | Engine hiển thị danh sách công cụ | `grid` |

**Tổng:** 9 key mới (giảm từ 10 — bỏ `homepage_courses_engine` do homepage merge courses + products vào cùng section Products).

---

## Tổng kết

Hệ thống Multi-Layout Design System cho phép:

1. **Admin tự chọn giao diện** từ catalog template + engine có sẵn — không cần developer mỗi lần đổi layout
2. **Content và Layout tách biệt** — đổi layout không ảnh hưởng text/ảnh/video đã cấu hình
3. **Template và Engine tách biệt** — tổ hợp linh hoạt, mỗi content type có engine riêng
4. **Preview real-time** — dùng cookie + iframe, admin thấy kết quả ngay trước khi lưu
5. **SSR an toàn** — layout được resolve ở server, visitor luôn thấy layout đúng
6. **Mở rộng dễ dàng** — developer thêm template/engine mới vào catalog, admin dùng ngay
