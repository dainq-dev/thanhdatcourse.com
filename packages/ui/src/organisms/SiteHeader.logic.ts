import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Khoá học", href: "/khoa-hoc" },
  { label: "SẢN PHẨM", href: "/san-pham" },
  { label: "PRESETS & LUTS", href: "/cong-cu" },
  { label: "BLOG", href: "/bai-viet" },
] as const;

const LMS_URL = "https://hoc.minhtravel.vn/courses/";

export interface SiteHeaderState {
  navItems: typeof NAV_ITEMS;
  lmsUrl: string;
  pathname: string;
  mobileOpen: boolean;
  scrolled: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export function useSiteHeader(): SiteHeaderState {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return {
    navItems: NAV_ITEMS,
    lmsUrl: LMS_URL,
    pathname,
    mobileOpen,
    scrolled,
    toggleMobile,
    closeMobile,
  };
}
