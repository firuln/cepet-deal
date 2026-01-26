import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isOTPExpired } from '@/lib/otp'
import { formatWhatsApp } from '@/lib/validation'

/**
 * POST /api/auth/register/verify-otp
 * Step 2b: Verify OTP and activate user account
 */
export async function POST(req: Request) {
    try {
        const { userId, otp, phone } = await req.json()

        if (!userId || !otp) {
            return NextResponse.json(
                { error: 'User ID dan kode OTP wajib diisi' },
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

        // Check if already verified
        if (user.phoneVerified) {
            return NextResponse.json(
                { error: 'Akun sudah diverifikasi' },
                { status: 400 }
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
                where: { id: userId },
                data: { otpAttempts: newAttempts }
            })

            // Check if too many attempts (max 3)
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

        // Format phone number
        const formattedPhone = phone ? formatWhatsApp(phone) : null

        // OTP is valid! Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                phone: formattedPhone,
                phoneVerified: true,
                otpCode: null,
                otpExpiresAt: null,
                otpAttempts: 0
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil! Akun Anda telah aktif.',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role
            }
        })

    } catch (error: any) {
        console.error('Error verifying OTP for registration:', error)

        // Handle Prisma errors
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Gagal memverifikasi OTP' },
            { status: 500 }
        )
    }
}
