import { describe, test, expect, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { unlinkSync } from "node:fs";
import {
  siteSettings,
  users,
  courses,
  courseModules,
  courseLessons,
  courseBonuses,
  instructors,
  courseInstructors,
  testimonials,
  postCategories,
  posts,
  portfolios,
  digitalProducts,
  faqs,
  leads,
  promotions,
  productShowcases,
} from "./schema";

let db: ReturnType<typeof drizzle>;
let rawDb: Database;

beforeAll(() => {
  rawDb = new Database(":memory:");
  rawDb.run("PRAGMA foreign_keys = ON");
  db = drizzle(rawDb, { logger: false });

  // Create all tables via raw SQL
  rawDb.run(`CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    google_id TEXT,
    created_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    content_blocks TEXT,
    base_price INTEGER NOT NULL,
    original_price INTEGER,
    thumbnail_url TEXT,
    trailer_video_url TEXT,
    external_checkout_url TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    is_combo_only INTEGER NOT NULL DEFAULT 0,
    button_text TEXT,
    rating_count TEXT DEFAULT '0',
    rating REAL DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    learning_outcomes TEXT,
    level TEXT,
    certificate INTEGER DEFAULT 0,
    featured_order INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    learning_outcomes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'video',
    video_url TEXT,
    duration_seconds INTEGER,
    content_blocks TEXT,
    resources TEXT,
    is_free_preview INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS course_bonuses (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    rating REAL DEFAULT 5.0,
    student_count INTEGER DEFAULT 0,
    course_count INTEGER DEFAULT 0,
    social_links TEXT,
    created_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS course_instructors (
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, instructor_id)
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT,
    user_avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    content TEXT NOT NULL,
    title TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS post_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES post_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content_blocks TEXT,
    thumbnail_url TEXT,
    seo_description TEXT,
    author TEXT DEFAULT 'minhtravel',
    read_time INTEGER DEFAULT 5,
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    views INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    full_video_url TEXT,
    youtube_video_id TEXT,
    is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    featured_order INTEGER DEFAULT 0,
    created_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS digital_products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    thumbnail_url TEXT,
    download_file_url TEXT,
    external_checkout_url TEXT,
    youtube_preview_id TEXT,
    tag TEXT,
    is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    admin_notes TEXT,
    created_at TEXT
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    campaign_name TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 0
  )`);
  rawDb.run(`CREATE TABLE IF NOT EXISTS product_showcases (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
    before_image_url TEXT,
    after_image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
});

describe("Schema — Table Definitions", () => {
  test("site_settings table is defined", () => {
    expect(siteSettings).toBeDefined();
    expect(Object.keys(siteSettings)).toContain("key");
    expect(Object.keys(siteSettings)).toContain("value");
    expect(Object.keys(siteSettings)).toContain("description");
    expect(Object.keys(siteSettings)).toContain("updatedAt");
  });

  test("users table is defined", () => {
    expect(users).toBeDefined();
    expect(Object.keys(users)).toContain("id");
    expect(Object.keys(users)).toContain("email");
    expect(Object.keys(users)).toContain("passwordHash");
    expect(Object.keys(users)).toContain("name");
    expect(Object.keys(users)).toContain("role");
    expect(Object.keys(users)).toContain("googleId");
    expect(Object.keys(users)).toContain("createdAt");
  });

  test("courses table is defined", () => {
    expect(courses).toBeDefined();
    expect(Object.keys(courses)).toContain("id");
    expect(Object.keys(courses)).toContain("slug");
    expect(Object.keys(courses)).toContain("title");
    expect(Object.keys(courses)).toContain("basePrice");
    expect(Object.keys(courses)).toContain("isPublished");
    expect(Object.keys(courses)).toContain("isFeaturedOnHome");
    expect(Object.keys(courses)).toContain("isComboOnly");
    expect(Object.keys(courses)).toContain("ratingCount");
    expect(Object.keys(courses)).toContain("learningOutcomes");
    expect(Object.keys(courses)).toContain("level");
    expect(Object.keys(courses)).toContain("certificate");
    expect(Object.keys(courses)).toContain("featuredOrder");
    expect(Object.keys(courses)).toContain("contentBlocks");
  });

  test("course_modules table is defined", () => {
    expect(courseModules).toBeDefined();
    expect(Object.keys(courseModules)).toContain("id");
    expect(Object.keys(courseModules)).toContain("courseId");
    expect(Object.keys(courseModules)).toContain("title");
    expect(Object.keys(courseModules)).toContain("learningOutcomes");
    expect(Object.keys(courseModules)).toContain("sortOrder");
  });

  test("course_lessons table is defined", () => {
    expect(courseLessons).toBeDefined();
    expect(Object.keys(courseLessons)).toContain("id");
    expect(Object.keys(courseLessons)).toContain("moduleId");
    expect(Object.keys(courseLessons)).toContain("title");
    expect(Object.keys(courseLessons)).toContain("type");
    expect(Object.keys(courseLessons)).toContain("videoUrl");
    expect(Object.keys(courseLessons)).toContain("durationSeconds");
    expect(Object.keys(courseLessons)).toContain("contentBlocks");
    expect(Object.keys(courseLessons)).toContain("resources");
    expect(Object.keys(courseLessons)).toContain("isFreePreview");
    expect(Object.keys(courseLessons)).toContain("isPublished");
    expect(Object.keys(courseLessons)).toContain("sortOrder");
  });

  test("course_bonuses table is defined", () => {
    expect(courseBonuses).toBeDefined();
    expect(Object.keys(courseBonuses)).toContain("id");
    expect(Object.keys(courseBonuses)).toContain("courseId");
    expect(Object.keys(courseBonuses)).toContain("name");
    expect(Object.keys(courseBonuses)).toContain("value");
    expect(Object.keys(courseBonuses)).toContain("icon");
    expect(Object.keys(courseBonuses)).toContain("sortOrder");
  });

  test("instructors table is defined", () => {
    expect(instructors).toBeDefined();
    expect(Object.keys(instructors)).toContain("id");
    expect(Object.keys(instructors)).toContain("name");
    expect(Object.keys(instructors)).toContain("title");
    expect(Object.keys(instructors)).toContain("bio");
    expect(Object.keys(instructors)).toContain("avatarUrl");
    expect(Object.keys(instructors)).toContain("rating");
    expect(Object.keys(instructors)).toContain("studentCount");
    expect(Object.keys(instructors)).toContain("courseCount");
    expect(Object.keys(instructors)).toContain("socialLinks");
  });

  test("course_instructors table is defined", () => {
    expect(courseInstructors).toBeDefined();
    expect(Object.keys(courseInstructors)).toContain("courseId");
    expect(Object.keys(courseInstructors)).toContain("instructorId");
  });

  test("testimonials table is defined", () => {
    expect(testimonials).toBeDefined();
    expect(Object.keys(testimonials)).toContain("id");
    expect(Object.keys(testimonials)).toContain("courseId");
    expect(Object.keys(testimonials)).toContain("userName");
    expect(Object.keys(testimonials)).toContain("userRole");
    expect(Object.keys(testimonials)).toContain("rating");
    expect(Object.keys(testimonials)).toContain("content");
    expect(Object.keys(testimonials)).toContain("title");
    expect(Object.keys(testimonials)).toContain("isFeatured");
    expect(Object.keys(testimonials)).toContain("sortOrder");
    expect(Object.keys(testimonials)).toContain("createdAt");
  });

  test("post_categories table is defined", () => {
    expect(postCategories).toBeDefined();
    expect(Object.keys(postCategories)).toContain("id");
    expect(Object.keys(postCategories)).toContain("name");
    expect(Object.keys(postCategories)).toContain("slug");
  });

  test("posts table is defined", () => {
    expect(posts).toBeDefined();
    expect(Object.keys(posts)).toContain("id");
    expect(Object.keys(posts)).toContain("categoryId");
    expect(Object.keys(posts)).toContain("title");
    expect(Object.keys(posts)).toContain("slug");
    expect(Object.keys(posts)).toContain("excerpt");
    expect(Object.keys(posts)).toContain("contentBlocks");
    expect(Object.keys(posts)).toContain("thumbnailUrl");
    expect(Object.keys(posts)).toContain("seoDescription");
    expect(Object.keys(posts)).toContain("author");
    expect(Object.keys(posts)).toContain("readTime");
    expect(Object.keys(posts)).toContain("isPublished");
    expect(Object.keys(posts)).toContain("views");
  });

  test("portfolios table is defined", () => {
    expect(portfolios).toBeDefined();
    expect(Object.keys(portfolios)).toContain("id");
    expect(Object.keys(portfolios)).toContain("title");
    expect(Object.keys(portfolios)).toContain("description");
    expect(Object.keys(portfolios)).toContain("category");
    expect(Object.keys(portfolios)).toContain("youtubeVideoId");
    expect(Object.keys(portfolios)).toContain("isFeaturedOnHome");
  });

  test("digital_products table is defined", () => {
    expect(digitalProducts).toBeDefined();
    expect(Object.keys(digitalProducts)).toContain("id");
    expect(Object.keys(digitalProducts)).toContain("title");
    expect(Object.keys(digitalProducts)).toContain("price");
    expect(Object.keys(digitalProducts)).toContain("externalCheckoutUrl");
    expect(Object.keys(digitalProducts)).toContain("youtubePreviewId");
    expect(Object.keys(digitalProducts)).toContain("tag");
    expect(Object.keys(digitalProducts)).toContain("isPublished");
  });

  test("faqs table is defined", () => {
    expect(faqs).toBeDefined();
    expect(Object.keys(faqs)).toContain("id");
    expect(Object.keys(faqs)).toContain("courseId");
    expect(Object.keys(faqs)).toContain("question");
    expect(Object.keys(faqs)).toContain("answer");
    expect(Object.keys(faqs)).toContain("sortOrder");
  });

  test("leads table is defined", () => {
    expect(leads).toBeDefined();
    expect(Object.keys(leads)).toContain("id");
    expect(Object.keys(leads)).toContain("courseId");
    expect(Object.keys(leads)).toContain("customerName");
    expect(Object.keys(leads)).toContain("customerEmail");
    expect(Object.keys(leads)).toContain("customerPhone");
    expect(Object.keys(leads)).toContain("message");
    expect(Object.keys(leads)).toContain("status");
    expect(Object.keys(leads)).toContain("adminNotes");
  });

  test("promotions table is defined", () => {
    expect(promotions).toBeDefined();
    expect(Object.keys(promotions)).toContain("id");
    expect(Object.keys(promotions)).toContain("courseId");
    expect(Object.keys(promotions)).toContain("campaignName");
    expect(Object.keys(promotions)).toContain("discountPercentage");
    expect(Object.keys(promotions)).toContain("startDate");
    expect(Object.keys(promotions)).toContain("endDate");
    expect(Object.keys(promotions)).toContain("isActive");
  });

  test("product_showcases table is defined", () => {
    expect(productShowcases).toBeDefined();
    expect(Object.keys(productShowcases)).toContain("id");
    expect(Object.keys(productShowcases)).toContain("productId");
    expect(Object.keys(productShowcases)).toContain("beforeImageUrl");
    expect(Object.keys(productShowcases)).toContain("afterImageUrl");
    expect(Object.keys(productShowcases)).toContain("sortOrder");
  });
});

describe("Schema — Relationships & Constraints", () => {
  test("courses.slug has unique constraint", () => {
    const slugCol = courses.slug;
    expect(slugCol).toBeDefined();
    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES ('c1', 'unique-slug', 'Test', 'Desc', 1000)`);
    expect(() => {
      rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES ('c2', 'unique-slug', 'Test2', 'Desc2', 2000)`);
    }).toThrow();
    rawDb.run(`DELETE FROM courses`);
  });

  test("users.email has unique constraint", () => {
    rawDb.run(`INSERT INTO users (id, email, name) VALUES ('u1', 'test@example.com', 'User 1')`);
    expect(() => {
      rawDb.run(`INSERT INTO users (id, email, name) VALUES ('u2', 'test@example.com', 'User 2')`);
    }).toThrow();
    rawDb.run(`DELETE FROM users`);
  });

  test("posts.slug has unique constraint", () => {
    rawDb.run(`INSERT INTO posts (id, title, slug, excerpt) VALUES ('p1', 'Post 1', 'post-slug', 'Excerpt')`);
    expect(() => {
      rawDb.run(`INSERT INTO posts (id, title, slug, excerpt) VALUES ('p2', 'Post 2', 'post-slug', 'Excerpt 2')`);
    }).toThrow();
    rawDb.run(`DELETE FROM posts`);
  });

  test("post_categories.slug has unique constraint", () => {
    rawDb.run(`INSERT INTO post_categories (id, name, slug) VALUES ('pc1', 'Cat 1', 'cat-slug')`);
    expect(() => {
      rawDb.run(`INSERT INTO post_categories (id, name, slug) VALUES ('pc2', 'Cat 2', 'cat-slug')`);
    }).toThrow();
    rawDb.run(`DELETE FROM post_categories`);
  });
});

describe("Schema — Foreign Key Constraints", () => {
  test("course_modules FK cascade — insert fails without existing course", () => {
    expect(() => {
      rawDb.run(`INSERT INTO course_modules (id, course_id, title, sort_order) VALUES ('m1', 'nonexistent', 'Module', 0)`);
    }).toThrow();
  });

  test("course_modules FK cascade — works with existing course", () => {
    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES ('c-fk', 'fk-test', 'FK Test', 'Desc', 1000)`);
    rawDb.run(`INSERT INTO course_modules (id, course_id, title, sort_order) VALUES ('m-fk', 'c-fk', 'Module', 0)`);
    const row = rawDb.query(`SELECT * FROM course_modules WHERE id = 'm-fk'`).get();
    expect(row).not.toBeNull();
    rawDb.run(`DELETE FROM course_modules`);
    rawDb.run(`DELETE FROM courses`);
  });

  test("course_lessons FK cascade — insert fails without existing module", () => {
    expect(() => {
      rawDb.run(`INSERT INTO course_lessons (id, module_id, title, sort_order) VALUES ('l1', 'nonexistent', 'Lesson', 0)`);
    }).toThrow();
  });

  test("course_instructors composite PK FK — insert fails without course", () => {
    expect(() => {
      rawDb.run(`INSERT INTO course_instructors (course_id, instructor_id) VALUES ('bad-course', 'bad-instructor')`);
    }).toThrow();
  });

  test("product_showcases FK — insert fails without existing product", () => {
    expect(() => {
      rawDb.run(`INSERT INTO product_showcases (id, product_id) VALUES ('ps1', 'nonexistent')`);
    }).toThrow();
  });

  test("testimonial FK — INSERT with NULL course_id works (global testimonial)", () => {
    rawDb.run(`INSERT INTO testimonials (id, user_name, content) VALUES ('t-null', 'User', 'Good!')`);
    const row = rawDb.query(`SELECT * FROM testimonials WHERE id = 't-null'`).get();
    expect(row).not.toBeNull();
    rawDb.run(`DELETE FROM testimonials`);
  });

  test("faqs FK — INSERT with NULL course_id works (global FAQ)", () => {
    rawDb.run(`INSERT INTO faqs (id, question, answer) VALUES ('f-null', 'Q?', 'A.')`);
    const row = rawDb.query(`SELECT * FROM faqs WHERE id = 'f-null'`).get();
    expect(row).not.toBeNull();
    rawDb.run(`DELETE FROM faqs`);
  });
});

