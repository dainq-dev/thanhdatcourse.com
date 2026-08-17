import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ với Minh Travel để được tư vấn về khóa học, presets, LUTs.",
  openGraph: {
    title: "Liên hệ — Minh Travel",
    description:
      "Liên hệ với Minh Travel để được tư vấn về khóa học, presets, LUTs.",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { module } = getConcept(settings.site_concept);
  const ContactView = module.Contact;

  return <ContactView settings={settings} />;
}
