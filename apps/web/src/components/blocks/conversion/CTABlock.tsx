import styles from "./CTABlock.module.scss";

const BUTTON_STYLE_MAP: Record<string, string> = { solid: "", outline: styles.btnOutline, ghost: styles.btnGhost };
const BUTTON_SIZE_MAP: Record<string, string> = { sm: styles.btnSm, md: "", lg: styles.btnLg };

export function CTABlock({
  data,
}: {
  data: {
    heading: string; text?: string; buttonText: string; buttonUrl: string;
    style: string; backgroundMediaId?: string;
    buttonStyle: string; buttonSize: string; buttonIcon?: string | null;
  };
}) {
  return (
    <section className={`${styles.root} ${styles[data.style] || ""}`}>
      <h2 className={styles.heading}>{data.heading}</h2>
      {data.text && <p className={styles.text}>{data.text}</p>}
      <a className={`${styles.button} ${BUTTON_STYLE_MAP[data.buttonStyle] || ""} ${BUTTON_SIZE_MAP[data.buttonSize] || ""}`}
        href={data.buttonUrl}>
        {data.buttonIcon && <span className={styles.btnIcon}>{data.buttonIcon}</span>}
        {data.buttonText}
      </a>
    </section>
  );
}
