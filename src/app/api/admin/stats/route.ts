import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/stats
 * Get dashboard statistics for admin
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const period = searchParams.get('period') || '30' // default 30 days

        const days = parseInt(period)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // Get all counts in parallel for better performance
        const [
            totalUsers,
            totalListings,
            totalDealers,
            pendingListings,
            pendingDealers,
            activeListings,
            soldListings,
            todayUsers,
            todayListings,
            listingStatusCounts,
            userRoleCounts,
            listingsByCondition,
            listingsByBrand,
            listingsOverTime,
            usersOverTime,
            recentActivities
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Total listings
            prisma.listing.count(),

            // Total dealers
            prisma.dealer.count(),

            // Pending listings
            prisma.listing.count({
                where: { status: 'PENDING' }
            }),

            // Pending dealers
            prisma.dealer.count({
                where: { verified: false }
            }),

            // Active listings
            prisma.listing.count({
                where: { status: 'ACTIVE' }
            }),

            // Sold listings
            prisma.listing.count({
                where: { status: 'SOLD' }
            }),

            // Today's new users
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),

            // Today's new listings
            prisma.listing.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),

            // Listing status breakdown
            prisma.listing.groupBy({
                by: ['status'],
                _count: true
            }),

            // User role breakdown
            prisma.user.groupBy({
                by: ['role'],
                _count: true
            }),

            // Listings by condition
            prisma.listing.groupBy({
                by: ['condition'],
                _count: true,
                where: { status: 'ACTIVE' }
            }),

            // Top brands by listing count
            prisma.brand.findMany({
                take: 10,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    _count: {
                        select: {
                            listings: {
                                where: { status: 'ACTIVE' }
                            }
                        }
                    }
                },
                orderBy: {
                    listings: {
                        _count: 'desc'
                    }
                }
            }),

            // Listings over time (last N days)
            prisma.listing.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate }
                },
                _count: true
            }),

            // Users over time (last N days)
            prisma.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate }
                },
                _count: true
            }),

            // Recent activities
            prisma.listing.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            dealer: {
                                select: {
                                    companyName: true
                                }
                            }
                        }
                    },
                    brand: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ])

        // Format listings over time for charts
        const listingsChart = formatChartData(listingsOverTime, days)
        const usersChart = formatChartData(usersOverTime, days)

        // Calculate average price of active listings
        const avgPriceResult = await prisma.listing.aggregate({
            where: { status: 'ACTIVE' },
            _avg: { price: true }
        })

        return NextResponse.json({
            // Overview stats
            overview: {
                totalUsers,
                totalListings,
                totalDealers,
                pendingListings,
                pendingDealers,
                activeListings,
                soldListings,
                todayUsers,
                todayListings,
                avgPrice: avgPriceResult._avg.price?.toString() || '0'
            },

            // Listing breakdown
            listings: {
                byStatus: listingStatusCounts.map(item => ({
                    status: item.status,
                    count: item._count
                })),
                byCondition: listingsByCondition.map(item => ({
                    condition: item.condition,
                    count: item._count
                })),
                topBrands: listingsByBrand.map(brand => ({
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                    logo: brand.logo,
                    count: brand._count.listings
                }))
            },

            // User breakdown
            users: {
                byRole: userRoleCounts.map(item => ({
                    role: item.role,
                    count: item._count
                }))
            },

            // Charts data
            charts: {
                listings: listingsChart,
                users: usersChart
            },

            // Recent activities
            recentActivities: recentActivities.map(listing => ({
                id: listing.id,
                title: listing.title,
                status: listing.status,
                price: listing.price.toString(),
                createdAt: listing.createdAt,
                seller: listing.user.dealer?.companyName || listing.user.name,
                brand: listing.brand.name
            }))
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch admin statistics' },
            { status: 500 }
        )
    }
}

/**
 * Helper function to format chart data
 */
function formatChartData(data: any[], days: number) {
    const chartData: { date: string; count: number }[] = []

    // Initialize all dates with 0 count
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        chartData.push({
            date: date.toISOString().split('T')[0],
            count: 0
        })
    }

    // Fill in actual counts
    for (const item of data) {
        const dateStr = new Date(item.createdAt).toISOString().split('T')[0]
        const existingEntry = chartData.find(d => d.date === dateStr)
        if (existingEntry) {
            existingEntry.count += item._count
        }
    }

    return chartData
}
