# Implementation Prototypes — Code Patterns cho Từng Module

File này chứa prototype code cho tất cả module quan trọng. Mỗi prototype thể hiện pattern chuẩn sẽ áp dụng trong implementation.

---

## 1. Drizzle Schema — SQLite WAL Mode

```typescript
// apps/api/src/db/index.ts
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("data/app.db");
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA busy_timeout = 5000");
sqlite.run("PRAGMA foreign_keys = ON");

export const db = drizzle(sqlite);
```

```typescript
// apps/api/src/db/schema.ts
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  contentBlocks: text("content_blocks"), // JSON Block[]
  basePrice: integer("base_price").notNull(),
  originalPrice: integer("original_price"),
  thumbnailUrl: text("thumbnail_url"),
  trailerVideoUrl: text("trailer_video_url"),
  externalCheckoutUrl: text("external_checkout_url"),
  isPublished: integer("is_published").default(0),
  isFeaturedOnHome: integer("is_featured_on_home").default(0),
  isComboOnly: integer("is_combo_only").default(0),
  buttonText: text("button_text"),
  ratingCount: text("rating_count"),
  learningOutcomes: text("learning_outcomes"), // JSON string[]
  level: text("level"), // beginner | intermediate | advanced | all
  certificate: integer("certificate").default(0),
  featuredOrder: integer("featured_order").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const courseModules = sqliteTable("course_modules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  learningOutcomes: text("learning_outcomes"), // JSON string[]
  sortOrder: integer("sort_order").notNull().default(0),
});

export const courseLessons = sqliteTable("course_lessons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  moduleId: text("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("video"), // video | text | quiz | assignment | resource
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  contentBlocks: text("content_blocks"), // JSON Block[] (cho type=text)
  resources: text("resources"), // JSON [{ name, url, type }]
  isFreePreview: integer("is_free_preview").default(0),
  isPublished: integer("is_published").default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("USER"), // ADMIN | USER
  googleId: text("google_id"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => postCategories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  contentBlocks: text("content_blocks"), // JSON Block[]
  thumbnailUrl: text("thumbnail_url"),
  seoDescription: text("seo_description"),
  author: text("author"),
  readTime: integer("read_time"),
  isPublished: integer("is_published").default(0),
  publishedAt: text("published_at"),
  views: integer("views").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// ... remaining 11 tables follow same pattern
// faqs, testimonials, promotions, leads, portfolios, digitalProducts,
// courseBonuses, instructors, courseInstructors, postCategories, productShowcases
```

---

## 2. Seed Script — Idempotent

```typescript
// apps/api/src/db/seed.ts
import { db } from "./index";
import { users, courses, siteSettings, posts } from "./schema";
import { eq } from "drizzle-orm";
import { mockCourses, mockArticles } from "../../../apps/web/src/lib/mockData";

async function seed() {
  // ---- Admin user ----
  const [existing] = await db.select().from(users).where(eq(users.email, "admin@minhtravel.vn"));
  if (!existing) {
    const hash = await Bun.password.hash("admin123", { algorithm: "bcrypt", cost: 12 });
    await db.insert(users).values({
      id: crypto.randomUUID(),
      email: "admin@minhtravel.vn",
      passwordHash: hash,
      name: "Admin",
      role: "ADMIN",
    });
    console.log("✓ Admin user seeded");
  } else {
    console.log("• Admin user exists, skipping");
  }

  // ---- Courses ----
  for (const course of mockCourses) {
    const [existing] = await db.select().from(courses).where(eq(courses.slug, course.slug));
    if (!existing) {
      await db.insert(courses).values({
        id: crypto.randomUUID(),
        slug: course.slug,
        title: course.title,
        description: course.description,
        basePrice: course.price,
        thumbnailUrl: course.thumbnail,
        externalCheckoutUrl: course.externalCheckoutUrl || null,
        isComboOnly: course.isComboOnly ? 1 : 0,
        buttonText: course.buttonText || null,
        ratingCount: course.ratingCount || null,
        isPublished: 1,
        isFeaturedOnHome: course.isFeatured ? 1 : 0,
      });
    }
  }
  console.log(`✓ ${mockCourses.length} courses seeded`);

  // ---- Site Settings (55 keys) ----
  const defaults: Record<string, string> = {
    site_title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
    site_description: "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel.",
    theme_color: "#0B0F19",
    hero_youtube_id: "utP7z6_Zcwg",
    hero_tagline: "Kể câu chuyện của bạn qua từng khung hình",
    hero_btn1_text: "KHOÁ HỌC CỦA TÔI",
    hero_btn1_url: "https://hoc.minhtravel.vn/",
    hero_btn2_text: "ĐĂNG KÝ HỌC",
    hero_btn2_url: "/khoa-hoc",
    // ... remaining ~45 keys
  };

  for (const [key, value] of Object.entries(defaults)) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoNothing();
  }
  console.log(`✓ ${Object.keys(defaults).length} site settings seeded`);

  console.log("\nSeed complete!");
}

seed().catch(console.error);
```

