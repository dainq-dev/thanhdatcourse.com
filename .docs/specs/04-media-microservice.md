# Spec 04: Media Microservice (apps/media)

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 7  

---

## Feature Description

Media microservice chạy độc lập trên port 3002, chịu trách nhiệm: upload file, optimize ảnh (Sharp), pre-generate variants, serve ảnh với on-the-fly resize, quản lý YouTube embeds, external URL references. CDN-friendly URLs, immutable caching. Tích hợp Media Library modal cho Admin Dashboard.

**3 loại nguồn media:**
1. **Upload** — file tự upload lên server, optimize, variants
2. **YouTube** — lưu reference YouTube video, tự fetch thumbnail
3. **External URL** — lưu URL ngoài, không download

---

## User Stories

### US-04.1: Admin upload file lên Media Library

> **As an** Administrator  
> **I want to** upload images, videos, and documents to a centralized media library  
> **So that** I can reuse them across courses, articles, and site settings

**Acceptance Criteria:**
- Drag & drop zone hoặc click để chọn file
- Hỗ trợ: JPEG, PNG, WebP, AVIF, GIF, SVG (ảnh); MP4, WebM (video); PDF (document)
- Max size: 50MB ảnh, 500MB video, 100MB document
- Upload progress bar (%)
- Sau upload: tự động optimize + tạo variants (ảnh)
- Hiển thị thumbnail preview trong grid ngay sau upload
- Upload nhiều file cùng lúc (batch)

### US-04.2: Image Optimization Pipeline (Sharp)

> **Automated System**  
> **I want to** automatically optimize images after upload  
> **So that** they load fast on all devices

**Acceptance Criteria:**
- Resize ảnh gốc về max 2560px width (không phóng to ảnh nhỏ hơn)
- Convert sang WebP (quality 82%) — làm ảnh chính
- Convert sang AVIF (quality 65%) — cho browser hỗ trợ
- Strip tất cả EXIF/GPS/IPTC/XMP metadata
- Chroma subsampling 4:2:0 cho JPEG
- Pre-generate 5 variants:
  - `micro` — 16px webp q30 (blur placeholder cho lazy loading)
  - `thumbnail` — 400px webp q80 (card grid)
  - `medium` — 800px webp q82 (default render)
  - `large` — 1400px webp q82 (hero/cover)
  - `og` — 1200px jpeg q85 (Open Graph)

### US-04.3: Serve ảnh với On-the-Fly Resize

> **As a** Frontend Developer  
> **I want to** request images at any size via query params  
> **So that** I can implement responsive images with exact dimensions

**Acceptance Criteria:**
- `GET /img/:id` → trả variant medium (hoặc detect từ Accept header)
- `GET /img/:id/:variant` → trả variant đã pre-generate (thumbnail, medium, large, og, micro)
- `GET /img/:id?w=600&f=webp&q=80` → resize on-the-fly
- Params hỗ trợ: `w` (width), `h` (height), `f` (format: webp/avif/jpeg/png), `q` (quality)
- Dynamic variant được cache vĩnh viễn trên disk sau lần generate đầu
- Cache-Control: `public, max-age=31536000, immutable`
- ETag dựa trên content hash
- Accept header detection: `image/avif` → trả AVIF, `image/webp` → trả WebP

### US-04.4: Nginx Static File Serving (Production)

> **As a** DevOps Engineer  
> **I want to** serve media files directly from Nginx disk cache  
> **So that** the Bun process is not involved in serving static files

**Acceptance Criteria:**
- Nginx `location /img/` → alias đến `/data/variants/`
- `try_files $uri @media_service` — nếu file tồn tại trên disk → serve trực tiếp
- Nếu chưa tồn tại → proxy_pass apps/media để resize lần đầu
- `proxy_cache` cho dynamic resize với TTL 365 ngày
- Upload endpoint luôn qua apps/media (có auth)

### US-04.5: YouTube Media Management

> **As an** Administrator  
> **I want to** add YouTube videos to the Media Library  
> **So that** I can embed them in courses and articles

