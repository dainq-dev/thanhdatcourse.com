"use client";

import type { Block } from "@workspace/types";
import styles from "./block-editors.module.scss";

interface EditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

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
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Media ID"
      />
      <button
        type="button"
        className={styles.mediaBtn}
        onClick={() => setOpen(true)}
      >
        Chọn
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

import { useState } from "react";
import { MediaManager } from "@/components/admin/media-manager";

export function HeadingEditor({ data, onChange }: EditorProps) {
  const d = data as { level: number; text: string; alignment: string };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select
          value={String(d.level || 2)}
          onChange={(v) => onChange({ ...data, level: Number(v) })}
          options={[
            { label: "H1", value: "1" }, { label: "H2", value: "2" }, { label: "H3", value: "3" },
            { label: "H4", value: "4" }, { label: "H5", value: "5" }, { label: "H6", value: "6" },
          ]}
        />
        <Select
          value={d.alignment || "left"}
          onChange={(v) => onChange({ ...data, alignment: v })}
          options={[{ label: "Trái", value: "left" }, { label: "Giữa", value: "center" }, { label: "Phải", value: "right" }]}
        />
      </div>
      <TextInput value={d.text || ""} onChange={(v) => onChange({ ...data, text: v })} placeholder="Tiêu đề..." />
    </div>
  );
}

export function ParagraphEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; alignment: string; dropCap: boolean };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select
          value={d.alignment || "left"}
          onChange={(v) => onChange({ ...data, alignment: v })}
          options={[
            { label: "Trái", value: "left" },
            { label: "Giữa", value: "center" },
            { label: "Phải", value: "right" },
          ]}
        />
        <Toggle
          label="Drop Cap"
          value={d.dropCap}
          onChange={(v) => onChange({ ...data, dropCap: v })}
        />
      </div>
      <TextArea
        value={d.text}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Nội dung đoạn văn..."
        rows={4}
      />
    </div>
  );
}

export function QuoteEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; author?: string; style: string };
  return (
    <div className={styles.editorBody}>
      <Select
        value={d.style || "default"}
        onChange={(v) => onChange({ ...data, style: v })}
        options={[
          { label: "Mặc định", value: "default" },
          { label: "Có viền", value: "bordered" },
          { label: "Pull quote", value: "pull" },
        ]}
      />
      <TextArea
        value={d.text}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Nội dung trích dẫn..."
      />
      <TextInput
        value={d.author || ""}
        onChange={(v) => onChange({ ...data, author: v })}
        placeholder="Tác giả (tùy chọn)"
      />
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
  const removeItem = (i: number) => {
    onChange({ ...data, items: d.items.filter((_, idx) => idx !== i) });
  };

  return (
    <div className={styles.editorBody}>
      <Select
        value={d.style}
        onChange={(v) => onChange({ ...data, style: v })}
        options={[
          { label: "Danh sách không thứ tự", value: "unordered" },
          { label: "Danh sách có thứ tự", value: "ordered" },
          { label: "Checklist", value: "checklist" },
        ]}
      />
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
            ✕
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
  };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <TextInput
          value={d.language}
          onChange={(v) => onChange({ ...data, language: v })}
          placeholder="Ngôn ngữ (vd: javascript)"
        />
        <Toggle
          label="Số dòng"
          value={d.showLineNumbers}
          onChange={(v) => onChange({ ...data, showLineNumbers: v })}
        />
      </div>
      <TextArea
        value={d.code}
        onChange={(v) => onChange({ ...data, code: v })}
        placeholder="Dán code vào đây..."
        rows={6}
      />
    </div>
  );
}

export function CalloutEditor({ data, onChange }: EditorProps) {
  const d = data as { text: string; variant: string; icon?: string };
  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select
          value={d.variant || "info"}
          onChange={(v) => onChange({ ...data, variant: v })}
          options={[
            { label: "Thông tin", value: "info" },
            { label: "Cảnh báo", value: "warning" },
            { label: "Mẹo", value: "tip" },
            { label: "Nguy hiểm", value: "danger" },
          ]}
        />
        <TextInput
          value={d.icon || ""}
          onChange={(v) => onChange({ ...data, icon: v })}
          placeholder="Icon (emoji)"
        />
      </div>
      <TextArea
        value={d.text}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="Nội dung callout..."
        rows={3}
      />
    </div>
  );
}

