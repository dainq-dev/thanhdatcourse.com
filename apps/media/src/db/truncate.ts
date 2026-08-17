import { Database } from "bun:sqlite";
import { existsSync, rmSync } from "node:fs";

const sqlite = new Database("data/media.db");
sqlite.run("PRAGMA foreign_keys = ON");

sqlite.run("DELETE FROM media_variants");
sqlite.run("DELETE FROM media");

const dirs = ["data/uploads", "data/variants"];
for (const dir of dirs) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true });
  }
}

sqlite.run("VACUUM");

console.log("✓ All media data truncated (DB + disk)");
sqlite.close();
