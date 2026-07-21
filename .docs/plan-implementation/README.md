# Implementation Master Index

---

## Phase 0: Foundation (5-7 days)
[phase-0-foundation.md](phase-0-foundation.md)

| Module | Tasks | Key Outputs |
|--------|-------|-------------|
| 0.1 DB & Migrations | 3 tasks | 15 Drizzle tables, migration files, seed data |
| 0.2 Extended Zod Schemas | 3 tasks | Block system schemas, course extended, auth/media schemas |
| 0.3 Hono API Foundation | 3 tasks | Entry point, DB connection, auth middleware |

---

## Phase 1: Core Admin Infrastructure (7-10 days)
[phase-1-core-admin.md](phase-1-core-admin.md)

| Module | Tasks | Key Outputs |
|--------|-------|-------------|
| 1.1 Authentication | 3 tasks | Login/register/Google OAuth API, login page, admin guard |
| 1.2 Admin Dashboard Shell | 3 tasks | Sidebar + header layout, dashboard overview, toast system |

---

## Phase 2: Content Management (10-14 days)
[phase-2-content-management.md](phase-2-content-management.md)

| Module | Tasks | Key Outputs |
|--------|-------|-------------|
| 2.1 Site Settings | 3 tasks | 55 keys API, admin 6-tab form, frontend settings integration |
| 2.2 Course Management P1 | 3 tasks | Course CRUD API, admin list+form, frontend listing dynamic |
| 2.3 Media Service P1 | 4 tasks | Upload API, Sharp optimizer, variant generator, image serving |

---

## Phase 3: Content Editor & Advanced (14-21 days)
[phase-3-content-editor.md](phase-3-content-editor.md)

| Module | Tasks | Key Outputs |
|--------|-------|-------------|
| 3.1 Block Content Editor | 4 tasks | BlockRenderer, 21 block components, admin drag-drop editor |
| 3.2 Course Curriculum | 4 tasks | Modules/lessons/bonuses API, curriculum builder UI, instructors, course detail dynamic |
| 3.3 Blog Management | 3 tasks | Blog API, admin pages with Block Editor, frontend dynamic |

---

## Phase 4: Integration & Deploy (7-10 days)
[phase-4-integration-deploy.md](phase-4-integration-deploy.md)

| Module | Tasks | Key Outputs |
|--------|-------|-------------|
| 4.1 Portfolio & Products | 2 tasks | API + admin + dynamic frontend |
| 4.2 FAQ, Testimonials, Promotions | 3 tasks | All 3 sub-modules API + admin + frontend |
| 4.3 Contact & Leads | 2 tasks | Lead API + dynamic contact page |
| 4.4 Frontend Complete Hookup | 3 tasks | Remove mockData, use molecules, SEO files |
| 4.5 Deployment | 3 tasks | Dockerfiles, Nginx, docker-compose, backup |

---

## Total: 38-62 days (7.5-12.5 weeks)

## TDD Convention

```
For each task:
1. Write Bun tests (test file reflects task name: task-0.1.1.test.ts)
2. Run → RED (tests fail)
3. Implement → GREEN (tests pass)
4. Refactor → GREEN (tests still pass)
5. Biome lint + format → clean
6. TypeScript typecheck → 0 errors

Test categories per task:
- Happy path: expected input → expected output
- Error path: invalid input → 400/401/403/404/409
- Edge cases: empty string, null, max length, special chars
- Performance: timing test for operations that should be < O(n^2)

No E2E tests in Phase 0-4 (will add after deployment).
```

## Task Progress Tracking

Use checkbox convention in each phase file:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

---

## References

- Specs: `.docs/specs/` (10 BDD Specs)
- BRDs: `.docs/brd/` (10 Business Requirement Docs)
- Blueprint: `.docs/DYNAMIC-CONVERSION-BLUEPRINT.md`
- Gap Analysis: `.docs/GAP-ANALYSIS.md`
- Planning: `.docs/planning/` (6 architecture docs)
- Workflows: `.agents/workflows/` (bdd-spec, bdd-dev, quality-review, etc.)
