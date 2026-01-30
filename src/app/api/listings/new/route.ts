import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ListingStatus } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

/**
 * POST /api/listings/new
 * Create a NEW car listing (admin only)
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

        // Only ADMIN can create NEW car listings
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Hanya admin yang dapat membuat iklan mobil baru' },
                { status: 403 }
            )
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
            color,
            price,
            negotiable,
            title,
            description,
            images,
            features,
            specs,
        } = data

        // Validation - NEW cars don't need mileage
        const requiredFields = ['brand', 'model', 'year', 'transmission', 'fuelType', 'bodyType', 'color', 'price', 'title', 'description']
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

        // Prepare description
        let fullDescription = description
        if (variant) fullDescription += `\n\nVarian: ${variant}`
        if (negotiable === false) fullDescription += '\n\nHarga Fixed (Tidak Bisa Nego)'

        // Create NEW car listing (mileage = 0)
        const listing = await prisma.listing.create({
            data: {
                title,
                slug: slugWithSuffix,
                year: parseInt(year),
                transmission: transmission as any,
                fuelType: fuelType as any,
                bodyType: bodyType as any,
                condition: 'NEW',
                mileage: 0,
                color,
                price: BigInt(parseInt(price)),
                description: fullDescription.trim(),
                location: 'Indonesia',
                images: images as string[],
                status: ListingStatus.ACTIVE,
                userId: user.id,
                brandId: brandRecord.id,
                modelId: modelRecord.id,
                // Technical Specifications
                engineSize: specs?.engineSize,
                enginePower: specs?.enginePower,
                engineTorque: specs?.engineTorque,
                cylinders: specs?.cylinders,
                topSpeed: specs?.topSpeed,
                acceleration: specs?.acceleration,
                length: specs?.length,
                width: specs?.width,
                height: specs?.height,
                wheelbase: specs?.wheelbase,
                groundClearance: specs?.groundClearance,
                seats: specs?.seats,
                doors: specs?.doors,
                fuelTank: specs?.fuelTank,
                luggageCapacity: specs?.luggageCapacity,
                warrantyYears: specs?.warrantyYears,
                warrantyKm: specs?.warrantyKm,
                specs: specs || {},
            },
            include: {
                brand: true,
                model: true,
            }
        })

        console.log('=== NEW CAR LISTING CREATED ===')
        console.log('Condition:', listing.condition)
        console.log('Mileage:', listing.mileage)
        console.log('Listing:', listing)

        return NextResponse.json({
            success: true,
            message: 'Iklan mobil baru berhasil diterbitkan',
            listing: {
                ...listing,
                price: Number(listing.price),
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating new car listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create listing' },
            { status: 500 }
        )
    }
}
