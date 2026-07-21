import styles from './SiteFooter.module.scss';

const FOOTER_NAV_TOP = [
  { label: 'SẢN PHẨM', href: '/san-pham' },
  { label: 'KHOÁ HỌC', href: '/khoa-hoc' },
  { label: 'PRESETS & LUTS', href: '/cong-cu' },
  { label: 'LIÊN HỆ', href: 'https://www.messenger.com/t/137051212834178/' },
];

const SOCIALS = [
  { name: 'Youtube', href: 'https://www.youtube.com/@MinhTravel96' },
  { name: 'Instagram', href: 'https://instagram.com/minhtravel' },
  { name: 'TikTok', href: 'https://tiktok.com/@minhtravel' },
  { name: 'Facebook', href: 'https://facebook.com/MinhTravel11' },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topBar} />

      <nav className={styles.navRow}>
        {FOOTER_NAV_TOP.map((link) => (
          <a key={link.label} href={link.href} className={styles.navLink}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className={styles.divider} />

      <div className={styles.bottomGrid}>
        <nav className={styles.socialCol}>
          {SOCIALS.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              {s.name}
            </a>
          ))}
        </nav>

        <a href="/" className={styles.logoCol}>
          <img
            src="https://minhtravel.vn/wp-content/uploads/2023/12/logo-size-to-1-100x30.png"
            alt="Minh Travel"
            className={styles.logoImg}
          />
        </a>

        <div className={styles.contactCol}>
          <a href="mailto:congminh1196@gmail.com" className={styles.emailLink}>
            congminh1196@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
