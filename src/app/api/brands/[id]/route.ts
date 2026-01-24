import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/brands/[id]
 * Get brand by ID with models and listing counts
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(req.url)
        const includeListings = searchParams.get('includeListings') === 'true'
        const listingStatus = searchParams.get('listingStatus') || 'ACTIVE'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                models: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        _count: {
                            select: {
                                listings: {
                                    where: listingStatus !== 'all' ? {
                                        status: listingStatus.toUpperCase()
                                    } : undefined
                                }
                            }
                        }
                    },
                    orderBy: { name: 'asc' }
                },
                _count: {
                    select: {
                        listings: {
                            where: listingStatus !== 'all' ? {
                                status: listingStatus.toUpperCase()
                            } : undefined
                        }
                    }
                }
            }
        })

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }

        let listings = []
        let pagination = null

        if (includeListings) {
            const total = await prisma.listing.count({
                where: {
                    brandId: id,
                    ...(listingStatus !== 'all' && { status: listingStatus.toUpperCase() })
                }
            })

            listings = await prisma.listing.findMany({
                where: {
                    brandId: id,
                    ...(listingStatus !== 'all' && { status: listingStatus.toUpperCase() })
                },
                include: {
                    model: { select: { id: true, name: true, slug: true } },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            dealer: {
                                select: { companyName: true, verified: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            })

            pagination = {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }

            // Transform BigInt
            listings = listings.map(listing => ({
                ...listing,
                price: listing.price.toString()
            }))
        }

        return NextResponse.json({
            brand: {
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                logo: brand.logo,
                createdAt: brand.createdAt,
                totalListings: brand._count.listings,
                models: brand.models
            },
            ...(includeListings && { listings, pagination })
        })
    } catch (error: any) {
        console.error('Error fetching brand:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch brand' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/brands/[id]
 * Update brand (admin only)
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await req.json()
        const { name, logo } = data

        // Prepare update data
        const updateData: any = {}

        if (name) {
            updateData.name = name
            // Generate new slug
            updateData.slug = name
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
        }

        if (logo !== undefined) {
            updateData.logo = logo || null
        }

        // Update brand
        const brand = await prisma.brand.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            brand
        })
    } catch (error: any) {
        console.error('Error updating brand:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update brand' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/brands/[id]
 * Delete brand (admin only)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check if brand has listings
        const listingCount = await prisma.listing.count({
            where: { brandId: id }
        })

        if (listingCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete brand with ${listingCount} listings` },
                { status: 400 }
            )
        }

        await prisma.brand.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Brand deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting brand:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete brand' },
            { status: 500 }
        )
    }
}
