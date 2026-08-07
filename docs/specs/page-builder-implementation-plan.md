# Implementation Plan: Page Builder & Section-based Architecture

**Version**: 1.0.0  
**Date**: 2026-08-03  
**Scope**: Khóa học (list + detail), Sản phẩm (list + detail), Presets & LUTs (trang đơn)

---

## Pre-flight Checklist (Dev phải kiểm tra trước khi bắt đầu)

- [ ] `bun install` ở root — đảm bảo dependencies khớp `bun.lock`
- [ ] Copy `.env.example` → `.env` ở root (nếu chưa có)
- [ ] `bun run dev` pass (không lỗi compile)
- [ ] `bun run test` pass (tất cả test hiện tại green)
- [ ] Đọc `ARCHITECTURE.MD` và `DATABASE-DESIGN.MD` để hiểu tổng quan
- [ ] Đọc `docs/specs/page-builder-sections-rearchitecture.md` (spec kiến trúc)
- [ ] Đọc `docs/specs/page-builder-bdd.md` (59 BDD scenarios)

---

## Phase 1: Database Schema + Shared Types (Foundation)

**Goal**: Tạo foundation data layer mà tất cả phase sau phụ thuộc vào.  
**Dependencies**: Không có — bắt đầu từ đây.  
**Exit criteria**: `bun run typecheck` pass, `bun test` pass cho tất cả test schema/types mới.

---

### Task 1.1 — Tạo Zod schemas cho 22 section types

**File**: `packages/types/src/schemas/sections.ts`  
**Tham khảo pattern**: `packages/types/src/schemas/blocks.ts`

**Input**: Spec catalog từ `docs/specs/page-builder-sections-rearchitecture.md` (Section 3 — 22 types)  
**Output**: 
- TypeScript union type `SectionType` (string literal union of 22 values)
- `z.enum()` validator `SectionTypeSchema`
- Mỗi section type có 1 `z.object()` schema export riêng
- `SectionConfigSchema`: `z.discriminatedUnion("section_type", [...])` để validate config theo type
- `SectionSchema`: full schema bao gồm `id, entity_type, entity_id, section_type, title, config, sort_order, is_published`
- Type exports: `Section`, `SectionConfig`, `SectionType`

**Singleton section types** (chỉ được 1 per entity):
```
hero_banner, announcement_bar, sticky_pricing_cta, student_counter, lesson_count, instructor_story, product_grid
```
→ Định nghĩa constant `SINGLETON_SECTION_TYPES: SectionType[]`

**Entity-scope mapping** (section type nào được dùng cho entity nào):
```typescript
// Key: entity_type, Value: allowed section_types
export const ENTITY_SECTION_MAP: Record<string, SectionType[]> = {
  course:        ["hero_banner", "announcement_bar", "benefits_grid", "brand_logos", "stats_counter", "student_counter", "guarantee_section", "curriculum_grid", "lesson_count", "bonus_gift_grid", "video_showcase", "image_gallery", "testimonials_carousel", "featured_students", "community_proof", "instructor_story", "rich_content", "cta_section", "faq_accordion", "pricing_comparison"],
  product:       ["hero_banner", "stats_counter", "guarantee_section", "video_showcase", "before_after_slider", "image_gallery", "cta_section", "faq_accordion", "pricing_comparison", "rich_content", "testimonials_carousel"],
  presets_page:  ["hero_banner", "stats_counter", "guarantee_section", "video_showcase", "before_after_slider", "image_gallery", "cta_section", "faq_accordion", "rich_content", "product_grid", "testimonials_carousel"],
};
```

**Section config validation rules** (theo từng type):
- `hero_banner`: `heading` min 1 char, `cta_text` và `cta_url` phải có cùng nhau (both or none)
- `benefits_grid`: `items` min 1, max 6
- `stats_counter`: `items` min 1, max 6
- `curriculum_grid`: nếu `auto_fetch` false thì `modules` phải có ít nhất 1 item
- `faq_accordion`: nếu `auto_fetch` false thì `items` phải có ít nhất 1 item
- `testimonials_carousel`: nếu `auto_fetch` false thì `items` phải có ít nhất 1 item
- `bonus_gift_grid`: `items` min 1
- `pricing_comparison`: `plans` min 1, max 6
- `video_showcase`: `videos` min 1, max 20
- `before_after_slider`: `pairs` min 1, max 20
- `image_gallery`: `images` min 1, max 50
- `product_grid`: nếu `show_all` false thì `product_ids` phải có ít nhất 1 item
- `featured_students`: `students` min 1, max 20
- `community_proof`: `images` min 1, max 20
- `brand_logos`: `logos` min 1, max 20
- `rich_content`: `blocks` min 1 (dùng `ContentSchema` từ `blocks.ts`)
- `instructor_story`: `heading` min 1 char
- `guarantee_section`: `title` min 1 char
- `cta_section`: `heading` min 1 char, `button_text` + `button_url` cùng có hoặc cùng không
- `announcement_bar`: `text` min 1 char
- `student_counter`: `count` > 0, `title` min 1 char
- `lesson_count`: `count` > 0, `label` min 1 char

**Edge cases cần handle trong schema**:
| Edge | Cách xử lý |
|------|-----------|
| `config` là string (JSON) → parse | Dùng `z.preprocess()` parse JSON string thành object trước khi validate |
| `config` là null/undefined | Fallback về default config của section type đó |
| `sort_order` bị trùng | Không validate ở schema level — xử lý ở API layer (task 2.1) |
| `entity_type` không hợp lệ | Validate bằng `z.enum(["course", "product", "presets_page"])` |
| `section_type` không tồn tại | Validate bằng `SectionTypeSchema` |

**Performance note**:
- Discriminated union O(1) lookup theo `section_type`
- Không cần tối ưu thêm vì chỉ chạy lúc validation (không phải hot path)

**Verification**: Viết `packages/types/src/schemas/sections.test.ts` với các test case:
1. Parse valid config cho từng section type → pass
2. Parse invalid config (thiếu field required) → throw
3. Parse singleton duplicate (không test ở đây — sẽ test ở API)
4. Parse config string JSON → parse thành object
5. Parse config null → fallback default

---

### Task 1.2 — Thêm bảng `sections` vào schema.ts

**File**: `apps/api/src/db/schema.ts`  
**Tham khảo**: Section "4.1 New Table" trong spec

**Code cần thêm**:
```typescript
export const sections = sqliteTable("sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  sectionType: text("section_type").notNull(),
  title: text("title"),
  config: text("config").notNull(),  // JSON string
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published").notNull().default(1),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});
```

**Index**: `CREATE INDEX idx_sections_entity ON sections(entity_type, entity_id, sort_order)`
→ Viết trong migration script (task 1.4), không định nghĩa trong Drizzle schema.

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| `config` quá lớn (> 10MB) | Giới hạn ở API layer (task 2.1), DB không enforce |
| `entity_id` không có FK constraint | Cố ý — vì entity_type dynamic. Validate ở API layer |
| `sort_order` không unique per entity | Xử lý ở API (task 2.1 reorder) bằng cách gán sort_order = max + 1 khi tạo mới |

