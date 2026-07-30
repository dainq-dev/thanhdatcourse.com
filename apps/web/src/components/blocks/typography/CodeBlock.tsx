import styles from "./CodeBlock.module.scss";

export function CodeBlock({
  data,
}: {
  data: { code: string; language: string; showLineNumbers: boolean };
}) {
  const lines = data.code.split("\n");

  return (
    <div className={styles.root}>
      <pre
        className={[styles.pre, data.showLineNumbers ? styles.lineNumbers : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {data.showLineNumbers ? (
          lines.map((line, i) => (
            <code key={i} className={styles.code}>
              {line}
            </code>
          ))
        ) : (
          <code className={styles.code}>{data.code}</code>
        )}
      </pre>
    </div>
  );
}
