"use client";

import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "../faq/page.module.scss";

interface P {
  id: string;
  campaignName: string;
  discountPercentage: number;
  courseId: string | null;
  startDate?: string;
  endDate?: string;
  isActive: number;
}
interface C {
  id: string;
  title: string;
}

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<P[]>([]);
  const [courses, setCourses] = useState<C[]>([]);
  const [l, setL] = useState(true);
  const [cn, setCn] = useState("");
  const [dp, setDp] = useState("");
  const [cid, setCid] = useState("");
  const [sd, setSd] = useState("");
  const [ed, setEd] = useState("");
  const [act, setAct] = useState(true);

  const load = async () => {
    setL(true);
    const [pd, cd] = await Promise.all([
      api.get<P[] | { data: P[] }>("/api/promotions").catch(() => [] as P[]),
      api
        .get<C[] | { data: C[] }>("/api/courses?published=true")
        .catch(() => [] as C[]),
    ]);
    setItems(extractData(pd));
    setCourses(extractData(cd));
    setL(false);
  };
  useEffect(() => {
    load();
  }, []);

  const del = async (id: string) => {
    if (!confirm("Xóa?")) return;
    await api.del(`/api/promotions/${id}`).catch(() => {});
    load();
  };
  const save = async () => {
    if (!cn || !dp) return;
    await api
      .post("/api/promotions", {
        campaignName: cn,
        discountPercentage: parseInt(dp, 10),
        courseId: cid || null,
        startDate: sd || null,
        endDate: ed || null,
        isActive: act,
      })
      .catch(() => {});
    setCn("");
    setDp("");
    setCid("");
    setSd("");
    setEd("");
    setAct(true);
    load();
  };

  return (
    <div>
      <h1 className={styles.title}>Chương trình khuyến mãi</h1>
      <div className={styles.form}>
        <input
          className={styles.i}
          placeholder="Tên chiến dịch *"
          value={cn}
          onChange={(e) => setCn(e.target.value)}
        />
        <input
          className={styles.i}
          placeholder="Giảm giá % *"
          type="number"
          value={dp}
          onChange={(e) => setDp(e.target.value)}
        />
        <select
          className={styles.i}
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        >
          <option value="">Toàn trang</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <div className={styles.dateRow}>
          <span style={{ fontSize: "0.7rem", color: "var(--admin-text-secondary)", marginBottom: "-0.25rem" }}>Ngày bắt đầu</span>
          <span style={{ fontSize: "0.7rem", color: "var(--admin-text-secondary)", marginBottom: "-0.25rem" }}>Ngày kết thúc</span>
          <input
            className={styles.i}
            type="date"
            value={sd}
            onChange={(e) => setSd(e.target.value)}
            placeholder="Ngày bắt đầu"
          />
          <input
            className={styles.i}
            type="date"
            value={ed}
            onChange={(e) => setEd(e.target.value)}
            placeholder="Ngày kết thúc"
          />
        </div>
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
            checked={act}
            onChange={(e) => setAct(e.target.checked)}
            style={{ accentColor: "var(--admin-accent)", width: 13, height: 13 }}
          />{" "}
          Kích hoạt
        </label>
        <button className={styles.btn} onClick={save}>
          Thêm khuyến mãi
        </button>
      </div>
      {l ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Chưa có khuyến mãi nào</p>
      ) : (
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giảm</th>
              <th>Khóa học</th>
              <th>Ngày</th>
              <th>TT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.campaignName}</td>
                <td>{p.discountPercentage}%</td>
                <td>
                  {p.courseId
                    ? courses.find((c) => c.id === p.courseId)?.title ||
                      p.courseId
                    : "Toàn trang"}
                </td>
                <td>
                  {p.startDate || "—"} → {p.endDate || "—"}
                </td>
                <td>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      background: p.isActive
                        ? "var(--admin-success-bg)"
                        : "var(--admin-surface-raised)",
                      color: p.isActive
                        ? "var(--admin-success)"
                        : "var(--admin-text-secondary)",
                      border: `1px solid ${p.isActive ? "var(--admin-success-border)" : "var(--admin-border)"}`,
                    }}
                  >
                    {p.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td className={styles.act}>
                  <button className={styles.delBtn} onClick={() => del(p.id)}>
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
