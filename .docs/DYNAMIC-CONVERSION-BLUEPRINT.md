# Dynamic Conversion Blueprint — thanhdatcomputer.com

**Mục tiêu:** Chuyển toàn bộ website từ giao diện tĩnh (hardcode + mockData) sang dynamic 100%, cho phép Administrator cấu hình mọi nội dung ngay trên Admin Dashboard mà không cần động đến code.

---

## Mục lục

1. [Kiến trúc Dynamic tổng thể](#1-kiến-trúc-dynamic-tổng-thể)
2. [Thiết kế Database đầy đủ](#2-thiết-kế-database-đầy-đủ)
3. [Hệ thống API Routes](#3-hệ-thống-api-routes)
4. [Data Fetching Strategy cho Frontend](#4-data-fetching-strategy-cho-frontend)
5. [Admin Dashboard Architecture](#5-admin-dashboard-architecture)
6. [Page-by-Page Dynamic Mapping](#6-page-by-page-dynamic-mapping)
7. [Media Microservice `apps/media` — Kiến trúc Chi tiết](#7-media-microservice-appsmedia--kiến-trúc-chi-tiết)
   - 7.0 Khái quát apps/media làm gì?
   - 7.1 Kiến trúc thư mục
   - 7.2 Database Schema cho Media
   - 7.3 Multi-Source Media (Upload / YouTube / External URL)
   - 7.4 Upload Flow Chi tiết (Validator → Storage → Optimizer → Variants → DB)
   - 7.5 On-the-Fly Image Transformation (Dynamic Resize)
   - 7.6 Responsive Images — Tích hợp với Next.js Frontend
   - 7.7 CDN-Friendly Architecture (URL Design, Cache Headers, Nginx + Cloudflare)
   - 7.8 Image Optimization Pipeline — Sharp Config
   - 7.9 File Type Validation — Bảo mật
   - 7.10 Media API Endpoints Chi tiết
   - 7.11 Migrate 30 Ảnh Từ WordPress Cũ
   - 7.12 Video Support (YouTube + Upload)
   - 7.13 Tổng kết Media Flow
   - 7.14 Security Checklist
8. [Lộ trình triển khai](#8-lộ-trình-triển-khai)
9. [Block-Based Content Editor (Thay thế Rich Text)](#9-block-based-content-editor-thay-thế-rich-text)
   - 9.0 Tại sao dùng Block Editor thay vì Rich Text?
   - 9.1 Kiến trúc Block System
   - 9.2 Block Types — Danh sách đầy đủ (21+ types)
   - 9.3 Database Schema cho Block Content
   - 9.4 Zod Schema cho Block System (Discriminated Union)
   - 9.5 Admin Block Editor UX
   - 9.6 Block Renderer — Frontend React Component
   - 9.7 Block Content áp dụng ở đâu?
   - 9.8 Ví dụ: 1 bài blog dùng Blocks (JSON)
10. [Khóa Học Chi Tiết Kiểu Udemy/Coursera](#10-khóa-học-chi-tiết-kiểu-udemycoursera)
    - 10.0 UX Mục tiêu: Học viên biết chính xác mình sẽ học gì
    - 10.1 Curriculum View — Trái tim của trang khóa học
    - 10.2 Database Schema Mở Rộng cho Curriculum (+ instructors, course_instructors)
    - 10.3 Zod Schema bổ sung (CourseExtended, Instructor, LessonExtended)
    - 10.4 Trang Course Detail — Layout đầy đủ kiểu Udemy
    - 10.5 Admin Course Editor — Curriculum Builder
    - 10.6 So sánh Trước vs Sau
    - 10.7 API Endpoints bổ sung

---

## 1. Kiến trúc Dynamic tổng thể

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                        │
│  (React SPA trong Next.js App Router — /quan-tri-vien/*)    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Settings │ │ Courses  │ │  Blog    │ │   Media Lib   │  │
│  │   CRUD   │ │   CRUD   │ │   CRUD   │ │   Upload/CRUD │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
│       │             │             │               │         │
└───────┼─────────────┼─────────────┼───────────────┼─────────┘
        │             │             │               │
        ▼             ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   HONO API (apps/api)                        │
│                                                              │
│  /api/settings/*    /api/courses/*    /api/posts/*            │
│  /api/portfolios/*  /api/products/*   /api/faqs/*             │
│  /api/testimonials/*  /api/leads/*    /api/media/*            │
│  /api/promotions/*  /api/auth/*                               │
│                                                              │
│  ▸ zValidator middleware (Zod schemas từ @workspace/types)    │
│  ▸ Drizzle ORM ───► SQLite (bun:sqlite)                      │
│  ▸ Hono RPC types exposed cho Frontend                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ Hono RPC (End-to-End Type Safe)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                NEXT.JS 16 FRONTEND (apps/web)                │
│                                                              │
│  Layout:                                                     │
│    ▸ Root Layout ─── fetch siteSettings (server component)   │
│                                                              │
│  Homepage:                                                   │
│    ▸ HeroBanner   ← siteSettings (query by key prefix)       │
│    ▸ WorkSection  ← siteSettings                             │
│    ▸ ProductSection ← siteSettings                           │
│    ▸ CounterSection ← siteSettings                           │
│    ▸ AboutSection ← siteSettings                             │
│                                                              │
│  Listing Pages:                                              │
│    ▸ /khoa-hoc    ← GET /api/courses (published, sorted)     │
│    ▸ /bai-viet    ← GET /api/posts (published, paginated)    │
│    ▸ /san-pham    ← GET /api/portfolios (sorted)             │
│    ▸ /cong-cu     ← GET /api/products (published)            │
│                                                              │
│  Detail Pages:                                               │
│    ▸ /khoa-hoc/[slug] ← GET /api/courses/:slug               │
│                      ← GET /api/courses/:id/modules          │
│                      ← GET /api/courses/:id/testimonials     │
│                      ← GET /api/faqs?course_id=:id            │
│    ▸ /bai-viet/[slug] ← GET /api/posts/:slug                 │
│                      ← GET /api/posts?limit=4 (related)      │
│                                                              │
│  Global Components:                                          │
│    ▸ SiteHeader ← siteSettings (nav, logo, LMS url)          │
│    ▸ SiteFooter ← siteSettings (socials, nav, email, logo)   │
│    ▸ Messenger  ← siteSettings (messenger url, labels)       │
└─────────────────────────────────────────────────────────────┘
```

### Nguyên tắc thiết kế

1. **Single Source of Truth:** Zod schemas trong `@workspace/types` là nguồn duy nhất định nghĩa cấu trúc dữ liệu. DB Drizzle schema phải khớp với Zod schema.

2. **Hono RPC End-to-End Type Safety:** Frontend dùng `hc` client từ `hono/client`, import AppRouter type từ API. Mọi thay đổi schema sẽ báo lỗi compile-time ở cả frontend lẫn backend.

3. **Server Components mặc định:** Tất cả data fetching dùng Next.js Server Components (async component) để tối ưu SSR/SEO. Chỉ dùng 'use client' cho các phần cần tương tác (form, animation GSAP, counter animation).

4. **site_settings làm "CMS Headless":** Mọi nội dung không thuộc entity cụ thể (brand text, hero text, nav, socials, contact info…) được lưu vào bảng `site_settings` dưới dạng key-value. Admin có thể edit tất cả từ 1 page duy nhất.

5. **Media Library tập trung:** Mọi ảnh upload đều qua endpoint `/api/media/upload`, lưu metadata vào bảng `media`, file vào disk. Các entity khác tham chiếu qua `media_id` hoặc `url`.

6. **SQLite WAL Mode — 2 Databases riêng biệt:**
   - `apps/api` → `app.db` (15 bảng business: courses, posts, settings, users...)
   - `apps/media` → `media.db` (2 bảng metadata: media, media_variants)
   - WAL mode: reads không bao giờ bị block bởi writes. In-process reads < 0.1ms.
   - PostgreSQL NOT needed at this scale (1 admin writer, SSR reads, vài nghìn rows).
   - Drizzle ORM supports both SQLite and PostgreSQL — migrate later chỉ cần đổi driver, không sửa code.

---

## 2. Thiết kế Database đầy đủ

### 2.1 Bảng `site_settings` — CMS cho mọi text tĩnh

```sql
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,     -- VD: 'site_title', 'hero_tagline'
  value       TEXT NOT NULL,        -- Có thể là string hoặc JSON stringified
  description TEXT,                 -- Mô tả cho admin
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### Tập hợp toàn bộ key cần có (được nhóm theo khu vực sử dụng):

**Site Identity (keys #S01-S11)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `site_title` | string | Title mặc định cho `<title>` |
| `site_title_template` | string | Template `%s \| Tên Site` |
| `site_description` | string | Meta description |
| `site_keywords` | JSON array | `["quay dựng","chỉnh màu",...]` |
| `site_url` | string | `https://minhtravel.vn` |
| `theme_color` | string | `#0B0F19` |
| `apple_web_app_title` | string | `Minh Travel` |
| `logo_url` | string | URL của logo (hoặc tham chiếu media_id) |
| `logo_alt` | string | Alt text cho logo |
| `favicon_url` | string | URL favicon |
| `pwa_name` | string | Tên PWA |
| `pwa_short_name` | string | Short name PWA |
| `pwa_description` | string | Description PWA |
| `pwa_bg_color` | string | `#000000` |
| `pwa_theme_color` | string | `#0B0F19` |

**Navigation (keys #N01-N03)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `nav_items` | JSON array | `[{"label":"Khoá học","href":"/khoa-hoc"},...]` |
| `lms_url` | string | `https://hoc.minhtravel.vn/courses/` |
| `lms_cta_text` | string | `VÀO HỌC` |

**Footer (keys #F01-F02)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `footer_nav` | JSON array | `[{"label":"SẢN PHẨM","href":"/san-pham"},...]` |
| `social_links` | JSON array | `[{"name":"Youtube","href":"https://...","icon":"youtube"},...]` |
| `contact_email` | string | `congminh1196@gmail.com` |

**Hero Banner (keys #H01-H09)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `hero_youtube_id` | string | `utP7z6_Zcwg` |
| `hero_video_title` | string | Tiêu đề video YouTube |
| `hero_tagline` | string | `Kể câu chuyện của bạn qua từng khung hình` |
| `hero_btn1_text` | string | `KHOÁ HỌC CỦA TÔI` |
| `hero_btn1_url` | string | `https://hoc.minhtravel.vn/` |
| `hero_btn2_text` | string | `ĐĂNG KÝ HỌC` |
| `hero_btn2_url` | string | `/khoa-hoc` |
| `hero_brands` | JSON array | `["sony","lg","apple","canon","dji","samsung","panasonic","fujifilm"]` |

**Homepage Sections (keys #W01-W08, #P01-P08, #C01, #A01-A02)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `home_work_heading` | string | `Work` |
| `home_work_card1_title` | string | `Dự án nổi bật` |
| `home_work_card1_desc` | string | Mô tả... |
| `home_work_card1_link_text` | string | `Khám phá →` |
| `home_work_card1_href` | string | `/san-pham` |
| `home_work_card2_title` | string | `Short Video` |
| `home_work_card2_desc` | string | Mô tả... |
| `home_work_card2_link_text` | string | `Xem trên TikTok →` |
| `home_work_card2_href` | string | `https://www.tiktok.com/@minhtravel` |
| `home_products_heading` | string | `Sản phẩm` |
| `home_products_card1_label` | string | `Khám phá ngay` |
| `home_products_card1_title` | string | `Khoá học` |
| `home_products_card1_desc` | string | Mô tả... |
| `home_products_card1_href` | string | `/khoa-hoc` |
| `home_products_card2_label` | string | `Công cụ sáng tạo` |
| `home_products_card2_title` | string | `LUTs & Presets` |
| `home_products_card2_desc` | string | Mô tả... |
| `home_products_card2_href` | string | `/cong-cu` |
| `home_counters` | JSON array | `[{"label":"Facebook followers","value":38760},...]` |
| `home_about_text_1` | string | Đoạn văn 1 |
| `home_about_text_2` | string | Đoạn văn 2 |

**Messenger (keys #M01-M03)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `messenger_url` | string | `https://www.messenger.com/t/137051212834178/` |
| `messenger_aria_label` | string | `Chat qua Messenger` |
| `messenger_title` | string | `Chat với Minh Travel` |

**Page-specific (keys #P01-P10)**

| Key | Kiểu value | Mô tả |
|-----|-----------|-------|
| `courses_page_hero_title` | string | `Bắt đầu sự nghiệp của bạn` |
| `courses_page_trust_text` | string | `Được tin tưởng bởi 3,600+ thành viên` |
| `courses_page_trust_icon_url` | string | URL icon |
| `courses_page_default_btn_text` | string | `Mua ngay` |
| `courses_page_faq_heading` | string | `FAQ` |
| `portfolio_page_title` | string | `Films by Minh Travel` |
| `portfolio_page_subtitle` | string | `Tổng hợp những dự án tiêu biểu...` |
| `portfolio_cta_heading` | string | `Bạn muốn làm việc cùng tôi?` |
| `portfolio_cta_items` | JSON array | `[{"text":"Liên hệ làm việc","href":"..."},...]` |
| `presets_page_title` | string | `LUTs & Presets by Minh Travel` |
| `presets_page_subtitle` | string | `Bộ công cụ giúp bạn...` |
| `presets_page_btn_text` | string | `Mua ngay` |
| `contact_page_title` | string | `Liên hệ` |
| `contact_page_subtitle` | string | `Bạn có câu hỏi hoặc cần tư vấn?...` |
| `contact_success_title` | string | `Cảm ơn bạn!` |
| `contact_success_text` | string | `Chúng tôi sẽ liên hệ lại...` |
| `contact_info_title` | string | `Thông tin liên hệ` |
| `contact_address` | string | `123 Đường ABC...` |
| `contact_phone` | string | `0900 123 456` |
| `contact_hours` | string | `Thứ 2 - Thứ 7, 9:00 - 18:00` |
| `blog_page_title` | string | `Blog` |

**Tổng: ~55 site_settings keys.**

---

### 2.2 Bảng `courses` — Khóa học (đã mở rộng)

```sql
CREATE TABLE courses (
  id                    TEXT PRIMARY KEY,   -- UUID
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  subtitle              TEXT,
  description           TEXT NOT NULL,       -- Short description
  content_html          TEXT,                -- Full rich text content
  base_price            INTEGER NOT NULL,
  original_price        INTEGER,
  thumbnail_url         TEXT,                -- Thumbnail image
  trailer_video_url     TEXT,                -- YouTube URL or ID
  external_checkout_url TEXT,                -- Link mua hàng ngoài
  is_published          INTEGER NOT NULL DEFAULT 0,
  is_featured_on_home   INTEGER NOT NULL DEFAULT 0,
  is_combo_only         INTEGER NOT NULL DEFAULT 0,
  button_text           TEXT,                -- Custom CTA text
  featured_order        INTEGER DEFAULT 0,
  rating                REAL DEFAULT 0,
  rating_count          TEXT DEFAULT '0',    -- Display string like "99+"
  student_count         INTEGER DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Chú ý:** Đã thêm `slug`, `description`, `thumbnail_url`, `external_checkout_url`, `is_combo_only`, `button_text`, `rating_count`, `original_price`, `subtitle` so với thiết kế cũ.

### 2.3 Bảng `course_modules` — Chương học

```sql
CREATE TABLE course_modules (
  id          TEXT PRIMARY KEY,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,                 -- THÊM so với thiết kế cũ
  sort_order  INTEGER NOT NULL DEFAULT 0
);
```

### 2.4 Bảng `course_lessons` — Bài học

```sql
CREATE TABLE course_lessons (
  id              TEXT PRIMARY KEY,
  module_id       TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  video_url       TEXT,
  duration_seconds INTEGER,
  is_free_preview  INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0
);
```

### 2.5 Bảng `course_bonuses` — Ưu đãi kèm khóa học (MỚI)

```sql
CREATE TABLE course_bonuses (
  id        TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  value     TEXT NOT NULL,
  icon      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

### 2.6 Bảng `testimonials` — Đánh giá (đã mở rộng)

```sql
CREATE TABLE testimonials (
  id              TEXT PRIMARY KEY,
  course_id       TEXT REFERENCES courses(id) ON DELETE SET NULL,  -- NULL = global
  user_name       TEXT NOT NULL,
  user_role       TEXT,              -- THÊM: role của người đánh giá
  user_avatar_url TEXT,
  rating          INTEGER DEFAULT 5,
  content         TEXT NOT NULL,
  title           TEXT,              -- THÊM: tiêu đề ngắn cho testimonial
  is_featured     INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.7 Bảng `post_categories` — Danh mục bài viết (giữ nguyên)

```sql
CREATE TABLE post_categories (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);
```

### 2.8 Bảng `posts` — Bài viết (đã mở rộng)

```sql
CREATE TABLE posts (
  id              TEXT PRIMARY KEY,
  category_id     TEXT REFERENCES post_categories(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT NOT NULL,          -- THÊM: khác với seo_description
  content_html    TEXT NOT NULL,
  thumbnail_url   TEXT,
  seo_description TEXT,
  author          TEXT DEFAULT 'minhtravel',  -- THÊM
  read_time       INTEGER DEFAULT 5,         -- THÊM
  is_published    INTEGER NOT NULL DEFAULT 0,
  published_at    TEXT,
  views           INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.9 Bảng `portfolios` — Dự án (đã mở rộng)

```sql
CREATE TABLE portfolios (
  id                 TEXT PRIMARY KEY,
  title              TEXT NOT NULL,
  description        TEXT,                  -- THÊM
  category           TEXT NOT NULL,         -- 'Travel','Commercial','TV','Tutorial',...
  thumbnail_url      TEXT,
  preview_video_url  TEXT,
  full_video_url     TEXT,
  youtube_video_id   TEXT,                  -- THÊM: YouTube ID
  is_featured_on_home INTEGER NOT NULL DEFAULT 0,
  featured_order     INTEGER DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.10 Bảng `digital_products` — Sản phẩm số (đã mở rộng)

```sql
CREATE TABLE digital_products (
  id                   TEXT PRIMARY KEY,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  price                INTEGER NOT NULL,
  thumbnail_url        TEXT,                -- THÊM
  download_file_url    TEXT,
  external_checkout_url TEXT,               -- THÊM
  youtube_preview_id   TEXT,                -- THÊM
  tag                  TEXT,                -- THÊM: 'LUT', 'Preset',...
  is_featured_on_home  INTEGER NOT NULL DEFAULT 0,
  is_published         INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.11 Các bảng còn lại (giữ nguyên hoặc mở rộng nhẹ)

```sql
-- product_showcases: giữ nguyên
CREATE TABLE product_showcases (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  before_image_url TEXT,
  after_image_url  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- leads: THÊM customer_email và message
CREATE TABLE leads (
  id             TEXT PRIMARY KEY,
  course_id      TEXT REFERENCES courses(id),
  customer_name  TEXT NOT NULL,
  customer_email TEXT,              -- THÊM
  customer_phone TEXT NOT NULL,
  message        TEXT,              -- THÊM
  status         TEXT NOT NULL DEFAULT 'NEW'
    CHECK (status IN ('NEW','CONTACTED','CONVERTED','CANCELLED')),
  admin_notes    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- promotions: giữ nguyên
CREATE TABLE promotions (
  id                  TEXT PRIMARY KEY,
  course_id           TEXT REFERENCES courses(id),
  campaign_name       TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  start_date          TEXT,
  end_date            TEXT,
  is_active           INTEGER NOT NULL DEFAULT 0
);

-- faqs: giữ nguyên
CREATE TABLE faqs (
  id         TEXT PRIMARY KEY,
  course_id  TEXT REFERENCES courses(id) ON DELETE SET NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- users: giữ nguyên
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  password_hash TEXT,                -- THÊM: cho email/password login
  name       TEXT NOT NULL,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'USER'
    CHECK (role IN ('ADMIN','USER')),
  google_id  TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- user_courses: giữ nguyên
CREATE TABLE user_courses (
  user_id    TEXT NOT NULL REFERENCES users(id),
  course_id  TEXT NOT NULL REFERENCES courses(id),
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, course_id)
);

-- media: giữ nguyên
CREATE TABLE media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 3. Hệ thống API Routes

Tất cả routes được định nghĩa trong `apps/api/src/routes/`. Mỗi module có 1 file route riêng.

### 3.1 Cấu trúc thư mục API

```
apps/api/src/
├── index.ts                 # App router chính, mount tất cả sub-routers
├── db/
│   ├── index.ts             # Drizzle ORM initialization
│   └── schema.ts            # Tất cả Drizzle table definitions
├── routes/
│   ├── settings.ts          # /api/settings/*
│   ├── courses.ts           # /api/courses/*
│   ├── modules.ts           # /api/courses/:courseId/modules/*
│   ├── lessons.ts           # /api/courses/:courseId/modules/:moduleId/lessons/*
│   ├── bonuses.ts           # /api/courses/:courseId/bonuses/*
│   ├── posts.ts             # /api/posts/*
│   ├── categories.ts        # /api/categories/*
│   ├── portfolios.ts        # /api/portfolios/*
│   ├── products.ts          # /api/products/*
│   ├── faqs.ts              # /api/faqs/*
│   ├── testimonials.ts      # /api/testimonials/*
│   ├── leads.ts             # /api/leads/*
│   ├── promotions.ts        # /api/promotions/*
│   ├── media.ts             # /api/media/*
│   └── auth.ts              # /api/auth/*
└── middleware/
    └── auth.ts              # Auth middleware (JWT/session check)
```

### 3.2 API Endpoints chi tiết

#### Site Settings

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/settings` | Public | Lấy tất cả settings (dùng cho frontend SSR) |
| `GET` | `/api/settings/:key` | Public | Lấy 1 setting theo key |
| `PUT` | `/api/settings/:key` | Admin | Update 1 setting |
| `PUT` | `/api/settings/batch` | Admin | Update nhiều setting 1 lần (nhận `{ key: value, ... }`) |

#### Courses

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/courses` | Public | List courses (query: `?published=true&featured=true&limit=10`) |
| `GET` | `/api/courses/:slug` | Public | Get course by slug |
| `POST` | `/api/courses` | Admin | Create course |
| `PUT` | `/api/courses/:id` | Admin | Update course |
| `DELETE` | `/api/courses/:id` | Admin | Delete course |

#### Course Modules

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/courses/:id/modules` | Public | List modules of a course |
| `POST` | `/api/courses/:id/modules` | Admin | Add module |
| `PUT` | `/api/modules/:id` | Admin | Update module |
| `DELETE` | `/api/modules/:id` | Admin | Delete module |
| `PUT` | `/api/courses/:id/modules/reorder` | Admin | Reorder modules (nhận `[{id, sort_order},...]`) |

#### Course Lessons

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/modules/:id/lessons` | Public | List lessons of a module |
| `POST` | `/api/modules/:id/lessons` | Admin | Add lesson |
| `PUT` | `/api/lessons/:id` | Admin | Update lesson |
| `DELETE` | `/api/lessons/:id` | Admin | Delete lesson |

#### Bonuses

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/courses/:id/bonuses` | Public | List bonuses |
| `POST` | `/api/courses/:id/bonuses` | Admin | Add bonus |
| `PUT` | `/api/bonuses/:id` | Admin | Update bonus |
| `DELETE` | `/api/bonuses/:id` | Admin | Delete bonus |

#### Posts (Blog)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/posts` | Public | List posts (query: `?published=true&category=:slug&page=1&limit=10`) |
| `GET` | `/api/posts/:slug` | Public | Get post by slug |
| `POST` | `/api/posts` | Admin | Create post |
| `PUT` | `/api/posts/:id` | Admin | Update post |
| `DELETE` | `/api/posts/:id` | Admin | Delete post |

#### Post Categories

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/categories` | Public | List categories |
| `POST` | `/api/categories` | Admin | Create category |
| `PUT` | `/api/categories/:id` | Admin | Update category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

#### Portfolios

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/portfolios` | Public | List portfolios (query: `?featured=true&limit=10`) |
| `GET` | `/api/portfolios/:id` | Public | Get portfolio by id |
| `POST` | `/api/portfolios` | Admin | Create portfolio |
| `PUT` | `/api/portfolios/:id` | Admin | Update portfolio |
| `DELETE` | `/api/portfolios/:id` | Admin | Delete portfolio |

#### Digital Products

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/products` | Public | List products (query: `?published=true`) |
| `GET` | `/api/products/:id` | Public | Get product by id |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

#### FAQs

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/faqs` | Public | List FAQs (query: `?course_id=:id`) |
| `POST` | `/api/faqs` | Admin | Create FAQ |
| `PUT` | `/api/faqs/:id` | Admin | Update FAQ |
| `DELETE` | `/api/faqs/:id` | Admin | Delete FAQ |

#### Testimonials

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/testimonials` | Public | List testimonials (query: `?course_id=:id&featured=true`) |
| `POST` | `/api/testimonials` | Admin | Create testimonial |
| `PUT` | `/api/testimonials/:id` | Admin | Update testimonial |
| `DELETE` | `/api/testimonials/:id` | Admin | Delete testimonial |

#### Leads

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/leads` | Admin | List leads (query: `?status=NEW&page=1`) |
| `POST` | `/api/leads` | Public | Submit lead (from contact form) |
| `PUT` | `/api/leads/:id` | Admin | Update lead status/notes |

#### Promotions

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/promotions` | Admin | List promotions |
| `GET` | `/api/promotions/active` | Public | Get active promotion for a course |
| `POST` | `/api/promotions` | Admin | Create promotion |
| `PUT` | `/api/promotions/:id` | Admin | Update promotion |
| `DELETE` | `/api/promotions/:id` | Admin | Delete promotion |

#### Media

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/media` | Admin | List media files (query: `?type=image&page=1&limit=50`) |
| `POST` | `/api/media/upload` | Admin | Upload file (multipart) |
| `DELETE` | `/api/media/:id` | Admin | Delete media file |

#### Auth

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/api/auth/login` | Public | Login (email + password) |
| `POST` | `/api/auth/register` | Public | Register (cho học viên) |
| `POST` | `/api/auth/logout` | User | Logout |
| `GET` | `/api/auth/me` | User | Get current user info |
| `GET` | `/api/auth/google` | Public | Google OAuth redirect |
| `GET` | `/api/auth/google/callback` | Public | Google OAuth callback |

**Tổng: ~45 API endpoints.**

### 3.3 Hono RPC Type Export

```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { settingsRoutes } from './routes/settings';
import { coursesRoutes } from './routes/courses';
// ... import tất cả routes

const app = new Hono()
  .route('/api/settings', settingsRoutes)
  .route('/api/courses', coursesRoutes)
  // ... mount tất cả routes

export default app;
export type AppType = typeof app; // Export cho Frontend dùng với hc<AppType>
```

---

## 4. Data Fetching Strategy cho Frontend

### 4.1 Hono RPC Client Setup

```typescript
// apps/web/src/lib/rpc.ts
import { hc } from 'hono/client';
import type { AppType } from '@workspace/api'; // Import từ apps/api

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Server-side client (cho Server Components)
export const api = hc<AppType>(API_URL);

// Có thể tạo wrapper function cho fetch với revalidation nếu cần:
export async function apiFetch<T>(
  fetcher: () => Promise<Response>,
  revalidate?: number
): Promise<T> {
  const res = await fetcher();
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
```

### 4.2 Data Fetching Pattern cho từng loại Component

#### Pattern A: Server Component với async data fetching (cho listing/detail pages)

```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
import { api } from '@/lib/rpc';

async function getCourses() {
  const res = await api.courses.$get({ query: { published: 'true' } });
  return res.json();
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

#### Pattern B: site_settings Query Service

```typescript
// apps/web/src/lib/settings.ts
import { api } from './rpc';

let settingsCache: Record<string, string> | null = null;

export async function getSiteSettings(): Promise<Record<string, string>> {
  if (settingsCache) return settingsCache;

  const res = await api.settings.$get();
  const data = await res.json();

  // Transform array of {key, value} thành object
  settingsCache = {};
  for (const item of data) {
    settingsCache[item.key] = item.value;
  }
  return settingsCache;
}

// Helper: parse JSON setting
export function getJsonSetting<T>(settings: Record<string, string>, key: string, fallback: T): T {
  try {
    const val = settings[key];
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
```

#### Pattern C: Global layout data (SiteHeader, SiteFooter)

Root layout fetch 1 lần và truyền xuống qua context hoặc props:

```typescript
// apps/web/src/app/layout.tsx
import { getSiteSettings } from '@/lib/settings';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html>
      <body>
        <SiteHeader settings={settings} />
        {children}
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
```

---

## 5. Admin Dashboard Architecture

### 5.1 Cấu trúc Admin

```
apps/web/src/app/quan-tri-vien/
├── layout.tsx                    # Admin layout: sidebar + auth guard
├── page.tsx                       # Dashboard overview (stats, recent items)
├── cai-dat/
│   └── page.tsx                   # Settings form (tất cả site_settings keys)
├── khoa-hoc/
│   ├── page.tsx                   # Course list (table với edit/delete)
│   ├── [slug]/page.tsx           # Edit course (tabbed form: info, modules, bonuses)
│   └── tao-moi/page.tsx          # Create course form
├── bai-viet/
│   ├── page.tsx                   # Blog post list (table)
│   ├── [slug]/page.tsx           # Edit post (rich text editor)
│   └── tao-moi/page.tsx          # Create post
├── danh-muc/
│   └── page.tsx                   # Post category management
├── san-pham/
│   ├── page.tsx                   # Portfolio + Digital Products tabs
│   └── tao-moi/page.tsx          # Create form (tùy loại)
├── faq/
│   └── page.tsx                   # FAQ list + edit
├── danh-gia/
│   └── page.tsx                   # Testimonial management
├── khach-hang/
│   └── page.tsx                   # Leads management (status filter)
├── khuyen-mai/
│   └── page.tsx                   # Promotion management
├── media/
│   └── page.tsx                   # Media library (grid view, upload)
└── tai-khoan/
    └── page.tsx                   # User management
```

### 5.2 Admin Layout

```typescript
// apps/web/src/app/quan-tri-vien/layout.tsx
'use client';

import { useSession } from 'next-auth/react'; // hoặc custom auth hook
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.scss';

const SIDEBAR_ITEMS = [
  { icon: '📊', label: 'Tổng quan', href: '/quan-tri-vien' },
  { icon: '⚙️', label: 'Cài đặt', href: '/quan-tri-vien/cai-dat' },
  { icon: '📚', label: 'Khóa học', href: '/quan-tri-vien/khoa-hoc' },
  { icon: '📝', label: 'Bài viết', href: '/quan-tri-vien/bai-viet' },
  { icon: '🎬', label: 'Dự án & Sản phẩm', href: '/quan-tri-vien/san-pham' },
  { icon: '❓', label: 'FAQ', href: '/quan-tri-vien/faq' },
  { icon: '⭐', label: 'Đánh giá', href: '/quan-tri-vien/danh-gia' },
  { icon: '👥', label: 'Khách hàng', href: '/quan-tri-vien/khach-hang' },
  { icon: '🎁', label: 'Khuyến mãi', href: '/quan-tri-vien/khuyen-mai' },
  { icon: '🖼️', label: 'Media', href: '/quan-tri-vien/media' },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // TODO: check auth session, redirect to login if not admin

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/quan-tri-vien" className={styles.logo}>Minh Travel Admin</Link>
        <nav>
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
```

### 5.3 Admin Pages Design

Mỗi admin page nên dùng pattern:

```
┌──────────────────────────────────────────────┐
│  Page Header (title + "Thêm mới" button)      │
├──────────────────────────────────────────────┤
│  Filters / Search bar (nếu cần)               │
├──────────────────────────────────────────────┤
│  Data Table hoặc Form                         │
│  - Table: sortable columns, action buttons    │
│  - Pagination                                 │
│  - Empty state                                │
└──────────────────────────────────────────────┘
```

**Settings Page đặc biệt:**

Thay vì 1 form dài, nhóm settings thành các tab/section theo category:
1. **Thông tin chung:** site_title, site_description, site_keywords, site_url, theme_color, logo, favicon
2. **Navigation:** nav_items, lms_url, lms_cta_text, footer_nav, social_links
3. **Hero Banner:** hero_youtube_id, hero_tagline, hero_btn1/btn2, hero_brands
4. **Trang chủ:** home_work_*, home_products_*, home_counters, home_about_*
5. **Messenger:** messenger_url, messenger_aria_label, messenger_title
6. **Trang con:** courses_page_*, portfolio_*, presets_*, contact_*, blog_*

Mỗi section là 1 partial form, submit riêng hoặc batch.

### 5.4 Admin Media Library

```
┌──────────────────────────────────────────────────────┐
│  [Upload files]  (drag & drop + click to browse)       │
├──────────────────────────────────────────────────────┤
│  Grid view:                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │  Ảnh 1  │ │  Ảnh 2  │ │  Ảnh 3  │ │  Ảnh 4  │         │
│  │ [Copy]  │ │ [Copy]  │ │ [Copy]  │ │ [Copy]  │         │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                        │
│  Click ảnh → hiện modal: preview + copy URL + delete     │
└──────────────────────────────────────────────────────┘
```

Khi admin edit entity có trường ảnh (thumbnail), hiển thị nút "Chọn từ Media Library" mở modal/popup chọn ảnh, thay vì phải paste URL.

---

## 6. Page-by-Page Dynamic Mapping

### 6.1 Root Layout (`app/layout.tsx`)

| Hiện tại | Dynamic |
|----------|---------|
| Hardcode `metadata.title`, `description`, `keywords`, `metadataBase`, `themeColor` | `await getSiteSettings()` → lấy các key site_* |
| Hardcode `openGraph` | Dùng `site_title`, `site_description`, `site_url` |
| Hardcode `<SiteHeader />` + `<SiteFooter />` | Truyền `settings` object vào props |

Cách làm tối ưu: Dùng `unstable_cache` hoặc React `cache()` để cache `getSiteSettings()` tránh fetch DB mỗi request.

### 6.2 Homepage (`app/(nguoi-dung)/page.tsx`)

| Component | Hiện tại | Dynamic |
|-----------|----------|---------|
| `HeroBanner` | Mọi thứ hardcode trong component | Nhận props `settings: SiteSettings`. Đọc `hero_youtube_id`, `hero_tagline`, `hero_btn*`, `hero_brands` |
| `WorkSection` | 2 card hardcode | Nhận props. Đọc `home_work_*` từ settings |
| `ProductSection` | 2 card hardcode | Nhận props. Đọc `home_products_*` từ settings |
| `CounterSection` | Array `COUNTER_DATA` hardcode | Nhận props `counters: Counter[]`. Đọc `home_counters` (JSON) |
| `AboutSection` | 2 đoạn text hardcode | Nhận props `text1, text2`. Đọc `home_about_text_1`, `home_about_text_2` |
| `MessengerButton` | URL + labels hardcode | Đọc `messenger_*` từ settings |

### 6.3 SiteHeader + SiteFooter

| Component | Hiện tại | Dynamic |
|-----------|----------|---------|
| `SiteHeader` | NAV_ITEMS array hardcode, LMS_URL hardcode, logo URL hardcode, CTA text hardcode | Nhận `navItems`, `lmsUrl`, `lmsCtaText`, `logoUrl`, `logoAlt` từ props |
| `SiteFooter` | FOOTER_NAV_TOP hardcode, SOCIALS hardcode, logo URL hardcode, email hardcode | Nhận `footerNav`, `socialLinks`, `logoUrl`, `logoAlt`, `contactEmail` từ props |

### 6.4 Course Listing (`/khoa-hoc`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockCourses.find(...)` | `await (await api.courses.$get({ query: { published: 'true' } })).json()` |
| Hardcode hero title "Bắt đầu sự nghiệp của bạn" | `settings.courses_page_hero_title` |
| Hardcode trust text + icon | `settings.courses_page_trust_text` + `settings.courses_page_trust_icon_url` |
| Hardcode FAQ heading "FAQ" | `settings.courses_page_faq_heading` |
| Hardcode button text "Mua ngay" | `settings.courses_page_default_btn_text` |
| Hardcode "Không Bán Rời" | Lấy từ `course.buttonText` (đã có trong DB) |
| `mockFAQs` cho FAQ toàn trang | `await (await api.faqs.$get({ query: {} })).json()` (không filter course_id) |

### 6.5 Course Detail (`/khoa-hoc/[slug]`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockCourses.find(c => c.slug === params.slug)` | `await (await api.courses[':slug'].$get({ param: { slug } })).json()` |
| `getCourseDetailExtras(slug)` trả về data hardcode | Mỗi phần fetch riêng: `api.courses[':id'].modules.$get()`, `api.courses[':id'].bonuses.$get()`, `api.courses[':id'].testimonials.$get()` |
| Hardcode badge "ƯU ĐÃI GIẢM GIÁ 90%" | Lấy từ `promotions` table (active promotion cho course) |
| Hardcode subtitle "TIẾT LỘ BÍ QUYẾT..." | Có thể thêm vào site_settings hoặc course field riêng |
| Hardcode brand title "Một số thương hiệu..." | `settings.home_about_text_1` hoặc key riêng |
| Hardcode modules title + subtitle | `settings` key mới |
| Hardcode bonuses title | `settings` key mới |
| Hardcode testimonials title | `settings` key mới |
| Hardcode FAQ watermark | `settings` key mới |
| `CourseStickyCTA` với price + checkoutUrl | Giữ logic cũ, data từ API |

### 6.6 Blog Listing (`/bai-viet`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockArticles` | `await (await api.posts.$get({ query: { published: 'true', page: '1', limit: '10' } })).json()` |
| Hardcode PageHeader title "Blog" | `settings.blog_page_title` |
| Hardcode pagination "Trang 1 / 50" | Lấy từ API response (total_pages) |

### 6.7 Blog Detail (`/bai-viet/[slug]`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockArticles.find(...)` | `await (await api.posts[':slug'].$get({ param: { slug } })).json()` |
| Related: `mockArticles.filter(...)` | `await (await api.posts.$get({ query: { published: 'true', limit: '4', exclude: slug } })).json()` |

### 6.8 Portfolio (`/san-pham`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockPortfolioItems` | `await (await api.portfolios.$get()).json()` |
| Hardcode PageHeader | `settings.portfolio_page_title`, `settings.portfolio_page_subtitle` |
| Hardcode CTA heading | `settings.portfolio_cta_heading` |
| Hardcode CTA buttons | `JSON.parse(settings.portfolio_cta_items)` |

### 6.9 Presets (`/cong-cu`)

| Hiện tại | Dynamic |
|----------|---------|
| `mockPresets` | `await (await api.products.$get({ query: { published: 'true' } })).json()` |
| Hardcode PageHeader | `settings.presets_page_title`, `settings.presets_page_subtitle` |
| Hardcode "Mua ngay" | `settings.presets_page_btn_text` |

### 6.10 Contact (`/lien-he`)

| Hiện tại | Dynamic |
|----------|---------|
| Hardcode PageHeader | `settings.contact_page_title`, `settings.contact_page_subtitle` |
| Hardcode success message | `settings.contact_success_title`, `settings.contact_success_text` |
| Hardcode contact info (address, phone, email, hours) | `settings.contact_address`, `settings.contact_phone`, `settings.contact_email`, `settings.contact_hours` |
| Form submit → `setSubmitted(true)` (no backend) | POST đến `/api/leads` với body `{ name, email, phone, message }` |

### 6.11 Auth Pages (`/xac-thuc/*`)

| Hiện tại | Dynamic |
|----------|---------|
| Tất cả redirect về `/vi` | Implement actual login/register/forgot-password forms, gọi `/api/auth/*` |

---

## 7. Media Microservice `apps/media` — Kiến trúc Chi tiết

### 7.0 Khái quát: apps/media làm gì?

`apps/media` là **media microservice độc lập** trên port 3002, chịu trách nhiệm toàn bộ vòng đời của media trong hệ thống:

| Nhiệm vụ | Chi tiết |
|----------|---------|
| **Upload & Lưu trữ** | Nhận file từ admin, validate, lưu vào disk |
| **Optimize ảnh** | Resize, compress, chuyển đổi định dạng (Sharp) |
| **On-the-fly Transform** | Resize/format ảnh theo query params: `?w=800&format=webp` |
| **Quản lý external media** | Lưu reference đến YouTube embed, external URL |
| **Responsive Images** | Tự sinh srcset với nhiều kích thước |
| **Serve static files** | Trả file tĩnh qua Hono (dev) hoặc Nginx (production) |
| **CDN-friendly URLs** | URL bất biến, cache-friendly, có version hash |

### 7.1 Kiến trúc thư mục apps/media

```
apps/media/
├── src/
│   ├── index.ts                    # Hono app entry (port 3002)
│   ├── routes/
│   │   ├── upload.ts               # POST   /upload           — Upload file
│   │   ├── images.ts               # GET    /img/:id          — Serve/resize ảnh gốc
│   │   ├── images.ts               # GET    /img/:id/:variant — Serve variant đã pre-generate
│   │   ├── media.ts                # GET    /media            — List media (admin)
│   │   ├── media.ts                # DELETE /media/:id        — Xóa media
│   │   └── external.ts             # POST   /external         — Lưu external media reference
│   ├── services/
│   │   ├── storage.ts              # Disk I/O: lưu/đọc/xóa file
│   │   ├── optimizer.ts            # Sharp pipeline: resize, format, compress
│   │   ├── variants.ts             # Pre-generate các variant (thumbnail, medium, large)
│   │   ├── hash.ts                 # Content-hash cho cache busting
│   │   └── validator.ts            # Validate file type, size, dimensions
│   ├── db/
│   │   ├── index.ts                # Drizzle ORM (SQLite riêng cho media metadata)
│   │   └── schema.ts              # media table + media_variants table
│   └── config/
│       └── variants.ts             # Định nghĩa các variant preset
├── data/
│   ├── uploads/                    # File gốc đã upload
│   │   └── {year}/{month}/{uuid}.{ext}
│   └── variants/                   # Variant đã pre-generate
│       └── {uuid}/{variant-name}.{ext}
└── package.json
```

### 7.2 Database Schema cho Media

```sql
-- Lưu metadata của file media
CREATE TABLE media (
  id              TEXT PRIMARY KEY,          -- UUID
  original_name   TEXT NOT NULL,             -- Tên file gốc khi upload
  stored_name     TEXT NOT NULL,             -- Tên file đã lưu trên disk (uuid.ext)
  mime_type       TEXT NOT NULL,             -- image/jpeg, image/png, video/mp4, ...
  file_size       INTEGER NOT NULL,          -- Dung lượng bytes
  width           INTEGER,                   -- Chiều rộng (nếu là ảnh)
  height          INTEGER,                   -- Chiều cao (nếu là ảnh)
  source          TEXT NOT NULL DEFAULT 'upload',  -- 'upload' | 'youtube' | 'external_url'
  external_url    TEXT,                      -- URL gốc (nếu source=external_url)
  youtube_id      TEXT,                      -- YouTube video ID (nếu source=youtube)
  alt_text        TEXT,                      -- Alt text mặc định
  content_hash    TEXT,                      -- SHA256 hash của file (cache busting)
  disk_path       TEXT NOT NULL,             -- Đường dẫn tuyệt đối trên disk
  uploaded_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lưu các variant đã pre-generate cho mỗi ảnh
CREATE TABLE media_variants (
  id         TEXT PRIMARY KEY,
  media_id   TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,           -- 'thumbnail', 'medium', 'large', 'og', ...
  width      INTEGER NOT NULL,
  height     INTEGER,
  format     TEXT NOT NULL,           -- 'webp', 'avif', 'jpeg', 'png'
  file_size  INTEGER NOT NULL,
  disk_path  TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(media_id, name)
);
```

### 7.3 Multi-Source Media — 3 Loại Media

Website này cần hỗ trợ 3 loại nguồn media, vì rất nhiều nội dung dùng YouTube embed và external link:

#### Loại 1: Upload (file tự upload lên)

```
Admin upload ảnh thumbnail khóa học → lưu vào /data/uploads/ → optimize → variants
```

#### Loại 2: YouTube Embed (video từ YouTube)

```
Admin paste YouTube URL → hệ thống extract video_id → lưu metadata
Khi render: dùng YouTube iframe API hoặc custom player
```

**Cách lưu:**
```typescript
// POST /api/media/external
{
  "source": "youtube",
  "youtubeUrl": "https://www.youtube.com/watch?v=utP7z6_Zcwg",
  "altText": "Hero video Minh Travel"
}
// → Hệ thống extract: id='utP7z6_Zcwg', tự fetch thumbnail từ YouTube
// → Lưu media record với source='youtube', youtube_id='utP7z6_Zcwg'
// → Tự fetch và lưu thumbnail chất lượng cao từ YouTube:
//    https://img.youtube.com/vi/utP7z6_Zcwg/maxresdefault.jpg
```

#### Loại 3: External URL (link ngoài, không upload)

```
Admin paste URL ảnh từ WordPress cũ, CDN ngoài, hoặc storage khác
```

```typescript
// POST /api/media/external
{
  "source": "external_url",
  "url": "https://minhtravel.vn/wp-content/uploads/.../image.jpg",
  "altText": "Thumbnail khóa học"
}
// → Lưu metadata, KHÔNG download file
// → Khi render: dùng trực tiếp external_url
// → Có thể thêm option "Import" để download về local storage
```

#### Quyết định dùng loại nào?

| Tình huống | Dùng loại |
|---|---|
| Admin upload ảnh mới (thumbnail, avatar, favicon...) | **Upload** |
| Nhúng video YouTube (hero, portfolio, trailer khóa học) | **YouTube** |
| Giữ lại ảnh cũ từ WordPress (chưa migrate) | **External URL** |
| Tài liệu PDF, file download | **Upload** |

### 7.4 Upload Flow Chi tiết

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT (Admin Dashboard)                                          │
│    POST /upload (multipart/form-data)                                │
│    Body: file + metadata (alt_text, ...)                             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 2. VALIDATOR (validator.ts)                                          │
│    ✓ Kiểm tra MIME type thực tế (magic bytes, không tin extension)   │
│    ✓ Allowed types: image/jpeg, image/png, image/webp, image/avif,   │
│                    image/gif, image/svg+xml,                         │
│                    video/mp4, video/webm,                            │
│                    application/pdf                                   │
│    ✓ Max file size: 50MB (ảnh), 500MB (video)                        │
│    ✓ Scan malware header (cơ bản)                                     │
│    ✓ Reject nếu không pass → 400 Bad Request                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 3. STORAGE (storage.ts)                                              │
│    ✓ Tạo UUID cho file                                               │
│    ✓ Lưu vào: /data/uploads/{YYYY}/{MM}/{uuid}.{ext}                 │
│    ✓ Giữ nguyên file gốc (lossless)                                  │
│    ✓ Tính SHA256 content hash                                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
          ┌──────────────┐  ┌──────────────────┐
          │ 4a. ẢNH      │  │ 4b. VIDEO/PDF/... │
          │ OPTIMIZER    │  │ (skip optimize)   │
          └──────┬───────┘  └────────┬─────────┘
                 │                   │
                 ▼                   │
┌────────────────────────────────────┐
│ OPTIMIZER (optimizer.ts + Sharp)   │
│                                    │
│ Pipeline cho từng ảnh upload:       │
│                                    │
│  1. Phân tích metadata gốc         │
│  2. Resize về max width 2560px     │
│     (giữ lại ảnh siêu lớn cho     │
│      retina/4K, nhưng giới hạn)    │
│  3. Convert sang WebP (lossy,      │
│     quality 82%) → đây là ảnh     │
│     chính được serve                │
│  4. Đồng thời convert sang AVIF    │
│     (quality 65%) → cho browser    │
│     hỗ trợ (nhỏ hơn WebP ~20%)    │
│  5. Strip EXIF metadata             │
│  6. Lưu ảnh đã optimize            │
│                                    │
│ → Kết quả: ảnh gốc giữ lại,       │
│   nhưng variant chính đã tối ưu.  │
└────────────────────┬───────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│ 5. VARIANTS (variants.ts)            │
│                                      │
│ Pre-generate các kích thước phổ biến: │
│                                      │
│  ┌──────────┬─────────┬──────────┐  │
│  │ Variant  │ Width   │ Format   │  │
│  ├──────────┼─────────┼──────────┤  │
│  │ micro    │ 16px    │ webp     │  │  ← Blur placeholder
│  │ thumbnail│ 400px   │ webp     │  │  ← Card grid
│  │ medium   │ 800px   │ webp     │  │  ← Blog content
│  │ large    │ 1400px  │ webp     │  │  ← Hero/Cover
│  │ og       │ 1200px  │ jpeg     │  │  ← Open Graph (FB yêu cầu JPEG)
│  └──────────┴─────────┴──────────┘  │
│                                      │
│ Lưu vào: /data/variants/{uuid}/     │
│          thumbnail.webp              │
│          medium.webp                 │
│          large.webp                  │
│          og.jpeg                     │
│          micro.webp                  │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│ 6. DB INSERT (schema.ts)             │
│                                      │
│  INSERT INTO media (...)             │
│  INSERT INTO media_variants (...)    │
│  (1 record media + 5 variant records)│
│                                      │
│  → Return: {                         │
│      id, url, variants,              │
│      width, height, file_size         │
│    }                                 │
└──────────────────────────────────────┘
```

### 7.5 On-the-Fly Image Transformation (Dynamic Resize)

Ngoài variants pre-generated, `apps/media` hỗ trợ resize động qua query params. Cực kỳ hữu ích cho responsive images khi cần kích thước không có trong preset.

#### URL Schema

```
GET /img/{media_id}?w={width}&h={height}&f={format}&q={quality}
GET /img/{media_id}/{variant_name}
```

| Param | Mặc định | Mô tả |
|-------|---------|-------|
| `w` | — | Width (px). Nếu chỉ có w, giữ aspect ratio |
| `h` | — | Height (px). Nếu chỉ có h, giữ aspect ratio |
| `f` | `webp` | Format: `webp`, `avif`, `jpeg`, `png` |
| `q` | `82` | Quality (0-100), chỉ áp dụng cho lossy format |

#### Ví dụ

```
/img/abc123                           → Trả variant "medium" (800w webp), detect từ User-Agent
/img/abc123?w=400                     → Resize on-the-fly: 400w webp
/img/abc123?w=600&f=avif&q=70         → 600w AVIF, quality 70%
/img/abc123/thumbnail                  → Trả variant "thumbnail" đã pre-generate
/img/abc123/og                         → Trả variant "og" (1200w JPEG)
```

#### Caching On-the-Fly Results

```typescript
// optimizer.ts — logic xử lý dynamic resize

async function getOrCreateVariant(
  mediaId: string,
  width: number,
  format: string,
  quality: number
): Promise<{ path: string; width: number; height: number }> {
  const cacheKey = `dyn_${width}_${format}_q${quality}`;

  // 1. Check đã có variant tương ứng trong DB chưa
  const existing = await db.query.media_variants.findFirst({
    where: and(eq(media_variants.media_id, mediaId), eq(media_variants.name, cacheKey)),
  });
  if (existing) return existing;

  // 2. Chưa có → resize bằng Sharp → lưu variant mới
  const media = await getMedia(mediaId);
  const outputPath = `${VARIANTS_DIR}/${mediaId}/${cacheKey}.${format}`;
  await sharp(media.disk_path)
    .resize(width, undefined, { withoutEnlargement: true })
    .toFormat(format, { quality })
    .toFile(outputPath);

  // 3. Lưu record variant
  const variant = await db.insert(media_variants).values({
    id: crypto.randomUUID(),
    media_id: mediaId,
    name: cacheKey,
    width,
    format,
    file_size: fileSize,
    disk_path: outputPath,
    created_at: new Date().toISOString(),
  }).returning();

  return variant[0];
}
```

**Chiến lược:** Dynamic variants được cache vĩnh viễn trên disk. Request đầu tiên chậm (resize), các request sau nhanh (serve static). Không cần invalidate cache vì URL chứa tất cả params.

### 7.6 Responsive Images — Tích hợp với Next.js Frontend

Ở `apps/web`, khi render ảnh từ Media service, dùng pattern sau để tận dụng srcset:

```tsx
// apps/web/src/components/media/ResponsiveImage.tsx
import type { MediaItem } from '@workspace/types';

interface Props {
  media: MediaItem;
  sizes: string;        // VD: "(max-width: 768px) 100vw, 50vw"
  alt?: string;
  className?: string;
  priority?: boolean;
}

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3002';

export function ResponsiveImage({ media, sizes, alt, className, priority }: Props) {
  if (media.source === 'youtube') {
    // Render YouTube thumbnail với play button overlay
    return <YouTubeThumbnail youtubeId={media.youtube_id!} />;
  }

  if (media.source === 'external_url') {
    // Dùng external URL trực tiếp (có thể qua proxy nếu cần)
    return <img src={media.external_url!} alt={alt || media.alt_text} className={className} />;
  }

  // Upload media: tận dụng variants
  const baseUrl = `${MEDIA_BASE}/img/${media.id}`;
  const srcSet = [
    `${baseUrl}/thumbnail 400w`,
    `${baseUrl}?w=800 800w`,
    `${baseUrl}?w=1400 1400w`,
  ].join(', ');

  return (
    <img
      src={`${baseUrl}/medium`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || media.alt_text}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      width={media.width}
      height={media.height}
    />
  );
}
```

### 7.7 CDN-Friendly Architecture

#### URL Design — Immutable & Cacheable

```
Cấu trúc URL: /img/{media_id}/{variant_name}.{ext}
               /img/{media_id}?w=800&f=webp

Nguyên tắc:
  ▸ URL bất biến (immutable) — một khi file được upload và variant được tạo,
    URL không bao giờ thay đổi
  ▸ Content-hash có thể embed vào URL nếu cần cache busting:
    /img/{media_id}_{content_hash[:8]}/thumbnail.webp
  ▸ Không dùng timestamp, không query param phiên bản
```

#### Cache Headers

```typescript
// apps/media/src/index.ts — middleware set cache headers

app.use('/img/*', async (c, next) => {
  await next();
  // Ảnh đã optimize → cache 1 năm ở browser + CDN
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  c.header('ETag', generateETag(c.res)); // ETag dựa trên content hash
});

app.use('/api/media/*', async (c, next) => {
  await next();
  // API metadata → không cache hoặc cache ngắn
  c.header('Cache-Control', 'no-cache');
});
```

#### CDN Integration (Production)

```
                      ┌──────────────┐
                      │   Cloudflare  │  ← CDN layer (Free plan đủ dùng)
                      │   (hoặc       │
                      │   BunnyCDN)   │
                      └──────┬───────┘
                             │
                    ┌────────┴────────┐
                    │    NGINX        │  ← Reverse proxy + static serve
                    │  (VPS chính)    │
                    └──┬──────────┬───┘
                       │          │
              ┌────────▼──┐  ┌───▼──────────┐
              │ Next.js   │  │ apps/media   │  ← Chỉ nhận upload requests
              │ (port     │  │ (port 3002)  │     + on-the-fly resize lần đầu
              │  3000)    │  │              │
              └───────────┘  └──┬───────────┘
                                │
                         ┌──────▼──────┐
                         │  /data/     │  ← Disk storage
                         │  uploads/   │     (VPS volume hoặc
                         │  variants/  │      mounted NFS)
                         └─────────────┘
```

#### Nginx Static File Serving (Bỏ qua apps/media cho file tĩnh)

```nginx
# nginx.conf — phần cấu hình media

server {
    server_name media.minhtravel.vn;

    # QUAN TRỌNG: Serve file tĩnh TRỰC TIẾP từ disk — không qua Bun
    # Việc này giảm 90% tải cho apps/media
    location /img/ {
        alias /data/variants/;

        # Cache headers cho CDN
        expires 1y;
        add_header Cache-Control "public, immutable";

        # Nếu file chưa tồn tại (dynamic variant chưa pre-generate)
        # → fallback về apps/media để resize lần đầu
        try_files $uri @media_service;
    }

    location @media_service {
        proxy_pass http://127.0.0.1:3002;
        proxy_cache dynamic_resize;
        proxy_cache_valid 200 365d;
        proxy_cache_key "$uri";
    }

    # Upload endpoint → luôn qua apps/media
    location /upload {
        proxy_pass http://127.0.0.1:3002;
        client_max_body_size 500M;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
    }
}
```

**Giải thích flow:**
1. CDN request `/img/abc123/thumbnail.webp`
2. Nginx check file có trên disk không → **Có** → Trả trực tiếp (cực nhanh, không qua Bun)
3. Nginx check file có trên disk không → **Không** → Proxy qua apps/media (resize lần đầu)
4. Lần sau file đã có trên disk → Nginx trả trực tiếp

### 7.8 Image Optimization Pipeline — Chi tiết Sharp Config

```typescript
// apps/media/src/config/optimizer.ts

export const IMAGE_OPTIMIZATION = {
  // Ảnh gốc sau upload → resize về max dimension này
  maxSourceWidth: 2560,
  maxSourceHeight: 2560,

  // Định dạng chính để serve
  defaultFormat: 'webp' as const,

  // Preset variants
  variants: {
    micro:     { width: 16,   format: 'webp', quality: 30 },  // Blur placeholder
    thumbnail: { width: 400,  format: 'webp', quality: 80 },  // Card grid
    medium:    { width: 800,  format: 'webp', quality: 82 },  // Default serve
    large:     { width: 1400, format: 'webp', quality: 82 },  // Hero/Cover
    og:        { width: 1200, format: 'jpeg', quality: 85 },  // Open Graph
  },

  // Accept header → format map (nếu browser gửi Accept: image/avif)
  acceptFormat: {
    'image/avif': 'avif',
    'image/webp': 'webp',
    'image/jpeg': 'jpeg',
  },

  // Sharp pipeline options
  sharp: {
    // Strip tất cả metadata (EXIF, ICC profile, XMP, ...)
    stripMetadata: true,

    // Không bao giờ phóng to ảnh (withoutEnlargement)
    withoutEnlargement: true,

    // Chroma subsampling cho JPEG (giảm size ~15% không giảm chất lượng thấy được)
    chromaSubsampling: '4:2:0',
  },
};
```

### 7.9 File Type Validation — Bảo mật

```typescript
// apps/media/src/services/validator.ts

const ALLOWED_TYPES = {
  image: {
    mime: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'],
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'],
  },
  video: {
    mime: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 500 * 1024 * 1024, // 500MB
    extensions: ['.mp4', '.webm', '.mov'],
  },
  document: {
    mime: ['application/pdf', 'application/zip'],
    maxSize: 100 * 1024 * 1024, // 100MB
    extensions: ['.pdf', '.zip'],
  },
};

async function validateFile(file: File): Promise<ValidatedFile | Error> {
  // 1. Đọc magic bytes (header của file) để xác định MIME thực
  const buffer = await file.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 12));
  const detectedType = detectMimeFromMagicBytes(header);

  // 2. So sánh với MIME type client gửi lên
  if (file.type !== detectedType) {
    return new Error(`MIME mismatch: claimed ${file.type}, detected ${detectedType}`);
  }

  // 3. Check whitelist
  const category = getCategory(detectedType);
  if (!category) return new Error(`Unsupported file type: ${detectedType}`);

  // 4. Check size
  if (file.size > category.maxSize) {
    return new Error(`File too large. Max: ${category.maxSize / 1024 / 1024}MB`);
  }

  // 5. Check extension
  const ext = getExtension(file.name);
  if (!category.extensions.includes(ext)) {
    return new Error(`Extension .${ext} not allowed for ${detectedType}`);
  }

  // 6. Bonus: scan for common malware patterns
  if (await hasMalwareSignature(buffer)) {
    return new Error('File appears to contain malicious content');
  }

  return { buffer, mimeType: detectedType, size: file.size, ext, category };
}
```

### 7.10 Media API Endpoints Chi tiết

Thay thế phần Media endpoints đơn giản ở Section 3 bằng các endpoints đầy đủ:

```typescript
// apps/media/src/index.ts

const app = new Hono();

// ─── Upload ────────────────────────────────────
// POST /upload
// Nhận: multipart/form-data { file, altText? }
// Trả: { id, url, variants, width, height, fileSize }
app.post('/upload', uploadHandler);

// ─── Serve Ảnh ─────────────────────────────────
// GET /img/:id
// Serve variant mặc định (medium) hoặc resize on-the-fly
app.get('/img/:id', serveImageHandler);

// GET /img/:id/:variant
// Serve variant cụ thể (thumbnail, medium, large, og, micro)
app.get('/img/:id/:variant', serveVariantHandler);

// ─── External Media ────────────────────────────
// POST /external
// Lưu reference đến YouTube video hoặc external URL
// Body: { source: 'youtube'|'external_url', url, altText? }
// Trả: { id, source, url }
app.post('/external', externalMediaHandler);

// ─── Media CRUD (Admin) ────────────────────────
// GET    /api/media          — List (query: ?source=&type=&page=&limit=&search=)
// GET    /api/media/:id      — Get single + variants
// DELETE /api/media/:id      — Xóa file + variants + DB record
// PATCH  /api/media/:id      — Update altText
app.get('/api/media', listMediaHandler);
app.get('/api/media/:id', getMediaHandler);
app.delete('/api/media/:id', deleteMediaHandler);
app.patch('/api/media/:id', updateMediaHandler);

// ─── Batch Operations ──────────────────────────
// POST /api/media/import-external
// Nhận array các external URLs → download về local, tạo variant
// Hữu ích khi migrate 30 ảnh từ WordPress cũ
app.post('/api/media/import-external', importExternalHandler);
```

### 7.11 Migrate 30 Ảnh Từ WordPress Cũ

Hiện tại tất cả ảnh (30 ảnh) đều trỏ đến `minhtravel.vn/wp-content/uploads/...`. Sử dụng batch import endpoint:

```typescript
// Admin → Media Library → click "Import từ WordPress"

// Gửi request:
POST /api/media/import-external
{
  "urls": [
    "https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png",
    "https://minhtravel.vn/wp-content/uploads/2025/06/Quay-dung-Tiktok-bang-dien-thoai-Online-copy-scaled.webp",
    // ... toàn bộ 30 URLs
  ],
  "altTexts": {
    "logo-size...png": "Minh Travel Logo",
    // ...
  }
}

// apps/media xử lý:
//  For each URL:
//    1. Download file từ WordPress
//    2. Chạy qua optimizer pipeline (resize, webp, variants)
//    3. Lưu vào /data/uploads/
//    4. Tạo variants
//    5. Insert DB record
//    6. Trả về mapping { old_url → new_id }
//
// → Sau đó admin update tất cả entity references từ old_url → media_id
```

### 7.12 Video Support (YouTube + Upload)

Website dùng YouTube rất nhiều (hero banner, portfolio, course trailers). Cần 1 strategy riêng:

```typescript
// YouTube Media — POST /external
{
  source: 'youtube',
  youtubeUrl: 'https://www.youtube.com/watch?v=utP7z6_Zcwg'
}

// Hệ thống tự động:
//  1. Parse video ID
//  2. Fetch metadata từ YouTube oEmbed API (title, thumbnail, author)
//  3. Tải thumbnail maxresdefault về → lưu vào media variants
//  4. Lưu record: { source: 'youtube', youtube_id: 'utP7z6_Zcwg',
//                    thumbnail_media_id: '<uuid của thumbnail đã tải>' }
//
// Khi render ở frontend:
//   <ResponsiveImage media={heroVideo}> → tự render YouTube iframe + poster từ thumbnail
```

**Component xử lý render các loại media:**

```tsx
// apps/web/src/components/media/MediaRenderer.tsx

interface Props {
  media: MediaItem;
  mode?: 'image' | 'video' | 'auto';
  className?: string;
}

export function MediaRenderer({ media, mode = 'auto', className }: Props) {
  if (media.source === 'youtube') {
    return (
      <div className={styles.videoWrapper}>
        <iframe
          src={`https://www.youtube.com/embed/${media.youtube_id}?autoplay=1&mute=1&loop=1&playlist=${media.youtube_id}&controls=0&showinfo=0&rel=0`}
          title={media.alt_text || 'YouTube video'}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className={styles.iframe}
        />
      </div>
    );
  }

  // Upload + External URL → ảnh
  return <ResponsiveImage media={media} sizes="100vw" className={className} />;
}
```

### 7.13 Tổng kết: Media Microservice Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    apps/media — Full Request Flow                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ADMIN UPLOAD ẢNH                                                   │
│  ─────────────                                                      │
│  POST /upload (file)                                                │
│    → validate (magic bytes, size, type)                             │
│    → store original → /data/uploads/2026/07/{uuid}.jpg              │
│    → optimize (Sharp): resize 2560, strip EXIF, webp q82            │
│    → pre-generate variants: thumbnail, medium, large, og, micro     │
│    → INSERT media + media_variants                                  │
│    → return { id, url: "/img/{id}/medium", ...variants }            │
│                                                                     │
│  ADMIN ADD YOUTUBE VIDEO                                            │
│  ────────────────────                                               │
│  POST /external { source: "youtube", youtubeUrl: "..." }           │
│    → parse video ID "utP7z6_Zcwg"                                   │
│    → fetch YouTube thumbnail maxresdefault                          │
│    → download + optimize thumbnail                                  │
│    → INSERT media { source: "youtube", youtube_id, thumbnail_id }   │
│    → return { id, youtube_id, thumbnailUrl }                        │
│                                                                     │
│  ADMIN ADD EXTERNAL URL                                             │
│  ─────────────────────                                              │
│  POST /external { source: "external_url", url: "..." }             │
│    → validate URL reachable                                         │
│    → INSERT media { source: "external_url", external_url }          │
│    → return { id, url }                                             │
│                                                                     │
│  FRONTEND REQUEST ẢNH                                               │
│  ───────────────────                                                │
│  GET /img/{id}/thumbnail                                            │
│    → Nginx: file có trên disk? → serve trực tiếp (nhanh)            │
│    → Nginx: file chưa có? → proxy apps/media                        │
│    → apps/media: pre-generate có? → serve                           │
│    → apps/media: chưa có (dynamic w=,h=) → Sharp resize → cache    │
│    → headers: Cache-Control: public, max-age=31536000, immutable   │
│                                                                     │
│  CDN (Production)                                                   │
│  ────────────────                                                   │
│  Cloudflare/BunnyCDN → origin: media.minhtravel.vn                  │
│    → Cache tất cả /img/* (static, immutable URLs)                   │
│    → Cache miss → về Nginx → serve từ disk                         │
│    → 99% requests được serve từ CDN edge (không đến VPS)            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.14 Security Checklist cho apps/media

| # | Yêu cầu | Cách implement |
|---|---------|---------------|
| 1 | Validate file bằng magic bytes, không tin extension | `validator.ts` — đọc header bytes |
| 2 | Whitelist MIME types | Chỉ cho phép image, video, pdf, zip |
| 3 | Giới hạn kích thước file | 50MB ảnh, 500MB video |
| 4 | Chống path traversal | `storage.ts` — sanitize filename, dùng UUID |
| 5 | Auth cho upload/delete endpoints | Middleware kiểm tra JWT admin token |
| 6 | Rate limiting uploads | Giới hạn số lượng upload/phút (Hono rate-limiter) |
| 7 | Strip metadata khỏi ảnh | Sharp `.withMetadata()` — xóa EXIF, GPS data |
| 8 | Ngăn SVG XSS | Validate SVG không chứa `<script>`, sanitize nếu cần |
| 9 | Content hash cho integrity | SHA256 hash lưu vào DB → verify khi serve |
| 10 | HTTPS only | Production bắt buộc SSL qua Nginx/Cloudflare |

---

## 8. Lộ trình triển khai

### Phase 1: Foundation (Tuần 1-2)

**1.1 DB Schema + Migrations**
- Viết Drizzle schema cho tất cả 13 bảng (đầy đủ cột như thiết kế trên)
- Tạo migration files
- Seed data từ mockData.ts hiện tại

**1.2 API Core Routes**
- Implement `settings.ts` (GET/PUT batch)
- Implement `courses.ts` (CRUD)
- Implement `modules.ts`, `lessons.ts`, `bonuses.ts`
- Implement `posts.ts`, `categories.ts`
- Implement `portfolios.ts`, `products.ts`
- Implement `faqs.ts`, `testimonials.ts`
- Implement `media.ts` (upload + list)

**1.3 Auth**
- Implement `/api/auth/*` (login, register, me)
- Tạo admin user mặc định qua seed

### Phase 2: Admin Dashboard (Tuần 3-4)

**2.1 Admin Layout + Auth Guard**
- Admin sidebar navigation
- Auth check middleware (redirect nếu không phải admin)

**2.2 Settings Page**
- Tabbed form: Thông tin chung, Nav, Hero, Trang chủ, Page-specific, Contact
- Batch submit (PUT /api/settings/batch)

**2.3 Media Library**
- Upload + grid view + delete
- Modal "Chọn ảnh" component dùng chung

**2.4 CRUD Pages**
- Course CRUD (form có modules/lessons/bonuses lồng nhau)
- Blog CRUD (rich text editor cho content)
- Portfolio + Products CRUD
- FAQ, Testimonials, Leads, Promotions CRUD

### Phase 3: Frontend Dynamic Hookup (Tuần 5-6)

**3.1 Hono RPC Client + Site Settings Service**
- Setup `hc` client trong `apps/web/src/lib/rpc.ts`
- Cache layer cho `getSiteSettings()`

**3.2 Global Components**
- Root layout fetch site settings → truyền xuống Header/Footer
- SiteHeader, SiteFooter nhận props thay vì hardcode

**3.3 Homepage Sections**
- HeroBanner → props-based
- WorkSection, ProductSection → props-based
- CounterSection → props-based
- AboutSection → props-based
- MessengerButton → props-based

**3.4 Content Pages**
- Course listing → Server Component fetch API
- Course detail → Server Component fetch API (modules, bonuses, testimonials, FAQs)
- Blog listing + detail → Server Component fetch API
- Portfolio page → Server Component fetch API
- Presets page → Server Component fetch API
- Contact page → form submit POST /api/leads
- Auth pages → Implement actual forms

**3.5 Use Shared Molecules**
- Thay inline rendering bằng `CourseCard`, `ArticleCard`, `PortfolioCard`, `PresetCard`, `TestimonialCard`
- Các molecule này đã có sẵn trong `@workspace/ui`, chỉ cần refactor page để dùng chúng

### Phase 4: Polish + Deploy (Tuần 7-8)

**4.1 Optimization**
- Next.js ISR/SSG cho các page ít thay đổi
- Cache site_settings ở memory
- Image optimization (Next.js Image component)

**4.2 Deployment**
- Dockerfile cho từng app
- Nginx config (theo ARCHITECTURE.MD)
- docker-compose.yml
- Health checks

**4.3 SEO**
- Dynamic sitemap.xml
- Dynamic robots.txt
- Dynamic metadata cho tất cả page từ DB
- Structured data (JSON-LD) cho courses, articles

---

## 9. Block-Based Content Editor (Thay thế Rich Text)

### 9.0 Tại sao dùng Block Editor thay vì Rich Text?

| Rich Text Editor (TinyMCE, Quill...) | Block Editor (Notion, Strapi, Webflow...) |
|---|---|
| 1 khối HTML lớn, khó kiểm soát layout | Mỗi nội dung là 1 block riêng biệt |
| Khó thêm component tùy chỉnh (carousel, video, accordion...) | Dễ dàng thêm bất kỳ block type nào |
| Không nhất quán giữa các bài viết | Layout nhất quán, chuyên nghiệp |
| Khó responsive từng phần | Mỗi block type có responsive riêng |
| Không tái sử dụng được | Cùng 1 block type, style khác nhau |
| Khó migrate, khó search có cấu trúc | JSON structure → dễ search, dễ migrate |

### 9.1 Kiến trúc Block System

```
┌─────────────────────────────────────────────────────┐
│                  BLOCK SYSTEM                        │
│                                                      │
│  ADMIN CREATOR                  FRONTEND RENDERER    │
│  ─────────────                  ─────────────────    │
│                                                      │
│  ┌──────────────┐              ┌──────────────────┐  │
│  │ Block Editor  │   ──save──▶ │  JSON Block Tree  │  │
│  │ (Drag & Drop) │              │  trong DB         │  │
│  └──────────────┘              └────────┬─────────┘  │
│                                         │            │
│  Blocks có sẵn:                         ▼            │
│  ┌─────────┐ ┌──────────┐    ┌──────────────────┐  │
│  │ Heading  │ │Paragraph │    │  Block Renderer    │  │
│  ├─────────┤ ├──────────┤    │  ────────────────  │  │
│  │  Image   │ │  Video   │    │  Map mỗi block     │  │
│  ├─────────┤ ├──────────┤    │  type → React       │  │
│  │ Carousel │ │ Accordion │    │  component tương   │  │
│  ├─────────┤ ├──────────┤    │  ứng                │  │
│  │  Quote   │ │  Code    │    └──────────────────┘  │
│  ├─────────┤ ├──────────┤                           │
│  │ Divider  │ │  CTA     │                           │
│  ├─────────┤ ├──────────┤                           │
│  │ Columns  │ │Grid Ảnh  │                           │
│  ├─────────┤ ├──────────┤                           │
│  │ Timeline │ │ Testim.  │                           │
│  ├─────────┤ ├──────────┤                           │
│  │ Pricing  │ │Table     │                           │
│  └─────────┘ └──────────┘                           │
└─────────────────────────────────────────────────────┘
```

### 9.2 Block Types — Danh sách đầy đủ

#### Typography Blocks

| Block Type | Props | Mô tả |
|---|---|---|
| `heading` | `{ level: 1-6, text, alignment }` | Heading H1-H6 |
| `paragraph` | `{ text, alignment, dropCap? }` | Đoạn văn bản |
| `quote` | `{ text, author?, style: 'default'\|'bordered' }` | Block quote |
| `list` | `{ items: string[], type: 'unordered'\|'ordered' }` | Danh sách |
| `code` | `{ code, language, showLineNumbers? }` | Code block |
| `callout` | `{ text, type: 'info'\|'warning'\|'tip'\|'danger', icon? }` | Hộp thông báo |

#### Media Blocks

| Block Type | Props | Mô tả |
|---|---|---|
| `image` | `{ mediaId, alt, caption?, width?: 'full'\|'wide'\|'contained', border? }` | Ảnh đơn |
| `video` | `{ mediaId (youtube), caption?, aspectRatio: '16:9'\|'4:3'\|'9:16' }` | YouTube embed |
| `gallery` | `{ mediaIds: string[], columns: 2\|3\|4, gap, caption? }` | Grid ảnh |
| `carousel` | `{ slides: { mediaId, caption? }[], autoplay?, interval? }` | Slider ảnh/video |
| `beforeAfter` | `{ beforeMediaId, afterMediaId, caption? }` | So sánh trước/sau |

#### Layout Blocks

| Block Type | Props | Mô tả |
|---|---|---|
| `divider` | `{ style: 'solid'\|'dashed'\|'gradient' }` | Đường phân cách |
| `spacer` | `{ height: number }` | Khoảng trống |
| `columns` | `{ columns: number, blocks: Block[][] }` | Bố cục cột (mỗi cột chứa blocks) |
| `tabs` | `{ tabs: { label, blocks: Block[] }[] }` | Tabs chứa nội dung |

#### Interactive Blocks

| Block Type | Props | Mô tả |
|---|---|---|
| `accordion` | `{ items: { title, blocks: Block[] }[], allowMultiple? }` | Accordion FAQ |
| `collapse` | `{ title, blocks: Block[] }` | Nội dung thu gọn |
| `timeline` | `{ events: { date, title, description }[] }` | Timeline dọc |
| `table` | `{ headers: string[], rows: string[][], striped? }` | Bảng dữ liệu |

#### Conversion Blocks

| Block Type | Props | Mô tả |
|---|---|---|
| `cta` | `{ heading, text, buttonText, buttonUrl, style: 'primary'\|'secondary'\|'minimal' }` | Call-to-action |
| `pricing` | `{ plans: { name, price, features, cta, highlighted? }[] }` | Bảng giá |
| `newsletter` | `{ heading, text, placeholder, buttonText }` | Form đăng ký email |
| `testimonial` | `{ testimonialId }` | Nhúng testimonial từ DB |

### 9.3 Database Schema cho Block Content

Thay vì lưu 1 cột `content_html TEXT`, content của bài viết/khóa học được lưu dưới dạng JSON có cấu trúc.

```sql
-- Mở rộng bảng posts: thay content_html bằng content_blocks
ALTER TABLE posts ADD COLUMN content_blocks TEXT; -- JSON string của Block[]

-- Bảng block templates (nếu muốn admin tạo template tái sử dụng)
CREATE TABLE block_templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  blocks      TEXT NOT NULL,  -- JSON Block[]
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 9.4 Zod Schema cho Block System

```typescript
// packages/types/src/schemas/blocks.ts
import { z } from 'zod';

// ─── Base Block ─────────────────────────────
const BaseBlock = z.object({
  id: z.string(),           // UUID unique cho mỗi block instance
  type: z.string(),         // 'heading' | 'paragraph' | 'image' | ...
});

// ─── Typography Blocks ─────────────────────
const HeadingBlock = BaseBlock.extend({
  type: z.literal('heading'),
  data: z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
    text: z.string(),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
  }),
});

const ParagraphBlock = BaseBlock.extend({
  type: z.literal('paragraph'),
  data: z.object({
    text: z.string(),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
    dropCap: z.boolean().optional(),
  }),
});

const QuoteBlock = BaseBlock.extend({
  type: z.literal('quote'),
  data: z.object({
    text: z.string(),
    author: z.string().optional(),
    style: z.enum(['default', 'bordered', 'pull']).default('default'),
  }),
});

const ListBlock = BaseBlock.extend({
  type: z.literal('list'),
  data: z.object({
    style: z.enum(['unordered', 'ordered', 'checklist']),
    items: z.array(z.string()),
  }),
});

const CodeBlock = BaseBlock.extend({
  type: z.literal('code'),
  data: z.object({
    code: z.string(),
    language: z.string().default('plaintext'),
    showLineNumbers: z.boolean().default(false),
  }),
});

const CalloutBlock = BaseBlock.extend({
  type: z.literal('callout'),
  data: z.object({
    text: z.string(),
    variant: z.enum(['info', 'warning', 'tip', 'danger', 'success']).default('info'),
    icon: z.string().optional(),  // Emoji hoặc icon name
  }),
});

// ─── Media Blocks ──────────────────────────
const ImageBlock = BaseBlock.extend({
  type: z.literal('image'),
  data: z.object({
    mediaId: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.enum(['full', 'wide', 'contained', 'inline']).default('wide'),
    border: z.boolean().default(false),
    rounded: z.boolean().default(false),
  }),
});

const VideoBlock = BaseBlock.extend({
  type: z.literal('video'),
  data: z.object({
    mediaId: z.string(),   // YouTube media ID từ apps/media
    caption: z.string().optional(),
    aspectRatio: z.enum(['16:9', '4:3', '9:16', '1:1']).default('16:9'),
    autoplay: z.boolean().default(false),
  }),
});

const GalleryBlock = BaseBlock.extend({
  type: z.literal('gallery'),
  data: z.object({
    images: z.array(z.object({
      mediaId: z.string(),
      caption: z.string().optional(),
    })),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    gap: z.enum(['sm', 'md', 'lg']).default('md'),
    layout: z.enum(['grid', 'masonry']).default('grid'),
  }),
});

const CarouselBlock = BaseBlock.extend({
  type: z.literal('carousel'),
  data: z.object({
    slides: z.array(z.object({
      mediaId: z.string(),
      caption: z.string().optional(),
    })),
    autoplay: z.boolean().default(false),
    interval: z.number().min(1000).default(5000),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
  }),
});

const BeforeAfterBlock = BaseBlock.extend({
  type: z.literal('beforeAfter'),
  data: z.object({
    beforeMediaId: z.string(),
    beforeLabel: z.string().default('Before'),
    afterMediaId: z.string(),
    afterLabel: z.string().default('After'),
    caption: z.string().optional(),
  }),
});

// ─── Layout Blocks ──────────────────────────
const DividerBlock = BaseBlock.extend({
  type: z.literal('divider'),
  data: z.object({
    style: z.enum(['solid', 'dashed', 'dotted', 'gradient']).default('solid'),
  }),
});

const SpacerBlock = BaseBlock.extend({
  type: z.literal('spacer'),
  data: z.object({
    height: z.number().min(8).max(200).default(40),
  }),
});

const ColumnsBlock = BaseBlock.extend({
  type: z.literal('columns'),
  data: z.object({
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    content: z.array(z.array(BlockSchema)), // content[colIndex] = blocks[]
    gap: z.enum(['sm', 'md', 'lg']).default('md'),
    equalHeight: z.boolean().default(true),
  }),
});

const TabsBlock = BaseBlock.extend({
  type: z.literal('tabs'),
  data: z.object({
    tabs: z.array(z.object({
      label: z.string(),
      content: z.array(BlockSchema), // blocks inside this tab
    })),
  }),
});

// ─── Interactive Blocks ────────────────────
const AccordionBlock = BaseBlock.extend({
  type: z.literal('accordion'),
  data: z.object({
    items: z.array(z.object({
      title: z.string(),
      content: z.array(BlockSchema), // blocks inside accordion item
    })),
    allowMultiple: z.boolean().default(true),
  }),
});

const CollapseBlock = BaseBlock.extend({
  type: z.literal('collapse'),
  data: z.object({
    title: z.string(),
    content: z.array(BlockSchema),
    defaultOpen: z.boolean().default(false),
  }),
});

const TimelineBlock = BaseBlock.extend({
  type: z.literal('timeline'),
  data: z.object({
    events: z.array(z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
    })),
  }),
});

const TableBlock = BaseBlock.extend({
  type: z.literal('table'),
  data: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    striped: z.boolean().default(true),
    compact: z.boolean().default(false),
  }),
});

// ─── Conversion Blocks ─────────────────────
const CTABlock = BaseBlock.extend({
  type: z.literal('cta'),
  data: z.object({
    heading: z.string(),
    text: z.string().optional(),
    buttonText: z.string(),
    buttonUrl: z.string(),
    style: z.enum(['primary', 'secondary', 'minimal', 'bordered']).default('primary'),
    backgroundMediaId: z.string().optional(),
  }),
});

const PricingBlock = BaseBlock.extend({
  type: z.literal('pricingTable'),
  data: z.object({
    plans: z.array(z.object({
      name: z.string(),
      price: z.string(),
      period: z.string().optional(),
      description: z.string().optional(),
      features: z.array(z.string()),
      cta: z.object({ text: z.string(), url: z.string() }),
      highlighted: z.boolean().default(false),
    })),
  }),
});

const TestimonialBlock = BaseBlock.extend({
  type: z.literal('testimonial'),
  data: z.object({
    testimonialId: z.string(),  // Reference đến testimonials table
    style: z.enum(['card', 'inline', 'large']).default('card'),
  }),
});

// ─── Recursive Block Schema ────────────────
const BlockSchema = z.discriminatedUnion('type', [
  HeadingBlock, ParagraphBlock, QuoteBlock, ListBlock, CodeBlock, CalloutBlock,
  ImageBlock, VideoBlock, GalleryBlock, CarouselBlock, BeforeAfterBlock,
  DividerBlock, SpacerBlock, ColumnsBlock, TabsBlock,
  AccordionBlock, CollapseBlock, TimelineBlock, TableBlock,
  CTABlock, PricingBlock, TestimonialBlock,
]);

export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block['type'];

// Content gốc của 1 bài viết hoặc khóa học là array của blocks
export const ContentSchema = z.array(BlockSchema);
export type Content = z.infer<typeof ContentSchema>;
```

### 9.5 Admin Block Editor UX

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☰ Bài viết mới                              [Lưu nháp] [Xuất bản] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  + Thêm Block  ▼                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐  │ │
│  │  │ 📝 Typography    🖼️ Media      📐 Layout    🎯 Actions   │  │ │
│  │  │ ─────────────    ────────      ────────    ─────────    │  │ │
│  │  │ • Heading        • Image       • Divider   • CTA        │  │ │
│  │  │ • Paragraph      • Video       • Spacer    • Pricing    │  │ │
│  │  │ • Quote          • Gallery     • Columns   • Newsletter │  │ │
│  │  │ • List           • Carousel    • Tabs      • Testimonial│  │ │
│  │  │ • Code           • Before/After             • FAQ Block  │  │ │
│  │  │ • Callout                                                │  │ │
│  │  │ • Table                                                  │  │ │
│  │  │ • Timeline                                               │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Block Toolbar ────────────────────────────────────────────────┐ │
│  │ ⠿⋮⋮ (drag handle)  Heading ▼  H2 ▼  ⬅️ ➡️ ↗️  ───  🗑️         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Bắt đầu sự nghiệp quay dựng video của bạn                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Block Toolbar ────────────────────────────────────────────────┐ │
│  │ ⠿⋮⋮  Paragraph ▼  ⬅️ ➡️ ↗️  ───  🗑️                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Từ một người không biết gì về quay dựng, tôi đã xây dựng...   │ │
│  │  [con trỏ đang ở đây]                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Hover + ──────────────────────────────────────────────────────┐ │
│  │            +                                                    │ │
│  │  ────────────────────────────────────────────────────────────  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Block Toolbar ────────────────────────────────────────────────┐ │
│  │ ⠿⋮⋮  Image ▼  [🖼️ Chọn ảnh]  Full ▼  ⬅️ ➡️  ───  🗑️        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │    ┌──────────────────────────────────────────┐                │ │
│  │    │                                          │                │ │
│  │    │          [ Ảnh từ Media Library ]        │                │ │
│  │    │                                          │                │ │
│  │    └──────────────────────────────────────────┘                │ │
│  │    Caption: [Quy trình quay dựng video...          ]           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Tính năng chính của Block Editor:
- **Drag & Drop** để sắp xếp lại blocks
- **Hover menu** hiện toolbar (định dạng, xóa, di chuyển)
- **+ button giữa các blocks** để thêm block mới
- **Slash command `/`** để thêm block nhanh (gõ `/heading`, `/image`, `/video`...)
- **Preview realtime** bên cạnh (split view: Editor | Preview)

### 9.6 Block Renderer — Frontend React Component

```typescript
// apps/web/src/components/blocks/BlockRenderer.tsx
import type { Block } from '@workspace/types';
import { HeadingBlock, ParagraphBlock, QuoteBlock, ListBlock, CodeBlock, CalloutBlock } from './typography';
import { ImageBlock, VideoBlock, GalleryBlock, CarouselBlock, BeforeAfterBlock } from './media';
import { DividerBlock, SpacerBlock, ColumnsBlock, TabsBlock } from './layout';
import { AccordionBlock, CollapseBlock, TimelineBlock, TableBlock } from './interactive';
import { CTABlock, PricingBlock, TestimonialBlock } from './conversion';

const BLOCK_COMPONENTS: Record<Block['type'], React.ComponentType<{ data: any }>> = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  quote: QuoteBlock,
  list: ListBlock,
  code: CodeBlock,
  callout: CalloutBlock,
  image: ImageBlock,
  video: VideoBlock,
  gallery: GalleryBlock,
  carousel: CarouselBlock,
  beforeAfter: BeforeAfterBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  columns: ColumnsBlock,
  tabs: TabsBlock,
  accordion: AccordionBlock,
  collapse: CollapseBlock,
  timeline: TimelineBlock,
  table: TableBlock,
  cta: CTABlock,
  pricingTable: PricingBlock,
  testimonial: TestimonialBlock,
};

interface Props {
  blocks: Block[];
}

export function BlockRenderer({ blocks }: Props) {
  return (
    <div className="block-content">
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }
        return <Component key={block.id} data={block.data} />;
      })}
    </div>
  );
}
```

**Mỗi block type là 1 component riêng** trong `apps/web/src/components/blocks/`. Có SCSS module riêng, animation GSAP riêng, responsive riêng.

### 9.7 Block Content áp dụng ở đâu?

| Entity | Dùng Block Content? | Ghi chú |
|---|---|---|
| **Blog posts** (`posts.content_blocks`) | Có | Thay thế `content_html` cũ bằng blocks |
| **Course detail** | Có | Mô tả khóa học, phần giới thiệu |
| **Course lessons** (`course_lessons.content_blocks`) | Có | Nội dung từng bài học (thêm cột `content_blocks`) |
| **Homepage sections** | Có thể | Nếu muốn admin tự build layout homepage |
| **Landing pages** | Có thể | Nếu sau này cần custom landing page |

### 9.8 Ví dụ: 1 bài blog dùng Blocks

```json
{
  "blocks": [
    {
      "id": "b1",
      "type": "heading",
      "data": { "level": 1, "text": "Quay video bằng điện thoại chuyên nghiệp", "alignment": "left" }
    },
    {
      "id": "b2",
      "type": "paragraph",
      "data": { "text": "Trong thời đại nội dung số...", "alignment": "left", "dropCap": true }
    },
    {
      "id": "b3",
      "type": "image",
      "data": { "mediaId": "img_abc123", "alt": "Quay video điện thoại", "caption": "Hình 1: Setup quay video với điện thoại", "width": "wide" }
    },
    {
      "id": "b4",
      "type": "heading",
      "data": { "level": 2, "text": "1. Chuẩn bị thiết bị", "alignment": "left" }
    },
    {
      "id": "b5",
      "type": "list",
      "data": { "style": "unordered", "items": ["Điện thoại có camera tốt", "Tripod chống rung", "Đèn ring light", "Microphone rời"] }
    },
    {
      "id": "b6",
      "type": "callout",
      "data": { "text": "💡 Mẹo: Không cần mua thiết bị đắt tiền. Một chiếc iPhone 11 trở lên là đủ để bắt đầu!", "variant": "tip" }
    },
    {
      "id": "b7",
      "type": "video",
      "data": { "mediaId": "vid_yt_xyz", "caption": "Video hướng dẫn setup", "aspectRatio": "16:9" }
    },
    {
      "id": "b8",
      "type": "accordion",
      "data": {
        "items": [
          { "title": "Tôi nên dùng điện thoại nào?", "content": [{ "id": "ba", "type": "paragraph", "data": { "text": "..." } }] },
          { "title": "Có cần mua thêm lens không?", "content": [{ "id": "bb", "type": "paragraph", "data": { "text": "..." } }] }
        ],
        "allowMultiple": true
      }
    },
    {
      "id": "b9",
      "type": "cta",
      "data": { "heading": "Sẵn sàng bắt đầu?", "text": "Đăng ký khóa học ngay hôm nay", "buttonText": "Đăng ký ngay", "buttonUrl": "/khoa-hoc/xyz", "style": "primary" }
    }
  ]
}
```

---

## 10. Khóa Học Chi Tiết Kiểu Udemy/Coursera

### 10.0 UX Mục tiêu: Học viên biết chính xác mình sẽ học gì

Trang detail khóa học phải trả lời được **5 câu hỏi của học viên**:

| # | Câu hỏi | Cách hiển thị |
|---|---|---|
| 1 | **Khóa học này dành cho ai?** | Prerequisites + Target audience block |
| 2 | **Tôi sẽ học được những gì?** | Learning outcomes (bullet checklist) |
| 3 | **Nội dung từng phần ra sao?** | Curriculum accordion (modules → lessons) |
| 4 | **Giảng viên là ai?** | Instructor profile card |
| 5 | **Học viên khác nói gì?** | Testimonials + ratings |

### 10.1 Curriculum View — Trái tim của trang khóa học

```
┌──────────────────────────────────────────────────────────────────────┐
│  📚 NỘI DUNG KHÓA HỌC                                               │
│  ─────────────────────────────────────────────────────────────────── │
│  8 Chương • 42 Bài giảng • Tổng 12h 30ph                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ CHƯƠNG 1: Chiến lược xây kênh TikTok triệu view (4 bài)     │ │
│  │   ──────────────────────────────────────────────────────────  │ │
│  │   ⏹ Bài 1.1  Giới thiệu về TikTok và cơ hội sáng tạo   05:32 │ │
│  │          👁 Preview (free)                                     │ │
│  │   ⏹ Bài 1.2  Phân tích kênh TikTok thành công          08:15 │ │
│  │   ⏹ Bài 1.3  Xác định ngách nội dung của bạn           06:44 │ │
│  │   ⏹ Bài 1.4  Bài tập: Phân tích 5 kênh yêu thích       15:00 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▶ CHƯƠNG 5: Lựa chọn thiết bị phù hợp (6 bài)                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▶ CHƯƠNG 8: Làm chủ điện thoại và phụ kiện (7 bài)            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ...                                                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▶ CHƯƠNG 21: Định hướng kiếm tiền từ TikTok (3 bài)           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Database Schema Mở Rộng cho Curriculum

```sql
-- ============================================================
-- Bảng courses — bổ sung các trường mới cho learning outcomes
-- ============================================================
ALTER TABLE courses ADD COLUMN learning_outcomes TEXT;      -- JSON array: ["Học được A", "Học được B", ...]
ALTER TABLE courses ADD COLUMN prerequisites TEXT;          -- JSON array hoặc text
ALTER TABLE courses ADD COLUMN target_audience TEXT;        -- Đối tượng học viên
ALTER TABLE courses ADD COLUMN total_duration_seconds INTEGER; -- Tổng thời lượng (tính tự động từ lessons)
ALTER TABLE courses ADD COLUMN total_lessons INTEGER;       -- Tổng số bài (tính tự động)
ALTER TABLE courses ADD COLUMN language TEXT DEFAULT 'vi';  -- Ngôn ngữ
ALTER TABLE courses ADD COLUMN level TEXT;                  -- 'beginner' | 'intermediate' | 'advanced' | 'all'
ALTER TABLE courses ADD COLUMN certificate INTEGER DEFAULT 0; -- Có cấp chứng chỉ không?
ALTER TABLE courses ADD COLUMN content_blocks TEXT;         -- Block content cho phần giới thiệu khóa học

-- ============================================================
-- Bảng course_modules — bổ sung
-- ============================================================
ALTER TABLE course_modules ADD COLUMN description TEXT;     -- Mô tả ngắn về chương này
ALTER TABLE course_modules ADD COLUMN learning_outcomes TEXT; -- JSON array outcomes cho từng chương

-- ============================================================
-- Bảng course_lessons — bổ sung
-- ============================================================
ALTER TABLE course_lessons ADD COLUMN description TEXT;     -- Mô tả ngắn về bài học
ALTER TABLE course_lessons ADD COLUMN content_blocks TEXT;  -- Block content cho bài học
ALTER TABLE course_lessons ADD COLUMN type TEXT DEFAULT 'video';
  -- 'video' | 'text' | 'quiz' | 'assignment' | 'resource'
ALTER TABLE course_lessons ADD COLUMN resources TEXT;       -- JSON: [{ name, url, type: 'pdf'|'link'|'file' }]
ALTER TABLE course_lessons ADD COLUMN is_published INTEGER DEFAULT 0;

-- ============================================================
-- Bảng instructors (giảng viên) — MỚI
-- ============================================================
CREATE TABLE instructors (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  title       TEXT,                -- VD: "Filmmaker | Content Creator"
  bio         TEXT,                -- Giới thiệu ngắn
  avatar_url  TEXT,
  rating      REAL DEFAULT 5.0,
  student_count INTEGER DEFAULT 0,
  course_count  INTEGER DEFAULT 0,
  social_links  TEXT,              -- JSON: [{ platform, url }]
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Bảng course_instructors (nhiều-nhiều) — MỚI
-- ============================================================
CREATE TABLE course_instructors (
  course_id     TEXT NOT NULL REFERENCES courses(id),
  instructor_id TEXT NOT NULL REFERENCES instructors(id),
  PRIMARY KEY (course_id, instructor_id)
);
```

### 10.3 Zod Schema bổ sung

```typescript
// packages/types/src/schemas/course-extended.ts

export const CourseExtendedSchema = CourseSchema.extend({
  // Learning structure
  learningOutcomes: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  language: z.string().default('vi'),
  certificate: z.boolean().default(false),

  // Computed (từ DB, không cần admin nhập)
  totalDurationSeconds: z.number().optional(),
  totalLessons: z.number().optional(),
  totalModules: z.number().optional(),

  // Block content cho giới thiệu khóa học
  contentBlocks: z.array(BlockSchema).optional(),

  // Quan hệ
  instructors: z.array(InstructorSchema).optional(),
  fullModules: z.array(CourseModuleExtendedSchema).optional(),
});

export const InstructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(0).max(5).default(5),
  studentCount: z.number().default(0),
  courseCount: z.number().default(0),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
  })).optional(),
});

export const CourseModuleExtendedSchema = CourseModuleSchema.extend({
  description: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  totalDuration: z.number().optional(),  // Tổng giây của tất cả lessons
  totalLessons: z.number().optional(),
  lessons: z.array(CourseLessonExtendedSchema),
});

export const CourseLessonExtendedSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['video', 'text', 'quiz', 'assignment', 'resource']).default('video'),
  duration: z.string().optional(),          // "05:32"
  durationSeconds: z.number().optional(),
  videoUrl: z.string().optional(),
  contentBlocks: z.array(BlockSchema).optional(),  // Cho type='text'
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(['pdf', 'link', 'file', 'image']),
  })).optional(),
  isFreePreview: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().default(0),
});
```

### 10.4 Trang Course Detail — Layout đầy đủ kiểu Udemy

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────────────────────────────────────────┐  ┌──────────────────┐ │
│  │                                          │  │                  │ │
│  │          TRAILER VIDEO (YouTube)          │  │  💰 1.599.000đ   │ │
│  │                                          │  │                  │ │
│  └──────────────────────────────────────────┘  │  ⭐ 4.9 (120+)    │ │
│                                                │  👥 3.600+ hv     │ │
│  ┌──────────────────────────────────────────┐  │  🕐 12h30ph      │ │
│  │ 🏷 KHÓA HỌC • 42 bài • Cơ bản → Cao cấp │  │  📚 8 Chương     │ │
│  └──────────────────────────────────────────┘  │  🌐 Tiếng Việt   │ │
│                                                │  🏅 Có chứng chỉ  │ │
│  # Làm Chủ Tư Duy Chỉnh Màu Trong 2H          │                  │ │
│                                                │  [ĐĂNG KÝ NGAY]  │ │
│  Khóa học chia sẻ về làm màu, tư duy về       │                  │ │
│  ánh sáng, và phối màu...                      │  💳 Thanh toán... │ │
│                                                │  7 ngày hoàn tiền │ │
│  ─────────────────────────────────────────────│                  │ │
│                                                └──────────────────┘ │
│  ▶ Sticky Sidebar (scroll theo)                                     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📋 BẠN SẼ HỌC ĐƯỢC GÌ? (Learning Outcomes)                         │
│  ─────────────────────────────────────────                           │
│  ┌─────────────────────┐ ┌─────────────────────┐                     │
│  │ ✅ Làm chủ tư duy   │ │ ✅ Sử dụng thành    │                     │
│  │    màu sắc trong    │ │    thạo các công cụ │                     │
│  │    video chuyên nghiệp│ │   chỉnh màu        │                     │
│  └─────────────────────┘ └─────────────────────┘                     │
│  ┌─────────────────────┐ ┌─────────────────────┐                     │
│  │ ✅ Tạo ra những     │ │ ✅ Nâng tầm chất    │                     │
│  │    thước phim đẹp   │ │    lượng video của  │                     │
│  │    điện ảnh         │ │    bạn lên đẳng cấp │                     │
│  └─────────────────────┘ └─────────────────────┘                     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📚 NỘI DUNG KHÓA HỌC                                              │
│  ─────────────────────                                              │
│                                                                      │
│  8 Chương • 42 Bài giảng • 12h 30ph                                  │
│  [▼ Thu gọn tất cả]  [▶ Mở rộng tất cả]                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ▶ CHƯƠNG 1: Nhập môn tư duy màu sắc                    4 bài │   │
│  │     ─────────────────────────────────────────────────────     │   │
│  │     Trong chương này bạn sẽ hiểu được bản chất của màu sắc   │   │
│  │     và cách nó ảnh hưởng đến cảm xúc người xem.              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ▼ CHƯƠNG 2: Ánh sáng — Nền tảng của mọi thước phim     6 bài │   │
│  │     ─────────────────────────────────────────────────────     │   │
│  │     ✅ Học được: Hiểu ánh sáng, cân bằng trắng, exposure     │   │
│  │     ─────────────────────────────────────────────────────     │   │
│  │     ⏹ 2.1  Ánh sáng tự nhiên vs nhân tạo             08:15  │   │
│  │           Cách tận dụng ánh sáng có sẵn để quay video đẹp    │   │
│  │     ⏹ 2.2  Cân bằng trắng (White Balance)           06:44  │   │
│  │     ⏹ 2.3  Exposure và cách đo sáng                  10:22  │   │
│  │     ⏹ 2.4  3-point lighting setup                    12:05  │   │
│  │          👁 Preview (free)                                   │   │
│  │     ⏹ 2.5  Thực hành: Setup ánh sáng cho vlog        20:00  │   │
│  │     ⏹ 2.6  Bài tập: Chụp 3 bức ảnh với 3 điều kiện ánh│   │   │
│  │            sáng khác nhau                            15:00  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ... (các chương còn lại)                                           │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  👨‍🏫 GIẢNG VIÊN                                                    │
│  ─────────────                                                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ┌────┐                                                       │   │
│  │  │    │  Minh Travel                                          │   │
│  │  │ 👤 │  Filmmaker | Content Creator | 8+ năm kinh nghiệm    │   │
│  │  └────┘                                                       │   │
│  │                                                               │   │
│  │  ⭐ 4.9 đánh giá  •  👥 15,000+ học viên  •  🎬 12 khóa học  │   │
│  │                                                               │   │
│  │  Minh nổi bật với phong cách quay và biên tập video độc đáo  │   │
│  │  của mình, anh đã truyền cảm hứng cho rất nhiều bạn trẻ...   │   │
│  │                                                               │   │
│  │  🌐 YouTube  📷 Instagram  🎵 TikTok  📘 Facebook              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ⭐ ĐÁNH GIÁ CỦA HỌC VIÊN                                          │
│  ──────────────────────────                                         │
│                                                                      │
│  ┌──────────────────────┐ ┌──────────────────────┐                   │
│  │ ⭐⭐⭐⭐⭐               │ │ ⭐⭐⭐⭐⭐               │                   │
│  │ "Khóa học đã giúp    │ │ "Kiến thức thực      │                   │
│  │  shop tôi tăng doanh │ │  chiến, dễ hiểu..."  │                   │
│  │  số gấp 3 lần..."    │ │                      │                   │
│  │ — CEO Học Viện Topmax│ │ — Nam Phạm, Creator  │                   │
│  └──────────────────────┘ └──────────────────────┘                   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ❓ CÂU HỎI THƯỜNG GẶP                                             │
│  ─────────────────────                                               │
│                                                                      │
│  ▶ Ở đây có dạy về quay máy chuyên dụng không?                       │
│  ▶ Tôi có thể xem các khóa học ở đâu?                                │
│  ▶ Khi nào tôi có quyền truy cập?                                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  🚀 SẴN SÀNG BẮT ĐẦU?                                        │   │
│  │  Đăng ký ngay hôm nay và nhận ưu đãi giảm 90%!              │   │
│  │  [ĐĂNG KÝ NGAY — 1.599.000đ]                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.5 Admin Course Editor — Curriculum Builder

```
┌──────────────────────────────────────────────────────────────────────┐
│  ⚙️ Chỉnh sửa khóa học: Làm Chủ Tư Duy Chỉnh Màu                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Thông tin] [Curriculum] [Giới thiệu] [Đánh giá] [Cài đặt]         │
│  ─────────────────────────────────────────────                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LEARNING OUTCOMES                                            │   │
│  │  ─────────────────                                            │   │
│  │  ✅ Làm chủ tư duy màu sắc trong video chuyên nghiệp     [✕] │   │
│  │  ✅ Sử dụng thành thạo các công cụ chỉnh màu              [✕] │   │
│  │  [+ Thêm outcome]                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ CURRICULUM ────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ┌─ CHƯƠNG 1: Nhập môn tư duy màu sắc ──────────────────┐  │   │
│  │  │  Mô tả chương: [Trong chương này bạn sẽ hiểu...     ]  │  │   │
│  │  │  ─────────────────────────────────────────────────────  │  │   │
│  │  │  ⠿⋮⋮ Bài 1.1  [Giới thiệu tổng quan            ]  🎬  │  │   │
│  │  │           Video URL: [https://youtube.com/...]         │  │   │
│  │  │           Duration: [08:15]  ☑ Free Preview             │  │   │
│  │  │  ─────────────────────────────────────────────────────  │  │   │
│  │  │  ⠿⋮⋮ Bài 1.2  [Vòng tròn màu sắc cơ bản        ]  🎬  │  │   │
│  │  │  ⠿⋮⋮ Bài 1.3  [Tâm lý học màu sắc             ]  📝  │  │   │
│  │  │  ⠿⋮⋮ Bài 1.4  [Bài tập thực hành               ]  📋  │  │   │
│  │  │  ─────────────────────────────────────────────────────  │  │   │
│  │  │  [+ Thêm bài học]                                       │  │   │
│  │  │  ─────────────────────────────────────────────────────  │  │   │
│  │  │  Learning outcomes chương này:                           │  │   │
│  │  │  ✅ Hiểu được bản chất của màu sắc               [✕]   │  │   │
│  │  │  [+ Thêm]                                               │  │   │
│  │  └────────────────────────────────────────────────────────  │  │
│  │                       ↕ Drag để sắp xếp lại                 │  │
│  │  [+ Thêm chương]                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ GIẢNG VIÊN ───────────────────────────────────────────────┐    │
│  │  Chọn giảng viên: [Minh Travel ▼]                           │    │
│  │  [+ Thêm giảng viên mới]                                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [Lưu nháp]  [Xem preview]  [Xuất bản]                              │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.6 So sánh: Trước vs Sau

| Khía cạnh | Hiện tại (mock + hardcode) | Sau (Dynamic + Block + Curriculum) |
|---|---|---|
| **Nội dung bài viết** | 1 ô `<textarea>` HTML đơn giản | Block editor 21+ block types, drag & drop |
| **Mô tả khóa học** | 1 dòng text ngắn | Block content đầy đủ (heading, ảnh, video, CTA...) |
| **Curriculum** | 1 array `modules` với `num, title, desc` — không có lessons | Accordion curriculum: modules → lessons → duration, preview, resources |
| **Learning outcomes** | Không có | Grid 4-6 outcomes checklist |
| **Giảng viên** | Không có | Instructor profile card (ảnh, bio, rating, social links) |
| **Bài học** | Không có nội dung | Video/text/quiz/assignment + resources download |
| **Preview miễn phí** | Không có | Một số bài học được đánh dấu free preview |
| **Chứng chỉ** | Không có | Có/không, hiển thị badge |
| **Cấp độ** | Không có | Beginner / Intermediate / Advanced / All |
| **Tái sử dụng block** | Không | Cùng 1 block type, cấu hình khác nhau |
| **SEO cho content** | HTML thô | JSON có cấu trúc → tạo TOC, breadcrumb, FAQ schema tự động |
| **Mở rộng sau này** | Khó (phải sửa code) | Dễ (thêm BlockType mới là xong) |

### 10.7 API Endpoints bổ sung

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/courses/:id/curriculum` | Lấy full curriculum (modules + lessons) |
| `PUT` | `/api/courses/:id/curriculum/reorder` | Sắp xếp lại modules/lessons |
| `GET` | `/api/instructors` | List giảng viên |
| `POST` | `/api/instructors` | Thêm giảng viên |
| `PUT` | `/api/instructors/:id` | Sửa giảng viên |
| `GET` | `/api/blocks/templates` | List block templates |
| `POST` | `/api/blocks/templates` | Lưu block template |

---

## Kết luận (Cập nhật)

Sau khi hoàn thành blueprint này:

- **Admin có thể thay đổi mọi nội dung** trên website mà không cần chạm vào code
- **210 items** được chuyển từ static → dynamic
- **13 bảng DB** được thiết kế đầy đủ (mở rộng từ 8 bảng gốc)
- **~55 API endpoints** phủ toàn bộ CRUD
- **15 admin pages** quản lý toàn diện
- **30 ảnh** được migrate vào Media Library
- **Site Settings** với ~55 keys cho phép tùy biến mọi text, link, brand
- **21+ Block Types** cho content editor thay thế Rich Text truyền thống
- **Curriculum Builder** kiểu Udemy/Coursera: modules → lessons → preview → resources
- **apps/media** CDN-ready microservice: upload, optimize (Sharp), variants, YouTube, external URL
- **Type Safety 100%** từ DB → API → Frontend nhờ Zod + Hono RPC
