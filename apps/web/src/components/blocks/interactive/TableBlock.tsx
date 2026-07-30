import type { BlockData } from "@workspace/types";
import styles from "./TableBlock.module.scss";

export function TableBlock({ data }: { data: BlockData<"table"> }) {
  const d = data as any;
  const headers = d.headers || [];
  const rows = d.rows || [];

  if (headers.length === 0) return <div className={styles.empty}>Bảng trống</div>;

  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${d.striped ? styles.striped : ""} ${d.compact ? styles.compact : ""}`}>
        <thead>
          <tr>{headers.map((h: string, i: number) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row: string[], ri: number) => (
            <tr key={ri}>
              {headers.map((_: string, ci: number) => <td key={ci}>{row[ci] || ""}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
