import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonAsButton = {
  as?: "button";
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = {
  as: "a";
  href: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  as,
  ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  if (as === "a") {
    const { href, ...anchorProps } =
      rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { disabled, ...buttonProps } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      className={classes}
      disabled={isLoading || disabled}
      {...buttonProps}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
