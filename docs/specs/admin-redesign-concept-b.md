# BDD Spec: Admin Redesign — Quản trị Khóa học & Dự án

**Feature**: Quản trị viên có thể quản lý khóa học, dự án, sản phẩm số với giao diện tối (dark theme) đồng bộ brand, editor trực quan (curriculum tree, pricing tiers, block editor), live preview real-time.

**Context**: Website cá nhân Minh Travel (minhtravel.vn) — rewrite từ WordPress sang Next.js 16. Admin hiện tại form-based, light theme, Portfolio + Products = placeholder.

**Date**: 2026-08-02
**Source**: `.docs/implementation-plan-concept-b.md`

---

## User Story 1: Dark Theme Admin Foundation

### US1.1: Admin sidebar hiển thị đúng brand accent và menu

```
Scenario: Admin đăng nhập và thấy sidebar tối với brand accent
  Given người dùng đã đăng nhập với role ADMIN
  When họ truy cập /quan-tri-vien
  Then trang có nền tối (#080808) và chữ sáng (#E0E0E0)
  And sidebar hiển thị 11 menu items bao gồm "Dự án thực hiện" và "Sản phẩm số"
  And menu item đang active có nền #FF005A (brand primary)
  And logo sidebar hiển thị monogram "MT" + text "Minh Travel"

Scenario: Admin click sidebar item — đánh dấu active đúng
  Given admin đang ở /quan-tri-vien/khoa-hoc
  Then menu "Quản lý khóa học" có class active với nền #FF005A
  And các menu khác có nền trong suốt

Scenario: Admin trên mobile — sidebar ẩn, hiện khi bấm hamburger
  Given viewport width < 1024px
  When admin bấm nút hamburger
  Then sidebar slide vào từ trái
  And overlay mờ che phần còn lại
  When admin bấm vào overlay
  Then sidebar slide ra ngoài
```

### US1.2: Form controls dùng CSS custom properties

```
Scenario: Input field hiển thị trên dark background
  Given admin đang ở trang tạo khóa học mới
  Then tất cả input có nền var(--admin-surface) và border var(--admin-border)
  And placeholder text có màu var(--admin-text-secondary)
  And input focus có border var(--admin-accent) (#FF005A)

Scenario: Button chính hiển thị accent color
  Given admin đang ở bất kỳ trang admin nào
  Then nút primary (Lưu, Tạo mới, Xuất bản) có nền #FF005A
  And hover đổi sang #CA004D
  And disabled có opacity 0.4

Scenario: Badge trạng thái hiển thị đúng màu
  Given danh sách khóa học có khóa học published và draft
  Then badge Published có nền xanh lá và chữ xanh lá đậm
  And badge Draft có nền surface và chữ secondary
  And badge Lỗi có nền đỏ nhạt và chữ đỏ

Scenario: Table row hover hiển thị highlight
  Given danh sách có nhiều dòng
  When user hover chuột vào một dòng
  Then dòng đó có background sáng hơn (var(--admin-surface-raised))
```

### US1.3: Skeleton loading thay thế text "Đang tải..."

```
Scenario: Danh sách đang load hiển thị skeleton
  Given admin truy cập /quan-tri-vien/khoa-hoc
  When API đang fetch dữ liệu
  Then hiển thị 6 skeleton cards với hiệu ứng shimmer
  And không hiển thị text "Đang tải..."

Scenario: Skeleton biến mất khi data load xong
  Given skeleton đang hiển thị
  When API trả về dữ liệu thành công
  Then skeleton biến mất
  And danh sách khóa học hiển thị bình thường
```

---

## User Story 2: Portfolio (Dự án) CRUD

### US2.1: Xem danh sách dự án dạng card grid

