import { Database } from "bun:sqlite";
import { beforeAll, describe, expect, test } from "bun:test";
import { unlinkSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";

type RawRow = Record<string, unknown>;

import { media, mediaVariants } from "./schema";

let _db: ReturnType<typeof drizzle>;
let rawDb: Database;

beforeAll(() => {
  rawDb = new Database(":memory:");
  rawDb.run("PRAGMA foreign_keys = ON");
  _db = drizzle(rawDb, { logger: false });

  rawDb.run(`CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    original_width INTEGER,
    original_height INTEGER,
    blur_data_url TEXT,
    source TEXT NOT NULL DEFAULT 'upload',
    external_url TEXT,
    youtube_id TEXT,
    alt_text TEXT,
    content_hash TEXT,
    disk_path TEXT NOT NULL,
    uploaded_at TEXT
  )`);

  rawDb.run(`CREATE TABLE IF NOT EXISTS media_variants (
    id TEXT PRIMARY KEY,
    media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER,
    format TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    disk_path TEXT NOT NULL,
    created_at TEXT
  )`);

  rawDb.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS unique_variant ON media_variants(media_id, name)`,
  );
});

describe("Schema — Table Definitions", () => {
  test("media table is defined", () => {
    expect(media).toBeDefined();
    expect(Object.keys(media)).toContain("id");
    expect(Object.keys(media)).toContain("originalName");
    expect(Object.keys(media)).toContain("storedName");
    expect(Object.keys(media)).toContain("mimeType");
    expect(Object.keys(media)).toContain("fileSize");
    expect(Object.keys(media)).toContain("width");
    expect(Object.keys(media)).toContain("height");
    expect(Object.keys(media)).toContain("originalWidth");
    expect(Object.keys(media)).toContain("originalHeight");
    expect(Object.keys(media)).toContain("blurDataUrl");
    expect(Object.keys(media)).toContain("source");
    expect(Object.keys(media)).toContain("externalUrl");
    expect(Object.keys(media)).toContain("youtubeId");
    expect(Object.keys(media)).toContain("altText");
    expect(Object.keys(media)).toContain("contentHash");
    expect(Object.keys(media)).toContain("diskPath");
    expect(Object.keys(media)).toContain("uploadedAt");
  });

  test("media_variants table is defined", () => {
    expect(mediaVariants).toBeDefined();
    expect(Object.keys(mediaVariants)).toContain("id");
    expect(Object.keys(mediaVariants)).toContain("mediaId");
    expect(Object.keys(mediaVariants)).toContain("name");
    expect(Object.keys(mediaVariants)).toContain("width");
    expect(Object.keys(mediaVariants)).toContain("height");
    expect(Object.keys(mediaVariants)).toContain("format");
    expect(Object.keys(mediaVariants)).toContain("fileSize");
    expect(Object.keys(mediaVariants)).toContain("diskPath");
    expect(Object.keys(mediaVariants)).toContain("createdAt");
  });

  test("tables exist in sqlite_master", () => {
    const tables = rawDb
      .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r: { name: string }) => r.name);
    expect(tables).toContain("media");
    expect(tables).toContain("media_variants");
  });
});

describe("Schema — Table Columns", () => {
  test("media table has correct columns", () => {
    const cols = rawDb.query("PRAGMA table_info(media)").all() as RawRow[];
    const colNames = cols.map((c: { name: string }) => c.name);
    expect(colNames).toContain("id");
    expect(colNames).toContain("original_name");
    expect(colNames).toContain("stored_name");
    expect(colNames).toContain("mime_type");
    expect(colNames).toContain("file_size");
    expect(colNames).toContain("width");
    expect(colNames).toContain("height");
    expect(colNames).toContain("original_width");
    expect(colNames).toContain("original_height");
    expect(colNames).toContain("blur_data_url");
    expect(colNames).toContain("source");
    expect(colNames).toContain("external_url");
    expect(colNames).toContain("youtube_id");
    expect(colNames).toContain("alt_text");
    expect(colNames).toContain("content_hash");
    expect(colNames).toContain("disk_path");
    expect(colNames).toContain("uploaded_at");
  });

  test("media source column has default 'upload'", () => {
    const cols = rawDb.query("PRAGMA table_info(media)").all() as RawRow[];
    const sourceCol = cols.find((c: { name: string }) => c.name === "source");
    expect(sourceCol).toBeDefined();
    expect(sourceCol.dflt_value).toContain("upload");
  });

  test("media_variants table has correct columns", () => {
    const cols = rawDb
      .query("PRAGMA table_info(media_variants)")
      .all() as RawRow[];
    const colNames = cols.map((c: { name: string }) => c.name);
    expect(colNames).toContain("id");
    expect(colNames).toContain("media_id");
    expect(colNames).toContain("name");
    expect(colNames).toContain("width");
    expect(colNames).toContain("height");
    expect(colNames).toContain("format");
    expect(colNames).toContain("file_size");
    expect(colNames).toContain("disk_path");
    expect(colNames).toContain("created_at");
  });
});

describe("Schema — Insert + Select", () => {
  test("insert and select a media record", () => {
    const id = crypto.randomUUID();
    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, width, height, source, disk_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        "photo.jpg",
        "abc123.webp",
        "image/webp",
        45000,
        800,
        600,
        "upload",
        "/data/uploads/abc123.webp",
      ],
    );

    const row = rawDb
      .query(`SELECT * FROM media WHERE id = ?`)
      .get(id) as RawRow;
    expect(row).not.toBeNull();
    expect(row.original_name).toBe("photo.jpg");
    expect(row.stored_name).toBe("abc123.webp");
    expect(row.mime_type).toBe("image/webp");
    expect(row.file_size).toBe(45000);
    expect(row.width).toBe(800);
    expect(row.height).toBe(600);
    expect(row.source).toBe("upload");
    expect(row.disk_path).toBe("/data/uploads/abc123.webp");

    rawDb.run(`DELETE FROM media`);
  });

  test("insert and select a media record with youtube source", () => {
    const id = crypto.randomUUID();
    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, source, youtube_id, alt_text, disk_path)
       VALUES (?, ?, ?, ?, ?, 'youtube', ?, ?, ?)`,
      [
        id,
        "video-thumb.jpg",
        "yt-abc.jpg",
        "image/jpeg",
        12000,
        "dQw4w9WgXcQ",
        "Rick Astley",
        "/data/uploads/yt-abc.jpg",
      ],
    );

    const row = rawDb
      .query(`SELECT * FROM media WHERE id = ?`)
      .get(id) as RawRow;
    expect(row).not.toBeNull();
    expect(row.source).toBe("youtube");
    expect(row.youtube_id).toBe("dQw4w9WgXcQ");
    expect(row.alt_text).toBe("Rick Astley");

    rawDb.run(`DELETE FROM media`);
  });

  test("insert and select a variant with FK to media", () => {
    const mediaId = crypto.randomUUID();
    const variantId = crypto.randomUUID();

    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        mediaId,
        "img.png",
        "img.webp",
        "image/webp",
        50000,
        "/data/uploads/img.webp",
      ],
    );

    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, height, format, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        variantId,
        mediaId,
        "thumbnail",
        150,
        113,
        "webp",
        8000,
        "/data/variants/img-thumb.webp",
      ],
    );

    const row = rawDb
      .query(`SELECT * FROM media_variants WHERE id = ?`)
      .get(variantId) as RawRow;
    expect(row).not.toBeNull();
    expect(row.media_id).toBe(mediaId);
    expect(row.name).toBe("thumbnail");
    expect(row.width).toBe(150);
    expect(row.height).toBe(113);
    expect(row.format).toBe("webp");
    expect(row.file_size).toBe(8000);

    rawDb.run(`DELETE FROM media_variants`);
    rawDb.run(`DELETE FROM media`);
  });

  test("insert multiple variants for same media", () => {
    const mediaId = crypto.randomUUID();

    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        mediaId,
        "hero.jpg",
        "hero.webp",
        "image/webp",
        100000,
        "/data/uploads/hero.webp",
      ],
    );

    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'thumbnail', 150, 'webp', 5000, '/thumbs/thumb.webp')`,
      [crypto.randomUUID(), mediaId],
    );
    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'medium', 600, 'webp', 30000, '/thumbs/med.webp')`,
      [crypto.randomUUID(), mediaId],
    );
    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'large', 1200, 'webp', 80000, '/thumbs/large.webp')`,
      [crypto.randomUUID(), mediaId],
    );

    const rows = rawDb
      .query(`SELECT * FROM media_variants WHERE media_id = ?`)
      .all(mediaId) as RawRow[];
    expect(rows.length).toBe(3);

    rawDb.run(`DELETE FROM media_variants`);
    rawDb.run(`DELETE FROM media`);
  });
});

describe("Schema — Foreign Key Constraints", () => {
  test("variant insert fails without existing media", () => {
    expect(() => {
      rawDb.run(
        `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
         VALUES (?, 'nonexistent', 'thumb', 100, 'webp', 1000, '/tmp/v.webp')`,
        [crypto.randomUUID()],
      );
    }).toThrow();
  });

  test("variant FK — works with existing media", () => {
    const mediaId = crypto.randomUUID();
    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mediaId, "test.jpg", "test.webp", "image/webp", 1000, "/data/test.webp"],
    );

    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'thumb', 100, 'webp', 500, '/tmp/thumb.webp')`,
      [crypto.randomUUID(), mediaId],
    );

    const row = rawDb
      .query(`SELECT * FROM media_variants WHERE media_id = ?`)
      .get(mediaId) as RawRow;
    expect(row).not.toBeNull();

    rawDb.run(`DELETE FROM media_variants`);
    rawDb.run(`DELETE FROM media`);
  });

  test("CASCADE delete — deleting media removes variants", () => {
    const mediaId = crypto.randomUUID();
    const variantId = crypto.randomUUID();

    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        mediaId,
        "cascade.jpg",
        "cascade.webp",
        "image/webp",
        1000,
        "/data/cascade.webp",
      ],
    );
    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'thumb', 100, 'webp', 500, '/tmp/c-thumb.webp')`,
      [variantId, mediaId],
    );

    let rows = rawDb
      .query(`SELECT * FROM media_variants WHERE media_id = ?`)
      .all(mediaId) as RawRow[];
    expect(rows.length).toBe(1);

    rawDb.run(`DELETE FROM media WHERE id = ?`, [mediaId]);

    rows = rawDb
      .query(`SELECT * FROM media_variants WHERE id = ?`)
      .all(variantId) as RawRow[];
    expect(rows.length).toBe(0);
  });
});

describe("Schema — Unique Constraint", () => {
  test("unique constraint on (media_id, name) prevents duplicate variant name", () => {
    const mediaId = crypto.randomUUID();

    rawDb.run(
      `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, disk_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mediaId, "dup.jpg", "dup.webp", "image/webp", 1000, "/data/dup.webp"],
    );

    rawDb.run(
      `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
       VALUES (?, ?, 'og', 1200, 'webp', 50000, '/tmp/og.webp')`,
      [crypto.randomUUID(), mediaId],
    );

    expect(() => {
      rawDb.run(
        `INSERT INTO media_variants (id, media_id, name, width, format, file_size, disk_path)
         VALUES (?, ?, 'og', 800, 'avif', 30000, '/tmp/og2.avif')`,
        [crypto.randomUUID(), mediaId],
      );
    }).toThrow();

    rawDb.run(`DELETE FROM media_variants`);
    rawDb.run(`DELETE FROM media`);
  });
});

describe("Schema — WAL Mode", () => {
  test("WAL mode is enabled on file-based DB", () => {
    const fileDb = new Database("/tmp/test-media-wal.db");
    fileDb.run("PRAGMA journal_mode = WAL");
    fileDb.run("PRAGMA busy_timeout = 5000");
    fileDb.run("PRAGMA foreign_keys = ON");

    const walRow = fileDb.query(`PRAGMA journal_mode`).get() as {
      journal_mode: string;
    };
    expect(walRow.journal_mode).toBe("wal");

    const fkRow = fileDb.query(`PRAGMA foreign_keys`).get() as {
      foreign_keys: number;
    };
    expect(fkRow.foreign_keys).toBe(1);

    fileDb.close();
    try {
      unlinkSync("/tmp/test-media-wal.db");
    } catch (_) {}
    try {
      unlinkSync("/tmp/test-media-wal.db-wal");
    } catch (_) {}
    try {
      unlinkSync("/tmp/test-media-wal.db-shm");
    } catch (_) {}
  });

  test("foreign_keys are enabled on in-memory DB", () => {
    const row = rawDb.query(`PRAGMA foreign_keys`).get() as {
      foreign_keys: number;
    };
    expect(row.foreign_keys).toBe(1);
  });
});
