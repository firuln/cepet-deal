import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/messages
 * Get all conversations for current user
 */
export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url)
        const unreadOnly = searchParams.get('unreadOnly') === 'true'

        // Get all unique conversations
        // A conversation is identified by the other user's ID
        const sentMessages = await prisma.message.findMany({
            where: {
                senderId: user.id,
                ...(unreadOnly && { receiver: { receivedMessages: { some: { readAt: null } } } })
            },
            select: {
                receiverId: true,
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true
                    }
                },
                listingId: true,
                listing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: true,
                        price: true
                    }
                },
                content: true,
                createdAt: true,
                readAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        const receivedMessages = await prisma.message.findMany({
            where: {
                receiverId: user.id
            },
            select: {
                senderId: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true
                    }
                },
                listingId: true,
                listing: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: true,
                        price: true
                    }
                },
                content: true,
                createdAt: true,
                readAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        // Combine and deduplicate conversations
        const conversationsMap = new Map()

        // Process received messages
        for (const msg of receivedMessages) {
            const key = msg.senderId
            if (!conversationsMap.has(key)) {
                conversationsMap.set(key, {
                    otherUser: msg.sender,
                    listingId: msg.listingId,
                    listing: msg.listing,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: msg.readAt === null ? 1 : 0,
                    isSender: false
                })
            } else {
                const conv = conversationsMap.get(key)
                if (msg.createdAt > conv.lastMessageAt) {
                    conv.lastMessage = msg.content
                    conv.lastMessageAt = msg.createdAt
                }
                if (msg.readAt === null) {
                    conv.unreadCount++
                }
            }
        }

        // Process sent messages
        for (const msg of sentMessages) {
            const key = msg.receiverId
            if (!conversationsMap.has(key)) {
                conversationsMap.set(key, {
                    otherUser: msg.receiver,
                    listingId: msg.listingId,
                    listing: msg.listing,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0,
                    isSender: true
                })
            } else {
                const conv = conversationsMap.get(key)
                if (msg.createdAt > conv.lastMessageAt) {
                    conv.lastMessage = msg.content
                    conv.lastMessageAt = msg.createdAt
                    conv.isSender = true
                }
            }
        }

        // Convert to array and sort by last message time
        const conversations = Array.from(conversationsMap.values())
            .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
            .filter(conv => !unreadOnly || conv.unreadCount > 0)

        return NextResponse.json(conversations)
    } catch (error: any) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch conversations' },
            { status: 500 }
        )
    }
}
