# Phase 1: Core Admin Infrastructure

**Duration:** 7-10 days | **Depends on:** Phase 0
**TDD:** Bun test backend. Frontend admin pages: test ignored (manual QA).

---

## Module 1.1: Authentication (Spec 09)

### Task 1.1.1: Auth API Routes

**What:** `apps/api/src/routes/auth.ts` — POST login, register, logout. GET me, Google OAuth callback.

**Input:** `{ email, password }` for login. `{ name, email, password, confirmPassword }` for register.

**Output:** JWT token + user object. Token payload: `{ userId, email, role, exp }`, signed HS256, expire 24h.

**Best Practices:**
- `Bun.password.hash()` for bcrypt (Bun native, no npm), cost 12
- `hono/jwt` for sign/verify. Store secret in env `JWT_SECRET`.
- httpOnly cookie in production. Authorization header in dev.
- Rate limit: 5 attempts/IP/15min for login

**Test Cases:** Valid login returns token, wrong password returns 401, missing fields returns 400, register creates user + auto-login, duplicate email returns 409, password hash never stored in plaintext, token contains correct payload, expired token returns 401.

### Task 1.1.2: Admin Login Page (Frontend)

**What:** `apps/web/src/app/xac-thuc/dang-nhap/page.tsx` — Client Component form.

**Best Practices:** `'use client'`, form validation before submit, error display inline, redirect on success.

**Test Cases:** Render form, validation triggers, success redirects to admin, wrong credentials shows error.

### Task 1.1.3: Admin Auth Guard (Frontend)

**What:** `apps/web/src/app/quan-tri-vien/layout.tsx` — check session, redirect to login if unauthenticated.

**Best Practices:** `'use client'` layout, check client-side, loading state during session fetch.

**Test Cases:** Unauthenticated redirects to login, authenticated admin renders page, authenticated user (non-admin) shows forbidden.

---

## Module 1.2: Admin Dashboard Shell (Spec 10)

### Task 1.2.1: Admin Layout + Sidebar

**What:** Sidebar fixed left 260px, 10 nav items, active highlight based on `usePathname()`. Header with logo + user dropdown.

**Best Practices:** SCSS Module, responsive (hamburger on <1024px), no unnecessary re-renders.

**Test Cases:** All 10 items visible, active item highlighted, mobile hamburger toggles, user dropdown shows logout.

### Task 1.2.2: Dashboard Overview Page

**What:** `apps/web/src/app/quan-tri-vien/page.tsx` — 4 stat cards + 3 recent lists.

**Best Practices:** Fetch stats client-side via `api.admin.stats.$get()`. Loading skeleton while fetching.

**Test Cases:** Stats display correct counts, recent items clickable, empty state when no data.

### Task 1.2.3: Toast System + Loading/Empty/Error Components

**What:** Global toast context + `<EmptyState />`, `<ErrorState />`, `<Skeleton />` reusable components.

**Best Practices:** Toast auto-dismiss 5s, max 5 stacked. Skeleton uses existing `Skeleton` atom from `@workspace/ui`.

**Test Cases:** Toast renders, auto-dismisses, manual close works. Empty state shows icon + message + CTA button. Error state shows retry button.
