import crypto from 'crypto'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 5
const MAX_OTP_ATTEMPTS = 3

/**
 * Generate 6-digit OTP code
 */
export function generateOTP(): string {
  const otp = crypto.randomInt(0, 1000000).toString().padStart(OTP_LENGTH, '0')
  return otp.substring(0, OTP_LENGTH)
}

/**
 * Generate OTP expiry time (5 minutes from now)
 */
export function generateOTPExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(otpExpiresAt: Date | null): boolean {
  if (!otpExpiresAt) return true
  return new Date() > otpExpiresAt
}

/**
 * Increment OTP attempts and check if max attempts reached
 */
export function shouldBlockOTPAttempts(attempts: number): boolean {
  return attempts >= MAX_OTP_ATTEMPTS
}

/**
 * Get remaining time in seconds before OTP expires
 */
export function getOTPRemainingTime(otpExpiresAt: Date | null): number {
  if (!otpExpiresAt) return 0
  const remaining = otpExpiresAt.getTime() - Date.now()
  return Math.max(0, Math.floor(remaining / 1000))
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

/**
 * Constants
 */
export const OTP_CONFIG = {
  LENGTH: OTP_LENGTH,
  EXPIRY_MINUTES: OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS: MAX_OTP_ATTEMPTS,
} as const