```
Scenario: Admin xem danh sách dự án
  Given có ít nhất 3 dự án trong database
  When admin truy cập /quan-tri-vien/du-an
  Then hiển thị grid 3 cột các card dự án
  And mỗi card có: thumbnail, category tag, tiêu đề, mô tả ngắn, nút sửa/xóa
  And dự án có youtubeVideoId hiển thị nút ▶ play overlay trên thumbnail

Scenario: Admin xem danh sách rỗng
  Given không có dự án nào trong database
  When admin truy cập /quan-tri-vien/du-an
  Then hiển thị empty state: icon + "Chưa có dự án nào" + nút "Tạo dự án đầu tiên"

Scenario: Admin chuyển sang table view
  When admin bấm nút chuyển sang table view
  Then hiển thị bảng với cột: thumbnail, tiêu đề, category, ngày tạo, thao tác

Scenario: Admin filter theo category
  When admin chọn category "Travel" từ dropdown filter
  Then chỉ hiển thị dự án có category "Travel"

Scenario: Admin tìm kiếm theo tên
  When admin gõ "Tibet" vào ô search
  Then chỉ hiển thị dự án có tiêu đề chứa "Tibet"
  When admin xóa text search
  Then hiển thị lại tất cả dự án
```

### US2.2: Tạo dự án mới

```
Scenario: Admin tạo dự án thành công với đầy đủ field
  Given admin đang ở /quan-tri-vien/du-an/tao-moi
  When admin điền tiêu đề "Life of Tibet", mô tả "32 ngày...", chọn category "Travel"
  And upload ảnh thumbnail
  And paste YouTube URL "https://youtu.be/abc123"
  And bấm "Tạo dự án"
  Then API POST /api/portfolios được gọi với dữ liệu đầy đủ
  And youtubeVideoId được extract thành "abc123"
  And thumbnail YouTube hiển thị preview img.youtube.com
  And redirect về /quan-tri-vien/du-an

Scenario: YouTube ID auto-extract từ nhiều định dạng URL
  Given admin paste "https://www.youtube.com/watch?v=abc123"
  Then youtubeVideoId là "abc123"
  Given admin paste "https://youtube.com/shorts/xyz789"
  Then youtubeVideoId là "xyz789"
  Given admin paste ID thuần "abc123"
  Then youtubeVideoId là "abc123"

Scenario: Tạo dự án thất bại — thiếu tiêu đề
  Given admin không điền tiêu đề
  When admin bấm "Tạo dự án"
  Then hiển thị thông báo lỗi "Tiêu đề không được để trống"
  And không redirect

Scenario: Tạo dự án thất bại — lỗi server
  Given API trả về lỗi 500
  When admin bấm "Tạo dự án"
  Then hiển thị thông báo lỗi từ server
  And form vẫn giữ nguyên dữ liệu đã điền
```

### US2.3: Sửa dự án

```
Scenario: Admin sửa dự án và lưu
  Given admin đang ở /quan-tri-vien/du-an/{id}
  And form đã load dữ liệu hiện tại
  When admin đổi tiêu đề và bấm "Lưu"
  Then API PUT /api/portfolios/{id} được gọi
  And hiển thị thông báo thành công
  And redirect về /quan-tri-vien/du-an

Scenario: Toggle featured trên card
  Given admin đang ở danh sách dự án
  When admin bấm nút star trên một card
  Then isFeaturedOnHome được toggle
  And API PUT được gọi để cập nhật
  And star icon đổi từ rỗng → đặc hoặc ngược lại
```

### US2.4: Xóa dự án

```
Scenario: Admin xóa dự án với xác nhận
  Given admin đang ở danh sách dự án
  When admin bấm "Xóa" trên một dự án
  Then hiển thị dialog xác nhận "Xóa dự án '{tên}'?"
  When admin bấm "Xác nhận"
  Then API DELETE /api/portfolios/{id} được gọi
  And dự án biến mất khỏi danh sách

Scenario: Admin hủy xóa dự án
  Given dialog xác nhận đang hiển thị
  When admin bấm "Hủy"
  Then dialog đóng
  And dự án vẫn còn trong danh sách
```

---

## User Story 3: Digital Products (Sản phẩm số) CRUD

### US3.1: Xem danh sách sản phẩm số

