// ── Merge CSS Module classes (thay thế cn()/tailwind-merge) ──
export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Currency formatter (VND) ──
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// ── Simple number formatter (không dấu tiền tệ) ──
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

// ── Date formatter (Long format: "19 tháng 7, 2026") ──
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// ── Read time formatter ──
export function formatReadTime(minutes: number): string {
  return `${minutes} phút đọc`;
}
