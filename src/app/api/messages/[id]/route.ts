import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/messages/[id]
 * Get messages with a specific user
 * id = the other user's ID
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: otherUserId } = await params

        // Get messages between current user and other user
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: user.id }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Mark received messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: user.id,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })

        // Transform BigInt price to string
        const transformedMessages = messages.map(msg => ({
            ...msg,
            listing: msg.listing ? {
                ...msg.listing,
                price: msg.listing.price.toString()
            } : null
        }))

        return NextResponse.json(transformedMessages)
    } catch (error: any) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/messages/[id]
 * Send a message to a specific user
 * id = the receiver's ID
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: receiverId } = await params
        const data = await req.json()
        const { content, listingId } = data

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
        }

        // Verify receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId }
        })

        if (!receiver) {
            return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
        }

        // If listingId is provided, verify it exists
        if (listingId) {
            const listing = await prisma.listing.findUnique({
                where: { id: listingId }
            })

            if (!listing) {
                return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                senderId: user.id,
                receiverId: receiverId,
                listingId: listingId || null,
                content: content.trim()
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: true,
                        price: true
                    }
                }
            }
        })

        // Transform BigInt price to string
        const transformedMessage = {
            ...message,
            listing: message.listing ? {
                ...message.listing,
                price: message.listing.price.toString()
            } : null
        }

        return NextResponse.json(transformedMessage, { status: 201 })
    } catch (error: any) {
        console.error('Error sending message:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to send message' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/messages/[id]
 * Delete conversation with a specific user
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: otherUserId } = await params

        // Delete all messages between current user and other user
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: user.id }
                ]
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Conversation deleted'
        })
    } catch (error: any) {
        console.error('Error deleting conversation:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete conversation' },
            { status: 500 }
        )
    }
}
