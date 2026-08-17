"use client";

import { useCallback, useRef } from "react";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function RichTextForm({ config, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const wrapSelection = (tag: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);
    const replacement = `<${tag}>${selected}</${tag}>`;
    const newValue =
      text.substring(0, start) + replacement + text.substring(end);
    update("content_html", newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  const insertHeading = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end) || "Tiêu đề";
    const replacement = `<h2>${selected}</h2>`;
    const newValue =
      text.substring(0, start) + replacement + text.substring(end);
    update("content_html", newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  const insertParagraph = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end) || "Nội dung";
    const replacement = `<p>${selected}</p>`;
    const newValue =
      text.substring(0, start) + replacement + text.substring(end);
    update("content_html", newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Về khóa học"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>
          Content (HTML) - Hỗ trợ thẻ HTML: &lt;p&gt;, &lt;h2&gt;,
          &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;ul&gt;, &lt;li&gt;...
        </label>
        <div className={s.toolbar}>
          <button
            type="button"
            className={s.toolbarBtn}
            onClick={() => wrapSelection("strong")}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={s.toolbarBtn}
            onClick={() => wrapSelection("em")}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={s.toolbarBtn}
            onClick={insertHeading}
            title="Heading"
          >
            H2
          </button>
          <button
            type="button"
            className={s.toolbarBtn}
            onClick={insertParagraph}
            title="Paragraph"
          >
            P
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className={s.textarea}
          style={{ minHeight: "300px" }}
          value={(config.content_html as string) ?? ""}
          onChange={(e) => update("content_html", e.target.value)}
          placeholder={`<p>Nội dung HTML ở đây...</p>\n<h2>Tiêu đề phụ</h2>\n<p><strong>In đậm</strong> hoặc <em>in nghiêng</em></p>`}
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Background</label>
        <select
          className={s.select}
          value={(config.background as string) ?? "white"}
          onChange={(e) => update("background", e.target.value)}
        >
          <option value="white">White</option>
          <option value="soft">Soft</option>
        </select>
      </div>
    </div>
  );
}
