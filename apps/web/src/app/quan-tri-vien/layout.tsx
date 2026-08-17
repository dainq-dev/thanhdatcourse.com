"use client";

import "@workspace/ui/styles/admin-global.scss";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import styles from "./layout.module.scss";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const SIDEBAR_ITEMS = [
  { label: "Bảng điều khiển", href: "/quan-tri-vien" },
  { label: "Cấu hình trang", href: "/quan-tri-vien/cai-dat" },
  { label: "Quản lý khóa học", href: "/quan-tri-vien/khoa-hoc" },
  { label: "Quản lý bài viết", href: "/quan-tri-vien/bai-viet" },
  { label: "Dự án thực hiện", href: "/quan-tri-vien/du-an" },
  { label: "Khách hàng tiềm năng", href: "/quan-tri-vien/khach-hang" },
  { label: "Chương trình khuyến mãi", href: "/quan-tri-vien/khuyen-mai" },
  { label: "Thư viện ảnh & video", href: "/quan-tri-vien/media" },
  { label: "Presets & LUTs", href: "/quan-tri-vien/presets-luts" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(
        `/xac-thuc/dang-nhap?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    api
      .get<User>("/api/auth/me")
      .then((data) => {
        if (data.role !== "ADMIN") {
          localStorage.removeItem("token");
          router.replace("/xac-thuc/dang-nhap");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        router.replace("/xac-thuc/dang-nhap");
      })
      .finally(() => setLoading(false));
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/xac-thuc/dang-nhap");
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <Link
          href="/quan-tri-vien"
          className={styles.logo}
          onClick={() => setSidebarOpen(false)}
        >
          <span className={styles.logoIcon}>MT</span>
          <span>Minh Travel</span>
        </Link>
        <nav className={styles.nav}>
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ||
                (
                  item.href !== "/quan-tri-vien" &&
                    pathname.startsWith(item.href)
                )
                  ? styles.active
                  : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}
