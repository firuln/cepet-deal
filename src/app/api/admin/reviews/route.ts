import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/reviews
 * Get all reviews (admin only)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const rating = searchParams.get('rating')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status.toUpperCase()
        }

        if (rating) {
            where.rating = parseInt(rating)
        }

        // Get total count
        const total = await prisma.review.count({ where })

        // Fetch reviews
        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                carListing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: true
                    }
                }
            }
        })

        return NextResponse.json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })
    } catch (error: any) {
        console.error('Error fetching admin reviews:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}
