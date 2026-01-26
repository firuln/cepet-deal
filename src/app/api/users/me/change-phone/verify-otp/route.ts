import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isOTPExpired } from '@/lib/otp'

/**
 * POST /api/users/me/change-phone/verify-otp
 * Verify OTP and update phone number
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { otp, newPhone } = await req.json()

        if (!otp || !newPhone) {
            return NextResponse.json(
                { error: 'OTP dan nomor WhatsApp baru wajib diisi' },
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

        // Update phone number and clear OTP
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                phone: newPhone,
                phoneVerified: true,
                otpCode: null,
                otpExpiresAt: null,
                otpAttempts: 0,
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                phone: true,
                location: true,
                bio: true,
                avatar: true,
                role: true,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Nomor WhatsApp berhasil diubah',
            user: updatedUser,
        })

    } catch (error: any) {
        console.error('Error verifying OTP for phone change:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal memverifikasi OTP' },
            { status: 500 }
        )
    }
}
