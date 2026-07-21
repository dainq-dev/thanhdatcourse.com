import { z } from "zod";

export const MediaSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  source: z.enum(["upload", "youtube", "external_url"]).default("upload"),
  externalUrl: z.string().optional(),
  youtubeId: z.string().optional(),
  altText: z.string().optional(),
  contentHash: z.string().optional(),
  diskPath: z.string(),
  uploadedAt: z.string(),
});

export type Media = z.infer<typeof MediaSchema>;

export const MediaVariantSchema = z.object({
  id: z.string(),
  mediaId: z.string(),
  name: z.string(),
  width: z.number(),
  height: z.number().optional(),
  format: z.string(),
  fileSize: z.number(),
  diskPath: z.string(),
});

export type MediaVariant = z.infer<typeof MediaVariantSchema>;
