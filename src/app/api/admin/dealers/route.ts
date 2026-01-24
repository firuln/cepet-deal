import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/dealers
 * Get all dealers with filters and pagination
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')
        const verified = searchParams.get('verified')
        const city = searchParams.get('city')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { city: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (verified !== null && verified !== undefined && verified !== '') {
            where.verified = verified === 'true'
        }

        if (city) {
            where.city = {
                contains: city,
                mode: 'insensitive'
            }
        }

        // Get total count
        const total = await prisma.dealer.count({ where })

        // Fetch dealers
        const dealers = await prisma.dealer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        role: true,
                        _count: {
                            select: {
                                listings: {
                                    where: { status: 'ACTIVE' }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Transform response
        const transformedDealers = dealers.map(dealer => ({
            id: dealer.id,
            companyName: dealer.companyName,
            address: dealer.address,
            city: dealer.city,
            description: dealer.description,
            logo: dealer.logo,
            documents: dealer.documents,
            verified: dealer.verified,
            verifiedAt: dealer.verifiedAt,
            createdAt: dealer.createdAt,
            updatedAt: dealer.updatedAt,
            user: dealer.user,
            activeListingsCount: dealer.user._count?.listings || 0
        }))

        return NextResponse.json({
            dealers: transformedDealers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching admin dealers:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealers' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/dealers
 * Approve or reject dealer application
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { id, action, notes } = data

        if (!id) {
            return NextResponse.json({ error: 'Dealer ID is required' }, { status: 400 })
        }

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 })
        }

        // Get dealer
        const dealer = await prisma.dealer.findUnique({
            where: { id },
            include: {
                user: true
            }
        })

        if (!dealer) {
            return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
        }

        if (action === 'approve') {
            // Approve dealer
            const updatedDealer = await prisma.dealer.update({
                where: { id },
                data: {
                    verified: true,
                    verifiedAt: new Date()
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })

            // Update user role to DEALER if not already
            if (dealer.user.role !== 'DEALER') {
                await prisma.user.update({
                    where: { id: dealer.userId },
                    data: { role: 'DEALER' }
                })
            }

            return NextResponse.json({
                success: true,
                message: 'Dealer approved successfully',
                dealer: updatedDealer
            })

        } else {
            // Reject dealer - you could delete it or add a rejection reason
            // For now, we'll just mark it as not verified
            // Optionally, you could add a rejectionReason field to the schema

            await prisma.dealer.update({
                where: { id },
                data: {
                    verified: false,
                    verifiedAt: null
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Dealer rejected'
            })
        }

    } catch (error: any) {
        console.error('Error updating dealer:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update dealer' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/dealers
 * Delete a dealer
 */
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Dealer ID is required' }, { status: 400 })
        }

        await prisma.dealer.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Dealer deleted successfully'
        })

    } catch (error: any) {
        console.error('Error deleting dealer:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete dealer' },
            { status: 500 }
        )
    }
}
