import type { BlockData } from "@workspace/types";
import styles from "./PricingBlock.module.scss";

export function PricingBlock({ data }: { data: BlockData<"pricingTable"> }) {
  const d = data as any;
  const plans = d.plans || [];
  const isVertical = d.layout === "vertical";

  return (
    <div className={`${styles.root} ${isVertical ? styles.vertical : ""}`}>
      {plans.map((plan: any, i: number) => (
        <div
          key={i}
          className={`${styles.plan} ${plan.highlighted ? styles.highlighted : ""}`}
        >
          {plan.highlighted && <div className={styles.badge}>Phổ biến</div>}
          <div className={styles.name}>{plan.name}</div>
          <div className={styles.price}>
            <span className={styles.currency}>{d.currency || "VNĐ"}</span>
            <span className={styles.amount}>{plan.price}</span>
            {plan.period && (
              <span className={styles.period}>/{plan.period}</span>
            )}
          </div>
          {plan.description && (
            <div className={styles.desc}>{plan.description}</div>
          )}
          <ul className={styles.features}>
            {plan.features.map((f: string, fi: number) => (
              <li key={fi}>{f}</li>
            ))}
          </ul>
          <a href={plan.cta.url} className={styles.cta}>
            {plan.cta.text}
          </a>
        </div>
      ))}
    </div>
  );
}
