import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isOTPExpired, shouldBlockOTPAttempts } from '@/lib/otp'
import { formatWhatsApp } from '@/lib/validation'
import { signIn } from 'next-auth/react'

/**
 * POST /api/auth/verify-otp
 * Verify OTP and create/login user
 */
export async function POST(req: Request) {
    try {
        const { phone, code, name, role, sellerReason } = await req.json()

        // Validate inputs
        if (!phone || !code) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp dan kode OTP wajib diisi' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Validate OTP format
        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: 'Format OTP tidak valid (6 digit angka)' },
                { status: 400 }
            )
        }

        // Find user by phone (use findFirst because phone is not unique)
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Data tidak ditemukan. Silakan minta OTP terlebih dahulu.' },
                { status: 404 }
            )
        }

        // Check if OTP expired
        if (!user.otpCode || isOTPExpired(user.otpExpiresAt)) {
            return NextResponse.json(
                { error: 'OTP sudah kadaluars. Silakan minta OTP baru.' },
                { status: 400 }
            )
        }

        // Check if too many attempts (handle NULL value)
        const currentAttempts = user.otpAttempts ?? 0
        if (shouldBlockOTPAttempts(currentAttempts)) {
            return NextResponse.json(
                { error: 'Terlalu banyak percobaan. Silakan minta OTP baru.' },
                { status: 429 }
            )
        }

        // Verify OTP
        if (user.otpCode !== code) {
            // Increment attempts (handle NULL value)
            await prisma.user.update({
                where: { id: user.id },
                data: { otpAttempts: currentAttempts + 1 }
            })

            return NextResponse.json(
                { error: 'OTP tidak valid' },
                { status: 400 }
            )
        }

        // OTP is valid! Clear OTP and verify phone
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                phoneVerified: true,
                otpCode: null,
                otpExpiresAt: null,
                otpAttempts: 0,
                // Update role if specified (for first-time users)
                role: user.role, // Keep existing role
            }
        })

        // Update name and seller reason if provided
        if (name || sellerReason) {
            await prisma.user.update({
                where: { id: updatedUser.id },
                data: {
                    ...(name && { name: name.trim() }),
                }
            })
        }

        // Note: Session creation happens on the client side
        // Return user data for session creation

        return NextResponse.json({
            success: true,
            message: 'OTP berhasil diverifikasi',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                phoneVerified: updatedUser.phoneVerified,
                role: updatedUser.role,
            }
        })

    } catch (error: any) {
        console.error('Error verifying OTP:', error)
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
        })

        // Handle Prisma-specific errors
        if (error?.code === 'P2002') {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah terdaftar' },
                { status: 400 }
            )
        }

        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak terdaftar' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                error: error?.message || 'Gagal memverifikasi OTP',
                debug: process.env.NODE_ENV === 'development' ? error?.message : undefined,
            },
            { status: 500 }
        )
    }
}
