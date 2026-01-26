import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/dealers/apply-public/resend
 * Resend OTP for dealer application
 */
export async function POST(req: Request) {
    try {
        const { applicationId } = await req.json()

        if (!applicationId) {
            return NextResponse.json(
                { error: 'Application ID diperlukan' },
                { status: 400 }
            )
        }

        // Find application by ID
        const application = await prisma.dealerApplication.findUnique({
            where: { id: applicationId }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Aplikasi tidak ditemukan. Silakan submit ulang aplikasi.' },
                { status: 404 }
            )
        }

        // Check if already verified
        if (application.verified) {
            return NextResponse.json(
                { error: 'Aplikasi sudah diverifikasi. Silakan login.' },
                { status: 400 }
            )
        }

        // Check if expired
        if (application.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Aplikasi sudah kadaluarsa. Silakan submit ulang aplikasi.' },
                { status: 400 }
            )
        }

        // Check if can resend (existing OTP must be expired or close to expiry)
        if (application.otpExpiresAt && !isOTPExpired(application.otpExpiresAt)) {
            const remainingSeconds = Math.floor(
                (application.otpExpiresAt.getTime() - Date.now()) / 1000
            )
            if (remainingSeconds > 30) {
                // Wait at least 30 seconds before resending
                return NextResponse.json(
                    { error: `Tunggu ${Math.ceil(remainingSeconds / 60)} menit sebelum kirim ulang` },
                    { status: 429 }
                )
            }
        }

        // Generate new OTP
        const otpCode = generateOTP()
        const otpExpiresAt = generateOTPExpiry()

        // Update OTP in database
        await prisma.dealerApplication.update({
            where: { id: applicationId },
            data: {
                otpCode,
                otpExpiresAt,
            }
        })

        // Send OTP via Fonnte (or dummy mode in development)
        const otpResult = await sendOTP(application.phone, otpCode, 'CepetDeal')

        return NextResponse.json({
            success: true,
            message: otpResult.message,
            // Include dummy OTP if in dummy mode (development or Fonnte not configured)
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error resending OTP for dealer application:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim ulang OTP' },
            { status: 500 }
        )
    }
}
