"use client";

import type { Block } from "@workspace/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ChevronUp, ChevronDown, Copy, Trash2, RotateCcw } from "lucide-react";
import { getDefaultData } from "./editorState";
import styles from "./workspace.module.scss";
import {
  HeadingEditor,
  ParagraphEditor,
  QuoteEditor,
  ListEditor,
  CodeEditor,
  CalloutEditor,
  ImageEditor,
  VideoEditor,
  DividerEditor,
  SpacerEditor,
  CTABlockEditor,
  PricingTableEditor,
  TestimonialEditor,
  TimelineEditor,
  TableEditor,
  GalleryEditor,
  CarouselEditor,
  BeforeAfterEditor,
  ColumnsEditor,
  TabsEditor,
  AccordionEditor,
  CollapseEditor,
} from "./block-editors";
import { BLOCK_LABELS } from "./LeftPanel";

const EDITORS: Record<string, React.ComponentType<{ data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }>> = {
  heading: HeadingEditor, paragraph: ParagraphEditor, quote: QuoteEditor,
  list: ListEditor, code: CodeEditor, callout: CalloutEditor,
  image: ImageEditor, video: VideoEditor, gallery: GalleryEditor,
  carousel: CarouselEditor, beforeAfter: BeforeAfterEditor,
  divider: DividerEditor, spacer: SpacerEditor, cta: CTABlockEditor,
  pricingTable: PricingTableEditor, testimonial: TestimonialEditor,
  timeline: TimelineEditor, table: TableEditor,
  columns: ColumnsEditor, tabs: TabsEditor,
  accordion: AccordionEditor, collapse: CollapseEditor,
};

interface Props {
  block: Block | null;
  onChange: (id: string, data: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReset: () => void;
}

export function RightPanel({ block, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown, onReset }: Props) {
  if (!block) {
    return (
      <div className={styles.rightPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Cấu hình Block</div>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.noSelection}>
            <p>Chọn một block để cấu hình</p>
          </div>
        </div>
      </div>
    );
  }

  const Editor = EDITORS[block.type];

  return (
    <div className={styles.rightPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Cấu hình Block</div>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.blockInfo}>
          <span className={styles.blockInfoType}>{BLOCK_LABELS[block.type]}</span>
          <div className={styles.blockInfoActions}>
            <button type="button" className={styles.iconBtn} onClick={onMoveUp} title="Di chuyển lên trên">
              <ChevronUp size={17} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={onMoveDown} title="Di chuyển xuống dưới">
              <ChevronDown size={17} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={onDuplicate} title="Nhân đôi block">
              <Copy size={17} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={onReset} title="Reset về mặc định">
              <RotateCcw size={17} />
            </button>
            <button type="button" className={styles.iconBtnDanger} onClick={onDelete} title="Xóa block">
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {Editor ? (
          <Editor data={block.data} onChange={(data) => onChange(block.id, data)} />
        ) : (
          <div className={styles.noConfig}>Block này chưa có form cấu hình (sử dụng trong nested editor)</div>
        )}
      </div>
    </div>
  );
}
