'use client'

import { useState, useEffect } from 'react'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Car,
    Eye,
    MessageSquare,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface MonthlyData {
    month: string
    users: number
    listings: number
    views: number
}

export default function AdminAnalyticsPage() {
    const [period, setPeriod] = useState('month')
    const [isLoading, setIsLoading] = useState(true)

    const [summaryStats, setSummaryStats] = useState({
        totalRevenue: 0,
        totalUsers: 0,
        totalListings: 0,
        totalViews: 0,
        userGrowth: 0,
        listingGrowth: 0,
    })

    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

    useEffect(() => {
        // Sample data
        setSummaryStats({
            totalRevenue: 125000000,
            totalUsers: 1245,
            totalListings: 3842,
            totalViews: 125840,
            userGrowth: 12.5,
            listingGrowth: 8.3,
        })

        setMonthlyData([
            { month: 'Jan', users: 85, listings: 234, views: 12500 },
            { month: 'Feb', users: 92, listings: 256, views: 14200 },
            { month: 'Mar', users: 112, listings: 312, views: 18900 },
            { month: 'Apr', users: 98, listings: 289, views: 16700 },
            { month: 'Mei', users: 134, listings: 378, views: 22100 },
            { month: 'Jun', users: 156, listings: 421, views: 28500 },
        ])

        setIsLoading(false)
    }, [period])

    const topPerformers = [
        { title: 'Toyota Fortuner VRZ 2023', views: 1234, inquiries: 45 },
        { title: 'Honda HR-V SE 2024', views: 987, inquiries: 38 },
        { title: 'Mitsubishi Xpander Ultimate', views: 856, inquiries: 32 },
        { title: 'Hyundai Creta Prime 2024', views: 743, inquiries: 28 },
        { title: 'Suzuki XL7 Alpha 2023', views: 698, inquiries: 25 },
    ]

    const topLocations = [
        { city: 'Jakarta', listings: 1245, percentage: 32 },
        { city: 'Surabaya', listings: 567, percentage: 15 },
        { city: 'Bandung', listings: 423, percentage: 11 },
        { city: 'Medan', listings: 312, percentage: 8 },
        { city: 'Semarang', listings: 256, percentage: 7 },
    ]

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-gray-400 mt-1">Analisis performa platform</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="week">7 Hari Terakhir</option>
                    <option value="month">30 Hari Terakhir</option>
                    <option value="quarter">3 Bulan Terakhir</option>
                    <option value="year">1 Tahun</option>
                </select>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            +15.2%
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summaryStats.totalRevenue)}</p>
                    <p className="text-sm text-gray-400 mt-1">Estimasi Nilai Transaksi</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            +{summaryStats.userGrowth}%
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatNumber(summaryStats.totalUsers)}</p>
                    <p className="text-sm text-gray-400 mt-1">Total User</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            +{summaryStats.listingGrowth}%
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatNumber(summaryStats.totalListings)}</p>
                    <p className="text-sm text-gray-400 mt-1">Total Iklan</p>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            +22.1%
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatNumber(summaryStats.totalViews)}</p>
                    <p className="text-sm text-gray-400 mt-1">Total Views</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Trend - Simple Bar Representation */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Trend Bulanan</h2>
                    <div className="space-y-4">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">{data.month}</span>
                                    <span className="text-white">{data.listings} iklan</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                                        style={{ width: `${(data.listings / 500) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performing Listings */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Iklan Terpopuler</h2>
                    <div className="space-y-4">
                        {topPerformers.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">
                                        {index + 1}
                                    </span>
                                    <span className="text-gray-300 text-sm">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {formatNumber(item.views)}
                                    </span>
                                    <span className="text-primary flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        {item.inquiries}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Location Stats */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Distribusi Lokasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topLocations.map((location, index) => (
                        <div key={index} className="text-center p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-2xl font-bold text-white">{location.percentage}%</p>
                            <p className="text-sm text-gray-400 mt-1">{location.city}</p>
                            <p className="text-xs text-gray-500">{formatNumber(location.listings)} iklan</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
