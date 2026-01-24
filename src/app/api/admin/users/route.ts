import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/users
 * Get all users with filters and pagination
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')
        const role = searchParams.get('role')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (role && ['ADMIN', 'DEALER', 'SELLER', 'BUYER'].includes(role.toUpperCase())) {
            where.role = role.toUpperCase()
        }

        // Build order by clause
        const orderBy: any = {}
        orderBy[sortBy] = sortOrder

        // Get total count
        const total = await prisma.user.count({ where })

        // Fetch users
        const users = await prisma.user.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                dealer: {
                    select: {
                        id: true,
                        companyName: true,
                        verified: true
                    }
                },
                _count: {
                    select: {
                        listings: true,
                        favorites: true,
                        sentMessages: true,
                        receivedMessages: true
                    }
                }
            }
        })

        return NextResponse.json({
            users,
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
        console.error('Error fetching admin users:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/users
 * Update user (role, suspend, etc.)
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { id, role, phone, name, suspend } = data

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Prepare update data
        const updateData: any = {}

        if (role && ['ADMIN', 'DEALER', 'SELLER', 'BUYER'].includes(role.toUpperCase())) {
            updateData.role = role.toUpperCase()
        }

        if (name) updateData.name = name
        if (phone !== undefined) updateData.phone = phone || null

        // Note: For suspension, you might want to add a 'suspended' field to the User model
        // For now, we'll use a simple approach - you could add an 'isActive' field later

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
 * DELETE /api/admin/users
 * Delete a user
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
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Prevent deleting yourself
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (user?.id === id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
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
