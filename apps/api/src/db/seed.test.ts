import { describe, test, expect, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import { seed } from "./seed";

let sqlite: Database;

beforeAll(() => {
  sqlite = new Database(":memory:");
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
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL, user_role TEXT, user_avatar_url TEXT,
      rating INTEGER DEFAULT 5, content TEXT NOT NULL, title TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
});

describe("Seed — Admin User", () => {
  test("admin user exists with email admin@minhtravel.vn", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM users WHERE email = ?").get("admin@minhtravel.vn") as any;
    expect(row).not.toBeNull();
    expect(row.email).toBe("admin@minhtravel.vn");
    expect(row.name).toBe("Admin");
    expect(row.role).toBe("ADMIN");
  });

  test("admin password is bcrypt hashed (not plaintext)", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM users WHERE email = ?").get("admin@minhtravel.vn") as any;
    expect(row.password_hash).not.toBe("admin123");
    expect(row.password_hash).toMatch(/^\$2[aby]\$/);
  });
});

describe("Seed — Courses", () => {
  test("8 courses are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM courses").all();
    expect(rows.length).toBe(8);
  });

  test("courses have correct mapped fields", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM courses WHERE slug = ?").get("30-ngay-sang-tao-video-trieu-view") as any;
    expect(row).not.toBeNull();
    expect(row.title).toBe("30 Ngày Sáng Tạo Video TikTok Triệu View (Điện thoại)");
    expect(row.base_price).toBe(996000);
    expect(row.is_featured_on_home).toBe(1);
    expect(row.rating_count).toBe("99+");
    expect(row.external_checkout_url).toBe("https://go.minhtravel.vn/checkouts/30-ngay-sang-tao-video-tiktok-trieu-view/");
  });

  test("combo-only course has correct flags", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM courses WHERE slug = ?").get("combo-video-marketing-masterclass") as any;
    expect(row).not.toBeNull();
    expect(row.is_combo_only).toBe(1);
    expect(row.button_text).toBe("Không Bán Rời");
    expect(row.external_checkout_url).toBeNull();
  });

  test("workshop course has button_text Tư Vấn Miễn Phí", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM courses WHERE slug = ?").get("khoa-hoc-truc-tiep-11-cung-minh-travel") as any;
    expect(row).not.toBeNull();
    expect(row.button_text).toBe("Tư Vấn Miễn Phí");
  });
});

describe("Seed — Articles (Posts)", () => {
  test("6 articles are seeded into posts table", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM posts").all();
    expect(rows.length).toBe(6);
  });

  test("articles have correct mapped fields", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM posts WHERE slug = ?").get("quay-video-bang-dien-thoai-chuyen-nghiep-de-thu-ve-trieu-view-hoan-toan-co-the") as any;
    expect(row).not.toBeNull();
    expect(row.title).toBe("Quay video bằng điện thoại chuyên nghiệp để thu về triệu view – hoàn toàn có thể!");
    expect(row.excerpt).toContain("Quay video bằng điện thoại");
    expect(row.author).toBe("minhtravel");
    expect(row.read_time).toBe(8);
    expect(row.is_published).toBe(1);
    expect(row.published_at).toBe("2025-11-25T08:00:00Z");
    expect(row.thumbnail_url).toBe("https://minhtravel.vn/wp-content/uploads/2025/11/lam-video-chuyen-nghiep3-1024x517.png");
  });

  test("articles have content_blocks as valid JSON with paragraph block", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM posts").all() as any[];
    for (const row of rows) {
      expect(row.content_blocks).not.toBeNull();
      expect(() => JSON.parse(row.content_blocks)).not.toThrow();
      const parsed = JSON.parse(row.content_blocks);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].type).toBe("paragraph");
      expect(typeof parsed[0].data.text).toBe("string");
      expect(parsed[0].data.text.length).toBeGreaterThan(0);
    }
  });
});

describe("Seed — Portfolios", () => {
  test("7 portfolio items are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM portfolios").all();
    expect(rows.length).toBe(7);
  });

  test("portfolio items have correct fields", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM portfolios WHERE title LIKE ?").get("%LIFE OF TIBET%") as any;
    expect(row).not.toBeNull();
    expect(row.category).toBe("Travel");
    expect(row.thumbnail_url).toContain("portfolio-tibet");
  });
});

describe("Seed — Digital Products (Presets)", () => {
  test("3 preset products are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM digital_products").all();
    expect(rows.length).toBe(3);
  });

  test("preset products have correct fields", () => {
    seed(sqlite);

    const row = sqlite.query("SELECT * FROM digital_products WHERE title = ?").get("Bộ 7 LUT Wedding") as any;
    expect(row).not.toBeNull();
    expect(row.price).toBe(199000);
    expect(row.tag).toBe("LUT");
    expect(row.is_published).toBe(1);
    expect(row.external_checkout_url).toBe("https://go.minhtravel.vn/?add-to-cart=776");
  });
});

describe("Seed — FAQs", () => {
  test("7 FAQs are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM faqs").all();
    expect(rows.length).toBe(7);
  });

  test("FAQs have NULL course_id (global)", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM faqs").all() as any[];
    for (const row of rows) {
      expect(row.course_id).toBeNull();
    }
  });
});

describe("Seed — Testimonials", () => {
  test("4 testimonials are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM testimonials").all();
    expect(rows.length).toBe(4);
  });

  test("testimonials have NULL course_id (global)", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM testimonials").all() as any[];
    for (const row of rows) {
      expect(row.course_id).toBeNull();
    }
  });
});

describe("Seed — Site Settings", () => {
  test("at least 50 site settings keys are seeded", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM site_settings").all();
    expect(rows.length).toBeGreaterThanOrEqual(50);
  });

  test("key site settings have expected values", () => {
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM site_settings").all() as any[];
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }

    expect(map.site_title).toContain("Minh Travel");
    expect(map.site_description).toContain("quay dựng");
    expect(map.theme_color).toBe("#0B0F19");
    expect(map.hero_youtube_id).toBe("utP7z6_Zcwg");
    expect(map.courses_page_faq_heading).toBeDefined();
  });
});

describe("Seed — Idempotency", () => {
  test("running seed twice still results in 8 courses", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM courses").all();
    expect(rows.length).toBe(8);
  });

  test("running seed twice still results in 6 articles", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM posts").all();
    expect(rows.length).toBe(6);
  });

  test("running seed twice still results in 7 FAQs", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM faqs").all();
    expect(rows.length).toBe(7);
  });

  test("running seed twice still results in 4 testimonials", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM testimonials").all();
    expect(rows.length).toBe(4);
  });

  test("running seed twice does not duplicate admin user", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite.query("SELECT * FROM users WHERE email = ?").all("admin@minhtravel.vn");
    expect(rows.length).toBe(1);
  });
});
