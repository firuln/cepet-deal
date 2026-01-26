import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { isOTPExpired } from '@/lib/otp'

/**
 * POST /api/users/me/change-password/verify-otp
 * Verify OTP and change password (for when user forgot password but is logged in)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { otp, newPassword } = await req.json()

        if (!otp || !newPassword) {
            return NextResponse.json(
                { error: 'OTP dan password baru wajib diisi' },
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

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password minimal 8 karakter' },
                { status: 400 }
            )
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                {
                    error: 'Password harus mengandung huruf kapital, huruf kecil, dan angka'
                },
                { status: 400 }
            )
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password and clear OTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otpCode: null,
                otpExpiresAt: null,
                otpAttempts: 0,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diubah',
        })

    } catch (error: any) {
        console.error('Error verifying OTP for password change:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal memverifikasi OTP' },
            { status: 500 }
        )
    }
}
