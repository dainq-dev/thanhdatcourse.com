import { Database } from "bun:sqlite";
import { beforeAll, describe, expect, test } from "bun:test";
import { seed } from "./seed";

type SqlRow = Record<string, unknown>;

let sqlite: Database;

beforeAll(() => {
  sqlite = new Database(":memory:");
  sqlite.run("PRAGMA foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
      name TEXT NOT NULL, avatar_url TEXT, role TEXT NOT NULL DEFAULT 'USER',
      google_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
});

describe("Seed — Admin User", () => {
  test("admin user exists with email admin@minhtravel.vn", () => {
    seed(sqlite);

    const row = sqlite
      .query("SELECT * FROM users WHERE email = ?")
      .get("admin@minhtravel.vn") as SqlRow;
    expect(row).not.toBeNull();
    expect(row.email).toBe("admin@minhtravel.vn");
    expect(row.name).toBe("Admin");
    expect(row.role).toBe("ADMIN");
  });

  test("admin password is bcrypt hashed (not plaintext)", () => {
    const row = sqlite
      .query("SELECT * FROM users WHERE email = ?")
      .get("admin@minhtravel.vn") as SqlRow;
    expect(row.password_hash).not.toBe("admin123");
    expect(row.password_hash).toMatch(/^\$2[aby]\$/);
  });
});

describe("Seed — Idempotency", () => {
  test("running seed twice does not duplicate admin user", () => {
    seed(sqlite);
    seed(sqlite);

    const rows = sqlite
      .query("SELECT * FROM users WHERE email = ?")
      .all("admin@minhtravel.vn");
    expect(rows.length).toBe(1);
  });
});