```
Scenario: Admin xem danh sách sản phẩm
  Given có ít nhất 2 sản phẩm trong database
  When admin truy cập /quan-tri-vien/san-pham
  Then hiển thị card grid các sản phẩm
  And mỗi card có: thumbnail, tag pill ("LUT", "Preset"), tiêu đề, giá VND, trạng thái published, ngoại link
  And sản phẩm có externalCheckoutUrl hiển thị icon external link

Scenario: Filter theo trạng thái publish
  When admin chọn "Đã xuất bản" từ filter
  Then chỉ hiển thị sản phẩm isPublished = 1
```

### US3.2: Tạo và sửa sản phẩm số

```
Scenario: Admin tạo sản phẩm mới
  Given admin đang ở /quan-tri-vien/san-pham/tao-moi
  When admin điền tất cả field và bấm "Tạo"
  Then API POST /api/products được gọi
  And redirect về danh sách

Scenario: Admin sửa sản phẩm
  Given admin đang ở /quan-tri-vien/san-pham/{id}
  When admin đổi giá và bấm "Lưu"
  Then API PUT /api/products/{id} được gọi

Scenario: Xóa sản phẩm với xác nhận
  When admin bấm "Xóa"
  Then dialog xác nhận hiển thị
  When admin xác nhận
  Then API DELETE được gọi và sản phẩm biến mất
```

---

## User Story 4: Course Editor — Structured Builder

### US4.1: Vertical nav thay thế horizontal tabs

```
Scenario: Admin mở trang edit khóa học
  Given admin truy cập /quan-tri-vien/khoa-hoc/{slug}
  Then left panel hiển thị vertical nav với 6 mục: Thông tin, Giáo trình, Ưu đãi, Giảng viên, Giá bán, Landing Page
  And mỗi mục có icon lucide tương ứng
  And section "Thông tin" đang active và hiển thị
  And các section khác ẩn (display: none)

Scenario: Admin click chuyển section
  When admin click "Giáo trình" trên vertical nav
  Then section "Thông tin" ẩn đi
  And section "Giáo trình" hiển thị
  And vertical nav đánh dấu "Giáo trình" là active

Scenario: Admin scroll — vertical nav cố định
  Given section "Giáo trình" có nội dung dài, cần scroll
  When admin scroll xuống trong left panel
  Then vertical nav vẫn cố định ở vị trí (sticky)
  And admin có thể thấy tất cả content của section đang active

Scenario: Admin dùng keyboard để chuyển section
  Given admin đang focus vào vertical nav
  When admin nhấn ArrowDown
  Then section tiếp theo được active
  When admin nhấn Enter
  Then section đó hiển thị
```

### US4.2: Save status indicator

```
Scenario: Chỉ báo trạng thái lưu hiển thị "Đã lưu"
  Given admin vừa mở trang edit và chưa thay đổi gì
  Then header hiển thị dot xanh + text "Đã lưu"

Scenario: Chỉ báo đổi sang "Chưa lưu" khi có thay đổi
  When admin thay đổi tiêu đề khóa học
  Then dot đổi sang vàng + text "Chưa lưu"

Scenario: Chỉ báo hiển thị "Đang lưu..." khi auto-save
  Given admin đã thay đổi và 1.5s debounce đang chạy
  When auto-save bắt đầu
  Then dot chuyển sang vàng nhấp nháy (pulse) + text "Đang lưu..."

Scenario: Chỉ báo trở lại "Đã lưu" sau khi auto-save thành công
  When API PUT trả về 200
  Then dot chuyển sang xanh + text "Đã lưu"

Scenario: Chỉ báo vẫn "Chưa lưu" khi auto-save thất bại
  When API PUT trả về lỗi
  Then dot vẫn vàng + text "Chưa lưu"
  And error hiển thị trong error bar
```

### US4.3: Curriculum Tree Builder

