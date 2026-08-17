import { useId } from "react";
import styles from "./switch.module.scss";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className,
}: SwitchProps) {
  const id = useId();

  return (
    <label className={`${styles.switch} ${styles[size]} ${className ?? ""}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.slider} />
    </label>
  );
}
