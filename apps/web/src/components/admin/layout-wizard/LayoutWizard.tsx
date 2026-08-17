"use client";

import { useState, useCallback, useRef } from "react";
import { TemplateSelector } from "./TemplateSelector";
import { EngineSelector } from "./EngineSelector";
import { StepActions } from "./StepActions";
import { PAGE_CONFIGS } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

type PageId = keyof typeof PAGE_CONFIGS;

interface Props {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: () => Promise<void>;
  onPreviewReload: (path: string) => void;
}

export function LayoutWizard({
  settings,
  onChange,
  onSave,
  onPreviewReload,
}: Props) {
  const [step, setStep] = useState(1);
  const [page, setPage] = useState<PageId>("homepage");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = PAGE_CONFIGS[page];

  const templateId = (settings[config.templateKey] || "default") as string;
  const templateList = config.templateMeta;
  const template =
    templateList[templateId] ?? Object.values(templateList)[0];

  const currentEngines: Record<string, string> = {};
  for (const [ct, key] of Object.entries(config.engineKeys)) {
    currentEngines[ct] = settings[key] || "";
  }

  const handlePageChange = (newPage: PageId) => {
    setPage(newPage);
    setStep(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => onPreviewReload(PAGE_CONFIGS[newPage].previewPath),
      100,
    );
  };

  const handleTemplateChange = useCallback(
    (id: string) => {
      onChange(config.templateKey, id);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => onPreviewReload(config.previewPath),
        500,
      );
    },
    [config.templateKey, config.previewPath, onChange, onPreviewReload],
  );

  const handleEngineChange = useCallback(
    (ct: string, engineId: string) => {
      const key = config.engineKeys[ct];
      if (key) onChange(key, engineId);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => onPreviewReload(config.previewPath),
        500,
      );
    },
    [config.engineKeys, config.previewPath, onChange, onPreviewReload],
  );

  return (
    <div className={styles.wizard}>
      <div className={styles.wizardHeader}>
        <div className={styles.wizardTitleRow}>
          <span className={styles.wizardTitle}>Bố cục:</span>
          <select
            className={styles.pageSelect}
            value={page}
            onChange={(e) => handlePageChange(e.target.value as PageId)}
          >
            {Object.entries(PAGE_CONFIGS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`${styles.stepDot} ${s === step ? styles.stepDotActive : ""} ${s < step ? styles.stepDotDone : ""}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.wizardBody}>
        {step === 1 && (
          <TemplateSelector
            templates={templateList}
            value={templateId}
            engines={currentEngines}
            onChange={handleTemplateChange}
          />
        )}
        {step === 2 && (
          <EngineSelector
            contentTypeEngines={template.contentTypes}
            values={currentEngines}
            onChange={handleEngineChange}
          />
        )}
        {step === 3 && (
          <StepActions
            template={template}
            engines={currentEngines}
            onSave={onSave}
            page={page}
          />
        )}
      </div>
      <div className={styles.wizardNav}>
        {step > 1 && (
          <button
            className={styles.navBack}
            onClick={() => setStep((s) => s - 1)}
            type="button"
          >
            ← Quay lại
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < 3 && (
          <button
            className={styles.navNext}
            onClick={() => setStep((s) => s + 1)}
            type="button"
          >
            Tiếp theo →
          </button>
        )}
      </div>
    </div>
  );
}
