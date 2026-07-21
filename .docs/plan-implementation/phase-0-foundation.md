# Phase 0: Foundation — Database & Core Types

**Duration:** 5-7 days | **TDD:** Bun test for backend, ignore E2E

**Database Architecture:** 2 separate SQLite databases:
- `apps/api/data/app.db` — 15 business tables (Drizzle via `bun:sqlite`)
- `apps/media/data/media.db` — 2 media metadata tables
- WAL mode: reads never block writes. In-process reads < 0.1ms.
- No PostgreSQL — not needed at this scale. Drizzle supports migration if ever needed.

---

## Module 0.1: Database Schema & Migrations

### Task 0.1.1: Drizzle Schema — API (15 tables)

**What:** Define all Drizzle table definitions in `apps/api/src/db/schema.ts`. Uses `bun:sqlite` native driver.

**Output:** `apps/api/src/db/schema.ts` with 15 tables:
`siteSettings`, `users`, `courses`, `courseModules`, `courseLessons`, `courseBonuses`, `testimonials`, `postCategories`, `posts`, `portfolios`, `digitalProducts`, `productShowcases`, `faqs`, `leads`, `promotions`, `instructors`, `courseInstructors`

**Best Practices:**
- WAL mode + `PRAGMA foreign_keys = ON` + `PRAGMA busy_timeout = 5000`
- Drizzle `sqliteTable` + `text()` for UUIDs, `references()` for FKs
- snake_case DB columns → camelCase TypeScript

**Best Practices:** Drizzle `sqliteTable` + `text()` for UUIDs, `references()` for FKs, snake_case columns, `$defaultFn(() => crypto.randomUUID())` on IDs.

**Test Cases:** Verify all columns exist, FK references correct, unique constraints present (slug, email).

### Task 0.1.2: Generate & Run Migrations

**What:** `drizzle-kit generate` → `drizzle-kit push` (dev).

**Output:** `apps/api/drizzle/` migration files, `apps/api/data/app.db` DB file.

**Test Cases:** Verify 15 tables exist via `PRAGMA table_list`, verify unique indexes via `PRAGMA index_list`.

### Task 0.1.3: Seed Data Script

**What:** Script `apps/api/src/db/seed.ts` imports data from `mockData.ts` → inserts into DB.

**Best Practices:** Idempotent (`ON CONFLICT DO NOTHING`), admin password bcrypt cost 12, batch insert.

**Test Cases:** 8 courses seeded, admin user with bcrypt hash, idempotent re-run.

---

## Module 0.2: Extended Zod Schemas

### Task 0.2.1: Block System Schemas (Spec 02)

**Output:** `packages/types/src/schemas/blocks.ts` — 21+ discriminated union block types with recursive `z.lazy()` for nested blocks (columns, accordion, tabs).

**Best Practices:** Use `z.discriminatedUnion('type', [...])`, `z.lazy()` for recursive, CSV export from `index.ts`.

**Test Cases:** Valid block parses, invalid block type rejected, nested columns block parses correctly, 50+ level nesting doesn't crash.

### Task 0.2.2: Course Extended Schemas (Spec 03)

**Output:** `packages/types/src/schemas/course-extended.ts` — InstructorSchema, CourseLessonExtendedSchema, CourseModuleExtendedSchema.

**Best Practices:** Extend existing `CourseSchema`, export DTO types for Create/Update.

**Test Cases:** Extended schema includes all new fields (learningOutcomes, level, certificate, etc.), lesson type enum valid, duration string format "05:32" accepted.

### Task 0.2.3: Auth, Media, Response Schemas

**Output:** `packages/types/src/schemas/auth.ts`, `media.ts`, `responses.ts`.

### Task 0.2.4: Media DB Schema (apps/media)

**Output:** `apps/media/src/db/schema.ts` — 2 tables: `media` + `media_variants`. Separate SQLite DB (`media.db`).

**Best Practices:** Same WAL mode config as API. Media table stores metadata only (not file binary). `media_variants.name` has unique constraint with `media_id`.

**Test Cases:** Both tables exist, FK works (cascade delete), unique constraint enforced.

**Test Cases:** LoginInput validates email format, password min 8 chars. Media schema handles 3 sources (upload/youtube/external). Response wrapper has success/error variants.

---

## Module 0.3: Hono API Foundation

### Task 0.3.1: API Entry Point + CORS + Error Handling

**Output:** `apps/api/src/index.ts` — Hono app with CORS, global error handler, exports `AppType`.

**Best Practices:** O(1) per request, no unnecessary middleware. Error handler wraps in JSON `{ error, code }`.

**Test Cases:** GET / returns 200 with service info, CORS headers present, unknown route returns 404 JSON, unhandled error returns 500 JSON.

### Task 0.3.2: DB Connection + Drizzle Config

**Output:** `apps/api/src/db/index.ts` — Drizzle instance with `bun:sqlite`.

**Best Practices:** Singleton pattern, WAL mode enabled, `PRAGMA foreign_keys = ON`.

**Test Cases:** DB connection successful, WAL mode active, foreign keys enforced.

### Task 0.3.3: Auth Middleware

**Output:** `apps/api/src/middleware/auth.ts` — JWT verify + role check middleware.

**Best Practices:** Bearer token extraction, `hono/jwt` verify, role check before route handler.

**Test Cases:** No token → 401, invalid token → 401, expired token → 401, user role → 403 on admin route, admin role → pass.
