import { Database } from "bun:sqlite";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const UPLOAD_DIR = "data/uploads";
const VARIANTS_DIR = "data/variants";
const VARIANT_META: Record<string, { width: number; format: string }> = {
  micro: { width: 16, format: "webp" },
  thumbnail: { width: 400, format: "webp" },
  medium: { width: 800, format: "webp" },
  large: { width: 1400, format: "webp" },
  og: { width: 1200, format: "jpeg" },
};

const db = new Database("data/media.db");
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

const getMedia = db.query(
  "SELECT id, disk_path, mime_type FROM media WHERE id = ?",
);
const insertMedia = db.query(
  `INSERT INTO media (id, original_name, stored_name, mime_type, file_size, width, height, source, disk_path, uploaded_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'upload', ?, ?)`,
);
const getVariant = db.query(
  "SELECT id FROM media_variants WHERE media_id = ? AND name = ?",
);
const insertVariant = db.query(
  `INSERT INTO media_variants (id, media_id, name, width, height, format, file_size, disk_path)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);

// ── 1. Scan uploads for missing media rows ──
let mediaInserted = 0;
function scanUploads() {
  if (!existsSync(UPLOAD_DIR)) return;
  for (const year of readdirSync(UPLOAD_DIR)) {
    const yp = join(UPLOAD_DIR, year);
    if (!statSync(yp).isDirectory()) continue;
    for (const month of readdirSync(yp)) {
      const mp = join(yp, month);
      if (!statSync(mp).isDirectory()) continue;
      for (const f of readdirSync(mp)) {
        const fp = join(mp, f);
        if (!statSync(fp).isFile()) continue;
        const id = f.split(".")[0];
        const ext = f.split(".").slice(1).join(".");
        const existing = getMedia.get(id);
        if (existing) continue;

        const isVideo = /\.(mp4|webm|mov)$/i.test(f);
        const mime = isVideo ? `video/${ext}` : `image/${ext}`;
        const size = statSync(fp).size;

        insertMedia.run(
          id,
          f,
          f,
          mime,
          size,
          null,
          null,
          fp,
          new Date(statSync(fp).mtimeMs).toISOString(),
        );
        mediaInserted++;
        console.log(`[media] restored ${id} (${f})`);
      }
    }
  }
}

// ── 2. Scan variants for missing media_variants rows ──
let variantInserted = 0;
function scanVariants() {
  if (!existsSync(VARIANTS_DIR)) return;
  for (const id of readdirSync(VARIANTS_DIR)) {
    const dir = join(VARIANTS_DIR, id);
    if (!statSync(dir).isDirectory()) continue;
    if (!getMedia.get(id)) {
      console.log(`[skip] ${id}: no media row`);
      continue;
    }
    for (const f of readdirSync(dir)) {
      const fp = join(dir, f);
      if (!statSync(fp).isFile()) continue;
      // variant file name like "thumbnail.webp" or "og.jpeg"
      const name = f.split(".")[0];
      const existing = getVariant.get(id, name);
      if (existing) continue;
      const meta = VARIANT_META[name];
      const format = meta?.format ?? f.split(".").pop() ?? "webp";
      const width = meta?.width ?? 0;
      insertVariant.run(
        crypto.randomUUID(),
        id,
        name,
        width,
        null,
        format,
        statSync(fp).size,
        fp,
      );
      variantInserted++;
      console.log(`[variant] restored ${id}/${name}`);
    }
  }
}

scanUploads();
scanVariants();

console.log(
  `\n✓ Done. Restored ${mediaInserted} media rows, ${variantInserted} variant rows.`,
);
db.close();
