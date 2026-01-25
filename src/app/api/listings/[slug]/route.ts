import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/listings/[slug]
 * Get public listing details by slug
 * Increments view count
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const listing = await prisma.listing.findUnique({
            where: { slug },
            include: {
                brand: true,
                model: true,
                features: {
                    orderBy: { category: 'asc' }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        role: true,
                        createdAt: true,
                        dealer: {
                            select: {
                                verified: true
                            }
                        }
                    }
                }
            }
        })

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // Check if user is logged in
        const session = await getServerSession(authOptions)
        const isOwner = session?.user?.email === listing.user.email
        const isAdmin = session?.user?.role === 'ADMIN'

        // Allow access if: ACTIVE/SOLD (public), OR owner/admin can see PENDING listings
        const isPublicListing = listing.status === 'ACTIVE' || listing.status === 'SOLD'
        if (!isPublicListing && !isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Listing not available' }, { status: 404 })
        }

        // Increment view count
        await prisma.listing.update({
            where: { id: listing.id },
            data: { views: { increment: 1 } }
        })

        // Get related cars (same brand, different listing, active status)
        const relatedListings = await prisma.listing.findMany({
            where: {
                brandId: listing.brandId,
                id: { not: listing.id },
                status: 'ACTIVE'
            },
            take: 3,
            include: {
                brand: true,
                model: true
            }
        })

        // Get recommended new cars (same brand first, then fallback to other brands)
        const recommendedSameBrand = await prisma.listing.findMany({
            where: {
                brandId: listing.brandId,
                id: { not: listing.id },
                condition: 'NEW',
                status: 'ACTIVE'
            },
            take: 4,
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                brand: true,
                model: true
            }
        })

        // If we need more cars, get from other brands
        let recommendedNewCars = [...recommendedSameBrand]
        if (recommendedSameBrand.length < 4) {
            const remainingCount = 4 - recommendedSameBrand.length
            const recommendedOtherBrands = await prisma.listing.findMany({
                where: {
                    brandId: { not: listing.brandId },
                    id: { not: listing.id },
                    condition: 'NEW',
                    status: 'ACTIVE'
                },
                take: remainingCount,
                orderBy: [
                    { featured: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    brand: true,
                    model: true
                }
            })
            recommendedNewCars = [...recommendedSameBrand, ...recommendedOtherBrands]
        }

        // Format the response
        const formattedListing = {
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            brand: listing.brand.name,
            model: listing.model.name,
            year: listing.year,
            price: Number(listing.price),
            condition: listing.condition,
            status: listing.status,
            transmission: listing.transmission,
            fuelType: listing.fuelType,
            bodyType: listing.bodyType,
            mileage: listing.mileage,
            color: listing.color,
            engineSize: listing.engineSize ? Number(listing.engineSize) : null,
            description: listing.description || '',
            location: listing.location,
            images: listing.images || [],
            youtubeUrl: listing.youtubeUrl,
            views: listing.views + 1,
            createdAt: listing.createdAt.toISOString(),
            features: listing.features.map(f => ({
                id: f.id,
                category: f.category,
                name: f.name
            })),
            seller: {
                id: listing.user.id,
                name: listing.user.name,
                type: listing.user.role === 'DEALER' ? 'DEALER' : 'PERSONAL',
                verified: listing.user.dealer?.verified || false,
                phone: listing.user.phone,
                avatar: listing.user.avatar,
                memberSince: new Date(listing.user.createdAt).getFullYear().toString()
            },
            // Vehicle History fields
            pajakStnk: listing.pajakStnk ? listing.pajakStnk.toISOString().split('T')[0].substring(0, 7) : null,
            pemakaian: listing.pemakaian,
            serviceTerakhir: listing.serviceTerakhir,
            bpkbStatus: listing.bpkbStatus,
            kecelakaan: listing.kecelakaan,
            kondisiMesin: listing.kondisiMesin,
            kondisiKaki: listing.kondisiKaki,
            kondisiAc: listing.kondisiAc,
            kondisiBan: listing.kondisiBan,
            relatedCars: relatedListings.map(l => ({
                id: l.id,
                title: l.title,
                slug: l.slug,
                price: Number(l.price),
                year: l.year,
                mileage: l.mileage,
                location: l.location,
                image: l.images[0] || null,
                condition: l.condition,
                transmission: l.transmission,
                fuelType: l.fuelType
            })),
            recommendedNewCars: recommendedNewCars.map(l => ({
                id: l.id,
                title: l.title,
                slug: l.slug,
                price: Number(l.price),
                year: l.year,
                image: l.images[0] || '/placeholder-car.png',
                badge: l.featured ? 'PROMO' : 'NEW'
            }))
        }

        return NextResponse.json(formattedListing)
    } catch (error: any) {
        console.error('Error fetching listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch listing' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/listings/[slug]
 * Delete listing by slug (owner or admin only)
 * Restrictions: Can only delete PENDING listings (SEO protection)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { slug } = await params
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get listing
        const listing = await prisma.listing.findUnique({
            where: { slug },
            select: { id: true, userId: true, status: true }
        })

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // Check ownership or admin
        if (listing.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Restriction: Can only delete PENDING listings (SEO protection)
        if (listing.status !== 'PENDING' && user.role !== 'ADMIN') {
            return NextResponse.json({
                error: 'Iklan yang sudah aktif atau terjual tidak dapat dihapus demi kebaikan SEO. Hubungi admin jika perlu menghapus iklan ini.',
                code: 'CANNOT_DELETE_ACTIVE_LISTING'
            }, { status: 403 })
        }

        // Delete listing
        await prisma.listing.delete({
            where: { id: listing.id }
        })

        return NextResponse.json({
            success: true,
            message: 'Iklan berhasil dihapus'
        })
    } catch (error: any) {
        console.error('Error deleting listing:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete listing' },
            { status: 500 }
        )
    }
}
