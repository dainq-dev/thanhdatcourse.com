import { Counter } from "@workspace/ui";
import { parseSetting } from "@/lib/parse-setting";
import styles from "./index.module.scss";

interface CounterData {
  label: string;
  value: number;
}

const DEFAULT_COUNTERS: CounterData[] = [
  { label: "Facebook followers", value: 38760 },
  { label: "Instagram followers", value: 14856 },
  { label: "YouTube subscribers", value: 112287 },
  { label: "Tiktok followers", value: 443238 },
];

interface Props {
  settings: Record<string, string>;
}

export function CounterSection({ settings }: Props) {
  const counters = parseSetting<CounterData[]>(
    settings,
    "home_counters",
    DEFAULT_COUNTERS,
  );

  return (
    <section className={styles.section}>
      <div className={styles.counters}>
        {counters.map((counter) => (
          <Counter
            key={counter.label}
            label={counter.label}
            value={counter.value}
          />
        ))}
      </div>
    </section>
  );
}
