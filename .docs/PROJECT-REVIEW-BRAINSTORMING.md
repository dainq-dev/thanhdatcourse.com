# Project Review & Monorepo Implementation Brainstorming

**Type:** Executive Review + Execution Brainstorming
**Date:** 2026-07-21
**Ref:** DYNAMIC-CONVERSION-BLUEPRINT.md, 10 Specs, 10 BRDs, GAP-ANALYSIS.md, way-of-reasoning.prompt.md, bun-development/SKILL.md

---

## Part 1: Project Review

### 1.1 Current State — Strengths

| Area | Rating | Detail |
|------|--------|--------|
| **Frontend Concept** | Excellent | Client approved. Dark theme (Manrope font), GSAP animations, 7 pages + 10 sections. Cinematic, minimal, distinctive visual direction. |
| **UI Design System** | Excellent | 21 Atomic Design components (atoms/molecules/organisms), SCSS architecture with design tokens, mixins, functions. Reusable, standardized. |
| **Type System** | Good | 8 Zod schemas exist. Needs extension for block system and course extended schemas (designed in Spec 02, 03). |
| **Monorepo Scaffold** | Good | Bun Workspaces + Turborepo configured. 3 apps + 3 packages, clear task pipeline. |
| **Documentation** | Excellent | 7,284 lines: Blueprint (2,886) + 10 Specs (2,283) + 10 BRDs (2,115) + Gap Analysis (364). Covers architecture to business rules to BDD to sequence diagrams. |
| **Tooling** | Good | Biome (linter+formatter), TypeScript strict, Bun test, Bun hot reload. Modern, fast. |

### 1.2 Current State — What Needs Building

| Area | State | Volume |
|------|-------|--------|
| **Backend API** | Bare stub (1 GET route) | ~55 endpoints to implement |
| **Database** | Schema designed, zero implementation | 15 tables Drizzle migrations + seed |
| **Media Service** | Bare stub (1 GET route) | Upload, Sharp optimize, variants, YouTube, CDN |
| **Auth** | next-auth installed, no code | JWT, login/register, Google OAuth, admin guard |
| **Admin Dashboard** | All 10 pages are stubs | 15 pages to build |
| **Dynamic Data** | 100% mockData + hardcode | 210 items to convert to dynamic |
| **Testing** | 2 health check tests | 200+ BDD scenarios need E2E tests |
| **Deployment** | No Docker, no Nginx, no CI/CD | Dockerfiles, docker-compose, Nginx config |

### 1.3 Documentation Audit

| Document | Lines | Quality |
|----------|-------|---------|
| DYNAMIC-CONVERSION-BLUEPRINT.md | 2,886 | Full architecture, all sections have diagrams |
| specs/01-site-settings-cms.md | 258 | 55 keys, 6 tabs, batch save, cache |
| specs/02-block-content-editor.md | 297 | 21+ block types, Zod discriminated union, nested blocks |
| specs/03-course-management-curriculum.md | 343 | Curriculum builder, Udemy UX, instructor system |
| specs/04-media-microservice.md | 330 | Upload, Optimize, CDN, YouTube, external URL |
| specs/05-blog-article-management.md | 189 | Categories, Block Editor, SEO |
| specs/06-portfolio-products-management.md | 162 | Portfolio + Digital products CRUD |
| specs/07-faq-testimonials-promotions.md | 161 | 3 sub-modules, auto-expiry promotions |
| specs/08-contact-lead-management.md | 155 | Lead pipeline NEW/CONTACTED/CONVERTED |
| specs/09-authentication-admin-guard.md | 208 | JWT, Google OAuth, role-based guard |
| specs/10-admin-dashboard-shell.md | 180 | Sidebar, dashboard stats, toast, empty states |
| brd/01-10 (10 files) | 2,115 | Business rules, I/O spec, sequence diagrams |
| GAP-ANALYSIS.md | 364 | 13 gaps with concrete fixes |

### 1.4 Gap Impact Assessment

| # | Gap | Severity | Blocking? | Fix Effort |
|---|-----|----------|-----------|------------|
| GAP-01 | Footer bg image | Low | No | 5 min (add 1 key) |
| GAP-02 | Course section headings | Medium | Yes - blocker for course detail | 15 min (add 6 keys) |
| GAP-03 | Hero badge + subtitle | Medium | Yes - blocker for course detail | 30 min (column + mapping) |
| GAP-04 | Brands/badges ambiguity | Low | No | 10 min (clarify docs) |
| GAP-05 | Blog white cards | Low | No | 5 min (design note) |
| GAP-06 | Course teal cards | Low | No | 5 min (design note) |
| GAP-07 | Portfolio alternating | Low | No | 5 min (layout note) |
| GAP-08 | Animation strategy | Medium | Yes - risk of losing motion | 20 min (Blueprint section) |
| GAP-09 | Molecules unused | Medium | No | 60 min (migration mapping) |
| GAP-10 | Module numbering | Low | No | 5 min (document) |
| GAP-11 | CSS var inconsistency | Low | No | 30 min (cleanup later) |
| GAP-12 | HTML to Blocks migration | Low | No | 15 min (seed note) |
| GAP-13 | Metadata error handling | Low | No | 10 min (BDD scenario) |

