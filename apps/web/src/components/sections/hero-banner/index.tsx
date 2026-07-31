"use client";

import { parseSetting } from "@/lib/parse-setting";
import { YouTubeEmbed } from "../you-tube-embed";
import { useHeroAnimation } from "./index.logic";
import styles from "./index.module.scss";

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

interface Props {
  settings: Record<string, string>;
}

export function HeroBanner({ settings }: Props) {
  const { sectionRef, videoRef } = useHeroAnimation();

  // ── Video nền: YouTube ID hoặc URL video tự upload ──
  const heroVideoType = settings.hero_video_type || "youtube";
  const youtubeId = settings.hero_youtube_id || "utP7z6_Zcwg";
  const customVideoUrl = settings.hero_video_url || "";
  const videoTitle =
    settings.hero_video_title ||
    "THE FORGOTTEN DREAM | CINEMATIC TRAVEL | Minh Travel x Honda Winner X";

  // ── Text ──
  const tagline =
    settings.hero_tagline || "Kể câu chuyện của bạn qua từng khung hình";

  // ── Logo: ảnh hoặc text ──
  const logoType = settings.hero_logo_type || "image";
  const logoUrl =
    settings.hero_logo_url ||
    "https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png";
  const logoText = settings.hero_logo_text || "Minh Travel";

  // ── Buttons ──
  const btn1Text = settings.hero_btn1_text || "KHOÁ HỌC CỦA TÔI";
  const btn1Url = settings.hero_btn1_url || "https://hoc.minhtravel.vn/";
  const btn2Text = settings.hero_btn2_text || "ĐĂNG KÝ HỌC";
  const btn2Url = settings.hero_btn2_url || "/khoa-hoc";

  // ── Brands ──
  const brands = parseSetting(settings, "hero_brands", DEFAULT_BRANDS);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div ref={videoRef} className={styles.videoBg}>
        {heroVideoType === "youtube" ? (
          <YouTubeEmbed videoId={youtubeId} title={videoTitle} />
        ) : customVideoUrl ? (
          <video
            src={customVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className={styles.customVideo}
          />
        ) : (
          <YouTubeEmbed videoId={youtubeId} title={videoTitle} />
        )}
      </div>
      <div data-hero-overlay className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.contentHero}>
          {logoType === "image" ? (
            <img src={logoUrl} alt="Minh Travel" className={styles.logoImg} />
          ) : (
            <span className={styles.logoText}>{logoText}</span>
          )}
          <p>{tagline}</p>
        </div>
        <div className={styles.actionGroup}>
          <a
            data-hero-btn
            href={btn1Url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            {btn1Text}
          </a>
          <a data-hero-btn href={btn2Url} className={styles.btnPrimary}>
            {btn2Text}
          </a>
        </div>
        <ul className={styles.brandList}>
          {brands.map((b: { name: string }, i: number) => (
            <li key={b.name || i}>{b.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
