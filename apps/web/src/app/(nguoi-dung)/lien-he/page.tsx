import { PageHeader } from "@workspace/ui";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { ContactFormClient } from "./ContactFormClient";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với Minh Travel để được tư vấn về khóa học, presets, LUTs.",
  openGraph: {
    title: "Liên hệ — Minh Travel",
    description: "Liên hệ với Minh Travel để được tư vấn về khóa học, presets, LUTs.",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const infoTitle = settings.contact_info_title || "Thông tin liên hệ";
  const address = settings.contact_address || "";
  const contactEmail = settings.contact_email || "contact@minhtravel.vn";
  const phone = settings.contact_phone || "0900 123 456";
  const hours = settings.contact_hours || "";
  const pageTitle = settings.contact_page_title || "Liên hệ";
  const pageSub =
    settings.contact_page_subtitle ||
    "Bạn có câu hỏi hoặc cần tư vấn? Hãy để lại lời nhắn.";

  const successTitle = settings.contact_success_title || "Cảm ơn bạn!";
  const successText = settings.contact_success_text || "Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.";

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSub} />
      <ContactFormClient
        settings={{ infoTitle, address, contactEmail, phone, hours, successTitle, successText }}
      />
    </>
  );
}
