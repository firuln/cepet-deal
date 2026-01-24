import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/dealers
 * Get all verified dealers with their inventory counts
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const city = searchParams.get('city')
        const verified = searchParams.get('verified') !== 'false' // default to true
        const includeUnverified = searchParams.get('includeUnverified') === 'true'

        const where: any = {}

        if (city) {
            where.city = {
                contains: city,
                mode: 'insensitive'
            }
        }

        if (!includeUnverified) {
            where.verified = true
        }

        const dealers = await prisma.dealer.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        _count: {
                            select: {
                                listings: {
                                    where: {
                                        status: 'ACTIVE'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Transform the response to include inventory count
        const transformedDealers = dealers.map(dealer => ({
            id: dealer.id,
            companyName: dealer.companyName,
            address: dealer.address,
            city: dealer.city,
            description: dealer.description,
            logo: dealer.logo,
            verified: dealer.verified,
            verifiedAt: dealer.verifiedAt,
            createdAt: dealer.createdAt,
            user: dealer.user,
            inventoryCount: dealer.user._count?.listings || 0
        }))

        return NextResponse.json(transformedDealers)
    } catch (error: any) {
        console.error('Error fetching dealers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dealers' },
            { status: 500 }
        )
    }
}