```
Scenario: Admin xem curriculum dạng tree
  Given khóa học có 3 chương, mỗi chương có 2-3 bài học
  When admin chọn section "Giáo trình"
  Then hiển thị tree view với các module cha và lessons con
  And mỗi module có: grip handle (≡), expand/collapse chevron (▸/▾), tên, số bài học, context menu (⋮)
  And module đang expand hiển thị danh sách lessons bên dưới
  And mỗi lesson có: grip handle, số thứ tự, tiêu đề, badges (Xem trước, Nháp), duration, nút sửa/xóa

Scenario: Admin expand/collapse module
  Given module đang collapsed (▸)
  When admin click chevron
  Then module expand (▾) và hiển thị danh sách lessons
  When admin click chevron lần nữa
  Then module collapse và ẩn danh sách lessons

Scenario: Admin drag module để sắp xếp lại
  Given admin kéo grip handle của module thứ 3
  When admin thả vào vị trí giữa module 1 và 2
  Then module 3 di chuyển lên vị trí thứ 2
  And API PUT /api/courses/{courseId}/modules/reorder được gọi
  And UI cập nhật thứ tự ngay lập tức (optimistic)

Scenario: Admin drag lesson để sắp xếp trong module
  Given module 1 có 3 lessons
  When admin kéo lesson thứ 3 lên vị trí 1
  Then lesson được sắp xếp lại trong module
  And API PUT module lessons reorder được gọi

Scenario: Admin drag lesson sang module khác (cross-module)
  Given module 1 có lesson "Bài A", module 2 có 2 lessons
  When admin kéo "Bài A" từ module 1 sang module 2
  Then "Bài A" xuất hiện trong module 2
  And API cập nhật moduleId của lesson

Scenario: Admin đổi tên module — double click
  Given admin double click vào tên module
  Then tên module biến thành input inline
  When admin gõ tên mới và nhấn Enter
  Then tên module cập nhật
  And API PUT module title được gọi

Scenario: Admin đổi tên module — hủy với Escape
  Given input inline đang hiển thị
  When admin nhấn Escape
  Then input biến mất, tên trở lại như cũ
  And không gọi API

Scenario: Admin mở context menu module
  When admin click ⋮ trên module
  Then hiển thị menu: Sửa tên, Nhân bản, Di chuyển lên, Di chuyển xuống, Xóa

Scenario: Admin nhân bản module
  Given context menu đang mở
  When admin chọn "Nhân bản"
  Then module mới được tạo với tên "{tên cũ} (copy)" kèm tất cả lessons
  And API POST module mới được gọi với dữ liệu clone
  And tree UI cập nhật

Scenario: Admin xóa module — có xác nhận
  When admin chọn "Xóa" từ context menu
  Then hiển thị confirm "Xóa chương và tất cả bài học?"
  When admin xác nhận
  Then module và lessons biến mất khỏi tree
  And API DELETE module được gọi

Scenario: Admin thêm module mới
  When admin click "+ Thêm chương" ở cuối tree
  Then hiển thị input inline để nhập tên
  When admin nhập tên và nhấn Enter
  Then module mới xuất hiện trong tree ở vị trí cuối
  And API POST module được gọi

Scenario: Admin thêm module — hủy với Escape
  Given input "thêm chương" đang hiển thị
  When admin nhấn Escape
  Then input biến mất, không có module nào được thêm

Scenario: Admin thêm lesson vào module
  When admin click "+ Thêm bài" trong một module
  Then hiển thị form inline: title, videoUrl, duration (mm:ss), published toggle, free preview toggle
  When admin điền và nhấn Enter
  Then lesson mới xuất hiện trong tree
  And API POST lesson được gọi

Scenario: Admin sửa lesson — click vào lesson mở side panel
  When admin click vào một lesson
  Then slide-out panel hiển thị bên phải với đầy đủ field của lesson
  And admin có thể sửa tất cả field
  When admin bấm "Lưu"
  Then panel đóng và lesson cập nhật

Scenario: Admin thêm module rỗng
  Given admin để trống tên module và nhấn Enter
  Then không có module nào được thêm
  And không gọi API

Scenario: Auto-save curriculum sau khi thay đổi
  Given admin vừa thêm một lesson
  Then save status đổi sang "Chưa lưu"
  And sau 1.5s, auto-save chạy
  And lesson được lưu vào DB
  And save status đổi sang "Đã lưu"
```

