import type { BlockData } from "@workspace/types";
import styles from "./GalleryBlock.module.scss";

export function GalleryBlock({ data }: { data: BlockData<"gallery"> }) {
  return (
    <div className={styles.root}>Gallery: {data.images.length} images</div>
  );
}
