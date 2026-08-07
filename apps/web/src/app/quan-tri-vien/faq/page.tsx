"use client";

import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  courseId: string | null;
  sortOrder: number;
}
interface Course {
  id: string;
  title: string;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [cid, setCid] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [faqData, courseData] = await Promise.all([
      api.get<FAQ[] | { data: FAQ[] }>("/api/faqs").catch(() => [] as FAQ[]),
      api
        .get<Course[] | { data: Course[] }>("/api/courses?published=true")
        .catch(() => [] as Course[]),
    ]);
    setFaqs(extractData(faqData));
    setCourses(extractData(courseData));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setQ("");
    setA("");
    setCid("");
    setEditId(null);
  };
  const del = async (id: string) => {
    if (!confirm("Xóa FAQ?")) return;
    await api.del(`/api/faqs/${id}`).catch(() => {});
    load();
  };
  const save = async () => {
    if (!q || !a) return;
    const body = {
      question: q,
      answer: a,
      courseId: cid || null,
      sortOrder: 0,
    };
    if (editId) {
      await api.put(`/api/faqs/${editId}`, body).catch(() => {});
    } else {
      await api.post("/api/faqs", body).catch(() => {});
    }
    reset();
    load();
  };
  const edit = (f: FAQ) => {
    setEditId(f.id);
    setQ(f.question);
    setA(f.answer);
    setCid(f.courseId || "");
  };

  return (
    <div>
      <h1 className={styles.title}>Câu hỏi thường gặp</h1>
      <div className={styles.form}>
        <input
          className={styles.i}
          placeholder="Câu hỏi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <textarea
          className={styles.i}
          placeholder="Câu trả lời"
          value={a}
          onChange={(e) => setA(e.target.value)}
          rows={3}
        />
        <select
          className={styles.i}
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        >
          <option value="">Toàn trang (tất cả trang)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={styles.btn} onClick={save}>
            {editId ? "Cập nhật" : "Thêm FAQ"}
          </button>
          {editId && (
            <button className={styles.btnCancel} onClick={reset}>
              Hủy
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : faqs.length === 0 ? (
        <p className={styles.empty}>Chưa có FAQ nào</p>
      ) : (
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Câu hỏi</th>
              <th>Câu trả lời</th>
              <th>Khóa học</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((f) => (
              <tr key={f.id}>
                <td>{f.question}</td>
                <td className={styles.trunc}>{f.answer}</td>
                <td>
                  {f.courseId
                    ? courses.find((c) => c.id === f.courseId)?.title ||
                      f.courseId
                    : "Toàn trang"}
                </td>
                <td className={styles.act}>
                  <button className={styles.editBtn} onClick={() => edit(f)}>
                    Sửa
                  </button>
                  <button className={styles.delBtn} onClick={() => del(f.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
