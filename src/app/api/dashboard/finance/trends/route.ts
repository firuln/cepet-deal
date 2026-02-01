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
                createdAt: 'asc'
            }
        })

        // Daily trends
        const dailyMap = new Map<string, { date: string; revenue: number; sales: number; profit: number }>()

        // Initialize all dates in range
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            dailyMap.set(dateKey, { date: dateKey, revenue: 0, sales: 0, profit: 0 })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Fill in actual data
        receipts.forEach(receipt => {
            const dateKey = receipt.createdAt.toISOString().split('T')[0]
            const existing = dailyMap.get(dateKey) || { date: dateKey, revenue: 0, sales: 0, profit: 0 }
            existing.revenue += Number(receipt.totalPrice)
            existing.sales += 1
            existing.profit += Number(receipt.totalPrice) * PROFIT_MARGIN
            dailyMap.set(dateKey, existing)
        })

        const daily = Array.from(dailyMap.values())

        // Payment method distribution
        const paymentMethodMap = new Map<string, { method: string; count: number; revenue: number }>()

        receipts.forEach(receipt => {
            const method = receipt.paymentMethod
            const existing = paymentMethodMap.get(method) || { method, count: 0, revenue: 0 }
            existing.count += 1
            existing.revenue += Number(receipt.totalPrice)
            paymentMethodMap.set(method, existing)
        })

        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalPrice), 0)
        const byPaymentMethod = Array.from(paymentMethodMap.values()).map(item => ({
            ...item,
            percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
        }))

        // Brand performance
        const brandMap = new Map<string, { brand: string; sales: number; revenue: number }>()

        receipts.forEach(receipt => {
            const brand = receipt.listing?.brand?.name || 'Unknown'
            const existing = brandMap.get(brand) || { brand, sales: 0, revenue: 0 }
            existing.sales += 1
            existing.revenue += Number(receipt.totalPrice)
            brandMap.set(brand, existing)
        })

        // Sort by revenue and take top 5
        const byBrand = Array.from(brandMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Monthly comparison (last 6 months)
        const monthlyMap = new Map<string, { month: string; revenue: number; sales: number }>()

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const monthKey = d.toISOString().slice(0, 7) // YYYY-MM
            const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
            monthlyMap.set(monthKey, { month: monthLabel, revenue: 0, sales: 0 })
        }

        // Fill in actual data
        receipts.forEach(receipt => {
            const monthKey = receipt.createdAt.toISOString().slice(0, 7)
            const existing = monthlyMap.get(monthKey)
            if (existing) {
                existing.revenue += Number(receipt.totalPrice)
                existing.sales += 1
            }
        })

        const monthlyComparison = Array.from(monthlyMap.values())

        return NextResponse.json({
            trends: {
                daily,
                byPaymentMethod,
                byBrand,
                monthlyComparison
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching finance trends:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch finance trends' },
            { status: 500 }
        )
    }
}
