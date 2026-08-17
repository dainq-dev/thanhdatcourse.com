"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface Lead {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  message?: string;
  courseId?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CANCELLED"] as const;
const COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#f59e0b",
  CONVERTED: "#4ade80",
  CANCELLED: "#ef4444",
};
const SOURCES = ["Facebook", "Zalo", "YouTube", "Phone", "Other"] as const;
const LIMIT = 20;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("NEW");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [courseMap, setCourseMap] = useState<Map<string, string>>(new Map());

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [modalForm, setModalForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    courseId: "",
    message: "",
    source: "Facebook" as (typeof SOURCES)[number],
  });
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  useEffect(() => {
    api
      .get<{ data: { id: string; title: string }[] }>("/api/courses")
      .then((res) => {
        const map = new Map<string, string>();
        const arr = Array.isArray(res) ? res : (res.data ?? []);
        for (const c of arr) {
          map.set(c.id, c.title);
        }
        setCourseMap(map);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", filter);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await api.get<{
        leads: Lead[];
        total: number;
        page: number;
        limit: number;
      }>(`/api/leads?${params.toString()}`);

      setLeads(res.leads ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const updateStatus = async (id: string, status: string) => {
    await api
      .put(`/api/leads/${id}`, { status, adminNotes: notes[id] || undefined })
      .catch(() => {});
    setExpanded(null);
    load();
  };

  const copyPhone = async (phone: string, id: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      //
    }
  };

  const escapeCSV = (val: string): string => {
    if (!val) return "";
    const needsEscape =
      val.includes(",") || val.includes('"') || val.includes("\n");
    return needsEscape ? `"${val.replace(/"/g, '""')}"` : val;
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("status", filter);
      params.set("limit", "100");
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await api.get<{ leads: Lead[] }>(
        `/api/leads?${params.toString()}`,
      );
      const allLeads = res.leads ?? [];

      const header = [
        "Tên",
        "Email",
        "SĐT",
        "Khóa học",
        "Lời nhắn",
        "Trạng thái",
        "Ghi chú",
        "Ngày tạo",
      ].join(",");

      const rows = allLeads.map((l) =>
        [
          escapeCSV(l.customerName),
          escapeCSV(l.customerEmail ?? ""),
          escapeCSV(l.customerPhone),
          escapeCSV(l.courseId ? (courseMap.get(l.courseId) ?? "") : ""),
          escapeCSV(l.message ?? ""),
          escapeCSV(l.status),
          escapeCSV(l.adminNotes ?? ""),
          escapeCSV(new Date(l.createdAt).toLocaleDateString("vi-VN")),
        ].join(","),
      );

      const csv = "\uFEFF" + [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `leads-${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      //
    } finally {
      setExporting(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");
    setSubmitting(true);

    try {
      const body: Record<string, string> = {
        customerName: modalForm.customerName.trim(),
        customerPhone: modalForm.customerPhone.trim(),
      };
      if (modalForm.customerEmail.trim())
        body.customerEmail = modalForm.customerEmail.trim();
      if (modalForm.message.trim()) body.message = modalForm.message.trim();
      if (modalForm.courseId) body.courseId = modalForm.courseId;

      const res = await api.post<{ lead: Lead }>("/api/leads", body);

      await api
        .put(`/api/leads/${res.lead.id}`, {
          adminNotes: `Nhập tay từ ${modalForm.source}`,
        })
        .catch(() => {});

      setModalSuccess("Đã thêm lead thành công");
      setModalForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        courseId: "",
        message: "",
        source: "Facebook",
      });
      setTimeout(() => {
        setModalOpen(false);
        setModalSuccess("");
      }, 1200);
      load();
    } catch {
      setModalError("Không thể thêm lead, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const courses = useMemo(
    () => Array.from(courseMap.entries()).map(([id, title]) => ({ id, title })),
    [courseMap],
  );

  return (
    <div>
      <h1 className={styles.title}>Khách hàng tiềm năng</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchBarWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={styles.csvBtn}
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </button>
          <button
            className={styles.addLeadBtn}
            onClick={() => {
              setModalOpen(true);
              setModalError("");
              setModalSuccess("");
            }}
          >
            + Thêm lead
          </button>
        </div>
      </div>

      <div className={styles.statusTabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`${styles.statusTab} ${filter === s ? styles.statusTabActive : ""}`}
            style={{
              ...(filter === s
                ? {
                    background: COLORS[s],
                    color: "#000",
                    borderColor: COLORS[s],
                  }
                : {
                    borderColor: `${COLORS[s]}30`,
                    color: COLORS[s],
                  }),
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.loadingText}>Đang tải...</p>
      ) : leads.length === 0 ? (
        <p className={styles.emptyText}>Không có lead nào</p>
      ) : (
        <>
          <div className={styles.leadList}>
            {leads.map((l) => (
              <div key={l.id} className={styles.leadCard}>
                <div
                  onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                  className={styles.leadHeader}
                >
                  <div className={styles.leadNameRow}>
                    <span className={styles.leadName}>{l.customerName}</span>
                    {l.courseId && courseMap.has(l.courseId) && (
                      <span className={styles.courseTag}>
                        {courseMap.get(l.courseId)}
                      </span>
                    )}
                    <span className={styles.leadEmail}>
                      {l.customerEmail || "—"}
                    </span>
                  </div>
                  <span
                    className={styles.leadStatus}
                    style={{
                      background: `${COLORS[l.status]}20`,
                      color: COLORS[l.status],
                      borderColor: `${COLORS[l.status]}30`,
                    }}
                  >
                    {l.status}
                  </span>
                </div>

                {expanded === l.id && (
                  <div className={styles.leadExpanded}>
                    <p className={styles.leadInfo}>
                      <a
                        href={`tel:${l.customerPhone}`}
                        className={styles.phoneLink}
                      >
                        {l.customerPhone}
                      </a>
                      <button
                        className={styles.copyBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPhone(l.customerPhone, l.id);
                        }}
                        title="Sao chép SĐT"
                      >
                        {copiedId === l.id ? "Đã sao chép" : "Sao chép"}
                      </button>
                      <span className={styles.leadDate}>
                        {" "}
                        • {new Date(l.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </p>

                    {l.message && (
                      <p className={styles.leadMessage}>{l.message}</p>
                    )}

                    {l.adminNotes && (
                      <p className={styles.leadAdminNotes}>📝 {l.adminNotes}</p>
                    )}

                    <textarea
                      value={notes[l.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [l.id]: e.target.value,
                        }))
                      }
                      placeholder="Ghi chú..."
                      className={styles.noteTextarea}
                    />

                    <div className={styles.statusActions}>
                      {STATUSES.filter((s) => s !== l.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(l.id, s)}
                          className={styles.statusActionBtn}
                          style={{
                            background: `${COLORS[s]}20`,
                            color: COLORS[s],
                            borderColor: `${COLORS[s]}30`,
                          }}
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Trước
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages} ({total} lead
                {total !== 1 ? "s" : ""})
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>Thêm lead mới</h2>

            {modalError && <p className={styles.modalError}>{modalError}</p>}
            {modalSuccess && (
              <p className={styles.modalSuccess}>{modalSuccess}</p>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  required
                  value={modalForm.customerName}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      customerName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số điện thoại *</label>
                <input
                  className={styles.formInput}
                  type="tel"
                  required
                  value={modalForm.customerPhone}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      customerPhone: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={modalForm.customerEmail}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      customerEmail: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Khóa học</label>
                <select
                  className={styles.formSelect}
                  value={modalForm.courseId}
                  onChange={(e) =>
                    setModalForm((f) => ({ ...f, courseId: e.target.value }))
                  }
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nguồn</label>
                <select
                  className={styles.formSelect}
                  value={modalForm.source}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      source: e.target.value as (typeof SOURCES)[number],
                    }))
                  }
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Lời nhắn</label>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={modalForm.message}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      message: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
                  disabled={submitting}
                >
                  {submitting ? "Đang gửi..." : "Thêm lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
