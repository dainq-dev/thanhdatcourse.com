"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import styles from "./page.module.scss";

interface SettingEntry {
  key: string;
  value: string;
  description: string | null;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "color" | "media" | "media-video" | "select";
  options?: { label: string; value: string }[];
  showWhen?: { key: string; value: string };
}

interface Section {
  id: string;
  title: string;
  description: string;
  pageHint: string;
  fields: FieldDef[];
}

const SECTIONS: Section[] = [
  {
    id: "brand",
    title: "Nhận diện thương hiệu",
    description: "Tên website, mô tả SEO, logo, favicon, cấu hình PWA.",
    pageHint: "Toàn bộ website — thẻ <title>, <meta>, manifest.json",
    fields: [
      { key: "site_title", label: "Tiêu đề trang web", placeholder: "VD: Minh Travel" },
      { key: "site_title_template", label: "Mẫu tiêu đề", placeholder: "%s | Minh Travel" },
      { key: "site_description", label: "Mô tả trang web", type: "textarea", placeholder: "Mô tả ngắn gọn về website" },
      { key: "site_keywords", label: "Từ khóa SEO", placeholder: "quay dựng, chỉnh màu, khóa học..." },
      { key: "site_url", label: "Địa chỉ website", placeholder: "https://minhtravel.vn" },
      { key: "theme_color", label: "Màu chủ đạo", type: "color" },
      { key: "apple_web_app_title", label: "Tên app iOS", placeholder: "Minh Travel" },
      { key: "logo_url", label: "Đường dẫn logo", type: "media" },
      { key: "logo_alt", label: "Mô tả ảnh logo", placeholder: "Logo Minh Travel" },
      { key: "favicon_url", label: "Favicon", type: "media" },
      { key: "pwa_name", label: "Tên ứng dụng PWA", placeholder: "Minh Travel" },
      { key: "pwa_short_name", label: "Tên PWA rút gọn", placeholder: "Minh Travel" },
      { key: "pwa_description", label: "Mô tả PWA", type: "textarea" },
      { key: "pwa_bg_color", label: "Màu nền PWA", type: "color" },
      { key: "pwa_theme_color", label: "Màu giao diện PWA", type: "color" },
    ],
  },
  {
    id: "hero",
    title: "Ảnh bìa trang chủ (Hero Banner)",
    description: "Video YouTube hoặc video tự upload nền, khẩu hiệu, nút kêu gọi hành động, logo (ảnh hoặc text), thương hiệu hợp tác.",
    pageHint: "Trang chủ — phần đầu tiên người dùng nhìn thấy",
    fields: [
      { key: "hero_video_type", label: "Loại video nền", type: "select", options: [{ label: "YouTube", value: "youtube" }, { label: "Video tự tải lên", value: "upload" }] },
      { key: "hero_youtube_id", label: "ID video YouTube", placeholder: "VD: dQw4w9WgXcQ", showWhen: { key: "hero_video_type", value: "youtube" } },
      { key: "hero_video_url", label: "Video đã tải lên", type: "media-video", showWhen: { key: "hero_video_type", value: "upload" } },
      { key: "hero_video_title", label: "Tiêu đề video", placeholder: "Minh Travel Showreel 2025" },
      { key: "hero_tagline", label: "Dòng khẩu hiệu chính", placeholder: "Kể câu chuyện của bạn qua từng khung hình" },
      { key: "hero_logo_type", label: "Kiểu logo", type: "select", options: [{ label: "Ảnh", value: "image" }, { label: "Chữ", value: "text" }] },
      { key: "hero_logo_url", label: "Ảnh logo", type: "media", showWhen: { key: "hero_logo_type", value: "image" } },
      { key: "hero_logo_text", label: "Tên hiển thị", placeholder: "Minh Travel", showWhen: { key: "hero_logo_type", value: "text" } },
      { key: "hero_btn1_text", label: "Nút chính - Chữ", placeholder: "Xem khóa học" },
      { key: "hero_btn1_url", label: "Nút chính - Đường dẫn", placeholder: "/khoa-hoc" },
      { key: "hero_btn2_text", label: "Nút phụ - Chữ", placeholder: "Liên hệ" },
      { key: "hero_btn2_url", label: "Nút phụ - Đường dẫn", placeholder: "/lien-he" },
      { key: "hero_brands", label: "Thương hiệu hợp tác" },
    ],
  },
  {
    id: "homepage",
    title: "Nội dung trang chủ",
    description: "Các mục: Dự án nổi bật, Sản phẩm, Chỉ số, Văn bản giới thiệu.",
    pageHint: "Trang chủ — các section bên dưới Hero",
    fields: [
      { key: "home_work_heading", label: "Tiêu đề mục Dự án", placeholder: "Dự án tiêu biểu" },
      { key: "home_work_card1_title", label: "Card dự án 1 - Tiêu đề" },
      { key: "home_work_card1_desc", label: "Card dự án 1 - Mô tả", type: "textarea" },
      { key: "home_work_card1_link_text", label: "Card dự án 1 - Chữ nút" },
      { key: "home_work_card1_href", label: "Card dự án 1 - Đường dẫn" },
      { key: "home_work_card2_title", label: "Card dự án 2 - Tiêu đề" },
      { key: "home_work_card2_desc", label: "Card dự án 2 - Mô tả", type: "textarea" },
      { key: "home_work_card2_link_text", label: "Card dự án 2 - Chữ nút" },
      { key: "home_work_card2_href", label: "Card dự án 2 - Đường dẫn" },
      { key: "home_products_heading", label: "Tiêu đề mục Sản phẩm", placeholder: "Công cụ & Presets" },
      { key: "home_products_card1_label", label: "Card SP 1 - Nhãn", placeholder: "Bán chạy" },
      { key: "home_products_card1_title", label: "Card SP 1 - Tiêu đề" },
      { key: "home_products_card1_desc", label: "Card SP 1 - Mô tả", type: "textarea" },
      { key: "home_products_card1_href", label: "Card SP 1 - Đường dẫn" },
      { key: "home_products_card2_label", label: "Card SP 2 - Nhãn" },
      { key: "home_products_card2_title", label: "Card SP 2 - Tiêu đề" },
      { key: "home_products_card2_desc", label: "Card SP 2 - Mô tả", type: "textarea" },
      { key: "home_products_card2_href", label: "Card SP 2 - Đường dẫn" },
      { key: "home_counters", label: "Chỉ số nổi bật", type: "textarea", placeholder: '[{"value":"3600+","label":"Học viên"},{"value":"50+","label":"Khóa học"}]' },
      { key: "home_about_text_1", label: "Giới thiệu — Đoạn 1", type: "textarea" },
      { key: "home_about_text_2", label: "Giới thiệu — Đoạn 2", type: "textarea" },
    ],
  },
  {
    id: "navigation",
    title: "Điều hướng & Liên kết",
    description: "Menu chính, menu chân trang, mạng xã hội, email, link LMS.",
    pageHint: "Toàn bộ website — header + footer",
    fields: [
      { key: "nav_items", label: "Menu chính", type: "textarea", placeholder: '[{"label":"Khóa học","href":"/khoa-hoc"},{"label":"Blog","href":"/bai-viet"}]' },
      { key: "lms_url", label: "Đường dẫn LMS (học viên)", placeholder: "https://lms.minhtravel.vn" },
      { key: "lms_cta_text", label: "Chữ nút vào LMS", placeholder: "VÀO HỌC" },
      { key: "footer_nav", label: "Menu chân trang", type: "textarea", placeholder: '[{"label":"Khóa học","href":"/khoa-hoc"}]' },
      { key: "social_links", label: "Mạng xã hội", type: "textarea", placeholder: '[{"platform":"youtube","url":"..."},{"platform":"facebook","url":"..."}]' },
      { key: "contact_email", label: "Email liên hệ", placeholder: "contact@minhtravel.vn" },
      { key: "footer_background_url", label: "Ảnh nền chân trang", type: "media" },
    ],
  },
  {
    id: "courses",
    title: "Trang danh sách khóa học",
    description: "Tiêu đề, dòng tin cậy, chữ nút mua, tiêu đề FAQ.",
    pageHint: "/khoa-hoc — danh sách tất cả khóa học",
    fields: [
      { key: "courses_page_hero_title", label: "Tiêu đề lớn đầu trang", placeholder: "Bắt đầu sự nghiệp của bạn" },
      { key: "courses_page_trust_text", label: "Dòng tin cậy", placeholder: "Được tin tưởng bởi 3,600+ thành viên" },
      { key: "courses_page_trust_icon_url", label: "Icon dòng tin cậy", type: "media" },
      { key: "courses_page_default_btn_text", label: "Chữ nút mua mặc định", placeholder: "Mua ngay" },
      { key: "courses_page_faq_heading", label: "Tiêu đề mục FAQ", placeholder: "Câu hỏi thường gặp" },
    ],
  },
  {
    id: "courseDetail",
    title: "Trang chi tiết khóa học",
    description: "Tiêu đề các section bên trong trang chi tiết từng khóa học.",
    pageHint: "/khoa-hoc/[tên-khóa] — trang chi tiết",
    fields: [
      { key: "course_detail_brands_title", label: "Tiêu đề mục thương hiệu", placeholder: "Thương hiệu đã hợp tác" },
      { key: "course_detail_modules_title", label: "Tiêu đề mục giáo trình" },
      { key: "course_detail_modules_subtitle", label: "Phụ đề mục giáo trình" },
      { key: "course_detail_bonuses_title", label: "Tiêu đề mục ưu đãi", placeholder: "Ưu đãi khi đăng ký" },
      { key: "course_detail_testimonials_title", label: "Tiêu đề mục đánh giá", placeholder: "Học viên nói gì" },
      { key: "course_detail_faq_heading", label: "Tiêu đề mục FAQ" },
      { key: "course_target_badges", label: "Đối tượng khóa học", type: "textarea", placeholder: '["Người mới","Content Creator","Chủ shop"]' },
      { key: "hero_subtitle", label: "Phụ đề Hero khóa học", placeholder: "TIẾT LỘ BÍ QUYẾT..." },
    ],
  },
  {
    id: "portfolio",
    title: "Trang dự án thực hiện",
    description: "Tiêu đề, phụ đề, nút kêu gọi hành động.",
    pageHint: "/san-pham — portfolio các dự án phim",
    fields: [
      { key: "portfolio_page_title", label: "Tiêu đề trang", placeholder: "Films by Minh Travel" },
      { key: "portfolio_page_subtitle", label: "Phụ đề trang" },
      { key: "portfolio_cta_heading", label: "Tiêu đề CTA cuối trang", placeholder: "Bạn muốn làm việc cùng tôi?" },
      { key: "portfolio_cta_items", label: "Nút CTA", type: "textarea", placeholder: '[{"text":"Liên hệ","href":"..."},{"text":"Xem thêm","href":"..."}]' },
    ],
  },
  {
    id: "presets",
    title: "Trang công cụ & Presets",
    description: "Tiêu đề, phụ đề, chữ nút mua.",
    pageHint: "/cong-cu — LUTs & Presets",
    fields: [
      { key: "presets_page_title", label: "Tiêu đề trang", placeholder: "LUTs & Presets" },
      { key: "presets_page_subtitle", label: "Phụ đề trang", type: "textarea" },
      { key: "presets_page_btn_text", label: "Chữ nút mua", placeholder: "Mua ngay" },
    ],
  },
  {
    id: "contact",
    title: "Trang liên hệ",
    description: "Tiêu đề, thông tin liên hệ, địa chỉ, giờ làm việc.",
    pageHint: "/lien-he — form liên hệ + thông tin",
    fields: [
      { key: "contact_page_title", label: "Tiêu đề trang", placeholder: "Liên hệ" },
      { key: "contact_page_subtitle", label: "Phụ đề trang" },
      { key: "contact_success_title", label: "Tiêu đề sau khi gửi thành công", placeholder: "Cảm ơn bạn!" },
      { key: "contact_success_text", label: "Nội dung sau khi gửi thành công", type: "textarea" },
      { key: "contact_info_title", label: "Tiêu đề khối thông tin", placeholder: "Thông tin liên hệ" },
      { key: "contact_address", label: "Địa chỉ", placeholder: "Hà Nội, Việt Nam" },
      { key: "contact_phone", label: "Số điện thoại", placeholder: "0900 123 456" },
      { key: "contact_hours", label: "Giờ làm việc", placeholder: "Thứ 2 - Thứ 6, 9:00 - 18:00" },
    ],
  },
  {
    id: "blog",
    title: "Trang blog",
    description: "Tiêu đề trang danh sách bài viết.",
    pageHint: "/bai-viet — danh sách bài viết",
    fields: [
      { key: "blog_page_title", label: "Tiêu đề trang blog", placeholder: "Blog — Kiến thức quay dựng" },
    ],
  },
];