export function ImageEditor({ data, onChange }: EditorProps) {
  const d = data as {
    mediaId: string;
    alt?: string;
    caption?: string;
    width: string;
    border: boolean;
    rounded: boolean;
  };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID">
        <MediaPicker
          value={d.mediaId}
          onChange={(v) => onChange({ ...data, mediaId: v })}
          filter="image"
        />
      </Field>
      <Select
        value={d.width || "wide"}
        onChange={(v) => onChange({ ...data, width: v })}
        options={[
          { label: "Toàn màn hình", value: "full" },
          { label: "Rộng", value: "wide" },
          { label: "Thu gọn", value: "contained" },
          { label: "Cùng dòng", value: "inline" },
        ]}
      />
      <div className={styles.inlineRow}>
        <Toggle
          label="Viền"
          value={d.border}
          onChange={(v) => onChange({ ...data, border: v })}
        />
        <Toggle
          label="Bo góc"
          value={d.rounded}
          onChange={(v) => onChange({ ...data, rounded: v })}
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
    </div>
  );
}

export function VideoEditor({ data, onChange }: EditorProps) {
  const d = data as { mediaId: string; caption?: string; aspectRatio: string };
  return (
    <div className={styles.editorBody}>
      <Field label="Media ID (YouTube)">
        <MediaPicker
          value={d.mediaId}
          onChange={(v) => onChange({ ...data, mediaId: v })}
          filter="video"
        />
      </Field>
      <Select
        value={d.aspectRatio || "16:9"}
        onChange={(v) => onChange({ ...data, aspectRatio: v })}
        options={[
          { label: "16:9", value: "16:9" },
          { label: "4:3", value: "4:3" },
          { label: "9:16", value: "9:16" },
          { label: "1:1", value: "1:1" },
        ]}
      />
      <TextInput
        value={d.caption || ""}
        onChange={(v) => onChange({ ...data, caption: v })}
        placeholder="Chú thích video"
      />
    </div>
  );
}

