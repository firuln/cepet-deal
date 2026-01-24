import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/articles/[slug]
 * Get single article by slug (public)
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const article = await prisma.article.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // Only return published articles for public access
        if (article.status !== 'PUBLISHED') {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        // Increment view count
        await prisma.article.update({
            where: { id: article.id },
            data: { views: { increment: 1 } }
        })

        return NextResponse.json({
            ...article,
            views: article.views + 1
        })
    } catch (error: any) {
        console.error('Error fetching article:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch article' },
            { status: 500 }
        )
    }
}
