import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ListingStatus } from '@prisma/client'

/**
 * GET /api/dealers/[id]
 * Get dealer profile with their active listings
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(req.url)
        const listingStatus = searchParams.get('listingStatus') || 'ACTIVE'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const dealer = await prisma.dealer.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: false, // Don't expose email publicly
                        phone: true,
                        avatar: true,
                        role: true,
                        _count: {
                            select: {
                                listings: {
                                    where: listingStatus !== 'all' ? {
                                        status: listingStatus.toUpperCase() as ListingStatus
                                    } : undefined
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!dealer) {
            return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
        }

        // Get listings for this dealer
        const total = await prisma.listing.count({
            where: {
                userId: dealer.userId,
                ...(listingStatus !== 'all' && { status: listingStatus.toUpperCase() as ListingStatus })
            }
        })

        const listings = await prisma.listing.findMany({
            where: {
                userId: dealer.userId,
                ...(listingStatus !== 'all' && { status: listingStatus.toUpperCase() as ListingStatus })
            },
            include: {
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                model: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                favorites: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        })

        // Transform BigInt and add favorite count
        const transformedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            year: listing.year,
            price: listing.price.toString(),
            condition: listing.condition,
            transmission: listing.transmission,
            fuelType: listing.fuelType,
            bodyType: listing.bodyType,
            mileage: listing.mileage,
            color: listing.color,
            location: listing.location,
            images: listing.images,
            youtubeUrl: listing.youtubeUrl,
            status: listing.status,
            featured: listing.featured,
            views: listing.views,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            brand: listing.brand,
            model: listing.model,
            favoriteCount: listing.favorites.length
        }))

        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        }

        return NextResponse.json({
            dealer: {
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
                activeListingsCount: dealer.user._count?.listings || 0
            },
            listings: transformedListings,
            pagination
        })
    } catch (error: any) {
        console.error('Error fetching dealer:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealer' },
            { status: 500 }
        )
    }
}
