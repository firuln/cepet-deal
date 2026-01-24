import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ReviewStatus } from '@prisma/client'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * PUT /api/admin/reviews/[id]
 * Update review status (admin only)
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await req.json()
        const { status, response } = data

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: { id }
        })

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        // Update review
        const updateData: any = {
            status: (status || review.status).toUpperCase() as ReviewStatus
        }

        if (response !== undefined) {
            updateData.response = response
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: updateData,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            review: updatedReview
        })
    } catch (error: any) {
        console.error('Error updating review:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update review' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete or hide review (admin only)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Instead of deleting, mark as hidden
        await prisma.review.update({
            where: { id },
            data: { status: 'HIDDEN' as ReviewStatus }
        })

        return NextResponse.json({
            success: true,
            message: 'Review hidden successfully'
        })
    } catch (error: any) {
        console.error('Error hiding review:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to hide review' },
            { status: 500 }
        )
    }
}
