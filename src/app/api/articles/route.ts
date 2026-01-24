import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ArticleCategory, ArticleStatus } from '@prisma/client'

/**
 * GET /api/articles
 * Get all published articles (public)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const featured = searchParams.get('featured') === 'true'

        // Build where clause
        const where: any = {
            status: 'PUBLISHED' as ArticleStatus
        }

        if (category) {
            where.category = category.toUpperCase() as ArticleCategory
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (featured) {
            where.featured = true
        }

        // Get total count
        const total = await prisma.article.count({ where })

        // Fetch articles
        const articles = await prisma.article.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
                category: true,
                tags: true,
                views: true,
                publishedAt: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json({
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error: any) {
        console.error('Error fetching articles:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch articles' },
            { status: 500 }
        )
    }
}