### US4.4: Pricing Tier Editor

```
Scenario: Admin xem danh sách pricing tiers
  Given khóa học có 2 pricing tiers
  When admin chọn section "Giá bán"
  Then hiển thị 2 tier cards ngang hàng
  And tier 1 hiển thị: tên "1 năm", giá "996.000đ", giá gốc "3.868.000đ" (gạch ngang), duration "12 tháng", link checkout
  And tier 2 hiển thị: tên "Vĩnh viễn", giá "1.996.000đ", duration "Vĩnh viễn"

Scenario: Admin thêm pricing tier mới
  When admin bấm "+ Thêm tier"
  Then hiển thị form tier mới với field trống
  When admin điền tên "Combo", giá "10.000.000", duration để trống (vĩnh viễn) và bấm "Lưu"
  Then tier mới xuất hiện cạnh các tier hiện có
  And auto-save lưu pricing tiers vào DB

Scenario: Admin sửa pricing tier
  When admin thay đổi giá của một tier
  Then save status chuyển sang "Chưa lưu"
  And sau debounce, auto-save lưu thay đổi

Scenario: Admin xóa pricing tier
  When admin bấm nút xóa (✕) trên một tier
  Then tier biến mất khỏi danh sách
  And auto-save cập nhật

Scenario: Admin không thể có quá 3 tiers
  Given đã có 3 tiers
  Then nút "+ Thêm tier" bị disabled

Scenario: Admin không thể xóa tier cuối cùng
  Given chỉ còn 1 tier
  Then nút xóa trên tier đó bị disabled
```

### US4.5: Live Preview đồng bộ

```
Scenario: Preview iframe tự reload sau auto-save
  Given admin vừa thay đổi tiêu đề khóa học
  And auto-save đã hoàn thành
  Then iframe preview tự động reload
  And tiêu đề mới hiển thị trong preview

Scenario: Preview scroll sync khi chuyển section
  When admin chọn section "Giáo trình" trên vertical nav
  Then iframe preview scroll đến anchor #curriculum
  When admin chọn section "Ưu đãi"
  Then iframe preview scroll đến anchor #bonuses

Scenario: Preview hiển thị trên mobile
  Given viewport < 768px
  Then preview iframe ẩn mặc định
  When admin bấm "Xem trước"
  Then preview hiển thị full-width overlay
```

---

## User Story 5: Course Block Editor + Countdown + Stories

### US5.1: Block editor cho khóa học

```
Scenario: Admin mở Landing Page section
  Given admin đang ở trang edit khóa học
  When admin chọn section "Landing Page" trên vertical nav
  Then hiển thị BlockEditor với các blocks hiện có (nếu đã lưu trước đó)
  And có đầy đủ: undo/redo, drag-drop reorder, left panel (block types), right panel (block config)

Scenario: Admin thêm block vào course landing page
  When admin kéo Heading block từ left panel vào canvas
  Then block mới xuất hiện trong danh sách
  And save status chuyển sang "Chưa lưu"
  And sau debounce, contentBlocks được lưu vào DB

Scenario: Admin sửa block
  When admin click vào một block
  Then right panel hiển thị cấu hình của block đó
  When admin thay đổi text và style
  Then block cập nhật real-time trên canvas
  And auto-save lưu

Scenario: Block content hiển thị trên public course page
  Given khóa học có contentBlocks đã lưu
  When user truy cập /khoa-hoc/{slug}
  Then các blocks được render bằng BlockRenderer ở cuối trang
  And hiển thị đúng style và nội dung

Scenario: Admin sử dụng tất cả 20+ block types
  When admin thêm từng loại block (heading, paragraph, image, video, gallery, accordion, cta, pricing...)
  Then mỗi block hiển thị đúng trên canvas
  And không có lỗi render
```

### US5.2: Countdown timer

