import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/users/[id]
 * Get user by ID (public profile)
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
                dealer: {
                    select: {
                        id: true,
                        companyName: true,
                        address: true,
                        city: true,
                        description: true,
                        logo: true,
                        verified: true,
                        verifiedAt: true
                    }
                },
                // Include listings if it's the user's own profile or admin
                ...(session?.user?.role === 'ADMIN' || session?.user?.id === id ? {
                    email: true,
                    phone: true,
                    listings: {
                        where: { status: 'ACTIVE' },
                        include: {
                            brand: { select: { id: true, name: true, slug: true } },
                            model: { select: { id: true, name: true, slug: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: {
                            listings: true,
                            favorites: true
                        }
                    }
                } : {
                    _count: {
                        select: {
                            listings: {
                                where: { status: 'ACTIVE' }
                            }
                        }
                    }
                })
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Transform BigInt for listings
        let transformedUser: any = { ...user }
        if ('listings' in user && user.listings) {
            transformedUser.listings = user.listings.map(listing => ({
                ...listing,
                price: listing.price.toString()
            }))
        }

        return NextResponse.json(transformedUser)
    } catch (error: any) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/users/[id]
 * Update user (own profile or admin only)
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await req.json()
        const { name, phone, avatar, role } = data

        // Check permission - only admin or the user themselves
        if (session.user.role !== 'ADMIN' && session.user.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Prepare update data
        const updateData: any = {}

        // Only admin can change role
        if (role && session.user.role === 'ADMIN') {
            if (['ADMIN', 'DEALER', 'SELLER', 'BUYER'].includes(role.toUpperCase())) {
                updateData.role = role.toUpperCase()
            }
        }

        if (name) updateData.name = name
        if (phone !== undefined) updateData.phone = phone || null
        if (avatar !== undefined) updateData.avatar = avatar || null

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json({
            success: true,
            user
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update user' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/users/[id]
 * Delete user (admin only or own account)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check permission - only admin or the user themselves
        if (session.user.role !== 'ADMIN' && session.user.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Prevent the last admin from being deleted
        if (session.user.role === 'ADMIN') {
            const adminCount = await prisma.user.count({
                where: { role: 'ADMIN' }
            })

            const targetUser = await prisma.user.findUnique({
                where: { id },
                select: { role: true }
            })

            if (targetUser?.role === 'ADMIN' && adminCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot delete the last admin account' },
                    { status: 400 }
                )
            }
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete user' },
            { status: 500 }
        )
    }
}
