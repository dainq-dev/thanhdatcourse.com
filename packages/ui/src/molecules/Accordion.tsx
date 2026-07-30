"use client";

import { useAccordion } from "./Accordion.logic";
import styles from "./Accordion.module.scss";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className = "",
}: AccordionProps) {
  const { open, panelRef, toggle } = useAccordion(defaultOpen);

  return (
    <div className={`${styles.accordion} ${className}`}>
      <button className={styles.trigger} onClick={toggle} aria-expanded={open}>
        <span>{title}</span>
        <span className={`${styles.icon} ${open ? styles.iconOpen : ""}`}>
          +
        </span>
      </button>
      <div
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
      >
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
