"use client";

import type { Block } from "@workspace/types";
import {
  AlertCircle,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeftToLine,
  ArrowRightLeft,
  Bold,
  ChevronDown,
  ChevronRight,
  Circle,
  Columns2 as Cols2,
  Columns3 as Cols3,
  Diamond,
  Equal,
  EyeOff,
  GripHorizontal,
  Info,
  Italic as ItalicIcon,
  LayoutGrid,
  LayoutList,
  Lightbulb,
  ListCollapse,
  Maximize,
  Minus,
  Moon,
  MoveHorizontal,
  MoveVertical,
  Shrink,
  Square,
  SquareDashed,
  Sun,
  Trash2,
  Underline as UnderlineIcon,
  WrapText,
  X,
} from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { MediaManager } from "@/components/admin/media-manager";
import styles from "./block-editors.module.scss";

interface EditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

// ── Shared form components ──

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

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

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className={styles.textarea}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
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

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      className={styles.input}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldGroupTitle}>{title}</div>
      <div className={styles.fieldGroupBody}>{children}</div>
    </div>
  );
}

// ── IconGroup (Word/Office-style toolbar) ──

type IconOption = { value: string; label: string; icon: ReactNode };

function IconGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: IconOption[];
}) {
  return (
    <div className={styles.iconToolbar}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.iconToolbarBtn} ${value === opt.value ? styles.iconToolbarBtnActive : ""}`}
          onClick={() => onChange(opt.value)}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

function LabelGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className={styles.iconToolbar}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.iconToolbarBtn} ${styles.iconToolbarLabelBtn} ${value === opt.value ? styles.iconToolbarBtnActive : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const ICON_ALIGNMENT: IconOption[] = [
  { value: "left", label: "Căn trái", icon: <AlignLeft size={17} /> },
  { value: "center", label: "Căn giữa", icon: <AlignCenter size={17} /> },
  { value: "right", label: "Căn phải", icon: <AlignRight size={17} /> },
  { value: "justify", label: "Căn đều", icon: <AlignJustify size={17} /> },
];

const ICON_WEIGHT: IconOption[] = [
  {
    value: "regular",
    label: "Thường",
    icon: <span className={styles.iconText}>R</span>,
  },
  {
    value: "medium",
    label: "Vừa",
    icon: <span className={styles.iconTextBold}>M</span>,
  },
  {
    value: "semibold",
    label: "Đậm vừa",
    icon: <span className={styles.iconTextHeavy}>S</span>,
  },
  { value: "bold", label: "Đậm", icon: <Bold size={17} /> },
];

const ICON_FONT_SIZE: IconOption[] = [
  {
    value: "sm",
    label: "Nhỏ",
    icon: <span className={styles.iconTextSm}>A</span>,
  },
  {
    value: "md",
    label: "Vừa",
    icon: <span className={styles.iconTextMd}>A</span>,
  },
  {
    value: "lg",
    label: "Lớn",
    icon: <span className={styles.iconTextLg}>A</span>,
  },
];

const ICON_LINE_HEIGHT: IconOption[] = [
  { value: "tight", label: "Chặt", icon: <ListCollapse size={17} /> },
  { value: "normal", label: "Thường", icon: <AlignLeft size={17} /> },
  { value: "relaxed", label: "Thoáng", icon: <WrapText size={17} /> },
];

const ICON_ROUNDED: IconOption[] = [
  { value: "none", label: "Vuông", icon: <Square size={17} /> },
  { value: "sm", label: "Bo nhẹ", icon: <SquareDashed size={17} /> },
  {
    value: "md",
    label: "Bo vừa",
    icon: (
      <span
        style={{
          border: "none",
          background: "currentColor",
          width: 14,
          height: 14,
          borderRadius: 4,
          display: "inline-block",
          opacity: 0.7,
        }}
      />
    ),
  },
  {
    value: "lg",
    label: "Bo lớn",
    icon: (
      <span
        style={{
          border: "none",
          background: "currentColor",
          width: 14,
          height: 14,
          borderRadius: 6,
          display: "inline-block",
          opacity: 0.5,
        }}
      />
    ),
  },
  { value: "full", label: "Tròn", icon: <Circle size={17} /> },
];

const ICON_SHADOW_OPTS = [
  { value: "none", label: "Không đổ bóng" },
  { value: "sm", label: "Đổ bóng nhẹ" },
  { value: "md", label: "Đổ bóng vừa" },
  { value: "lg", label: "Đổ bóng lớn" },
  { value: "xl", label: "Đổ bóng XL" },
];

const ICON_BORDER: IconOption[] = [
  { value: "none", label: "Không viền", icon: <EyeOff size={17} /> },
  { value: "thin", label: "Viền mỏng", icon: <Minus size={17} /> },
  { value: "medium", label: "Viền vừa", icon: <GripHorizontal size={17} /> },
  { value: "thick", label: "Viền dày", icon: <Equal size={17} /> },
];

const ICON_OBJECT_FIT: IconOption[] = [
  { value: "cover", label: "Cover", icon: <Maximize size={17} /> },
  { value: "contain", label: "Contain", icon: <Shrink size={17} /> },
  { value: "fill", label: "Fill", icon: <Square size={17} /> },
];

const ICON_WIDTH: IconOption[] = [
  { value: "full", label: "Full", icon: <ArrowRightLeft size={17} /> },
  { value: "wide", label: "Rộng", icon: <MoveHorizontal size={17} /> },
  { value: "contained", label: "Thu gọn", icon: <ArrowLeftToLine size={17} /> },
  { value: "inline", label: "Inline", icon: <Minus size={17} /> },
];

const ICON_COLUMNS: IconOption[] = [
  { value: "2", label: "2 cột", icon: <Cols2 size={16} /> },
  { value: "3", label: "3 cột", icon: <Cols3 size={16} /> },
  {
    value: "4",
    label: "4 cột",
    icon: (
      <span style={{ display: "flex", gap: 1 }}>
        <span className={styles.miniCol} />
        <span className={styles.miniCol} />
        <span className={styles.miniCol} />
        <span className={styles.miniCol} />
      </span>
    ),
  },
];

const ICON_GAP: IconOption[] = [
  {
    value: "sm",
    label: "Hẹp",
    icon: <span className={styles.iconTextSm}>| |</span>,
  },
  {
    value: "md",
    label: "Vừa",
    icon: <span className={styles.iconTextMd}>| |</span>,
  },
  {
    value: "lg",
    label: "Rộng",
    icon: <span className={styles.iconTextLg}>| |</span>,
  },
];

const ICON_LAYOUT: IconOption[] = [
  { value: "grid", label: "Lưới", icon: <LayoutGrid size={17} /> },
  { value: "masonry", label: "Masonry", icon: <LayoutList size={17} /> },
];

const ICON_ASPECT: IconOption[] = [
  {
    value: "16:9",
    label: "16:9",
    icon: <span className={styles.iconTextSm}>16:9</span>,
  },
  {
    value: "4:3",
    label: "4:3",
    icon: <span className={styles.iconTextSm}>4:3</span>,
  },
  {
    value: "9:16",
    label: "9:16",
    icon: <span className={styles.iconTextSm}>9:16</span>,
  },
  {
    value: "1:1",
    label: "1:1",
    icon: <span className={styles.iconTextSm}>1:1</span>,
  },
  {
    value: "auto",
    label: "Tự động",
    icon: <span className={styles.iconTextSm}>Auto</span>,
  },
];

const ICON_TRANSITION: IconOption[] = [
  { value: "slide", label: "Slide", icon: <MoveHorizontal size={17} /> },
  { value: "fade", label: "Fade", icon: <Circle size={17} /> },
  { value: "cube", label: "Cube", icon: <Square size={17} /> },
];

const ICON_SLIDES: IconOption[] = [
  {
    value: "1",
    label: "1 slide",
    icon: <span className={styles.iconTextMd}>1</span>,
  },
  {
    value: "2",
    label: "2 slides",
    icon: <span className={styles.iconTextMd}>2</span>,
  },
  {
    value: "3",
    label: "3 slides",
    icon: <span className={styles.iconTextMd}>3</span>,
  },
];

const ICON_VARIANT: IconOption[] = [
  { value: "info", label: "Thông tin", icon: <Info size={17} /> },
  { value: "warning", label: "Cảnh báo", icon: <AlertTriangle size={17} /> },
  { value: "tip", label: "Mẹo", icon: <Lightbulb size={17} /> },
  { value: "danger", label: "Nguy hiểm", icon: <AlertCircle size={17} /> },
];

const ICON_THEME: IconOption[] = [
  { value: "dark", label: "Tối", icon: <Moon size={17} /> },
  { value: "light", label: "Sáng", icon: <Sun size={17} /> },
];

const ICON_ORIENTATION: IconOption[] = [
  { value: "horizontal", label: "Ngang", icon: <MoveHorizontal size={17} /> },
  { value: "vertical", label: "Dọc", icon: <MoveVertical size={17} /> },
];

const ICON_BTN_STYLE: IconOption[] = [
  { value: "solid", label: "Đặc", icon: <Square size={17} /> },
  { value: "outline", label: "Viền", icon: <SquareDashed size={17} /> },
  { value: "ghost", label: "Ghost", icon: <EyeOff size={17} /> },
];

const ICON_SIZE: IconOption[] = [
  {
    value: "sm",
    label: "Nhỏ",
    icon: <span className={styles.iconTextSm}>S</span>,
  },
  {
    value: "md",
    label: "Vừa",
    icon: <span className={styles.iconTextMd}>M</span>,
  },
  {
    value: "lg",
    label: "Lớn",
    icon: <span className={styles.iconTextLg}>L</span>,
  },
];

// ── ColorSelect ──

const COLOR_OPTIONS = [
  {
    label: "Kế thừa",
    value: "inherit",
    swatch: "linear-gradient(135deg, #94a3b8 50%, transparent 50%)",
  },
  { label: "Trắng", value: "--color-text", swatch: "#f1f5f9" },
  { label: "Xám", value: "--color-text-muted", swatch: "#94a3b8" },
  { label: "Primary", value: "--color-primary", swatch: "#0ea5e9" },
  { label: "Accent", value: "--color-accent", swatch: "#f59e0b" },
  { label: "Border", value: "--color-border", swatch: "#334155" },
];

function ColorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.iconToolbar}>
      {COLOR_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.colorToolbarBtn} ${value === opt.value ? styles.colorToolbarBtnActive : ""}`}
          onClick={() => onChange(opt.value)}
          title={opt.label}
        >
          <span
            className={styles.colorSwatchDot}
            style={{ background: opt.swatch }}
          />
        </button>
      ))}
    </div>
  );
}