const PREVIEW_PAGES = [
  { label: "Trang chủ", path: "/" },
  { label: "Khóa học", path: "/khoa-hoc" },
  { label: "Bài viết", path: "/bai-viet" },
  { label: "Dự án", path: "/san-pham" },
  { label: "Công cụ", path: "/cong-cu" },
  { label: "Liên hệ", path: "/lien-he" },
];

// Flat list of all fields for search
const ALL_FIELDS = SECTIONS.flatMap((s) =>
  s.fields.map((f) => ({ ...f, sectionId: s.id, sectionTitle: s.title })),
);

function buildPreviewCookie(changed: Record<string, string>): string {
  let json = JSON.stringify(changed);
  if (new Blob([json]).size > 3800) {
    const truncated: Record<string, string> = {};
    for (const [k, v] of Object.entries(changed)) {
      const trial = JSON.stringify({ ...truncated, [k]: v });
      if (new Blob([trial]).size > 3800) break;
      truncated[k] = v;
    }
    json = JSON.stringify(truncated);
  }
  return `preview_settings=${encodeURIComponent(json)};path=/;max-age=600;SameSite=Lax`;
}

function writePreviewCookie(changed: Record<string, string>) {
  document.cookie =
    Object.keys(changed).length === 0
      ? "preview_settings=;path=/;max-age=0"
      : buildPreviewCookie(changed);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [previewPath, setPreviewPath] = useState("/");
  const [previewKey, setPreviewKey] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Default expand only "brand" and "hero"
    const s = new Set<string>();
    s.add("brand");
    s.add("hero");
    return s;
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .publicGet<SettingEntry[]>("/api/settings")
      .then((rows) => {
        const map: Record<string, string> = {};
        for (const r of rows) map[r.key] = r.value;
        setSettings(map);
        setFormData(map);
      })
      .finally(() => setLoading(false));
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (key: string, value: string) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    const changed: Record<string, string> = {};
    for (const k of Object.keys(next)) {
      if (next[k] !== settings[k]) changed[k] = next[k];
    }
    writePreviewCookie(changed);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewKey((k) => k + 1), 1500);
  };

  const changedKeys = Object.keys(formData).filter(
    (k) => formData[k] !== settings[k],
  );

  const handleSave = async () => {
    const changed: Record<string, string> = {};
    for (const k of changedKeys) changed[k] = formData[k];
    if (Object.keys(changed).length === 0) return;

    setSaving(true);
    setSuccess("");
    setSaveError("");
    try {
      await api.put("/api/settings/batch", changed);
      setSettings({ ...formData });
      writePreviewCookie({});
      setPreviewKey((k) => k + 1);
      setSuccess(`Đã lưu ${Object.keys(changed).length} cài đặt`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setSaveError("Lỗi khi lưu — thử lại");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const reloadPreview = () => setPreviewKey((k) => k + 1);

  // Section-level unsaved count
  const sectionChangedCount = (section: Section) =>
    section.fields.filter((f) => formData[f.key] !== settings[f.key]).length;

  // Search
  const isSearching = search.length > 0;
  const searchResults = isSearching
    ? ALL_FIELDS.filter(
        (f) =>
          f.label.toLowerCase().includes(search.toLowerCase()) ||
          f.key.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.page}>
      {/* ── Left: Editor ── */}
      <div className={styles.editor}>
        <div className={styles.editorHeader}>
          <div>
            <h1 className={styles.pageTitle}>Cấu hình trang</h1>
            {changedKeys.length > 0 && !isSearching && (
              <span className={styles.changedBadge}>
                {changedKeys.length} thay đổi chưa lưu
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <input
              className={styles.searchInput}
              placeholder="Tìm cài đặt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || changedKeys.length === 0}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {success && <div className={styles.successBar}>{success}</div>}
        {saveError && <div className={styles.errorBar}>{saveError}</div>}

        {/* ── Search results (flat) ── */}
        {isSearching && (
          <div className={styles.fieldsScroll}>
            {searchResults
                .filter((f) => !f.showWhen || formData[f.showWhen.key] === f.showWhen.value)
                .map((f) => (
              <FieldRow
                key={`sr-${f.key}`}
                field={f}
                value={formData[f.key] ?? ""}
                onChange={handleChange}
                showContext
              />
            ))}
            {searchResults.length === 0 && (
              <p className={styles.noResults}>Không tìm thấy cài đặt nào</p>
            )}
          </div>
        )}

        {/* ── Section accordions (grouped) ── */}
        {!isSearching && (
          <div className={styles.fieldsScroll}>
            {SECTIONS.map((section) => {
              const isOpen = expandedSections.has(section.id);
              const dirty = sectionChangedCount(section);

              return (
                <div key={section.id} className={styles.section}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() => toggleSection(section.id)}
                    type="button"
                  >
                    <div className={styles.sectionHeaderLeft}>
                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>▸</span>
                      <div>
                        <span className={styles.sectionTitle}>{section.title}</span>
                        <span className={styles.sectionHint}>{section.pageHint}</span>
                      </div>
                    </div>
                    <div className={styles.sectionHeaderRight}>
                      {dirty > 0 && (
                        <span className={styles.sectionDirty}>{dirty}</span>
                      )}
                      <span className={styles.sectionCount}>{section.fields.length}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className={styles.sectionBody}>
                      <p className={styles.sectionDesc}>{section.description}</p>
                      {section.fields
                        .filter((f) => {
                          if (!f.showWhen) return true;
                          return formData[f.showWhen.key] === f.showWhen.value;
                        })
                        .map((field) => (
                          <FieldRow
                            key={field.key}
                            field={field}
                            value={formData[field.key] ?? ""}
                            onChange={handleChange}
                            isDirty={formData[field.key] !== settings[field.key]}
                          />
                        ))}
                    </div>
                  )}
                </div>
              );
            })}

            {changedKeys.length > 0 && (
              <button
                className={styles.saveBtnBottom}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : `Lưu ${changedKeys.length} thay đổi`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Preview ── */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <div className={styles.previewTabs}>
            {PREVIEW_PAGES.map((p) => (
              <button
                key={p.path}
                className={
                  previewPath === p.path
                    ? styles.previewTabActive
                    : styles.previewTab
                }
                onClick={() => setPreviewPath(p.path)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.previewDevice}>
            <button className={styles.deviceBtn} onClick={reloadPreview} title="Tải lại bản xem trước">
              ↻ Tải lại
            </button>
          </div>
        </div>
        <div className={styles.previewFrame}>
          <iframe
            key={previewKey}
            src={previewPath}
            className={styles.iframe}
            title="Xem trước trang web"
          />
        </div>
      </div>
    </div>
  );
}

// ── FieldRow renders a single setting field ──

const JSON_FIELDS = new Set([
  "hero_brands", "nav_items", "footer_nav", "social_links",
  "home_counters", "portfolio_cta_items", "course_target_badges",
]);

function FieldRow({
  field, value, onChange, isDirty, showContext,
}: {
  field: FieldDef; value: string; onChange: (key: string, val: string) => void; isDirty?: boolean; showContext?: boolean;
}) {
  // ── Media picker ──
  if (field.type === "media" || field.type === "media-video") {
    const isVideo = field.type === "media-video";
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${field.key}`}>
          {field.label}
          <span className={styles.keyHint}>{showContext ? field.key : isDirty ? "đã sửa" : ""}</span>
        </label>
        <div className={styles.mediaRow}>
          <input id={`sf-${field.key}`} type="text" className={styles.input} value={value}
            onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder || "https://..."} />
          <MediaTrigger
            onSelect={(url) => onChange(field.key, url)}
            value={value}
            filter={isVideo ? "video" : "image"}
            accept={isVideo ? "video/*" : "image/*"}
          >Chọn</MediaTrigger>
          {value && <button type="button" className={styles.clearMediaBtn} onClick={() => onChange(field.key, "")} title="Xóa">✕</button>}
        </div>
      </div>
    );
  }

  // ── Key-value editor for JSON arrays ──
  if (JSON_FIELDS.has(field.key)) {
    return <KeyValueField field={field} value={value} onChange={(v) => onChange(field.key, v)} isDirty={isDirty} showContext={showContext} />;
  }

  // ── Select dropdown ──
  if (field.type === "select" && field.options) {
    return (
      <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
        <label className={styles.label} htmlFor={`sf-${field.key}`}>
          {field.label}
          <span className={styles.keyHint}>{showContext ? field.key : isDirty ? "đã sửa" : ""}</span>
        </label>
        <select
          id={`sf-${field.key}`}
          className={styles.selectInput}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // ── Standard text / textarea / color ──
  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label} htmlFor={`sf-${field.key}`}>
        {field.label}
        <span className={styles.keyHint}>{showContext ? field.key : isDirty ? "đã sửa" : ""}</span>
      </label>
      {field.type === "textarea" ? (
        <textarea id={`sf-${field.key}`} className={styles.textarea} value={value} onChange={(e) => onChange(field.key, e.target.value)} rows={3} placeholder={field.placeholder} />
      ) : field.type === "color" ? (
        <div className={styles.colorRow}>
          <input id={`sf-${field.key}`} type="color" className={styles.colorInput} value={value || "#000000"} onChange={(e) => onChange(field.key, e.target.value)} />
          <span className={styles.colorValue}>{value || "#000000"}</span>
        </div>
      ) : (
        <input id={`sf-${field.key}`} type="text" className={styles.input} value={value} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} />
      )}
    </div>
  );
}

// ── Key-Value visual editor for JSON fields ──

interface KVItem { [k: string]: string }

function parseAsKVArray(raw: string): KVItem[] {
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p as KVItem[]; } catch { /* fallthrough */ }
  return [];
}

function KeyValueField({ field, value, onChange, isDirty, showContext }: {
  field: FieldDef; value: string; onChange: (val: string) => void; isDirty?: boolean; showContext?: boolean;
}) {
  const [localText, setLocalText] = useState(value);
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const items = parseAsKVArray(value);

  const emit = (newItems: KVItem[]) => { const j = JSON.stringify(newItems); setLocalText(j); onChange(j); };
  useEffect(() => { if (mode !== "json") setLocalText(value); }, [value, mode]);

  return (
    <div className={`${styles.field} ${isDirty ? styles.fieldDirty : ""}`}>
      <label className={styles.label}>
        {field.label}
        <span className={styles.keyHint}>
          <button type="button" className={styles.modeToggle} onClick={() => mode === "visual" ? setMode("json") : (setMode("visual"), onChange(localText))}>
            {mode === "visual" ? "JSON" : "Trực quan"}
          </button>
          {showContext ? ` · ${field.key}` : isDirty ? " · đã sửa" : ""}
        </span>
      </label>
      {mode === "json" ? (
        <textarea className={styles.textarea} value={localText} onChange={(e) => setLocalText(e.target.value)} onBlur={() => onChange(localText)} rows={5} placeholder={field.placeholder} />
      ) : items.length === 0 ? (
        <button type="button" className={styles.kvAdd} onClick={() => emit([{}])}>+ Thêm mục đầu tiên</button>
      ) : (
        <div className={styles.kvList}>
          {items.map((item, idx) => {
            const keys = Object.keys(item);
            return (
              <div key={idx} className={styles.kvRow}>
                <input className={styles.kvInput} placeholder="Tên" value={item[keys[0] || "label"] || ""}
                  onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], [keys[0] || "label"]: e.target.value }; emit(next); }} />
                <input className={styles.kvInput} placeholder="Giá trị" value={item[keys[1] || "href"] || ""}
                  onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], [keys[1] || "href"]: e.target.value }; emit(next); }} />
                <button type="button" className={styles.kvRemove} onClick={() => emit(items.filter((_, i) => i !== idx))}>✕</button>
              </div>
            );
          })}
          <button type="button" className={styles.kvAdd} onClick={() => emit([...items, {}])}>+ Thêm mục</button>
        </div>
      )}
    </div>
  );
}