**Total gap fix effort: ~3.5 hours. None are showstoppers.**

---

## Part 2: Monorepo Implementation Brainstorming

### 2.1 Current Monorepo Scaffold (Already Configured)

```
thanhdatcomputer-monorepo/
├── apps/web/         Bun workspace #1 — Next.js 16.2.10 (port 3000)
├── apps/api/         Bun workspace #2 — Hono 4.3 + Drizzle ORM (port 3001)
├── apps/media/       Bun workspace #3 — Hono 4.3 + Sharp (port 3002)
├── packages/ui/      Bun workspace #4 — React 19 Components + SCSS
├── packages/types/   Bun workspace #5 — Zod Schemas (Single Source of Truth)
└── packages/config/  Bun workspace #6 — Shared TSConfig
```

Root package.json: `bun@1.3.14`, `turbo@^2.0.0`, Bun Workspaces (`apps/*`, `packages/*`)

### 2.2 Implementation Principles

Derived from `way-of-reasoning.prompt.md` and `bun-development/SKILL.md`:

| Principle | Application |
|-----------|-------------|
| **Think Before Coding** | Full Specs + BRDs exist. Every implementation decision has rationale. Execute, don't speculate. |
| **Simplicity First** | No repository pattern, no unnecessary abstractions. Hono route = 1 file per entity. Drizzle queries inline. |
| **Surgical Changes** | Add new code into `apps/api/src/routes/`, `apps/media/src/routes/`. Do NOT refactor existing frontend animation/CSS code. |
| **Goal-Driven Execution** | Each spec = write test -> fail -> implement -> pass -> refactor. Use `bun test` as runner. |
| **Zero NPM if Bun Native** | Use `bun:sqlite` (via Drizzle), `Bun.password` for bcrypt, `Bun.file` for file I/O. Avoid unnecessary npm deps. |
| **Type Safety 100%** | Zod schemas in `@workspace/types` define everything. Hono RPC exports types. Next.js Server Components use `hc<AppType>`. |

### 2.3 Dependency Execution Order

```
Layer 0 (No dependencies — Foundation):
  Spec 09 (Auth)            JWT, login/register, bcrypt, middleware
  Database Migrations       All 15 tables + seed data

Layer 1 (Depends on Layer 0):
  Spec 10 (Admin Shell)     Sidebar layout, auth guard, dashboard overview
  Spec 04 Phase 1 (Upload)  Media upload + storage (no optimize yet)

Layer 2 (Depends on Layer 1):
  Spec 01 (Settings)        55 keys CRUD, batch save, cache
  Spec 04 Phase 2 (Optimize) Sharp variants, on-the-fly resize

Layer 3 (Depends on Layer 1-2):
  Spec 03 Phase 1 (Course CRUD)  Course metadata form
  Spec 05 (Blog)                 Categories + posts CRUD
  Spec 09 Integration            Hono RPC client in apps/web

Layer 4 (Depends on Layer 3):
  Spec 02 (Block Editor)    21 block types, drag-drop, renderer
  Spec 03 Phase 2 (Curriculum)  Modules/lessons builder
  Spec 06 (Portfolio)       Portfolio + products CRUD

Layer 5 (Depends on Layer 2-4):
  Spec 07 (FAQ/Test/Promo)  Per-course management
  Spec 08 (Contact)         Lead form + pipeline

Layer 6 (Integration):
  Frontend Hookup           Replace all mockData with API calls
  Spec 04 Phase 3 (CDN)     Nginx static serve, Cloudflare
  Deployment                Docker, docker-compose, Nginx reverse proxy
```

### 2.4 Workflow Pipeline for Each Spec

Using built-in workflows from `.agents/workflows/`:

```
/bdd-review    Challenge the spec before coding
     |
     v  (spec passed review)
/bdd-dev       TDD: write tests -> fail -> implement -> pass -> refactor
     |
     ├── bun test (apps/*/src/**/*.test.ts)
     ├── biome check --write (lint + format)
     ├── tsc --noEmit (typecheck)
     |
     v  (implementation done)
/quality-review  Adversarial + edge-case + security review
     |
     v  (approved)
/bdd-docs       Update changelog + user manual
```

