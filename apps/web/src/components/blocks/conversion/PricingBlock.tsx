import type { BlockData } from "@workspace/types";
import styles from "./PricingBlock.module.scss";

export function PricingBlock({ data }: { data: BlockData<"pricingTable"> }) {
  return <div className={styles.root}>Pricing: {data.plans.length} plans</div>;
}
