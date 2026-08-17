"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageBuilder } from "@/components/admin/page-builder/PageBuilder";
import type { Section } from "@/components/admin/page-builder/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

function normalizeSections(raw: Record<string, unknown>[]): Section[] {
  return raw.map((row) => ({
    id: row.id as string,
    entity_type: (row.entityType ??
      row.entity_type ??
      "") as Section["entity_type"],
    entity_id: (row.entityId ?? row.entity_id ?? "") as string,
    section_type: (row.sectionType ??
      row.section_type ??
      "") as Section["section_type"],
    title: row.title as string | null,
    config:
      typeof row.config === "string"
        ? JSON.parse(row.config as string)
        : ((row.config as Record<string, unknown>) ?? {}),
    sort_order: (row.sortOrder ?? row.sort_order ?? 0) as number,
    is_published: Boolean(row.isPublished ?? row.is_published ?? true),
    created_at: (row.createdAt ?? row.created_at ?? "") as string,
    updated_at: (row.updatedAt ?? row.updated_at ?? "") as string,
  }));
}

export default function CourseBuildPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [slug, setSlug] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSlugAndSections = async () => {
      try {
        const pathParts = window.location.pathname.split("/");
        const courseSlug = pathParts[pathParts.length - 1];
        setSlug(courseSlug);

        const course = await api.get<{ id: string; title: string }>(
          `/api/courses/${courseSlug}`,
        );
        setCourseTitle(course.title);
        setCourseId(course.id);

        const res = await api.get<Record<string, unknown>[]>(
          `/api/course/${courseSlug}/sections`,
        );
        const raw = Array.isArray(res)
          ? res
          : ((res as unknown as { data: Record<string, unknown>[] }).data ??
            []);
        setSections(normalizeSections(raw));
      } catch {
        setError("Không thể tải sections. Vui lòng thử lại.");
      }
    };
    fetchSlugAndSections();
  }, []);

  const handleDelete = async () => {
    if (!courseId) return;
    setDeleting(true);
    try {
      await api.del(`/api/courses/${courseId}`);
      router.push("/quan-tri-vien/khoa-hoc");
    } catch {
      setError("Không thể xóa khóa học");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (error && !sections) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button
          type="button"
          className={styles.cBtn}
          onClick={() => router.push("/quan-tri-vien/khoa-hoc")}
        >
          Về danh sách
        </button>
      </div>
    );
  }

  if (!sections) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.push("/quan-tri-vien/khoa-hoc")}
              title="Về danh sách"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h1 className={styles.panelTitle}>Trang Builder</h1>
              {courseTitle && (
                <span className={styles.panelSub}>{courseTitle}</span>
              )}
            </div>
          </div>
          <div className={styles.panelBtns}>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setConfirmOpen(true)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa khóa học
            </button>
          </div>
        </div>
        {error && (
          <div className={styles.err}>
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              className={styles.errX}
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.content}>
          <PageBuilder
            entityType="course"
            entityIdentifier={slug}
            initialSections={sections}
          />
        </div>
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước</span>
          <span className={styles.previewHint}>trang thực tế</span>
        </div>
        <iframe
          src={`/khoa-hoc/${slug}`}
          className={styles.previewFrame}
          title="Course Preview"
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa khóa học"
        message={`Bạn có chắc muốn xóa khóa học "${courseTitle}"? Toàn bộ modules, lessons, và sections sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
