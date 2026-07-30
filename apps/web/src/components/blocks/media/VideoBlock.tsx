import styles from "./VideoBlock.module.scss";

export function VideoBlock({
  data,
}: {
  data: {
    mediaId: string; caption?: string; aspectRatio: string;
    rounded: string; shadow: string; autoplay: boolean; loop: boolean;
    showControls: boolean; thumbnail?: string;
  };
}) {
  const ratioClass = {
    "16:9": styles.ratio16x9, "4:3": styles.ratio4x3,
    "9:16": styles.ratio9x16, "1:1": styles.ratio1x1,
  }[data.aspectRatio] || styles.ratio16x9;

  const ROUNDED: Record<string, string> = { none: "0", sm: "4px", md: "8px", lg: "16px", full: "9999px" };

  const youtubeId = data.mediaId;
  const query = [data.autoplay && "autoplay=1", data.loop && "loop=1", !data.showControls && "controls=0"].filter(Boolean).join("&");

  return (
    <figure className={styles.figure} style={{ borderRadius: ROUNDED[data.rounded || "none"], overflow: "hidden" }}>
      <div className={`${styles.wrapper} ${ratioClass}`}>
        <iframe className={styles.iframe}
          src={`https://www.youtube.com/embed/${youtubeId}${query ? `?${query}` : ""}`}
          title={data.caption || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
      {data.caption && <figcaption className={styles.caption}>{data.caption}</figcaption>}
    </figure>
  );
}
