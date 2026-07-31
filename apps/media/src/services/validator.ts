// ── Magic-byte signatures (first 12 bytes) ──
const MAGIC_BYTES: Record<string, number[]> = {
  // Images
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/bmp": [0x42, 0x4d],
  // Videos — WebM matches WebP RIFF header but ftyp differs
  "video/webm": [0x1a, 0x45, 0xdf, 0xa3],
  "video/mp4": [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
  "video/quicktime": [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70],
  "video/x-matroska": [0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x42, 0xf7, 0x81],
  // Audio
  "audio/mpeg": [0xff, 0xfb],
  "audio/wav": [0x52, 0x49, 0x46, 0x46],
  // Documents
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "application/zip": [0x50, 0x4b, 0x03, 0x04],
};

// AVIF: RIFF header + "ftypavif"
const AVIF_FTYP = [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66];
// SVG: text-based, sniff via file.name extension
const SVG_EXT = /\.svg$/i;
// MP4/MOV ISO base media: RIFF + ftyp + mp42/msnv/isom
const MP4_FTYP = [0x66, 0x74, 0x79, 0x70];
// WebM: Matroska header 0x1A 0x45 0xDF 0xA3 + EBML

const ALLOWED: Record<string, { maxSize: number }> = {
  image: { maxSize: 50 * 1024 * 1024 }, // 50MB
  video: { maxSize: 500 * 1024 * 1024 }, // 500MB
  audio: { maxSize: 100 * 1024 * 1024 }, // 100MB
  document: { maxSize: 100 * 1024 * 1024 }, // 100MB
};

function detectMime(header: Uint8Array, fileName: string): string | null {
  // SVG: text-based, detect via extension
  if (fileName && SVG_EXT.test(fileName)) {
    return "image/svg+xml";
  }

  // Standard magic-byte match
  for (const [mime, sig] of Object.entries(MAGIC_BYTES)) {
    if (sig.every((byte, i) => header[i] === byte)) {
      return mime;
    }
  }

  // AVIF: RIFF + "ftypavif" at offset 8
  if (
    header.length >= 12 &&
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === AVIF_FTYP[4] &&
    header[9] === AVIF_FTYP[5] &&
    header[10] === AVIF_FTYP[6] &&
    header[11] === AVIF_FTYP[7]
  ) {
    return "image/avif";
  }

  // MP4/MOV generic: RIFF + ftyp (matched if "mp42", "isom", "msnv", etc.)
  if (
    header.length >= 12 &&
    header[4] === MP4_FTYP[0] &&
    header[5] === MP4_FTYP[1] &&
    header[6] === MP4_FTYP[2] &&
    header[7] === MP4_FTYP[3]
  ) {
    return "video/mp4";
  }

  // Text-based detection: XML/SVG/HTML
  const text = new TextDecoder().decode(header.slice(0, 5));
  if (text.startsWith("<?xml") || text.startsWith("<svg")) {
    return "image/svg+xml";
  }

  return null;
}

function getCategory(mimeType: string): string | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "document";
  if (mimeType === "application/zip") return "document";
  if (mimeType.includes("officedocument") || mimeType.includes("opendocument"))
    return "document";
  return null;
}

export interface ValidatedFile {
  buffer: Uint8Array;
  mimeType: string;
  size: number;
  category: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const SUPPORTED_FORMATS =
  "JPEG, PNG, WebP, GIF, BMP, AVIF, SVG, MP4, MOV, WebM, MKV, MP3, WAV, PDF, ZIP, DOCX, XLSX";

export async function validateFile(file: File): Promise<ValidatedFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const header = buffer.slice(0, 12);

  const detectedType = detectMime(header, file.name);
  if (!detectedType) {
    throw new ValidationError(
      `Kh\u00f4ng h\u1ed7 tr\u1ee3 \u0111\u1ecbnh d\u1ea1ng file "${file.name}". ` +
        `\u0110\u1ecbnh d\u1ea1ng \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3: ${SUPPORTED_FORMATS}`,
    );
  }

  const category = getCategory(detectedType);
  if (!category || !ALLOWED[category]) {
    throw new ValidationError(
      `Lo\u1ea1i file kh\u00f4ng \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3: ${detectedType}`,
    );
  }

  if (file.size > ALLOWED[category].maxSize) {
    throw new ValidationError(
      `File qu\u00e1 l\u1edbn (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
        `T\u1ed1i \u0111a: ${ALLOWED[category].maxSize / 1024 / 1024}MB`,
    );
  }

  return { buffer, mimeType: detectedType, size: file.size, category };
}
