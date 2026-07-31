import { resolveMediaUrl } from "@/lib/media-url";
import styles from "./GalleryBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};
const GAP_MAP: Record<string, string> = { sm: "8px", md: "16px", lg: "24px" };

export function GalleryBlock({
  data,
}: {
  data: {
    images: { mediaId: string; caption?: string }[];
    columns: number;
    gap: string;
    layout: string;
    rounded: string;
    shadow: string;
    hoverZoom: boolean;
    lightbox: boolean;
  };
}) {
  const d = data;
  const images = d.images || [];
  if (images.length === 0)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#94A3B8" }}>
        Chưa có ảnh nào
      </div>
    );

  return (
    <div className={styles.root}>
      <div
        className={`${styles.grid} ${d.layout === "masonry" ? styles.masonry : ""}`}
        style={{
          gridTemplateColumns:
            d.layout !== "masonry"
              ? `repeat(${d.columns || 3}, 1fr)`
              : undefined,
          gap: GAP_MAP[d.gap || "md"],
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={`${styles.item} ${d.hoverZoom ? styles.hoverZoom : ""}`}
            style={{
              borderRadius: ROUNDED_MAP[d.rounded || "none"],
              overflow: "hidden",
            }}
          >
            <img
              src={resolveMediaUrl(img.mediaId, "medium")}
              alt={img.caption || `Ảnh ${i + 1}`}
              loading="lazy"
              className={styles.img}
              onClick={
                d.lightbox
                  ? () =>
                      window.open(
                        resolveMediaUrl(img.mediaId, "full"),
                        "_blank",
                      )
                  : undefined
              }
            />
            {img.caption && <div className={styles.caption}>{img.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
