import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isOTPExpired } from '@/lib/otp'

/**
 * POST /api/dealers/apply-public/verify
 * Verify OTP and create user + dealer records
 */
export async function POST(req: Request) {
    try {
        const { applicationId, code } = await req.json()

        // Validate inputs
        if (!applicationId || !code) {
            return NextResponse.json(
                { error: 'Application ID dan kode OTP wajib diisi' },
                { status: 400 }
            )
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: 'Format OTP tidak valid (6 digit angka)' },
                { status: 400 }
            )
        }

        // Find application by ID
        const application = await prisma.dealerApplication.findUnique({
            where: { id: applicationId }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Aplikasi tidak ditemukan. Silakan submit ulang aplikasi.' },
                { status: 404 }
            )
        }

        // Check if already verified
        if (application.verified) {
            return NextResponse.json(
                { error: 'Aplikasi sudah diverifikasi. Silakan login.' },
                { status: 400 }
            )
        }

        // Check if expired
        if (application.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Aplikasi sudah kadaluarsa. Silakan submit ulang aplikasi.' },
                { status: 400 }
            )
        }

        // Check if OTP expired
        if (!application.otpCode || isOTPExpired(application.otpExpiresAt)) {
            return NextResponse.json(
                { error: 'OTP sudah kadaluarsa. Silakan minta OTP baru.' },
                { status: 400 }
            )
        }

        // Verify OTP
        if (application.otpCode !== code) {
            return NextResponse.json(
                { error: 'OTP tidak valid' },
                { status: 400 }
            )
        }

        // Check if user already exists (shouldn't happen due to checks in submit)
        const existingUser = await prisma.user.findUnique({
            where: { phone: application.phone }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah terdaftar. Silakan login.' },
                { status: 400 }
            )
        }

        // Create User with DEALER role
        const user = await prisma.user.create({
            data: {
                name: application.name,
                phone: application.phone,
                email: application.email,
                phoneVerified: true,
                role: 'DEALER',
                // No password set - user can set it later or login via OTP
            }
        })

        // Create Dealer record
        const dealer = await prisma.dealer.create({
            data: {
                userId: user.id,
                companyName: application.companyName,
                address: application.address,
                city: application.city,
                description: application.description,
                logo: application.logo,
                documents: application.documents,
                verified: false, // Requires admin verification
            }
        })

        // Mark application as verified
        await prisma.dealerApplication.update({
            where: { id: applicationId },
            data: { verified: true }
        })

        return NextResponse.json({
            success: true,
            message: 'Aplikasi dealer berhasil diverifikasi',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                role: user.role,
            },
            dealer: {
                id: dealer.id,
                companyName: dealer.companyName,
                verified: dealer.verified,
            }
        })

    } catch (error: any) {
        console.error('Error verifying dealer application:', error)

        // Handle Prisma errors
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Aplikasi tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Gagal memverifikasi aplikasi dealer' },
            { status: 500 }
        )
    }
}