export function DividerEditor({ data, onChange }: EditorProps) {
  const d = data as { style: string };
  return (
    <div className={styles.editorBody}>
      <Select
        value={d.style || "solid"}
        onChange={(v) => onChange({ ...data, style: v })}
        options={[
          { label: "Nét liền", value: "solid" },
          { label: "Nét đứt", value: "dashed" },
          { label: "Chấm chấm", value: "dotted" },
          { label: "Gradient", value: "gradient" },
        ]}
      />
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

export function CTABlockEditor({ data, onChange }: EditorProps) {
  const d = data as {
    heading: string;
    text?: string;
    buttonText: string;
    buttonUrl: string;
    style: string;
    backgroundMediaId?: string;
  };
  return (
    <div className={styles.editorBody}>
      <Select
        value={d.style || "primary"}
        onChange={(v) => onChange({ ...data, style: v })}
        options={[
          { label: "Chính", value: "primary" },
          { label: "Phụ", value: "secondary" },
          { label: "Tối giản", value: "minimal" },
        ]}
      />
      <TextInput
        value={d.heading}
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
          value={d.buttonText}
          onChange={(v) => onChange({ ...data, buttonText: v })}
          placeholder="Nút"
        />
        <TextInput
          value={d.buttonUrl}
          onChange={(v) => onChange({ ...data, buttonUrl: v })}
          placeholder="URL"
        />
      </div>
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
  };
  const addPlan = () => {
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
  };
  const updatePlan = (i: number, plan: (typeof d.plans)[0]) => {
    const plans = [...d.plans];
    plans[i] = plan;
    onChange({ ...data, plans });
  };
  const removePlan = (i: number) => {
    onChange({ ...data, plans: d.plans.filter((_, idx) => idx !== i) });
  };

  return (
    <div className={styles.editorBody}>
      {d.plans.map((plan, i) => (
        <div key={i} className={styles.pricingPlan}>
          <div className={styles.pricingHeader}>
            <TextInput
              value={plan.name}
              onChange={(v) => updatePlan(i, { ...plan, name: v })}
              placeholder="Tên gói"
            />
            <Toggle
              label="Nổi bật"
              value={plan.highlighted}
              onChange={(v) => updatePlan(i, { ...plan, highlighted: v })}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => removePlan(i)}
            >
              ✕
            </button>
          </div>
          <div className={styles.inlineRow}>
            <TextInput
              value={plan.price}
              onChange={(v) => updatePlan(i, { ...plan, price: v })}
              placeholder="Giá"
            />
            <TextInput
              value={plan.period || ""}
              onChange={(v) => updatePlan(i, { ...plan, period: v })}
              placeholder="Chu kỳ"
            />
          </div>
          <TextArea
            value={plan.description || ""}
            onChange={(v) => updatePlan(i, { ...plan, description: v })}
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
                    updatePlan(i, { ...plan, features: feats });
                  }}
                  placeholder={`Tính năng ${fi + 1}`}
                />
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() =>
                    updatePlan(i, {
                      ...plan,
                      features: plan.features.filter((_, idx) => idx !== fi),
                    })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addBtn}
              onClick={() =>
                updatePlan(i, { ...plan, features: [...plan.features, ""] })
              }
            >
              + Thêm tính năng
            </button>
          </Field>
          <div className={styles.inlineRow}>
            <TextInput
              value={plan.cta.text}
              onChange={(v) =>
                updatePlan(i, { ...plan, cta: { ...plan.cta, text: v } })
              }
              placeholder="Nút"
            />
            <TextInput
              value={plan.cta.url}
              onChange={(v) =>
                updatePlan(i, { ...plan, cta: { ...plan.cta, url: v } })
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
  const d = data as { testimonialId: string; style: string };
  return (
    <div className={styles.editorBody}>
      <Select
        value={d.style || "card"}
        onChange={(v) => onChange({ ...data, style: v })}
        options={[
          { label: "Card", value: "card" },
          { label: "Inline", value: "inline" },
          { label: "Large", value: "large" },
        ]}
      />
      <Field label="Testimonial ID">
        <TextInput
          value={d.testimonialId}
          onChange={(v) => onChange({ ...data, testimonialId: v })}
          placeholder="ID của testimonial"
        />
      </Field>
    </div>
  );
}

export function TimelineEditor({ data, onChange }: EditorProps) {
  const d = data as {
    events: { date: string; title: string; description: string }[];
  };
  const addEvent = () =>
    onChange({
      ...data,
      events: [...d.events, { date: "", title: "", description: "" }],
    });
  const updateEvent = (i: number, ev: (typeof d.events)[0]) => {
    const events = [...d.events];
    events[i] = ev;
    onChange({ ...data, events });
  };
  const removeEvent = (i: number) =>
    onChange({ ...data, events: d.events.filter((_, idx) => idx !== i) });

  return (
    <div className={styles.editorBody}>
      {d.events.map((ev, i) => (
        <div key={i} className={styles.nestedBlock}>
          <div className={styles.pricingHeader}>
            <span>Sự kiện {i + 1}</span>
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => removeEvent(i)}
            >
              ✕
            </button>
          </div>
          <TextInput
            value={ev.date}
            onChange={(v) => updateEvent(i, { ...ev, date: v })}
            placeholder="Ngày (vd: 2024)"
          />
          <TextInput
            value={ev.title}
            onChange={(v) => updateEvent(i, { ...ev, title: v })}
            placeholder="Tiêu đề"
          />
          <TextArea
            value={ev.description}
            onChange={(v) => updateEvent(i, { ...ev, description: v })}
            placeholder="Mô tả"
            rows={2}
          />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addEvent}>
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
  };
  const updateHeader = (i: number, v: string) => {
    const headers = [...d.headers];
    headers[i] = v;
    onChange({ ...data, headers });
  };
  const addColumn = () => {
    onChange({
      ...data,
      headers: [...d.headers, `Cột ${d.headers.length + 1}`],
      rows: d.rows.map((r) => [...r, ""]),
    });
  };
  const removeColumn = (ci: number) => {
    onChange({
      ...data,
      headers: d.headers.filter((_, i) => i !== ci),
      rows: d.rows.map((r) => r.filter((_, i) => i !== ci)),
    });
  };
  const addRow = () => {
    onChange({ ...data, rows: [...d.rows, d.headers.map(() => "")] });
  };
  const updateCell = (ri: number, ci: number, v: string) => {
    const rows = [...d.rows];
    rows[ri] = [...rows[ri]];
    rows[ri][ci] = v;
    onChange({ ...data, rows });
  };
  const removeRow = (ri: number) => {
    onChange({ ...data, rows: d.rows.filter((_, i) => i !== ri) });
  };

  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Toggle
          label="Sọc xen kẽ"
          value={d.striped}
          onChange={(v) => onChange({ ...data, striped: v })}
        />
        <Toggle
          label="Thu gọn"
          value={d.compact}
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
              onChange={(e) => updateHeader(i, e.target.value)}
              placeholder={`Cột ${i + 1}`}
            />
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => removeColumn(i)}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addColumn}>
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
              onChange={(e) => updateCell(ri, ci, e.target.value)}
              placeholder={`Ô ${ri + 1},${ci + 1}`}
            />
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => removeRow(ri)}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addRow}>
        + Dòng
      </button>
    </div>
  );
}

