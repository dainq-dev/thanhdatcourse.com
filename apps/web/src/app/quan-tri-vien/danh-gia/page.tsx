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
  const [n, setN] = useState("");
  const [r, setR] = useState("");
  const [q, setQ] = useState("");
  const [rt, setRt] = useState("5");
  const [f, setF] = useState(false);

  const load = async () => {
    setL(true);
    const d = await api
      .get<T[] | { data: T[] }>("/api/testimonials")
      .catch(() => [] as T[]);
    setItems(extractData(d));
    setL(false);
  };
  useEffect(() => { load(); }, []);

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
      })
      .catch(() => {});
    setN("");
    setR("");
    setQ("");
    setRt("5");
    setF(false);
    load();
  };
  const stars = (v: number) => "⭐".repeat(v);

  return (
    <div>
      <h1 className={styles.title}>Đánh giá học viên</h1>
      <div className={styles.form}>
        <input
          className={styles.i}
          placeholder="Tên"
          value={n}
          onChange={(e) => setN(e.target.value)}
        />
        <input
          className={styles.i}
          placeholder="Role (VD: Học viên)"
          value={r}
          onChange={(e) => setR(e.target.value)}
        />
        <textarea
          className={styles.i}
          placeholder="Nội dung đánh giá"
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
            color: "#ccc",
            fontSize: "0.85rem",
          }}
        >
          <input
            type="checkbox"
            checked={f}
            onChange={(e) => setF(e.target.checked)}
            style={{ accentColor: "#ff005a" }}
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
              <th>Role</th>
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
