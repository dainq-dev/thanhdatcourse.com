import { Counter } from "@workspace/ui";
import { MotionReveal } from "@/components/sections/motion-reveal";
import { getHomepageMotion } from "@/lib/motion";
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
  const visible =
    settings.home_counters_section_visible !== "0" &&
    settings.home_counters_section_visible !== "false";

  if (!visible) return null;

  const concept = getHomepageMotion(settings);
  const counters = parseSetting<CounterData[]>(
    settings,
    "home_counters",
    DEFAULT_COUNTERS,
  );

  return (
    <section className={styles.section}>
      <MotionReveal concept={concept}>
        <div className={styles.counters}>
          {counters.map((counter) => (
            <div key={counter.label} data-motion-item>
              <Counter label={counter.label} value={counter.value} />
            </div>
          ))}
        </div>
      </MotionReveal>
    </section>
  );
}
