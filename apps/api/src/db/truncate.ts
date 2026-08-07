import { Database } from "bun:sqlite";

const sqlite = new Database("data/app.db");
sqlite.run("PRAGMA foreign_keys = ON");

const tables = [
  "course_lessons",
  "course_bonuses",
  "course_modules",
  "course_instructors",
  "product_showcases",
  "promotion_courses",
  "promotions",
  "testimonials",
  "leads",
  "faqs",
  "sections",
  "posts",
  "portfolios",
  "courses",
  "instructors",
  "digital_products",
  "post_categories",
  "site_settings",
  "users",
];

for (const table of tables) {
  sqlite.run(`DELETE FROM ${table}`);
}

sqlite.run("VACUUM");

console.log("✓ All tables truncated");
sqlite.close();
