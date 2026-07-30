import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const UPLOAD_DIR = "data/uploads";

export function storeFile(buffer: Uint8Array, id: string, ext: string): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const dir = join(UPLOAD_DIR, year, month);

  mkdirSync(dir, { recursive: true });

  const diskPath = join(dir, `${id}.${ext}`);
  writeFileSync(diskPath, buffer);

  return diskPath;
}

export function getFilePath(id: string): string {
  // Walk the date-based directory structure to find the file
  const dirs = existsSync(UPLOAD_DIR)
    ? require("node:fs").readdirSync(UPLOAD_DIR)
    : [];
  for (const yearDir of dirs) {
    const yearPath = join(UPLOAD_DIR, yearDir);
    if (!require("node:fs").statSync(yearPath).isDirectory()) continue;
    const monthDirs = require("node:fs").readdirSync(yearPath);
    for (const monthDir of monthDirs) {
      const monthPath = join(yearPath, monthDir);
      if (!require("node:fs").statSync(monthPath).isDirectory()) continue;
      const files = require("node:fs").readdirSync(monthPath);
      for (const f of files) {
        if (f.startsWith(id)) {
          return join(monthPath, f);
        }
      }
    }
  }
  throw new Error(`File not found: ${id}`);
}

export function deleteFile(id: string): void {
  try {
    const path = getFilePath(id);
    unlinkSync(path);
  } catch (_e) {
    // File may not exist — ignore
  }
}
