import type { BlockData } from "@workspace/types";
import styles from "./CarouselBlock.module.scss";

export function CarouselBlock({ data }: { data: BlockData<"carousel"> }) {
  return (
    <div className={styles.root}>Carousel: {data.slides.length} slides</div>
  );
}
