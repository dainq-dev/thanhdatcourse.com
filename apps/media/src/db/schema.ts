import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const media = sqliteTable("media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  source: text("source").notNull().default("upload"),
  externalUrl: text("external_url"),
  youtubeId: text("youtube_id"),
  altText: text("alt_text"),
  contentHash: text("content_hash"),
  diskPath: text("disk_path").notNull(),
  uploadedAt: text("uploaded_at").$defaultFn(() => new Date().toISOString()),
});

export const mediaVariants = sqliteTable(
  "media_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    mediaId: text("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    width: integer("width").notNull(),
    height: integer("height"),
    format: text("format").notNull(),
    fileSize: integer("file_size").notNull(),
    diskPath: text("disk_path").notNull(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    uniqueVariant: uniqueIndex("unique_variant").on(table.mediaId, table.name),
  }),
);
