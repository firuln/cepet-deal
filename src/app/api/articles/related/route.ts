import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ArticleCategory } from '@prisma/client'

/**
 * GET /api/articles/related
 * Get related articles based on category and tags
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const articleId = searchParams.get('articleId')
        const category = searchParams.get('category')
        const limit = parseInt(searchParams.get('limit') || '4')

        if (!category) {
            return NextResponse.json({ articles: [] })
        }

        const articles = await prisma.article.findMany({
            where: {
                status: 'PUBLISHED',
                category: category.toUpperCase() as ArticleCategory,
                id: { not: articleId || '' }
            },
            orderBy: { views: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
                category: true,
                views: true,
                publishedAt: true,
                createdAt: true
            }
        })

        return NextResponse.json({ articles })
    } catch (error: any) {
        console.error('Error fetching related articles:', error)
        return NextResponse.json({ articles: [] })
    }
}
