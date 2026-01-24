import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/messages/unread
 * Get unread message count for current user
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

        // Count unread received messages
        const unreadCount = await prisma.message.count({
            where: {
                receiverId: user.id,
                readAt: null
            }
        })

        return NextResponse.json({
            count: unreadCount
        })
    } catch (error: any) {
        console.error('Error fetching unread count:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch unread count' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/messages/unread
 * Mark all messages as read
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
        const { senderId } = data

        // Mark messages as read
        const updateData: any = {
            receiverId: user.id,
            readAt: null
        }

        if (senderId) {
            updateData.senderId = senderId
        }

        const result = await prisma.message.updateMany({
            where: updateData,
            data: {
                readAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            markedAsRead: result.count
        })
    } catch (error: any) {
        console.error('Error marking messages as read:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to mark messages as read' },
            { status: 500 }
        )
    }
}
