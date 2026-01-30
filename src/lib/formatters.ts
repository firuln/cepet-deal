/**
 * Shared formatter utilities for consistent formatting across the application
 */

/**
 * Format price to Indonesian Rupiah currency
 * @param price - Price in number
 * @param options - Intl.NumberFormat options
 * @returns Formatted price string (e.g., "Rp 250.000.000")
 */
export function formatPrice(
  price: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(price)
}

/**
 * Format date to Indonesian locale
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string (e.g., "29 Januari 2026")
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', options)
}

/**
 * Format short date (e.g., "29 Jan 2026")
 * @param dateString - ISO date string
 * @returns Formatted short date string
 */
export function formatShortDate(dateString: string): string {
  return formatDate(dateString, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format relative time (e.g., "2 hari yang lalu")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) return 'baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 30) return `${diffDays} hari yang lalu`
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`
  return `${diffYears} tahun yang lalu`
}

/**
 * Format mileage to Indonesian format
 * @param mileage - Mileage in km
 * @returns Formatted mileage string (e.g., "50.000 km")
 */
export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('id-ID')} km`
}

/**
 * Calculate estimated read time for article content
 * @param content - Article content string
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Read time string (e.g., "5 min baca")
 */
export function calculateReadTime(
  content: string,
  wordsPerMinute: number = 200
): string {
  const wordCount = content?.split(/\s+/).length || 0
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  return `${minutes} min baca`
}

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @returns Formatted number string (e.g., "10.000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID')
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Format car specification
 * @param value - Specification value
 * @param unit - Unit suffix
 * @returns Formatted specification string
 */
export function formatSpec(value: number | string, unit: string = ''): string {
  return `${value}${unit ? ` ${unit}` : ''}`
}
