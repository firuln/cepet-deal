import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET all listings for admin
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const condition = searchParams.get('condition')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status.toUpperCase()
        }

        if (condition) {
            where.condition = condition.toUpperCase()
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
            ]
        }

        // Get total count
        const total = await prisma.listing.count({ where })

        // Fetch listings
        const listings = await prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                brand: true,
                model: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        dealer: {
                            select: { companyName: true }
                        }
                    }
                }
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
            images: listing.images,
            status: listing.status,
            condition: listing.condition,
            views: listing.views,
            createdAt: listing.createdAt,
            user: {
                id: listing.user.id,
                name: listing.user.name,
                email: listing.user.email,
                role: listing.user.role,
            }
        }))

        return NextResponse.json({
            listings: formattedListings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error) {
        console.error('Error fetching admin listings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        )
    }
}

// PATCH - Update listing status (approve/reject)
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, status, rejectReason } = await req.json()

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const validStatuses = ['ACTIVE', 'REJECTED', 'PENDING', 'SOLD', 'EXPIRED']
        if (!validStatuses.includes(status.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const listing = await prisma.listing.update({
            where: { id },
            data: {
                status: status.toUpperCase(),
                // Could add rejectReason to schema if needed
            }
        })

        return NextResponse.json({
            success: true,
            listing: {
                id: listing.id,
                status: listing.status,
            }
        })

    } catch (error) {
        console.error('Error updating listing:', error)
        return NextResponse.json(
            { error: 'Failed to update listing' },
            { status: 500 }
        )
    }
}

// DELETE - Delete listing
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 })
        }

        await prisma.listing.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting listing:', error)
        return NextResponse.json(
            { error: 'Failed to delete listing' },
            { status: 500 }
        )
    }
}
