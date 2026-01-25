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
            // Vehicle History fields (optional)
            pajakStnk,
            pemakaian,
            serviceTerakhir,
            bpkbStatus,
            kecelakaan,
            kondisiMesin,
            kondisiKaki,
            kondisiAc,
            kondisiBan,
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

        // Parse pajakStnk if provided
        let pajakStnkDate: Date | null = null
        if (pajakStnk) {
            try {
                // pajakStnk format: "2025-12" (YYYY-MM)
                pajakStnkDate = new Date(`${pajakStnk}-01`)
            } catch (e) {
                console.error('Invalid pajakStnk date:', pajakStnk)
            }
        }

        // Prepare vehicle history data
        const vehicleHistoryData: {
            pajakStnk?: Date | null
            pemakaian?: string | null
            serviceTerakhir?: string | null
            bpkbStatus?: string | null
            kecelakaan?: boolean | null
            kondisiMesin?: string | null
            kondisiKaki?: string | null
            kondisiAc?: string | null
            kondisiBan?: string | null
        } = {}

        // Only include vehicle history fields if they have values
        if (pajakStnkDate && !isNaN(pajakStnkDate.getTime())) {
            vehicleHistoryData.pajakStnk = pajakStnkDate
        }
        if (pemakaian) vehicleHistoryData.pemakaian = pemakaian
        if (serviceTerakhir) vehicleHistoryData.serviceTerakhir = serviceTerakhir
        if (bpkbStatus) vehicleHistoryData.bpkbStatus = bpkbStatus
        if (kecelakaan !== undefined && kecelakaan !== null) vehicleHistoryData.kecelakaan = kecelakaan
        if (kondisiMesin) vehicleHistoryData.kondisiMesin = kondisiMesin
        if (kondisiKaki) vehicleHistoryData.kondisiKaki = kondisiKaki
        if (kondisiAc) vehicleHistoryData.kondisiAc = kondisiAc
        if (kondisiBan) vehicleHistoryData.kondisiBan = kondisiBan

        // Prepare features data for CarFeature relation
        const featuresData: { category: string; name: string }[] = []
        if (features && typeof features === 'object') {
            for (const [category, featureList] of Object.entries(features)) {
                if (Array.isArray(featureList)) {
                    for (const name of featureList) {
                        featuresData.push({ category, name })
                    }
                }
            }
        }

        // Create USED car listing with features
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
                ...vehicleHistoryData,
                features: featuresData.length > 0 ? {
                    create: featuresData
                } : undefined,
            },
            include: {
                brand: true,
                model: true,
                features: {
                    orderBy: { category: 'asc' }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: user.role === 'ADMIN'
                ? 'Iklan mobil bekas berhasil diterbitkan'
                : 'Iklan berhasil diajukan dan menunggu review admin',
            listing: {
                id: listing.id,
                title: listing.title,
                slug: listing.slug,
                brand: listing.brand.name,
                model: listing.model.name,
                year: listing.year,
                price: Number(listing.price),
                condition: listing.condition,
                status: listing.status,
                features: listing.features.map((f: any) => ({
                    id: f.id,
                    category: f.category,
                    name: f.name
                }))
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