**Verification**: `bun test apps/api/src/db/schema.test.ts` (sửa file test hiện có để thêm sections table assertion)

---

### Task 1.3 — Refactor bảng `promotions` sang M2M

**File**: `apps/api/src/db/schema.ts`

**Thay đổi**:

Bảng `promotions` cũ:
```typescript
// XÓA cột courseId khỏi promotions
// XÓA bảng promotions cũ
```

Bảng `promotions` mới:
```typescript
export const promotions = sqliteTable("promotions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignName: text("campaign_name").notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  discountAmount: integer("discount_amount"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isActive: integer("is_active").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
```

Bảng M2M mới:
```typescript
export const promotionCourses = sqliteTable(
  "promotion_courses",
  {
    promotionId: text("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.promotionId, table.courseId] }),
  }),
);
```

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| Data cũ trong promotions có `courseId` | Migration script (task 1.4) migrate sang promotion_courses |
| Xóa course → promotion_courses cascade | Đã có `onDelete: "cascade"` |
| Xóa promotion → promotion_courses cascade | Đã có `onDelete: "cascade"` |
| `discount_percentage` > 100 | Validate ở Zod schema (1-100) |
| `discount_percentage` = 0 | Cho phép (free), nhưng UI nên cảnh báo |

**Verification**: `bun test apps/api/src/db/schema.test.ts`

---

### Task 1.4 — Viết migration script

**File**: `apps/api/src/db/migrate.ts` (sửa file hiện có)

**Input**: schema.ts hiện tại  
**Output**: Database có đầy đủ bảng mới, index mới, cột cũ đã xóa

**Các bước migration**:
1. Tạo bảng `sections` với index
2. Tạo bảng `promotion_courses` mới
3. Migrate data: `SELECT * FROM old_promotions` → insert vào `promotion_courses` (promotion_id, course_id)
4. Tạo bảng `promotions` mới (copy data từ old, bỏ courseId)
5. Xóa bảng `promotions` cũ, rename new
6. Tạo index `idx_sections_entity`

**Cách chạy**: `bun run src/db/migrate.ts` (hoặc tự động khi `bun run dev`)

**Rollback plan**: Dùng SQLite backup file trước khi migrate. Nếu fail, restore từ backup.

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| DB rỗng (fresh install) | Tạo bảng mới, không cần migrate data |
| Promotions cũ không có courseId (null) | Tạo promotion_courses rỗng, giữ promotion |
| Migration fail giữa chừng | Wrap trong SQLite transaction |

---

### Task 1.5 — Export shared types từ packages/types

**File**: `packages/types/src/index.ts` (sửa)

Thêm export:
```typescript
export type { Section, SectionConfig, SectionType } from "./schemas/sections";
export { 
  SectionSchema, 
  SectionTypeSchema, 
  ENTITY_SECTION_MAP,
  SINGLETON_SECTION_TYPES,
} from "./schemas/sections";
```

**Verification**: `bun run typecheck` trong `packages/types` không lỗi.

---

## Phase 2: API Backend

**Goal**: Section CRUD API + entity detail endpoints + promotions M2M.  
**Dependencies**: Phase 1 hoàn thành.  
**Exit criteria**: Tất cả BDD scenarios trong Feature 1-5 pass.

---

### Task 2.1 — Tạo routes/sections.ts (CRUD for Course + Product)

**File**: `apps/api/src/routes/sections.ts` (file mới)  
**Tham khảo pattern**: `apps/api/src/routes/courses.ts`

**API endpoints**:

```
POST   /api/course/:entityId/sections          — Tạo section mới
GET    /api/course/:entityId/sections          — List sections (admin, includes tất cả)
PUT    /api/course/:entityId/sections/:id      — Update section
DELETE /api/course/:entityId/sections/:id      — Delete section
POST   /api/course/:entityId/sections/reorder  — Reorder

POST   /api/product/:entityId/sections         — Tạo section mới
GET    /api/product/:entityId/sections         — List sections
PUT    /api/product/:entityId/sections/:id     — Update
DELETE /api/product/:entityId/sections/:id     — Delete
POST   /api/product/:entityId/sections/reorder — Reorder
```

**Validation flow cho POST**:
```
1. Auth: authMiddleware("ADMIN")
2. Validate entity exists (course/product) → 404 nếu không
3. Validate body bằng zValidator với SectionCreateSchema
4. Check entity-scope: section_type có được phép cho entity này không? → 400
5. Check singleton: nếu SINGLETON_SECTION_TYPES.includes(section_type) AND đã tồn tại → 400
6. Check max limit: count sections hiện tại ≥ 30 → 400
7. Tính sort_order = MAX hiện tại + 1
8. Insert → return 201
```

**Body schema cho POST**:
```typescript
const SectionCreateSchema = z.object({
  section_type: SectionTypeSchema,
  title: z.string().optional(),
  config: z.union([z.string(), z.record(z.unknown())]),  // accept both string and object
});
```
→ Trong handler: parse config string → JSON, validate bằng SectionConfigSchema, lưu dạng JSON.stringify.

**Body schema cho PUT**:
```typescript
const SectionUpdateSchema = z.object({
  title: z.string().optional(),
  config: z.union([z.string(), z.record(z.unknown())]).optional(),
  is_published: z.boolean().optional(),
});
```

**Body schema cho POST reorder**:
```typescript
const ReorderSchema = z.object({
  ordered_ids: z.array(z.string()).min(1),
});
```
→ Validate: tất cả ids phải thuộc entity này, không thiếu id nào → 400.

**DB query pattern**:
```typescript
// List: 
db.select().from(sections)
  .where(and(eq(sections.entityType, entityType), eq(sections.entityId, entityId)))
  .orderBy(asc(sections.sortOrder));

// Create: tự tính sort_order
const existing = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${sections.sortOrder}), -1)` })
  .from(sections)
  .where(and(eq(sections.entityType, entityType), eq(sections.entityId, entityId)));
const newOrder = existing[0].maxOrder + 1;

