import styles from "./SpacerBlock.module.scss";

export function SpacerBlock({ data }: { data: { height: number } }) {
  return <div className={styles.root} style={{ height: data.height }} />;
}
