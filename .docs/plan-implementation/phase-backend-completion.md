# Backend Completion Plan — ~90% → 100%

**Current:** 14 route files, 66 endpoints, 17 tables, 188+ tests, ~90% done
**Target:** 16 route files, ~75 endpoints, standardized interceptors, 100% done

---

## Phase B1: Standardize Interceptors & Exception Handler

### Task B1.1: Response Interceptor (Chuẩn hóa API Response)

Hiện tại mỗi route trả JSON format khác nhau. Cần 1 interceptor chuẩn hóa:

```typescript
// apps/api/src/middleware/response.ts
// Tất cả response đều wrap trong: { data, error, meta }
// Success: c.json({ data: result, meta: { total, page } })
// Error: handled by onError → { error: message, code: status }
```

**Update:** Tất cả route handler trả về `{ data }` thay vì raw object. `onError` đã có sẵn trong `index.ts`.

### Task B1.2: Rate Limit Middleware (Tái sử dụng)

Hiện tại rate limit chỉ có trong `leads.ts`. Tách ra middleware riêng:

```typescript
// apps/api/src/middleware/rate-limit.ts
// createRateLimiter({ maxRequests: 5, windowMs: 900000 })
// Dùng trong: login (5/15min), leads POST (3/hour)
```

### Task B1.3: Auth Middleware — Thêm Google OAuth

Thêm Google OAuth callback vào `routes/auth.ts`:
- `GET /api/auth/google` — redirect to Google consent
- `GET /api/auth/google/callback` — verify token, create/link user, return JWT
- User từ Google: role mặc định USER. Admin phải set manual trong DB.

---

## Phase B2: Missing API Endpoints

### Task B2.1: Instructor CRUD API

**File:** `apps/api/src/routes/instructors.ts`

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/api/instructors` | Public | List all |
| `GET` | `/api/instructors/:id` | Public | Get single |
| `POST` | `/api/instructors` | Admin | Create |
| `PUT` | `/api/instructors/:id` | Admin | Update |
| `DELETE` | `/api/instructors/:id` | Admin | Delete |
| `PUT` | `/api/courses/:id/instructors` | Admin | Assign instructors to course (body: { instructorIds: string[] }) |

**Tests:** 6 tests — CRUD + assign + list public

### Task B2.2: Media CRUD API (apps/media)

**File:** `apps/media/src/routes/media.ts`

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/api/media` | Admin | List (query: source, type, page, limit, search) |
| `GET` | `/api/media/:id` | Admin | Get single + variants |
| `PATCH` | `/api/media/:id` | Admin | Update alt_text |
| `DELETE` | `/api/media/:id` | Admin | Delete media + files + variants |

**Tests:** 5 tests — list, get, patch, delete, auth checks

### Task B2.3: YouTube External Media

**File:** `apps/media/src/routes/external.ts`

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `POST` | `/external` | Admin | Add YouTube/external URL media. Body: { source, url, altText } |

**Tests:** 3 tests — YouTube, external URL, invalid URL

---

## Phase B3: Migration Files + Quality

### Task B3.1: Drizzle Kit Migration Files

Tạo `apps/api/drizzle.config.ts` và chạy `drizzle-kit generate` để sinh migration SQL files. Commit vào git.

### Task B3.2: Fix LoginSchema Password Validation

`packages/types/src/schemas/auth.ts`: Đổi `password: z.string().min(1)` → `z.string().min(8)`.

### Task B3.3: Final Test Run + Report

```bash
cd apps/api && bun test        # All 200+ tests pass
cd apps/media && bun test       # All 40+ tests pass
```

---

## Implementation Order

```
B1.1 (Response Interceptor) → All routes updated
B1.2 (Rate Limit Middleware) → Reuse in login + leads
B2.1 (Instructor CRUD) → 6 endpoints + tests
B2.2 (Media CRUD) → 4 endpoints + tests
B2.3 (YouTube External) → 1 endpoint + tests
B1.3 (Google OAuth) → 2 endpoints
B3.1 (Migration files) → drizzle-kit generate
B3.2 (Fix password min) → 1 line change
B3.3 (Final test run) → Verify
```

**Ước tính:** 2-3 ngày cho toàn bộ.

---

## Sau khi hoàn thành: Backend 100%

| Metric | Hiện tại | Sau |
|--------|---------|-----|
| Route files | 14 | **16** |
| Tổng endpoints | 66 | **~80** |
| Test files | 23 | **~28** |
| Tests | 188+ | **220+** |
| Response chuẩn hóa | ❌ Mỗi route format riêng | ✅ `{ data, error, meta }` |
| Rate limit | ⚠️ Chỉ leads | ✅ Middleware tái sử dụng |
| Auth | ⚠️ Email/password only | ✅ + Google OAuth |
| Migration | ⚠️ Raw SQL exec | ✅ drizzle-kit files |
| Instructors | ❌ No API | ✅ Full CRUD |
| Media CRUD | ❌ No API | ✅ Full CRUD |
