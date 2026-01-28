import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/testimonials
 * Get all active testimonials
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        // Build where clause
        const where: any = {}
        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
            where.isActive = isActive === 'true'
        }

        // Build orderBy
        const orderBy: any = {}
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'

        // Fetch testimonials
        const testimonials = await prisma.testimonial.findMany({
            where,
            orderBy,
            take: limit,
        })

        return NextResponse.json(
            { testimonials },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                },
            }
        )
    } catch (error: any) {
        console.error('Error fetching testimonials:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch testimonials' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/testimonials
 * Create a new testimonial (admin only)
 */
export async function POST(req: Request) {
    try {
        const session = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
            headers: { cookie: req.headers.get('cookie') || '' },
        }).then(res => res.json())

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { name, role, avatar, content, rating, isActive } = data

        // Validation
        if (!name || !content) {
            return NextResponse.json(
                { error: 'Name and content are required' },
                { status: 400 }
            )
        }

        if (rating && (rating < 1 || rating > 5)) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        // Create testimonial
        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                role: role || null,
                avatar: avatar || null,
                content,
                rating: rating || 5,
                isActive: isActive !== undefined ? isActive : true,
            },
        })

        return NextResponse.json(
            { testimonial },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating testimonial:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create testimonial' },
            { status: 500 }
        )
    }
}
