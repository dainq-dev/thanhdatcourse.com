import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { IMAGE_VARIANTS } from "../config/variants";

const VARIANTS_DIR = "data/variants";

export interface VariantResult {
  id: string;
  mediaId: string;
  name: string;
  width: number;
  height: number | null;
  format: string;
  fileSize: number;
  diskPath: string;
}

export async function generateVariants(
  mediaId: string,
  buffer: Uint8Array,
): Promise<VariantResult[]> {
  const results: VariantResult[] = [];

  for (const [name, config] of Object.entries(IMAGE_VARIANTS)) {
    const variantId = crypto.randomUUID();

    let pipeline = sharp(buffer)
      .rotate()
      .resize(
        config.width,
        "height" in config
          ? (config as { width: number; height: number }).height
          : undefined,
        {
          fit: "inside",
          withoutEnlargement: true,
        },
      );

    if (config.format === "webp") {
      pipeline = pipeline.webp({ quality: config.quality, effort: 4 });
    } else if (config.format === "jpeg") {
      pipeline = pipeline.jpeg({ quality: config.quality });
    }

    const variantBuf = await pipeline.toBuffer();
    const meta = await sharp(variantBuf).metadata();

    const dir = join(VARIANTS_DIR, mediaId);
    mkdirSync(dir, { recursive: true });

    const diskPath = join(dir, `${name}.${config.format}`);
    writeFileSync(diskPath, variantBuf);

    results.push({
      id: variantId,
      mediaId,
      name,
      width: meta.width ?? 0,
      height: meta.height ?? null,
      format: config.format,
      fileSize: variantBuf.byteLength,
      diskPath,
    });
  }

  return results;
}
