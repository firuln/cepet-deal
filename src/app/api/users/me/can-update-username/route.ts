import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/users/me/can-update-username
 * Check if user can update username (30-day cooldown)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                username: true,
                usernameUpdatedAt: true,
                createdAt: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // If user never had a username, they can set it
        if (!user.username) {
            return NextResponse.json({
                canUpdate: true,
                hasUsername: false,
                message: 'Anda belum memiliki username. Silakan buat username sekarang.'
            })
        }

        // If user never updated username, use createdAt as reference
        const lastUpdateDate = user.usernameUpdatedAt || user.createdAt
        const now = new Date()
        const daysSinceLastUpdate = Math.floor(
            (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        const COOLDOWN_DAYS = 30

        if (daysSinceLastUpdate >= COOLDOWN_DAYS) {
            return NextResponse.json({
                canUpdate: true,
                hasUsername: true,
                currentUsername: user.username,
                lastUpdated: lastUpdateDate.toISOString(),
                daysSinceLastUpdate,
                message: 'Anda dapat mengubah username sekarang.'
            })
        }

        const remainingDays = COOLDOWN_DAYS - daysSinceLastUpdate
        const nextUpdateDate = new Date(lastUpdateDate)
        nextUpdateDate.setDate(nextUpdateDate.getDate() + COOLDOWN_DAYS)

        return NextResponse.json({
            canUpdate: false,
            hasUsername: true,
            currentUsername: user.username,
            lastUpdated: lastUpdateDate.toISOString(),
            daysSinceLastUpdate,
            remainingDays,
            nextUpdateDate: nextUpdateDate.toISOString(),
            message: `Username dapat diubah lagi dalam ${remainingDays} hari.`
        })

    } catch (error: any) {
        console.error('Error checking username update eligibility:', error)
        return NextResponse.json(
            { error: 'Gagal mengecek status username' },
            { status: 500 }
        )
    }
}
