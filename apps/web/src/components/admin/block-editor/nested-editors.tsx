"use client";

import type { Block } from "@workspace/types";
import styles from "./block-editor.module.scss";

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.toggleRow}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.checkbox}
      />
      <span>{label}</span>
    </label>
  );
}

interface NestedProps {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
  readOnly: boolean;
}

export function NestedBlockEditor({ block, onChange, readOnly }: NestedProps) {
  switch (block.type) {
    case "columns":
      return (
        <ColumnsNestedEditor
          data={block.data}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "tabs":
      return (
        <TabsNestedEditor
          data={block.data}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "accordion":
      return (
        <AccordionNestedEditor
          data={block.data}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "collapse":
      return (
        <CollapseNestedEditor
          data={block.data}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    default:
      return (
        <div className={styles.unknownBlock}>
          Unknown nested type: {(block as { type: string }).type}
        </div>
      );
  }
}

type ColumnsData = { columns: number; content: Block[][]; gap: string };

function ColumnsNestedEditor({
  data,
  onChange,
  readOnly,
}: {
  data: ColumnsData;
  onChange: (d: Record<string, unknown>) => void;
  readOnly: boolean;
}) {
  const changeCols = (n: number) => {
    let content = data.content;
    if (n > content.length) {
      content = [
        ...content,
        ...Array.from({ length: n - content.length }, () => [] as Block[]),
      ];
    } else {
      content = content.slice(0, n);
    }
    onChange({ ...data, columns: n, content });
  };

  const updateColContent = (i: number, blocks: Block[]) => {
    const content = [...data.content];
    content[i] = blocks;
    onChange({ ...data, content });
  };

  return (
    <div className={styles.nestedBody}>
      <div className={styles.inlineRow}>
        <Select
          value={String(data.columns)}
          onChange={(v) => changeCols(Number(v))}
          options={[
            { label: "2 cột", value: "2" },
            { label: "3 cột", value: "3" },
            { label: "4 cột", value: "4" },
          ]}
        />
        <Select
          value={data.gap || "md"}
          onChange={(v) => onChange({ ...data, gap: v })}
          options={[
            { label: "Nhỏ", value: "sm" },
            { label: "Vừa", value: "md" },
            { label: "Lớn", value: "lg" },
          ]}
        />
      </div>
      <div
        className={styles.columnsGrid}
        style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}
      >
        {data.content.map((colBlocks, i) => (
          <div key={i} className={styles.columnItem}>
            <div className={styles.columnLabel}>Cột {i + 1}</div>
            <MiniBlockList
              blocks={colBlocks}
              onChange={(b) => updateColContent(i, b)}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type TabsData = { tabs: { label: string; content: Block[] }[] };

function TabsNestedEditor({
  data,
  onChange,
  readOnly,
}: {
  data: TabsData;
  onChange: (d: Record<string, unknown>) => void;
  readOnly: boolean;
}) {
  const addTab = () =>
    onChange({
      ...data,
      tabs: [
        ...data.tabs,
        { label: `Tab ${data.tabs.length + 1}`, content: [] },
      ],
    });
  const updateTab = (i: number, tab: (typeof data.tabs)[0]) => {
    const tabs = [...data.tabs];
    tabs[i] = tab;
    onChange({ ...data, tabs });
  };
  const removeTab = (i: number) =>
    onChange({ ...data, tabs: data.tabs.filter((_, idx) => idx !== i) });

  return (
    <div className={styles.nestedBody}>
      {data.tabs.map((tab, i) => (
        <div key={i} className={styles.nestedBlock}>
          <div className={styles.nestedHeader}>
            <TextInput
              value={tab.label}
              onChange={(v) => updateTab(i, { ...tab, label: v })}
              placeholder="Tên tab"
            />
            {!readOnly && (
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => removeTab(i)}
              >
                ✕
              </button>
            )}
          </div>
          <MiniBlockList
            blocks={tab.content}
            onChange={(b) => updateTab(i, { ...tab, content: b })}
            readOnly={readOnly}
          />
        </div>
      ))}
      {!readOnly && (
        <button type="button" className={styles.addBtn} onClick={addTab}>
          + Thêm tab
        </button>
      )}
    </div>
  );
}

type AccordionData = {
  items: { title: string; content: Block[] }[];
  allowMultiple: boolean;
};

function AccordionNestedEditor({
  data,
  onChange,
  readOnly,
}: {
  data: AccordionData;
  onChange: (d: Record<string, unknown>) => void;
  readOnly: boolean;
}) {
  const addItem = () =>
    onChange({ ...data, items: [...data.items, { title: "", content: [] }] });
  const updateItem = (i: number, item: (typeof data.items)[0]) => {
    const items = [...data.items];
    items[i] = item;
    onChange({ ...data, items });
  };
  const removeItem = (i: number) =>
    onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  return (
    <div className={styles.nestedBody}>
      <Toggle
        label="Cho phép mở nhiều"
        value={data.allowMultiple}
        onChange={(v) => onChange({ ...data, allowMultiple: v })}
      />
      {data.items.map((item, i) => (
        <div key={i} className={styles.nestedBlock}>
          <div className={styles.nestedHeader}>
            <TextInput
              value={item.title}
              onChange={(v) => updateItem(i, { ...item, title: v })}
              placeholder="Tiêu đề accordion"
            />
            {!readOnly && (
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => removeItem(i)}
              >
                ✕
              </button>
            )}
          </div>
          <MiniBlockList
            blocks={item.content}
            onChange={(b) => updateItem(i, { ...item, content: b })}
            readOnly={readOnly}
          />
        </div>
      ))}
      {!readOnly && (
        <button type="button" className={styles.addBtn} onClick={addItem}>
          + Thêm item
        </button>
      )}
    </div>
  );
}

type CollapseData = { title: string; content: Block[]; defaultOpen: boolean };

function CollapseNestedEditor({
  data,
  onChange,
  readOnly,
}: {
  data: CollapseData;
  onChange: (d: Record<string, unknown>) => void;
  readOnly: boolean;
}) {
  return (
    <div className={styles.nestedBody}>
      <TextInput
        value={data.title}
        onChange={(v) => onChange({ ...data, title: v })}
        placeholder="Tiêu đề"
      />
      <Toggle
        label="Mở mặc định"
        value={data.defaultOpen}
        onChange={(v) => onChange({ ...data, defaultOpen: v })}
      />
      <div className={styles.nestedLabel}>Nội dung:</div>
      <MiniBlockList
        blocks={data.content}
        onChange={(b) => onChange({ ...data, content: b })}
        readOnly={readOnly}
      />
    </div>
  );
}

import type { Content, Block as TBlock } from "@workspace/types";
import { useCallback, useState } from "react";
import {
  BeforeAfterEditor,
  CalloutEditor,
  CarouselEditor,
  CodeEditor,
  CTABlockEditor,
  DividerEditor,
  GalleryEditor,
  HeadingEditor,
  ImageEditor,
  ListEditor,
  ParagraphEditor,
  PricingTableEditor,
  QuoteEditor,
  SpacerEditor,
  TableEditor,
  TestimonialEditor,
  TimelineEditor,
  VideoEditor,
} from "./block-editors";

const MINI_EDITOR_MAP: Record<
  string,
  React.ComponentType<{
    data: Record<string, unknown>;
    onChange: (data: Record<string, unknown>) => void;
  }>
> = {
  heading: HeadingEditor,
  paragraph: ParagraphEditor,
  quote: QuoteEditor,
  list: ListEditor,
  code: CodeEditor,
  callout: CalloutEditor,
  image: ImageEditor,
  video: VideoEditor,
  gallery: GalleryEditor,
  carousel: CarouselEditor,
  beforeAfter: BeforeAfterEditor,
  divider: DividerEditor,
  spacer: SpacerEditor,
  cta: CTABlockEditor,
  pricingTable: PricingTableEditor,
  testimonial: TestimonialEditor,
  timeline: TimelineEditor,
  table: TableEditor,
};

const BLOCK_LABELS: Record<string, string> = {
  heading: "H",
  paragraph: "¶",
  quote: '"',
  list: "≡",
  code: "</>",
  callout: "!",
  image: "🖼",
  video: "▶",
  gallery: "▦",
  carousel: "◀▶",
  beforeAfter: "⇔",
  divider: "—",
  spacer: "↕",
  cta: "→",
  pricingTable: "$",
  testimonial: "★",
  timeline: "◉",
  table: "⊞",
};

function MiniBlockList({
  blocks,
  onChange,
  readOnly,
}: {
  blocks: Content;
  onChange: (blocks: Content) => void;
  readOnly: boolean;
}) {
  const [openMiniMenu, setOpenMiniMenu] = useState(false);

  const addMiniBlock = useCallback(
    (type: TBlock["type"]) => {
      const newBlock: TBlock = {
        id: crypto.randomUUID(),
        type,
        data: {} as Record<string, unknown>,
      } as TBlock;
      onChange([...blocks, newBlock]);
      setOpenMiniMenu(false);
    },
    [blocks, onChange],
  );

  const updateMiniBlock = (id: string, data: Record<string, unknown>) => {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, data } as TBlock) : b)));
  };

  const removeMiniBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className={styles.miniBlockList}>
      {blocks.map((block) => {
        const Comp = MINI_EDITOR_MAP[block.type];
        return (
          <div key={block.id} className={styles.miniBlockItem}>
            <div className={styles.miniBlockToolbar}>
              <span className={styles.miniBlockLabel}>
                {BLOCK_LABELS[block.type] || block.type}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => removeMiniBlock(block.id)}
                >
                  ✕
                </button>
              )}
            </div>
            {Comp ? (
              <div className={styles.miniBlockContent}>
                <Comp
                  data={block.data}
                  onChange={(data) => updateMiniBlock(block.id, data)}
                />
              </div>
            ) : (
              <div className={styles.unknownBlock}>Unknown: {block.type}</div>
            )}
          </div>
        );
      })}
      {!readOnly && (
        <div className={styles.addMenuWrapper}>
          <button
            type="button"
            className={styles.addBetweenBtn}
            onClick={() => setOpenMiniMenu(!openMiniMenu)}
          >
            + Thêm block
          </button>
          {openMiniMenu && (
            <MiniBlockMenu
              onSelect={addMiniBlock}
              onClose={() => setOpenMiniMenu(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

const MINI_CATEGORIES = [
  {
    name: "Văn bản",
    types: ["heading", "paragraph", "quote", "list", "code", "callout"],
  },
  { name: "Media", types: ["image", "video"] },
  { name: "Bố cục", types: ["divider", "spacer"] },
  {
    name: "Khác",
    types: ["cta", "timeline", "table", "pricingTable", "testimonial"],
  },
];

function MiniBlockMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: TBlock["type"]) => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.blockMenu}>
      <div className={styles.blockMenuOverlay} onClick={onClose} />
      <div className={styles.blockMenuDropdown}>
        {MINI_CATEGORIES.map((cat) => (
          <div key={cat.name} className={styles.blockMenuGroup}>
            <div className={styles.blockMenuGroupTitle}>{cat.name}</div>
            {cat.types.map((type) => (
              <button
                key={type}
                type="button"
                className={styles.blockMenuItem}
                onClick={() => onSelect(type as TBlock["type"])}
              >
                <span className={styles.blockMenuIcon}>
                  {BLOCK_LABELS[type]}
                </span>
                <span className={styles.blockMenuLabel}>
                  {
                    {
                      heading: "Tiêu đề",
                      paragraph: "Đoạn văn",
                      quote: "Trích dẫn",
                      list: "Danh sách",
                      code: "Code",
                      callout: "Callout",
                      image: "Ảnh",
                      video: "Video",
                      divider: "Phân cách",
                      spacer: "Khoảng trống",
                      cta: "CTA",
                      timeline: "Timeline",
                      table: "Bảng",
                      pricingTable: "Bảng giá",
                      testimonial: "Đánh giá",
                    }[type]
                  }
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
