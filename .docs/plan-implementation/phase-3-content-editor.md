# Phase 3: Content Editor & Advanced Features

**Duration:** 14-21 days | **Depends on:** Phase 2
**TDD:** Bun test backend + unit tests for BlockEditor state logic. Frontend manual QA.

---

## Module 3.1: Block Content Editor (Spec 02)

### Task 3.1.1: BlockRenderer Component

**What:** `apps/web/src/components/blocks/BlockRenderer.tsx` — renders Block[] array to React components.

**Best Practices:** Map block type from registry. Unknown types: warn, skip. Empty array: render null.

**Test Cases:** All 21 types render, unknown type doesn't crash, empty array returns null, nested columns renders recursively.

### Task 3.1.2: Core 10 Block Components (Public Render)

**What:** HeadingBlock, ParagraphBlock, QuoteBlock, ListBlock, CodeBlock, CalloutBlock, ImageBlock, VideoBlock, DividerBlock, CTABlock — public-facing render components.

**Best Practices:** Pure components (Server Component friendly), SCSS module per block, responsive.

**Test Cases:** Each block renders with correct HTML tag, styles applied, no JavaScript required.

### Task 3.1.3: Block Editor Admin UI

**What:** `apps/web/src/components/blocks/BlockEditor.tsx` — drag-drop editor with toolbar.

**Best Practices:** `useBlockEditor` hook with undo/redo history (50 steps). `@dnd-kit/core` for drag-drop.

**Test Cases:** Add block via menu, delete block, drag reorder, Ctrl+Z undo, slash command "/heading", nested blocks (accordion, columns).

### Task 3.1.4: Remaining 11 Block Types + Editors

**What:** GalleryBlock, CarouselBlock, BeforeAfterBlock, SpacerBlock, ColumnsBlock, TabsBlock, AccordionBlock, CollapseBlock, TimelineBlock, TableBlock, PricingBlock + editor UIs.

**Test Cases:** Each block type renders in public view. Each editor form validates data. Nested blocks work in columns/accordion/tabs/collapse.

---

## Module 3.2: Course Curriculum Builder (Spec 03 — Phase 2)

### Task 3.2.1: Curriculum API (Modules + Lessons + Bonuses)

**What:** CRUD endpoints for modules, lessons, bonuses. Reorder endpoint.

**Best Practices:** Cascade delete (course → modules → lessons). Sort order recalculation.

**Test Cases:** Add module → list appears, add lesson → appears in module, reorder reflects in DB, delete cascade removes children.

### Task 3.2.2: Curriculum Admin UI

**What:** Tab "Curriculum" in course editor. Tree view: Modules → Lessons. Drag reorder.

**Test Cases:** Module expand/collapse, add/edit/delete module, add/edit/delete lesson, drag reorder, free preview toggle, auto-calculate duration summary.

### Task 3.2.3: Instructor Management

**What:** CRUD instructors. Assign to courses (many-to-many).

**Test Cases:** Create instructor, assign to course, display on course detail frontend.

### Task 3.2.4: Course Detail Frontend (Dynamic + Curriculum)

**What:** Replace mockData in `/khoa-hoc/[slug]/page.tsx` with API calls. Render curriculum accordion, instructor card, testimonials, FAQ.

**Best Practices:** Parallel fetch (Promise.all) for curriculum + testimonials + FAQs + instructors. `generateStaticParams` for SSG pre-render.

**Test Cases:** All sections render from API data, curriculum accordion expands/collapses, instructor card shows, sticky CTA works.

---

## Module 3.3: Blog Management (Spec 05)

### Task 3.3.1: Blog API (Categories + Posts)

**What:** CRUD for categories + posts. Posts use `content_blocks` (Block Editor JSON).

**Test Cases:** CRUD operations, filter by category, published-only for public, search by title, pagination.

### Task 3.3.2: Blog Admin Pages

**What:** Category list + form. Post list (table) + create/edit form with Block Editor.

**Test Cases:** Category CRUD, post creation with blocks, publish/draft toggle, preview mode.

### Task 3.3.3: Blog Frontend (Dynamic)

**What:** Replace `mockArticles` with API calls. Blog listing with pagination. Blog detail with BlockRenderer + related articles. `generateMetadata`, `generateStaticParams`.

**Test Cases:** Listing renders from API, pagination works, detail renders blocks, related articles exclude current, draft post returns 404. Blog cards retain white bg (#FFFFFF) — client approved.
