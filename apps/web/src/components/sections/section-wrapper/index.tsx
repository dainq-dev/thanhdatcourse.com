import { Divider } from "@workspace/ui";
import styles from "./index.module.scss";

interface SectionWrapperProps {
  title: string;
  muted?: boolean;
  children: React.ReactNode;
}

export function SectionWrapper({
  title,
  muted = false,
  children,
}: SectionWrapperProps) {
  return (
    <section className={muted ? styles.muted : styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{title}</h2>
        <Divider direction="vertical" />
      </div>
      {children}
    </section>
  );
}
