import styles from "./ImageBlock.module.scss";

export function ImageBlock({
  data,
}: {
  data: {
    mediaId: string;
    alt?: string;
    caption?: string;
    width: "full" | "wide" | "contained" | "inline";
    border: boolean;
    rounded: boolean;
  };
}) {
  const figureClasses = [
    styles.figure,
    styles[data.width],
    data.border ? styles.border : "",
    data.rounded ? styles.rounded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={figureClasses}>
      <img
        className={styles.img}
        src={`/api/media/${data.mediaId}/file`}
        alt={data.alt || ""}
        loading="lazy"
      />
      {data.caption && (
        <figcaption className={styles.caption}>{data.caption}</figcaption>
      )}
    </figure>
  );
}
