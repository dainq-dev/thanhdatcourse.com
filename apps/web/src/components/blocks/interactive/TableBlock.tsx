import styles from "./TableBlock.module.scss";

const TABLE_THEMES: Record<
  string,
  {
    header: string;
    headerText: string;
    bodyBg: string;
    bodyText: string;
    border: string;
    altRow: string;
    name: string;
  }
> = {
  classic: {
    header: "#2B2B2B",
    headerText: "#FFFFFF",
    bodyBg: "#FFFFFF",
    bodyText: "#1A1A1A",
    border: "#D0D0D0",
    altRow: "#F5F5F5",
    name: "Classic",
  },
  professional: {
    header: "#1E3A5F",
    headerText: "#FFFFFF",
    bodyBg: "#FFFFFF",
    bodyText: "#1E293B",
    border: "#CBD5E1",
    altRow: "#F1F5F9",
    name: "Professional",
  },
  colorful: {
    header: "#059669",
    headerText: "#FFFFFF",
    bodyBg: "#FFFFFF",
    bodyText: "#1A1A1A",
    border: "#D1D5DB",
    altRow: "#ECFDF5",
    name: "Colorful",
  },
  minimal: {
    header: "transparent",
    headerText: "#1A1A1A",
    bodyBg: "transparent",
    bodyText: "#1A1A1A",
    border: "#E5E5E5",
    altRow: "transparent",
    name: "Minimal",
  },
  dark: {
    header: "#374151",
    headerText: "#F9FAFB",
    bodyBg: "#1F2937",
    bodyText: "#F9FAFB",
    border: "#4B5563",
    altRow: "#374151",
    name: "Dark",
  },
};

export function TableBlock({
  data,
}: {
  data: {
    headers: string[];
    rows: string[][];
    striped: boolean;
    compact: boolean;
    theme?: string;
  };
}) {
  const d = data;
  const headers = d.headers || [];
  const rows = d.rows || [];
  const theme = TABLE_THEMES[d.theme || "classic"] || TABLE_THEMES.classic;

  if (headers.length === 0)
    return <div className={styles.empty}>Bảng trống</div>;

  return (
    <div className={styles.wrapper}>
      <table
        className={`${styles.table} ${d.compact ? styles.compact : ""}`}
        style={{ borderColor: theme.border, color: theme.bodyText }}
      >
        <thead>
          <tr style={{ background: theme.header }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  color: theme.headerText,
                  borderBottomColor: theme.border,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background:
                  d.striped && ri % 2 === 1 ? theme.altRow : theme.bodyBg,
              }}
            >
              {headers.map((_, ci) => (
                <td key={ci} style={{ borderBottomColor: theme.border }}>
                  {row[ci] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
