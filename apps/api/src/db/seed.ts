import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";

export function seed(sqlite: Database): void {
  const adminHash = Bun.password.hashSync("admin123", {
    algorithm: "bcrypt",
    cost: 12,
  });
  const adminId = crypto.randomUUID();

  sqlite.run(
    `INSERT OR IGNORE INTO users (id, email, password_hash, name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [adminId, "admin@minhtravel.vn", adminHash, "Admin", "ADMIN"],
  );

  const row = sqlite
    .query(
      "SELECT COUNT(*) as c FROM users WHERE email = 'admin@minhtravel.vn'",
    )
    .get() as { c: number };

  if (row.c === 1) {
    console.log("✓ Admin user seeded");
  } else {
    console.log("• Admin user exists, skipping");
  }

  console.log("✓ Seed complete!");
}

if (import.meta.main) {
  const d1 = "data/app.db";
  const d2 = "apps/api/data/app.db";
  const dbPath = existsSync(d1) ? d1 : existsSync(d2) ? d2 : null;
  if (!dbPath) {
    console.error("Cannot find data/app.db.");
    process.exit(1);
  }
  const sqlite = new Database(dbPath);
  sqlite.run("PRAGMA foreign_keys = ON");
  seed(sqlite);
  sqlite.close();
}
