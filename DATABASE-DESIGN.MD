# DATABASE DESIGN & DATA MODELING (Thiết kế Cơ sở Dữ liệu Toàn diện)
**Công nghệ sử dụng**: Drizzle ORM + SQLite (`bun:sqlite`) + Zod (Validation).

Bản thiết kế này đã được mở rộng để bao phủ toàn bộ **8 Module Cốt lõi** của hệ thống (Đã bổ sung thêm Module Blog và Cấu hình Trang Chủ).

---

## 1. Module Cấu hình Giao Diện (Homepage & Site Settings)
Để linh hoạt hiển thị các mục nổi bật trên Trang chủ mà không cần Hard-code, chúng ta áp dụng 2 chiến thuật: Cờ đánh dấu (Flags) và Key-Value Store.

### Cờ đánh dấu (Thêm vào các bảng hiện có)
- Thêm cột `is_featured_on_home`: Boolean (Cho phép Admin tick chọn để show ra trang chủ).
- Thêm cột `featured_order`: Integer (Dùng để sắp xếp thứ tự hiển thị trên trang chủ).
*(Sẽ được thêm vào bảng `courses`, `portfolios` và `digital_products` ở dưới).*

### Bảng Cấu hình Chung (`site_settings`)
Lưu các thông tin thay đổi động như banner, text giới thiệu ngắn, hoặc các khối không thuộc một Object cụ thể.
- `key`: String (Primary Key - VD: `home_hero_title`, `contact_email`)
- `value`: Text (Dữ liệu JSON hoặc String thuần)
- `description`: String (Mô tả cho Admin dễ hiểu)

---

## 2. Module Khóa Học (LMS & Course Module)
Module này yêu cầu cấu trúc cha-con (Course -> Modules -> Lessons) và hệ thống đánh giá (Testimonials).

### Bảng Khóa Học (`courses`)
- `id`: UUID (Primary Key)
- `title`: String
- `base_price`: Integer
- `trailer_video_url`: String
- `content_html`: Text
- `is_published`: Boolean
- **`is_featured_on_home`**: Boolean (Hiển thị ở section "Khóa học nổi bật")
- **`featured_order`**: Integer

### Bảng Chương Học (`course_modules`)
- `id`: UUID
- `course_id`: UUID (Khóa ngoại)
- `title`: String
- `sort_order`: Integer

### Bảng Bài Học (`course_lessons`)
- `id`: UUID
- `module_id`: UUID (Khóa ngoại)
- `title`: String
- `video_url`: String
- `duration_seconds`: Integer
- `is_free_preview`: Boolean
- `sort_order`: Integer

### Bảng Đánh Giá (`testimonials`)
- `id`: UUID
- `course_id`: UUID (Khóa ngoại)
- `user_name`: String
- `user_avatar_url`: String
- `rating`: Integer (1-5 sao)
- `content`: Text
- **`is_featured`**: Boolean (Ghim lên đầu slider trang chủ/landing page)

---

## 3. Module Bài Viết (Blog / CMS)
Phục vụ SEO và chia sẻ kiến thức (Ví dụ: Bài viết "Quay video bằng điện thoại chuyên nghiệp...").

### Bảng Danh Mục Bài Viết (`post_categories`)
- `id`: UUID
- `name`: String
- `slug`: String (VD: `kien-thuc-quay-dung`)

### Bảng Bài Viết (`posts`)
- `id`: UUID
- `category_id`: UUID (Khóa ngoại)
- `title`: String
- `slug`: String (Unique, dùng làm URL SEO)
- `thumbnail_url`: String (Ảnh cover bài viết)
- `seo_description`: String (Mô tả ngắn cho thẻ Meta description)
- `content_html`: Text (Nội dung chi tiết - Render bằng Markdown/Rich Text Editor)
- `published_at`: Timestamp (Hỗ trợ lên lịch đăng bài)
- `views`: Integer (Đếm số lượt xem)

---

## 4. Module Hồ Sơ Năng Lực (Portfolio / Showcase)

### Bảng Dự Án (`portfolios`)
- `id`: UUID
- `title`: String
- `category`: Enum `['TVC', 'MUSIC_VIDEO', 'TRAVEL_VLOG', 'SHORT_FILM']`
- `thumbnail_url`: String
- `preview_video_url`: String
- `full_video_url`: String
- `created_at`: Timestamp
- **`is_featured_on_home`**: Boolean (Hiển thị ở section "Dự án tiêu biểu")
- **`featured_order`**: Integer

---

## 5. Module Sản Phẩm Số (E-commerce / Presets)

### Bảng Sản Phẩm Số (`digital_products`)
- `id`: UUID
- `title`: String
- `description`: Text
- `price`: Integer
- `download_file_url`: String
- **`is_featured_on_home`**: Boolean

### Bảng Trình Diễn Trước/Sau (`product_showcases`)
- `id`: UUID
- `product_id`: UUID (Khóa ngoại)
- `before_image_url`: String
- `after_image_url`: String
- `sort_order`: Integer

---

## 6. Module Bán Hàng & Chăm sóc Khách hàng (CRM & Marketing)

### Bảng Khách Hàng Tiềm Năng (`leads`)
- `id`: UUID
- `course_id`: UUID (Khóa ngoại)
- `customer_name`: String
- `customer_phone`: String (Bắt buộc)
- `status`: Enum `['NEW', 'CONTACTED', 'CONVERTED', 'CANCELLED']`
- `admin_notes`: Text

### Bảng Quản Lý Khuyến Mãi (`promotions`)
- `id`: UUID
- `course_id`: UUID (Null = Áp dụng toàn trang)
- `campaign_name`: String
- `discount_percentage`: Integer
- `start_date`: Timestamp
- `end_date`: Timestamp
- `is_active`: Boolean

### Bảng Câu Hỏi Thường Gặp (`faqs`)
- `id`: UUID
- `course_id`: UUID (Null = FAQ chung toàn trang)
- `question`: String
- `answer`: Text
- `sort_order`: Integer

---

## 7. Module Xác Thực Người Dùng (Auth & Users)

### Bảng Người Dùng (`users`)
- `id`: UUID
- `email`: String (Unique)
- `name`: String
- `avatar_url`: String
- `role`: Enum `['ADMIN', 'USER']`
- `google_id`: String (Dành cho Google OAuth)

### Bảng Sở Hữu Khóa Học (`user_courses`)
- `user_id`: UUID
- `course_id`: UUID
- `granted_at`: Timestamp

---

## 8. Module Media (Lưu trữ File tập trung)

### Bảng Siêu Dữ Liệu File (`media`)
- `id`: UUID
- `filename`: String
- `url`: String
- `mime_type`: String
- `size_bytes`: Integer
- `uploaded_at`: Timestamp