// Reorder: dùng SQLite transaction
await db.transaction(async (tx) => {
  for (let i = 0; i < orderedIds.length; i++) {
    await tx.update(sections)
      .set({ sortOrder: i })
      .where(and(eq(sections.id, orderedIds[i]), eq(sections.entityId, entityId)));
  }
});
```

**BigO / Performance**:
- `CREATE`: O(1) — 2 queries (count + insert). Index trên (entity_type, entity_id) → count fast.
- `LIST`: O(n) — 1 query, n = số sections (max 30). Trivial.
- `UPDATE`: O(1) — 1 query by PK.
- `DELETE`: O(1) — 1 query by PK. Sort order của remaining sections không cần renumber (gap is fine).
- `REORDER`: O(m) — 1 transaction, m queries. m = len(ordered_ids), max 30 → <1ms.

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| client gửi config là JSON string | `JSON.parse()` trong handler, validate schema, lưu stringified |
| client gửi config là object | Validate trực tiếp, stringify khi lưu |
| config có extra fields không trong schema | Zod `.strict()` hoặc `.passthrough()`. Chọn `.passthrough()` để forward-compatible |
| race condition: 2 admin cùng tạo section | sort_order tính từ MAX + 1 trong cùng transaction → vẫn unique, order có thể không liên tục |
| entity_id không phải UUID của course/product | Query DB check existence trước khi insert → 404 |

**Verification**: Viết `apps/api/src/routes/sections.test.ts` (test theo BDD Feature 1, 2, 5b)

---

### Task 2.2 — Cập nhật route courses.ts để trả về sections

**File**: `apps/api/src/routes/courses.ts` (sửa)

**Thay đổi**:

1. Route `GET /api/courses/:slug` → thêm join với sections table:
```typescript
.get("/:slug", optionalAuth(), async (c) => {
  const slug = c.req.param("slug");
  const user = c.get("user");
  const isAdmin = user?.role === "ADMIN";

  const course = await db.select().from(courses)
    .where(and(eq(courses.slug, slug), 
      isAdmin ? undefined : eq(courses.isPublished, 1)))
    .limit(1);
  
  if (course.length === 0) return c.json({ error: "Not found" }, 404);

  // Fetch sections
  const sectionRows = await db.select().from(sections)
    .where(and(eq(sections.entityType, "course"), eq(sections.entityId, course[0].id)))
    .orderBy(asc(sections.sortOrder));

  // Parse config JSON → object
  const parsedSections = sectionRows
    .filter(s => isAdmin || s.isPublished)  // public: chỉ published
    .map(s => ({ ...s, config: JSON.parse(s.config) }));

  return c.json({ ...course[0], sections: parsedSections });
});
```

2. Route `GET /api/courses` (list) → KHÔNG thay đổi. Vẫn trả về meta only.

**Performance note**: 2 queries (course + sections), dùng index. Không cần join vì sections table nhỏ. Tổng O(1) lookup.

---

### Task 2.3 — Tạo route riêng cho Presets Page singleton

**File**: `apps/api/src/routes/presets.ts` (file mới)

**API**:
```
GET  /api/presets-page              → Trả về sections của presets_page singleton
PUT  /api/presets-page/sections     → CRUD sections cho presets (tương tự task 2.1 nhưng entity_type = "presets_page", entity_id = "singleton")
```

**Singleton auto-create logic** (trong GET):
```
1. Query sections WHERE entity_type="presets_page" AND entity_id="singleton"
2. Nếu không có rows → trả về { sections: [] }
3. Không auto-create — admin phải vào page builder để thêm section đầu tiên
```

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| Chưa có section nào | Trả về empty array, không lỗi |
| Admin vào page builder lần đầu | Tạo section đầu tiên → auto tạo singleton trong DB |
| Section type `product_grid` references deleted products | Render available products, skip invalid IDs (xử lý ở frontend) |

**Verification**: `apps/api/src/routes/presets.test.ts`

---

### Task 2.4 — Refactor promotions routes (M2M)

**File**: `apps/api/src/routes/promotions.ts` (sửa)

**Thay đổi API**:
```
POST   /api/promotions                    — Create + assign courses (body có course_ids[])
PUT    /api/promotions/:id                — Update campaign info
PATCH  /api/promotions/:id/toggle         — Toggle is_active
PUT    /api/promotions/:id/courses        — Update course assignments (body có course_ids[])
DELETE /api/promotions/:id                — Delete promotion
GET    /api/promotions                    — List all
GET    /api/promotions/:id                — Get detail + assigned courses
```

**Body schema CREATE**:
```typescript
const CreatePromotionSchema = z.object({
  campaign_name: z.string().min(1),
  discount_percentage: z.number().int().min(1).max(100),
  discount_amount: z.number().int().positive().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  course_ids: z.array(z.string()).min(1, "Phải gán ít nhất 1 khóa học"),
}).refine(data => {
  if (data.end_date && new Date(data.end_date) <= new Date()) {
    return false;
  }
  return true;
}, { message: "end_date phải là ngày trong tương lai" });
```

**DB write flow cho CREATE**:
```
1. Validate body
2. INSERT INTO promotions
3. INSERT INTO promotion_courses (promotion_id, course_id) cho từng course
4. Return promotion + course_ids
```

**DB write flow cho PUT /courses**:
```
1. DELETE FROM promotion_courses WHERE promotion_id = :id
2. INSERT INTO promotion_courses cho từng course_id mới
3. Return updated
```

**Active promotion resolver** (dùng trong GET courses/:slug):
```typescript
async function getActivePromotion(courseId: string) {
  const now = new Date().toISOString();
  const promos = await db.select()
    .from(promotions)
    .innerJoin(promotionCourses, eq(promotions.id, promotionCourses.promotionId))
    .where(and(
      eq(promotionCourses.courseId, courseId),
      eq(promotions.isActive, 1),
      or(
        isNull(promotions.startDate),
        lte(promotions.startDate, now)
      ),
      or(
        isNull(promotions.endDate),
        gte(promotions.endDate, now)
      )
    ))
    .orderBy(desc(promotions.discountPercentage), desc(promotions.startDate));

  // Highest discount wins. Same % → latest start_date wins.
  return promos[0]?.promotions ?? null;
}
```

**BigO**: O(p) với p = số promotions. p thường < 100 → < 10ms. Index trên `promotion_courses(course_id)` là composite PK → fast.

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| end_date < start_date | Zod refine: end_date > start_date |
| course_ids chứa id không tồn tại | Validate existence trước khi insert |
| Xóa promotion nhưng vẫn được hiển thị do cache | revalidatePath hoặc short TTL |
| Promotion không có start_date/end_date | Luôn active nếu is_active=true (promotion vĩnh viễn) |
| is_active=false nhưng trong date range | Không hiển thị (is_active ưu tiên cao nhất) |

**Verification**: Cập nhật `apps/api/src/routes/promotions.test.ts`

---

### Task 2.5 — Cập nhật route index.ts (register new routes)

**File**: `apps/api/src/index.ts` (sửa)

Thêm:
```typescript
import { sectionRoutes } from "./routes/sections";
import { presetsRoutes } from "./routes/presets";

// ...
.route("/api/course", sectionRoutes)        // :entityId/sections pattern
.route("/api/product", sectionRoutes)       // same handler, different entity_type
.route("/api/presets-page", presetsRoutes)
```

Vì `sectionRoutes` dùng chung cho cả course và product, cần design route handler để nhận entity_type từ context. Pattern:
```typescript
// sections.ts
export const sectionRoutes = new Hono()
  .use("*", async (c, next) => {
    // Extract entity_type from URL path: /api/course/... → "course"
    const path = c.req.path;
    const entityType = path.includes("/api/course/") ? "course" 
      : path.includes("/api/product/") ? "product" 
      : null;
    if (!entityType) return c.json({ error: "Invalid entity type" }, 400);
    c.set("entityType", entityType);
    await next();
  })
  .post("/:entityId/sections", authMiddleware("ADMIN"), ...)
  .get("/:entityId/sections", authMiddleware("ADMIN"), ...)
  // ...