---

## 3. Hono API — Course Routes (Full Pattern)

```typescript
// apps/api/src/routes/courses.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { courses, courseModules, courseLessons } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

// --- Zod Schemas (ideally from @workspace/types) ---
const CourseQuerySchema = z.object({
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const CreateCourseSchema = z.object({
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  slug: z.string().min(3).optional(),
  description: z.string().min(1),
  basePrice: z.number().int().positive(),
  thumbnailUrl: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]).optional(),
  isPublished: z.boolean().optional(),
  learningOutcomes: z.array(z.string()).optional(),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

// --- Helpers ---
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

// --- Routes ---
export const coursesRoutes = new Hono()

  // ===== PUBLIC =====

  // GET /api/courses?published=true&featured=true&search=tiktok&page=1&limit=12
  .get("/", zValidator("query", CourseQuerySchema), async (c) => {
    const { published, featured, search, page, limit } = c.req.valid("query");

    let query = db.select().from(courses).$dynamic();

    if (published) query = query.where(eq(courses.isPublished, 1));
    if (featured) query = query.where(eq(courses.isFeaturedOnHome, 1));
    if (search) query = query.where(sql`${courses.title} LIKE ${`%${search}%`}`);

    const totalQuery = db.select({ count: sql<number>`count(*)` }).from(courses);
    // ... count logic

    const result = await query
      .orderBy(desc(courses.updatedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json(result);
  })

  // GET /api/courses/:slug
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.slug, slug), eq(courses.isPublished, 1)));

    if (!course) return c.json({ error: "Not found" }, 404);
    return c.json(course);
  })

  // ===== ADMIN =====

  // POST /api/courses
  .post("/", authMiddleware("ADMIN"), zValidator("json", CreateCourseSchema), async (c) => {
    const data = c.req.valid("json");
    const slug = data.slug || slugify(data.title);

    // Check slug uniqueness
    const [existing] = await db.select().from(courses).where(eq(courses.slug, slug));
    if (existing) {
      return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
    }

    const id = crypto.randomUUID();
    await db.insert(courses).values({
      id,
      slug,
      title: data.title,
      description: data.description,
      basePrice: data.basePrice,
      thumbnailUrl: data.thumbnailUrl,
      level: data.level,
      isPublished: data.isPublished ? 1 : 0,
      learningOutcomes: data.learningOutcomes ? JSON.stringify(data.learningOutcomes) : null,
    });

    const [created] = await db.select().from(courses).where(eq(courses.id, id));
    return c.json(created, 201);
  })

  // PUT /api/courses/:id
  .put("/:id", authMiddleware("ADMIN"), zValidator("json", UpdateCourseSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    if (!course) return c.json({ error: "Not found" }, 404);

    // If slug changed, check uniqueness
    if (data.slug) {
      const [dup] = await db
        .select()
        .from(courses)
        .where(and(eq(courses.slug, data.slug), sql`${courses.id} != ${id}`));
      if (dup) return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
    }

    await db
      .update(courses)
      .set({
        ...data,
        learningOutcomes: data.learningOutcomes
          ? JSON.stringify(data.learningOutcomes)
          : undefined,
        isPublished: data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courses.id, id));

    const [updated] = await db.select().from(courses).where(eq(courses.id, id));
    return c.json(updated);
  })

  // DELETE /api/courses/:id
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(courses).where(eq(courses.id, id));
    return c.json({ success: true });
  })

  // GET /api/courses/:id/curriculum
  .get("/:id/curriculum", async (c) => {
    const courseId = c.req.param("id");

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.sortOrder);

    // Fetch lessons for each module
    const curriculum = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.moduleId, mod.id))
          .orderBy(courseLessons.sortOrder);
        return { ...mod, lessons };
      })
    );

    return c.json(curriculum);
  });

// Export type for Hono RPC
export type CoursesRoutes = typeof coursesRoutes;
```

