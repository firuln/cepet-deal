import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PROFIT_MARGIN = 0.15 // 15% fixed margin for MVP

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
            return new Date(0) // Will be overridden by custom dates
        case '30d':
        default:
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
}

async function getComparisonData(dealerId: string, startDate: Date, endDate: Date) {
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodLength)
    const previousEndDate = new Date(startDate.getTime())

    const previousReceipts = await prisma.receipt.findMany({
        where: {
            dealerId,
            createdAt: {
                gte: previousStartDate,
                lt: previousEndDate
            }
        },
        select: { totalPrice: true }
    })

    const previousRevenue = previousReceipts.reduce((sum, r) => sum + Number(r.totalPrice), 0)
    const previousSales = previousReceipts.length
    const previousProfit = previousRevenue * PROFIT_MARGIN

    return { previousRevenue, previousSales, previousProfit }
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

        let startDate = calculateStartDate(range)
        const endDate = new Date()

        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart)
            // Ensure end date is inclusive (end of day)
            endDate.setHours(23, 59, 59, 999)
        }

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
                createdAt: 'desc'
            }
        })

        // Calculate basic stats
        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalPrice), 0)
        const totalSales = receipts.length
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0
        const totalProfit = totalRevenue * PROFIT_MARGIN

        // Payment method breakdown
        const cashReceipts = receipts.filter(r => r.paymentMethod === 'CASH')
        const creditReceipts = receipts.filter(r => r.paymentMethod === 'CREDIT')
        const cashSales = cashReceipts.length
        const creditSales = creditReceipts.length

        // Collection stats
        const totalCollected = receipts.reduce((sum, r) => {
            return sum + Number(r.downPayment) + Number(r.tandaJadi || 0)
        }, 0)

        const totalPending = receipts.reduce((sum, r) => {
            return sum + Number(r.remainingPayment || 0)
        }, 0)

        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

        // Get comparison data
        const { previousRevenue, previousSales, previousProfit } = await getComparisonData(
            session.user.id,
            startDate,
            endDate
        )

        // Calculate percentage changes
        const revenueChange = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0

        const salesChange = previousSales > 0
            ? ((totalSales - previousSales) / previousSales) * 100
            : 0

        const profitChange = previousProfit > 0
            ? ((totalProfit - previousProfit) / previousProfit) * 100
            : 0

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalSales,
                averageSaleValue,
                totalProfit,
                profitMargin: PROFIT_MARGIN * 100,
                cashSales,
                creditSales,
                totalCollected,
                totalPending,
                collectionRate
            },
            comparison: {
                revenueChange,
                salesChange,
                profitChange
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching finance stats:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch finance stats' },
            { status: 500 }
        )
    }
}
