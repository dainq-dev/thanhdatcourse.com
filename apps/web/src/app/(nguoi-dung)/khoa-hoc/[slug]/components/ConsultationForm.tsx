"use client";

import { type FormEvent, useState } from "react";
import { api } from "@/lib/api";
import styles from "./ConsultationForm.module.scss";

interface ConsultationFormProps {
  courseId: string;
  courseTitle: string;
}

export function ConsultationForm({
  courseId,
  courseTitle,
}: ConsultationFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const body: Record<string, string> = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        courseId,
      };
      if (email.trim()) body.customerEmail = email.trim();
      if (message.trim()) body.message = message.trim();

      await api.submit("/api/leads", body);

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Có lỗi xảy ra, vui lòng thử lại sau");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Đăng ký tư vấn</h2>
        <p className={styles.subtitle}>
          Để lại thông tin, chúng tôi sẽ liên hệ tư vấn về khóa học này
        </p>

        {success ? (
          <div className={styles.successMsg}>
            <p>
              Cảm ơn bạn đã đăng ký tư vấn khóa học{" "}
              <strong>{courseTitle}</strong>!
            </p>
            <p className={styles.successSub}>
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.field}>
              <label className={styles.label}>
                Họ và tên <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên của bạn"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email (không bắt buộc)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lời nhắn</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bạn cần tư vấn thêm gì?"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi đăng ký tư vấn"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
