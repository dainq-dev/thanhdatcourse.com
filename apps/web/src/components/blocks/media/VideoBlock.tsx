import styles from "./VideoBlock.module.scss";

export function VideoBlock({
  data,
}: {
  data: {
    mediaId: string;
    caption?: string;
    aspectRatio: "16:9" | "4:3" | "9:16" | "1:1";
  };
}) {
  const ratioClass = {
    "16:9": styles.ratio16x9,
    "4:3": styles.ratio4x3,
    "9:16": styles.ratio9x16,
    "1:1": styles.ratio1x1,
  }[data.aspectRatio];

  const youtubeId = data.mediaId;

  return (
    <figure className={styles.figure}>
      <div className={`${styles.wrapper} ${ratioClass}`}>
        <iframe
          className={styles.iframe}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={data.caption || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {data.caption && (
        <figcaption className={styles.caption}>{data.caption}</figcaption>
      )}
    </figure>
  );
}
