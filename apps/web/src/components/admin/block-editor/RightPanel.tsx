"use client";

import type { Block } from "@workspace/types";
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
}

export function RightPanel({ block, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown }: Props) {
  if (!block) {
    return (
      <div className={styles.rightPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Cấu hình Block</div>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.noSelection}>
            <div className={styles.noSelectionIcon}>⚙</div>
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
          <span className={styles.blockInfoType}>{block.type}</span>
          <div className={styles.blockInfoActions}>
            <button type="button" className={styles.iconBtn} onClick={onMoveUp} title="Lên trên">▲</button>
            <button type="button" className={styles.iconBtn} onClick={onMoveDown} title="Xuống dưới">▼</button>
            <button type="button" className={styles.iconBtn} onClick={onDuplicate} title="Nhân đôi">⧉</button>
            <button type="button" className={styles.iconBtnDanger} onClick={onDelete} title="Xóa">✕</button>
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