**Acceptance Criteria:**
- POST `/external` với body `{ source: "youtube", youtubeUrl: "..." }`
- Tự động parse video ID từ URL (hỗ trợ: youtube.com/watch?v=, youtu.be/, youtube.com/embed/)
- Fetch metadata từ YouTube oEmbed API (title, author_name)
- Tải thumbnail maxresdefault về → lưu làm media variant
- Lưu record: source='youtube', youtube_id, thumbnail_media_id

### US-04.6: External URL Media

> **As an** Administrator  
> **I want to** reference external images without uploading  
> **So that** I can keep using legacy WordPress images temporarily

**Acceptance Criteria:**
- POST `/external` với body `{ source: "external_url", url: "https://...", altText: "..." }`
- Validate URL reachable (HEAD request)
- Lưu metadata, KHÔNG download file
- Có option "Import" để download về local storage sau này
- Frontend `ResponsiveImage` component xử lý external URL riêng

### US-04.7: Media Library Modal (tái sử dụng)

> **As an** Administrator  
> **I want to** open the Media Library from any form that needs images  
> **So that** I can select media without leaving my current context

**Acceptance Criteria:**
- Modal overlay full-screen hoặc side panel
- Grid view ảnh (thumbnails), search, filter by type (image/video/youtube/document)
- Click ảnh → select → modal closes → returns mediaId/URL về form gọi nó
- Có tab "Upload" trong modal để upload ảnh mới ngay tại chỗ
- Pagination hoặc infinite scroll
- Có thể select nhiều ảnh (cho Gallery block)

### US-04.8: Batch Import từ WordPress

> **As an** Administrator  
> **I want to** import existing WordPress images in bulk  
> **So that** I can migrate all 30 legacy images to the new system

**Acceptance Criteria:**
- POST `/api/media/import-external` với array URLs
- Download từng ảnh, optimize, tạo variants, insert DB
- Trả về mapping `{ old_url → new_media_id }`
- Progress indicator (X/30 imported)
- Skip ảnh đã import trước đó (dựa trên content hash)

---

## BDD Scenarios

```gherkin
Feature: Media Upload

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/media"

  Scenario: Upload a single image
    When I drag a valid JPEG file (2MB, 4000x3000) into the upload zone
    Then a progress bar should appear
    And the file should be validated (magic bytes, size, type)
    When upload completes
    Then the image should appear in the media grid
    And the image should be resized to max 2560px width
    And 5 variants should be created: micro, thumbnail, medium, large, og
    And EXIF data should be stripped
    And the original file should be preserved in /data/uploads/

  Scenario: Upload invalid file type
    When I try to upload a .exe file disguised as .jpg
    Then the validator should detect the real MIME type from magic bytes
    And the upload should be rejected with error "Unsupported file type"
    And status code should be 400

  Scenario: Upload file exceeding size limit
    When I try to upload a 60MB JPEG image
    Then the upload should be rejected with error "File too large. Max: 50MB"
    And status code should be 413

  Scenario: Upload batch of images
    When I select 5 JPEG files and drop them into the upload zone
    Then all 5 files should upload concurrently
    And 5 progress bars should appear
    When all uploads complete
    Then 5 thumbnails should appear in the media grid

  Scenario: Unauthorized upload
    Given I am NOT authenticated
    When I send POST "/upload" with a valid image file
    Then the response status should be 401
```

### Image Serving

```gherkin
Feature: Image Serving & Resize

  Scenario: Serve pre-generated variant
    Given media "abc-123" has a pre-generated "thumbnail" variant (400px webp)
    When I send GET "/img/abc-123/thumbnail"
    Then the response status should be 200
    And the content-type should be "image/webp"
    And the image width should be 400px
    And Cache-Control should be "public, max-age=31536000, immutable"

  Scenario: On-the-fly resize
    Given media "abc-123" is a 2000x1500 original
    When I send GET "/img/abc-123?w=600&f=avif&q=75"
    Then the response status should be 200
    And the content-type should be "image/avif"
    And the image width should be 600px
    And the variant should be saved to disk for future requests

  Scenario: Accept header detection
    Given the browser sends "Accept: image/avif"
    When I send GET "/img/abc-123"
    Then the response should serve the AVIF version
    Given the browser sends "Accept: image/webp"
    When I send GET "/img/abc-123"
    Then the response should serve the WebP version

  Scenario: Media not found
    Given media "non-existent" does not exist
    When I send GET "/img/non-existent"
    Then the response status should be 404
    And the response body should be a placeholder image or JSON error
```

