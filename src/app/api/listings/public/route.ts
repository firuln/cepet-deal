import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // Parse query parameters
        const condition = searchParams.get('condition') // NEW or USED
        const brand = searchParams.get('brand')
        const transmission = searchParams.get('transmission')
        const fuelType = searchParams.get('fuelType')
        const bodyType = searchParams.get('bodyType')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const minYear = searchParams.get('minYear')
        const maxYear = searchParams.get('maxYear')
        const minMileage = searchParams.get('minMileage')
        const maxMileage = searchParams.get('maxMileage')
        const location = searchParams.get('location')
        const search = searchParams.get('search')
        const id = searchParams.get('id')
        const sort = searchParams.get('sort') || 'newest'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')

        // Build where clause
        const where: any = {
            status: 'ACTIVE',
        }

        if (id) {
            where.id = id
        }

        if (condition) {
            where.condition = condition.toUpperCase()
        }

        if (brand) {
            where.brand = { slug: brand.toLowerCase() }
        }

        if (transmission) {
            where.transmission = transmission.toUpperCase()
        }

        if (fuelType) {
            where.fuelType = fuelType.toUpperCase()
        }

        if (bodyType) {
            where.bodyType = bodyType.toUpperCase()
        }

        if (location) {
            where.location = { contains: location, mode: 'insensitive' }
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Price range
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = BigInt(minPrice)
            if (maxPrice) where.price.lte = BigInt(maxPrice)
        }

        // Year range
        if (minYear || maxYear) {
            where.year = {}
            if (minYear) where.year.gte = parseInt(minYear)
            if (maxYear) where.year.lte = parseInt(maxYear)
        }

        // Mileage range
        if (minMileage || maxMileage) {
            where.mileage = {}
            if (minMileage) where.mileage.gte = parseInt(minMileage)
            if (maxMileage) where.mileage.lte = parseInt(maxMileage)
        }

        // Build order by
        let orderBy: any = { createdAt: 'desc' }
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' }
                break
            case 'price_desc':
                orderBy = { price: 'desc' }
                break
            case 'year_desc':
                orderBy = { year: 'desc' }
                break
            case 'mileage_asc':
                orderBy = { mileage: 'asc' }
                break
            case 'views':
                orderBy = { views: 'desc' }
                break
            default:
                orderBy = { createdAt: 'desc' }
        }

        // Get total count
        const total = await prisma.listing.count({ where })

        // Fetch listings
        const listings = await prisma.listing.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                brand: true,
                model: true,
            }
        })

        // Format response
        const formattedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            price: Number(listing.price),
            year: listing.year,
            mileage: listing.mileage,
            location: listing.location,
            images: listing.images || [],
            condition: listing.condition,
            transmission: listing.transmission,
            fuelType: listing.fuelType,
            bodyType: listing.bodyType,
            color: listing.color,
            engineSize: listing.engineSize ? Number(listing.engineSize) : null,
            brand: listing.brand.name,
            model: listing.model.name,
            views: listing.views,
            createdAt: listing.createdAt,
        }))

        return NextResponse.json({
            listings: formattedListings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        })

    } catch (error) {
        console.error('Error fetching public listings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        )
    }
}
