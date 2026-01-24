import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/listings/search
 * Search listings with filters
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // Parse query parameters
        const query = searchParams.get('q') || ''
        const brand = searchParams.get('brand')
        const model = searchParams.get('model')
        const condition = searchParams.get('condition') // NEW, USED
        const transmission = searchParams.get('transmission') // MANUAL, AUTOMATIC, CVT
        const fuelType = searchParams.get('fuelType') // PETROL, DIESEL, HYBRID, ELECTRIC
        const bodyType = searchParams.get('bodyType') // SEDAN, SUV, MPV, etc
        const location = searchParams.get('location')
        const minYear = searchParams.get('minYear')
        const maxYear = searchParams.get('maxYear')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const maxMileage = searchParams.get('maxMileage')
        const sortBy = searchParams.get('sortBy') || 'newest' // newest, price_asc, price_desc, mileage
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')

        // Build where clause
        const where: any = {
            status: 'ACTIVE'
        }

        // Text search in title and description
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } }
            ]
        }

        // Brand filter
        if (brand) {
            const brandData = await prisma.brand.findFirst({
                where: {
                    OR: [
                        { slug: brand },
                        { name: { contains: brand, mode: 'insensitive' } }
                    ]
                }
            })
            if (brandData) {
                where.brandId = brandData.id
            }
        }

        // Model filter
        if (model) {
            const modelData = await prisma.model.findFirst({
                where: {
                    OR: [
                        { slug: model },
                        { name: { contains: model, mode: 'insensitive' } }
                    ]
                }
            })
            if (modelData) {
                where.modelId = modelData.id
            }
        }

        // Condition filter
        if (condition && ['NEW', 'USED'].includes(condition.toUpperCase())) {
            where.condition = condition.toUpperCase()
        }

        // Transmission filter
        if (transmission && ['MANUAL', 'AUTOMATIC', 'CVT'].includes(transmission.toUpperCase())) {
            where.transmission = transmission.toUpperCase()
        }

        // Fuel type filter
        if (fuelType && ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'].includes(fuelType.toUpperCase())) {
            where.fuelType = fuelType.toUpperCase()
        }

        // Body type filter
        if (bodyType && ['SEDAN', 'SUV', 'MPV', 'HATCHBACK', 'COUPE', 'PICKUP', 'VAN'].includes(bodyType.toUpperCase())) {
            where.bodyType = bodyType.toUpperCase()
        }

        // Location filter
        if (location) {
            where.location = {
                contains: location,
                mode: 'insensitive'
            }
        }

        // Year range filter
        if (minYear || maxYear) {
            where.year = {}
            if (minYear) where.year.gte = parseInt(minYear)
            if (maxYear) where.year.lte = parseInt(maxYear)
        }

        // Price range filter
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = BigInt(minPrice)
            if (maxPrice) where.price.lte = BigInt(maxPrice)
        }

        // Mileage filter (max only)
        if (maxMileage) {
            where.mileage = {
                lte: parseInt(maxMileage)
            }
        }

        // Build order by clause
        let orderBy: any = { createdAt: 'desc' }
        switch (sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' }
                break
            case 'price_desc':
                orderBy = { price: 'desc' }
                break
            case 'mileage':
                orderBy = { mileage: 'asc' }
                break
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' }
                break
        }

        // Count total results
        const total = await prisma.listing.count({ where })

        // Fetch listings with pagination
        const listings = await prisma.listing.findMany({
            where,
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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true
                    }
                },
                favorites: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit
        })

        // Transform data for response
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
            featured: listing.featured,
            views: listing.views,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            brand: listing.brand,
            model: listing.model,
            seller: {
                id: listing.user.id,
                name: listing.user.name,
                phone: listing.user.phone,
                avatar: listing.user.avatar
            },
            favoriteCount: listing.favorites.length
        }))

        return NextResponse.json({
            listings: transformedListings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        })
    } catch (error: any) {
        console.error('Error searching listings:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to search listings' },
            { status: 500 }
        )
    }
}
