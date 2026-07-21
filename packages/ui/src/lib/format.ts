/**
 * Format a number as VND currency string.
 * e.g. 2999000 → "2.999.000 ₫"
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with Vietnamese locale separators.
 * e.g. 1247 → "1.247"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}