### YouTube & External

```gherkin
Feature: YouTube & External Media

  Scenario: Add YouTube video
    Given I am authenticated as admin
    When I send POST "/external" with:
      { "source": "youtube", "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
    Then the response should contain:
      - source: "youtube"
      - youtube_id: "dQw4w9WgXcQ"
      - thumbnail_url (maxresdefault)
    And a thumbnail media record should be created

  Scenario: Add external URL
    Given I am authenticated as admin
    When I send POST "/external" with:
      { "source": "external_url", "url": "https://example.com/image.jpg", "altText": "Example" }
    Then the response should contain a media record with source "external_url"
    And the file should NOT be downloaded

  Scenario: Batch import WordPress images
    Given I am authenticated as admin
    When I send POST "/api/media/import-external" with:
      { "urls": ["https://old-site.com/img1.jpg", "https://old-site.com/img2.jpg"] }
    Then both images should be downloaded and optimized
    And the response should contain a mapping of old URL → new media ID
```

### Media Library Grid

```gherkin
Feature: Media Library UI

  Scenario: Grid view with search
    Given the database has 50 media items (mixed types)
    When I view the Media Library page
    Then I should see a grid of thumbnails (40 per page default)
    And images should show their optimized preview
    And YouTube items should show play button overlay
    When I type "logo" in the search box
    Then only media with "logo" in the original filename or alt text should appear

  Scenario: Delete media
    Given a media item exists in the library
    When I click on it and select "Delete"
    Then a confirmation dialog should appear: "Xóa media này? Các bài viết/khóa học tham chiếu đến nó sẽ bị ảnh hưởng."
    When I confirm
    Then the media record should be deleted from DB
    And all variant files should be deleted from disk
    And the original file should be deleted from /data/uploads/

  Scenario: Modal from another form
    Given I am editing a course and click "Chọn ảnh" for thumbnail
    Then the Media Library modal should open as an overlay
    When I select an image and click "Chọn"
    Then the modal should close
    And the thumbnail field should be populated with the selected media ID
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Runtime** | Hono on Bun, port 3002 |
| **Image Processing** | Sharp (`^0.33.3`) |
| **Storage** | `/data/uploads/` (originals), `/data/variants/` (generated) |
| **DB** | Drizzle ORM + SQLite — bảng `media` + `media_variants` |
| **Validation** | Magic bytes check (không tin extension/MIME từ client) |
| **Security** | Auth required cho upload/delete, rate limiting, strip metadata, SVG sanitize |
| **Nginx** | `try_files $uri @media_service` — serve static trực tiếp từ disk |
| **CDN** | Cloudflare free plan (hoặc BunnyCDN) — cache `/img/*` immutable |
| **Cache** | `Cache-Control: public, max-age=31536000, immutable` cho variants; `no-cache` cho API |
| **File naming** | UUID-based filenames, không dùng tên gốc (chống path traversal) |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/upload` | Admin | Upload file (multipart) |
| `GET` | `/img/:id` | Public | Serve default variant |
| `GET` | `/img/:id/:variant` | Public | Serve specific variant |
| `GET` | `/img/:id?w=&h=&f=&q=` | Public | On-the-fly resize |
| `POST` | `/external` | Admin | Add YouTube/external URL media |
| `GET` | `/api/media` | Admin | List media (search, filter, paginate) |
| `GET` | `/api/media/:id` | Admin | Get single media + variants |
| `DELETE` | `/api/media/:id` | Admin | Delete media + files |
| `PATCH` | `/api/media/:id` | Admin | Update alt_text |
| `POST` | `/api/media/import-external` | Admin | Batch import từ URLs |

---

## Dependencies

- **Spec 09:** Authentication (JWT for admin endpoints)
- **Spec 10:** Admin Dashboard Shell (Media Library page)
- **Spec 02:** Block Editor (Image/Video blocks open Media modal)
- **Spec 01:** Site Settings (logo, favicon fields open Media modal)
- **Blueprint section:** 7

---

## Next Steps

1. `/bdd-review` — Challenge spec
2. `/bdd-dev` — Implement: validator → storage → optimizer → variants → API → Nginx config
