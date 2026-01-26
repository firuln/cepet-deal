import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/auth/resend-otp
 * Resend OTP to WhatsApp
 */
export async function POST(req: Request) {
    try {
        const { phone } = await req.json()

        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Find user by phone (use findFirst because phone is not unique)
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak terdaftar' },
                { status: 404 }
            )
        }

        // Check if can resend (existing OTP must be expired or close to expiry)
        if (user.otpExpiresAt && !isOTPExpired(user.otpExpiresAt)) {
            const remainingSeconds = Math.floor(
                (user.otpExpiresAt.getTime() - Date.now()) / 1000
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
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode,
                otpExpiresAt,
                otpAttempts: 0, // Reset attempts on resend
            }
        })

        // Send OTP via Fonnte (or dummy mode in development)
        const otpResult = await sendOTP(formattedPhone, otpCode, 'CepetDeal')

        return NextResponse.json({
            success: true,
            message: otpResult.message,
            // Include dummy OTP if in dummy mode (development or Fonnte not configured)
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error resending OTP:', error)
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
        })

        // Handle Prisma-specific errors
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak terdaftar' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                error: error?.message || 'Gagal mengirim ulang OTP',
                debug: process.env.NODE_ENV === 'development' ? error?.message : undefined,
            },
            { status: 500 }
        )
    }
}
