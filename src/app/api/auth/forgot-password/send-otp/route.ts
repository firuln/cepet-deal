import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/auth/forgot-password/send-otp
 * Send OTP via WhatsApp for password reset
 */
export async function POST(req: Request) {
    try {
        const { phone } = await req.json()

        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        if (!user) {
            // Always return success for security (don't reveal if phone exists)
            return NextResponse.json({
                success: true,
                message: 'Jika nomor terdaftar, OTP telah dikirim.',
            })
        }

        // Check if there's an existing pending OTP
        if (user.otpExpiresAt && !isOTPExpired(user.otpExpiresAt)) {
            const remainingTime = Math.ceil(
                (user.otpExpiresAt.getTime() - Date.now()) / 1000 / 60
            )
            return NextResponse.json(
                { error: `Tunggu ${remainingTime} menit sebelum meminta OTP baru` },
                { status: 429 }
            )
        }

        // Generate OTP
        const otpCode = generateOTP()
        const otpExpiresAt = generateOTPExpiry()

        // Send OTP via Fonnte
        const otpResult = await sendOTP(formattedPhone, otpCode, 'CepetDeal')

        // Save OTP to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode,
                otpExpiresAt,
                otpAttempts: 0,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'OTP dikirim ke WhatsApp',
            // Include dummy OTP if in dummy mode
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error sending OTP for password reset:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim OTP' },
            { status: 500 }
        )
    }
}