describe("Schema — WAL Mode", () => {
  test("WAL mode is enabled on file-based DB", () => {
    const fileDb = new Database("/tmp/test-wal.db");
    fileDb.run("PRAGMA journal_mode = WAL");
    fileDb.run("PRAGMA busy_timeout = 5000");
    fileDb.run("PRAGMA foreign_keys = ON");
    const walRow = fileDb.query(`PRAGMA journal_mode`).get() as { journal_mode: string };
    expect(walRow.journal_mode).toBe("wal");
    const fkRow = fileDb.query(`PRAGMA foreign_keys`).get() as { foreign_keys: number };
    expect(fkRow.foreign_keys).toBe(1);
    fileDb.close();
    try { unlinkSync("/tmp/test-wal.db"); } catch (_) {}
    try { unlinkSync("/tmp/test-wal.db-wal"); } catch (_) {}
    try { unlinkSync("/tmp/test-wal.db-shm"); } catch (_) {}
  });

  test("foreign_keys are enabled on in-memory DB", () => {
    const row = rawDb.query(`PRAGMA foreign_keys`).get() as { foreign_keys: number };
    expect(row.foreign_keys).toBe(1);
  });
});

describe("Schema — Insert + Select", () => {
  test("insert and select a site_setting", () => {
    rawDb.run(`INSERT INTO site_settings (key, value, description) VALUES ('test_key', 'test_value', 'A test setting')`);
    const row = rawDb.query(`SELECT * FROM site_settings WHERE key = 'test_key'`).get() as any;
    expect(row).not.toBeNull();
    expect(row.key).toBe("test_key");
    expect(row.value).toBe("test_value");
    rawDb.run(`DELETE FROM site_settings`);
  });

  test("insert and select a user", () => {
    const id = crypto.randomUUID();
    rawDb.run(`INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)`, [id, "test@test.com", "Test User", "USER"]);
    const row = rawDb.query(`SELECT * FROM users WHERE id = ?`).get(id) as any;
    expect(row).not.toBeNull();
    expect(row.email).toBe("test@test.com");
    expect(row.role).toBe("USER");
    rawDb.run(`DELETE FROM users`);
  });

  test("insert and select a course with nested modules and lessons", () => {
    const courseId = crypto.randomUUID();
    const moduleId = crypto.randomUUID();
    const lessonId = crypto.randomUUID();

    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price, is_published, is_featured_on_home) VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [courseId, `test-course-${courseId.substring(0, 8)}`, "Test Course", "Description", 500000]);
    rawDb.run(`INSERT INTO course_modules (id, course_id, title, sort_order) VALUES (?, ?, ?, 0)`,
      [moduleId, courseId, "Module 1"]);
    rawDb.run(`INSERT INTO course_lessons (id, module_id, title, type, duration_seconds, sort_order) VALUES (?, ?, ?, 'video', 300, 0)`,
      [lessonId, moduleId, "Lesson 1"]);

    const courseRow = rawDb.query(`SELECT * FROM courses WHERE id = ?`).get(courseId) as any;
    expect(courseRow).not.toBeNull();
    expect(courseRow.is_published).toBe(1);
    expect(courseRow.is_featured_on_home).toBe(1);

    const moduleRows = rawDb.query(`SELECT * FROM course_modules WHERE course_id = ?`).all(courseId) as any[];
    expect(moduleRows.length).toBe(1);
    expect(moduleRows[0].title).toBe("Module 1");

    const lessonRows = rawDb.query(`SELECT * FROM course_lessons WHERE module_id = ?`).all(moduleId) as any[];
    expect(lessonRows.length).toBe(1);
    expect(lessonRows[0].title).toBe("Lesson 1");
    expect(lessonRows[0].duration_seconds).toBe(300);

    rawDb.run(`DELETE FROM course_lessons`);
    rawDb.run(`DELETE FROM course_modules`);
    rawDb.run(`DELETE FROM courses`);
  });

  test("insert and select a full blog post", () => {
    const catId = crypto.randomUUID();
    const postId = crypto.randomUUID();

    rawDb.run(`INSERT INTO post_categories (id, name, slug) VALUES (?, ?, ?)`, [catId, "Tutorial", "tutorial"]);
    rawDb.run(`INSERT INTO posts (id, category_id, title, slug, excerpt, content_blocks, thumbnail_url, author, read_time, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [postId, catId, "My Post", "my-post", "An excerpt", "[]", "https://img.com/thumb.jpg", "Author", 10]);

    const row = rawDb.query(`SELECT * FROM posts WHERE id = ?`).get(postId) as any;
    expect(row).not.toBeNull();
    expect(row.title).toBe("My Post");
    expect(row.slug).toBe("my-post");
    expect(row.author).toBe("Author");
    expect(row.read_time).toBe(10);
    expect(row.is_published).toBe(1);

    rawDb.run(`DELETE FROM posts`);
    rawDb.run(`DELETE FROM post_categories`);
  });

  test("insert and select a portfolio item", () => {
    const id = crypto.randomUUID();
    rawDb.run(`INSERT INTO portfolios (id, title, description, category, youtube_video_id, is_featured_on_home) VALUES (?, ?, ?, ?, ?, 1)`,
      [id, "Film 1", "A cool film", "Travel", "abc123"]);

    const row = rawDb.query(`SELECT * FROM portfolios WHERE id = ?`).get(id) as any;
    expect(row).not.toBeNull();
    expect(row.category).toBe("Travel");
    expect(row.youtube_video_id).toBe("abc123");
    expect(row.is_featured_on_home).toBe(1);
    rawDb.run(`DELETE FROM portfolios`);
  });

  test("insert and select a digital product", () => {
    const id = crypto.randomUUID();
    rawDb.run(`INSERT INTO digital_products (id, title, description, price, tag, is_published) VALUES (?, ?, ?, ?, ?, 1)`,
      [id, "LUT Pack", "Color grading LUTs", 299000, "LUT"]);

    const row = rawDb.query(`SELECT * FROM digital_products WHERE id = ?`).get(id) as any;
    expect(row).not.toBeNull();
    expect(row.tag).toBe("LUT");
    expect(row.price).toBe(299000);
    expect(row.is_published).toBe(1);
    rawDb.run(`DELETE FROM digital_products`);
  });

  test("insert a lead with default status", () => {
    const id = crypto.randomUUID();
    rawDb.run(`INSERT INTO leads (id, customer_name, customer_phone, message) VALUES (?, ?, ?, ?)`,
      [id, "Customer", "0900123456", "I need help"]);

    const row = rawDb.query(`SELECT * FROM leads WHERE id = ?`).get(id) as any;
    expect(row).not.toBeNull();
    expect(row.status).toBe("NEW");
    rawDb.run(`DELETE FROM leads`);
  });

  test("insert a promotion linked to a course", () => {
    const courseId = crypto.randomUUID();
    const promoId = crypto.randomUUID();
    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES (?, ?, ?, ?, ?)`,
      [courseId, "promo-course", "Promo Course", "Desc", 1000]);
    rawDb.run(`INSERT INTO promotions (id, course_id, campaign_name, discount_percentage, is_active) VALUES (?, ?, ?, ?, 1)`,
      [promoId, courseId, "Summer Sale", 30]);

    const row = rawDb.query(`SELECT * FROM promotions WHERE id = ?`).get(promoId) as any;
    expect(row).not.toBeNull();
    expect(row.campaign_name).toBe("Summer Sale");
    expect(row.discount_percentage).toBe(30);
    expect(row.is_active).toBe(1);
    rawDb.run(`DELETE FROM promotions`);
    rawDb.run(`DELETE FROM courses`);
  });

  test("insert product showcases linked to a product", () => {
    const productId = crypto.randomUUID();
    const showcaseId = crypto.randomUUID();
    rawDb.run(`INSERT INTO digital_products (id, title, description, price) VALUES (?, ?, ?, ?)`,
      [productId, "Pack", "Desc", 999]);
    rawDb.run(`INSERT INTO product_showcases (id, product_id, before_image_url, after_image_url, sort_order) VALUES (?, ?, ?, ?, 1)`,
      [showcaseId, productId, "https://img.com/before.jpg", "https://img.com/after.jpg"]);

    const row = rawDb.query(`SELECT * FROM product_showcases WHERE id = ?`).get(showcaseId) as any;
    expect(row).not.toBeNull();
    expect(row.before_image_url).toBe("https://img.com/before.jpg");
    expect(row.after_image_url).toBe("https://img.com/after.jpg");
    rawDb.run(`DELETE FROM product_showcases`);
    rawDb.run(`DELETE FROM digital_products`);
  });

  test("insert instructor and course_instructor relationship", () => {
    const courseId = crypto.randomUUID();
    const instructorId = crypto.randomUUID();
    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES (?, ?, ?, ?, ?)`,
      [courseId, "inst-course", "Inst Course", "Desc", 1000]);
    rawDb.run(`INSERT INTO instructors (id, name, title, rating) VALUES (?, ?, ?, ?)`,
      [instructorId, "Minh Travel", "Filmmaker", 4.9]);
    rawDb.run(`INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?)`,
      [courseId, instructorId]);

    const rows = rawDb.query(`SELECT * FROM course_instructors WHERE course_id = ?`).all(courseId) as any[];
    expect(rows.length).toBe(1);
    expect(rows[0].instructor_id).toBe(instructorId);
    rawDb.run(`DELETE FROM course_instructors`);
    rawDb.run(`DELETE FROM instructors`);
    rawDb.run(`DELETE FROM courses`);
  });

  test("CASCADE delete — deleting course removes modules", () => {
    const courseId = crypto.randomUUID();
    const moduleId = crypto.randomUUID();
    rawDb.run(`INSERT INTO courses (id, slug, title, description, base_price) VALUES (?, ?, ?, ?, ?)`,
      [courseId, "del-course", "Del Course", "Desc", 1000]);
    rawDb.run(`INSERT INTO course_modules (id, course_id, title, sort_order) VALUES (?, ?, ?, 0)`,
      [moduleId, courseId, "Mod"]);

    let rows = rawDb.query(`SELECT * FROM course_modules WHERE course_id = ?`).all(courseId) as any[];
    expect(rows.length).toBe(1);

    rawDb.run(`DELETE FROM courses WHERE id = ?`, [courseId]);
    rows = rawDb.query(`SELECT * FROM course_modules WHERE id = ?`).all(moduleId) as any[];
    expect(rows.length).toBe(0);
  });
});
