"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

const CATEGORIES = [
  "Travel",
  "TVC",
  "Documentary",
  "Tutorial",
  "Automotive",
  "Food",
  "Fashion",
  "Short Video",
];

function extractYoutubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1] ?? input;
  }
  return input;
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome: number;
  featuredOrder: number;
}

export default function EditPortfolioPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pvKey, setPvKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );

  const [f, setF] = useState({
    title: "",
    description: "",
    category: "Travel",
    thumbnailUrl: "",
    fullVideoUrl: "",
    youtubeVideoId: "",
    isFeaturedOnHome: false,
    featuredOrder: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const item = await api.get<Portfolio>(`/api/portfolios/${id}`);
        setF({
          title: item.title,
          description: item.description || "",
          category: item.category || "Travel",
          thumbnailUrl: item.thumbnailUrl || "",
          fullVideoUrl: item.fullVideoUrl || "",
          youtubeVideoId: item.youtubeVideoId || "",
          isFeaturedOnHome: item.isFeaturedOnHome === 1,
          featuredOrder: item.featuredOrder || 0,
        });
      } catch {
        setError("Không thể tải dự án");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (k: string, v: string | boolean | number) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaveStatus("unsaved");
  };

  const onYoutubeChange = (input: string) => {
    const yid = extractYoutubeId(input);
    setF((p) => ({
      ...p,
      youtubeVideoId: yid,
      thumbnailUrl: yid
        ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg`
        : p.thumbnailUrl,
    }));
    setSaveStatus("unsaved");
  };

  useEffect(() => {
    if (loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (saveStatus !== "unsaved") return;
      setSaveStatus("saving");
      try {
        await api.put(`/api/portfolios/${id}`, {
          title: f.title,
          description: f.description || undefined,
          category: f.category,
          thumbnailUrl: f.thumbnailUrl || undefined,
          fullVideoUrl: f.fullVideoUrl || undefined,
          youtubeVideoId: f.youtubeVideoId || undefined,
          isFeaturedOnHome: f.isFeaturedOnHome,
          featuredOrder: f.featuredOrder,
        });
        setSaveStatus("saved");
        setPvKey((k) => k + 1);
      } catch {
        setSaveStatus("unsaved");
      }
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [f]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/api/portfolios/${id}`, {
        title: f.title,
        description: f.description || undefined,
        category: f.category,
        thumbnailUrl: f.thumbnailUrl || undefined,
        fullVideoUrl: f.fullVideoUrl || undefined,
        youtubeVideoId: f.youtubeVideoId || undefined,
        isFeaturedOnHome: f.isFeaturedOnHome,
        featuredOrder: f.featuredOrder,
      });
      setSaveStatus("saved");
      setPvKey((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* LEFT: Editor */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Chỉnh sửa dự án</h1>
          <div className={styles.panelBtns}>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--admin-text-secondary)",
                marginRight: "0.5rem",
              }}
            >
              {saveStatus === "saved"
                ? "Đã lưu"
                : saveStatus === "saving"
                  ? "Đang lưu..."
                  : "Chưa lưu"}
            </span>
            <button
              type="button"
              className={styles.cBtn}
              onClick={() => router.back()}
            >
              Hủy
            </button>
            <button
              type="button"
              className={styles.sBtn}
              onClick={() => save()}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
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
          <form onSubmit={save}>
            <div className={styles.fld}>
              <span className={styles.lbl}>Ảnh thumbnail</span>
              <MediaTrigger
                onSelect={(url) => onChange("thumbnailUrl", url)}
                value={f.thumbnailUrl}
                showPreview
                filter="image"
                accept="image/*"
              >
                {f.thumbnailUrl ? "Đổi ảnh" : "Chọn ảnh thumbnail"}
              </MediaTrigger>
            </div>

            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>Tiêu đề <span className={styles.req}>*</span></span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.title}
                  onChange={(e) => onChange("title", e.target.value)}
                  required
                />
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>Danh mục</span>
                <select
                  className={styles.sel}
                  value={f.category}
                  onChange={(e) => onChange("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fld}>
              <span className={styles.lbl}>Mô tả</span>
              <textarea
                className={styles.txa}
                value={f.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.fld}>
              <span className={styles.lbl}>Video YouTube</span>
              <input
                type="text"
                className={styles.inp}
                value={f.youtubeVideoId}
                onChange={(e) => onYoutubeChange(e.target.value)}
                placeholder="https://youtu.be/... hoặc paste ID"
              />
              <span className={styles.hint}>
                Tự động trích xuất ID từ link YouTube
              </span>
              {f.youtubeVideoId && (
                <img
                  src={`https://img.youtube.com/vi/${f.youtubeVideoId}/hqdefault.jpg`}
                  alt="YouTube preview"
                  className={styles.ytPreview}
                />
              )}
            </div>

            <div className={styles.fld}>
              <span className={styles.lbl}>Link video đầy đủ (tuỳ chọn)</span>
              <input
                type="text"
                className={styles.inp}
                value={f.fullVideoUrl}
                onChange={(e) => onChange("fullVideoUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={f.isFeaturedOnHome}
                  onChange={(e) =>
                    onChange("isFeaturedOnHome", e.target.checked)
                  }
                />
                <span>Nổi bật trang chủ</span>
              </label>
            </div>
            <div className={styles.fld}>
              <span className={styles.lbl}>Thứ tự nổi bật</span>
              <input type="number" className={styles.inp} value={f.featuredOrder} onChange={e => onChange("featuredOrder", parseInt(e.target.value) || 0)} min={0} />
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT: Live Preview (iframe real public page) */}
      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước trang thực tế</span>
          <button
            type="button"
            className={styles.previewReload}
            onClick={() => {
              save();
              setTimeout(() => setPvKey((k) => k + 1), 500);
            }}
            title="Lưu & tải lại"
          >
            Lưu & Xem
          </button>
        </div>
        <iframe
          key={pvKey}
          src={`/san-pham/${id}`}
          width="100%"
          height="100%"
          style={{ height: "100%", overflow: "hidden" }}
          className={styles.previewFrame}
          title="Preview"
        />
      </div>
    </div>
  );
}
