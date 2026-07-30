import styles from "./CTABlock.module.scss";

export function CTABlock({
  data,
}: {
  data: {
    heading: string;
    text?: string;
    buttonText: string;
    buttonUrl: string;
    style: "primary" | "secondary" | "minimal";
    backgroundMediaId?: string;
  };
}) {
  const buttonStyleKey =
    `button${data.style.charAt(0).toUpperCase() + data.style.slice(1)}` as keyof typeof styles;

  return (
    <section className={`${styles.root} ${styles[data.style]}`}>
      <h2 className={styles.heading}>{data.heading}</h2>
      {data.text && <p className={styles.text}>{data.text}</p>}
      <a
        className={`${styles.button} ${styles[buttonStyleKey] || styles.button}`}
        href={data.buttonUrl}
      >
        {data.buttonText}
      </a>
    </section>
  );
}