```
Scenario: Admin cấu hình countdown timer
  Given admin đang ở section "Thông tin" (hoặc section riêng cho countdown)
  When admin bật toggle "Hiển thị countdown"
  Then hiển thị input ngày kết thúc và text ưu đãi
  When admin chọn ngày "2026-12-31" và text "ƯU ĐÃI GIẢM GIÁ 90%"
  And auto-save lưu
  Then public course page hiển thị countdown timer với text ưu đãi

Scenario: Countdown timer hiển thị đúng trên public page
  Given saleEndDate = "2026-12-31T23:59:59"
  And saleTitle = "ƯU ĐÃI GIẢM GIÁ 90%"
  When user truy cập /khoa-hoc/{slug}
  Then hero section hiển thị badge "ƯU ĐÃI GIẢM GIÁ 90%"
  And countdown hiển thị days/hours/minutes/seconds còn lại

Scenario: Countdown timer không hiển thị khi tắt
  Given admin tắt toggle "Hiển thị countdown"
  Then public course page không hiển thị countdown

Scenario: Countdown timer đã hết hạn
  Given saleEndDate đã qua
  When user truy cập
  Then countdown hiển thị "Đã kết thúc"
  And nút CTA vẫn hoạt động bình thường
```

### US5.3: Student success stories

```
Scenario: Admin thêm student story
  Given admin đang ở section "Học viên" (mới)
  When admin bấm "+ Thêm câu chuyện"
  And điền: tên "Thợ Rừng", role "YouTuber", content "...", highlight "2M followers", thumbnail, stats (FB 0M, YT 0K)
  And bấm "Lưu"
  Then story mới xuất hiện trong danh sách
  And auto-save lưu qua API

Scenario: Admin sắp xếp stories
  When admin kéo story thứ 2 lên vị trí 1
  Then danh sách cập nhật thứ tự
  And API cập nhật sortOrder

Scenario: Story hiển thị trên public course page
  Given khóa học có 2 success stories
  When user truy cập /khoa-hoc/{slug}
  Then section "Học viên nổi bật" hiển thị
  And mỗi story có: ảnh, tên, role, highlight metric, stats icons, nội dung

Scenario: Admin xóa story
  When admin bấm xóa trên một story
  And xác nhận
  Then story biến mất
```

---

## User Story 6: Cross-cutting Concerns

### US6.1: Empty states

```
Scenario: Trang danh sách rỗng — có CTA
  Given không có dữ liệu
  When admin truy cập bất kỳ trang danh sách nào
  Then hiển thị:
    - Icon minh họa
    - Tiêu đề "Chưa có {entity} nào"
    - Mô tả ngắn
    - Nút CTA "Tạo {entity} đầu tiên"
  And nút CTA dẫn đến trang tạo mới
```

### US6.2: Keyboard shortcuts

```
Scenario: ⌘S lưu form hiện tại
  Given admin đang ở bất kỳ trang edit nào
  When admin nhấn ⌘S (Mac) hoặc Ctrl+S (Windows)
  Then preventDefault của browser
  And trigger save/auto-save

Scenario: Escape đóng modal/panel
  Given một modal hoặc slide-out panel đang mở
  When admin nhấn Escape
  Then modal/panel đóng
  And không thay đổi dữ liệu chưa lưu

Scenario: Escape hủy inline edit
  Given admin đang đổi tên module inline
  When admin nhấn Escape
  Then tên trở về như cũ
  And không gọi API
```

### US6.3: Unsaved changes warning

```
Scenario: Cảnh báo khi rời trang có thay đổi chưa lưu
  Given admin đã thay đổi dữ liệu và save status = "unsaved"
  When admin cố đóng tab hoặc navigate đi
  Then browser hiển thị cảnh báo "Bạn có thay đổi chưa được lưu"

Scenario: Không cảnh báo khi đã lưu hết
  Given save status = "saved"
  When admin đóng tab
  Then không có cảnh báo
```

### US6.4: Responsive mobile

```
Scenario: Admin pages trên tablet (768px)
  Given viewport = 768px
  Then sidebar ẩn, hamburger hiển thị
  And form fields xếp dọc thay vì ngang
  And card grid chuyển từ 3 cột → 2 cột

Scenario: Admin pages trên mobile (375px)
  Given viewport = 375px
  Then card grid chuyển thành 1 cột
  And table view ẩn, chỉ có card view
  And preview iframe ẩn, hiển thị overlay khi bấm "Xem trước"
```

