import { Database } from "bun:sqlite";

const sqlite = new Database("data/app.db");
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA busy_timeout = 5000");
sqlite.run("PRAGMA foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
    name TEXT NOT NULL, avatar_url TEXT, role TEXT NOT NULL DEFAULT 'USER',
    google_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT, bio TEXT,
    avatar_url TEXT, rating REAL DEFAULT 5.0, student_count INTEGER DEFAULT 0,
    course_count INTEGER DEFAULT 0, social_links TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
    subtitle TEXT, description TEXT NOT NULL, content_blocks TEXT,
    base_price INTEGER NOT NULL, original_price INTEGER, thumbnail_url TEXT,
    trailer_video_url TEXT, external_checkout_url TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    is_combo_only INTEGER NOT NULL DEFAULT 0, button_text TEXT,
    featured_order INTEGER DEFAULT 0, rating REAL DEFAULT 0,
    rating_count TEXT DEFAULT '0', student_count INTEGER DEFAULT 0,
    learning_outcomes TEXT, level TEXT, certificate INTEGER DEFAULT 0,
    hero_subtitle TEXT, target_audience TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT, learning_outcomes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY, module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'video',
    video_url TEXT, duration_seconds INTEGER, content_blocks TEXT, resources TEXT,
    is_free_preview INTEGER NOT NULL DEFAULT 0, is_published INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS course_bonuses (
    id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL, value TEXT NOT NULL, icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS course_instructors (
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, instructor_id)
  );
  CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL, user_role TEXT, user_avatar_url TEXT,
    rating INTEGER DEFAULT 5, content TEXT NOT NULL, title TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS post_categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, category_id TEXT REFERENCES post_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL,
    content_blocks TEXT, thumbnail_url TEXT, seo_description TEXT,
    author TEXT, read_time INTEGER, is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT, views INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    category TEXT NOT NULL, thumbnail_url TEXT, full_video_url TEXT,
    youtube_video_id TEXT, is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    featured_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS digital_products (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
    price INTEGER NOT NULL, thumbnail_url TEXT, download_file_url TEXT,
    external_checkout_url TEXT, youtube_preview_id TEXT, tag TEXT,
    is_featured_on_home INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS product_showcases (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
    before_image_url TEXT, after_image_url TEXT, sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL, customer_email TEXT, customer_phone TEXT NOT NULL,
    message TEXT, status TEXT NOT NULL DEFAULT 'NEW', admin_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY, campaign_name TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL, discount_amount INTEGER,
    start_date TEXT, end_date TEXT, is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS promotion_courses (
    promotion_id TEXT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, course_id)
  );
  CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
    section_type TEXT NOT NULL, title TEXT, config TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_sections_entity ON sections(entity_type, entity_id, sort_order);
`);

console.log("✓ All 19 tables created/verified");

// Verify
const tables = sqlite
  .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map((r: { name: string }) => r.name);
console.log(`  Tables: ${tables.join(", ")}`);

const userCols = sqlite
  .query("PRAGMA table_info(users)")
  .all()
  .map((c: { name: string }) => c.name);
console.log(`  Users columns: ${userCols.join(", ")}`);

sqlite.close();
