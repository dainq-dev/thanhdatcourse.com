import { Database } from "bun:sqlite";

const sqlite = new Database("data/media.db");
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA busy_timeout = 5000");
sqlite.run("PRAGMA foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    source TEXT NOT NULL DEFAULT 'upload',
    external_url TEXT,
    youtube_id TEXT,
    alt_text TEXT,
    content_hash TEXT,
    disk_path TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS media_variants (
    id TEXT PRIMARY KEY,
    media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER,
    format TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    disk_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS unique_variant ON media_variants(media_id, name);
`);

console.log("✓ Media tables created/verified");

const tables = sqlite
  .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map((r: { name: string }) => r.name);
console.log(`  Tables: ${tables.join(", ")}`);

sqlite.close();
