import styles from "./VideoBlock.module.scss";

export function VideoBlock({
  data,
}: {
  data: {
    mediaId: string; caption?: string; aspectRatio: string;
    rounded: string; shadow: string; autoplay: boolean; loop: boolean;
    showControls: boolean; thumbnail?: string;
    source?: string; diskPath?: string;
  };
}) {
  const ratioClass = {
    "16:9": styles.ratio16x9, "4:3": styles.ratio4x3,
    "9:16": styles.ratio9x16, "1:1": styles.ratio1x1,
  }[data.aspectRatio] || styles.ratio16x9;

  const ROUNDED: Record<string, string> = { none: "0", sm: "4px", md: "8px", lg: "16px", full: "9999px" };

  const isYoutube = data.source === "youtube" || (!data.source && !data.diskPath && data.mediaId);
  const query = [data.autoplay && "autoplay=1", data.loop && "loop=1", !data.showControls && "controls=0"].filter(Boolean).join("&");

  if (!data.mediaId) {
    return (
      <figure className={styles.figure} style={{ borderRadius: ROUNDED[data.rounded || "none"], overflow: "hidden" }}>
        <div className={`${styles.wrapper} ${ratioClass}`}>
          <div className={styles.placeholder}>Chưa chọn video</div>
        </div>
      </figure>
    );
  }

  return (
    <figure className={styles.figure} style={{ borderRadius: ROUNDED[data.rounded || "none"], overflow: "hidden" }}>
      <div className={`${styles.wrapper} ${ratioClass}`}>
        {isYoutube ? (
          <iframe className={styles.iframe}
            src={`https://www.youtube.com/embed/${data.mediaId}${query ? `?${query}` : ""}`}
            title={data.caption || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        ) : (
          <video className={styles.iframe}
            src={`/raw/${(data.diskPath || "").replace("data/uploads/", "")}`}
            autoPlay={data.autoplay}
            loop={data.loop}
            controls={data.showControls ?? true}
            poster={data.thumbnail}
          />
        )}
      </div>
      {data.caption && <figcaption className={styles.caption}>{data.caption}</figcaption>}
    </figure>
  );
}
