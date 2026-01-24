import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/favorites/toggle
 * Toggle favorite status for a listing
 * Body: { listingId: string }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const data = await req.json()
        const { listingId } = data

        if (!listingId) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
        }

        // Check if listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId }
        })

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId: user.id,
                    listingId: listingId
                }
            }
        })

        if (existingFavorite) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: {
                    userId_listingId: {
                        userId: user.id,
                        listingId: listingId
                    }
                }
            })

            return NextResponse.json({
                favorited: false,
                message: 'Removed from favorites'
            })
        } else {
            // Add to favorites
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    listingId: listingId
                }
            })

            return NextResponse.json({
                favorited: true,
                message: 'Added to favorites'
            })
        }
    } catch (error: any) {
        console.error('Error toggling favorite:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to toggle favorite' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/favorites/toggle?listingId=xxx
 * Check if listing is favorited by current user
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ favorited: false }, { status: 200 })
        }

        const { searchParams } = new URL(req.url)
        const listingId = searchParams.get('listingId')

        if (!listingId) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ favorited: false }, { status: 200 })
        }

        // Check if favorited
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId: user.id,
                    listingId: listingId
                }
            }
        })

        return NextResponse.json({
            favorited: !!favorite
        })
    } catch (error: any) {
        console.error('Error checking favorite status:', error)
        return NextResponse.json(
            { error: 'Failed to check favorite status' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/favorites/toggle
 * Remove listing from favorites
 * Body: { listingId: string }
 */
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const data = await req.json()
        const { listingId } = data

        if (!listingId) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
        }

        // Remove from favorites
        await prisma.favorite.delete({
            where: {
                userId_listingId: {
                    userId: user.id,
                    listingId: listingId
                }
            }
        }).catch(() => {
            // Ignore if not found
        })

        return NextResponse.json({
            favorited: false,
            message: 'Removed from favorites'
        })
    } catch (error: any) {
        console.error('Error removing favorite:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to remove favorite' },
            { status: 500 }
        )
    }
}
