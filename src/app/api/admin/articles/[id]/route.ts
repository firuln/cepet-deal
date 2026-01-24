import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ArticleCategory, ArticleStatus } from '@prisma/client'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/articles/[id]
 * Get single article by ID (admin only)
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json(article)
    } catch (error: any) {
        console.error('Error fetching article:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch article' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/articles/[id]
 * Update article (admin only)
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

        // Check if article exists
        const existing = await prisma.article.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // Prepare update data
        const updateData: any = {}

        if (data.title !== undefined) updateData.title = data.title
        if (data.slug !== undefined) updateData.slug = data.slug
        if (data.content !== undefined) updateData.content = data.content
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
        if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage
        if (data.category !== undefined) updateData.category = data.category as ArticleCategory
        if (data.tags !== undefined) updateData.tags = data.tags
        if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle
        if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription

        // Handle status changes
        if (data.status !== undefined) {
            updateData.status = data.status as ArticleStatus
            // Set publishedAt when publishing for the first time
            if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
                updateData.publishedAt = new Date()
            }
        }

        // Update article
        const article = await prisma.article.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            article
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        })
    } catch (error: any) {
        console.error('Error updating article:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update article' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/articles/[id]
 * Delete article (admin only)
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

        // Check if article exists
        const existing = await prisma.article.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        await prisma.article.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Article deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting article:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete article' },
            { status: 500 }
        )
    }
}
