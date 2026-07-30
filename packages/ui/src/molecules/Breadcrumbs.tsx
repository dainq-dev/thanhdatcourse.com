import styles from "./Breadcrumbs.module.scss";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.breadcrumbs} ${className}`}
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && <span className={styles.separator}>›</span>}
          {item.href && i < items.length - 1 ? (
            <a href={item.href} className={styles.link}>
              {item.label}
            </a>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
