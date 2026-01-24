import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/brands
 * Get all brands with listing counts
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const includeModels = searchParams.get('includeModels') === 'true'

        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                createdAt: true,
                _count: {
                    select: {
                        listings: {
                            where: {
                                status: 'ACTIVE'
                            }
                        }
                    }
                },
                ...(includeModels && {
                    models: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        },
                        orderBy: { name: 'asc' }
                    }
                })
            }
        })

        return NextResponse.json(brands)
    } catch (error: any) {
        console.error('Error fetching brands:', error)
        return NextResponse.json(
            { error: 'Failed to fetch brands' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/brands
 * Create a new brand (Admin only)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
        }

        const data = await req.json()
        const { name, logo } = data

        if (!name) {
            return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
        }

        // Generate slug from name
        const slug = name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')

        // Check if brand already exists
        const existingBrand = await prisma.brand.findUnique({
            where: { slug }
        })

        if (existingBrand) {
            return NextResponse.json({ error: 'Brand already exists' }, { status: 409 })
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logo: logo || null
            }
        })

        return NextResponse.json(brand, { status: 201 })
    } catch (error: any) {
        console.error('Error creating brand:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create brand' },
            { status: 500 }
        )
    }
}
