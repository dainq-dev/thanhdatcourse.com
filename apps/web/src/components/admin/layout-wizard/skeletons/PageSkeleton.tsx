import type { TemplateMeta } from "@/lib/layout-engine";
import { SectionSkeleton } from "./SectionSkeleton";
import styles from "./skeletons.module.scss";

interface Props {
  template: TemplateMeta;
  engines?: Record<string, string>;
}

export function PageSkeleton({ template, engines = {} }: Props) {
  const tone = template.tone ?? "default";
  return (
    <div className={`${styles.pageSkeleton} ${styles[`tone_${tone}`] ?? ""}`}>
      {template.sections.map((section, i) => (
        <SectionSkeleton
          key={i}
          type={section.type}
          label={section.label}
          tone={tone}
          engine={
            section.contentType ? engines[section.contentType] : undefined
          }
        />
      ))}
    </div>
  );
}
