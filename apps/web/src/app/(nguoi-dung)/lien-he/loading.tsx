import { Skeleton } from "@workspace/ui";
import styles from "./loading.module.scss";

export default function LienHeLoading() {
  return (
    <div className={styles.wrapper}>
      <Skeleton className={styles.title} />
    </div>
  );
}
