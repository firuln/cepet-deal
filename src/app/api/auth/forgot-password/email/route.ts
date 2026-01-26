import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password/email
 * Send reset password link via email
 */
export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email || email.trim().length < 1) {
            return NextResponse.json(
                { error: 'Email wajib diisi' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            )
        }

        const trimmedEmail = email.trim().toLowerCase()

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: trimmedEmail }
        })

        if (!user) {
            // Always return success for security (don't reveal if email exists)
            return NextResponse.json({
                success: true,
                message: 'Jika email terdaftar, link reset password telah dikirim.',
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save reset token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            }
        })

        // TODO: Send email with reset link
        // In production, use nodemailer, SendGrid, or similar service
        // For now, log the reset link (development only)
        const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&method=email`

        console.log('=== PASSWORD RESET LINK (EMAIL) ===')
        console.log('Email:', trimmedEmail)
        console.log('Reset Link:', resetLink)
        console.log('Expires At:', resetTokenExpiry)
        console.log('====================================')

        // Always return success for security
        return NextResponse.json({
            success: true,
            message: 'Jika email terdaftar, link reset password telah dikirim.',
            // Include reset link in development
            ...(process.env.NODE_ENV === 'development' && { resetLink }),
        })

    } catch (error: any) {
        console.error('Error sending reset email:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim email reset' },
            { status: 500 }
        )
    }
}
