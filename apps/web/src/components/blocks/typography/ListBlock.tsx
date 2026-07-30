import styles from "./ListBlock.module.scss";

export function ListBlock({
  data,
}: {
  data: { style: "unordered" | "ordered" | "checklist"; items: string[] };
}) {
  if (data.style === "checklist") {
    return (
      <ul className={`${styles.root} ${styles.checklist}`}>
        {data.items.map((item, i) => (
          <li key={i} className={styles.item}>
            ✅ {item}
          </li>
        ))}
      </ul>
    );
  }

  const Tag = data.style === "ordered" ? "ol" : "ul";
  return (
    <Tag className={styles.root}>
      {data.items.map((item, i) => (
        <li key={i} className={styles.item}>
          {item}
        </li>
      ))}
    </Tag>
  );
}
