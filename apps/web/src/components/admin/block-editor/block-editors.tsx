"use client";

import type { Block } from "@workspace/types";
import { useState, useCallback } from "react";
import { MediaManager } from "@/components/admin/media-manager";
import styles from "./block-editors.module.scss";

interface EditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

// ── Shared form components ──

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={styles.field}><label className={styles.fieldLabel}>{label}</label>{children}</div>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea className={styles.textarea} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <label className={styles.toggleRow}><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className={styles.checkbox} /><span>{label}</span></label>;
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <input type="number" className={styles.input} value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />;
}

function MediaPicker({ value, onChange, filter }: { value: string; onChange: (v: string) => void; filter?: "image" | "video" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.mediaPicker}>
      <input type="text" className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Media ID" />
      <button type="button" className={styles.mediaBtn} onClick={() => setOpen(true)}>Chọn</button>
      {open && <MediaManager open={open} onClose={() => setOpen(false)} onSelect={(url) => { onChange(url); setOpen(false); }} filter={filter} accept={filter === "image" ? "image/*" : "video/*"} />}
    </div>
  );
}

// ── Shared select options ──

const ROUNDED_OPTIONS = [
  { label: "Không", value: "none" }, { label: "Nhỏ (4px)", value: "sm" },
  { label: "Vừa (8px)", value: "md" }, { label: "Lớn (16px)", value: "lg" }, { label: "Tròn", value: "full" },
];
const SHADOW_OPTIONS = [
  { label: "Không", value: "none" }, { label: "Nhỏ", value: "sm" },
  { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" }, { label: "XL", value: "xl" },
];
const ALIGNMENT_OPTIONS = [
  { label: "Trái", value: "left" }, { label: "Giữa", value: "center" },
  { label: "Phải", value: "right" }, { label: "Đều", value: "justify" },
];
const WEIGHT_OPTIONS = [
  { label: "Thường", value: "regular" }, { label: "Vừa", value: "medium" },
  { label: "Đậm vừa", value: "semibold" }, { label: "Đậm", value: "bold" },
];
const COLOR_OPTIONS = [
  { label: "Kế thừa", value: "inherit" }, { label: "Trắng", value: "--color-text" },
  { label: "Xám", value: "--color-text-muted" }, { label: "Primary", value: "--color-primary" },
  { label: "Accent", value: "--color-accent" }, { label: "Border", value: "--color-border" },
];
const FONT_SIZE_OPTIONS = [
  { label: "Nhỏ", value: "sm" }, { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" },
];
const LINE_HEIGHT_OPTIONS = [
  { label: "Chặt", value: "tight" }, { label: "Bình thường", value: "normal" }, { label: "Thoáng", value: "relaxed" },
];

// ── IconPicker ──

const ICON_GROUPS: Record<string, string[]> = {
  "Mũi tên": ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown"],
  "Giao tiếp": ["MessageCircle", "MessageSquare", "Mail", "Phone", "Send", "Share2"],
  "Media": ["Image", "Video", "Camera", "Play", "Pause", "Music", "Film"],
  "Hành động": ["Check", "X", "Plus", "Minus", "Search", "Trash2", "Edit", "Copy", "Download", "Upload", "ExternalLink"],
  "Thông báo": ["Bell", "AlertCircle", "AlertTriangle", "Info", "HelpCircle", "Zap", "Star", "Heart", "ThumbsUp", "Award"],
  "Chung": ["Globe", "Home", "User", "Users", "Settings", "Calendar", "Clock", "BookOpen", "FileText", "Quote", "Lightbulb", "Sparkles"],
};

function IconPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredGroups = Object.entries(ICON_GROUPS).reduce((acc, [cat, icons]) => {
    const filtered = icons.filter((i) => i.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, string[]>);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.iconPicker}>
      <div className={styles.iconPickerRow}>
        {value ? <span className={styles.iconPreview}>◆ {value}</span> : <span className={styles.iconEmpty}>Chưa chọn</span>}
        <button type="button" className={styles.mediaBtn} onClick={() => setOpen(!open)}>{value ? "Đổi" : "Chọn icon"}</button>
        {value && <button type="button" className={styles.smallBtn} onClick={() => onChange(null)}>✕</button>}
      </div>
      {open && (
        <div className={styles.iconDropdown}>
          <input type="text" className={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm icon..." autoFocus />
          <div className={styles.iconGrid}>
            {Object.entries(filteredGroups).map(([cat, icons]) => (
              <div key={cat}>
                <div className={styles.iconCat}>{cat}</div>
                <div className={styles.iconRow}>
                  {icons.map((name) => (
                    <button key={name} type="button" className={`${styles.iconBtn} ${value === name ? styles.iconActive : ""}`} onClick={() => handleSelect(name)} title={name}>{name.slice(0, 2)}</button>
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
  const d = data as { level: number; text: string; alignment: string; weight: string; italic: boolean; underline: boolean; color: string };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select value={String(d.level || 2)} onChange={(v) => onChange({ ...data, level: Number(v) })} options={[
          { label: "H1", value: "1" }, { label: "H2", value: "2" }, { label: "H3", value: "3" }, { label: "H4", value: "4" }, { label: "H5", value: "5" }, { label: "H6", value: "6" },
        ]} />
        <Select value={d.weight || "bold"} onChange={(v) => onChange({ ...data, weight: v })} options={WEIGHT_OPTIONS} />
      </div>
      <TextInput value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Tiêu đề..." />
      <Select value={d.alignment || "left"} onChange={(v) => onChange({ ...data, alignment: v })} options={ALIGNMENT_OPTIONS} />
      <div className={styles.inlineRow}>
        <Toggle label="In nghiêng" value={d.italic || false} onChange={(v) => onChange({ ...data, italic: v })} />
        <Toggle label="Gạch chân" value={d.underline || false} onChange={(v) => onChange({ ...data, underline: v })} />
      </div>
      <Field label="Màu chữ">
        <Select value={d.color || "inherit"} onChange={(v) => onChange({ ...data, color: v })} options={COLOR_OPTIONS} />
      </Field>
    </div>
  );
}

export function ParagraphEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; alignment: string; dropCap: boolean; fontSize: string; lineHeight: string; weight: string; color: string };
  return (
    <div className={styles.editorBody}>
      <TextArea value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Nội dung đoạn văn..." rows={4} />
      <Select value={d.alignment || "left"} onChange={(v) => onChange({ ...data, alignment: v })} options={ALIGNMENT_OPTIONS} />
      <div className={styles.inlineRow}>
        <Select value={d.fontSize || "md"} onChange={(v) => onChange({ ...data, fontSize: v })} options={FONT_SIZE_OPTIONS} />
        <Select value={d.lineHeight || "normal"} onChange={(v) => onChange({ ...data, lineHeight: v })} options={LINE_HEIGHT_OPTIONS} />
      </div>
      <div className={styles.inlineRow}>
        <Select value={d.weight || "regular"} onChange={(v) => onChange({ ...data, weight: v })} options={WEIGHT_OPTIONS} />
        <Toggle label="Drop Cap" value={d.dropCap || false} onChange={(v) => onChange({ ...data, dropCap: v })} />
      </div>
      <Field label="Màu chữ">
        <Select value={d.color || "inherit"} onChange={(v) => onChange({ ...data, color: v })} options={COLOR_OPTIONS} />
      </Field>
    </div>
  );
}

export function QuoteEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; author?: string; style: string; icon: string | null };
  return (
    <div className={styles.editorBody}>
      <Select value={d.style || "default"} onChange={(v) => onChange({ ...data, style: v })} options={[
        { label: "Mặc định", value: "default" }, { label: "Có viền", value: "bordered" }, { label: "Pull quote", value: "pull" },
      ]} />
      <TextArea value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Nội dung trích dẫn..." />
      <TextInput value={d.author || ""} onChange={(v) => onChange({ ...data, author: v })} placeholder="Tác giả (tùy chọn)" />
      <Field label="Icon">
        <IconPicker value={d.icon ?? null} onChange={(v) => onChange({ ...data, icon: v })} />
      </Field>
    </div>
  );
}

export function ListEditor({ data, onChange }: EditorProps) {
  const d = data as { style: string; items: string[] };
  const addItem = () => onChange({ ...data, items: [...d.items, ""] });
  const updateItem = (i: number, val: string) => { const items = [...d.items]; items[i] = val; onChange({ ...data, items }); };
  const removeItem = (i: number) => onChange({ ...data, items: d.items.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <Select value={d.style} onChange={(v) => onChange({ ...data, style: v })} options={[
        { label: "Danh sách không thứ tự", value: "unordered" }, { label: "Danh sách có thứ tự", value: "ordered" }, { label: "Checklist", value: "checklist" },
      ]} />
      {d.items.map((item, i) => (
        <div key={i} className={styles.listRow}><input type="text" className={styles.input} value={item} onChange={(e) => updateItem(i, e.target.value)} placeholder={`Mục ${i + 1}`} /><button type="button" className={styles.smallBtn} onClick={() => removeItem(i)}>✕</button></div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addItem}>+ Thêm mục</button>
    </div>
  );
}

export function CodeEditor({ data, onChange }: EditorProps) {
  const d = data as { code: string; language: string; showLineNumbers: boolean; theme: string; showCopyButton: boolean };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select value={d.language || "plaintext"} onChange={(v) => onChange({ ...data, language: v })} options={[
          { label: "JavaScript", value: "javascript" }, { label: "TypeScript", value: "typescript" }, { label: "Python", value: "python" },
          { label: "HTML", value: "html" }, { label: "CSS", value: "css" }, { label: "Bash", value: "bash" },
          { label: "JSON", value: "json" }, { label: "SQL", value: "sql" }, { label: "Plain Text", value: "plaintext" },
        ]} />
        <Select value={d.theme || "dark"} onChange={(v) => onChange({ ...data, theme: v })} options={[
          { label: "Tối", value: "dark" }, { label: "Sáng", value: "light" },
        ]} />
      </div>
      <TextArea value={d.code || ""} onChange={(v) => onChange({ ...data, code: v })} placeholder="Dán code vào đây..." rows={6} />
      <div className={styles.inlineRow}>
        <Toggle label="Số dòng" value={d.showLineNumbers || false} onChange={(v) => onChange({ ...data, showLineNumbers: v })} />
        <Toggle label="Nút copy" value={d.showCopyButton ?? true} onChange={(v) => onChange({ ...data, showCopyButton: v })} />
      </div>
    </div>
  );
}

export function CalloutEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; variant: string; icon: string | null; title?: string };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select value={d.variant || "info"} onChange={(v) => onChange({ ...data, variant: v })} options={[
          { label: "Thông tin", value: "info" }, { label: "Cảnh báo", value: "warning" }, { label: "Mẹo", value: "tip" }, { label: "Nguy hiểm", value: "danger" },
        ]} />
      </div>
      <TextInput value={d.title || ""} onChange={(v) => onChange({ ...data, title: v })} placeholder="Tiêu đề (tùy chọn)" />
      <TextArea value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Nội dung callout..." rows={3} />
      <Field label="Icon">
        <IconPicker value={d.icon ?? null} onChange={(v) => onChange({ ...data, icon: v })} />
      </Field>
    </div>
  );
}

// ── Media ──

export function ImageEditor({ data, onChange }: EditorProps) {
  const d = data as { mediaId: string; alt?: string; caption?: string; width: string; rounded: string; border: string; shadow: string; hoverZoom: boolean; link?: string; objectFit: string };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID"><MediaPicker value={d.mediaId || ""} onChange={(v) => onChange({ ...data, mediaId: v })} filter="image" /></Field>
      <Select value={d.width || "wide"} onChange={(v) => onChange({ ...data, width: v })} options={[
        { label: "Toàn màn hình", value: "full" }, { label: "Rộng", value: "wide" }, { label: "Thu gọn", value: "contained" }, { label: "Cùng dòng", value: "inline" },
      ]} />
      <Select value={d.rounded || "none"} onChange={(v) => onChange({ ...data, rounded: v })} options={ROUNDED_OPTIONS} />
      <Select value={d.border || "none"} onChange={(v) => onChange({ ...data, border: v })} options={[
        { label: "Không viền", value: "none" }, { label: "Mỏng (1px)", value: "thin" }, { label: "Vừa (2px)", value: "medium" }, { label: "Dày (4px)", value: "thick" },
      ]} />
      <Select value={d.shadow || "none"} onChange={(v) => onChange({ ...data, shadow: v })} options={SHADOW_OPTIONS} />
      <div className={styles.inlineRow}>
        <Toggle label="Phóng to khi hover" value={d.hoverZoom || false} onChange={(v) => onChange({ ...data, hoverZoom: v })} />
        <Select value={d.objectFit || "cover"} onChange={(v) => onChange({ ...data, objectFit: v })} options={[
          { label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" },
        ]} />
      </div>
      <TextInput value={d.alt || ""} onChange={(v) => onChange({ ...data, alt: v })} placeholder="Alt text" />
      <TextInput value={d.caption || ""} onChange={(v) => onChange({ ...data, caption: v })} placeholder="Chú thích ảnh" />
      <TextInput value={d.link || ""} onChange={(v) => onChange({ ...data, link: v })} placeholder="Link (tùy chọn)" />
    </div>
  );
}

export function VideoEditor({ data, onChange }: EditorProps) {
  const d = data as { mediaId: string; caption?: string; aspectRatio: string; rounded: string; shadow: string; autoplay: boolean; loop: boolean; showControls: boolean; thumbnail?: string };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID (YouTube)"><MediaPicker value={d.mediaId || ""} onChange={(v) => onChange({ ...data, mediaId: v })} filter="video" /></Field>
      <Select value={d.aspectRatio || "16:9"} onChange={(v) => onChange({ ...data, aspectRatio: v })} options={[
        { label: "16:9", value: "16:9" }, { label: "4:3", value: "4:3" }, { label: "9:16", value: "9:16" }, { label: "1:1", value: "1:1" },
      ]} />
      <Select value={d.rounded || "none"} onChange={(v) => onChange({ ...data, rounded: v })} options={ROUNDED_OPTIONS} />
      <Select value={d.shadow || "none"} onChange={(v) => onChange({ ...data, shadow: v })} options={SHADOW_OPTIONS} />
      <div className={styles.inlineRow}>
        <Toggle label="Autoplay" value={d.autoplay || false} onChange={(v) => onChange({ ...data, autoplay: v })} />
        <Toggle label="Loop" value={d.loop || false} onChange={(v) => onChange({ ...data, loop: v })} />
      </div>
      <Toggle label="Hiện controls" value={d.showControls ?? true} onChange={(v) => onChange({ ...data, showControls: v })} />
      <Field label="Ảnh thumbnail (tùy chọn)"><MediaPicker value={d.thumbnail || ""} onChange={(v) => onChange({ ...data, thumbnail: v })} filter="image" /></Field>
      <TextInput value={d.caption || ""} onChange={(v) => onChange({ ...data, caption: v })} placeholder="Chú thích video" />
    </div>
  );
}

export function GalleryEditor({ data, onChange }: EditorProps) {
  const d = data as { images: { mediaId: string; caption?: string }[]; columns: number; gap: string; layout: string; rounded: string; shadow: string; hoverZoom: boolean; lightbox: boolean };
  const add = () => onChange({ ...data, images: [...d.images, { mediaId: "" }] });
  const upd = (i: number, img: typeof d.images[0]) => { const images = [...d.images]; images[i] = img; onChange({ ...data, images }); };
  const del = (i: number) => onChange({ ...data, images: d.images.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select value={String(d.columns || 3)} onChange={(v) => onChange({ ...data, columns: Number(v) })} options={[{ label: "2 cột", value: "2" }, { label: "3 cột", value: "3" }, { label: "4 cột", value: "4" }]} />
        <Select value={d.gap || "md"} onChange={(v) => onChange({ ...data, gap: v })} options={[{ label: "Nhỏ", value: "sm" }, { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" }]} />
        <Select value={d.layout || "grid"} onChange={(v) => onChange({ ...data, layout: v })} options={[{ label: "Lưới", value: "grid" }, { label: "Masonry", value: "masonry" }]} />
      </div>
      <Select value={d.rounded || "none"} onChange={(v) => onChange({ ...data, rounded: v })} options={ROUNDED_OPTIONS} />
      <Select value={d.shadow || "none"} onChange={(v) => onChange({ ...data, shadow: v })} options={SHADOW_OPTIONS} />
      <div className={styles.inlineRow}>
        <Toggle label="Hover zoom" value={d.hoverZoom || false} onChange={(v) => onChange({ ...data, hoverZoom: v })} />
        <Toggle label="Lightbox" value={d.lightbox ?? true} onChange={(v) => onChange({ ...data, lightbox: v })} />
      </div>
      {d.images.map((img, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Ảnh ${i + 1}`}><MediaPicker value={img.mediaId} onChange={(v) => upd(i, { ...img, mediaId: v })} filter="image" /></Field>
          <TextInput value={img.caption || ""} onChange={(v) => upd(i, { ...img, caption: v })} placeholder="Chú thích" />
          <button type="button" className={styles.smallBtn} onClick={() => del(i)}>✕ Xóa</button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>+ Thêm ảnh</button>
    </div>
  );
}

export function CarouselEditor({ data, onChange }: EditorProps) {
  const d = data as { slides: { mediaId: string; caption?: string }[]; autoplay: boolean; interval: number; showDots: boolean; showArrows: boolean; transition: string; rounded: string; shadow: string; aspectRatio: string; loop: boolean; pauseOnHover: boolean; slidesPerView: number };
  const add = () => onChange({ ...data, slides: [...d.slides, { mediaId: "" }] });
  const upd = (i: number, s: typeof d.slides[0]) => { const slides = [...d.slides]; slides[i] = s; onChange({ ...data, slides }); };
  const del = (i: number) => onChange({ ...data, slides: d.slides.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Toggle label="Tự động" value={d.autoplay || false} onChange={(v) => onChange({ ...data, autoplay: v })} />
        <Toggle label="Loop" value={d.loop ?? true} onChange={(v) => onChange({ ...data, loop: v })} />
      </div>
      {d.autoplay && <Field label="Interval (ms)"><NumberInput value={d.interval || 5000} onChange={(v) => onChange({ ...data, interval: v })} min={1000} /></Field>}
      <Select value={d.transition || "slide"} onChange={(v) => onChange({ ...data, transition: v })} options={[
        { label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }, { label: "Cube", value: "cube" },
      ]} />
      <Select value={d.slidesPerView != null ? String(d.slidesPerView) : "1"} onChange={(v) => onChange({ ...data, slidesPerView: Number(v) })} options={[
        { label: "1 slide", value: "1" }, { label: "2 slides", value: "2" }, { label: "3 slides", value: "3" },
      ]} />
      <Select value={d.aspectRatio || "16:9"} onChange={(v) => onChange({ ...data, aspectRatio: v })} options={[
        { label: "16:9", value: "16:9" }, { label: "4:3", value: "4:3" }, { label: "1:1", value: "1:1" }, { label: "Tự động", value: "auto" },
      ]} />
      <Select value={d.rounded || "none"} onChange={(v) => onChange({ ...data, rounded: v })} options={ROUNDED_OPTIONS} />
      <Select value={d.shadow || "none"} onChange={(v) => onChange({ ...data, shadow: v })} options={SHADOW_OPTIONS} />
      <div className={styles.inlineRow}>
        <Toggle label="Dots" value={d.showDots ?? true} onChange={(v) => onChange({ ...data, showDots: v })} />
        <Toggle label="Mũi tên" value={d.showArrows ?? true} onChange={(v) => onChange({ ...data, showArrows: v })} />
        <Toggle label="Dừng khi hover" value={d.pauseOnHover ?? true} onChange={(v) => onChange({ ...data, pauseOnHover: v })} />
      </div>
      {d.slides.map((s, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Slide ${i + 1}`}><MediaPicker value={s.mediaId} onChange={(v) => upd(i, { ...s, mediaId: v })} filter="image" /></Field>
          <TextInput value={s.caption || ""} onChange={(v) => upd(i, { ...s, caption: v })} placeholder="Chú thích" />
          <button type="button" className={styles.smallBtn} onClick={() => del(i)}>✕ Xóa</button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>+ Thêm slide</button>
    </div>
  );
}

export function BeforeAfterEditor({ data, onChange }: EditorProps) {
  const d = data as { beforeMediaId: string; afterMediaId: string; beforeLabel: string; afterLabel: string; caption?: string; orientation: string; rounded: string; shadow: string };
  return (
    <div className={styles.editorBody}>
      <Field label="Ảnh Before"><MediaPicker value={d.beforeMediaId || ""} onChange={(v) => onChange({ ...data, beforeMediaId: v })} filter="image" /></Field>
      <Field label="Ảnh After"><MediaPicker value={d.afterMediaId || ""} onChange={(v) => onChange({ ...data, afterMediaId: v })} filter="image" /></Field>
      <Select value={d.orientation || "horizontal"} onChange={(v) => onChange({ ...data, orientation: v })} options={[
        { label: "Ngang", value: "horizontal" }, { label: "Dọc", value: "vertical" },
      ]} />
      <Select value={d.rounded || "none"} onChange={(v) => onChange({ ...data, rounded: v })} options={ROUNDED_OPTIONS} />
      <Select value={d.shadow || "none"} onChange={(v) => onChange({ ...data, shadow: v })} options={SHADOW_OPTIONS} />
      <div className={styles.inlineRow}>
        <TextInput value={d.beforeLabel || ""} onChange={(v) => onChange({ ...data, beforeLabel: v })} placeholder="Nhãn Before" />
        <TextInput value={d.afterLabel || ""} onChange={(v) => onChange({ ...data, afterLabel: v })} placeholder="Nhãn After" />
      </div>
      <TextInput value={d.caption || ""} onChange={(v) => onChange({ ...data, caption: v })} placeholder="Chú thích" />
    </div>
  );
}

// ── Layout ──

export function DividerEditor({ data, onChange }: EditorProps) {
  const d = data as { style: string };
  return (
    <div className={styles.editorBody}>
      <Select value={d.style || "solid"} onChange={(v) => onChange({ ...data, style: v })} options={[
        { label: "Nét liền", value: "solid" }, { label: "Nét đứt", value: "dashed" }, { label: "Chấm chấm", value: "dotted" }, { label: "Gradient", value: "gradient" },
      ]} />
    </div>
  );
}

export function SpacerEditor({ data, onChange }: EditorProps) {
  const d = data as { height: number };
  return (
    <div className={styles.editorBody}>
      <Field label="Chiều cao (px)"><NumberInput value={d.height ?? 40} onChange={(v) => onChange({ ...data, height: Math.min(200, Math.max(8, v)) })} min={8} max={200} /></Field>
    </div>
  );
}

export function ColumnsEditor({ data, onChange }: EditorProps) {
  const d = data as { columns: number; content: any[][]; gap: string; columnRatios: string };
  const updateColContent = (i: number, blocks: any[]) => {
    const content = [...d.content];
    content[i] = blocks;
    onChange({ ...data, content });
  };
  return (
    <div className={styles.editorBody}>
      <Select value={String(d.columns || 2)} onChange={(v) => {
        const n = Number(v);
        const content = Array.from({ length: n }, (_, i) => d.content[i] || []);
        onChange({ ...data, columns: n, content });
      }} options={[{ label: "2 cột", value: "2" }, { label: "3 cột", value: "3" }, { label: "4 cột", value: "4" }]} />
      <Select value={d.gap || "md"} onChange={(v) => onChange({ ...data, gap: v })} options={[{ label: "Nhỏ", value: "sm" }, { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" }]} />
      <Select value={d.columnRatios || "auto"} onChange={(v) => onChange({ ...data, columnRatios: v })} options={[
        { label: "Tự động", value: "auto" }, { label: "50-50", value: "50-50" }, { label: "33-33-33", value: "33-33-33" },
        { label: "25-75", value: "25-75" }, { label: "75-25", value: "75-25" }, { label: "33-67", value: "33-67" }, { label: "67-33", value: "67-33" },
      ]} />
      <div className={styles.nestedZones}>
        {Array.from({ length: d.columns || 2 }, (_, i) => (
          <div key={i} className={styles.nestedZone}>
            <div className={styles.nestedZoneLabel}>Cột {i + 1}</div>
            <NestedBlockList blocks={d.content?.[i] || []} onChange={(b) => updateColContent(i, b)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabsEditor({ data, onChange }: EditorProps) {
  const d = data as { tabs: { label: string; content: any[] }[]; tabStyle: string; defaultTab: number };
  const addTab = () => onChange({ ...data, tabs: [...d.tabs, { label: "", content: [] }] });
  const updTab = (i: number, tab: typeof d.tabs[0]) => { const tabs = [...d.tabs]; tabs[i] = tab; onChange({ ...data, tabs }); };
  const delTab = (i: number) => onChange({ ...data, tabs: d.tabs.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <Select value={d.tabStyle || "top"} onChange={(v) => onChange({ ...data, tabStyle: v })} options={[
        { label: "Top", value: "top" }, { label: "Pills", value: "pills" }, { label: "Dọc", value: "vertical" },
      ]} />
      <Field label="Tab mặc định"><NumberInput value={d.defaultTab ?? 0} onChange={(v) => onChange({ ...data, defaultTab: v })} min={0} /></Field>
      {d.tabs.map((tab, i) => (
        <div key={i} className={styles.nestedZone}>
          <div className={styles.nestedHeader}>
            <TextInput value={tab.label} onChange={(v) => updTab(i, { ...tab, label: v })} placeholder={`Tab ${i + 1}`} />
            <button type="button" className={styles.smallBtn} onClick={() => delTab(i)}>✕</button>
          </div>
          <NestedBlockList blocks={tab.content || []} onChange={(b) => updTab(i, { ...tab, content: b })} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addTab}>+ Thêm tab</button>
    </div>
  );
}

// ── Interactive ──

export function AccordionEditor({ data, onChange }: EditorProps) {
  const d = data as { items: { title: string; content: any[] }[]; allowMultiple: boolean; iconPosition: string; defaultOpenIndex: number; borderStyle: string };
  const add = () => onChange({ ...data, items: [...d.items, { title: "", content: [] }] });
  const upd = (i: number, item: typeof d.items[0]) => { const items = [...d.items]; items[i] = item; onChange({ ...data, items }); };
  const del = (i: number) => onChange({ ...data, items: d.items.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <Toggle label="Cho phép mở nhiều item" value={d.allowMultiple ?? true} onChange={(v) => onChange({ ...data, allowMultiple: v })} />
      <div className={styles.inlineRow}>
        <Select value={d.iconPosition || "right"} onChange={(v) => onChange({ ...data, iconPosition: v })} options={[{ label: "Trái", value: "left" }, { label: "Phải", value: "right" }]} />
        <Select value={d.borderStyle || "bordered"} onChange={(v) => onChange({ ...data, borderStyle: v })} options={[{ label: "Có viền", value: "bordered" }, { label: "Không viền", value: "borderless" }]} />
      </div>
      <Field label="Mở mặc định (index)"><NumberInput value={d.defaultOpenIndex ?? -1} onChange={(v) => onChange({ ...data, defaultOpenIndex: v })} min={-1} /></Field>
      {d.items.map((item, i) => (
        <div key={i} className={styles.nestedZone}>
          <div className={styles.nestedHeader}>
            <TextInput value={item.title} onChange={(v) => upd(i, { ...item, title: v })} placeholder={`Item ${i + 1}`} />
            <button type="button" className={styles.smallBtn} onClick={() => del(i)}>✕</button>
          </div>
          <NestedBlockList blocks={item.content || []} onChange={(b) => upd(i, { ...item, content: b })} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>+ Thêm item</button>
    </div>
  );
}

export function CollapseEditor({ data, onChange }: EditorProps) {
  const d = data as { title: string; content: any[]; defaultOpen: boolean; iconPosition: string };
  return (
    <div className={styles.editorBody}>
      <TextInput value={d.title || ""} onChange={(v) => onChange({ ...data, title: v })} placeholder="Tiêu đề thu gọn" />
      <div className={styles.inlineRow}>
        <Toggle label="Mở mặc định" value={d.defaultOpen || false} onChange={(v) => onChange({ ...data, defaultOpen: v })} />
        <Select value={d.iconPosition || "right"} onChange={(v) => onChange({ ...data, iconPosition: v })} options={[{ label: "Trái", value: "left" }, { label: "Phải", value: "right" }]} />
      </div>
      <NestedBlockList blocks={d.content || []} onChange={(b) => onChange({ ...data, content: b })} />
    </div>
  );
}

export function TimelineEditor({ data, onChange }: EditorProps) {
  const d = data as { events: { date: string; title: string; description: string }[]; layout: string; iconPerEvent: string | null; lineColor: string };
  const add = () => onChange({ ...data, events: [...d.events, { date: "", title: "", description: "" }] });
  const upd = (i: number, ev: typeof d.events[0]) => { const events = [...d.events]; events[i] = ev; onChange({ ...data, events }); };
  const del = (i: number) => onChange({ ...data, events: d.events.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <Select value={d.layout || "vertical"} onChange={(v) => onChange({ ...data, layout: v })} options={[
        { label: "Dọc", value: "vertical" }, { label: "Ngang", value: "horizontal" }, { label: "Xen kẽ", value: "alternating" },
      ]} />
      <Field label="Màu đường timeline"><Select value={d.lineColor || "--color-border"} onChange={(v) => onChange({ ...data, lineColor: v })} options={[
        { label: "Border", value: "--color-border" }, { label: "Primary", value: "--color-primary" }, { label: "Accent", value: "--color-accent" },
      ]} /></Field>
      <Field label="Icon mỗi sự kiện"><IconPicker value={d.iconPerEvent ?? null} onChange={(v) => onChange({ ...data, iconPerEvent: v })} /></Field>
      {d.events.map((ev, i) => (
        <div key={i} className={styles.nestedBlock}>
          <div className={styles.pricingHeader}><span>Sự kiện {i + 1}</span><button type="button" className={styles.smallBtn} onClick={() => del(i)}>✕</button></div>
          <TextInput value={ev.date} onChange={(v) => upd(i, { ...ev, date: v })} placeholder="Ngày (vd: 2024)" />
          <TextInput value={ev.title} onChange={(v) => upd(i, { ...ev, title: v })} placeholder="Tiêu đề" />
          <TextArea value={ev.description} onChange={(v) => upd(i, { ...ev, description: v })} placeholder="Mô tả" rows={2} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={add}>+ Thêm sự kiện</button>
    </div>
  );
}

export function TableEditor({ data, onChange }: EditorProps) {
  const d = data as { headers: string[]; rows: string[][]; striped: boolean; compact: boolean };
  const updHdr = (i: number, v: string) => { const headers = [...d.headers]; headers[i] = v; onChange({ ...data, headers }); };
  const addCol = () => onChange({ ...data, headers: [...d.headers, `Cột ${d.headers.length + 1}`], rows: d.rows.map((r) => [...r, ""]) });
  const delCol = (ci: number) => onChange({ ...data, headers: d.headers.filter((_, i) => i !== ci), rows: d.rows.map((r) => r.filter((_, i) => i !== ci)) });
  const addRow = () => onChange({ ...data, rows: [...d.rows, d.headers.map(() => "")] });
  const updCell = (ri: number, ci: number, v: string) => { const rows = [...d.rows]; rows[ri] = [...rows[ri]]; rows[ri][ci] = v; onChange({ ...data, rows }); };
  const delRow = (ri: number) => onChange({ ...data, rows: d.rows.filter((_, i) => i !== ri) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Toggle label="Sọc xen kẽ" value={d.striped ?? true} onChange={(v) => onChange({ ...data, striped: v })} />
        <Toggle label="Thu gọn" value={d.compact || false} onChange={(v) => onChange({ ...data, compact: v })} />
      </div>
      <div className={styles.tableHeaders}>{d.headers.map((h, i) => (
        <div key={i} className={styles.tableHeaderCell}><input type="text" className={styles.input} value={h} onChange={(e) => updHdr(i, e.target.value)} placeholder={`Cột ${i + 1}`} /><button type="button" className={styles.smallBtn} onClick={() => delCol(i)}>✕</button></div>
      ))}<button type="button" className={styles.addBtn} onClick={addCol}>+ Cột</button></div>
      {d.rows.map((row, ri) => (
        <div key={ri} className={styles.tableRow}>{row.map((cell, ci) => (
          <input key={ci} type="text" className={styles.input} value={cell} onChange={(e) => updCell(ri, ci, e.target.value)} placeholder={`Ô ${ri + 1},${ci + 1}`} />
        ))}<button type="button" className={styles.smallBtn} onClick={() => delRow(ri)}>✕</button></div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addRow}>+ Dòng</button>
    </div>
  );
}

// ── Conversion ──

export function CTABlockEditor({ data, onChange }: EditorProps) {
  const d = data as { heading: string; text?: string; buttonText: string; buttonUrl: string; style: string; backgroundMediaId?: string; buttonStyle: string; buttonSize: string; buttonIcon: string | null };
  return (
    <div className={styles.editorBody}>
      <Select value={d.style || "primary"} onChange={(v) => onChange({ ...data, style: v })} options={[
        { label: "Chính", value: "primary" }, { label: "Phụ", value: "secondary" }, { label: "Tối giản", value: "minimal" },
      ]} />
      <TextInput value={d.heading || ""} onChange={(v) => onChange({ ...data, heading: v })} placeholder="Tiêu đề CTA" />
      <TextArea value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Mô tả" rows={2} />
      <div className={styles.inlineRow}>
        <TextInput value={d.buttonText || ""} onChange={(v) => onChange({ ...data, buttonText: v })} placeholder="Nút" />
        <TextInput value={d.buttonUrl || ""} onChange={(v) => onChange({ ...data, buttonUrl: v })} placeholder="URL" />
      </div>
      <Select value={d.buttonStyle || "solid"} onChange={(v) => onChange({ ...data, buttonStyle: v })} options={[
        { label: "Đặc", value: "solid" }, { label: "Viền", value: "outline" }, { label: "Ghost", value: "ghost" },
      ]} />
      <Select value={d.buttonSize || "md"} onChange={(v) => onChange({ ...data, buttonSize: v })} options={[
        { label: "Nhỏ", value: "sm" }, { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" },
      ]} />
      <Field label="Icon nút"><IconPicker value={d.buttonIcon ?? null} onChange={(v) => onChange({ ...data, buttonIcon: v })} /></Field>
      <Field label="Ảnh nền (tùy chọn)"><MediaPicker value={d.backgroundMediaId || ""} onChange={(v) => onChange({ ...data, backgroundMediaId: v })} filter="image" /></Field>
    </div>
  );
}

export function PricingTableEditor({ data, onChange }: EditorProps) {
  const d = data as { plans: { name: string; price: string; period?: string; description?: string; features: string[]; cta: { text: string; url: string }; highlighted: boolean }[]; currency: string; billingPeriod: string; layout: string };
  const addPlan = () => onChange({ ...data, plans: [...d.plans, { name: "", price: "", features: [], cta: { text: "", url: "" }, highlighted: false }] });
  const updPlan = (i: number, plan: typeof d.plans[0]) => { const plans = [...d.plans]; plans[i] = plan; onChange({ ...data, plans }); };
  const delPlan = (i: number) => onChange({ ...data, plans: d.plans.filter((_, idx) => idx !== i) });
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <TextInput value={d.currency || "VNĐ"} onChange={(v) => onChange({ ...data, currency: v })} placeholder="Tiền tệ" />
        <Select value={d.billingPeriod || "monthly"} onChange={(v) => onChange({ ...data, billingPeriod: v })} options={[{ label: "Tháng", value: "monthly" }, { label: "Năm", value: "yearly" }]} />
        <Select value={d.layout || "horizontal"} onChange={(v) => onChange({ ...data, layout: v })} options={[{ label: "Ngang", value: "horizontal" }, { label: "Dọc", value: "vertical" }]} />
      </div>
      {d.plans.map((plan, i) => (
        <div key={i} className={styles.pricingPlan}>
          <div className={styles.pricingHeader}>
            <TextInput value={plan.name} onChange={(v) => updPlan(i, { ...plan, name: v })} placeholder="Tên gói" />
            <Toggle label="Nổi bật" value={plan.highlighted} onChange={(v) => updPlan(i, { ...plan, highlighted: v })} />
            <button type="button" className={styles.smallBtn} onClick={() => delPlan(i)}>✕</button>
          </div>
          <div className={styles.inlineRow}>
            <TextInput value={plan.price} onChange={(v) => updPlan(i, { ...plan, price: v })} placeholder="Giá" />
            <TextInput value={plan.period || ""} onChange={(v) => updPlan(i, { ...plan, period: v })} placeholder="Chu kỳ" />
          </div>
          <TextArea value={plan.description || ""} onChange={(v) => updPlan(i, { ...plan, description: v })} placeholder="Mô tả" rows={2} />
          <Field label="Tính năng">
            {plan.features.map((f, fi) => (
              <div key={fi} className={styles.listRow}>
                <TextInput value={f} onChange={(v) => { const feats = [...plan.features]; feats[fi] = v; updPlan(i, { ...plan, features: feats }); }} placeholder={`Tính năng ${fi + 1}`} />
                <button type="button" className={styles.smallBtn} onClick={() => updPlan(i, { ...plan, features: plan.features.filter((_, idx) => idx !== fi) })}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => updPlan(i, { ...plan, features: [...plan.features, ""] })}>+ Thêm tính năng</button>
          </Field>
          <div className={styles.inlineRow}>
            <TextInput value={plan.cta.text} onChange={(v) => updPlan(i, { ...plan, cta: { ...plan.cta, text: v } })} placeholder="Nút" />
            <TextInput value={plan.cta.url} onChange={(v) => updPlan(i, { ...plan, cta: { ...plan.cta, url: v } })} placeholder="URL" />
          </div>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addPlan}>+ Thêm gói</button>
    </div>
  );
}

export function TestimonialEditor({ data, onChange }: EditorProps) {
  const d = data as { testimonialId: string; style: string; showAvatar: boolean; showRating: boolean; avatarSize: string; background: string };
  return (
    <div className={styles.editorBody}>
      <Select value={d.style || "card"} onChange={(v) => onChange({ ...data, style: v })} options={[
        { label: "Card", value: "card" }, { label: "Inline", value: "inline" }, { label: "Large", value: "large" },
      ]} />
      <Field label="Testimonial ID"><TextInput value={d.testimonialId || ""} onChange={(v) => onChange({ ...data, testimonialId: v })} placeholder="ID của testimonial" /></Field>
      <div className={styles.inlineRow}>
        <Toggle label="Hiện avatar" value={d.showAvatar ?? true} onChange={(v) => onChange({ ...data, showAvatar: v })} />
        <Toggle label="Hiện sao" value={d.showRating ?? true} onChange={(v) => onChange({ ...data, showRating: v })} />
      </div>
      <Select value={d.avatarSize || "md"} onChange={(v) => onChange({ ...data, avatarSize: v })} options={[
        { label: "Nhỏ", value: "sm" }, { label: "Vừa", value: "md" }, { label: "Lớn", value: "lg" },
      ]} />
      <Select value={d.background || "none"} onChange={(v) => onChange({ ...data, background: v })} options={[
        { label: "Không nền", value: "none" }, { label: "Sáng", value: "light" }, { label: "Tối", value: "dark" }, { label: "Gradient", value: "gradient" },
      ]} />
    </div>
  );
}

// ═══════════════════════════════════
//  NESTED BLOCK LIST (for columns/tabs/accordion/collapse)
// ═══════════════════════════════════

const BLOCK_LABELS: Record<string, string> = {
  heading: "Tiêu đề", paragraph: "Đoạn văn", quote: "Trích dẫn", list: "Danh sách",
  code: "Code", callout: "Callout", image: "Ảnh", video: "Video",
  gallery: "Gallery", carousel: "Carousel", beforeAfter: "Trước/Sau",
  divider: "Phân cách", spacer: "Khoảng trống", columns: "Cột", tabs: "Tabs",
  accordion: "Accordion", collapse: "Thu gọn", timeline: "Timeline",
  table: "Bảng", cta: "CTA", pricingTable: "Bảng giá", testimonial: "Đánh giá",
};

function NestedBlockList({ blocks, onChange }: { blocks: any[]; onChange: (blocks: any[]) => void }) {
  const add = useCallback((type: string) => {
    const defaultData = getDefaultDataNested(type);
    onChange([...blocks, { id: crypto.randomUUID(), type, data: defaultData }]);
  }, [blocks, onChange]);

  const remove = useCallback((idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
  }, [blocks, onChange]);

  return (
    <div className={styles.nestedBlockList}>
      {blocks.map((b, i) => (
        <div key={b.id || i} className={styles.nestedBlockItem}>
          <span className={styles.nestedBlockType}>{BLOCK_LABELS[b.type] || b.type}</span>
          <button type="button" className={styles.smallBtn} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <AddBlockMenu onSelect={add} />
    </div>
  );
}

function AddBlockMenu({ onSelect }: { onSelect: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const groups: Record<string, { label: string; value: string }[]> = {
    "Văn bản": [{ label: "Tiêu đề", value: "heading" }, { label: "Đoạn văn", value: "paragraph" }, { label: "Trích dẫn", value: "quote" }, { label: "Danh sách", value: "list" }, { label: "Code", value: "code" }, { label: "Callout", value: "callout" }],
    "Media": [{ label: "Ảnh", value: "image" }, { label: "Video", value: "video" }],
    "Bố cục": [{ label: "Phân cách", value: "divider" }, { label: "Khoảng trống", value: "spacer" }],
    "Chuyển đổi": [{ label: "CTA", value: "cta" }],
  };

  return (
    <div className={styles.addBlockMenu}>
      {!open ? (
        <button type="button" className={styles.addBtn} onClick={() => setOpen(true)}>+ Thêm block</button>
      ) : (
        <div className={styles.addMenuDropdown}>
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <div className={styles.addMenuCat}>{cat}</div>
              {items.map((item) => (
                <button key={item.value} type="button" className={styles.addMenuItem} onClick={() => { onSelect(item.value); setOpen(false); }}>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <button type="button" className={styles.addMenuClose} onClick={() => setOpen(false)}>Đóng</button>
        </div>
      )}
    </div>
  );
}

function getDefaultDataNested(type: string): Record<string, unknown> {
  // Simplified defaults — nested blocks don't support further nesting
  switch (type) {
    case "heading": return { level: 2, text: "", alignment: "left", weight: "bold", italic: false, underline: false, color: "inherit" };
    case "paragraph": return { text: "", alignment: "left", dropCap: false, fontSize: "md", lineHeight: "normal", weight: "regular", color: "inherit" };
    case "quote": return { text: "", style: "default", icon: null };
    case "list": return { style: "unordered", items: [""] };
    case "code": return { code: "", language: "plaintext", showLineNumbers: false, theme: "dark", showCopyButton: true };
    case "callout": return { text: "", variant: "info", icon: null, title: "" };
    case "image": return { mediaId: "", width: "wide", rounded: "none", border: "none", shadow: "none", hoverZoom: false, link: "", objectFit: "cover" };
    case "video": return { mediaId: "", aspectRatio: "16:9", rounded: "none", shadow: "none", autoplay: false, loop: false, showControls: true, thumbnail: "" };
    case "divider": return { style: "solid" };
    case "spacer": return { height: 40 };
    case "cta": return { heading: "", buttonText: "", buttonUrl: "", style: "primary", buttonStyle: "solid", buttonSize: "md", buttonIcon: null };
    default: return {};
  }
}
