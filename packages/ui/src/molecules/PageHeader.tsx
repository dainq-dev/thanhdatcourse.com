import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`${styles.pageHeader} ${className}`}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
