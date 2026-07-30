import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Minh Travel",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0F19",
        width: "100%"
      }}
    >
      {children}
    </div>
  );
}
