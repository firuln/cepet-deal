import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generateOTPExpiry, isOTPExpired, shouldBlockOTPAttempts } from '@/lib/otp'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/auth/send-otp
 * Send OTP to WhatsApp (dummy implementation)
 */
export async function POST(req: Request) {
    try {
        const { phone, name, role, sellerReason } = await req.json()

        // Validate phone
        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx' },
                { status: 400 }
            )
        }

        // Validate name
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nama minimal 2 karakter' },
                { status: 400 }
            )
        }

        // Validate role
        const validRoles = ['BUYER', 'SELLER']
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Role tidak valid' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)

        // Check if user already exists with this phone (use findFirst because phone is not unique)
        const existingUser = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        // If user exists and is already DEALER, return error
        if (existingUser && existingUser.role === 'DEALER') {
            return NextResponse.json(
                { error: 'Nomor WhatsApp ini sudah terdaftar sebagai dealer' },
                { status: 400 }
            )
        }

        // Check if there's an existing pending OTP (rate limiting)
        if (existingUser && existingUser.otpCode && !isOTPExpired(existingUser.otpExpiresAt)) {
            const remainingTime = Math.ceil(
                (existingUser.otpExpiresAt!.getTime() - Date.now()) / 1000 / 60
            )
            return NextResponse.json(
                { error: `Tunggu ${remainingTime} menit sebelum meminta OTP baru` },
                { status: 429 } // Too Many Requests
            )
        }

        // Check OTP attempts
        if (existingUser && shouldBlockOTPAttempts(existingUser.otpAttempts)) {
            return NextResponse.json(
                { error: 'Terlalu banyak percobaan OTP. Coba lagi nanti.' },
                { status: 429 }
            )
        }

        // Generate OTP
        const otpCode = generateOTP()
        const otpExpiresAt = generateOTPExpiry()

        // Save/update OTP to database using transaction to handle race conditions
        await prisma.$transaction(async (tx) => {
            if (existingUser) {
                // Update existing user's OTP
                await tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        otpCode,
                        otpExpiresAt,
                        // Handle NULL otpAttempts by setting to 1 if NULL, otherwise increment
                        otpAttempts: (existingUser.otpAttempts ?? 0) + 1,
                    }
                })
            } else {
                // Create new user
                await tx.user.create({
                    data: {
                        name: name.trim(),
                        phone: formattedPhone,
                        phoneVerified: false,
                        role: role,
                        otpCode,
                        otpExpiresAt,
                        otpAttempts: 0,
                    }
                })
            }
        })

        // Send OTP via Fonnte (or dummy mode in development)
        const otpResult = await sendOTP(formattedPhone, otpCode, 'CepetDeal')

        return NextResponse.json({
            success: true,
            message: otpResult.message,
            // Include dummy OTP if in dummy mode (development or Fonnte not configured)
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error sending OTP:', error)
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
                { error: 'Data tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                error: error?.message || 'Gagal mengirim OTP',
                debug: process.env.NODE_ENV === 'development' ? error?.message : undefined,
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/auth/send-otp
 * Check OTP status
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const phone = searchParams.get('phone')

        if (!phone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp diperlukan' },
                { status: 400 }
            )
        }

        const formattedPhone = formatWhatsApp(phone)
        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone },
            select: {
                otpExpiresAt: true,
                otpAttempts: true,
            }
        })

        if (!user) {
            return NextResponse.json({
                canSend: true,
                hasPendingOTP: false,
            })
        }

        return NextResponse.json({
            canSend: !user.otpExpiresAt || new Date() > user.otpExpiresAt,
            hasPendingOTP: !!user.otpExpiresAt && new Date() < user.otpExpiresAt,
        })

    } catch (error: any) {
        console.error('Error checking OTP status:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengecek status OTP' },
            { status: 500 }
        )
    }
}
