import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ListingStatus } from '@prisma/client'
import { createSlug } from '@/lib/slug'

/**
 * GET /api/dealers/by-slug/[companySlug]/[citySlug]
 * Get dealer profile by matching generated slugs from companyName and city
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slugs: string[] }> }
) {
    try {
        const { slugs } = await params

        // Validate slug format: expect [companySlug, citySlug]
        if (!slugs || slugs.length !== 2) {
            return NextResponse.json(
                { error: 'Invalid slug format. Expected: /dealer/[company-slug]/[city-slug]' },
                { status: 400 }
            )
        }

        const [companySlug, citySlug] = slugs

        // Get all dealers and find the one matching the slugs
        // This is necessary because we generate slugs dynamically from companyName and city
        const dealers = await prisma.dealer.findMany({
            where: {
                // Only match active/verified dealers
                // verified: true // Uncomment if you only want verified dealers
            },
            select: {
                id: true,
                companyName: true,
                city: true,
                address: true,
                description: true,
                logo: true,
                verified: true,
                verifiedAt: true,
                createdAt: true,
                userId: true,
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
                                    where: {
                                        status: 'ACTIVE'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Find the dealer whose generated slugs match
        const dealer = dealers.find(d => {
            const generatedCompanySlug = createSlug(d.companyName)
            const generatedCitySlug = createSlug(d.city || '')
            return generatedCompanySlug === companySlug && generatedCitySlug === citySlug
        })

        if (!dealer) {
            return NextResponse.json(
                { error: 'Dealer not found' },
                { status: 404 }
            )
        }

        // Increment view count
        await prisma.dealer.update({
            where: { id: dealer.id },
            data: { views: { increment: 1 } }
        })

        // Get query params for listings
        const { searchParams } = new URL(req.url)
        const listingStatus = searchParams.get('listingStatus') || 'ACTIVE'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')

        // Get total count
        const total = await prisma.listing.count({
            where: {
                userId: dealer.userId,
                ...(listingStatus !== 'all' && { status: listingStatus.toUpperCase() as ListingStatus })
            }
        })

        // Get listings
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

        // Transform listings
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
                views: (dealer.views ?? 0) + 1,
                user: dealer.user,
                activeListingsCount: dealer.user._count?.listings || 0
            },
            listings: transformedListings,
            pagination
        })
    } catch (error: any) {
        console.error('Error fetching dealer by slug:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealer' },
            { status: 500 }
        )
    }
}