### 2.5 Daily Development Commands

```bash
# Start entire development environment
bun run dev
# Turborepo runs concurrently:
#   apps/web   (Next.js dev, HMR, port 3000)
#   apps/api   (Hono --hot, port 3001)
#   apps/media (Hono --hot, port 3002)

# Run all workspace tests
bun run test

# Run tests for specific package
bun run --filter @workspace/api test
cd apps/api && bun test

# Typecheck everything
bun run --filter './apps/*' tsc --noEmit
bun run --filter './packages/*' tsc --noEmit

# Lint + Format (Biome)
cd apps/web && bunx biome check --write .

# Add dependency to a package
cd apps/api && bun add hono                       # production
cd apps/api && bun add -d @types/bun drizzle-kit  # dev
cd apps/api && bun add @workspace/types           # workspace dep

# Generate Drizzle migration
cd apps/api && bunx drizzle-kit generate
cd apps/api && bunx drizzle-kit push
```

### 2.6 Directory Growth Plan (What Each Package Will Look Like After Implementation)

```
apps/api/src/
├── index.ts               Hono app, mount all sub-routers, export AppType
├── db/
│   ├── index.ts           Drizzle init (bun:sqlite)
│   ├── schema.ts          All 15 table definitions
│   └── seed.ts            Seed script (mockData -> DB)
├── routes/
│   ├── settings.ts        GET/PUT /api/settings
│   ├── courses.ts         CRUD /api/courses
│   ├── modules.ts         CRUD /api/courses/:id/modules
│   ├── lessons.ts         CRUD /api/modules/:id/lessons
│   ├── bonuses.ts         CRUD /api/courses/:id/bonuses
│   ├── posts.ts           CRUD /api/posts
│   ├── categories.ts      CRUD /api/categories
│   ├── portfolios.ts      CRUD /api/portfolios
│   ├── products.ts        CRUD /api/products
│   ├── faqs.ts            CRUD /api/faqs
│   ├── testimonials.ts    CRUD /api/testimonials
│   ├── leads.ts           POST + GET + PUT /api/leads
│   ├── promotions.ts      CRUD /api/promotions
│   ├── instructors.ts     CRUD /api/instructors
│   └── auth.ts            POST login/register/logout, GET me, Google OAuth
└── middleware/
    └── auth.ts            JWT verify + admin role check

apps/media/src/
├── index.ts               Hono app (port 3002), mount sub-routers
├── routes/
│   ├── upload.ts           POST /upload
│   ├── images.ts           GET /img/:id, GET /img/:id/:variant
│   ├── media.ts            GET/PATCH/DELETE /api/media
│   └── external.ts         POST /external (YouTube + external URL)
├── config/
│   └── variants.ts         Variant preset definitions
├── services/
│   ├── validator.ts        Magic bytes, MIME, size validation
│   ├── storage.ts          Disk I/O
│   ├── optimizer.ts        Sharp pipeline
│   ├── variants.ts         Pre-generate + dynamic resize cache
│   └── hash.ts             SHA256 content hash
├── db/
│   ├── index.ts            Drizzle init (SQLite)
│   └── schema.ts           media + media_variants tables
└── data/
    ├── uploads/            Original files
    └── variants/           Generated variant files

packages/types/src/
├── index.ts                Barrel export
├── schemas.ts              Existing 8 schemas
├── schemas/
│   ├── blocks.ts           NEW: 21+ block type Zod schemas (Spec 02)
│   ├── course-extended.ts  NEW: CourseExtended, Instructor, LessonExtended (Spec 03)
│   └── media.ts            NEW: Media, MediaVariant schemas (Spec 04)
└── utils.ts                Existing utilities

apps/web/src/
├── app/
│   ├── (nguoi-dung)/       Existing pages - DATA SOURCE CHANGES ONLY
│   ├── xac-thuc/           NEW: login, register, forgot-password forms
│   ├── quan-tri-vien/      NEW: admin shell + 15 management pages
│   └── api/                Proxy to Hono API (if needed)
├── components/
│   ├── sections/           Existing - REFACTOR TO ACCEPT PROPS
│   └── blocks/             NEW: BlockRenderer + all block components (Spec 02)
├── lib/
│   ├── rpc.ts              NEW: Hono RPC client (hc<AppType>)
│   ├── settings.ts         NEW: getSiteSettings() with cache
│   └── mockData.ts         REMOVE after migration
└── hooks/
    ├── use-media-picker.ts  NEW: Media Library modal hook
    └── use-undo-history.ts  NEW: Undo/redo for Block Editor
```

### 2.7 Hono RPC — The Glue Between Frontend and Backend

