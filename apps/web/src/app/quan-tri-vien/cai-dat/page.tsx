"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { LayoutWizard } from "@/components/admin/layout-wizard/LayoutWizard";
import { PAGE_CONFIGS } from "@/lib/layout-engine";
import { api } from "@/lib/api";
import {
  ALL_FIELDS,
  type FieldDef,
  SECTIONS,
  type Section,
} from "./field-defs";
import styles from "./page.module.scss";

const PRESET_LINKS = [
  { label: "Trang chủ", value: "/" },
  { label: "Khóa học", value: "/khoa-hoc" },
  { label: "Dự án", value: "/san-pham" },
  { label: "Công cụ", value: "/cong-cu" },
  { label: "Liên hệ", value: "/lien-he" },
  { label: "Bài viết", value: "/bai-viet" },
  { label: "Khác (nhập bên dưới)", value: "__custom__" },
];

interface SettingEntry {
  key: string;
  value: string;
  description: string | null;
}

const PREVIEW_PAGES = [
  { label: "Trang chủ", path: "/" },
  { label: "Khóa học", path: "/khoa-hoc" },
  { label: "Dự án", path: "/san-pham" },
  { label: "Công cụ", path: "/cong-cu" },
  { label: "Liên hệ", path: "/lien-he" },
  { label: "Bài viết", path: "/bai-viet" },
];

function buildPreviewCookie(changed: Record<string, string>): string {
  let json = JSON.stringify(changed);
  if (new Blob([json]).size > 3800) {
    const truncated: Record<string, string> = {};
    for (const [k, v] of Object.entries(changed)) {
      const trial = JSON.stringify({ ...truncated, [k]: v });
      if (new Blob([trial]).size > 3800) break;
      truncated[k] = v;
    }
    json = JSON.stringify(truncated);
  }
  return `preview_settings=${encodeURIComponent(json)};path=/;max-age=600;SameSite=Lax`;
}

