import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/register
 * Step 1: Create user account (before phone verification)
 */
export async function POST(req: Request) {
    try {
        const { username, email, password, role } = await req.json()

        // Validate username
        if (!username || username.trim().length < 3) {
            return NextResponse.json(
                { error: 'Username minimal 3 karakter' },
                { status: 400 }
            )
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                {
                    error: 'Format username tidak valid',
                    message: 'Username harus 3-20 karakter, hanya huruf, angka, dan underscore'
                },
                { status: 400 }
            )
        }

        // Check if username starts with number
        if (/^\d/.test(username)) {
            return NextResponse.json(
                { error: 'Username tidak boleh dimulai dengan angka' },
                { status: 400 }
            )
        }

        // Validate password
        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: 'Password minimal 8 karakter' },
                { status: 400 }
            )
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                {
                    error: 'Password harus mengandung huruf kapital, huruf kecil, dan angka'
                },
                { status: 400 }
            )
        }

        // Validate email if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Format email tidak valid' },
                    { status: 400 }
                )
            }
        }

        // Validate role
        const validRoles = ['BUYER', 'SELLER']
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Role tidak valid' },
                { status: 400 }
            )
        }

        const trimmedUsername = username.trim()

        // Check if username already exists (case insensitive)
        const existingUsername = await prisma.user.findFirst({
            where: {
                username: {
                    equals: trimmedUsername,
                    mode: 'insensitive'
                }
            }
        })

        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username sudah digunakan' },
                { status: 400 }
            )
        }

        // Check if email already exists (if provided)
        if (email && email.trim()) {
            const existingEmail = await prisma.user.findUnique({
                where: { email: email.trim().toLowerCase() }
            })

            if (existingEmail) {
                return NextResponse.json(
                    { error: 'Email sudah terdaftar' },
                    { status: 400 }
                )
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user with username as default name
        const user = await prisma.user.create({
            data: {
                username: trimmedUsername,
                name: trimmedUsername, // Default name = username
                email: email ? email.trim().toLowerCase() : null,
                password: hashedPassword,
                role: role,
                phoneVerified: false, // Will be verified in step 2
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Akun berhasil dibuat. Silakan verifikasi WhatsApp.',
            userId: user.id,
            username: user.username,
            requiresPhoneVerification: true
        })

    } catch (error: any) {
        console.error('Error creating user:', error)

        // Handle Prisma errors
        if (error?.code === 'P2002') {
            return NextResponse.json(
                { error: 'Username atau email sudah digunakan' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error?.message || 'Gagal membuat akun' },
            { status: 500 }
        )
    }
}
