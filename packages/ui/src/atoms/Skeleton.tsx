import type { HTMLAttributes } from "react";
import styles from "./Skeleton.module.scss";

export function Skeleton({
  className = "",
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const cls = [styles.skeleton, className].filter(Boolean).join(" ");
  return <div className={cls} style={style} aria-hidden="true" {...rest} />;
}
