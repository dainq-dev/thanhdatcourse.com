"use client";

import { useCallback, useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import type { Block, Content } from "@workspace/types";
import { useBlockEditorState, getDefaultData } from "./editorState";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { RightPanel } from "./RightPanel";
import styles from "./workspace.module.scss";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Redo2, Undo2, GripVertical, Eye, Maximize2, Minimize2, Settings2, Trash2 } from "lucide-react";

export interface BlockEditorProps {
  blocks: Content;
  onChange: (blocks: Content) => void;
  onSave?: () => void | Promise<void>;
  onPublish?: () => void | Promise<void>;
  saving?: boolean;
  leftPanel?: ReactNode;
  titleInput?: ReactNode;
  onFocus?: () => void;
  onPreview?: () => void;
}

function useResizablePanel() {
  const [width, setWidth] = useState(420);
  const isResizing = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const w = window.innerWidth - e.clientX;
      setWidth(Math.min(700, Math.max(320, w)));
    };
    const onMouseUp = () => { isResizing.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startResize = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  return { width, startResize };
}

export function BlockEditor({ blocks, onChange, onSave, onPublish, saving, leftPanel, titleInput, onFocus, onPreview }: BlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const editor = useBlockEditorState(blocks, onChange);
  const { width: rightWidth, startResize } = useResizablePanel();

  const selectedBlock = useMemo(
    () => (selectedId ? blocks.find((b) => b.id === selectedId) ?? null : null),
    [selectedId, blocks],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDrop = useCallback((type: Block["type"], atIndex?: number) => {
    editor.addBlock(type, atIndex);
  }, [editor]);

  const handleDelete = useCallback(() => {
    if (selectedId) { editor.removeBlock(selectedId); setSelectedId(null); }
  }, [selectedId, editor]);

  const handleDuplicate = useCallback(() => {
    if (selectedBlock) {
      const copy: Block = { id: crypto.randomUUID(), type: selectedBlock.type, data: JSON.parse(JSON.stringify(selectedBlock.data)) } as Block;
      const idx = blocks.findIndex((b) => b.id === selectedBlock.id);
      const next = [...blocks]; next.splice(idx + 1, 0, copy);
      onChange(next); setSelectedId(copy.id);
    }
  }, [selectedBlock, blocks, onChange]);

  const handleReset = useCallback(() => {
    if (selectedBlock) {
      editor.updateBlock(selectedBlock.id, getDefaultData(selectedBlock.type));
    }
  }, [selectedBlock, editor]);

  const handleMove = useCallback((dir: "up" | "down") => {
    if (!selectedId) return;
    const idx = blocks.findIndex((b) => b.id === selectedId);
    if (dir === "up" && idx > 0) editor.reorderBlocks(idx, idx - 1);
    else if (dir === "down" && idx < blocks.length - 1) editor.reorderBlocks(idx, idx + 1);
  }, [selectedId, blocks, editor]);

  return (
    <div className={styles.workspace}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button type="button" className={styles.topBarBtn} onClick={editor.undo} disabled={!editor.canUndo} title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
          <button type="button" className={styles.topBarBtn} onClick={editor.redo} disabled={!editor.canRedo} title="Redo (Ctrl+Shift+Z)"><Redo2 size={15} /></button>
          <span className={styles.topBarSep}>|</span>
          <span className={styles.topBarInfo}>{blocks.length} blocks</span>
        </div>
        <div className={styles.topBarRight}>
          <button type="button" className={styles.topBarBtn} onClick={() => setIsFocusMode(true)} title="Focus mode">
            <Maximize2 size={17} />
          </button>
          <button type="button" className={`${styles.topBarBtn} ${!showRightPanel ? styles.active : ""}`} onClick={() => setShowRightPanel(!showRightPanel)} title="Toggle cấu hình panel">
            <Settings2 size={17} />
          </button>
          {onPreview && (
            <button type="button" className={styles.topBarAction} onClick={onPreview} title="Xem trước bài viết">
              <Eye size={17} />
              <span style={{ marginLeft: 4 }}>Xem trước</span>
            </button>
          )}
          {onSave && <button type="button" className={styles.topBarAction} onClick={onSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu nháp"}</button>}
          {onPublish && <button type="button" className={styles.topBarPublish} onClick={onPublish} disabled={saving}>Xuất bản</button>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.leftPanel}>
          {leftPanel}
        </div>

        <div className={styles.center} onClick={() => setSelectedId(null)} onDoubleClick={() => onFocus?.()}>
          <div className={styles.editorPanel}>
            {titleInput}
            {blocks.length === 0 ? (
              <div className={styles.dropZone}>
                <div className={styles.dropZoneTitle}>Kéo block từ bên trái vào đây</div>
                <div className={styles.dropZoneHint}>hoặc bấm vào block bên panel Components để thêm</div>
              </div>
            ) : (
              <SortableBlockList blocks={blocks} selectedId={selectedId} onSelect={handleSelect} onDrop={handleDrop} onReorder={editor.reorderBlocks} onDelete={(id) => { editor.removeBlock(id); if (selectedId === id) setSelectedId(null); }} />
            )}
          </div>
        </div>

        {showRightPanel && (
          <>
            <div className={styles.resizeHandle} onMouseDown={startResize} />
            <div className={styles.rightPanel} style={{ width: rightWidth, minWidth: rightWidth }}>
              <RightPanel block={selectedBlock} onChange={(id, data) => editor.updateBlock(id, data)} onDelete={handleDelete} onDuplicate={handleDuplicate} onMoveUp={() => handleMove("up")} onMoveDown={() => handleMove("down")} onReset={handleReset} />
            </div>
          </>
        )}
      </div>

      {isFocusMode && (
        <div className={styles.focusOverlay}>
          <div className={styles.focusTopBar}>
            <div className={styles.topBarLeft}>
              <span className={styles.topBarInfo}>{blocks.length} blocks</span>
            </div>
            <div className={styles.topBarRight}>
              <button type="button" className={styles.topBarAction} onClick={() => setIsFocusMode(false)}>
                <Minimize2 size={17} />
                <span style={{ marginLeft: 4 }}>Thoát Focus</span>
              </button>
            </div>
          </div>
          <div className={styles.focusContent}>
            <div className={styles.focusArticle}>
              <BlockRenderer blocks={blocks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BLOCK_LABELS: Record<string, string> = {
  heading: "Tiêu đề", paragraph: "Đoạn văn", quote: "Trích dẫn", list: "Danh sách",
  code: "Code", callout: "Callout", image: "Ảnh", video: "Video",
  gallery: "Gallery", carousel: "Carousel", beforeAfter: "Trước/Sau",
  divider: "Phân cách", spacer: "Khoảng trống", columns: "Cột", tabs: "Tabs",
  accordion: "Accordion", collapse: "Thu gọn", timeline: "Timeline",
  table: "Bảng", cta: "CTA", pricingTable: "Bảng giá", testimonial: "Đánh giá",
};

function SortableBlockList({ blocks, selectedId, onSelect, onDrop, onReorder, onDelete }: {
  blocks: Content; selectedId: string | null;
  onSelect: (id: string) => void; onDrop: (t: Block["type"], i?: number) => void;
  onReorder: (f: number, t: number) => void; onDelete: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const from = blocks.findIndex((b) => b.id === active.id);
      const to = blocks.findIndex((b) => b.id === over.id);
      if (from !== -1 && to !== -1) onReorder(from, to);
    }}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.blockList}>
          {blocks.map((block, index) => (
            <SortableBlockItem key={block.id} block={block} index={index} total={blocks.length}
              isSelected={block.id === selectedId}
              onSelect={() => onSelect(block.id)}
              onDelete={() => onDelete(block.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBlockItem({ block, index, total, isSelected, onSelect, onDelete }: {
  block: Block; index: number; total: number; isSelected: boolean;
  onSelect: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <div className={`${styles.blockItem} ${isSelected ? styles.blockItemSelected : ""}`}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <div className={styles.blockItemDrag} {...attributes} {...listeners}>
          <GripVertical size={17} />
        </div>
        <div className={styles.blockItemThumb}>
          <BlockRenderer blocks={[block]} />
        </div>
        <div className={styles.blockItemActions}>
          <button type="button" className={styles.blockItemActionBtn} onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Xóa"><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}
