"use client";

import { useState } from "react";
import styles from "./CodeBlock.module.scss";

export function CodeBlock({
  data,
}: {
  data: { code: string; language: string; showLineNumbers: boolean; theme: string; showCopyButton: boolean };
}) {
  const [copied, setCopied] = useState(false);
  const lines = data.code.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className={`${styles.root} ${data.theme === "light" ? styles.light : ""}`}>
      {data.showCopyButton && (
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>{copied ? "Đã copy" : "Copy"}</button>
      )}
      <pre className={[styles.pre, data.showLineNumbers ? styles.lineNumbers : ""].filter(Boolean).join(" ")}>
        {data.showLineNumbers
          ? lines.map((line, i) => <code key={i} className={styles.code}>{line}</code>)
          : <code className={styles.code}>{data.code}</code>}
      </pre>
    </div>
  );
}
