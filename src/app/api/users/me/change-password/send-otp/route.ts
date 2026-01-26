import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/users/me/change-password/send-otp
 * Send OTP via WhatsApp for password change (when user forgot password but is logged in)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.phone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp belum terdaftar. Silakan tambahkan nomor WhatsApp terlebih dahulu.' },
                { status: 400 }
            )
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
        const otpResult = await sendOTP(user.phone, otpCode, 'CepetDeal')

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
            message: 'OTP dikirim ke WhatsApp Anda',
            // Include dummy OTP if in dummy mode
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
            phone: user.phone, // Mask the phone for security
        })

    } catch (error: any) {
        console.error('Error sending OTP for password change:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim OTP' },
            { status: 500 }
        )
    }
}