---

## 4. Auth Middleware + JWT

```typescript
// apps/api/src/middleware/auth.ts
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function authMiddleware(requiredRole?: "ADMIN" | "USER") {
  return createMiddleware<{
    Variables: { user: { userId: string; email: string; role: string } };
  }>(async (c, next) => {
    const header = c.req.header("Authorization");
    const token = header?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "Unauthorized — missing token" }, 401);
    }

    try {
      const payload = await verify(token, JWT_SECRET);
      const user = payload as { userId: string; email: string; role: string };

      if (requiredRole && user.role !== requiredRole) {
        return c.json({ error: "Forbidden — insufficient permissions" }, 403);
      }

      c.set("user", user);
      await next();
    } catch {
      return c.json({ error: "Unauthorized — invalid or expired token" }, 401);
    }
  });
}
```

```typescript
// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sign } from "hono/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRY = 60 * 60 * 24; // 24 hours

const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const authRoutes = new Hono()

  .post("/login", zValidator("json", LoginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) {
      return c.json({ error: "Email hoặc mật khẩu không đúng" }, 401);
    }

    const valid = await Bun.password.verify(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "Email hoặc mật khẩu không đúng" }, 401);
    }

    if (user.role !== "ADMIN") {
      return c.json({ error: "Không có quyền truy cập admin" }, 403);
    }

    const token = await sign(
      { userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY },
      JWT_SECRET
    );

    return c.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })

  .post("/register", zValidator("json", RegisterSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return c.json({ error: "Email đã được sử dụng" }, 409);
    }

    const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      email,
      passwordHash: hash,
      name,
      role: "USER",
    });

    const token = await sign(
      { userId: id, email, role: "USER", exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY },
      JWT_SECRET
    );

    return c.json({ token, user: { id, email, name, role: "USER" } }, 201);
  })

  .get("/me", async (c) => {
    const header = c.req.header("Authorization");
    const token = header?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Unauthorized" }, 401);

    try {
      const payload = await verify(token, JWT_SECRET) as { userId: string };
      const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
      if (!user) return c.json({ error: "User not found" }, 404);

      return c.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  });

export type AuthRoutes = typeof authRoutes;
```

---

## 5. Site Settings — API + Cache

```typescript
// apps/api/src/routes/settings.ts
import { Hono } from "hono";
import { db } from "../db";
import { siteSettings } from "../db/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";

const BatchSchema = z.record(z.string(), z.string());

export const settingsRoutes = new Hono()

  // GET /api/settings — public, cached
  .get("/", async (c) => {
    const rows = await db.select().from(siteSettings);
    c.header("Cache-Control", "public, max-age=60");
    return c.json(rows);
  })

  // PUT /api/settings/batch — admin only
  .put("/batch", authMiddleware("ADMIN"), zValidator("json", BatchSchema), async (c) => {
    const batch = c.req.valid("json");
    let count = 0;

    for (const [key, value] of Object.entries(batch)) {
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date().toISOString() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date().toISOString() },
        });
      count++;
    }

    return c.json({ updated: count, keys: Object.keys(batch) });
  });

export type SettingsRoutes = typeof settingsRoutes;
```

---

## 6. Frontend — Server Component Data Fetching

```typescript
// apps/web/src/lib/settings.ts
import { cache } from "react";
import { api } from "./rpc";

export const getSiteSettings = cache(async () => {
  const res = await api.settings.$get();
  const rows = await res.json();

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
});

export function parseSetting<T>(settings: Record<string, string>, key: string, fallback: T): T {
  try {
    const val = settings[key];
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
```

