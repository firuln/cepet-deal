import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/users/me/change-phone/send-otp
 * Send OTP to NEW phone number for phone change verification
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { phone } = await req.json()

        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if new phone is same as current phone
        if (user.phone === formattedPhone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp baru tidak boleh sama dengan nomor saat ini' },
                { status: 400 }
            )
        }

        // Check if phone is already taken by another user
        const existingPhoneUser = await prisma.user.findFirst({
            where: {
                phone: formattedPhone,
                NOT: { id: user.id }
            }
        })

        if (existingPhoneUser) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah digunakan oleh user lain' },
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

        // Send OTP via Fonnte to NEW phone number
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

        // Store new phone temporarily in session (will be updated after verification)
        // We'll use a separate approach - verify endpoint will receive the new phone number

        return NextResponse.json({
            success: true,
            message: 'OTP dikirim ke nomor WhatsApp baru',
            // Include dummy OTP if in dummy mode
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
            newPhone: formattedPhone, // Return for frontend reference
        })

    } catch (error: any) {
        console.error('Error sending OTP for phone change:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim OTP' },
            { status: 500 }
        )
    }
}
