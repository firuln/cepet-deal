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
 * POST /api/listings/used
 * Create a USED car listing (admin & user)
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
            color,
            mileage,
            price,
            negotiable,
            location = 'Indonesia',
            title,
            description,
            images,
            features,
        } = data

        // Validation - USED cars require mileage
        const requiredFields = ['brand', 'model', 'year', 'transmission', 'fuelType', 'bodyType', 'color', 'mileage', 'price', 'title', 'description']
        const missingFields = requiredFields.filter(field => !data[field])

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate mileage
        const parsedMileage = parseInt(mileage)
        if (isNaN(parsedMileage) || parsedMileage < 0) {
            return NextResponse.json(
                { error: 'Kilometer tidak valid' },
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

        // Create USED car listing
        const listing = await prisma.listing.create({
            data: {
                title,
                slug: slugWithSuffix,
                year: parseInt(year),
                transmission: transmission as any,
                fuelType: fuelType as any,
                bodyType: bodyType as any,
                condition: 'USED',
                mileage: parsedMileage,
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
                ? 'Iklan mobil bekas berhasil diterbitkan'
                : 'Iklan berhasil diajukan dan menunggu review admin',
            listing: {
                ...listing,
                price: Number(listing.price),
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating used car listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create listing' },
            { status: 500 }
        )
    }
}
