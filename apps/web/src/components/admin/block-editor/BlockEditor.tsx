"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Block, Content } from "@workspace/types";
import { useBlockEditorState } from "./editorState";
import { BlockPreview } from "./BlockPreview";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { RightPanel } from "./RightPanel";
import styles from "./workspace.module.scss";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Redo2, Undo2 } from "lucide-react";

export interface BlockEditorProps {
  blocks: Content;
  onChange: (blocks: Content) => void;
  onSave?: () => void | Promise<void>;
  onPublish?: () => void | Promise<void>;
  saving?: boolean;
  leftPanel?: ReactNode;
  titleInput?: ReactNode;
}

export function BlockEditor({ blocks, onChange, onSave, onPublish, saving, leftPanel, titleInput }: BlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const editor = useBlockEditorState(blocks, onChange);

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
          <button type="button" className={styles.topBarBtn} onClick={editor.undo} disabled={!editor.canUndo} title="Ctrl+Z"><Undo2 /></button>
          <button type="button" className={styles.topBarBtn} onClick={editor.redo} disabled={!editor.canRedo} title="Ctrl+Shift+Z"><Redo2 /></button>
          <span className={styles.topBarSep}>|</span>
          <span className={styles.topBarInfo}>{blocks.length} blocks</span>
        </div>
        <div className={styles.topBarRight}>
          <button type="button" className={`${styles.topBarAction} ${isPreview ? styles.active : ""}`} onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? "← Chỉnh sửa" : "Xem trước"}
          </button>
          {onSave && <button type="button" className={styles.topBarAction} onClick={onSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu nháp"}</button>}
          {onPublish && <button type="button" className={styles.topBarPublish} onClick={onPublish} disabled={saving}>Xuất bản</button>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.leftPanel}>
          {leftPanel}
        </div>

        <div className={styles.center} onClick={() => setSelectedId(null)}>
          {isPreview ? (
            <div className={styles.previewPanel}><BlockPreview blocks={blocks} /></div>
          ) : (
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
          )}
        </div>

        <RightPanel block={selectedBlock} onChange={(id, data) => editor.updateBlock(id, data)} onDelete={handleDelete} onDuplicate={handleDuplicate} onMoveUp={() => handleMove("up")} onMoveDown={() => handleMove("down")} />
      </div>
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
              onDelete={() => onDelete(block.id)}
              onDropAfter={(type) => onDrop(type, index + 1)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBlockItem({ block, index, total, isSelected, onSelect, onDelete, onDropAfter }: {
  block: Block; index: number; total: number; isSelected: boolean;
  onSelect: () => void; onDelete: () => void; onDropAfter: (t: Block["type"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <div className={`${styles.blockItem} ${isSelected ? styles.blockItemSelected : ""}`}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <div className={styles.blockItemDrag} {...attributes} {...listeners}>⋮⋮</div>
        <div className={styles.blockItemThumb}>
          <BlockRenderer blocks={[block]} />
        </div>
        <div className={styles.blockItemActions}>
          <button type="button" className={styles.blockItemActionBtn} onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Xóa">✕</button>
        </div>
      </div>
    </div>
  );
}

