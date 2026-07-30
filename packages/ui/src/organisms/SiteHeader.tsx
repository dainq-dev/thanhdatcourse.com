"use client";

import { useSiteHeader } from "./SiteHeader.logic";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  const {
    navItems,
    lmsUrl,
    pathname,
    mobileOpen,
    scrolled,
    closeMobile,
    toggleMobile,
  } = useSiteHeader();

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <img
            src="https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png"
            alt="Minh Travel"
            className={styles.logoImg}
          />
        </a>

        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
              onClick={closeMobile}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            href={lmsUrl}
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            VÀO HỌC
          </a>
          <button
            type="button"
            className={styles.hamburger}
            onClick={toggleMobile}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
