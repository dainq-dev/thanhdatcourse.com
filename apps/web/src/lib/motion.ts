export type MotionConcept =
  | "fade"
  | "slide"
  | "parallax"
  | "zoom"
  | "clip"
  | "cascade";

const COURSE_ENGINE_MOTION: Record<string, MotionConcept> = {
  grid: "cascade",
  list: "slide",
  carousel: "slide",
  "hero-grid": "fade",
  "cards-stagger": "cascade",
  masonry: "zoom",
  compact: "fade",
};

const PORTFOLIO_ENGINE_MOTION: Record<string, MotionConcept> = {
  stacked: "parallax",
  masonry: "zoom",
  timeline: "fade",
  "grid-2col": "clip",
  filmstrip: "slide",
  fullwidth: "clip",
};

const PRODUCT_ENGINE_MOTION: Record<string, MotionConcept> = {
  grid: "cascade",
  masonry: "zoom",
  "single-col": "slide",
};

const ENGINE_MOTION: Record<string, Record<string, MotionConcept>> = {
  courses: COURSE_ENGINE_MOTION,
  portfolios: PORTFOLIO_ENGINE_MOTION,
  products: PRODUCT_ENGINE_MOTION,
};

export function getMotionConcept(
  engine: string | undefined,
  contentType: "courses" | "portfolios" | "products",
  fallback: MotionConcept = "cascade",
): MotionConcept {
  if (!engine) return fallback;
  const map = ENGINE_MOTION[contentType];
  if (!map) return fallback;
  return map[engine] ?? fallback;
}

export const HOME_MOTION_OPTIONS: { label: string; value: MotionConcept }[] = [
  { label: "Cascade — nối đuôi từng thẻ", value: "cascade" },
  { label: "Fade — mờ dần nổi lên", value: "fade" },
  { label: "Slide — trượt ngang xen kẽ", value: "slide" },
  { label: "Parallax — trôi theo nhiều tầng", value: "parallax" },
  { label: "Zoom — phóng to vào", value: "zoom" },
  { label: "Clip — mở dần kiểu điện ảnh", value: "clip" },
];

export function getHomepageMotion(
  settings: Record<string, string>,
): MotionConcept {
  const v = settings.homepage_motion;
  if (HOME_MOTION_OPTIONS.some((o) => o.value === v)) {
    return v as MotionConcept;
  }
  return "cascade";
}
