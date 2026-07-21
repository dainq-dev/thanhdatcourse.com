# Planning 01: Monorepo Architecture & Foundation

**Part of:** Delivery Planning
**Ref:** ARCHITECTURE.MD, DYNAMIC-CONVERSION-BLUEPRINT.md Section 1, bun-development/SKILL.md
**Status:** Draft

---

## 1. Monorepo Philosophy

### Why Bun Workspaces + Turborepo?

| Concern | Solution |
|---------|----------|
| **Code sharing** | `packages/` — shared types, UI components, config. No copy-paste between apps. |
| **Independent deployment** | Each `apps/*` is a standalone Bun service with its own port. Can scale independently. |
| **Consistent tooling** | One TypeScript version, one linter (Biome), one test runner (Bun test), one package manager (Bun). |
| **Atomic changes** | Change a Zod schema in `packages/types` → TypeScript immediately flags all consumers that break. |
| **Fast CI** | Turborepo caches build/test outputs. Only rebuild what changed. |

### Package Hierarchy

```
Root (thanhdatcomputer-monorepo)
├── package.json        # bun@1.3.14, workspaces, turbo scripts
├── turbo.json          # Task pipeline: build, test, dev, start
├── bun.lock            # Lockfile (binary, super fast)
│
├── apps/               # Runnable applications
│   ├── web/            # Frontend — Next.js 16.2, React 19, GSAP, SCSS
│   ├── api/            # Backend API — Hono 4, Drizzle ORM, SQLite
│   └── media/          # Media Microservice — Hono 4, Sharp, SQLite
│
├── packages/           # Reusable libraries
│   ├── types/          # Zod schemas — Single Source of Truth
│   ├── ui/             # React components + SCSS design system
│   └── config/         # Shared tsconfig.base.json
│
├── docker/             # Dockerfiles + Nginx config
├── docker-compose.yml
│
└── .docs/              # Project documentation
    ├── DYNAMIC-CONVERSION-BLUEPRINT.md
    ├── PROJECT-REVIEW-BRAINSTORMING.md
    ├── GAP-ANALYSIS.md
    ├── specs/           # 10 BDD Specs
    ├── brd/             # 10 BRDs
    └── planning/        # Delivery planning (this directory)
```

---

## 2. Package Dependency Graph

```
                    ┌─────────────┐
                    │  @workspace │
                    │  /config    │
                    └──────┬──────┘
                           │ extends tsconfig
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │@workspace │    │@workspace │    │@workspace │
    │  /types   │    │   /ui     │    │  /api     │
    │           │◄───│ (imports  │    │ (imports  │
    │ (Zod)     │    │  types)   │    │  types)   │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │               │               │
          │         ┌─────▼─────┐         │
          │         │@workspace │         │
          │         │   /web    │◄────────┤
          │         │(imports ui│  (Hono  │
          │         │ + types)  │   RPC)  │
          │         └───────────┘         │
          │                               │
          └───────────┬───────────────────┘
                      │
                ┌─────▼─────┐
                │@workspace │
                │  /media   │
                │(imports   │
                │ types)    │
                └───────────┘
```

**Rule:** Packages only depend on packages below them. No circular dependencies.

- `config` ← no deps (leaf)
- `types` ← depends on nothing (leaf, only Zod)
- `ui` ← depends on `types` + React/GSAP/Sass
- `api` ← depends on `types` + Hono/Drizzle/Zod
- `media` ← depends on `types` + Hono/Sharp
- `web` ← depends on `types` + `ui` + imports API types (Hono RPC)

---

## 3. Hono RPC — End-to-End Type Safety

### The Problem
Frontend calls backend API. Without type sharing, the frontend has no idea what shape the response data has, what params are required, or what the endpoint URL is. Errors are runtime, not compile-time.

### The Solution: Hono RPC

