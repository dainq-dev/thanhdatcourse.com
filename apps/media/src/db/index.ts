import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const sqlite = new Database("data/media.db");
sqlite.run("PRAGMA journal_mode = WAL");
sqlite.run("PRAGMA busy_timeout = 5000");
sqlite.run("PRAGMA foreign_keys = ON");

export const db = drizzle(sqlite);
