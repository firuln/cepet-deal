import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ArticleCategory, ArticleStatus } from '@prisma/client'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/articles
 * Get all articles (admin only)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status.toUpperCase()
        }

        if (category) {
            where.category = category.toUpperCase()
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } }
            ]
        }

        // Get total count
        const total = await prisma.article.count({ where })

        // Fetch articles
        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
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
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })
    } catch (error: any) {
        console.error('Error fetching admin articles:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch articles' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/articles
 * Create new article (admin only)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const {
            title,
            slug,
            content,
            excerpt,
            featuredImage,
            category,
            tags,
            status,
            metaTitle,
            metaDescription
        } = data

        // Validate required fields
        if (!title || !content || !category) {
            return NextResponse.json(
                { error: 'Title, content, and category are required' },
                { status: 400 }
            )
        }

        // Generate slug from title if not provided
        let finalSlug = slug
        if (!finalSlug) {
            finalSlug = title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
        }

        // Check if slug already exists
        const existing = await prisma.article.findUnique({
            where: { slug: finalSlug }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'An article with this slug already exists' },
                { status: 409 }
            )
        }

        // Create article
        const article = await prisma.article.create({
            data: {
                title,
                slug: finalSlug,
                content,
                excerpt: excerpt || null,
                featuredImage: featuredImage || null,
                category: category as ArticleCategory,
                tags: tags || [],
                status: (status || 'DRAFT').toUpperCase() as ArticleStatus,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                authorId: session.user.id,
                publishedAt: status === 'PUBLISHED' ? new Date() : null
            },
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
        console.error('Error creating article:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create article' },
            { status: 500 }
        )
    }
}
