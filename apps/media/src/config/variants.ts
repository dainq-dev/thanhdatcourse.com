export const IMAGE_VARIANTS = {
  micro: { width: 16, format: "webp", quality: 30 },
  thumbnail: { width: 400, format: "webp", quality: 80 },
  medium: { width: 800, format: "webp", quality: 82 },
  large: { width: 1400, format: "webp", quality: 82 },
  og: { width: 1200, height: 630, format: "jpeg", quality: 85 },
} as const;
export type VariantName = keyof typeof IMAGE_VARIANTS;
