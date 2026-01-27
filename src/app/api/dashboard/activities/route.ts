import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/dashboard/activities
 * Get recent activities for current user
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { searchParams } = new URL(req.url)
        const range = searchParams.get('range') || '30d'
        const limit = parseInt(searchParams.get('limit') || '20')

        // Calculate date range
        const now = new Date()
        let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default 30 days

        if (range === '7d') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (range === '90d') {
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        } else if (range === 'all') {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // Last year
        }

        // Get recent activities by combining different data sources
        const activities: any[] = []

        // 1. Recent messages
        const recentMessages = await prisma.message.findMany({
            where: {
                listing: { userId: user.id },
                createdAt: { gte: startDate }
            },
            include: {
                sender: {
                    select: { id: true, name: true }
                },
                listing: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        recentMessages.forEach(msg => {
            activities.push({
                type: 'inquiry',
                message: `Pesan baru untuk ${msg.listing.title}`,
                time: formatTimeAgo(msg.createdAt),
                createdAt: msg.createdAt
            })
        })

        // 2. Recent favorites
        const recentFavorites = await prisma.favorite.findMany({
            where: {
                listing: { userId: user.id },
                createdAt: { gte: startDate }
            },
            include: {
                listing: {
                    select: { id: true, title: true }
                },
                user: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        recentFavorites.forEach(fav => {
            activities.push({
                type: 'favorite',
                message: `${fav.user.name} menyukai iklan ${fav.listing.title}`,
                time: formatTimeAgo(fav.createdAt),
                createdAt: fav.createdAt
            })
        })

        // 3. Recent sold listings
        const recentSold = await prisma.listing.findMany({
            where: {
                userId: user.id,
                status: 'SOLD',
                updatedAt: { gte: startDate }
            },
            select: { id: true, title: true, updatedAt },
            orderBy: { updatedAt: 'desc' },
            take: 5
        })

        recentSold.forEach(listing => {
            activities.push({
                type: 'sold',
                message: `${listing.title} berhasil terjual!`,
                time: formatTimeAgo(listing.updatedAt),
                createdAt: listing.updatedAt
            })
        })

        // 4. Recent created listings
        const recentListings = await prisma.listing.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: startDate }
            },
            select: { id: true, title: true, createdAt, views: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        recentListings.forEach(listing => {
            if (listing.views && listing.views > 10) {
                activities.push({
                    type: 'view',
                    message: `Iklan ${listing.title} dilihat ${listing.views} kali`,
                    time: formatTimeAgo(listing.createdAt),
                    createdAt: listing.createdAt
                })
            }
        })

        // Sort all activities by date and take limit
        activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        const limitedActivities = activities.slice(0, limit)

        return NextResponse.json({
            activities: limitedActivities
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching dashboard activities:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dashboard activities' },
            { status: 500 }
        )
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMins < 60) {
        return `${diffInMins} menit lalu`
    } else if (diffInHours < 24) {
        return `${diffInHours} jam lalu`
    } else if (diffInDays < 7) {
        return `${diffInDays} hari lalu`
    } else {
        return `${Math.floor(diffInDays / 7)} minggu lalu`
    }
}
