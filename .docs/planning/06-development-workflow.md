# Planning 06: Development Workflow & Conventions

**Part of:** Delivery Planning
**Ref:** .agents/workflows/*, way-of-reasoning.prompt.md, bdd-dev.prompt.md, bdd-spec.prompt.md
**Status:** Draft

---

## 1. Workflow Pipeline per Feature

```
Step 1: /bdd-spec
  └── Write spec: Feature Description, User Stories, BDD Scenarios (Gherkin)
  └── Output: .docs/specs/XX-feature-name.md

Step 2: /bdd-review
  └── Challenge spec: adversarial review, edge cases, missing scenarios
  └── Fix gaps, re-review until ACCEPTED

Step 3: /bdd-dev
  └── TDD implementation:
      1. Write tests → bun test (RED)
      2. Write code to pass → bun test (GREEN)
      3. Refactor → bun test (still GREEN)
  └── Run Biome lint, TypeScript typecheck

Step 4: /quality-review
  └── Adversarial + edge-case + security review
  └── Fix findings, re-review until clean

Step 5: /bdd-docs
  └── Update changelog in .docs/changelogs/
  └── Update user manual if needed
```

---

## 2. Implementation Order (Topological Sort)

```
Phase 1 (Foundation):  DB migrations → Spec 09 (Auth) → Spec 10 (Admin Shell)
Phase 2 (Core Admin):  Spec 01 (Settings) → Spec 04 (Media P1: Upload)
Phase 3 (Content):     Spec 03 (Courses P1: CRUD) → Spec 02 (Block Editor P1: 10 core types)
                       → Spec 05 (Blog) → Spec 06 (Portfolio)
Phase 4 (Advanced):    Spec 02 P2 (remaining 11 block types)
                       → Spec 03 P2 (Curriculum builder, instructors)
                       → Spec 04 P2 (Optimize + CDN)
                       → Spec 07 (FAQ, Testimonials, Promotions)
Phase 5 (Integration): Spec 08 (Contact) → Frontend hookup → Testing → Docker → Deploy
```

---

## 3. Daily Dev Commands

```bash
# Start everything
bun run dev              # Turborepo: web(3000), api(3001), media(3002)

# Test (all or filter)
bun run test
bun run --filter @workspace/api test
cd apps/api && bun test --watch

# TypeCheck
bun run --filter './apps/*' tsc --noEmit
bun run --filter './packages/*' tsc --noEmit

# Lint
cd apps/web && bunx biome check --write .   # Auto-fix
cd apps/web && bunx biome ci .              # CI check only

# Database
cd apps/api && bunx drizzle-kit generate    # Generate migration
cd apps/api && bunx drizzle-kit push        # Apply migration
cd apps/api && bun run src/db/seed.ts       # Seed data

# Build
bun run build             # Turborepo: build all apps

# Add dependencies
cd apps/api && bun add hono
cd apps/api && bun add -d @types/bun drizzle-kit
cd apps/api && bun add @workspace/types     # Workspace dep
```

---

## 4. Code Conventions

### File Naming
```
kebab-case:       file names and directories (site-header.tsx, hero-banner/)
PascalCase:       React component names (SiteHeader, HeroBanner)
camelCase:        variables, functions, hooks (useSiteHeader, getSiteSettings)
UPPER_SNAKE:      constants (NAV_ITEMS, HERO_YOUTUBE_ID)
```

### Component Pattern
```typescript
// Component files always in their own directory:
// components/sections/hero-banner/
//   ├── index.tsx          (component)
//   ├── index.logic.ts     (hooks, business logic — optional)
//   └── index.module.scss  (styles)

import { useHeroAnimation } from './index.logic';
import styles from './index.module.scss';

export function HeroBanner() {
  const { sectionRef, videoRef } = useHeroAnimation();
  return <section ref={sectionRef} className={styles.hero}>...</section>;
}
```

### Imports Order
```typescript
// 1. External libraries
import { Hono } from 'hono';
import gsap from 'gsap';

// 2. Workspace packages
import { CourseSchema } from '@workspace/types';
import { Button } from '@workspace/ui';

// 3. Local modules
import { useHeroAnimation } from './index.logic';
import styles from './index.module.scss';
```

### TypeScript
- No `any` — use `unknown` and narrow with type guards or Zod
- Use `zValidator` middleware in Hono routes — never `c.req.json()` directly
- Always handle the error case in async functions
- Use discriminated unions for Block types

### SCSS
- Use design tokens from `packages/ui/styles/abstracts/_variables.scss`
- Use `$clr-*`, `$space-*`, `$fw-*` variables — never hardcode hex values
- Blog card white background is the ONLY exception (client approved)

### Animation
- All GSAP animations respect `prefers-reduced-motion: reduce`
- Use `power3.out` easing (consistent throughout codebase)
- Wrap with `useGSAP` hook (from `@gsap/react`) for proper cleanup
- Never modify existing animation code — only change data source

---

## 5. Git Workflow

```bash
# Branch naming: feature/spec-NN-short-description
git checkout -b feature/spec-01-site-settings

# Commit naming: spec(NN): short description
git commit -m "spec(01): implement site_settings API routes"
git commit -m "spec(01): add admin settings page with 6 tabs"
git commit -m "spec(01): integrate settings with SiteHeader/SiteFooter"

# Before PR:
bun run test              # All tests pass
bunx biome ci .           # No lint errors
bun run --filter './apps/*' tsc --noEmit  # No type errors
```

---

## 6. CI Pipeline (Future)

```yaml
# .github/workflows/ci.yml (or GitLab CI)
steps:
  - uses: oven-sh/setup-bun@v2
  - run: bun install --frozen-lockfile
  - run: bun run typecheck        # tsc --noEmit for all packages
  - run: bunx biome ci            # Lint check
  - run: bun run test             # Bun test for all packages
  - run: bun run build            # Next.js build + Hono compile
```

---

## 7. Environment Variables

```bash
# .env (gitignored, use .env.example for docs)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_URL=http://localhost:3002
JWT_SECRET=generate-a-random-secret-here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DATABASE_PATH=./data/app.db
MEDIA_STORAGE_PATH=./data
```
