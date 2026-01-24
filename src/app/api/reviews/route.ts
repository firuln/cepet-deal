import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ReviewStatus } from '@prisma/client'

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { listingId, sellerId, rating, title, content } = data

        // Validate required fields
        if (!sellerId || !rating || !content) {
            return NextResponse.json(
                { error: 'sellerId, rating, and content are required' },
                { status: 400 }
            )
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        // Check if user is trying to review themselves
        if (sellerId === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot review yourself' },
                { status: 400 }
            )
        }

        // Check if user already reviewed this seller for this listing
        const existingReview = await prisma.review.findFirst({
            where: {
                reviewerId: session.user.id,
                sellerId,
                listingId: listingId || null
            }
        })

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this seller for this listing' },
                { status: 400 }
            )
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                reviewerId: session.user.id,
                sellerId,
                listingId: listingId || null,
                rating,
                title: title || null,
                content,
                status: 'PENDING' as ReviewStatus
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            review
        })
    } catch (error: any) {
        console.error('Error creating review:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create review' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/reviews
 * Get reviews by listing or seller
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const listingId = searchParams.get('listingId')
        const sellerId = searchParams.get('sellerId')
        const status = searchParams.get('status')

        const where: any = {}

        if (listingId) {
            where.listingId = listingId
        }

        if (sellerId) {
            where.sellerId = sellerId
        }

        if (status) {
            where.status = status.toUpperCase()
        } else {
            // Only show approved reviews by default
            where.status = 'APPROVED'
        }

        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                carListing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                }
            }
        })

        // Calculate average rating
        const avgRatingWhere: any = {
            status: 'APPROVED'
        }
        if (sellerId) {
            avgRatingWhere.sellerId = sellerId
        }

        const avgRating = await prisma.review.aggregate({
            where: avgRatingWhere,
            _avg: {
                rating: true
            },
            _count: true
        })

        return NextResponse.json({
            reviews,
            stats: {
                averageRating: avgRating._avg.rating || 0,
                totalReviews: avgRating._count
            }
        })
    } catch (error: any) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}
