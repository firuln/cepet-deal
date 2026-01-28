import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/dashboard/stats
 * Get dashboard stats for current user
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { searchParams } = new URL(req.url)
        const range = searchParams.get('range') || '30d'

        // Calculate date range
        const now = new Date()
        let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default 30 days

        if (range === '7d') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (range === '90d') {
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        } else if (range === 'all') {
            startDate = new Date(0) // Beginning of time
        }

        // Get listings count
        const totalListings = await prisma.listing.count({
            where: { userId: user.id }
        })

        const soldListings = await prisma.listing.count({
            where: { userId: user.id, status: 'SOLD' }
        })

        // Get total views (sum of all listing views if you track views)
        // For now, we'll calculate based on listing count
        const views = await prisma.listing.aggregate({
            where: { userId: user.id },
            _count: { id: true }
        })

        // Get new messages count
        const newMessages = await prisma.message.count({
            where: {
                listing: { userId: user.id },
                senderId: { not: user.id },
                readAt: null
            }
        })

        // Get recent activity counts within date range
        // @ts-ignore - ListingView model may not exist in all Prisma schemas
        const recentViews = await (prisma as any).listingView.count({
            where: {
                listing: { userId: user.id },
                createdAt: { gte: startDate }
            }
        })

        const recentFavorites = await prisma.favorite.count({
            where: {
                listing: { userId: user.id },
                createdAt: { gte: startDate }
            }
        })

        // Calculate trends (compare with previous period)
        const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
        const previousListings = await prisma.listing.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate
                }
            }
        })

        const currentListingsInRange = await prisma.listing.count({
            where: {
                userId: user.id,
                createdAt: { gte: startDate }
            }
        })

        const listingsTrend = previousListings > 0
            ? Math.round(((currentListingsInRange - previousListings) / previousListings) * 100)
            : 0

        return NextResponse.json({
            stats: {
                totalListings,
                soldListings,
                newMessages,
                totalViews: views._count, // You might want to track actual views separately
                recentViews,
                recentFavorites,
                listingsTrend,
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
