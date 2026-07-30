"use client";

import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "../faq/page.module.scss";

interface Lead {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  message?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}
const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CANCELLED"];
const COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#f59e0b",
  CONVERTED: "#4ade80",
  CANCELLED: "#ef4444",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("NEW");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    const d = await api
      .get<Lead[] | { data: Lead[] }>(`/api/leads?status=${filter}`)
      .catch(() => [] as Lead[]);
    setLeads(extractData(d) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await api
      .put(`/api/leads/${id}`, { status, adminNotes: note || undefined })
      .catch(() => {});
    setExpanded(null);
    setNote("");
    load();
  };

  return (
    <div>
      <h1 className={styles.title}>Khách hàng tiềm năng</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "0.4rem 0.8rem",
              background: filter === s ? COLORS[s] : "#0b0f19",
              color: filter === s ? "#000" : "#888",
              border: `1px solid ${COLORS[s]}20`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: "#888" }}>Đang tải...</p>
      ) : leads.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "4rem" }}>
          Không có lead nào
        </p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {leads.map((l) => (
            <div
              key={l.id}
              style={{
                background: "#0b0f19",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "1rem",
              }}
            >
              <div
                onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    {l.customerName}
                  </span>
                  <span
                    style={{
                      color: "#666",
                      marginLeft: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    {l.customerEmail || "—"}
                  </span>
                </div>
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: `${COLORS[l.status]}20`,
                    color: COLORS[l.status],
                    border: `1px solid ${COLORS[l.status]}30`,
                  }}
                >
                  {l.status}
                </span>
              </div>
              {expanded === l.id && (
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.8rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {l.customerPhone} •{" "}
                    {new Date(l.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p
                    style={{
                      color: "#ccc",
                      marginBottom: "1rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {l.message || "—"}
                  </p>
                  {l.adminNotes && (
                    <p
                      style={{
                        color: "#666",
                        fontSize: "0.8rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      📝 {l.adminNotes}
                    </p>
                  )}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "#000",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "0.85rem",
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: "50px",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {STATUSES.filter((s) => s !== l.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(l.id, s)}
                        style={{
                          padding: "0.35rem 0.7rem",
                          background: `${COLORS[s]}20`,
                          color: COLORS[s],
                          border: `1px solid ${COLORS[s]}30`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          fontFamily: "inherit",
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
      )}
    </div>
  );
}
