import type { BlockData } from "@workspace/types";
import styles from "./TestimonialBlock.module.scss";

export function TestimonialBlock({ data }: { data: BlockData<"testimonial"> }) {
  return <div className={styles.root}>Testimonial: {data.style}</div>;
}
