# Planning 05: Media Pipeline (apps/media)

**Part of:** Delivery Planning
**Ref:** Spec 04, DYNAMIC-CONVERSION-BLUEPRINT.md Section 7
**Status:** Draft

---

## 1. Why Separate Service?

| Reason | Detail |
|--------|--------|
| IO-bound | Sharp processing is CPU/IO intensive. Don't block API requests. |
| Independent scaling | Scale `apps/media` independently of `apps/api`. |
| Nginx static bypass | Nginx serves variant files directly from disk, bypassing Bun for 99% of requests. |
| Different cache | Media: immutable 1 year. API: 60 seconds. |

---

## 2. Three Media Sources

```
apps/media (port 3002)
     │
     ├── UPLOAD:     File from admin → validate → store → optimize → variants
     ├── YOUTUBE:    Video URL → extract ID → oEmbed → fetch thumbnail → store
     └── EXTERNAL:   URL from WordPress → HEAD check → save reference (no download)
```

---

## 3. Upload Pipeline (5 Steps)

```typescript
// POST /upload (multipart/form-data)
// Step 1: Validate — magic bytes, MIME whitelist, size limit (50MB image, 500MB video), extension check
// Step 2: Store    — save original to /data/uploads/YYYY/MM/{uuid}.{ext}
// Step 3: Optimize — Sharp: resize max 2560px, strip EXIF, generate WebP (q82) + AVIF (q65)
// Step 4: Variants — 5 pre-generated sizes:
//    micro(16px webp), thumbnail(400px webp), medium(800px webp), large(1400px webp), og(1200px jpeg)
// Step 5: DB       — INSERT media + media_variants, return { id, url, variants }
```

---

## 4. Image Serving

### Dev mode (apps/media handles everything)
```
GET /img/{id}/thumbnail      → serve pre-generated 400px webp
GET /img/{id}?w=600&f=avif   → on-the-fly resize, cache result on disk
GET /img/{id}                → auto-detect format from Accept header, serve medium
```

### Production (Nginx static serving)
```nginx
location /img/ {
    alias /data/variants/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri @media_service;  # Fallback to Bun if file not pre-generated
}
location @media_service {
    proxy_pass http://127.0.0.1:3002;
    proxy_cache dynamic_resize;
    proxy_cache_valid 200 365d;
}
```

---

## 5. CDN (Cloudflare Free Plan)

```
Browser → Cloudflare Edge (Hanoi/HCMC)
            │
            ├── Cache HIT → serve from edge (~5ms)
            └── Cache MISS → origin pull → VPS → Nginx → Disk
```

Setup: DNS CNAME, SSL Full, Cache Rules: `/img/*` cache 1 year, `/upload` bypass.

---

## 6. YouTube Integration

```
POST /external { source: "youtube", youtubeUrl: "..." }
  → Parse video ID from URL
  → Fetch title/thumbnail via YouTube oEmbed API
  → Download maxresdefault.jpg
  → Run through same optimize + variants pipeline
  → Save media record with source='youtube', youtube_id
```

---

## 7. Security Checklist

| # | Measure | Implementation |
|---|---------|---------------|
| 1 | Validate file by magic bytes | Read first 12 bytes, detect real MIME |
| 2 | Whitelist MIME types | image/jpeg, image/png, image/webp, image/avif, image/gif, image/svg+xml, video/mp4, application/pdf |
| 3 | Size limits | 50MB image, 500MB video, 100MB document |
| 4 | Strip EXIF/GPS | Sharp `.withMetadata({})` — remove all |
| 5 | Path traversal prevention | UUID filenames only, never use original name for disk path |
| 6 | Auth on upload/delete | JWT admin middleware |
| 7 | Rate limiting | Max 20 uploads/minute for admin |
| 8 | SVG sanitization | If SVG support needed, strip script tags |
