import type { BlockData } from "@workspace/types";
import { BlockRenderer } from "../BlockRenderer";
import styles from "./GalleryBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = { none: "0", sm: "4px", md: "8px", lg: "16px", full: "9999px" };
const GAP_MAP: Record<string, string> = { sm: "8px", md: "16px", lg: "24px" };

export function GalleryBlock({ data }: { data: BlockData<"gallery"> }) {
  const d = data as any;
  return (
    <div className={styles.root}>
      <div className={`${styles.grid} ${d.layout === "masonry" ? styles.masonry : ""}`}
        style={{ gridTemplateColumns: `repeat(${d.columns || 3}, 1fr)`, gap: GAP_MAP[d.gap || "md"] }}>
        {d.images.map((img: any, i: number) => (
          <div key={i} className={`${styles.item} ${d.hoverZoom ? styles.hoverZoom : ""}`}
            style={{ borderRadius: ROUNDED_MAP[d.rounded || "none"], overflow: "hidden" }}
            onClick={d.lightbox ? () => window.open(`/api/media/${img.mediaId}/file`, "_blank") : undefined}>
            <img src={`/api/media/${img.mediaId}/file`} alt={img.caption || ""} loading="lazy" className={styles.img} />
            {img.caption && <div className={styles.caption}>{img.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