### US6.5: Accessibility

```
Scenario: Tất cả form input có label
  Given admin đang ở bất kỳ form nào
  Then mỗi input có label text hoặc aria-label

Scenario: Focus visible trên tất cả interactive elements
  When admin tab qua các element
  Then mỗi element có visible focus ring (2px solid #FF005A)

Scenario: Color contrast đạt WCAG AA
  Given text trên background
  Then contrast ratio ≥ 4.5:1 cho body text
  And contrast ratio ≥ 3:1 cho large text (18px+)

Scenario: Screen reader đọc được trạng thái save
  Given save status = "saving"
  Then aria-live region thông báo "Đang lưu..."
  When save status = "saved"
  Then aria-live region thông báo "Đã lưu"
```

---

## User Story 7: API & Backend

### US7.1: Student stories API

```
Scenario: GET /api/courses/{courseId}/stories
  Given course có 3 stories
  When GET request
  Then trả về 200 với array 3 stories, sắp xếp theo sortOrder

Scenario: POST /api/courses/{courseId}/stories (ADMIN)
  Given admin authenticated
  When POST với body đầy đủ
  Then trả về 201 với story đã tạo

Scenario: POST thiếu field bắt buộc (studentName)
  When POST thiếu studentName
  Then trả về 400 với thông báo lỗi validation

Scenario: PUT /api/courses/{courseId}/stories/{id} (ADMIN)
  When PUT với data mới
  Then trả về 200 với story đã cập nhật

Scenario: DELETE /api/courses/{courseId}/stories/{id} (ADMIN)
  When DELETE
  Then trả về 200 success
  And story bị xóa khỏi DB

Scenario: Không có quyền (non-ADMIN)
  When user thường gọi POST/PUT/DELETE
  Then trả về 401 Unauthorized
```

### US7.2: Course schema mở rộng

```
Scenario: Course có field sale_end_date và sale_title
  Given course đã được tạo
  When GET /api/courses/{slug}
  Then response chứa saleEndDate và saleTitle

Scenario: Update course với sale fields
  When PUT /api/courses/{id} với saleEndDate và saleTitle
  Then course cập nhật thành công
  And GET trả về đúng giá trị mới
```

---

## Edge Cases & Error Scenarios

```
Scenario: API offline — hiển thị lỗi và giữ dữ liệu
  Given API server không phản hồi
  When admin thực hiện bất kỳ thao tác CRUD nào
  Then hiển thị thông báo lỗi "Không thể kết nối đến server"
  And form giữ nguyên dữ liệu đã điền
  And admin có thể thử lại

Scenario: Token hết hạn — redirect login
  Given token đã hết hạn
  When admin gọi bất kỳ API admin nào
  Then nhận 401
  And redirect về /xac-thuc/dang-nhap

Scenario: Slug trùng khi tạo khóa học
  When admin tạo khóa học với slug đã tồn tại
  Then API trả về 409 với field "slug"
  And hiển thị lỗi "Slug đã tồn tại"

Scenario: Upload ảnh quá lớn
  Given admin chọn ảnh > 10MB
  When media service xử lý
  Then trả về lỗi kích thước
  And hiển thị thông báo "Ảnh quá lớn, vui lòng chọn ảnh dưới 10MB"

Scenario: Drag-drop thất bại (API lỗi) — rollback
  Given admin drag module để sắp xếp
  And optimistic update đã chạy
  When API reorder trả về lỗi
  Then UI rollback về thứ tự cũ
  And hiển thị toast lỗi

Scenario: Nhiều tab — conflict
  Given admin mở cùng course edit ở 2 tab
  When admin lưu ở tab 1, rồi lưu ở tab 2
  Then tab 2 ghi đè dữ liệu tab 1 (last-write-wins)
  And không có merge conflict (chấp nhận behavior này cho single-admin)
```

---

*End of BDD spec. Ready for /bdd-review challenge.*
