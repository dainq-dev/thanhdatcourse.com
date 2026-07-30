"use client";

import { Breadcrumbs, Button, PageHeader, Section } from "@workspace/ui";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  interface SettingRow {
    key: string;
    value: string;
  }

  useEffect(() => {
    api
      .publicGet<SettingRow[]>("/api/settings")
      .then((rows) => {
        const m: Record<string, string> = {};
        for (const r of rows) {
          m[r.key] = r.value;
        }
        setSettings(m);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    try {
      await api.submit("/api/leads", {
        customerName: data.get("name"),
        customerEmail: data.get("email"),
        customerPhone: data.get("phone") || "Chưa cung cấp",
        message: data.get("message"),
      });
      setSubmitted(true);
    } catch {
      setError("Gửi không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Section className={styles.success}>
        <div className={styles.successIcon}>✅</div>
        <h2 className={styles.successTitle}>
          {settings.contact_success_title || "Cảm ơn bạn!"}
        </h2>
        <p className={styles.successText}>
          {settings.contact_success_text ||
            "Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất."}
        </p>
      </Section>
    );
  }

  const infoTitle = settings.contact_info_title || "Thông tin liên hệ";
  const address = settings.contact_address || "";
  const contactEmail = settings.contact_email || "contact@minhtravel.vn";
  const phone = settings.contact_phone || "0900 123 456";
  const hours = settings.contact_hours || "";
  const pageTitle = settings.contact_page_title || "Liên hệ";
  const pageSub =
    settings.contact_page_subtitle ||
    "Bạn có câu hỏi hoặc cần tư vấn? Hãy để lại lời nhắn.";

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSub} />
      <Section bg="muted">
        <Breadcrumbs
          items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
        />
        <div className={styles.grid}>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="name">
                Họ và tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.input}
                required
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                required
                placeholder="example@email.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="phone">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={styles.input}
                placeholder="09xx xxx xxx"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="message">
                Lời nhắn
              </label>
              <textarea
                id="message"
                name="message"
                className={styles.textarea}
                required
                placeholder="Nội dung bạn muốn trao đổi..."
                rows={5}
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi lời nhắn"}
            </Button>
          </form>
          <div className={styles.info}>
            <h3 className={styles.infoTitle}>{infoTitle}</h3>
            {address && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <span>{address}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📧</span>
              <span>{contactEmail}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📞</span>
              <span>{phone}</span>
            </div>
            {hours && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕐</span>
                <span>{hours}</span>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
