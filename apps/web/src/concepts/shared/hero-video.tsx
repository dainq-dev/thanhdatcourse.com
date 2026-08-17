import { YouTubeEmbed } from "@/components/sections/you-tube-embed";
import type { HeroData } from "./hero-data";
import styles from "./hero-video.module.scss";

export function HeroVideo({ hero }: { hero: HeroData }) {
  return (
    <div className={styles.videoBg} aria-hidden="true">
      {hero.videoType === "youtube" ? (
        <YouTubeEmbed videoId={hero.youtubeId} title={hero.videoTitle} />
      ) : hero.customVideoUrl ? (
        <video
          src={hero.customVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className={styles.customVideo}
        />
      ) : (
        <YouTubeEmbed videoId={hero.youtubeId} title={hero.videoTitle} />
      )}
      <div className={styles.overlay} />
    </div>
  );
}
