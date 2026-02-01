import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportFinanceReportToPDF } from '@/lib/exporters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PROFIT_MARGIN = 0.15

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

        let startDate = calculateStartDate(range)
        const endDate = new Date()

        let customDate = undefined
        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart)
            customDate = { startDate, endDate: new Date(customEnd) }
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

        // Calculate stats
        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.totalPrice), 0)
        const totalSales = receipts.length
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0
        const totalProfit = totalRevenue * PROFIT_MARGIN

        const cashReceipts = receipts.filter(r => r.paymentMethod === 'CASH')
        const creditReceipts = receipts.filter(r => r.paymentMethod === 'CREDIT')

        const totalCollected = receipts.reduce((sum, r) => {
            return sum + Number(r.downPayment) + Number(r.tandaJadi || 0)
        }, 0)

        const totalPending = receipts.reduce((sum, r) => {
            return sum + Number(r.remainingPayment || 0)
        }, 0)

        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

        const stats = {
            totalRevenue,
            totalSales,
            averageSaleValue,
            totalProfit,
            profitMargin: PROFIT_MARGIN * 100,
            cashSales: cashReceipts.length,
            creditSales: creditReceipts.length,
            totalCollected,
            totalPending,
            collectionRate
        }

        // Calculate trends
        const dailyMap = new Map()
        receipts.forEach(r => {
            const dateKey = r.createdAt.toISOString().split('T')[0]
            const existing = dailyMap.get(dateKey) || { date: dateKey, revenue: 0, sales: 0, profit: 0 }
            existing.revenue += Number(r.totalPrice)
            existing.sales += 1
            existing.profit += Number(r.totalPrice) * PROFIT_MARGIN
            dailyMap.set(dateKey, existing)
        })

        const daily = Array.from(dailyMap.values())

        const paymentMethodMap = new Map()
        receipts.forEach(r => {
            const method = r.paymentMethod
            const existing = paymentMethodMap.get(method) || { method, count: 0, revenue: 0 }
            existing.count += 1
            existing.revenue += Number(r.totalPrice)
            paymentMethodMap.set(method, existing)
        })

        const byPaymentMethod = Array.from(paymentMethodMap.values()).map(item => ({
            ...item,
            percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
        }))

        const brandMap = new Map()
        receipts.forEach(r => {
            const brand = r.listing?.brand?.name || 'Unknown'
            const existing = brandMap.get(brand) || { brand, sales: 0, revenue: 0 }
            existing.sales += 1
            existing.revenue += Number(r.totalPrice)
            brandMap.set(brand, existing)
        })

        const byBrand = Array.from(brandMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Monthly trends (last 6 months)
        const monthlyMap = new Map()
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
            monthlyMap.set(monthLabel, { month: monthLabel, revenue: 0, sales: 0 })
        }

        receipts.forEach(r => {
            const monthLabel = r.createdAt.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
            const existing = monthlyMap.get(monthLabel)
            if (existing) {
                existing.revenue += Number(r.totalPrice)
                existing.sales += 1
            }
        })

        const monthlyComparison = Array.from(monthlyMap.values())

        const trends = {
            daily,
            byPaymentMethod,
            byBrand,
            monthlyComparison
        }

        // Format transactions
        const transactions = receipts.map(r => ({
            receiptNumber: r.receiptNumber,
            vehicle: `${r.listing.brand.name} ${r.listing.model.name} ${r.listing.year}`,
            buyer: r.buyerName,
            paymentMethod: r.paymentMethod,
            totalPrice: Number(r.totalPrice),
            downPayment: Number(r.downPayment),
            tandaJadi: Number(r.tandaJadi || 0),
            remainingPayment: Number(r.remainingPayment || 0),
            collected: Number(r.downPayment) + Number(r.tandaJadi || 0),
            createdAt: r.createdAt
        }))

        const pdfBlob = await exportFinanceReportToPDF(stats, trends, transactions, range, customDate)

        return new NextResponse(pdfBlob, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="laporan-keuangan-${Date.now()}.pdf"`,
            },
        })

    } catch (error: any) {
        console.error('Error exporting PDF:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to export PDF' },
            { status: 500 }
        )
    }
}
