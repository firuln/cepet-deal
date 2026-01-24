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
                username: true,
                phone: true,
                whatsapp: true,
                location: true,
                bio: true,
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
            activeListingsCount: user._count.listings,
            favoritesCount: user._count.favorites,
            unreadMessagesCount: user._count.receivedMessages,
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
        const {
            name,
            username,
            phone,
            whatsapp,
            location,
            bio,
            avatar,
            currentPassword,
            newPassword,
            showroomName,
            showroomAddress,
            establishedYear,
        } = data

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { dealer: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if username is already taken by another user (only if field exists)
        if (username && username !== user.username) {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: { username }
                })

                if (existingUser && existingUser.id !== user.id) {
                    return NextResponse.json(
                        { error: 'Username already taken' },
                        { status: 400 }
                    )
                }
            } catch (error: any) {
                // If username field doesn't exist in database yet, skip validation
                console.error('Username validation skipped:', error.message)
            }
        }

        // Prepare update data
        const updateData: any = {}

        if (name) updateData.name = name
        if (username !== undefined) updateData.username = username || null
        if (phone !== undefined) updateData.phone = phone || null
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null
        if (location !== undefined) updateData.location = location || null
        if (bio !== undefined) updateData.bio = bio || null
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
                username: true,
                phone: true,
                whatsapp: true,
                location: true,
                bio: true,
                avatar: true,
                role: true,
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
                }
            }
        })

        // Update dealer info if user is a dealer
        if (user.role === 'DEALER') {
            const dealerData: any = {}
            if (showroomName !== undefined) dealerData.companyName = showroomName || null
            if (showroomAddress !== undefined) dealerData.address = showroomAddress || null

            if (Object.keys(dealerData).length > 0) {
                if (user.dealer) {
                    await prisma.dealer.update({
                        where: { userId: user.id },
                        data: dealerData
                    })
                } else {
                    await prisma.dealer.create({
                        data: {
                            userId: user.id,
                            ...dealerData
                        }
                    })
                }

                // Fetch updated user with dealer
                const userWithDealer = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        phone: true,
                        whatsapp: true,
                        location: true,
                        bio: true,
                        avatar: true,
                        role: true,
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
                        }
                    }
                })

                return NextResponse.json(userWithDealer)
            }
        }

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update user profile' },
            { status: 500 }
        )
    }
}
