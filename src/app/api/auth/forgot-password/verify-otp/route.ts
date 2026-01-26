import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatWhatsApp } from '@/lib/validation'
import { isOTPExpired } from '@/lib/otp'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password/verify-otp
 * Verify OTP and generate reset token for password reset
 */
export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json()

        if (!phone || !otp) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp dan kode OTP wajib diisi' },
                { status: 400 }
            )
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { error: 'Format OTP tidak valid (6 digit angka)' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak terdaftar' },
                { status: 404 }
            )
        }

        // Check if OTP expired
        if (!user.otpCode || isOTPExpired(user.otpExpiresAt)) {
            return NextResponse.json(
                { error: 'OTP sudah kadaluarsa. Silakan minta OTP baru.' },
                { status: 400 }
            )
        }

        // Verify OTP
        if (user.otpCode !== otp) {
            // Increment attempts
            const newAttempts = (user.otpAttempts ?? 0) + 1
            await prisma.user.update({
                where: { id: user.id },
                data: { otpAttempts: newAttempts }
            })

            // Check if too many attempts
            if (newAttempts >= 3) {
                return NextResponse.json(
                    { error: 'Terlalu banyak percobaan. Silakan minta OTP baru.' },
                    { status: 429 }
                )
            }

            return NextResponse.json(
                { error: 'OTP tidak valid' },
                { status: 400 }
            )
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save reset token and clear OTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
                otpCode: null,
                otpExpiresAt: null,
                otpAttempts: 0,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'OTP berhasil diverifikasi. Silakan reset password.',
            resetToken,
            expiresAt: resetTokenExpiry.toISOString(),
        })

    } catch (error: any) {
        console.error('Error verifying OTP for password reset:', error)

        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak terdaftar' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Gagal memverifikasi OTP' },
            { status: 500 }
        )
    }
}
