import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xem trước bài viết",
  robots: { index: false, follow: false },
};

export default function XemTruocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
