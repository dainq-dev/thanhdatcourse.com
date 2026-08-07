import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@workspace/ui/styles/global.scss";
import "@workspace/ui/styles/admin-global.scss";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
    template: "%s | Minh Travel",
  },
  description:
    "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel. Khóa học từ cơ bản đến nâng cao, presets & LUTs độc quyền.",
  keywords: [
    "quay dựng",
    "chỉnh màu",
    "khóa học quay phim",
    "Minh Travel",
    "preset",
    "LUT",
  ],
  metadataBase: new URL("https://minhtravel.vn"),
  openGraph: {
    title: "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
    description: "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel.",
    type: "website",
    locale: "vi_VN",
  },
  other: {
    "theme-color": "#0B0F19",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Minh Travel",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={manrope.variable} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kolker+Brush&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