```
┌──────────────────────────────────────────────────────────────┐
│  1. ZOD SCHEMAS (packages/types)                              │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ export const CreateCourseSchema = z.object({         │ │
│     │   title: z.string().min(10),                         │ │
│     │   price: z.number().positive(),                      │ │
│     │ });                                                  │ │
│     │ export type CreateCourseDTO = z.infer<typeof Schema>;│ │
│     └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  2. BACKEND ROUTE (apps/api)                                  │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ .post('/', zValidator('json', CreateCourseSchema),   │ │
│     │   (c) => {                                           │ │
│     │     const data = c.req.valid('json');                │ │
│     │     // data is fully typed: CreateCourseDTO          │ │
│     │     return c.json({ id: '...', ...data });           │ │
│     │   })                                                 │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
│     At bottom of index.ts:                                    │
│     export type AppType = typeof app;  // ← THE MAGIC LINE   │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  3. FRONTEND CLIENT (apps/web)                                │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ import { hc } from 'hono/client';                    │ │
│     │ import type { AppType } from '@workspace/api';       │ │
│     │                                                      │ │
│     │ const api = hc<AppType>(API_URL);                    │ │
│     │                                                      │ │
│     │ // FULLY TYPE-SAFE:                                  │ │
│     │ const res = await api.courses.$post({                │ │
│     │   json: { title: '...', price: 996000 }              │ │
│     │ });    // Compile error if title < 10 chars!          │ │
│     │ const course = await res.json(); // typed Course     │ │
│     └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Benefits
- **Zero code generation** — no OpenAPI, no tRPC codegen
- **Compile-time errors** — wrong params, missing fields, wrong types all caught
- **IDE autocomplete** — `api.courses.` → shows all available routes and methods
- **Single source of truth** — Zod schema in `packages/types`, used by both backend and frontend

### Route Organization in apps/api

```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { settingsRoutes } from './routes/settings';
import { coursesRoutes } from './routes/courses';
// ... all routes

const app = new Hono()
  .use('*', cors())
  .route('/api/settings', settingsRoutes)
  .route('/api/courses', coursesRoutes)
  .route('/api/posts', postsRoutes)
  .route('/api/portfolios', portfolioRoutes)
  .route('/api/products', productRoutes)
  .route('/api/faqs', faqRoutes)
  .route('/api/testimonials', testimonialRoutes)
  .route('/api/leads', leadRoutes)
  .route('/api/promotions', promotionRoutes)
  .route('/api/instructors', instructorRoutes)
  .route('/api/auth', authRoutes);

export default app;
export type AppType = typeof app;
```

Each route file follows this pattern:
```typescript
// apps/api/src/routes/courses.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateCourseSchema, UpdateCourseSchema } from '@workspace/types';
import { db } from '../db';
import { courses } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const coursesRoutes = new Hono()
  // Public: list published courses
  .get('/', async (c) => {
    const result = await db.select().from(courses).where(eq(courses.is_published, 1));
    return c.json(result);
  })
  // Admin: create course
  .post('/', authMiddleware('ADMIN'), zValidator('json', CreateCourseSchema), async (c) => {
    const data = c.req.valid('json');
    const [course] = await db.insert(courses).values(data).returning();
    return c.json(course, 201);
  })
  // ... etc
```

### Auth Middleware Pattern

```typescript
// apps/api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

