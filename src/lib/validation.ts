/**
 * Validate WhatsApp Indonesian number format
 * @param phone - Phone number to validate
 * @returns true if valid Indonesia WhatsApp number
 */
export function validateWhatsApp(phone: string): boolean {
  if (!phone) return false

  // Remove all non-numeric characters
  const cleaned = phone.replace(/[^\d]/g, '')

  // Check if it starts with Indonesia country code
  // Valid formats: 62XXXXXXXXX or 08XXXXXXXXX
  const hasValidPrefix = cleaned.startsWith('62') || cleaned.startsWith('08')

  // Check length: 11-13 digits (08xxxxxxxxx = 11-12 digit, 62xxxxxxxxx = 11-13 digit)
  const hasValidLength = cleaned.length >= 11 && cleaned.length <= 13

  return hasValidPrefix && hasValidLength
}

/**
 * Format phone number to WhatsApp format
 * @param phone - Phone number (can be 08... or 62... or +62...)
 * @returns Formatted WhatsApp number (+62...)
 */
export function formatWhatsApp(phone: string): string {
  if (!phone) return ''

  // Remove all non-numeric characters
  let cleaned = phone.replace(/[^\d]/g, '')

  // If starts with 08, convert to 628
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1)
  }

  // Add + prefix
  return '+' + cleaned
}

/**
 * Mask phone number for display
 * @param phone - Phone number
 * @returns Masked phone number (e.g., +62****5678)
 */
export function maskPhone(phone: string): string {
  if (!phone) return ''

  const formatted = formatWhatsApp(phone)

  if (formatted.length > 8) {
    return formatted.substring(0, 4) + '****' + formatted.substring(formatted.length - 4)
  }

  return formatted
}