```typescript
// 1. Backend exports its type (apps/api/src/index.ts)
const app = new Hono()
  .route('/api/settings', settingsRoutes)
  .route('/api/courses', coursesRoutes);
export default app;
export type AppType = typeof app;

// 2. Frontend imports the type for end-to-end type safety (apps/web/src/lib/rpc.ts)
import { hc } from 'hono/client';
import type { AppType } from '@workspace/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const api = hc<AppType>(API_URL);

// 3. Server Components use it directly
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
import { api } from '@/lib/rpc';

export default async function CoursesPage() {
  const res = await api.courses.$get({ query: { published: 'true' } });
  const courses = await res.json();

  return <CourseGrid courses={courses} />;
}
```

### 2.8 Key Technical Decisions Already Made

| Decision | Why |
|----------|-----|
| **Bun over Node.js** | 2-3x faster, native SQLite, native test runner, workspace support, hot reload |
| **Hono over Express/Fastify** | Bun-native, Hono RPC (end-to-end types without codegen), lighter |
| **Drizzle ORM over Prisma** | Type-safe, no codegen step, SQL-like API, Bun compatible |
| **SQLite over PostgreSQL** | Zero-infra (single file), perfect for VPS, no connection pool needed, fast enough for this scale |
| **Biome over ESLint+Prettier** | Single tool, 10x faster, 2.2.0 stable, Next.js + React domains built-in |
| **SCSS Modules over Tailwind** | Already built, client approved the visual output, better for dark theme complex animations |
| **GSAP over Framer Motion** | Already used throughout, better ScrollTrigger integration, more performant |
| **Monorepo over separate repos** | Single source of truth (types), shared components, atomic deployments |

### 2.9 Technology Stack Summary

```
                   ┌──────────────────┐
                   │   TypeScript 5   │  (everywhere, strict mode)
                   └────────┬─────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │ Next.js 16 │      │  Hono 4   │      │  Hono 4   │
  │ React 19   │      │ Drizzle   │      │  Sharp    │
  │ GSAP 3     │      │ SQLite    │      │  SQLite   │
  │ SCSS       │      │ Zod       │      │           │
  │            │      │           │      │           │
  │ apps/web   │      │ apps/api  │      │apps/media │
  │ (port 3000)│      │ (port 3001)│     │(port 3002)│
  └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
          ┌─────▼─────┐          ┌─────▼─────┐
          │Zod Schemas│          │TSConfig   │
          │(types)    │          │(config)   │
          │Single     │          │           │
          │Source of  │          │           │
          │Truth      │          │           │
          └───────────┘          └───────────┘
                │
          ┌─────▼─────┐
          │  SCSS +   │
          │  React    │
          │  Comp.    │
          │  (ui)     │
          └───────────┘
```

### 2.10 Estimated Implementation Effort

| Phase | Content | Effort |
|-------|---------|--------|
| **Phase 1: Foundation** | DB migrations, seed, Auth (Spec 09), Admin Shell (Spec 10) | 1-2 weeks |
| **Phase 2: Core Admin** | Settings (Spec 01), Media upload+optimize (Spec 04 P1), Course metadata (Spec 03 P1) | 2-3 weeks |
| **Phase 3: Content** | Block Editor (Spec 02), Curriculum (Spec 03 P2), Blog (Spec 05), Portfolio (Spec 06) | 2-3 weeks |
| **Phase 4: Marketing** | FAQ/Testimonials/Promotions (Spec 07), Contact/Leads (Spec 08) | 1 week |
| **Phase 5: Integration** | Frontend hookup, Media CDN (Spec 04 P3), Testing, Deployment | 1-2 weeks |
| **Total** | | **7-11 weeks** |

### 2.11 Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|------------|
| GSAP animations break after dynamic conversion | Medium | High - visual regression | Don't touch animation code. Only change data source. Animation strategy documented in Blueprint. |
| Hono RPC types mismatch between backend/frontend | Low | High - build failure | Zod schemas in shared package ensure consistency. Changes propagate via TypeScript compiler. |
| SQLite concurrency limits under load | Low | Medium | For this scale (single website, low traffic), SQLite is fine. Use WAL mode. Add cache layer. |
| Sharp native binary issues on some platforms | Low | Low | `trustedDependencies` already configured in package.json. Bun handles native modules well. |
| Block Editor complexity overruns schedule | Medium | Medium | Start with core 10 block types first (heading, paragraph, image, video, list, quote, code, divider, cta, accordion). Add remaining later. |
| Admin learns the system slowly | Low | Low | Settings page uses Vietnamese labels with descriptions. Block editor is visual. Form validation prevents errors. |
