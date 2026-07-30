import styles from "./DividerBlock.module.scss";

export function DividerBlock({
  data,
}: {
  data: { style: "solid" | "dashed" | "dotted" | "gradient" };
}) {
  return (
    <hr className={`${styles.root} ${styles[data.style] || styles.solid}`} />
  );
}
