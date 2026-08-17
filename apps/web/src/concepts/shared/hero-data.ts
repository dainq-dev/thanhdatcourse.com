import { parseSetting } from "@/lib/settings";

const DEFAULT_BRANDS = [
  { name: "sony" },
  { name: "lg" },
  { name: "apple" },
  { name: "canon" },
  { name: "dji" },
  { name: "samsung" },
  { name: "panasonic" },
  { name: "fujifilm" },
];

export interface HeroData {
  videoType: "youtube" | "upload";
  youtubeId: string;
  customVideoUrl: string;
  videoTitle: string;
  tagline: string;
  logoType: "image" | "text";
  logoUrl: string;
  logoText: string;
  btn1Text: string;
  btn1Url: string;
  btn2Text: string;
  btn2Url: string;
  brands: string[];
}

export function getHeroData(settings: Record<string, string>): HeroData {
  const brands = parseSetting(
    settings,
    "hero_brands",
    DEFAULT_BRANDS,
  ) as Array<{ name: string }>;

  return {
    videoType: (settings.hero_video_type || "youtube") as "youtube" | "upload",
    youtubeId: settings.hero_youtube_id || "utP7z6_Zcwg",
    customVideoUrl: settings.hero_video_url || "",
    videoTitle:
      settings.hero_video_title ||
      "THE FORGOTTEN DREAM | CINEMATIC TRAVEL | Minh Travel x Honda Winner X",
    tagline:
      settings.hero_tagline || "Kể câu chuyện của bạn qua từng khung hình",
    logoType: (settings.hero_logo_type || "image") as "image" | "text",
    logoUrl:
      settings.hero_logo_url ||
      "https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png",
    logoText: settings.hero_logo_text || "Minh Travel",
    btn1Text: settings.hero_btn1_text || "KHOÁ HỌC CỦA TÔI",
    btn1Url: settings.hero_btn1_url || "https://hoc.minhtravel.vn/",
    btn2Text: settings.hero_btn2_text || "ĐĂNG KÝ HỌC",
    btn2Url: settings.hero_btn2_url || "/khoa-hoc",
    brands: brands.map((b) => b.name),
  };
}
