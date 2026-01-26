import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * PUT /api/users/role
 * Upgrade user role (BUYER -> SELLER)
 */
export async function PUT(req: Request) {
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

        const data = await req.json()
        const { role, reason } = data

        // Validate role
        const validRoles = ['BUYER', 'SELLER', 'DEALER', 'ADMIN']
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Role tidak valid' },
                { status: 400 }
            )
        }

        // Only allow upgrading from BUYER to SELLER
        if (user.role !== 'BUYER') {
            return NextResponse.json(
                { error: 'Anda sudah memiliki role. Hubungi admin untuk perubahan role.' },
                { status: 400 }
            )
        }

        // Only allow upgrade to SELLER (DEALER requires application)
        if (role !== 'SELLER') {
            return NextResponse.json(
                { error: 'Upgrade ke DEALER perlu melalui aplikasi dealer' },
                { status: 400 }
            )
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'SELLER' }
        })

        return NextResponse.json({
            success: true,
            message: 'Role berhasil diupgrade menjadi SELLER',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        })

    } catch (error: any) {
        console.error('Error updating user role:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update user role' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/users/role
 * Get current user role
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            user,
            canUpgradeToSeller: user.role === 'BUYER'
        })

    } catch (error: any) {
        console.error('Error fetching user role:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch user role' },
            { status: 500 }
        )
    }
}