export function authMiddleware(requiredRole?: 'ADMIN' | 'USER') {
  return createMiddleware(async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    try {
      const payload = await verify(token, process.env.JWT_SECRET!);
      c.set('user', payload);

      if (requiredRole && payload.role !== requiredRole) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      await next();
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  });
}
```

---

## 4. Turborepo Task Pipeline

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],       // Build deps first
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^test"]         // Test deps first
    },
    "dev": {
      "cache": false,
      "persistent": true             // Long-running processes
    },
    "start": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]        // Need types generated before lint
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## 5. Separation of Concerns — What Lives Where

| Concern | Location | Reason |
|---------|----------|--------|
| **Data validation** | `packages/types/src/schemas/` | Single source of truth. Used by api + web + media. |
| **Database schema** | `apps/api/src/db/schema.ts` | Drizzle ORM tables. Mirrors Zod schemas. |
| **API routes** | `apps/api/src/routes/` | One file per entity. Public + Admin endpoints. |
| **Auth middleware** | `apps/api/src/middleware/auth.ts` | JWT verify + role check. Reused across all admin routes. |
| **Media upload** | `apps/media/src/routes/upload.ts` | Separate service, separate port, separate concerns. |
| **Media optimization** | `apps/media/src/services/optimizer.ts` | Sharp pipeline. Image-only logic isolated from HTTP layer. |
| **Media serve** | Nginx (prod) / `apps/media/src/routes/images.ts` (dev) | Production: Nginx serves static from disk. Dev: Hono serves. |
| **React components** | `packages/ui/src/` | Shared across admin + public pages. Atomic Design. |
| **SCSS design tokens** | `packages/ui/styles/` | Variables, mixins, functions. Imported by all components. |
| **Page routing** | `apps/web/src/app/` | Next.js App Router. Route groups: (nguoi-dung), xac-thuc, quan-tri-vien. |
| **Data fetching** | `apps/web/src/lib/rpc.ts` | Hono RPC client. Single file for all API calls. |
| **Server-side cache** | `apps/web/src/lib/settings.ts` | React `cache()` + `unstable_cache` for site settings. |
| **Block Editor** | `apps/web/src/components/blocks/` | Admin-only. BlockRenderer + individual block components. |
| **Shared TSConfig** | `packages/config/tsconfig.base.json` | Base config, extended by all packages. |

---

## 6. Dev, Build, Deploy Commands

```bash
# ─── Development ───────────────────────
bun run dev
# Starts: web(3000), api(3001), media(3002) concurrently via Turborepo

# ─── Testing ──────────────────────────
bun run test                     # All workspace tests
bun run --filter @workspace/api test   # Only API tests
cd apps/api && bun test --watch       # Watch mode

# ─── Type Checking ────────────────────
bun run --filter './apps/*' tsc --noEmit
bun run --filter './packages/*' tsc --noEmit

# ─── Linting ──────────────────────────
cd apps/web && bunx biome check --write .   # Auto-fix
cd apps/web && bunx biome ci .              # CI mode (no fix)

# ─── Database ─────────────────────────
cd apps/api && bunx drizzle-kit generate    # Generate migrations
cd apps/api && bunx drizzle-kit push        # Apply to dev DB
cd apps/api && bun run src/db/seed.ts       # Seed mock data

# ─── Build ────────────────────────────
bun run build                     # All apps (Next.js build + tsc)

# ─── Production ───────────────────────
docker-compose up -d --build      # Build + start all services
docker-compose logs -f api        # Tail API logs
docker-compose down               # Stop all
```

---

## 7. Database Decision: SQLite WAL Mode (not PostgreSQL)

### Why SQLite for this project?

| Factor | SQLite Reality | PostgreSQL Overhead |
|--------|---------------|---------------------|
| **Data scale** | ~15 tables, vài trăm rows (settings, courses, posts, media metadata). SQLite handles millions of rows/table comfortably. | Massive overkill for this scale. |
| **Concurrency** | WAL mode: unlimited concurrent readers. 1 writer at a time, but transactions complete in microseconds for single-row updates. | Multi-writer, connection pooling — not needed when only 1 admin edits at a time. |
| **Read speed** | In-process, zero network latency. `SELECT ... WHERE slug=?` completes in **<0.1ms**. | Network round-trip + connection pool: **2-5ms** minimum per query. |
| **Read pattern** | No user hits DB directly. Next.js SSR server is the sole reader — fetches data, renders HTML, sends to browser. | — |
| **Write pattern** | Admin saves settings/courses/posts → 1 INSERT/UPDATE. No long-lived transactions. | — |
| **Backup** | Copy 1 file: `cp app.db app-backup.db` | `pg_dump`, WAL archiving, point-in-time recovery |
| **Setup** | Zero — embedded in Bun via `bun:sqlite`. No service, no container, no config. | Needs Docker container, port, users, passwords, connection pooling. |
| **Memory** | ~10-50MB for data + cache | 100-200MB minimum for shared_buffers |
| **Operation** | No extra monitoring, no connection leaks, no pool exhaustion | 1 more service = 1 more failure point + monitoring burden |
| **Cost** | Free, embedded | Additional VPS RAM (at least +256MB) |
| **Drizzle ORM** | ✅ Native `bun:sqlite` driver | ✅ `pg` driver |
| **Full-text search** | FTS5 extension (built-in, good enough for blog search) | `tsvector` + GIN index (more complex, marginally better) |
| **JSON queries** | `json_extract()`, `json_array_length()` | `->`, `->>`, JSONB (better but not needed here) |
| **Migration path** | Drizzle supports both. If scale ever demands PostgreSQL: swap `bun:sqlite` → `pg` driver. Zero code changes in routes. | — |

### Two Separate SQLite Databases

```
apps/api/src/db/
├── index.ts           # Drizzle instance → app.db (15 application tables)
├── schema.ts          # All business entity tables
└── migrate.ts         # Programmatic migration runner

