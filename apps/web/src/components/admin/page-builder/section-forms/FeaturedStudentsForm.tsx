"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Stat {
  label: string;
  value: string;
}

interface Student {
  name: string;
  role?: string;
  avatar_url: string;
  stats: Stat[];
  description: string;
}

interface CarouselImage {
  image_url: string;
}

export function FeaturedStudentsForm({ config, onChange }: Props) {
  const students = (config.students as Student[]) ?? [];
  const carouselImages = (config.carousel_images as CarouselImage[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addStudent = () => {
    update("students", [
      ...students,
      { name: "", role: "", avatar_url: "", stats: [], description: "" },
    ]);
  };

  const removeStudent = (index: number) => {
    update(
      "students",
      students.filter((_, i) => i !== index),
    );
  };

  const updateStudent = (index: number, field: string, value: unknown) => {
    const next = students.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    update("students", next);
  };

  const addStat = (studentIndex: number) => {
    const next = students.map((s, i) =>
      i === studentIndex
        ? { ...s, stats: [...s.stats, { label: "", value: "" }] }
        : s,
    );
    update("students", next);
  };

  const removeStat = (studentIndex: number, statIndex: number) => {
    const next = students.map((s, i) =>
      i === studentIndex
        ? { ...s, stats: s.stats.filter((_, j) => j !== statIndex) }
        : s,
    );
    update("students", next);
  };

  const updateStat = (
    studentIndex: number,
    statIndex: number,
    field: string,
    value: string,
  ) => {
    const next = students.map((s, i) =>
      i === studentIndex
        ? {
            ...s,
            stats: s.stats.map((st, j) =>
              j === statIndex ? { ...st, [field]: value } : st,
            ),
          }
        : s,
    );
    update("students", next);
  };

  const addCarouselImage = () => {
    update("carousel_images", [...carouselImages, { image_url: "" }]);
  };

  const removeCarouselImage = (index: number) => {
    update(
      "carousel_images",
      carouselImages.filter((_, i) => i !== index),
    );
  };

  const updateCarouselImage = (index: number, url: string) => {
    const next = carouselImages.map((img, i) =>
      i === index ? { image_url: url } : img,
    );
    update("carousel_images", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Section title</label>
        <input
          className={s.input}
          value={(config.section_title as string) ?? ""}
          onChange={(e) => update("section_title", e.target.value)}
          placeholder="VD: Học viên nổi bật"
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
          <label className={s.label}>Students</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addStudent}
          >
            Thêm
          </button>
        </div>
        {students.map((student, si) => (
          <div key={si} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <div className={s.field}>
                <label className={s.label}>Name</label>
                <input
                  className={s.input}
                  value={student.name ?? ""}
                  onChange={(e) => updateStudent(si, "name", e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Role</label>
                <input
                  className={s.input}
                  value={student.role ?? ""}
                  onChange={(e) => updateStudent(si, "role", e.target.value)}
                  placeholder="VD: Designer"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Avatar URL</label>
                <MediaTrigger
                  value={student.avatar_url ?? ""}
                  onSelect={(url) => updateStudent(si, "avatar_url", url)}
                  showPreview
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Description</label>
                <textarea
                  className={s.textarea}
                  value={student.description ?? ""}
                  onChange={(e) =>
                    updateStudent(si, "description", e.target.value)
                  }
                  placeholder="VD: Học viên xuất sắc..."
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
                  <label className={s.label}>Stats</label>
                  <button
                    type="button"
                    className={s.btnSmall}
                    onClick={() => addStat(si)}
                  >
                    Thêm stat
                  </button>
                </div>
                {student.stats.map((stat, sti) => (
                  <div key={sti} className={s.arrayItem}>
                    <div className={s.arrayItemContent}>
                      <input
                        className={s.input}
                        value={stat.label ?? ""}
                        onChange={(e) =>
                          updateStat(si, sti, "label", e.target.value)
                        }
                        placeholder="VD: Thu nhập"
                      />
                      <input
                        className={s.input}
                        value={stat.value ?? ""}
                        onChange={(e) =>
                          updateStat(si, sti, "value", e.target.value)
                        }
                        placeholder="VD: 30M/tháng"
                      />
                    </div>
                    <button
                      type="button"
                      className={s.btnDangerSmall}
                      onClick={() => removeStat(si, sti)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeStudent(si)}
            >
              Xóa
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có học viên nào
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label}>Carousel title</label>
        <input
          className={s.input}
          value={(config.carousel_title as string) ?? ""}
          onChange={(e) => update("carousel_title", e.target.value)}
          placeholder="VD: Hình ảnh nổi bật"
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
          <label className={s.label}>Carousel images</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addCarouselImage}
          >
            Thêm
          </button>
        </div>
        {carouselImages.map((img, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <MediaTrigger
                value={img.image_url}
                onSelect={(url) => updateCarouselImage(i, url)}
                showPreview
              />
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeCarouselImage(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {carouselImages.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có ảnh nào
          </p>
        )}
      </div>
    </div>
  );
}
