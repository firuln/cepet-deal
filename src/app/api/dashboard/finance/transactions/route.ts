import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function calculateStartDate(range: string): Date {
    const now = new Date()
    switch (range) {
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '90d':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        case 'all':
            return new Date(0)
        case 'custom':
            return new Date(0)
        case '30d':
        default:
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has finance feature enabled
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { financeEnabled: true }
        })

        if (!user?.financeEnabled) {
            return NextResponse.json({
                error: 'Fitur keuangan belum diaktifkan. Silakan hubungi admin.'
            }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const range = searchParams.get('range') || '30d'
        const customStart = searchParams.get('startDate')
        const customEnd = searchParams.get('endDate')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        let startDate = calculateStartDate(range)
        const endDate = new Date()

        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart)
            endDate.setHours(23, 59, 59, 999)
        }

        // Get total count for pagination
        const total = await prisma.receipt.count({
            where: {
                dealerId: session.user.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        const receipts = await prisma.receipt.findMany({
            where: {
                dealerId: session.user.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                listing: {
                    include: {
                        brand: true,
                        model: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            },
            skip: (page - 1) * limit,
            take: limit
        })

        const transactions = receipts.map(r => ({
            id: r.id,
            receiptNumber: r.receiptNumber,
            vehicle: `${r.listing.brand.name} ${r.listing.model.name} ${r.listing.year}`,
            buyer: r.buyerName,
            paymentMethod: r.paymentMethod,
            totalPrice: Number(r.totalPrice),
            downPayment: Number(r.downPayment),
            tandaJadi: Number(r.tandaJadi || 0),
            remainingPayment: Number(r.remainingPayment || 0),
            collected: Number(r.downPayment) + Number(r.tandaJadi || 0),
            createdAt: r.createdAt,
            listingId: r.listingId
        }))

        return NextResponse.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch transactions' },
            { status: 500 }
        )
    }
}