function writePreviewCookie(changed: Record<string, string>) {
  document.cookie =
    Object.keys(changed).length === 0
      ? "preview_settings=;path=/;max-age=0"
      : buildPreviewCookie(changed);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [previewPath, setPreviewPath] = useState("/");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const s = new Set<string>();
    s.add("homepage");
    return s;
  });
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(
    () => new Set(["home-hero"]),
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .publicGet<SettingEntry[]>("/api/settings")
      .then((rows) => {
        const map: Record<string, string> = {};
        for (const r of rows) map[r.key] = r.value;
        setSettings(map);
        setFormData(map);
      })
      .finally(() => setLoading(false));
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (key: string, value: string) => {
      const next = { ...formData, [key]: value };
      setFormData(next);
      const changed: Record<string, string> = {};
      for (const k of Object.keys(next)) {
        if (next[k] !== settings[k]) changed[k] = next[k];
      }
      writePreviewCookie(changed);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPreviewLoading(true);
        setPreviewKey((k) => k + 1);
      }, 500);
    },
    [formData, settings],
  );

  const handleIframeLoad = useCallback(() => setPreviewLoading(false), []);

  const changedKeys = Object.keys(formData).filter(
    (k) => formData[k] !== settings[k],
  );

  const handleSave = async () => {
    const changed: Record<string, string> = {};
    for (const k of changedKeys) changed[k] = formData[k];
    if (Object.keys(changed).length === 0) return;

    setSaving(true);
    setSuccess("");
    setSaveError("");
    try {
      await api.put("/api/settings/batch", changed);
      setSettings({ ...formData });
      writePreviewCookie({});
      setPreviewLoading(true);
      setPreviewKey((k) => k + 1);
      setSuccess(`Đã lưu ${Object.keys(changed).length} thay đổi`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setSaveError("Lỗi khi lưu — thử lại");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        const section = SECTIONS.find((s) => s.id === id);
        if (section) setPreviewPath(section.previewPath);
      }
      return next;
    });
  };

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reloadPreview = () => {
    setPreviewLoading(true);
    setPreviewKey((k) => k + 1);
  };

  const subChangedCount = (fields: FieldDef[]) =>
    fields.filter((f) => formData[f.key] !== settings[f.key]).length;

  const sectionChangedCount = (section: Section) => {
    let count = section.fields.filter(
      (f) => formData[f.key] !== settings[f.key],
    ).length;
    if (section.subSections) {
      for (const sub of section.subSections) {
        count += sub.fields.filter(
          (f) => formData[f.key] !== settings[f.key],
        ).length;
      }
    }
    return count;
  };

  const isSearching = search.trim().length > 0;
  const searchResults = isSearching
    ? ALL_FIELDS.filter(
        (f) =>
          f.label.toLowerCase().includes(search.toLowerCase()) ||
          f.key.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  if (loading) return <div className={styles.loading}>Đang tải cài đặt...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.editor}>
        <div className={styles.editorHeader}>
          <div>
            <h1 className={styles.pageTitle}>Cấu hình trang</h1>
            {changedKeys.length > 0 && !isSearching && (
              <span className={styles.changedBadge}>
                {changedKeys.length} thay đổi chưa lưu
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <input
              className={styles.searchInput}
              placeholder="Tìm cài đặt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || changedKeys.length === 0}
            >
              {saving ? "Đang lưu..." : `Lưu (${changedKeys.length})`}
            </button>
          </div>
        </div>

        {success && <div className={styles.successBar}>{success}</div>}
        {saveError && <div className={styles.errorBar}>{saveError}</div>}

        {isSearching && (
          <div className={styles.fieldsScroll}>
            {searchResults.map((f) => (
              <FieldRow
                key={`sr-${f.key}`}
                field={f}
                value={formData[f.key] ?? ""}
                onChange={handleChange}
              />
            ))}
            {searchResults.length === 0 && (
              <p className={styles.noResults}>Không tìm thấy cài đặt nào</p>
            )}
          </div>
        )}

        {!isSearching && (
          <div className={styles.fieldsScroll}>
            {SECTIONS.map((section) => {
              const isOpen = expandedSections.has(section.id);
              const dirty = sectionChangedCount(section);

              return (
                <div key={section.id} className={styles.section}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() => toggleSection(section.id)}
                    type="button"
                  >
                    <div className={styles.sectionHeaderLeft}>
                      <span
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                      >
                        ▸
                      </span>
                      <div>
                        <span className={styles.sectionTitle}>
                          {section.title}
                        </span>
                        <span className={styles.sectionHint}>
                          {section.description}
                        </span>
                      </div>
                    </div>
                    <div className={styles.sectionHeaderRight}>
                      {dirty > 0 && (
                        <span className={styles.sectionDirty}>{dirty}</span>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className={styles.sectionBody}>
                      {section.id === "design" ? (
                        <LayoutWizard
                          settings={formData}
                          onChange={(key, value) => handleChange(key, value)}
                          onSave={async () => {
                            const allPageIds = Object.keys(PAGE_CONFIGS) as Array<keyof typeof PAGE_CONFIGS>;
                            const designKeys: string[] = [];
                            for (const pid of allPageIds) {
                              const pc = PAGE_CONFIGS[pid];
                              designKeys.push(pc.templateKey, ...Object.values(pc.engineKeys));
                            }
                            const batch: Record<string, string> = {};
                            for (const key of designKeys) {
                              if (formData[key] !== undefined && formData[key] !== (settings[key] ?? "")) {
                                batch[key] = formData[key];
                              }
                            }
                            if (Object.keys(batch).length === 0) {
                              setSuccess("Không có thay đổi nào");
                              setTimeout(() => setSuccess(""), 3000);
                              return;
                            }
                            setSaving(true);
                            setSuccess("");
                            setSaveError("");
                            try {
                              await api.put("/api/settings/batch", batch);
                              setSettings((prev) => ({ ...prev, ...batch }));
                              writePreviewCookie({});
                              setPreviewLoading(true);
                              setPreviewKey((k) => k + 1);
                              setSuccess(`Đã lưu ${Object.keys(batch).length} thay đổi giao diện`);
                              setTimeout(() => setSuccess(""), 3000);
                            } catch {
                              setSaveError("Lỗi khi lưu — thử lại");
                            } finally {
                              setSaving(false);
                            }
                          }}
                          onPreviewReload={(path: string) => {
                            setPreviewPath(path);
                            setTimeout(() => {
                              setPreviewLoading(true);
                              setPreviewKey((k) => k + 1);
                            }, 100);
                          }}
                        />
                      ) : (
                        <>
                          {section.fields.length > 0 && (
                            <div className={styles.fieldGroup}>
                              {section.fields.map((field) => (
                                <FieldRow
                                  key={field.key}
                                  field={field}
                                  value={formData[field.key] ?? ""}
                                  onChange={handleChange}
                                  isDirty={
                                    formData[field.key] !== settings[field.key]
                                  }
                                />
                              ))}
                            </div>
                          )}

                          {section.subSections?.map((sub) => {
                            const subOpen = expandedSubs.has(sub.id);
                            const subDirty = subChangedCount(sub.fields);

                            return (
                              <div key={sub.id} className={styles.subSection}>
                                <button
                                  className={styles.subSectionHeader}
                                  onClick={() => toggleSub(sub.id)}
                                  type="button"
                                >
                                  <div className={styles.subSectionHeaderLeft}>
                                    <span
                                      className={`${styles.subChevron} ${subOpen ? styles.subChevronOpen : ""}`}
                                    >
                                      ▸
                                    </span>
                                    <span className={styles.subSectionTitle}>
                                      {sub.title}
                                    </span>
                                  </div>
                                  <div className={styles.subSectionHeaderRight}>
                                    <span className={styles.subSectionHint}>
                                      {sub.hint}
                                    </span>
                                    {subDirty > 0 && (
                                      <span className={styles.sectionDirty}>
                                        {subDirty}
                                      </span>
                                    )}
                                  </div>
                                </button>
                                {subOpen && (
                                  <div className={styles.subBody}>
                                    <div className={styles.fieldGroup}>
                                      {sub.fields
                                        .filter((f) => {
                                          if (!f.showWhen) return true;
                                          return (
                                            formData[f.showWhen.key] ===
                                            f.showWhen.value
                                          );
                                        })
                                        .map((field) => (
                                          <FieldRow
                                            key={field.key}
                                            field={field}
                                            value={formData[field.key] ?? ""}
                                            onChange={handleChange}
                                            isDirty={
                                              formData[field.key] !==
                                              settings[field.key]
                                            }
                                          />
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {changedKeys.length > 0 && (
              <button
                className={styles.saveBtnBottom}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : `Lưu ${changedKeys.length} thay đổi`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <div className={styles.previewTabs}>
            {PREVIEW_PAGES.map((p) => (
              <button
                key={p.path}
                className={
                  previewPath === p.path
                    ? styles.previewTabActive
                    : styles.previewTab
                }
                onClick={() => setPreviewPath(p.path)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.previewDevice}>
            {previewLoading && (
              <span className={styles.previewSpinner}>
                <span className={styles.spinner} />
              </span>
            )}
            <button
              className={styles.deviceBtn}
              onClick={reloadPreview}
              title="Tải lại bản xem trước"
            >
              ↻ Tải lại
            </button>
          </div>
        </div>
        <div className={styles.previewFrame}>
          <iframe
            key={previewKey}
            src={previewPath}
            className={styles.iframe}
            title="Xem trước trang web"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}

// ── JSON converters ──

function countersToText(json: string): string {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return json;
    return arr
      .map(
        (c: { label?: string; value?: number }) =>
          `${c.label || ""} = ${c.value ?? 0}`,
      )
      .join("\n");
  } catch {
    return json;
  }
}

function textToCounters(text: string): string {
  const items = text
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return null;
      return {
        label: line.slice(0, idx).trim(),
        value: Number.parseInt(line.slice(idx + 1).trim(), 10) || 0,
      };
    })
    .filter((v): v is { label: string; value: number } => v !== null);
  return JSON.stringify(items);
}

function ctaItemsToText(json: string): string {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return json;
    return arr
      .map(
        (c: { text?: string; href?: string }) =>
          `${c.text || ""} = ${c.href || ""}`,
      )
      .join("\n");
  } catch {
    return json;
  }
}

function textToCtaItems(text: string): string {
  const items = text
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return null;
      return {
        text: line.slice(0, idx).trim(),
        href: line.slice(idx + 1).trim(),
      };
    })
    .filter(
      (v): v is { text: string; href: string } =>
        v !== null && v.text !== "" && v.href !== "",
    );
  return JSON.stringify(items);
}

function badgesToText(json: string): string {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return json;
    return arr.map(String).join("\n");
  } catch {
    return json;
  }
}

function textToBadges(text: string): string {
  return JSON.stringify(
    text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function extractYoutubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1] ?? m[0];
  }
  return input;
}

// ── FieldRow ──

function FieldRow({
  field,
  value,
  onChange,
  isDirty,
}: {
  field: FieldDef;
  value: string;
  onChange: (key: string, val: string) => void;
  isDirty?: boolean;
}) {
  const key = field.key;

  if (key === "hero_youtube_id") {
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${key}`}>
          {field.label}
          {isDirty && <span className={styles.dirtyDot}>•</span>}
        </label>
        <input
          id={`sf-${key}`}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={field.placeholder}
          onBlur={(e) => {
            const extracted = extractYoutubeId(e.target.value);
            if (extracted !== e.target.value) onChange(key, extracted);
          }}
        />
      </div>
    );
  }

  if (key === "portfolio_cta_items") {
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${key}`}>
          {field.label}
          {isDirty && <span className={styles.dirtyDot}>•</span>}
        </label>
        <textarea
          id={`sf-${key}`}
          className={styles.textarea}
          value={ctaItemsToText(value)}
          onChange={(e) => onChange(key, textToCtaItems(e.target.value))}
          rows={3}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (key === "course_target_badges") {
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${key}`}>
          {field.label}
          {isDirty && <span className={styles.dirtyDot}>•</span>}
        </label>
        <textarea
          id={`sf-${key}`}
          className={styles.textarea}
          value={badgesToText(value)}
          onChange={(e) => onChange(key, textToBadges(e.target.value))}
          rows={3}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === "media" || field.type === "media-video") {
    const isVideo = field.type === "media-video";
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${key}`}>
          {field.label}
          {isDirty && <span className={styles.dirtyDot}>•</span>}
        </label>
        <div className={styles.mediaRow}>
          <input
            id={`sf-${key}`}
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={field.placeholder || "https://..."}
          />
          <MediaTrigger
            onSelect={(url) => onChange(key, url)}
            value={value}
            filter={isVideo ? "video" : "image"}
            accept={isVideo ? "video/*" : "image/*"}
          >
            Chọn
          </MediaTrigger>
          {value && (
            <button
              type="button"
              className={styles.clearMediaBtn}
              onClick={() => onChange(key, "")}
              title="Xóa"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <div
        className={`${styles.field} ${styles.fieldToggle} ${isDirty ? styles.fieldDirty : ""}`}
      >
        <label className={styles.toggleLabel}>
          <span>{field.label}</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={value === "1"}
              onChange={(e) => onChange(key, e.target.checked ? "1" : "0")}
            />
            <span className={styles.slider} />
          </label>
        </label>
      </div>
    );
  }

  if (field.type === "counters") {
    return (
      <CountersInput
        field={field}
        value={value}
        onChange={(v) => onChange(key, v)}
        isDirty={isDirty}
      />
    );
  }

  if (field.type === "tags") {
    return (
      <TagsInput
        field={field}
        value={value}
        onChange={(v) => onChange(key, v)}
        isDirty={isDirty}
      />
    );
  }

  if (field.type === "reference") {
    return <ReferenceField field={field} onChange={onChange} />;
  }

  if (field.type === "link") {
    return (
      <LinkSelect
        field={field}
        value={value}
        onChange={(v) => onChange(key, v)}
        isDirty={isDirty}
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${key}`}>
          {field.label}
          {isDirty && <span className={styles.dirtyDot}>•</span>}
        </label>
        <select
          id={`sf-${key}`}
          className={styles.selectInput}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label} htmlFor={`sf-${key}`}>
        {field.label}
        {isDirty && <span className={styles.dirtyDot}>•</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={`sf-${key}`}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          rows={3}
          placeholder={field.placeholder}
        />
      ) : field.type === "color" ? (
        <div className={styles.colorRow}>
          <input
            id={`sf-${key}`}
            type="color"
            className={styles.colorInput}
            value={value || "#000000"}
            onChange={(e) => onChange(key, e.target.value)}
          />
          <span className={styles.colorValue}>{value || "#000000"}</span>
        </div>
      ) : (
        <input
          id={`sf-${key}`}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}

function CountersInput({
  field,
  value,
  onChange,
  isDirty,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
  isDirty?: boolean;
}) {
  const counters: Array<{ label: string; value: number }> = (() => {
    if (!value) return [];
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr)
        ? arr.filter((c: { label?: string; value?: number }) => c.label)
        : [];
    } catch {
      return [];
    }
  })();

  const emit = (items: Array<{ label: string; value: number }>) => {
    onChange(JSON.stringify(items));
  };

  const updateLabel = (idx: number, label: string) => {
    const next = [...counters];
    next[idx] = { ...next[idx], label };
    emit(next);
  };

  const updateValue = (idx: number, val: string) => {
    const num = Number.parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
    const next = [...counters];
    next[idx] = { ...next[idx], value: num };
    emit(next);
  };

  const remove = (idx: number) => emit(counters.filter((_, i) => i !== idx));

  const add = () => emit([...counters, { label: "", value: 0 }]);

  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label}>
        {field.label}
        <span className={styles.tagCount}>({counters.length})</span>
      </label>
      {counters.map((c, i) => (
        <div key={i} className={styles.counterRow}>
          <input
            type="text"
            className={styles.input}
            value={c.label}
            onChange={(e) => updateLabel(i, e.target.value)}
            placeholder="VD: Học viên"
          />
          <input
            type="text"
            className={styles.input}
            value={c.value || ""}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder="VD: 3600"
            style={{ maxWidth: 100, textAlign: "right" }}
          />
          <button
            type="button"
            className={styles.counterRemove}
            onClick={() => remove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={styles.counterAdd} onClick={add}>
        + Thêm số liệu
      </button>
    </div>
  );
}

function TagsInput({
  field,
  value,
  onChange,
  isDirty,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
  isDirty?: boolean;
}) {
  const [input, setInput] = useState("");
  const tags: string[] = (() => {
    if (!value) return [];
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr)
        ? arr.map((t: { name?: string } | string) =>
            typeof t === "string" ? t : t.name || "",
          )
        : [];
    } catch {
      return [];
    }
  })();

  const emit = (newTags: string[]) => {
    onChange(JSON.stringify(newTags.map((name) => ({ name }))));
  };

  const addTag = () => {
    const trimmed = input.trim();
    if (
      trimmed &&
      !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    ) {
      emit([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label}>
        {field.label}
        <span className={styles.tagCount}>({tags.length})</span>
      </label>
      <div className={styles.tagList}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tagChip}>
            {tag}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => emit(tags.filter((t) => t !== tag))}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className={styles.tagInputRow}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Nhập thương hiệu rồi Enter..."
        />
      </div>
    </div>
  );
}

function ReferenceField({
  field,
  onChange,
}: {
  field: FieldDef;
  onChange: (key: string, val: string) => void;
}) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const apiPath = field.placeholder || "";

  useEffect(() => {
    if (!apiPath) return;
    api
      .publicGet<unknown>(apiPath)
      .then((res) => {
        const data = Array.isArray(res)
          ? res
          : (res as { data?: Array<Record<string, unknown>> }).data;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]));
  }, [apiPath]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(idx) || !items[idx]) return;

    const item = items[idx];
    // Map reference key to actual schema keys the component reads
    const mapping: Record<
      string,
      Array<{ target: string; source: string; static?: string }>
    > = {
      home_work_card1_ref: [
        { target: "home_work_card1_title", source: "title" },
        { target: "home_work_card1_desc", source: "description" },
        { target: "home_work_card1_href", source: "", static: "/san-pham" },
      ],
      home_work_card2_ref: [
        { target: "home_work_card2_title", source: "title" },
        { target: "home_work_card2_desc", source: "description" },
        { target: "home_work_card2_href", source: "", static: "/san-pham" },
      ],
      home_products_card1_ref: [
        { target: "home_products_card1_title", source: "title" },
        { target: "home_products_card1_desc", source: "description" },
        {
          target: "home_products_card1_href",
          source: "slug",
          static: "/khoa-hoc/",
        },
      ],
      home_products_card2_ref: [
        { target: "home_products_card2_title", source: "title" },
        { target: "home_products_card2_desc", source: "description" },
        {
          target: "home_products_card2_href",
          source: "slug",
          static: "/cong-cu/",
        },
      ],
    };

    const map = mapping[field.key];
    if (!map) return;

    for (const m of map) {
      if (m.static) {
        const val = m.source
          ? m.static + String(item[m.source] ?? "")
          : m.static;
        onChange(m.target, val);
      } else {
        onChange(m.target, String(item[m.source] ?? ""));
      }
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{field.label}</label>
      <select
        className={styles.selectInput}
        onChange={handleSelect}
        defaultValue=""
      >
        <option value="" disabled>
          — Chọn từ danh sách —
        </option>
        {items.map((item, i) => (
          <option key={i} value={String(i)}>
            {String(item.title ?? "")}
          </option>
        ))}
      </select>
    </div>
  );
}

function LinkSelect({
  field,
  value,
  onChange,
  isDirty,
}: {
  field: FieldDef;
  value: string;
  onChange: (val: string) => void;
  isDirty?: boolean;
}) {
  const isKnown = PRESET_LINKS.some(
    (p) => p.value !== "__custom__" && p.value === value,
  );
  const [showCustom, setShowCustom] = useState(!isKnown && !!value);

  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label}>
        {field.label}
        {isDirty && <span className={styles.dirtyDot}>•</span>}
      </label>
      <select
        className={styles.selectInput}
        value={isKnown ? value : "__custom__"}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            setShowCustom(true);
          } else {
            setShowCustom(false);
            onChange(v);
          }
        }}
      >
        {PRESET_LINKS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {showCustom && (
        <input
          type="text"
          className={styles.input}
          style={{ marginTop: "0.35rem" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}
    </div>
  );
}
