import styles from "./FeatureCard.module.scss";

interface FeatureCardProps {
  title: string;
  description: string;
  backgroundImage: string;
  href: string;
  target?: "_blank" | "_self";
  className?: string;
}

export function FeatureCard({
  title,
  description,
  backgroundImage,
  href,
  target = "_self",
  className = "",
}: FeatureCardProps) {
  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${styles.card} ${className}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </a>
  );
}
