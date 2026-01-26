import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/auth/register/send-otp
 * Step 2a: Send OTP to WhatsApp for registration
 */
export async function POST(req: Request) {
    try {
        const { userId, phone } = await req.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID diperlukan' },
                { status: 400 }
            )
        }

        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx' },
                { status: 400 }
            )
        }

        // Find user by ID
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if user already verified phone
        if (user.phoneVerified) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah diverifikasi' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Check if phone is already used by another user
        const existingPhone = await prisma.user.findFirst({
            where: {
                phone: formattedPhone,
                id: { not: userId }
            }
        })

        if (existingPhone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah terdaftar' },
                { status: 400 }
            )
        }

        // Check if there's an existing pending OTP
        if (user.otpCode && user.otpExpiresAt && !isOTPExpired(user.otpExpiresAt)) {
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

        // Send OTP via Fonnte (or dummy mode)
        const otpResult = await sendOTP(formattedPhone, otpCode, 'CepetDeal')

        // Save OTP to database
        await prisma.user.update({
            where: { id: userId },
            data: {
                otpCode,
                otpExpiresAt,
                otpAttempts: 0
            }
        })

        return NextResponse.json({
            success: true,
            message: otpResult.message,
            phone: formattedPhone,
            // Include dummy OTP if in dummy mode
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error sending OTP for registration:', error)

        // Handle Prisma errors
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim OTP' },
            { status: 500 }
        )
    }
}
