"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Pen,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SECTION_RENDER_MAP } from "@/components/sections/section-render-map";
import { api } from "@/lib/api";
import styles from "./PageBuilder.module.scss";
import { SectionSkeletonPreview } from "./SectionSkeletonPreview";
import { FORM_MAP } from "./section-forms";
import type { EntityType, Section, SectionType } from "./types";
import {
  ENTITY_SECTION_MAP,
  getDefaultConfig,
  MAX_SECTIONS,
  SECTION_CATALOG_GROUPS,
  SECTION_LABELS,
  SINGLETON_SECTION_TYPES,
} from "./types";

interface PageBuilderProps {
  entityType: EntityType;
  entityIdentifier: string;
  initialSections: Section[];
}

const SAVE_ENTITY_MAP: Record<EntityType, string> = {
  course: "course",
  product: "product",
  presets_page: "presets-page",
};

function apiPrefix(type: EntityType, id: string): string {
  return `/api/${SAVE_ENTITY_MAP[type]}/${id}/sections`;
}

type ToastItem = {
  id: number;
  type: "success" | "error";
  message: string;
  retry?: () => void;
};

export function PageBuilder({
  entityType,
  entityIdentifier,
  initialSections,
}: PageBuilderProps) {
  const [sections, setSections] = useState<Section[]>(() =>
    initialSections.map((s) => ({
      ...s,
      config:
        typeof s.config === "string" ? JSON.parse(s.config) : (s.config ?? {}),
      is_published:
        (s.is_published as unknown as number) === 1 || Boolean(s.is_published),
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const toastCounter = useRef(0);
  const deletedIdsRef = useRef<string[]>([]);

  const isModified = useMemo(
    () => JSON.stringify(sections) !== JSON.stringify(initialSections),
    [sections, initialSections],
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isModified) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isModified]);

  const addToast = useCallback(
    (type: "success" | "error", message: string, retry?: () => void) => {
      const id = ++toastCounter.current;
      setToasts((prev) => [...prev, { id, type, message, retry }]);
      const duration = type === "success" ? 3000 : 5000;
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration,
      );
    },
    [],
  );

  const handleAddSection = (type: SectionType) => {
    const id = `local_${crypto.randomUUID()}`;
    const newSection: Section = {
      id,
      entity_type: entityType,
      entity_id: entityIdentifier,
      section_type: type,
      title: SECTION_LABELS[type],
      config: getDefaultConfig(type),
      sort_order: sections.length,
      is_published: true,
      isNew: true,
    } as unknown as Section;
    setSections((prev) => [...prev, newSection]);
    setSelectedId(id);
    setConfigPanelOpen(true);
  };

  const handleDeleteLocal = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa section này?")) return;
    if (!String(id).startsWith("local_")) {
      deletedIdsRef.current.push(id);
    }
    setSections((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, sort_order: i })),
    );
    if (selectedId === id) {
      setSelectedId(null);
      setConfigPanelOpen(false);
    }
  };

  const handleToggleLocal = (id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, is_published: !s.is_published } : s,
      ),
    );
  };

  const handleConfigChange = (id: string, cfg: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, config: { ...s.config, ...cfg } } : s,
      ),
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const prefix = apiPrefix(entityType, entityIdentifier);

      // Full replace strategy: delete all existing + create all current
      for (const s of sections) {
        const id = String(s.id);
        if (!id.startsWith("local_")) {
          await api.del(`${prefix}/${id}`).catch(() => {});
        }
      }

      await api.post(`${prefix}/batch`, {
        sections: sections.map((s) => ({
          section_type: s.section_type,
          title: s.title,
          config: JSON.stringify(s.config),
        })),
      });

      addToast("success", "Đã lưu tất cả thay đổi");

      // Refetch thay vì reload để giữ UI state
      const res = await api.get<Record<string, unknown>[]>(`${prefix}`);
      const raw: Record<string, unknown>[] = Array.isArray(res)
        ? res
        : ((res as unknown as { data: Record<string, unknown>[] }).data ?? []);
      const fresh: Section[] = raw.map((row) => ({
        id: row.id as string,
        entity_type: (row.entityType ??
          row.entity_type ??
          "") as Section["entity_type"],
        entity_id: (row.entityId ?? row.entity_id ?? "") as string,
        section_type: (row.sectionType ??
          row.section_type ??
          "") as Section["section_type"],
        title: row.title as string | null,
        config:
          typeof row.config === "string"
            ? JSON.parse(row.config as string)
            : ((row.config as Record<string, unknown>) ?? {}),
        sort_order: (row.sortOrder ?? row.sort_order ?? 0) as number,
        is_published: (row.isPublished ?? row.is_published ?? true) as boolean,
        created_at: (row.createdAt ?? row.created_at ?? "") as string,
        updated_at: (row.updatedAt ?? row.updated_at ?? "") as string,
      }));
      setSections(fresh);
    } catch {
      addToast("error", "Lỗi khi lưu. Vui lòng thử lại.", () =>
        handleSaveAll(),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    setSections(reordered.map((s, i) => ({ ...s, sort_order: i })));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const allowedTypes = useMemo(
    () => ENTITY_SECTION_MAP[entityType] || [],
    [entityType],
  );
  const usedSingletonTypes = useMemo(
    () =>
      new Set(
        sections
          .map((s) => s.section_type)
          .filter((t) => SINGLETON_SECTION_TYPES.includes(t as SectionType)),
      ),
    [sections],
  );
  const isAtMax = sections.length >= MAX_SECTIONS;
  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className={styles.pageBuilder}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>
            {entityType === "course"
              ? "Khóa học"
              : entityType === "product"
                ? "Sản phẩm"
                : "Presets & LUTs"}
            {" — "}
            {entityIdentifier}
          </span>
          <span className={styles.headerCount}>{sections.length} section</span>
          {isModified && (
            <span className={styles.unsavedBadge}>Có thay đổi chưa lưu</span>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            type="button"
            className={`${styles.saveAllBtn} ${isModified ? styles.saveActive : styles.saveBtnIdle}`}
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? "Đang lưu..." : `Lưu tất cả (${sections.length})`}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Catalog Section</span>
          </div>
          <div className={styles.catalogBody}>
            {allowedTypes.length === 0 ? (
              <div className={styles.emptyGroup}>
                Chưa có section nào. Hãy thêm các section type vào catalog.
              </div>
            ) : isAtMax ? (
              <div className={styles.maxMessage}>
                Đã đạt giới hạn {MAX_SECTIONS} section
              </div>
            ) : SECTION_CATALOG_GROUPS.length === 0 ? (
              <div className={styles.emptyGroup}>Catalog đang trống.</div>
            ) : (
              SECTION_CATALOG_GROUPS.map((group) => {
                const groupTypes = group.types.filter((t) =>
                  allowedTypes.includes(t),
                );
                if (groupTypes.length === 0) return null;
                const isCollapsed = collapsedGroups.has(group.label);
                return (
                  <div key={group.label} className={styles.catalogGroup}>
                    <button
                      type="button"
                      className={styles.groupHeader}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <span className={styles.groupLabel}>{group.label}</span>
                      {isCollapsed ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} />
                      )}
                    </button>
                    {!isCollapsed && (
                      <div className={styles.groupItems}>
                        {groupTypes.map((type) => {
                          const disabled =
                            SINGLETON_SECTION_TYPES.includes(type) &&
                            usedSingletonTypes.has(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              className={`${styles.catalogCard} ${disabled ? styles.catalogCardDisabled : ""}`}
                              onClick={() =>
                                !disabled && handleAddSection(type)
                              }
                              disabled={disabled}
                            >
                              <div className={styles.catalogCardPreview}>
                                <SectionSkeletonPreview type={type} />
                              </div>
                              <div className={styles.catalogCardFooter}>
                                <Plus size={12} />
                                <span>{SECTION_LABELS[type]}</span>
                                {disabled && (
                                  <span className={styles.alreadyAdded}>
                                    Đã thêm
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.canvasWrapper}>
          <div className={styles.canvas}>
            {sections.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>+</div>
                <p className={styles.emptyTitle}>Chưa có section nào</p>
                <p className={styles.emptyHint}>
                  Chọn section từ catalog bên trái để thêm vào page
                </p>
              </div>
            ) : (
              <div className={styles.sectionList}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map((section) => (
                      <SortablePreviewSection
                        key={section.id}
                        section={section}
                        isSelected={selectedId === section.id}
                        onClick={() => {
                          setSelectedId(
                            selectedId === section.id ? null : section.id,
                          );
                          setConfigPanelOpen(selectedId !== section.id);
                        }}
                        onToggle={() => handleToggleLocal(section.id)}
                        onDelete={() => handleDeleteLocal(section.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>

        {configPanelOpen && selectedSection && (
          <div className={styles.configPanel}>
            <div className={styles.configPanelHeader}>
              <span className={styles.configPanelTitle}>
                {SECTION_LABELS[selectedSection.section_type as SectionType] ??
                  selectedSection.section_type}
              </span>
              <button
                type="button"
                className={styles.configCloseBtn}
                onClick={() => {
                  setConfigPanelOpen(false);
                  setSelectedId(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.configPanelBody}>
              {(() => {
                const Form = FORM_MAP[selectedSection.section_type as string];
                if (!Form) return <p>Chưa có form cho section này</p>;
                return (
                  <Form
                    config={selectedSection.config}
                    onChange={(cfg: Record<string, unknown>) =>
                      handleConfigChange(selectedSection.id, cfg)
                    }
                  />
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type === "success" ? "toastSuccess" : "toastError"]}`}
          >
            <span>{t.message}</span>
            {t.retry && (
              <button
                type="button"
                className={styles.toastRetry}
                onClick={t.retry}
              >
                Thử lại
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SortablePreviewSection({
  section,
  isSelected,
  onClick,
  onToggle,
  onDelete,
}: {
  section: Section;
  isSelected: boolean;
  onClick: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const SectionComp = SECTION_RENDER_MAP[section.section_type as string];

  return (
    <div ref={setNodeRef} style={style} className={styles.previewWrapper}>
      <div
        className={`${styles.previewToolbar} ${isSelected ? styles.previewToolbarActive : ""}`}
      >
        <button
          type="button"
          className={styles.previewDragHandle}
          {...attributes}
          {...listeners}
          title="Kéo để sắp xếp"
        >
          <GripVertical size={14} />
        </button>
        <span className={styles.previewLabel}>
          {SECTION_LABELS[section.section_type as SectionType] ??
            section.section_type}
        </span>
        <div className={styles.previewActions}>
          <button
            type="button"
            className={styles.previewActionBtn}
            onClick={onClick}
            title="Sửa"
          >
            <Pen size={12} />
          </button>
          <button
            type="button"
            className={`${styles.previewActionBtn} ${!section.is_published ? styles.previewActionOff : ""}`}
            onClick={onToggle}
            title={section.is_published ? "Ẩn" : "Hiện"}
          >
            {section.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            type="button"
            className={styles.previewActionDelete}
            onClick={onDelete}
            title="Xóa"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div
        className={`${styles.previewBody} ${isSelected ? styles.previewBodyActive : ""} ${!section.is_published ? styles.previewBodyHidden : ""}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
      >
        <div className={styles.previewScale}>
          {SectionComp ? (
            <Suspense
              fallback={
                <div className={styles.previewFallback}>
                  {SECTION_LABELS[section.section_type as SectionType]}
                </div>
              }
            >
              <SectionComp config={section.config} />
            </Suspense>
          ) : (
            <div className={styles.previewFallback}>
              {SECTION_LABELS[section.section_type as SectionType] ??
                section.section_type}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development")
      console.warn("[PageBuilder] Section preview error:", error.message);
  }
  override render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
