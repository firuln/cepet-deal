import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/register/check-username
 * Check if username is available
 */
export async function POST(req: Request) {
    try {
        const { username } = await req.json()

        if (!username) {
            return NextResponse.json(
                { error: 'Username diperlukan' },
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

        // Check if username already exists (case insensitive)
        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: 'insensitive'
                }
            }
        })

        if (existingUser) {
            return NextResponse.json({
                available: false,
                message: 'Username sudah digunakan'
            })
        }

        return NextResponse.json({
            available: true,
            message: 'Username tersedia'
        })

    } catch (error: any) {
        console.error('Error checking username:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengecek username' },
            { status: 500 }
        )
    }
}
