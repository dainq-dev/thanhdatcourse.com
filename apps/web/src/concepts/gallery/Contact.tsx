import { PageHeader } from "@workspace/ui";
import { ContactFormClient } from "@/app/(nguoi-dung)/lien-he/ContactFormClient";
import type { ContactProps } from "../types";

export function Contact({ settings }: ContactProps) {
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
  const successText =
    settings.contact_success_text ||
    "Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.";

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSub} />
      <ContactFormClient
        settings={{
          infoTitle,
          address,
          contactEmail,
          phone,
          hours,
          successTitle,
          successText,
        }}
      />
    </>
  );
}