```

**Verification**: `bun test apps/api/src/index.test.ts`

---

## Phase 3: Frontend Section Components

**Goal**: Tạo 22 section components có thể render từ config JSON.  
**Dependencies**: Phase 1 (types), Phase 2 (API — có thể mock).  
**Exit criteria**: Mỗi section component render đúng với mọi variant config, không crash với invalid config.

---

### Task 3.1 — Tạo SectionRenderer + Registry

**File**: `apps/web/src/components/sections/SectionRenderer.tsx` (mới)  
**Director**: `apps/web/src/components/sections/` (mới)

**Code pattern** (giống BlockRenderer nhưng cho sections):
```typescript
// apps/web/src/components/sections/SectionRenderer.tsx
import type { Section, SectionType } from "@workspace/types";

type SectionComponent = React.ComponentType<{
  config: unknown;
  entityMeta?: Record<string, unknown>;
}>;

const SECTION_MAP: Record<SectionType, SectionComponent> = {
  hero_banner:           HeroBannerSection,
  announcement_bar:      AnnouncementBarSection,
  // ... 22 entries
};

export function SectionRenderer({ sections, meta }: {
  sections: Pick<Section, "id" | "section_type" | "config" | "sort_order" | "is_published">[];
  meta?: Record<string, unknown>;
}) {
  const published = sections.filter(s => s.is_published !== false);
  published.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  
  return published.map(s => {
    const Comp = SECTION_MAP[s.section_type];
    if (!Comp) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SectionRenderer] Unknown section type: ${s.section_type}`);
      }
      return null;
    }
    let config: unknown = s.config;
    if (typeof config === "string") {
      try { config = JSON.parse(config); }
      catch {
        console.warn(`[SectionRenderer] Invalid JSON config for section ${s.id}`);
        return null;
      }
    }
    return <Comp key={s.id} config={config ?? {}} entityMeta={meta} />;
  });
}
```

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| Unknown section_type | Skip + console.warn (dev only) |
| config là string (chưa parse) | Parse JSON, fallback null → {} |
| config null/undefined | Dùng empty object, component dùng defaultProps |
| is_published = false | Lọc ra khỏi render array |
| sort_order trùng | Sort ổn định (keep original order) |

---

### Task 3.2 — Tạo từng section component

**Thư mục**: `apps/web/src/components/sections/`

Mỗi component có pattern:
1. 1 file `.tsx` (component chính)
2. 1 file `.module.scss` (style)
3. Optional: `.logic.ts` (hooks, animation — nếu cần GSAP)

**Danh sách 22 components** (ưu tiên theo độ khó):

| # | Component | Mức | Cần GSAP? | Cần fetch data? | Ghi chú |
|---|-----------|------|-----------|-----------------|---------|
| 1 | `hero-banner` | Easy | Có | No | Refactor từ `components/sections/hero-banner/` |
| 2 | `cta-section` | Easy | Không | No | Tương tự CTA Block |
| 3 | `stats-counter` | Easy | Có | No | Refactor từ `components/sections/counter-section/` |
| 4 | `image-gallery` | Medium | Không | No | Grid/Masonry layout |
| 5 | `video-showcase` | Medium | Không | No | YouTube embed grid |
| 6 | `rich-content` | Medium | Không | No | Wrap `BlockRenderer` từ `components/blocks/` |
| 7 | `faq-accordion` | Medium | Không | Có (auto_fetch) | Component accordion đã có ở `packages/ui` |
| 8 | `benefits-grid` | Easy | Không | No | Grid 3 cột icon + text |
| 9 | `brand-logos` | Easy | Không | No | Carousel logos |
| 10 | `student-counter` | Easy | Có | No | Counter animation |
| 11 | `guarantee-section` | Easy | Không | No | Card đơn giản |
| 12 | `lesson-count` | Easy | Có | No | Counter animation |
| 13 | `testimonials-carousel` | Medium | Có | Có (auto_fetch) | Carousel card |
| 14 | `featured-students` | Medium | Không | No | Grid student cards |
| 15 | `community-proof` | Medium | Không | No | Grid screenshots |
| 16 | `instructor-story` | Hard | Không | No | Rich text + avatar |
| 17 | `curriculum-grid` | Hard | Không | Có (auto_fetch) | Accordion lồng nhau |
| 18 | `bonus-gift-grid` | Medium | Không | No | Grid gift cards |
| 19 | `before-after-slider` | Hard | Có | No | Slider compare |
| 20 | `announcement-bar` | Easy | Có | No | Sticky top bar |
| 21 | `pricing-comparison` | Medium | Không | No | Table/Grid comparison |
| 22 | `product-grid` | Medium | Không | Có (show_all hoặc ids) | Grid ProductCard từ packages/ui |

**Component contract** (mọi component phải tuân theo):

```typescript
// Mỗi component export default 1 React component
export default function HeroBannerSection({ 
  config, 
  entityMeta 
}: {
  config: HeroBannerConfig;     // Type từ Zod schema
  entityMeta?: EntityMeta;      // Meta của entity (course/product) — optional
}) {
  // ...
}
```

**Rule cho mọi component**:
- KHÔNG fetch data trong component → data đã được resolve ở server-side (SSR)
- KHÔNG throw error → graceful degrade (render empty div hoặc hide)
- Có `className` prop để parent có thể style wrapper
- Responsive: mobile-first, test ở 320px, 768px, 1280px
- GSAP: dùng `useGSAP` hook từ `@gsap/react`, cleanup trong callback

**Verification**: Visual test bằng cách tạo 1 page test với tất cả 22 components.

---

### Task 3.3 — Server-side auto_fetch resolver

**File**: `apps/web/src/lib/section-resolver.ts` (mới)

**Problem**: Các section có `auto_fetch: true` cần resolve data từ DB tables. Nếu để client fetch → N+1 requests.  

**Giải pháp**: Server-side resolver, chạy trước khi trả response cho page.

```typescript
// apps/web/src/lib/section-resolver.ts
import { api } from "./api";

type ResolvedSection = Section & { resolved?: unknown };

const AUTO_FETCH_MAP: Record<string, (entityId: string) => Promise<unknown>> = {
  curriculum_grid: async (courseId) => {
    return api.fetchData(`/api/courses/${courseId}/modules`);
  },
  testimonials_carousel: async (courseId) => {
    return api.fetchData(`/api/courses/${courseId}/testimonials`);
  },
  faq_accordion: async (courseId) => {
    return api.fetchData(`/api/courses/${courseId}/faqs`);
  },
};

export async function resolveSections(
  sections: Section[],
  entityId: string
): Promise<ResolvedSection[]> {
  // Nhóm các section cùng auto_fetch type → 1 query mỗi type
  const typeGroups = new Map<string, Section[]>();
  for (const s of sections) {
    const fetchFn = AUTO_FETCH_MAP[s.section_type];
    const cfg = typeof s.config === "string" ? JSON.parse(s.config) : s.config;
    if (fetchFn && cfg?.auto_fetch) {
      const existing = typeGroups.get(s.section_type) ?? [];
      typeGroups.set(s.section_type, [...existing, s]);
    }
  }

  // Fetch parallel
  const results = await Promise.all(
    Array.from(typeGroups.entries()).map(async ([type, secs]) => {
      const data = await AUTO_FETCH_MAP[type](entityId);
      return secs.map(s => ({ ...s, resolved: data }));
    })
  );

  return sections.map(s => {
    const resolved = results.flat().find(r => r.id === s.id);
    return resolved ?? s;
  });
}
```

**Cách dùng** (trong page.tsx):
```typescript
export default async function CourseDetail({ params }: Props) {
  const course = await api.fetchData(`/api/courses/${params.slug}`);
  // sections đã được resolve từ API (auto_fetch data inline)
  // resolveSections chạy ở server-side nếu API chưa resolve
  return <SectionRenderer sections={course.sections} meta={course} />;
}
```

**Tuy nhiên**: Tốt hơn là resolve ở API layer (apps/api) trong 1 query duy nhất. Xem task 2.2 — course detail endpoint nên trả về toàn bộ resolved data.

**Decision**: Resolve auto_fetch ở apps/api (backend) — batches queries với `Promise.all`. Frontend chỉ render.

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| auto_fetch trả về rỗng | Component hiển thị empty state (hoặc hide section) |
| auto_fetch table không có data | Trả về [] |
| auto_fetch error | Log error, trả về section without resolved data |
| 2 sections cùng type cùng auto_fetch | Deduplicate query (fetch 1 lần, share data) |

---

### Task 3.4 — Wire up pages

**File**: `apps/web/src/app/(nguoi-dung)/khoa-hoc/[slug]/page.tsx` (sửa)  
**File**: `apps/web/src/app/(nguoi-dung)/san-pham/[id]/page.tsx` (sửa)

**Pattern cho course detail**:
```typescript
export default async function CourseDetail({ params }: Props) {
  const { slug } = await params;
  const course = await api.fetch(`/api/courses/${slug}`, { next: { revalidate: 300 } }); // ISR 5 min
  const data = await course.json();
  
  if (course.status === 404) notFound();
  
  return (
    <article>
      <SectionRenderer sections={data.sections} meta={data} />
    </article>
  );
}
```

**Presets page** (file mới):
```typescript
// apps/web/src/app/(nguoi-dung)/cong-cu/page.tsx (dùng route /cong-cu hoặc tạo mới /presets-luts)
export default async function PresetsPage() {
  const res = await api.fetch("/api/presets-page", { next: { revalidate: 300 } });
  const data = await res.json();
  return <SectionRenderer sections={data.sections} meta={data} />;
}
```

**Verification**: `bun run dev` → mở các page, check sections render đúng.

---

## Phase 4: Admin Page Builder UI

**Goal**: Admin có thể kéo-thả sections để build page.  
**Dependencies**: Phase 2 (API), Phase 3 (component registry).  
**Exit criteria**: Admin có thể: (1) xem danh sách sections hiện tại, (2) thêm section mới từ catalog, (3) kéo thả reorder, (4) edit config từng section, (5) enable/disable, (6) xóa.

---

### Task 4.1 — Tạo PageBuilder container component

**File**: `apps/web/src/components/admin/page-builder/PageBuilder.tsx` (mới)  
**Tham khảo**: `components/admin/block-editor/BlockEditor.tsx`

**Layout**:
```
┌──────────────────────────────────────────┐
│  Header: entity name + Save indicator   │
├────────────┬─────────────────────────────┤
│  Catalog   │  Preview / Canvas           │
│            │                             │
│  Group 1   │  ┌───────────────────────┐  │
│  - hero    │  │ hero_banner           │  │  ← Có thể kéo reorder
│  - banner  │  │ ● click to edit       │  │  ← Click mở config panel
│            │  │ ☰ drag handle         │  │
│  Group 2   │  │ 👁 toggle visibility  │  │
│  - stats   │  │ ✕ delete              │  │
│  - brands  │  └───────────────────────┘  │
│  - ...     │                             │
│            │  ┌───────────────────────┐  │
│  (drag từ  │  │ benefits_grid         │  │
│   catalog  │  │ ...                   │  │
│   sang      │  └───────────────────────┘  │
│   canvas)   │                             │
└────────────┴─────────────────────────────┘
```

**State management**:
```typescript
interface PageBuilderState {
  sections: Section[];          // Danh sách sections hiện tại
  selectedId: string | null;    // Section đang được edit config
  isSaving: boolean;            // Đang save?
  isDirty: boolean;             // Có thay đổi chưa save?
}
```

**Flow**:
1. Load sections từ API: `GET /api/{entity_type}/{entity_id}/sections`
2. Catalog: render available section types (grouped), filtered by entity scope
3. Drag từ catalog → canvas: tạo POST section mới
4. Drag trong canvas → reorder: POST reorder
5. Click section → mở config form (task 4.2)
6. Toggle visibility → PUT update is_published
7. Delete → confirm dialog → DELETE

**Dependencies**: `@dnd-kit/core` + `@dnd-kit/sortable` (đã có trong root package.json)

**Edge cases**:
| Edge | Cách xử lý |
|------|-----------|
| API error khi save | Toast error, keep local state, highlight unsaved |
| Section type không phù hợp với entity | Grayed out trong catalog + tooltip |
| Singleton type đã tồn tại | Ẩn khỏi catalog (hoặc disabled + badge "Đã thêm") |
| Đạt max 30 sections | Ẩn tất cả catalog items + message "Đã đạt giới hạn 30 sections" |
| Rời trang khi có unsaved changes | `beforeunload` event: confirm dialog |

---

### Task 4.2 — Tạo config form cho từng section type

**Thư mục**: `apps/web/src/components/admin/page-builder/config-forms/`

Mỗi section type có 1 form component:
```
config-forms/
  HeroBannerForm.tsx
  BenefitsGridForm.tsx
  StatsCounterForm.tsx
  ... (22 files)
```

**Form pattern** (mỗi form):
```typescript
interface FormProps<T> {
  config: T;
  onChange: (config: T) => void;  // Gọi mỗi khi field thay đổi
  onSave: () => void;
  isSaving: boolean;
}

export default function HeroBannerForm({ config, onChange, onSave, isSaving }: FormProps<HeroBannerConfig>) {
  return (
    <form className={styles.form}>
      <label>
        Tiêu đề
        <input 
          value={config.heading} 
          onChange={e => onChange({ ...config, heading: e.target.value })}
        />
      </label>
      {/* ... other fields */}
      <Button onClick={onSave} disabled={isSaving || !config.heading}>
        Lưu thay đổi
      </Button>
    </form>
  );
}
```

**Form rendering trong PageBuilder**: dùng dynamic import:
```typescript
const FORM_MAP: Record<SectionType, React.LazyComponent<FormProps>> = {
  hero_banner: lazy(() => import("./config-forms/HeroBannerForm")),
  // ...
};
```

**Common fields cần xử lý**:
| Field type | Component |
|-----------|-----------|
| Text input | `<input>` native |
| Textarea | `<textarea>` native |
| Rich text | BlockEditor (embed `components/admin/block-editor/`) |
| Media picker | `media-trigger` từ `components/admin/media-manager/` |
| Color picker | HTML `<input type="color">` |
| Select/Enum | `<select>` với các option |
| Toggle/Boolean | `<input type="checkbox">` hoặc toggle switch |
| Number | `<input type="number">` |
| Array of objects | Dynamic list: add/remove item, mỗi item là 1 sub-form |
| auto_fetch toggle | Toggle switch + helper text giải thích |

**Validation**:
- Client-side: disable Save button nếu có lỗi, show error message per field
- Zod schema dùng lại từ `packages/types` (import để validate trước khi gửi API)

---

### Task 4.3 — Tạo route pages trong admin

**File**: `apps/web/src/app/quan-tri-vien/khoa-hoc/[slug]/page.tsx` (sửa)  
**File**: `apps/web/src/app/quan-tri-vien/san-pham/[id]/page.tsx` (sửa)  
**File**: `apps/web/src/app/quan-tri-vien/presets-luts/page.tsx` (mới)

Mỗi page embed `PageBuilder` component:
```typescript
"use client";
export default function CourseAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <PageBuilder entityType="course" entityIdentifier={slug} />;
}
```

PageBuilder nhận `entityType` và `entityIdentifier` (slug hoặc id), tự fetch entity và sections.

**Verification**: Login admin → navigate đến `/quan-tri-vien/khoa-hoc/[slug]` → thấy page builder.

---

### Task 4.4 — Sửa admin sidebar + navigation

**File**: `apps/web/src/app/quan-tri-vien/layout.tsx` (sửa)

Thêm menu item:
```typescript
{ label: "Presets & LUTs", href: "/quan-tri-vien/presets-luts" },
```

---

## Phase 5: Integration Testing + Cleanup

**Goal**: Test end-to-end, clean up old code, ensure everything works.  
**Dependencies**: Phase 1-4 hoàn thành.  
**Exit criteria**: `bun run test` all green, `bun run lint` no errors, `bun run build` success.

---

### Task 5.1 — Viết integration test cho critical flows

**File**: `apps/api/src/index.test.ts` (sửa/cập nhật)

Test các flow:
1. Tạo course → thêm 3 sections → GET detail → verify sections order
2. Tạo promotion → gán 2 courses → GET course detail → verify active_promotion
3. Reorder sections → GET detail → verify new order
4. Disable section → GET public detail → verify hidden
5. Admin draft course → vẫn thấy (optionalAuth)

---

### Task 5.2 — Remove deprecated columns

**File**: `apps/api/src/db/schema.ts` (sửa)

Xóa các cột khỏi schema:
```typescript
// courses table: bỏ content_blocks, learning_outcomes
// Giữ lại nhưng đánh dấu @deprecated (không xóa để tránh lỗi build)
```

**Note**: Không xóa physical columns khỏi SQLite ngay → đánh dấu deprecated trong code, sẽ xóa ở phase sau khi chắc chắn không dùng.

---

### Task 5.3 — Seed script cập nhật

**File**: `apps/api/src/db/seed.ts` (sửa)

Thêm seed data cho:
- 1 course với 5 sections mẫu
- 1 product với 3 sections mẫu
- Presets page với 4 sections mẫu
- 1 promotion active + 1 promotion expired

---

### Task 5.4 — Final verification checklist

```bash
# 1. TypeScript
bun run --filter @workspace/types typecheck
cd apps/api && bun run --hot src/index.ts  # check no compile error

# 2. Tests
bun run test  # tất cả test pass

# 3. Lint
bun run lint  # biome lint: no errors

# 4. Build
bun run build  # tất cả apps build thành công

# 5. Manual smoke test
# - Login admin
# - Tạo course mới, thêm sections
# - Mở public page, verify sections render
# - Tạo promotion, gán course, verify giá
# - Presets page hiển thị sections
```

---

## Dependency Graph (Thứ tự thực hiện)

```
Phase 1 (Foundation)
├── 1.1 → 1.2 → 1.4 ──────────────┐
│                    ┌── 1.3 ──────┤
│                    │             │
▼                    ▼             ▼
Phase 2 (API)       Phase 2 (API)  Phase 2 (API)  
├── 2.1 ← 1.2       ├── 2.4 ← 1.3  ├── 2.2 ← 1.1+1.2
│   │                │              │
│   └── 2.3 ← 2.1   │              └── 2.5 (register)
│                    │
▼                    ▼
Phase 3 (Frontend)   Phase 4 (Admin)
├── 3.1 ← 1.1        ├── 4.1 ← 2.1+3.1
├── 3.2 ← 3.1        ├── 4.2 ← 4.1
├── 3.3 ← 2.2        ├── 4.3 ← 4.1+4.2
└── 3.4 ← 3.1+3.3    └── 4.4

Phase 5 (Integration)
└── 5.1 → 5.2 → 5.3 → 5.4
```

| Task | Depends On | Can Parallel With |
|------|-----------|------------------|
| 1.1 | - | - |
| 1.2 | 1.1 | - |
| 1.3 | - | 1.1, 1.2 |
| 1.4 | 1.2, 1.3 | - |
| 1.5 | 1.1 | 1.2, 1.3, 1.4 |
| 2.1 | 1.2, 1.5 | 2.2 |
| 2.2 | 1.1, 1.2, 1.5 | 2.1, 2.3 |
| 2.3 | 2.1 | 2.2, 2.4 |
| 2.4 | 1.3, 1.5 | 2.2, 2.3 |
| 2.5 | 2.1, 2.2, 2.3, 2.4 | - |
| 3.1 | 1.1, 1.5 | 3.2 (sau 3.1) |
| 3.2 | 3.1 | - |
| 3.3 | 2.2 | 3.2 |
| 3.4 | 3.1, 3.3 | - |
| 4.1 | 2.1, 3.1 | 4.2 (sau 4.1) |
| 4.2 | 4.1 | - |
| 4.3 | 4.1, 4.2 | 4.4 |
| 4.4 | - | 4.1, 4.2, 4.3 |
| 5.1 | 2.x | 5.2, 5.3 |
| 5.2 | 5.1 | 5.3 |
| 5.3 | - | 5.1, 5.2 |
| 5.4 | All | - |

---

## Summary

| Phase | Tasks | Est. Effort | Priority |
|-------|-------|------------|----------|
| 1 — Foundation | 5 tasks | 1 day | P0 (blocker) |
| 2 — API | 5 tasks | 2 days | P0 (blocker) |
| 3 — Frontend Components | 4 tasks | 3 days | P1 |
| 4 — Admin UX/UI | 4 tasks | 3 days | P1 |
| 5 — Integration | 4 tasks | 1 day | P2 |
| 6 — Quality Standards (applied throughout) | Ongoing | — | Mandatory gate |
| **Total** | **22 tasks** | **~10 days** | |

---

## Phase 6: UX/UI Quality Standards

**Goal**: Enforce premium, anti-generic design quality across all frontend output.  
**Dependencies**: Phase 3 (components), Phase 4 (admin).  
**Exit criteria**: Every page and component passes all checks before being considered "done".

---

### 6.0 Design Context (Inferred from existing project)

Based on the existing codebase analysis:

- **Page kind**: Course/product landing pages (marketing/sales), admin dashboard
- **Existing vibe**: Dark theme (`#0B0F19` bg), Manrope font, cinematic/luxury feel
- **Existing motion**: GSAP + ScrollTrigger (hero-banner, stagger-reveal, counter, animated-section)
- **Existing palette**: Dark background, muted text, primary accent, border colors → all via CSS custom properties
- **Framework**: Next.js 16 App Router + SCSS Modules + GSAP

**Design Read**: *"Reading this as: Creator-economy course landing pages for aspiring filmmakers, with a cinematic luxury language, leaning toward dark theme + Manrope + GSAP scroll-driven motion."*

**3 Dials (from taste-skill)**:
- `DESIGN_VARIANCE: 8` — Asymmetric layouts, bento grids, varied aspect ratios
- `MOTION_INTENSITY: 6` — GSAP scroll-reveal, staggered enters, counter animation, no excessive motion
- `VISUAL_DENSITY: 4` — Airy section spacing, generous whitespace, focused content per section

---

### 6.1 Typography Rules (mandatory for all section components)

| Rule | Requirement |
|------|------------|
| Display/Headlines | Max 2 lines on desktop. `--ff-display` (Manrope). `tracking-tighter leading-[1.1]`. Max `font-size: 3rem` at 1280px. |
| Subtext / Paragraphs | Max 20 words per subtext block. `--ff-sans`. `max-width: 65ch`. |
| Eyebrow restraint | Max 1 eyelash label (`text-xs uppercase tracking-widest`) per 3 sections. Never above every section. |
| Body copy measure | All `<p>` text capped at `max-width: 65ch` to prevent rivers of text. |
| Button text wraps | NEVER wrap CTA button text to 2 lines at desktop. Fix by shortening label or widening button. |
| Heading hierarchy | Only one `<h1>` per page (hero). Section headers use `<h2>`. Never skip levels. |
| Italic in headings | BANNED. Emphasis via weight, accent color, or underline — never italic. |
| Font consistency | ONE font family (`Manrope`) across the entire project. Already established — do not introduce new fonts. |
| Serif ban | NEVER introduce serif fonts. This is a sans-serif cinematic brand. |
| Typographic quotes | Use `" "` (real quotes) for testimonials. Not straight `"`. |

---

### 6.2 Color Calibration Rules

| Rule | Requirement |
|------|------------|
| One accent per page | Pick one accent color, use it everywhere (CTAs, highlights, active states). |
| Color consistency lock | A dark-themed site stays dark. NO "light section" in the middle of a dark page. |
| Contrast WCAG AA | Button text vs button bg: 4.5:1 contrast min (3:1 for large text ≥18px). Audit every CTA. |
| Form contrast | ALL form elements (inputs, placeholders, labels, focus rings, error text) pass WCAG AA against section background. |
| Button text visibility | White button with white text = BANNED. Ghost buttons over photos need backdrop/scrim/stroke. |
| No pure blacks | Use `--clr-bg` (`#0B0F19`) — never `#000000`. Off-blacks preserve depth. |
| No pure whites | Body text uses `--clr-text` (already muted), never `#ffffff` for body copy. |
| Palette lock | The existing CSS custom properties (`--clr-*`) from `packages/ui/styles/abstracts/_variables.scss` are the SINGLE source of truth. No inline hex in new code. |

---

### 6.3 Layout Rules (mandatory for section builder)

| Rule | Requirement |
|------|------------|
| Hero viewport fit | Hero MUST fit in viewport at desktop. Headline max 2 lines. Subtext max 20 words. CTAs visible without scroll. |
| Hero top padding | Max `pt-24` (6rem) at desktop. More = layout bug. |
| Hero element cap | Max 4 text elements in hero: eyelash (optional) + headline + subtext + CTAs (1 primary + max 1 secondary). NO trust logos, feature bullet lists, or avatar rows inside hero. |
| Logo wall placement | Trust/brand logos always BELOW hero, never inside it. |
| Section repetition ban | No two sections on same page with same layout family. 8 sections = at least 4 different layout families. |
| Zigzag alternation cap | Max 2 consecutive "image-left + text-right" / "text-left + image-right" sections. The 3rd consecutive image+text split = FAIL. |
| Bento cell count | Every cell in a bento grid has content. No empty placeholder cells. 3 items → 3 cells (not 4-grid with one empty). |
| Bento diversity | At least 2-3 cells in any multi-cell grid must have visual variation: real image, gradient, tinted bg, pattern. No 6 white-on-white text-only tiles. |
| Grid > Flex Math | NEVER `w-[calc(33%-1rem)]`. Use `grid grid-cols-1 md:grid-cols-3 gap-6`. |
| Mobile collapse | Every multi-column layout MUST have explicit `< 768px` fallback. Single column, `px-4`, `py-8`. |
| Viewport stability | Hero sections: `min-h-[100dvh]` — NEVER `h-screen` (iOS Safari address bar break). |
| Navigation | Render on ONE line at desktop. Max 80px height. Default 64-72px. Existing project already has a nav — maintain consistency. |
| Content density | Each section: 1 headline (≤ 8 words) + 1 subtext (≤ 25 words) + 1 visual asset OR 1 CTA. No data-dump sections. |
| Long lists | > 5 items → 2-column split, card grid, tabs, accordion, or horizontal scroll. NEVER a long `<ul>` with hairlines. |

---

### 6.4 Motion & Animation Rules

| Rule | Requirement |
|------|------------|
| Motion motivation | Every animation must have a purpose: hierarchy, storytelling, feedback, state transition. NOT "it looked cool." |
| Reduced motion | ALL animations honor `prefers-reduced-motion`. GSAP: check `useReducedMotion()`. CSS: gate behind `@media (prefers-reduced-motion: no-preference)`. |
| Animate transform + opacity only | NEVER animate `top`, `left`, `width`, `height`. Only `transform` and `opacity`. |
| No `window.addEventListener("scroll")` | Use GSAP ScrollTrigger, Motion's `useScroll()`, or `IntersectionObserver`. |
| ScrollTrigger discipline | `start: "top top"` for pin/stack patterns. NOT `"top center"` (halfway trigger = broken). |
| Marquee restraint | Max ONE horizontal scrolling marquee per page. Two or more = lazy filler. |
| Stagger patterns | Use GSAP ScrollTrigger for sticky-stack/complex pinning. Use `whileInView` + `staggerChildren` for simple "enter on scroll." |
| Hover feedback | All clickable elements: `scale-[0.98]` or `-translate-y-[1px]` on `:active`. |
| Z-index discipline | NO random `z-50`/`z-10`. Scale: 1=content, 10=sticky-nav, 20=modal, 60=grain overlay. |
| No infinite loops | No auto-spinning carousels, pulsing cards, or infinite micro-animations. Every animation ends. |

---

### 6.5 Card & Interactive Element Rules

| Rule | Requirement |
|------|------------|
| Card shadow | If shadow is used, tint it to background hue. No pure-black drop shadows. |
| Corner radius lock | Pick ONE radius scale: all-sharp (0), all-soft (12-16px), or all-pill (full radius). Mixed = broken unless documented. |
| 8-state discipline | Every interactive element: default, hover, `:focus-visible`, `:active`, disabled, loading, error, success. |
| Focus visible | All interactive elements have visible focus ring (2px solid accent, 2px offset). No `outline: none` without replacement. |
| CTA intent consistency | ONE label per intent per page. "Mua ngay" / "Đăng ký ngay" / "Tham gia" = all "purchase" → pick ONE. |
| CTA placement | Primary CTA always in hero, never buried. Secondary CTA max 1, placed after primary. |
| Placeholder ban | No `placeholder` as label. Always `<label>` ABOVE input. |
| Card usage | Cards only when elevation communicates hierarchy. Otherwise `border-t`, `divide-y`, or negative space. |

---

### 6.6 Page Builder Admin UX (specific to Admin UI — Phase 4)

| Rule | Requirement |
|------|------------|
| Empty state | When course has 0 sections: prominent CTA "Thêm section đầu tiên" + gallery of available section types with preview thumbnails. |
| Loading state | Skeleton loaders matching final layout shape. NO generic circular spinners. |
| Error state | Inline error messages per field. Toast only for transient notifications (save success, network error). |
| Tactile feedback | Drag handle: cursor `grab` → `grabbing`. Drop zone: highlight border pulse. Button: `scale-[0.98]` on `:active`. |
| Drag affordance | Section catalog items show drag cursor + "Kéo vào page" tooltip on hover. |
| Config form feedback | Save button disabled when form invalid. Field-level errors in real-time (not on submit only). |
| Undo capability | No undo in MVP. Confirm dialog before delete. "Bạn có chắc muốn xóa section này?" |
| Unsaved changes | `beforeunload` event → confirm dialog if sections modified but not saved. |
| Catalog grouping | Section types grouped by category (Hero, Social Proof, Content, Media, Testimonials, Conversion) with collapsible headers. |
| Toast notifications | Success: green 3s auto-dismiss. Error: red 5s with retry button. Position: bottom-right. |
| Keyboard accessibility | All interactions reachable via keyboard: Tab to navigate sections, Enter to select, Space to toggle, Delete to remove, Arrow keys to reorder. |
| Mobile admin | Page builder works on tablet (768px+). Below 768px: simplified list view, no drag-drop (use up/down buttons), single-column. |

---

### 6.7 Anti-Pattern Checklist (Pre-Shipping Gate for every section component)

Before marking any section component "done", verify NONE of these are present:

| # | Anti-Pattern | Check |
|---|-------------|-------|
| 1 | AI-purple/blue glow gradients | ❌ Banned |
| 2 | Equal 3-column feature cards (3 identical cards in a row) | ❌ Use 2-col zigzag or varied layout |
| 3 | Eyebrow label above EVERY section | ❌ Max 1 per 3 sections |
| 4 | Centered hero with dark mesh background | ❌ Especially banned — brand is dark already |
| 5 | CTA text wrapping to 2 lines at desktop | ❌ Fix by shortening label |
| 6 | Two CTAs with same intent (e.g., "Mua ngay" + "Đăng ký") | ❌ One label per intent |
| 7 | Italian/script font for decorative emphasis | ❌ No font mixing |
| 8 | Fake browser chrome / phone frames / IDE windows | ❌ Banen outright |
| 9 | Invented metrics (e.g., "+47% conversion", "50,000+ teams") | ❌ Use real data or skip metric |
| 10 | Long `<ul>` with `border-b` on every row (spec sheet) | ❌ Card grid, tabs, or disclosing |
| 11 | Light section between dark sections (theme flip) | ❌ Page lock: one theme |
| 12 | `h-screen` instead of `min-h-[100dvh]` | ❌ iOS break |
| 13 | Buttons without `:focus-visible` outline | ❌ a11y fail |
| 14 | `outline: none` without replacement | ❌ a11y fail |
| 15 | Placeholder as label | ❌ `<label>` above input |
| 16 | Pure `#000` or `#fff` anywhere | ❌ Use CSS vars only |

---

### 6.8 Existing Project-Specific Rules

These rules are inferred from the existing codebase and MUST be followed:

| Rule | Source |
|------|--------|
| **SCSS Modules** — all new components use `.module.scss`, no Tailwind classes. | Project convention (`package.json` has no tailwind). |
| **CSS Custom Properties** — all colors use `var(--clr-*)` from `packages/ui/styles/abstracts/_variables.scss`. | Existing design token system. |
| **Fluid Typography** — use `fluid-type()` SCSS mixin for responsive font sizes. | Already defined in `_functions.scss`. |
| **GSAP + `@gsap/react`** — motion via `useGSAP()` hook + `ScrollTrigger`. Client components gated with `"use client"`. | Existing stack. |
| **Next.js 16 App Router** — Server Components by default. Client Components only where interactivity required. | Framework convention. |
| **`@workspace/ui` imports** — reuse existing atoms/molecules/organisms from `packages/ui`. New section-specific components go in `apps/web/src/components/sections/`. | Monorepo conventions. |
| **Lucide React icons** — already established as icon library. ONE family, don't mix. | Already in deps. |
| **Manrope font** — already loaded via `next/font/google`. Do NOT add new fonts. | Root layout. |

---

### 6.9 Pre-Shipping Gate (every task output)

Before marking any Phase 3 or Phase 4 task complete, the developer MUST verify:

```
[ ] Typography — headings ≤ 2 lines, body ≤ 65ch, no italic headers, no serif
[ ] Color — use CSS vars only, WCAG AA contrast, no theme flip mid-page
[ ] Layout — grid > flex-math, mobile collapsed, min-h-[100dvh], no h-screen
[ ] Motion — purpose-driven, reduced-motion safe, transform/opacity only
[ ] Interactivity — 8 states, focus-visible, tactile feedback, no placeholder-as-label
[ ] Anti-pattern — none of the 16 banned patterns present
[ ] Project — SCSS module, CSS vars, GSAP, no new fonts, no Tailwind
[ ] Responsive — renders at 320/768/1280 without horizontal scroll
```
