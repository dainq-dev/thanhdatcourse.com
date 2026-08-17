import type { Metadata } from "next";
import { Kolker_Brush, Manrope } from "next/font/google";
import "@workspace/ui/styles/global.scss";
const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
});
const kolkerBrush = Kolker_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kolker-brush",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0F19",
};

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
    <html lang="vi" className={`${manrope.variable} ${kolkerBrush.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Minh Travel",
              "url": "https://minhtravel.vn",
              "logo": "https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png",
              "description": "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel. Khóa học từ cơ bản đến nâng cao, presets & LUTs độc quyền.",
              "sameAs": [
                "https://www.youtube.com/@MinhTravel96",
                "https://www.tiktok.com/@minhtravel",
                "https://www.facebook.com/minhtravel11",
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
