import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

/**
 * GET /api/users/me
 * Get current user profile
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
                        address: true,
                        city: true,
                        description: true,
                        logo: true,
                        verified: true,
                        verifiedAt: true
                    }
                },
                _count: {
                    select: {
                        listings: {
                            where: {
                                status: 'ACTIVE'
                            }
                        },
                        favorites: true,
                        sentMessages: true,
                        receivedMessages: {
                            where: {
                                readAt: null
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const responseUser = {
            ...user,
            activeListingsCount: user._count.listings.length,
            favoritesCount: user._count.favorites,
            unreadMessagesCount: user._count.receivedMessages.length,
            _count: undefined
        }

        return NextResponse.json(responseUser)
    } catch (error: any) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/users/me
 * Update current user profile
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { name, phone, avatar, currentPassword, newPassword } = data

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                password: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Prepare update data
        const updateData: any = {}

        if (name) updateData.name = name
        if (phone !== undefined) updateData.phone = phone || null
        if (avatar !== undefined) updateData.avatar = avatar || null

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to change password' },
                    { status: 400 }
                )
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 401 }
                )
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.password = hashedPassword
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                updatedAt: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update user profile' },
            { status: 500 }
        )
    }
}
