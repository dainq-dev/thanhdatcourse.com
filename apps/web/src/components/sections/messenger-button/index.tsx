import styles from "./index.module.scss";

interface Props { settings: Record<string, string> }

export function MessengerButton({ settings }: Props) {
  return (
    <a
      href={settings.messenger_url || "https://m.me/minhtravel11/"}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.messenger}
      aria-label={settings.messenger_aria_label || "Chat qua Messenger"}
      title={settings.messenger_title || "Chat với Minh Travel"}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.36 5.5 3.42 7.18V22l3.26-1.82c1.03.29 2.14.45 3.32.45 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.03 13.2l-2.55-2.67-4.95 2.67L11 9.55l2.62 2.67 4.88-2.67L13.03 15.2z" />
      </svg>
    </a>
  );
}
