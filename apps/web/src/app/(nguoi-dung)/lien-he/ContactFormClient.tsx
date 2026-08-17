"use client";

import { Breadcrumbs, Button, Section } from "@workspace/ui";
import { useState } from "react";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface ContactFormProps {
  settings: {
    infoTitle: string;
    address: string;
    contactEmail: string;
    phone: string;
    hours: string;
    successTitle: string;
    successText: string;
  };
}

export function ContactFormClient({ settings }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <h2 className={styles.successTitle}>{settings.successTitle}</h2>
        <p className={styles.successText}>{settings.successText}</p>
      </Section>
    );
  }

  return (
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
          <h3 className={styles.infoTitle}>{settings.infoTitle}</h3>
          {settings.address && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📍</span>
              <span>{settings.address}</span>
            </div>
          )}
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📧</span>
            <span>{settings.contactEmail}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📞</span>
            <span>{settings.phone}</span>
          </div>
          {settings.hours && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🕐</span>
              <span>{settings.hours}</span>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