```typescript
// apps/web/src/app/(nguoi-dung)/khoa-hoc/page.tsx
import { api } from "@/lib/rpc";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Danh sách khóa học quay dựng, chỉnh màu chuyên nghiệp.",
};

export default async function CoursesPage() {
  const [coursesRes, faqsRes] = await Promise.all([
    api.courses.$get({ query: { published: "true" } }),
    api.faqs.$get({ query: {} }),
  ]);

  const courses = await coursesRes.json();
  const faqs = await faqsRes.json();
  const settings = await getSiteSettings();

  return (
    <div>
      <h1>{settings.courses_page_hero_title || "Khóa học"}</h1>
      <div className="grid">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            slug={course.slug}
            title={course.title}
            price={course.basePrice}
            thumbnail={course.thumbnailUrl}
            ratingCount={course.ratingCount}
            buttonText={course.buttonText}
          />
        ))}
      </div>
      <section>
        <h2>{settings.courses_page_faq_heading || "FAQ"}</h2>
        {faqs.map((faq) => (
          <Accordion key={faq.id} title={faq.question}>
            {faq.answer}
          </Accordion>
        ))}
      </section>
    </div>
  );
}
```

---

## 7. Block Renderer (Public Frontend)

```typescript
// apps/web/src/components/blocks/BlockRenderer.tsx
import type { Block } from "@workspace/types";
import { HeadingBlock, ParagraphBlock, ImageBlock, VideoBlock } from "./typography";
import { AccordionBlock, CTABlock, DividerBlock } from "./interactive";

const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ data: any }>> = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  quote: QuoteBlock,
  list: ListBlock,
  code: CodeBlock,
  callout: CalloutBlock,
  image: ImageBlock,
  video: VideoBlock,
  gallery: GalleryBlock,
  carousel: CarouselBlock,
  beforeAfter: BeforeAfterBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  columns: ColumnsBlock,
  tabs: TabsBlock,
  accordion: AccordionBlock,
  collapse: CollapseBlock,
  timeline: TimelineBlock,
  table: TableBlock,
  cta: CTABlock,
  pricingTable: PricingBlock,
  testimonial: TestimonialBlock,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="block-content">
      {blocks.map((block) => {
        const Comp = BLOCK_COMPONENTS[block.type];
        if (!Comp) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }
        return <Comp key={block.id} data={block.data} />;
      })}
    </div>
  );
}

// Example block component
export function HeadingBlock({ data }: { data: { level: number; text: string; alignment?: string } }) {
  const Tag = `h${data.level}` as keyof JSX.IntrinsicElements;
  return <Tag style={{ textAlign: (data.alignment as any) || "left" }}>{data.text}</Tag>;
}
```

---

## 8. Media — Upload + Optimize

```typescript
// apps/media/src/services/validator.ts
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/avif": [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "video/mp4": [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

const ALLOWED = {
  image: { maxSize: 50 * 1024 * 1024, exts: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"] },
  video: { maxSize: 500 * 1024 * 1024, exts: [".mp4", ".webm"] },
  document: { maxSize: 100 * 1024 * 1024, exts: [".pdf"] },
};

export async function validateFile(file: File): Promise<ValidatedFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const header = buffer.slice(0, 12);

  // Detect real MIME from magic bytes
  const detectedType = Object.entries(MAGIC_BYTES).find(([, sig]) =>
    sig.every((byte, i) => header[i] === byte)
  )?.[0];

  if (!detectedType) throw new ValidationError("Không thể xác định loại file");

  const category = detectedType.startsWith("image/") ? "image"
    : detectedType.startsWith("video/") ? "video"
    : "document";

  if (!ALLOWED[category]) throw new ValidationError("Loại file không được hỗ trợ");
  if (file.size > ALLOWED[category].maxSize) {
    throw new ValidationError(`File quá lớn. Tối đa: ${ALLOWED[category].maxSize / 1024 / 1024}MB`);
  }

  return { buffer, mimeType: detectedType, size: file.size, category };
}
```

```typescript
// apps/media/src/services/optimizer.ts
import sharp from "sharp";

export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  id: string
): Promise<OptimizationResult> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Auto-rotate + strip all metadata
  const base = image
    .rotate()
    .resize(2560, 2560, { fit: "inside", withoutEnlargement: true })
    .withMetadata({});

  // Generate WebP
  await base.clone().webp({ quality: 82, effort: 4 }).toFile(`${outputDir}/${id}/optimized.webp`);

  // Generate AVIF
  await base.clone().avif({ quality: 65, effort: 4 }).toFile(`${outputDir}/${id}/optimized.avif`);

  return {
    width: metadata.width!,
    height: metadata.height!,
    format: "webp",
  };
}
```

---

## 9. Bun Test — Pattern cho Mọi API Route

