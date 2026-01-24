import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/favorites
 * Get all favorites for current user
 */
export async function GET(req: Request) {
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

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: {
                listing: {
                    include: {
                        brand: { select: { id: true, name: true, slug: true } },
                        model: { select: { id: true, name: true, slug: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const transformedFavorites = favorites.map(fav => ({
            ...fav,
            listing: {
                ...fav.listing,
                price: fav.listing.price.toString()
            }
        }))

        return NextResponse.json(transformedFavorites)
    } catch (error: any) {
        console.error('Error fetching favorites:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch favorites' },
            { status: 500 }
        )
    }
}
