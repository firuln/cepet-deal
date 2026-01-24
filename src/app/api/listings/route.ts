import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ListingStatus } from '@prisma/client'

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

/**
 * GET /api/listings
 * Get current user's listings
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

        const listings = await prisma.listing.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                brand: true,
                model: true,
                messages: {
                    select: { id: true }
                }
            }
        })

        const transformedListings = listings.map(l => ({
            ...l,
            price: Number(l.price),
            inquiries: l.messages.length,
            canEdit: l.status === 'ACTIVE', // Can only edit ACTIVE listings
            canDelete: l.status === 'PENDING', // Can only delete PENDING listings
            canMarkSold: l.status === 'ACTIVE', // Can only mark ACTIVE as SOLD
        }))

        return NextResponse.json(transformedListings)
    } catch (error) {
        console.error('Error fetching listings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/listings
 * Create a new listing
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, role: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const data = await req.json()
        const {
            brand,
            model,
            variant,
            year,
            transmission,
            fuelType,
            bodyType,
            mileage,
            color,
            plateNumber,
            price,
            negotiable,
            location,
            address,
            title,
            description,
            images,
            features,
            condition = 'USED',
        } = data

        // Validation
        const requiredFields = ['brand', 'model', 'year', 'transmission', 'fuelType', 'bodyType', 'mileage', 'color', 'price', 'location', 'title', 'description']
        const missingFields = requiredFields.filter(field => !data[field])

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate images
        if (!images || images.length < 3) {
            return NextResponse.json(
                { error: 'Minimal 3 foto diperlukan' },
                { status: 400 }
            )
        }

        // Check if brand exists
        const brandRecord = await prisma.brand.findFirst({
            where: { name: { equals: brand, mode: 'insensitive' } }
        })

        if (!brandRecord) {
            return NextResponse.json(
                { error: 'Merk mobil tidak valid' },
                { status: 400 }
            )
        }

        // Check if model exists
        const modelRecord = await prisma.model.findFirst({
            where: {
                name: { equals: model, mode: 'insensitive' },
                brandId: brandRecord.id
            }
        })

        if (!modelRecord) {
            return NextResponse.json(
                { error: 'Model mobil tidak valid' },
                { status: 400 }
            )
        }

        // Generate slug from title
        const slug = generateSlug(title)
        const slugWithSuffix = `${slug}-${Date.now()}`

        // Prepare description (store additional info in description)
        let fullDescription = description
        if (variant) fullDescription += `\n\nVarian: ${variant}`
        if (plateNumber) fullDescription += `\n\nPlat Nomor: ${plateNumber}`
        if (negotiable === false) fullDescription += '\n\nHarga Fixed (Tidak Bisa Nego)'
        if (address) fullDescription += `\n\nAlamat: ${address}`

        // Create listing
        const listing = await prisma.listing.create({
            data: {
                title,
                slug: slugWithSuffix,
                year: parseInt(year),
                transmission: transmission as any,
                fuelType: fuelType as any,
                bodyType: bodyType as any,
                condition: condition as any,
                mileage: parseInt(mileage),
                color,
                price: BigInt(parseInt(price)),
                description: fullDescription.trim(),
                location,
                images: images as string[],
                status: user.role === 'ADMIN' ? ListingStatus.ACTIVE : ListingStatus.PENDING,
                userId: user.id,
                brandId: brandRecord.id,
                modelId: modelRecord.id,
            },
            include: {
                brand: true,
                model: true,
            }
        })

        return NextResponse.json({
            success: true,
            message: user.role === 'ADMIN'
                ? 'Iklan berhasil diterbitkan'
                : 'Iklan berhasil diajukan dan menunggu review admin',
            listing: {
                ...listing,
                price: Number(listing.price),
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create listing' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/listings
 * Update listing status (mark as sold, etc.)
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const data = await req.json()
        const { id, action } = data

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get listing to check ownership
        const listing = await prisma.listing.findUnique({
            where: { id },
            select: { userId: true, status: true }
        })

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // Check ownership
        if (listing.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Handle different actions
        if (action === 'mark_sold') {
            // Only ACTIVE listings can be marked as SOLD
            if (listing.status !== 'ACTIVE') {
                return NextResponse.json(
                    { error: 'Hanya iklan dengan status Aktif yang dapat ditandai sebagai Terjual' },
                    { status: 400 }
                )
            }

            const updated = await prisma.listing.update({
                where: { id },
                data: { status: 'SOLD' }
            })

            return NextResponse.json({
                success: true,
                message: 'Iklan berhasil ditandai sebagai Terjual',
                listing: {
                    ...updated,
                    price: Number(updated.price)
                }
            })
        }

        if (action === 'mark_active' && user.role === 'ADMIN') {
            const updated = await prisma.listing.update({
                where: { id },
                data: { status: 'ACTIVE' }
            })

            return NextResponse.json({
                success: true,
                message: 'Iklan berhasil diaktifkan',
                listing: {
                    ...updated,
                    price: Number(updated.price)
                }
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Error updating listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update listing' },
            { status: 500 }
        )
    }
}