apps/media/src/db/
├── index.ts           # Drizzle instance → media.db (2 media tables)
└── schema.ts          # media + media_variants tables
```

**Why separate DBs?**
- **Isolation:** Media service owns its data. API service never touches media metadata directly — it calls media service over HTTP if needed.
- **Independent backup:** `app.db` backed up separately from `media.db` (different change frequencies).
- **Independent scaling:** If media traffic grows, media service + its DB can move to a different server without touching API.
- **Small files:** Each DB file is tiny (< 10MB for this scale). No disk concern.

### WAL Mode Configuration

```typescript
// apps/api/src/db/index.ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('data/app.db');
sqlite.run('PRAGMA journal_mode = WAL');       // WAL mode: readers never block writer
sqlite.run('PRAGMA busy_timeout = 5000');      // Wait 5s before throwing SQLITE_BUSY
sqlite.run('PRAGMA foreign_keys = ON');         // Enforce FK constraints
sqlite.run('PRAGMA synchronous = NORMAL');      // Safe, faster than FULL

export const db = drizzle(sqlite);
```

### Backup Strategy

```bash
# Cron job mỗi 24h:
#!/bin/sh
cp /app/data/app.db /backup/app-$(date +%Y%m%d).db
cp /app/data/media.db /backup/media-$(date +%Y%m%d).db

# SQLite backup tip: dùng .backup command để atomic snapshot khi DB đang chạy
sqlite3 /app/data/app.db ".backup /backup/app-$(date +%Y%m%d).db"
```

### When Would PostgreSQL Make Sense?

Only consider PostgreSQL migration if ALL of these become true:
- Multiple concurrent admin users editing simultaneously (race conditions on write)
- Traffic exceeds 50K+ unique visitors/day (Next.js SSR → many parallel reads)
- Need point-in-time recovery (not just daily snapshots)
- Need read replicas for geo-distributed deployment

For the current and near-future scale: **SQLite is the right choice.** Simplicity is a feature, not a compromise.

---

## 8. Key Decisions Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Runtime | Bun 1.3.14 | Fastest JS runtime, native TypeScript, SQLite, test runner |
| Monorepo | Bun Workspaces + Turborepo | Simple, no Nx/Lerna overhead, native to Bun |
| API Framework | Hono 4 | Bun-native, RPC types, lighter than Express/Fastify |
| ORM | Drizzle ORM | Type-safe, SQL-like, no codegen, Bun + PostgreSQL dual support |
| **Database** | **SQLite WAL mode (2 DBs: app.db + media.db)** | **Zero-infra, in-process reads <0.1ms, backup = copy file. PostgreSQL overkill for this scale. Drizzle supports migration if ever needed.** |
| Lint/Format | Biome 2.2 | 10x faster than ESLint+Prettier, single tool |
| CSS | SCSS Modules | Already built, client approved, more control than Tailwind |
| Animation | GSAP 3.15 | Already used throughout, better ScrollTrigger than alternatives |
| Auth | Hono JWT middleware | Lightweight, no external auth service needed, JWT in httpOnly cookie |
| Image Processing | Sharp 0.33 | Industry standard, already in deps, handles all formats |
