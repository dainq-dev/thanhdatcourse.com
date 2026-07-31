import styles from "./CTABlock.module.scss";

const CTA_THEMES: Record<
  string,
  { bg: string; text: string; border: string; btnBg: string; btnText: string }
> = {
  blue: {
    bg: "#1a73e8",
    text: "#FFFFFF",
    border: "none",
    btnBg: "#FFFFFF",
    btnText: "#1a73e8",
  },
  green: {
    bg: "#059669",
    text: "#FFFFFF",
    border: "none",
    btnBg: "#FFFFFF",
    btnText: "#059669",
  },
  dark: {
    bg: "#0F172A",
    text: "#F8FAFC",
    border: "none",
    btnBg: "#3B82F6",
    btnText: "#FFFFFF",
  },
  light: {
    bg: "#F8FAFC",
    text: "#0F172A",
    border: "2px solid #E2E8F0",
    btnBg: "#0F172A",
    btnText: "#FFFFFF",
  },
  red: {
    bg: "#DC2626",
    text: "#FFFFFF",
    border: "none",
    btnBg: "#FFFFFF",
    btnText: "#DC2626",
  },
  minimal: {
    bg: "transparent",
    text: "#0F172A",
    border: "2px solid #3B82F6",
    btnBg: "#3B82F6",
    btnText: "#FFFFFF",
  },
};

const BTN_STYLES: Record<string, { bg: string; border: string; text: string }> =
  {
    solid: { bg: "inherit", border: "none", text: "inherit" },
    outline: {
      bg: "transparent",
      border: "2px solid currentColor",
      text: "inherit",
    },
    ghost: { bg: "transparent", border: "none", text: "inherit" },
  };

const SIZE_MAP: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: "0.5em 1.25em", fontSize: "0.8125rem" },
  md: { padding: "0.75em 2em", fontSize: "0.9375rem" },
  lg: { padding: "1em 2.5em", fontSize: "1.0625rem" },
};

export function CTABlock({
  data,
}: {
  data: {
    heading: string;
    text?: string;
    buttonText: string;
    buttonUrl: string;
    style: string;
    backgroundMediaId?: string;
    buttonStyle: string;
    buttonSize: string;
    buttonIcon?: string | null;
  };
}) {
  const theme = CTA_THEMES[data.style || "blue"] || CTA_THEMES.blue;
  const btn = BTN_STYLES[data.buttonStyle || "solid"] || BTN_STYLES.solid;
  const sz = SIZE_MAP[data.buttonSize || "md"] || SIZE_MAP.md;

  const btnColors =
    data.buttonStyle === "outline"
      ? {
          background: "transparent",
          color: theme.text,
          border: `2px solid ${theme.text}`,
        }
      : data.buttonStyle === "ghost"
        ? { background: "transparent", color: theme.text, border: "none" }
        : { background: theme.btnBg, color: theme.btnText, border: "none" };

  return (
    <section
      className={styles.root}
      style={{
        background: theme.bg,
        color: theme.text,
        ...(theme.border !== "none" ? { border: theme.border } : {}),
      }}
    >
      <h2 className={styles.heading}>{data.heading}</h2>
      {data.text && <p className={styles.text}>{data.text}</p>}
      <a
        className={styles.button}
        href={data.buttonUrl}
        style={{
          background: btnColors.background,
          color: btnColors.color,
          border: btnColors.border,
          padding: sz.padding,
          fontSize: sz.fontSize,
        }}
      >
        {data.buttonIcon && (
          <span className={styles.btnIcon}>{data.buttonIcon}</span>
        )}
        {data.buttonText}
      </a>
    </section>
  );
}
