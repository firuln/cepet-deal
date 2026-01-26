import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * POST /api/auth/reset-password
 * Reset password with token (from email or WhatsApp OTP)
 */
export async function POST(req: Request) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token dan password wajib diisi' },
                { status: 400 }
            )
        }

        // Validate password
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password minimal 8 karakter' },
                { status: 400 }
            )
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                {
                    error: 'Password harus mengandung huruf kapital, huruf kecil, dan angka'
                },
                { status: 400 }
            )
        }

        // Find user by reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Link reset tidak valid atau sudah kadaluarsa' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset. Silakan login dengan password baru.',
        })

    } catch (error: any) {
        console.error('Error resetting password:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mereset password' },
            { status: 500 }
        )
    }
}