// ── MediaPicker ──

function MediaPicker({
  value,
  onChange,
  filter,
}: {
  value: string;
  onChange: (v: string) => void;
  filter?: "image" | "video";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.mediaPicker}>
      {value && filter === "image" ? (
        <div className={styles.mediaPreview}>
          <img
            src={value.startsWith("http") ? value : `/img/${value}/thumbnail`}
            alt=""
            className={styles.mediaPreviewImg}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => onChange("")}
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Media ID / URL"
        />
      )}
      <button
        type="button"
        className={styles.mediaBtn}
        onClick={() => setOpen(true)}
      >
        {value ? "Đổi" : "Chọn"}
      </button>
      {open && (
        <MediaManager
          open={open}
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
          filter={filter}
          accept={filter === "image" ? "image/*" : "video/*"}
        />
      )}
    </div>
  );
}

function MultiMediaPicker({
  value,
  onChange,
  filter,
}: {
  value: string;
  onChange: (v: string) => void;
  filter?: "image" | "video";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.mediaPicker}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Media ID / URL"
      />
      <button
        type="button"
        className={styles.mediaBtn}
        onClick={() => setOpen(true)}
      >
        {value ? "Đổi" : "Chọn"}
      </button>
      {open && (
        <MediaManager
          open={open}
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
          }}
          filter={filter}
          accept={filter === "image" ? "image/*" : "video/*"}
          multi
        />
      )}
    </div>
  );
}

// ── IconPicker ──

const ICON_GROUPS: Record<string, string[]> = {
  "Mũi tên": [
    "ArrowRight",
    "ArrowLeft",
    "ArrowUp",
    "ArrowDown",
    "ChevronRight",
    "ChevronLeft",
    "ChevronUp",
    "ChevronDown",
  ],
  "Giao tiếp": [
    "MessageCircle",
    "MessageSquare",
    "Mail",
    "Phone",
    "Send",
    "Share2",
  ],
  Media: ["Image", "Video", "Camera", "Play", "Pause", "Music", "Film"],
  "Hành động": [
    "Check",
    "X",
    "Plus",
    "Minus",
    "Search",
    "Trash2",
    "Edit",
    "Copy",
    "Download",
    "Upload",
    "ExternalLink",
  ],
  "Thông báo": [
    "Bell",
    "AlertCircle",
    "AlertTriangle",
    "Info",
    "HelpCircle",
    "Zap",
    "Star",
    "Heart",
    "ThumbsUp",
    "Award",
  ],
  Chung: [
    "Globe",
    "Home",
    "User",
    "Users",
    "Settings",
    "Calendar",
    "Clock",
    "BookOpen",
    "FileText",
    "Quote",
    "Lightbulb",
    "Sparkles",
  ],
};

function IconPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredGroups = Object.entries(ICON_GROUPS).reduce(
    (acc, [cat, icons]) => {
      const filtered = icons.filter((i) =>
        i.toLowerCase().includes(search.toLowerCase()),
      );
      if (filtered.length > 0) acc[cat] = filtered;
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.iconPicker}>
      <div className={styles.iconPickerRow}>
        {value ? (
          <span className={styles.iconPreview}>
            <Diamond size={12} /> {value}
          </span>
        ) : (
          <span className={styles.iconEmpty}>Chưa chọn</span>
        )}
        <button
          type="button"
          className={styles.mediaBtn}
          onClick={() => setOpen(!open)}
        >
          {value ? "Đổi" : "Chọn icon"}
        </button>
        {value && (
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => onChange(null)}
          >
            <X size={17} />
          </button>
        )}
      </div>
      {open && (
        <div className={styles.iconDropdown}>
          <input
            type="text"
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm icon..."
            autoFocus
          />
          <div className={styles.iconGrid}>
            {Object.entries(filteredGroups).map(([cat, icons]) => (
              <div key={cat}>
                <div className={styles.iconCat}>{cat}</div>
                <div className={styles.iconRow}>
                  {icons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`${styles.iconBtn} ${value === name ? styles.iconActive : ""}`}
                      onClick={() => handleSelect(name)}
                      title={name}
                    >
                      {name.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
//  BLOCK EDITORS
// ═══════════════════════════════════

// ── Typography ──

export function HeadingEditor({ data, onChange }: EditorProps) {
  const d = data as {
    level: number;
    text: string;
    alignment: string;
    weight: string;
    italic: boolean;
    underline: boolean;
    color: string;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Nội dung">
        <TextArea
          value={d.text || ""}
          onChange={(v) => onChange({ ...data, text: v })}
          placeholder="Tiêu đề..."
          rows={2}
        />
      </FieldGroup>
      <FieldGroup title="Định dạng">
        <LabelGroup
          value={String(d.level || 2)}
          onChange={(v) => onChange({ ...data, level: Number(v) })}
          options={[
            { label: "H1", value: "1" },
            { label: "H2", value: "2" },
            { label: "H3", value: "3" },
            { label: "H4", value: "4" },
            { label: "H5", value: "5" },
            { label: "H6", value: "6" },
          ]}
        />
        <IconGroup
          value={d.alignment || "left"}
          onChange={(v) => onChange({ ...data, alignment: v })}
          options={ICON_ALIGNMENT}
        />
        <IconGroup
          value={d.weight || "bold"}
          onChange={(v) => onChange({ ...data, weight: v })}
          options={ICON_WEIGHT}
        />
        <div className={styles.inlineRow}>
          <button
            type="button"
            className={`${styles.iconToolbarBtn} ${d.italic ? styles.iconToolbarBtnActive : ""}`}
            onClick={() => onChange({ ...data, italic: !d.italic })}
            title="In nghiêng"
          >
            <ItalicIcon size={15} />
          </button>
          <button
            type="button"
            className={`${styles.iconToolbarBtn} ${d.underline ? styles.iconToolbarBtnActive : ""}`}
            onClick={() => onChange({ ...data, underline: !d.underline })}
            title="Gạch chân"
          >
            <UnderlineIcon size={15} />
          </button>
        </div>
      </FieldGroup>
      <FieldGroup title="Màu sắc">
        <ColorSelect
          value={d.color || "inherit"}
          onChange={(v) => onChange({ ...data, color: v })}
        />
      </FieldGroup>
    </div>
  );
}

export function ParagraphEditor({ data, onChange }: EditorProps) {
  const d = data as {
    text: string;
    alignment: string;
    dropCap: boolean;
    fontSize: string;
    lineHeight: string;
    weight: string;
    color: string;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Nội dung">
        <TextArea
          value={d.text || ""}
          onChange={(v) => onChange({ ...data, text: v })}
          placeholder="Nội dung đoạn văn..."
          rows={6}
        />
      </FieldGroup>
      <FieldGroup title="Định dạng">
        <IconGroup
          value={d.alignment || "left"}
          onChange={(v) => onChange({ ...data, alignment: v })}
          options={ICON_ALIGNMENT}
        />
        <IconGroup
          value={d.fontSize || "md"}
          onChange={(v) => onChange({ ...data, fontSize: v })}
          options={ICON_FONT_SIZE}
        />
        <IconGroup
          value={d.lineHeight || "normal"}
          onChange={(v) => onChange({ ...data, lineHeight: v })}
          options={ICON_LINE_HEIGHT}
        />
        <div className={styles.inlineRow}>
          <IconGroup
            value={d.weight || "regular"}
            onChange={(v) => onChange({ ...data, weight: v })}
            options={ICON_WEIGHT}
          />
          <Toggle
            label="Drop Cap"
            value={d.dropCap || false}
            onChange={(v) => onChange({ ...data, dropCap: v })}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="Màu sắc">
        <ColorSelect
          value={d.color || "inherit"}
          onChange={(v) => onChange({ ...data, color: v })}
        />
      </FieldGroup>
    </div>
  );
}

export function QuoteEditor({ data, onChange }: EditorProps) {
  const d = data as {
    text: string;
    author?: string;
    style: string;
    icon: string | null;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <LabelGroup
          value={d.style || "default"}
          onChange={(v) => onChange({ ...data, style: v })}
          options={[
            { label: "Mặc định", value: "default" },
            { label: "Có viền", value: "bordered" },
            { label: "Pull", value: "pull" },
          ]}
        />
      </FieldGroup>
      <TextArea
        value={d.text || ""}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Nội dung trích dẫn..."
      />
      <TextInput
        value={d.author || ""}
        onChange={(v) => onChange({ ...data, author: v })}
        placeholder="Tác giả (tùy chọn)"
      />
      <Field label="Icon">
        <IconPicker
          value={d.icon ?? null}
          onChange={(v) => onChange({ ...data, icon: v })}
        />
      </Field>
    </div>
  );
}

export function ListEditor({ data, onChange }: EditorProps) {
  const d = data as { style: string; items: string[] };
  const addItem = () => onChange({ ...data, items: [...d.items, ""] });
  const updateItem = (i: number, val: string) => {
    const items = [...d.items];
    items[i] = val;
    onChange({ ...data, items });
  };
  const removeItem = (i: number) =>
    onChange({ ...data, items: d.items.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <LabelGroup
          value={d.style}
          onChange={(v) => onChange({ ...data, style: v })}
          options={[
            { label: "UL", value: "unordered" },
            { label: "OL", value: "ordered" },
            { label: "Checklist", value: "checklist" },
          ]}
        />
      </FieldGroup>
      {d.items.map((item, i) => (
        <div key={i} className={styles.listRow}>
          <input
            type="text"
            className={styles.input}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`Mục ${i + 1}`}
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => removeItem(i)}
          >
            <X size={17} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addItem}>
        + Thêm mục
      </button>
    </div>
  );
}

export function CodeEditor({ data, onChange }: EditorProps) {
  const d = data as {
    code: string;
    language: string;
    showLineNumbers: boolean;
    theme: string;
    showCopyButton: boolean;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Ngôn ngữ">
        <select
          className={styles.select}
          value={d.language || "plaintext"}
          onChange={(e) => onChange({ ...data, language: e.target.value })}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
          <option value="sql">SQL</option>
          <option value="plaintext">Plain Text</option>
        </select>
      </FieldGroup>
      <FieldGroup title="Theme">
        <IconGroup
          value={d.theme || "dark"}
          onChange={(v) => onChange({ ...data, theme: v })}
          options={ICON_THEME}
        />
      </FieldGroup>
      <TextArea
        value={d.code || ""}
        onChange={(v) => onChange({ ...data, code: v })}
        placeholder="Dán code vào đây..."
        rows={6}
      />
      <div className={styles.inlineRow}>
        <Toggle
          label="Số dòng"
          value={d.showLineNumbers || false}
          onChange={(v) => onChange({ ...data, showLineNumbers: v })}
        />
        <Toggle
          label="Nút copy"
          value={d.showCopyButton ?? true}
          onChange={(v) => onChange({ ...data, showCopyButton: v })}
        />
      </div>
    </div>
  );
}

export function CalloutEditor({ data, onChange }: EditorProps) {
  const d = data as {
    text: string;
    variant: string;
    icon: string | null;
    title?: string;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <IconGroup
          value={d.variant || "info"}
          onChange={(v) => onChange({ ...data, variant: v })}
          options={ICON_VARIANT}
        />
      </FieldGroup>
      <TextInput
        value={d.title || ""}
        onChange={(v) => onChange({ ...data, title: v })}
        placeholder="Tiêu đề (tùy chọn)"
      />
      <TextArea
        value={d.text || ""}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Nội dung callout..."
        rows={3}
      />
      <Field label="Icon">
        <IconPicker
          value={d.icon ?? null}
          onChange={(v) => onChange({ ...data, icon: v })}
        />
      </Field>
    </div>
  );
}

// ── Media ──

export function ImageEditor({ data, onChange }: EditorProps) {
  const d = data as {
    mediaId: string;
    alt?: string;
    caption?: string;
    width: string;
    rounded: string;
    border: string;
    shadow: string;
    hoverZoom: boolean;
    link?: string;
    objectFit: string;
  };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID">
        <MediaPicker
          value={d.mediaId || ""}
          onChange={(v) => onChange({ ...data, mediaId: v })}
          filter="image"
        />
      </Field>
      <FieldGroup title="Kích thước">
        <IconGroup
          value={d.width || "wide"}
          onChange={(v) => onChange({ ...data, width: v })}
          options={ICON_WIDTH}
        />
      </FieldGroup>
      <FieldGroup title="Bo góc">
        <IconGroup
          value={d.rounded || "none"}
          onChange={(v) => onChange({ ...data, rounded: v })}
          options={ICON_ROUNDED}
        />
      </FieldGroup>
      <FieldGroup title="Viền">
        <IconGroup
          value={d.border || "none"}
          onChange={(v) => onChange({ ...data, border: v })}
          options={ICON_BORDER}
        />
      </FieldGroup>
      <FieldGroup title="Đổ bóng">
        <LabelGroup
          value={d.shadow || "none"}
          onChange={(v) => onChange({ ...data, shadow: v })}
          options={ICON_SHADOW_OPTS}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <Toggle
          label="Phóng to khi hover"
          value={d.hoverZoom || false}
          onChange={(v) => onChange({ ...data, hoverZoom: v })}
        />
        <IconGroup
          value={d.objectFit || "cover"}
          onChange={(v) => onChange({ ...data, objectFit: v })}
          options={ICON_OBJECT_FIT}
        />
      </div>
      <TextInput
        value={d.alt || ""}
        onChange={(v) => onChange({ ...data, alt: v })}
        placeholder="Alt text"
      />
      <TextInput
        value={d.caption || ""}
        onChange={(v) => onChange({ ...data, caption: v })}
        placeholder="Chú thích ảnh"
      />
      <TextInput
        value={d.link || ""}
        onChange={(v) => onChange({ ...data, link: v })}
        placeholder="Link (tùy chọn)"
      />
    </div>
  );
}

export function VideoEditor({ data, onChange }: EditorProps) {
  const d = data as {
    mediaId: string;
    caption?: string;
    aspectRatio: string;
    rounded: string;
    shadow: string;
    autoplay: boolean;
    loop: boolean;
    showControls: boolean;
    thumbnail?: string;
  };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID (YouTube)">
        <MediaPicker
          value={d.mediaId || ""}
          onChange={(v) => onChange({ ...data, mediaId: v })}
          filter="video"
        />
      </Field>
      <FieldGroup title="Tỷ lệ">
        <IconGroup
          value={d.aspectRatio || "16:9"}
          onChange={(v) => onChange({ ...data, aspectRatio: v })}
          options={ICON_ASPECT}
        />
      </FieldGroup>
      <FieldGroup title="Bo góc">
        <IconGroup
          value={d.rounded || "none"}
          onChange={(v) => onChange({ ...data, rounded: v })}
          options={ICON_ROUNDED}
        />
      </FieldGroup>
      <FieldGroup title="Đổ bóng">
        <LabelGroup
          value={d.shadow || "none"}
          onChange={(v) => onChange({ ...data, shadow: v })}
          options={ICON_SHADOW_OPTS}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <Toggle
          label="Autoplay"
          value={d.autoplay || false}
          onChange={(v) => onChange({ ...data, autoplay: v })}
        />
        <Toggle
          label="Loop"
          value={d.loop || false}
          onChange={(v) => onChange({ ...data, loop: v })}
        />
      </div>
      <Toggle
        label="Hiện controls"
        value={d.showControls ?? true}
        onChange={(v) => onChange({ ...data, showControls: v })}
      />
      <Field label="Ảnh thumbnail (tùy chọn)">
        <MediaPicker
          value={d.thumbnail || ""}
          onChange={(v) => onChange({ ...data, thumbnail: v })}
          filter="image"
        />
      </Field>
      <TextInput
        value={d.caption || ""}
        onChange={(v) => onChange({ ...data, caption: v })}
        placeholder="Chú thích video"
      />
    </div>
  );
}

export function GalleryEditor({ data, onChange }: EditorProps) {
  const d = data as {
    images: { mediaId: string; caption?: string }[];
    columns: number;
    gap: string;
    layout: string;
    rounded: string;
    shadow: string;
    hoverZoom: boolean;
    lightbox: boolean;
  };
  const add = () =>
    onChange({ ...data, images: [...d.images, { mediaId: "" }] });
  const addBatch = (urls: string) => {
    const parsed = urls
      .split("\n")
      .filter(Boolean)
      .map((u) => ({ mediaId: u, caption: "" }));
    if (parsed.length > 0)
      onChange({ ...data, images: [...d.images, ...parsed] });
  };
  const upd = (i: number, img: (typeof d.images)[0]) => {
    const images = [...d.images];
    images[i] = img;
    onChange({ ...data, images });
  };
  const del = (i: number) =>
    onChange({ ...data, images: d.images.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <IconGroup
          value={String(d.columns || 3)}
          onChange={(v) => onChange({ ...data, columns: Number(v) })}
          options={ICON_COLUMNS}
        />
        <IconGroup
          value={d.gap || "md"}
          onChange={(v) => onChange({ ...data, gap: v })}
          options={ICON_GAP}
        />
        <IconGroup
          value={d.layout || "grid"}
          onChange={(v) => onChange({ ...data, layout: v })}
          options={ICON_LAYOUT}
        />
      </div>
      <FieldGroup title="Bo góc">
        <IconGroup
          value={d.rounded || "none"}
          onChange={(v) => onChange({ ...data, rounded: v })}
          options={ICON_ROUNDED}
        />
      </FieldGroup>
      <FieldGroup title="Đổ bóng">
        <LabelGroup
          value={d.shadow || "none"}
          onChange={(v) => onChange({ ...data, shadow: v })}
          options={ICON_SHADOW_OPTS}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <Toggle
          label="Hover zoom"
          value={d.hoverZoom || false}
          onChange={(v) => onChange({ ...data, hoverZoom: v })}
        />
        <Toggle
          label="Lightbox"
          value={d.lightbox ?? true}
          onChange={(v) => onChange({ ...data, lightbox: v })}
        />
      </div>
      <button type="button" className={styles.addBtn} onClick={add}>
        + Thêm ảnh đơn
      </button>
      <Field label="Chọn nhiều ảnh">
        <MultiMediaPicker value="" onChange={addBatch} filter="image" />
      </Field>
      {d.images.map((img, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Ảnh ${i + 1}`}>
            <MediaPicker
              value={img.mediaId}
              onChange={(v) => upd(i, { ...img, mediaId: v })}
              filter="image"
            />
          </Field>
          <TextInput
            value={img.caption || ""}
            onChange={(v) => upd(i, { ...img, caption: v })}
            placeholder="Chú thích"
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => del(i)}
          >
            <X size={17} /> Xóa
          </button>
        </div>
      ))}
    </div>
  );
}

export function CarouselEditor({ data, onChange }: EditorProps) {
  const d = data as {
    slides: { mediaId: string; caption?: string }[];
    autoplay: boolean;
    interval: number;
    showDots: boolean;
    showArrows: boolean;
    transition: string;
    rounded: string;
    shadow: string;
    aspectRatio: string;
    loop: boolean;
    pauseOnHover: boolean;
    slidesPerView: number;
  };
  const add = () =>
    onChange({ ...data, slides: [...d.slides, { mediaId: "" }] });
  const addBatch = (urls: string) => {
    const parsed = urls
      .split("\n")
      .filter(Boolean)
      .map((u) => ({ mediaId: u, caption: "" }));
    if (parsed.length > 0)
      onChange({ ...data, slides: [...d.slides, ...parsed] });
  };
  const upd = (i: number, s: (typeof d.slides)[0]) => {
    const slides = [...d.slides];
    slides[i] = s;
    onChange({ ...data, slides });
  };
  const del = (i: number) =>
    onChange({ ...data, slides: d.slides.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Toggle
          label="Tự động"
          value={d.autoplay || false}
          onChange={(v) => onChange({ ...data, autoplay: v })}
        />
        <Toggle
          label="Loop"
          value={d.loop ?? true}
          onChange={(v) => onChange({ ...data, loop: v })}
        />
      </div>
      {d.autoplay && (
        <Field label="Interval (ms)">
          <NumberInput
            value={d.interval || 5000}
            onChange={(v) => onChange({ ...data, interval: v })}
            min={1000}
          />
        </Field>
      )}
      <FieldGroup title="Transition">
        <IconGroup
          value={d.transition || "slide"}
          onChange={(v) => onChange({ ...data, transition: v })}
          options={ICON_TRANSITION}
        />
      </FieldGroup>
      <FieldGroup title="Slides hiển thị">
        <IconGroup
          value={String(d.slidesPerView ?? 1)}
          onChange={(v) => onChange({ ...data, slidesPerView: Number(v) })}
          options={ICON_SLIDES}
        />
      </FieldGroup>
      <FieldGroup title="Tỷ lệ">
        <IconGroup
          value={d.aspectRatio || "16:9"}
          onChange={(v) => onChange({ ...data, aspectRatio: v })}
          options={ICON_ASPECT}
        />
      </FieldGroup>
      <FieldGroup title="Bo góc">
        <IconGroup
          value={d.rounded || "none"}
          onChange={(v) => onChange({ ...data, rounded: v })}
          options={ICON_ROUNDED}
        />
      </FieldGroup>
      <FieldGroup title="Đổ bóng">
        <LabelGroup
          value={d.shadow || "none"}
          onChange={(v) => onChange({ ...data, shadow: v })}
          options={ICON_SHADOW_OPTS}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <Toggle
          label="Dots"
          value={d.showDots ?? true}
          onChange={(v) => onChange({ ...data, showDots: v })}
        />
        <Toggle
          label="Mũi tên"
          value={d.showArrows ?? true}
          onChange={(v) => onChange({ ...data, showArrows: v })}
        />
        <Toggle
          label="Dừng khi hover"
          value={d.pauseOnHover ?? true}
          onChange={(v) => onChange({ ...data, pauseOnHover: v })}
        />
      </div>
      <button type="button" className={styles.addBtn} onClick={add}>
        + Thêm slide đơn
      </button>
      <Field label="Chọn nhiều ảnh">
        <MultiMediaPicker value="" onChange={addBatch} filter="image" />
      </Field>
      {d.slides.map((s, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Slide ${i + 1}`}>
            <MediaPicker
              value={s.mediaId}
              onChange={(v) => upd(i, { ...s, mediaId: v })}
              filter="image"
            />
          </Field>
          <TextInput
            value={s.caption || ""}
            onChange={(v) => upd(i, { ...s, caption: v })}
            placeholder="Chú thích"
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => del(i)}
          >
            <X size={17} /> Xóa
          </button>
        </div>
      ))}
    </div>
  );
}

export function BeforeAfterEditor({ data, onChange }: EditorProps) {
  const d = data as {
    beforeMediaId: string;
    afterMediaId: string;
    beforeLabel: string;
    afterLabel: string;
    caption?: string;
    orientation: string;
    rounded: string;
    shadow: string;
  };
  return (
    <div className={styles.editorBody}>
      <Field label="Ảnh Before">
        <MediaPicker
          value={d.beforeMediaId || ""}
          onChange={(v) => onChange({ ...data, beforeMediaId: v })}
          filter="image"
        />
      </Field>
      <Field label="Ảnh After">
        <MediaPicker
          value={d.afterMediaId || ""}
          onChange={(v) => onChange({ ...data, afterMediaId: v })}
          filter="image"
        />
      </Field>
      <FieldGroup title="Hướng">
        <IconGroup
          value={d.orientation || "horizontal"}
          onChange={(v) => onChange({ ...data, orientation: v })}
          options={ICON_ORIENTATION}
        />
      </FieldGroup>
      <FieldGroup title="Bo góc">
        <IconGroup
          value={d.rounded || "none"}
          onChange={(v) => onChange({ ...data, rounded: v })}
          options={ICON_ROUNDED}
        />
      </FieldGroup>
      <FieldGroup title="Đổ bóng">
        <LabelGroup
          value={d.shadow || "none"}
          onChange={(v) => onChange({ ...data, shadow: v })}
          options={ICON_SHADOW_OPTS}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <TextInput
          value={d.beforeLabel || ""}
          onChange={(v) => onChange({ ...data, beforeLabel: v })}
          placeholder="Nhãn Before"
        />
        <TextInput
          value={d.afterLabel || ""}
          onChange={(v) => onChange({ ...data, afterLabel: v })}
          placeholder="Nhãn After"
        />
      </div>
      <TextInput
        value={d.caption || ""}
        onChange={(v) => onChange({ ...data, caption: v })}
        placeholder="Chú thích"
      />
    </div>
  );
}

// ── Layout ──

export function DividerEditor({ data, onChange }: EditorProps) {
  const d = data as { style: string };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <LabelGroup
          value={d.style || "solid"}
          onChange={(v) => onChange({ ...data, style: v })}
          options={[
            { label: "Nét liền", value: "solid" },
            { label: "Nét đứt", value: "dashed" },
            { label: "Chấm chấm", value: "dotted" },
            { label: "Gradient", value: "gradient" },
          ]}
        />
      </FieldGroup>
    </div>
  );
}

export function SpacerEditor({ data, onChange }: EditorProps) {
  const d = data as { height: number };
  return (
    <div className={styles.editorBody}>
      <Field label="Chiều cao (px)">
        <NumberInput
          value={d.height ?? 40}
          onChange={(v) =>
            onChange({ ...data, height: Math.min(200, Math.max(8, v)) })
          }
          min={8}
          max={200}
        />
      </Field>
    </div>
  );
}

export function ColumnsEditor({ data, onChange }: EditorProps) {
  const d = data as {
    columns: number;
    content: any[][];
    gap: string;
    columnRatios: string;
  };
  const updateColContent = (i: number, blocks: any[]) => {
    const content = [...d.content];
    content[i] = blocks;
    onChange({ ...data, content });
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Số cột">
        <IconGroup
          value={String(d.columns || 2)}
          onChange={(v) => {
            const n = Number(v);
            const content = Array.from(
              { length: n },
              (_, i) => d.content[i] || [],
            );
            onChange({ ...data, columns: n, content });
          }}
          options={ICON_COLUMNS}
        />
      </FieldGroup>
      <FieldGroup title="Khoảng cách">
        <IconGroup
          value={d.gap || "md"}
          onChange={(v) => onChange({ ...data, gap: v })}
          options={ICON_GAP}
        />
      </FieldGroup>
      <FieldGroup title="Tỷ lệ">
        <LabelGroup
          value={d.columnRatios || "auto"}
          onChange={(v) => onChange({ ...data, columnRatios: v })}
          options={[
            { label: "Auto", value: "auto" },
            { label: "50-50", value: "50-50" },
            { label: "33-33-33", value: "33-33-33" },
            { label: "25-75", value: "25-75" },
            { label: "75-25", value: "75-25" },
            { label: "33-67", value: "33-67" },
            { label: "67-33", value: "67-33" },
          ]}
        />
      </FieldGroup>
      <div className={styles.nestedZones}>
        {Array.from({ length: d.columns || 2 }, (_, i) => (
          <div key={i} className={styles.nestedZone}>
            <div className={styles.nestedZoneLabel}>Cột {i + 1}</div>
            <NestedBlockList
              blocks={d.content?.[i] || []}
              onChange={(b) => updateColContent(i, b)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabsEditor({ data, onChange }: EditorProps) {
  const d = data as {
    tabs: { label: string; content: any[] }[];
    tabStyle: string;
    defaultTab: number;
  };
  const addTab = () =>
    onChange({ ...data, tabs: [...d.tabs, { label: "", content: [] }] });
  const updTab = (i: number, tab: (typeof d.tabs)[0]) => {
    const tabs = [...d.tabs];
    tabs[i] = tab;
    onChange({ ...data, tabs });
  };
  const delTab = (i: number) =>
    onChange({ ...data, tabs: d.tabs.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <LabelGroup
          value={d.tabStyle || "top"}
          onChange={(v) => onChange({ ...data, tabStyle: v })}
          options={[
            { label: "Top", value: "top" },
            { label: "Pills", value: "pills" },
            { label: "Dọc", value: "vertical" },
          ]}
        />
      </FieldGroup>
      <Field label="Tab mặc định">
        <NumberInput
          value={d.defaultTab ?? 0}
          onChange={(v) => onChange({ ...data, defaultTab: v })}
          min={0}
        />
      </Field>
      {d.tabs.map((tab, i) => (
        <div key={i} className={styles.nestedZone}>
          <div className={styles.nestedHeader}>
            <TextInput
              value={tab.label}
              onChange={(v) => updTab(i, { ...tab, label: v })}
              placeholder={`Tab ${i + 1}`}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => delTab(i)}
            >
              <X size={17} />
            </button>
          </div>
          <NestedBlockList
            blocks={tab.content || []}
            onChange={(b) => updTab(i, { ...tab, content: b })}
          />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addTab}>
        + Thêm tab
      </button>
    </div>
  );
}

// ── Interactive ──

export function AccordionEditor({ data, onChange }: EditorProps) {
  const d = data as {
    items: { title: string; content: any[] }[];
    allowMultiple: boolean;
    iconPosition: string;
    defaultOpenIndex: number;
    borderStyle: string;
  };
  const add = () =>
    onChange({ ...data, items: [...d.items, { title: "", content: [] }] });
  const upd = (i: number, item: (typeof d.items)[0]) => {
    const items = [...d.items];
    items[i] = item;
    onChange({ ...data, items });
  };
  const del = (i: number) =>
    onChange({ ...data, items: d.items.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <Toggle
        label="Cho phép mở nhiều item"
        value={d.allowMultiple ?? true}
        onChange={(v) => onChange({ ...data, allowMultiple: v })}
      />
      <div className={styles.inlineRow}>
        <LabelGroup
          value={d.iconPosition || "right"}
          onChange={(v) => onChange({ ...data, iconPosition: v })}
          options={[
            { label: "Icon trái", value: "left" },
            { label: "Icon phải", value: "right" },
          ]}
        />
        <LabelGroup
          value={d.borderStyle || "bordered"}
          onChange={(v) => onChange({ ...data, borderStyle: v })}
          options={[
            { label: "Có viền", value: "bordered" },
            { label: "Không viền", value: "borderless" },
          ]}
        />
      </div>
      <Field label="Mở mặc định (index)">
        <NumberInput
          value={d.defaultOpenIndex ?? -1}
          onChange={(v) => onChange({ ...data, defaultOpenIndex: v })}
          min={-1}
        />
      </Field>
      {d.items.map((item, i) => (
        <div key={i} className={styles.nestedZone}>
          <div className={styles.nestedHeader}>
            <TextInput
              value={item.title}
              onChange={(v) => upd(i, { ...item, title: v })}
              placeholder={`Item ${i + 1}`}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => del(i)}
            >
              <X size={17} />
            </button>
          </div>
          <NestedBlockList
            blocks={item.content || []}
            onChange={(b) => upd(i, { ...item, content: b })}
          />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>
        + Thêm item
      </button>
    </div>
  );
}

export function CollapseEditor({ data, onChange }: EditorProps) {
  const d = data as {
    title: string;
    content: any[];
    defaultOpen: boolean;
    iconPosition: string;
  };
  return (
    <div className={styles.editorBody}>
      <TextInput
        value={d.title || ""}
        onChange={(v) => onChange({ ...data, title: v })}
        placeholder="Tiêu đề thu gọn"
      />
      <div className={styles.inlineRow}>
        <Toggle
          label="Mở mặc định"
          value={d.defaultOpen || false}
          onChange={(v) => onChange({ ...data, defaultOpen: v })}
        />
        <LabelGroup
          value={d.iconPosition || "right"}
          onChange={(v) => onChange({ ...data, iconPosition: v })}
          options={[
            { label: "Trái", value: "left" },
            { label: "Phải", value: "right" },
          ]}
        />
      </div>
      <NestedBlockList
        blocks={d.content || []}
        onChange={(b) => onChange({ ...data, content: b })}
      />
    </div>
  );
}

export function TimelineEditor({ data, onChange }: EditorProps) {
  const d = data as {
    events: { date: string; title: string; description: string }[];
    layout: string;
    iconPerEvent: string | null;
    lineColor: string;
  };
  const add = () =>
    onChange({
      ...data,
      events: [...d.events, { date: "", title: "", description: "" }],
    });
  const upd = (i: number, ev: (typeof d.events)[0]) => {
    const events = [...d.events];
    events[i] = ev;
    onChange({ ...data, events });
  };
  const del = (i: number) =>
    onChange({ ...data, events: d.events.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Bố cục">
        <LabelGroup
          value={d.layout || "vertical"}
          onChange={(v) => onChange({ ...data, layout: v })}
          options={[
            { label: "Dọc", value: "vertical" },
            { label: "Ngang", value: "horizontal" },
            { label: "Xen kẽ", value: "alternating" },
          ]}
        />
      </FieldGroup>
      <FieldGroup title="Màu đường">
        <LabelGroup
          value={d.lineColor || "--color-border"}
          onChange={(v) => onChange({ ...data, lineColor: v })}
          options={[
            { label: "Border", value: "--color-border" },
            { label: "Primary", value: "--color-primary" },
            { label: "Accent", value: "--color-accent" },
          ]}
        />
      </FieldGroup>
      <Field label="Icon mỗi sự kiện">
        <IconPicker
          value={d.iconPerEvent ?? null}
          onChange={(v) => onChange({ ...data, iconPerEvent: v })}
        />
      </Field>
      {d.events.map((ev, i) => (
        <div key={i} className={styles.nestedBlock}>
          <div className={styles.pricingHeader}>
            <span>Sự kiện {i + 1}</span>
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => del(i)}
            >
              <X size={17} />
            </button>
          </div>
          <TextInput
            value={ev.date}
            onChange={(v) => upd(i, { ...ev, date: v })}
            placeholder="Ngày (vd: 2024)"
          />
          <TextInput
            value={ev.title}
            onChange={(v) => upd(i, { ...ev, title: v })}
            placeholder="Tiêu đề"
          />
          <TextArea
            value={ev.description}
            onChange={(v) => upd(i, { ...ev, description: v })}
            placeholder="Mô tả"
            rows={2}
          />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>
        + Thêm sự kiện
      </button>
    </div>
  );
}

export function TableEditor({ data, onChange }: EditorProps) {
  const d = data as {
    headers: string[];
    rows: string[][];
    striped: boolean;
    compact: boolean;
    theme: string;
  };
  const updHdr = (i: number, v: string) => {
    const headers = [...d.headers];
    headers[i] = v;
    onChange({ ...data, headers });
  };
  const addCol = () =>
    onChange({
      ...data,
      headers: [...d.headers, `Cột ${d.headers.length + 1}`],
      rows: d.rows.map((r) => [...r, ""]),
    });
  const delCol = (ci: number) =>
    onChange({
      ...data,
      headers: d.headers.filter((_, i) => i !== ci),
      rows: d.rows.map((r) => r.filter((_, i) => i !== ci)),
    });
  const addRow = () =>
    onChange({ ...data, rows: [...d.rows, d.headers.map(() => "")] });
  const updCell = (ri: number, ci: number, v: string) => {
    const rows = [...d.rows];
    rows[ri] = [...rows[ri]];
    rows[ri][ci] = v;
    onChange({ ...data, rows });
  };
  const delRow = (ri: number) =>
    onChange({ ...data, rows: d.rows.filter((_, i) => i !== ri) });
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Theme">
        <IconGroup
          value={d.theme || "classic"}
          onChange={(v) => onChange({ ...data, theme: v })}
          options={[
            {
              value: "classic",
              label: "Classic",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#2B2B2B" }}
                />
              ),
            },
            {
              value: "professional",
              label: "Professional",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#1E3A5F" }}
                />
              ),
            },
            {
              value: "colorful",
              label: "Colorful",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#059669" }}
                />
              ),
            },
            {
              value: "minimal",
              label: "Minimal",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{
                    background: "transparent",
                    border: "1px solid #ccc",
                  }}
                />
              ),
            },
            {
              value: "dark",
              label: "Dark",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#1F2937" }}
                />
              ),
            },
          ]}
        />
      </FieldGroup>
      <div className={styles.inlineRow}>
        <Toggle
          label="Sọc xen kẽ"
          value={d.striped ?? true}
          onChange={(v) => onChange({ ...data, striped: v })}
        />
        <Toggle
          label="Thu gọn"
          value={d.compact || false}
          onChange={(v) => onChange({ ...data, compact: v })}
        />
      </div>
      <div className={styles.tableHeaders}>
        {d.headers.map((h, i) => (
          <div key={i} className={styles.tableHeaderCell}>
            <input
              type="text"
              className={styles.input}
              value={h}
              onChange={(e) => updHdr(i, e.target.value)}
              placeholder={`Cột ${i + 1}`}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => delCol(i)}
            >
              <X size={17} />
            </button>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addCol}>
          + Cột
        </button>
      </div>
      {d.rows.map((row, ri) => (
        <div key={ri} className={styles.tableRow}>
          {row.map((cell, ci) => (
            <input
              key={ci}
              type="text"
              className={styles.input}
              value={cell}
              onChange={(e) => updCell(ri, ci, e.target.value)}
              placeholder={`Ô ${ri + 1},${ci + 1}`}
            />
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => delRow(ri)}
          >
            <X size={17} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addRow}>
        + Dòng
      </button>
    </div>
  );
}

// ── Conversion ──

export function CTABlockEditor({ data, onChange }: EditorProps) {
  const d = data as {
    heading: string;
    text?: string;
    buttonText: string;
    buttonUrl: string;
    style: string;
    backgroundMediaId?: string;
    buttonStyle: string;
    buttonSize: string;
    buttonIcon: string | null;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Chủ đề CTA">
        <IconGroup
          value={d.style || "blue"}
          onChange={(v) => onChange({ ...data, style: v })}
          options={[
            {
              value: "blue",
              label: "Xanh",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#1a73e8" }}
                />
              ),
            },
            {
              value: "green",
              label: "Lục",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#059669" }}
                />
              ),
            },
            {
              value: "dark",
              label: "Tối",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#0F172A" }}
                />
              ),
            },
            {
              value: "light",
              label: "Sáng",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#F8FAFC", border: "1px solid #ccc" }}
                />
              ),
            },
            {
              value: "red",
              label: "Đỏ",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{ background: "#DC2626" }}
                />
              ),
            },
            {
              value: "minimal",
              label: "Minimal",
              icon: (
                <span
                  className={styles.themeSwatch}
                  style={{
                    background: "transparent",
                    border: "2px solid #3B82F6",
                  }}
                />
              ),
            },
          ]}
        />
      </FieldGroup>
      <TextInput
        value={d.heading || ""}
        onChange={(v) => onChange({ ...data, heading: v })}
        placeholder="Tiêu đề CTA"
      />
      <TextArea
        value={d.text || ""}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Mô tả"
        rows={2}
      />
      <div className={styles.inlineRow}>
        <TextInput
          value={d.buttonText || ""}
          onChange={(v) => onChange({ ...data, buttonText: v })}
          placeholder="Nút"
        />
        <TextInput
          value={d.buttonUrl || ""}
          onChange={(v) => onChange({ ...data, buttonUrl: v })}
          placeholder="URL"
        />
      </div>
      <FieldGroup title="Kiểu nút">
        <IconGroup
          value={d.buttonStyle || "solid"}
          onChange={(v) => onChange({ ...data, buttonStyle: v })}
          options={ICON_BTN_STYLE}
        />
      </FieldGroup>
      <FieldGroup title="Kích thước nút">
        <IconGroup
          value={d.buttonSize || "md"}
          onChange={(v) => onChange({ ...data, buttonSize: v })}
          options={ICON_SIZE}
        />
      </FieldGroup>
      <Field label="Icon nút">
        <IconPicker
          value={d.buttonIcon ?? null}
          onChange={(v) => onChange({ ...data, buttonIcon: v })}
        />
      </Field>
      <Field label="Ảnh nền (tùy chọn)">
        <MediaPicker
          value={d.backgroundMediaId || ""}
          onChange={(v) => onChange({ ...data, backgroundMediaId: v })}
          filter="image"
        />
      </Field>
    </div>
  );
}

export function PricingTableEditor({ data, onChange }: EditorProps) {
  const d = data as {
    plans: {
      name: string;
      price: string;
      period?: string;
      description?: string;
      features: string[];
      cta: { text: string; url: string };
      highlighted: boolean;
    }[];
    currency: string;
    billingPeriod: string;
    layout: string;
  };
  const addPlan = () =>
    onChange({
      ...data,
      plans: [
        ...d.plans,
        {
          name: "",
          price: "",
          features: [],
          cta: { text: "", url: "" },
          highlighted: false,
        },
      ],
    });
  const updPlan = (i: number, plan: (typeof d.plans)[0]) => {
    const plans = [...d.plans];
    plans[i] = plan;
    onChange({ ...data, plans });
  };
  const delPlan = (i: number) =>
    onChange({ ...data, plans: d.plans.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <TextInput
          value={d.currency || "VNĐ"}
          onChange={(v) => onChange({ ...data, currency: v })}
          placeholder="Tiền tệ"
        />
        <LabelGroup
          value={d.billingPeriod || "monthly"}
          onChange={(v) => onChange({ ...data, billingPeriod: v })}
          options={[
            { label: "Tháng", value: "monthly" },
            { label: "Năm", value: "yearly" },
          ]}
        />
        <IconGroup
          value={d.layout || "horizontal"}
          onChange={(v) => onChange({ ...data, layout: v })}
          options={ICON_ORIENTATION}
        />
      </div>
      {d.plans.map((plan, i) => (
        <div key={i} className={styles.pricingPlan}>
          <div className={styles.pricingHeader}>
            <TextInput
              value={plan.name}
              onChange={(v) => updPlan(i, { ...plan, name: v })}
              placeholder="Tên gói"
            />
            <Toggle
              label="Nổi bật"
              value={plan.highlighted}
              onChange={(v) => updPlan(i, { ...plan, highlighted: v })}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => delPlan(i)}
            >
              <X size={17} />
            </button>
          </div>
          <div className={styles.inlineRow}>
            <TextInput
              value={plan.price}
              onChange={(v) => updPlan(i, { ...plan, price: v })}
              placeholder="Giá"
            />
            <TextInput
              value={plan.period || ""}
              onChange={(v) => updPlan(i, { ...plan, period: v })}
              placeholder="Chu kỳ"
            />
          </div>
          <TextArea
            value={plan.description || ""}
            onChange={(v) => updPlan(i, { ...plan, description: v })}
            placeholder="Mô tả"
            rows={2}
          />
          <Field label="Tính năng">
            {plan.features.map((f, fi) => (
              <div key={fi} className={styles.listRow}>
                <TextInput
                  value={f}
                  onChange={(v) => {
                    const feats = [...plan.features];
                    feats[fi] = v;
                    updPlan(i, { ...plan, features: feats });
                  }}
                  placeholder={`Tính năng ${fi + 1}`}
                />
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() =>
                    updPlan(i, {
                      ...plan,
                      features: plan.features.filter((_, idx) => idx !== fi),
                    })
                  }
                >
                  <X size={17} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addBtn}
              onClick={() =>
                updPlan(i, { ...plan, features: [...plan.features, ""] })
              }
            >
              + Thêm tính năng
            </button>
          </Field>
          <div className={styles.inlineRow}>
            <TextInput
              value={plan.cta.text}
              onChange={(v) =>
                updPlan(i, { ...plan, cta: { ...plan.cta, text: v } })
              }
              placeholder="Nút"
            />
            <TextInput
              value={plan.cta.url}
              onChange={(v) =>
                updPlan(i, { ...plan, cta: { ...plan.cta, url: v } })
              }
              placeholder="URL"
            />
          </div>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addPlan}>
        + Thêm gói
      </button>
    </div>
  );
}

export function TestimonialEditor({ data, onChange }: EditorProps) {
  const d = data as {
    testimonialId: string;
    style: string;
    showAvatar: boolean;
    showRating: boolean;
    avatarSize: string;
    background: string;
  };
  return (
    <div className={styles.editorBody}>
      <FieldGroup title="Kiểu">
        <LabelGroup
          value={d.style || "card"}
          onChange={(v) => onChange({ ...data, style: v })}
          options={[
            { label: "Card", value: "card" },
            { label: "Inline", value: "inline" },
            { label: "Large", value: "large" },
          ]}
        />
      </FieldGroup>
      <Field label="Testimonial ID">
        <TextInput
          value={d.testimonialId || ""}
          onChange={(v) => onChange({ ...data, testimonialId: v })}
          placeholder="ID của testimonial"
        />
      </Field>
      <div className={styles.inlineRow}>
        <Toggle
          label="Hiện avatar"
          value={d.showAvatar ?? true}
          onChange={(v) => onChange({ ...data, showAvatar: v })}
        />
        <Toggle
          label="Hiện sao"
          value={d.showRating ?? true}
          onChange={(v) => onChange({ ...data, showRating: v })}
        />
      </div>
      <FieldGroup title="Kích thước avatar">
        <IconGroup
          value={d.avatarSize || "md"}
          onChange={(v) => onChange({ ...data, avatarSize: v })}
          options={ICON_SIZE}
        />
      </FieldGroup>
      <FieldGroup title="Nền">
        <LabelGroup
          value={d.background || "none"}
          onChange={(v) => onChange({ ...data, background: v })}
          options={[
            { label: "Không nền", value: "none" },
            { label: "Sáng", value: "light" },
            { label: "Tối", value: "dark" },
            { label: "Gradient", value: "gradient" },
          ]}
        />
      </FieldGroup>
    </div>
  );
}

// ═══════════════════════════════════
//  NESTED BLOCK LIST
// ═══════════════════════════════════

const BLOCK_LABELS: Record<string, string> = {
  heading: "Tiêu đề",
  paragraph: "Đoạn văn",
  quote: "Trích dẫn",
  list: "Danh sách",
  code: "Code",
  callout: "Callout",
  image: "Ảnh",
  video: "Video",
  gallery: "Gallery",
  carousel: "Carousel",
  beforeAfter: "Trước/Sau",
  divider: "Phân cách",
  spacer: "Khoảng trống",
  columns: "Cột",
  tabs: "Tabs",
  accordion: "Accordion",
  collapse: "Thu gọn",
  timeline: "Timeline",
  table: "Bảng",
  cta: "CTA",
  pricingTable: "Bảng giá",
  testimonial: "Đánh giá",
};

function NestedBlockList({
  blocks,
  onChange,
}: {
  blocks: any[];
  onChange: (blocks: any[]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const add = useCallback(
    (type: string) => {
      const defaultData = getDefaultDataNested(type);
      onChange([
        ...blocks,
        { id: crypto.randomUUID(), type, data: defaultData },
      ]);
    },
    [blocks, onChange],
  );

  const remove = useCallback(
    (idx: number) => {
      if (editingIdx === idx) setEditingIdx(null);
      onChange(blocks.filter((_, i) => i !== idx));
    },
    [blocks, onChange, editingIdx],
  );

  const updateData = useCallback(
    (idx: number, data: Record<string, unknown>) => {
      const next = [...blocks];
      next[idx] = { ...next[idx], data };
      onChange(next);
    },
    [blocks, onChange],
  );

  return (
    <div className={styles.nestedBlockList}>
      {blocks.map((b, i) => (
        <div key={b.id || i} className={styles.nestedBlockItem}>
          <div className={styles.nestedBlockHeader}>
            <button
              type="button"
              className={styles.nestedBlockLabelBtn}
              onClick={() => setEditingIdx(editingIdx === i ? null : i)}
            >
              <span className={styles.nestedBlockType}>
                {BLOCK_LABELS[b.type] || b.type}
              </span>
              <span className={styles.nestedChevron}>
                {editingIdx === i ? (
                  <ChevronDown size={10} />
                ) : (
                  <ChevronRight size={10} />
                )}
              </span>
            </button>
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => remove(i)}
            >
              <X size={17} />
            </button>
          </div>
          {editingIdx === i && (
            <div className={styles.nestedBlockEditor}>
              {NestedBlockMiniEditor({
                data: b.data,
                type: b.type,
                onChange: (d: Record<string, unknown>) => updateData(i, d),
              })}
            </div>
          )}
        </div>
      ))}
      <AddBlockMenu onSelect={add} />
    </div>
  );
}

const NESTED_EDITORS: Record<string, React.ComponentType<EditorProps>> = {
  heading: HeadingEditor,
  paragraph: ParagraphEditor,
  quote: QuoteEditor,
  list: ListEditor,
  code: CodeEditor,
  callout: CalloutEditor,
  image: ImageEditor,
  video: VideoEditor,
  divider: DividerEditor,
  spacer: SpacerEditor,
  cta: CTABlockEditor,
};

function NestedBlockMiniEditor({
  data,
  type,
  onChange,
}: {
  data: Record<string, unknown>;
  type: string;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const Editor = NESTED_EDITORS[type];
  if (!Editor)
    return (
      <div className={styles.noConfig}>Không hỗ trợ config block: {type}</div>
    );
  return <Editor data={data} onChange={onChange} />;
}

function AddBlockMenu({ onSelect }: { onSelect: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const groups: Record<string, { label: string; value: string }[]> = {
    "Văn bản": [
      { label: "Tiêu đề", value: "heading" },
      { label: "Đoạn văn", value: "paragraph" },
      { label: "Trích dẫn", value: "quote" },
      { label: "Danh sách", value: "list" },
      { label: "Code", value: "code" },
      { label: "Callout", value: "callout" },
    ],
    Media: [
      { label: "Ảnh", value: "image" },
      { label: "Video", value: "video" },
    ],
    "Bố cục": [
      { label: "Phân cách", value: "divider" },
      { label: "Khoảng trống", value: "spacer" },
    ],
    "Chuyển đổi": [{ label: "CTA", value: "cta" }],
  };

  return (
    <div className={styles.addBlockMenu}>
      {!open ? (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setOpen(true)}
        >
          + Thêm block
        </button>
      ) : (
        <div className={styles.addMenuDropdown}>
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <div className={styles.addMenuCat}>{cat}</div>
              {items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={styles.addMenuItem}
                  onClick={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <button
            type="button"
            className={styles.addMenuClose}
            onClick={() => setOpen(false)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

function getDefaultDataNested(type: string): Record<string, unknown> {
  switch (type) {
    case "heading":
      return {
        level: 2,
        text: "",
        alignment: "left",
        weight: "bold",
        italic: false,
        underline: false,
        color: "inherit",
      };
    case "paragraph":
      return {
        text: "",
        alignment: "left",
        dropCap: false,
        fontSize: "md",
        lineHeight: "normal",
        weight: "regular",
        color: "inherit",
      };
    case "quote":
      return { text: "", style: "default", icon: null };
    case "list":
      return { style: "unordered", items: [""] };
    case "code":
      return {
        code: "",
        language: "plaintext",
        showLineNumbers: false,
        theme: "dark",
        showCopyButton: true,
      };
    case "callout":
      return { text: "", variant: "info", icon: null, title: "" };
    case "image":
      return {
        mediaId: "",
        width: "wide",
        rounded: "none",
        border: "none",
        shadow: "none",
        hoverZoom: false,
        link: "",
        objectFit: "cover",
      };
    case "video":
      return {
        mediaId: "",
        aspectRatio: "16:9",
        rounded: "none",
        shadow: "none",
        autoplay: false,
        loop: false,
        showControls: true,
        thumbnail: "",
      };
    case "divider":
      return { style: "solid" };
    case "spacer":
      return { height: 40 };
    case "cta":
      return {
        heading: "",
        buttonText: "",
        buttonUrl: "",
        style: "blue",
        buttonStyle: "solid",
        buttonSize: "md",
        buttonIcon: null,
      };
    default:
      return {};
  }
}