export function GalleryEditor({ data, onChange }: EditorProps) {
  const d = data as {
    images: { mediaId: string; caption?: string }[];
    columns: number;
    gap: string;
    layout: string;
  };
  const addImage = () =>
    onChange({ ...data, images: [...d.images, { mediaId: "" }] });
  const updateImage = (i: number, img: (typeof d.images)[0]) => {
    const images = [...d.images];
    images[i] = img;
    onChange({ ...data, images });
  };
  const removeImage = (i: number) =>
    onChange({ ...data, images: d.images.filter((_, idx) => idx !== i) });

  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Select
          value={String(d.columns || 3)}
          onChange={(v) => onChange({ ...data, columns: Number(v) })}
          options={[
            { label: "2 cột", value: "2" },
            { label: "3 cột", value: "3" },
            { label: "4 cột", value: "4" },
          ]}
        />
        <Select
          value={d.gap || "md"}
          onChange={(v) => onChange({ ...data, gap: v })}
          options={[
            { label: "Nhỏ", value: "sm" },
            { label: "Vừa", value: "md" },
            { label: "Lớn", value: "lg" },
          ]}
        />
        <Select
          value={d.layout || "grid"}
          onChange={(v) => onChange({ ...data, layout: v })}
          options={[
            { label: "Lưới", value: "grid" },
            { label: "Masonry", value: "masonry" },
          ]}
        />
      </div>
      {d.images.map((img, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Ảnh ${i + 1}`}>
            <MediaPicker
              value={img.mediaId}
              onChange={(v) => updateImage(i, { ...img, mediaId: v })}
              filter="image"
            />
          </Field>
          <TextInput
            value={img.caption || ""}
            onChange={(v) => updateImage(i, { ...img, caption: v })}
            placeholder="Chú thích"
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => removeImage(i)}
          >
            ✕ Xóa
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addImage}>
        + Thêm ảnh
      </button>
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
  };
  const addSlide = () =>
    onChange({ ...data, slides: [...d.slides, { mediaId: "" }] });
  const updateSlide = (i: number, slide: (typeof d.slides)[0]) => {
    const slides = [...d.slides];
    slides[i] = slide;
    onChange({ ...data, slides });
  };
  const removeSlide = (i: number) =>
    onChange({ ...data, slides: d.slides.filter((_, idx) => idx !== i) });

  return (
    <div className={styles.editorBody}>
      <div className={styles.inlineRow}>
        <Toggle
          label="Tự động"
          value={d.autoplay}
          onChange={(v) => onChange({ ...data, autoplay: v })}
        />
        {d.autoplay && (
          <Field label="Interval (ms)">
            <NumberInput
              value={d.interval}
              onChange={(v) => onChange({ ...data, interval: v })}
              min={1000}
            />
          </Field>
        )}
      </div>
      <div className={styles.inlineRow}>
        <Toggle
          label="Dots"
          value={d.showDots}
          onChange={(v) => onChange({ ...data, showDots: v })}
        />
        <Toggle
          label="Mũi tên"
          value={d.showArrows}
          onChange={(v) => onChange({ ...data, showArrows: v })}
        />
      </div>
      {d.slides.map((slide, i) => (
        <div key={i} className={styles.galleryItem}>
          <Field label={`Slide ${i + 1}`}>
            <MediaPicker
              value={slide.mediaId}
              onChange={(v) => updateSlide(i, { ...slide, mediaId: v })}
              filter="image"
            />
          </Field>
          <TextInput
            value={slide.caption || ""}
            onChange={(v) => updateSlide(i, { ...slide, caption: v })}
            placeholder="Chú thích"
          />
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => removeSlide(i)}
          >
            ✕ Xóa
          </button>
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addSlide}>
        + Thêm slide
      </button>
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
  };
  return (
    <div className={styles.editorBody}>
      <Field label="Ảnh Before">
        <MediaPicker
          value={d.beforeMediaId}
          onChange={(v) => onChange({ ...data, beforeMediaId: v })}
          filter="image"
        />
      </Field>
      <Field label="Ảnh After">
        <MediaPicker
          value={d.afterMediaId}
          onChange={(v) => onChange({ ...data, afterMediaId: v })}
          filter="image"
        />
      </Field>
      <div className={styles.inlineRow}>
        <TextInput
          value={d.beforeLabel}
          onChange={(v) => onChange({ ...data, beforeLabel: v })}
          placeholder="Nhãn Before"
        />
        <TextInput
          value={d.afterLabel}
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
