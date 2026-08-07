"use client";

import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "../faq/page.module.scss";

interface T {
  id: string;
  userName: string;
  userRole?: string;
  rating: number;
  content: string;
  courseId: string | null;
  isFeatured: number;
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<T[]>([]);
  const [l, setL] = useState(true);
  // n=name, r=role, q=content, rt=rating, f=featured, t=title
  const [n, setN] = useState("");
  const [r, setR] = useState("");
  const [q, setQ] = useState("");
  const [rt, setRt] = useState("5");
  const [f, setF] = useState(false);
  const [t, setT] = useState("");
  const [cid, setCid] = useState("");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  const load = async () => {
    setL(true);
    const d = await api
      .get<T[] | { data: T[] }>("/api/testimonials")
      .catch(() => [] as T[]);
    setItems(extractData(d));
    setL(false);
  };
  useEffect(() => {
    load();
    api
      .get<{ id: string; title: string }[] | { data: { id: string; title: string }[] }>(
        "/api/courses?published=true"
      )
      .then((d) => setCourses(extractData(d)))
      .catch(() => {});
  }, []);

  const del = async (id: string) => {
    if (!confirm("Xóa?")) return;
    await api.del(`/api/testimonials/${id}`).catch(() => {});
    load();
  };
  const save = async () => {
    if (!n || !q) return;
    await api
      .post("/api/testimonials", {
        userName: n,
        userRole: r,
        rating: parseInt(rt, 10),
        content: q,
        isFeatured: f ? 1 : 0,
        title: t || undefined,
        courseId: cid || null,
      })
      .catch(() => {});
    setN("");
    setR("");
    setQ("");
    setRt("5");
    setF(false);
    setT("");
    setCid("");
    load();
  };
  const stars = (v: number) => "⭐".repeat(v);

  return (
    <div>
      <h1 className={styles.title}>Đánh giá học viên</h1>
      <div className={styles.form}>
        <input
          className={styles.i}
          placeholder="Tên *"
          value={n}
          onChange={(e) => setN(e.target.value)}
        />
        <input
          className={styles.i}
          placeholder="Tiêu đề (VD: Rất hài lòng!)"
          value={t}
          onChange={(e) => setT(e.target.value)}
        />
        <input
          className={styles.i}
          placeholder="Role (VD: Học viên)"
          value={r}
          onChange={(e) => setR(e.target.value)}
        />
        <select
          className={styles.i}
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        >
          <option value="">-- Chọn khóa học (tùy chọn) --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <textarea
          className={styles.i}
          placeholder="Nội dung đánh giá *"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={3}
        />
        <select
          className={styles.i}
          value={rt}
          onChange={(e) => setRt(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {stars(v)}
            </option>
          ))}
        </select>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--admin-text)",
            fontSize: "0.8125rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={f}
            onChange={(e) => setF(e.target.checked)}
            style={{ accentColor: "var(--admin-accent)", width: 13, height: 13 }}
          />{" "}
          Nổi bật
        </label>
        <button className={styles.btn} onClick={save}>
          Thêm đánh giá
        </button>
      </div>
      {l ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Chưa có đánh giá nào</p>
      ) : (
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Khóa học</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.userName}
                  {i.isFeatured ? " ⭐" : ""}
                </td>
                <td>{i.userRole || "—"}</td>
                <td>
                  {i.courseId
                    ? courses.find((c) => c.id === i.courseId)?.title || "—"
                    : "—"}
                </td>
                <td>{stars(i.rating)}</td>
                <td className={styles.trunc}>{i.content}</td>
                <td className={styles.act}>
                  <button className={styles.delBtn} onClick={() => del(i.id)}>
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