```typescript
// apps/api/src/routes/courses.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../db";
import { courses } from "../db/schema";
import { eq } from "drizzle-orm";

// Helper: start Hono app for testing
const app = new Hono().route("/api/courses", coursesRoutes);
const BASE = "http://localhost/api/courses";

// Admin token for authenticated tests
let adminToken: string;

beforeAll(async () => {
  // Login to get token
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@minhtravel.vn", password: "admin123" }),
  });
  const data = await res.json();
  adminToken = data.token;
});

afterAll(async () => {
  // Cleanup test data
  await db.delete(courses).where(eq(courses.slug, "test-course"));
});

describe("GET /api/courses", () => {
  test("returns published courses", async () => {
    const res = await app.request(`${BASE}?published=true`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((c: any) => expect(c.isPublished).toBe(1));
  });

  test("filters by search query", async () => {
    const res = await app.request(`${BASE}?published=true&search=TikTok`);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((c: any) => expect(c.title.toLowerCase()).toContain("tiktok"));
  });

  test("returns empty array for no match", async () => {
    const res = await app.request(`${BASE}?published=true&search=xxxxxxxxxx_nonexistent`);
    const data = await res.json();
    expect(data.length).toBe(0);
  });
});

describe("POST /api/courses (Admin)", () => {
  test("creates a course successfully", async () => {
    const res = await app.request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Test Course — Minimal 10 chars",
        description: "Test description",
        basePrice: 500000,
        isPublished: false,
      }),
    });

    expect(res.status).toBe(201);
    const course = await res.json();
    expect(course.slug).toBe("test-course-minimal-10-chars");
    expect(course.isPublished).toBe(0);
  });

  test("rejects title shorter than 10 chars", async () => {
    const res = await app.request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Short" }),
    });
    expect(res.status).toBe(400);
  });

  test("rejects duplicate slug", async () => {
    const res = await app.request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Test Course — Minimal 10 chars",
        slug: "test-course-minimal-10-chars",
        description: "Test",
        basePrice: 500000,
      }),
    });
    expect(res.status).toBe(409);
  });

  test("returns 401 without token", async () => {
    const res = await app.request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Course — Minimal 10 chars", description: "...", basePrice: 1 }),
    });
    expect(res.status).toBe(401);
  });
});

// Time complexity test
describe("Performance", () => {
  test("GET /api/courses completes under 50ms with 100 courses", async () => {
    const start = performance.now();
    const res = await app.request(`${BASE}?published=true&limit=100`);
    const elapsed = performance.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(50); // SQLite in-process reads should be fast
  });
});
```

---

## 10. Block Editor — Undo/Redo Hook

```typescript
// apps/web/src/components/blocks/useBlockEditor.ts
import { useState, useCallback, useRef } from "react";
import type { Block, BlockType } from "@workspace/types";

function getDefaultData(type: BlockType): any {
  const defaults: Record<string, any> = {
    heading: { level: 2, text: "", alignment: "left" },
    paragraph: { text: "", alignment: "left" },
    image: { mediaId: "", width: "wide" },
    video: { mediaId: "", aspectRatio: "16:9" },
    divider: { style: "solid" },
    spacer: { height: 40 },
    cta: { heading: "", buttonText: "", buttonUrl: "", style: "primary" },
    columns: { columns: 2, content: [[], []], gap: "md" },
    accordion: { items: [{ title: "", content: [] }], allowMultiple: true },
    // ... all types
  };
  return defaults[type] || {};
}

const MAX_HISTORY = 50;

export function useBlockEditor(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const historyRef = useRef<Block[][]>([initialBlocks]);
  const pointerRef = useRef(0);

  const pushHistory = useCallback((next: Block[]) => {
    historyRef.current = [
      ...historyRef.current.slice(0, pointerRef.current + 1),
      next,
    ].slice(-MAX_HISTORY);
    pointerRef.current = Math.min(historyRef.current.length - 1, MAX_HISTORY - 1);
  }, []);

  const addBlock = useCallback((type: BlockType, index?: number) => {
    setBlocks((prev) => {
      const block: Block = { id: crypto.randomUUID(), type, data: getDefaultData(type) };
      const next = [...prev];
      index !== undefined && index <= next.length
        ? next.splice(index, 0, block)
        : next.push(block);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const updateBlock = useCallback((id: string, data: any) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, data } : b));
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const reorderBlocks = useCallback((from: number, to: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed!);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current--;
      setBlocks(historyRef.current[pointerRef.current]!);
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current++;
      setBlocks(historyRef.current[pointerRef.current]!);
    }
  }, []);

  return {
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
  };
}
```

