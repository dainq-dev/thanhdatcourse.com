"use client";

export default function AdminMediaPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "1rem",
        }}
      >
        Media
      </h1>
      <p style={{ color: "#888" }}>
        Media Library — upload và quản lý ảnh, video, tài liệu.
      </p>
      <div
        style={{
          marginTop: "2rem",
          padding: "2rem",
          background: "#0b0f19",
          border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#666", marginBottom: "0.5rem" }}>
          Tính năng đang phát triển
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ color: "#666" }}
          disabled
        />
        <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          Upload qua API: POST /upload với Bearer token
        </p>
      </div>
    </div>
  );
}
