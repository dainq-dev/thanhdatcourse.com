"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Chapter {
  title: string;
  lessons: string[];
}

export function LessonAccordionForm({ config, onChange }: Props) {
  const chapters = (config.chapters as Chapter[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addChapter = () => {
    update("chapters", [...chapters, { title: "", lessons: [] }]);
  };

  const removeChapter = (index: number) => {
    update(
      "chapters",
      chapters.filter((_, i) => i !== index),
    );
  };

  const updateChapter = (index: number, field: string, value: unknown) => {
    const next = chapters.map((ch, i) =>
      i === index ? { ...ch, [field]: value } : ch,
    );
    update("chapters", next);
  };

  const addLesson = (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    const next = chapters.map((ch, i) =>
      i === chapterIndex ? { ...ch, lessons: [...ch.lessons, ""] } : ch,
    );
    update("chapters", next);
  };

  const removeLesson = (chapterIndex: number, lessonIndex: number) => {
    const next = chapters.map((ch, i) =>
      i === chapterIndex
        ? { ...ch, lessons: ch.lessons.filter((_, j) => j !== lessonIndex) }
        : ch,
    );
    update("chapters", next);
  };

  const updateLesson = (
    chapterIndex: number,
    lessonIndex: number,
    value: string,
  ) => {
    const next = chapters.map((ch, i) =>
      i === chapterIndex
        ? {
            ...ch,
            lessons: ch.lessons.map((l, j) => (j === lessonIndex ? value : l)),
          }
        : ch,
    );
    update("chapters", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Section title</label>
        <input
          className={s.input}
          value={(config.section_title as string) ?? ""}
          onChange={(e) => update("section_title", e.target.value)}
          placeholder="VD: Nội dung khóa học"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Side image URL</label>
        <MediaTrigger
          value={(config.side_image_url as string) ?? ""}
          onSelect={(url) => update("side_image_url", url)}
          showPreview
        />
      </div>

      <div className={s.arrayField}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label className={s.label}>Chapters</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addChapter}
          >
            Thêm chapter
          </button>
        </div>
        {chapters.map((chapter, ci) => (
          <div key={ci} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <div className={s.field}>
                <label className={s.label}>Chapter title</label>
                <input
                  className={s.input}
                  value={chapter.title ?? ""}
                  onChange={(e) => updateChapter(ci, "title", e.target.value)}
                  placeholder="VD: Chương 1: Cơ bản"
                />
              </div>
              <div className={s.arrayField}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label className={s.label}>Lessons</label>
                  <button
                    type="button"
                    className={s.btnSmall}
                    onClick={() => addLesson(ci)}
                  >
                    Thêm bài học
                  </button>
                </div>
                {chapter.lessons.map((lesson, li) => (
                  <div key={li} className={s.arrayItem}>
                    <div className={s.arrayItemContent}>
                      <input
                        className={s.input}
                        value={lesson}
                        onChange={(e) => updateLesson(ci, li, e.target.value)}
                        placeholder={`Bài ${li + 1}: Tên bài học`}
                      />
                    </div>
                    <button
                      type="button"
                      className={s.btnDangerSmall}
                      onClick={() => removeLesson(ci, li)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {chapter.lessons.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--admin-text-disabled)",
                      margin: "0.25rem 0",
                    }}
                  >
                    Chưa có bài học nào
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeChapter(ci)}
            >
              Xóa
            </button>
          </div>
        ))}
        {chapters.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có chapter nào
          </p>
        )}
      </div>
    </div>
  );
}