---

## 11. Zod — Block Discriminated Union (Type-Safe)

```typescript
// packages/types/src/schemas/blocks.ts
import { z } from "zod";

const BaseBlock = z.object({
  id: z.string().uuid(),
  type: z.string(),
});

const HeadingBlock = BaseBlock.extend({
  type: z.literal("heading"),
  data: z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
    text: z.string().min(1),
    alignment: z.enum(["left", "center", "right"]).default("left"),
  }),
});

const ParagraphBlock = BaseBlock.extend({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string().min(1),
    alignment: z.enum(["left", "center", "right"]).default("left"),
    dropCap: z.boolean().default(false),
  }),
});

const ImageBlock = BaseBlock.extend({
  type: z.literal("image"),
  data: z.object({
    mediaId: z.string().uuid(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.enum(["full", "wide", "contained", "inline"]).default("wide"),
    border: z.boolean().default(false),
  }),
});

// Recursive: columns contain blocks
const ColumnsBlock = BaseBlock.extend({
  type: z.literal("columns"),
  data: z.object({
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    content: z.array(z.array(z.lazy(() => BlockSchema))),
    gap: z.enum(["sm", "md", "lg"]).default("md"),
  }),
});

const AccordionBlock = BaseBlock.extend({
  type: z.literal("accordion"),
  data: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        content: z.array(z.lazy(() => BlockSchema)),
      })
    ),
    allowMultiple: z.boolean().default(true),
  }),
});

// THE RECURSIVE TYPE — discriminated union of all blocks
type AllBlockTypes =
  | z.infer<typeof HeadingBlock>
  | z.infer<typeof ParagraphBlock>
  | z.infer<typeof ImageBlock>
  | z.infer<typeof ColumnsBlock>
  | z.infer<typeof AccordionBlock>
  // ... remaining 16 types
  ;

type Block = AllBlockTypes;

const BlockSchema: z.ZodType<Block> = z.discriminatedUnion("type", [
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  ColumnsBlock,
  AccordionBlock,
  // ... all 21 types
]);

export const ContentSchema = z.array(BlockSchema);
export type Content = z.infer<typeof ContentSchema>;
```

---

## 12. API Entry Point — Hono App Router

```typescript
// apps/api/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { settingsRoutes } from "./routes/settings";
import { coursesRoutes } from "./routes/courses";
import { authRoutes } from "./routes/auth";
import { postsRoutes } from "./routes/posts";
import { portfolioRoutes } from "./routes/portfolios";
import { productRoutes } from "./routes/products";
import { faqRoutes } from "./routes/faqs";
import { testimonialRoutes } from "./routes/testimonials";
import { leadRoutes } from "./routes/leads";
import { promotionRoutes } from "./routes/promotions";
import { instructorRoutes } from "./routes/instructors";

const app = new Hono()
  .use("*", cors())
  .onError((err, c) => {
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error", code: 500 }, 500);
  })
  .get("/", (c) => c.json({ service: "thanhdatcomputer API", version: "1.0.0" }))
  .route("/api/settings", settingsRoutes)
  .route("/api/courses", coursesRoutes)
  .route("/api/auth", authRoutes)
  .route("/api/posts", postsRoutes)
  .route("/api/portfolios", portfolioRoutes)
  .route("/api/products", productRoutes)
  .route("/api/faqs", faqRoutes)
  .route("/api/testimonials", testimonialRoutes)
  .route("/api/leads", leadRoutes)
  .route("/api/promotions", promotionRoutes)
  .route("/api/instructors", instructorRoutes);

export default app;
export type AppType = typeof app; // ← THE KEY LINE for Hono RPC
```

---

## 13. Frontend RPC Client

```typescript
// apps/web/src/lib/rpc.ts
import { hc } from "hono/client";
import type { AppType } from "@workspace/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = hc<AppType>(API_URL);
// Now fully typed:
//   api.courses.$get({ query: { published: "true" } })
//   api.courses[':slug'].$get({ param: { slug: "..." } })
//   api.settings.$get()
//   api.settings.batch.$put({ json: { hero_tagline: "..." } })
```
