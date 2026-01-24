'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Car,
    Building2,
    Clock,
    TrendingUp,
    TrendingDown,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface Stats {
    totalUsers: number
    totalListings: number
    totalDealers: number
    pendingListings: number
    pendingDealers: number
    activeListings: number
    totalViews: number
    totalMessages: number
    usersThisMonth: number
    listingsThisMonth: number
}

interface RecentActivity {
    id: string
    type: 'user_register' | 'listing_created' | 'listing_approved' | 'dealer_verified'
    description: string
    time: string
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalListings: 0,
        totalDealers: 0,
        pendingListings: 0,
        pendingDealers: 0,
        activeListings: 0,
        totalViews: 0,
        totalMessages: 0,
        usersThisMonth: 0,
        listingsThisMonth: 0,
    })
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data.stats)
                    setRecentActivities(data.recentActivities || [])
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        // For now, use sample data
        setStats({
            totalUsers: 1245,
            totalListings: 3842,
            totalDealers: 89,
            pendingListings: 24,
            pendingDealers: 5,
            activeListings: 3256,
            totalViews: 125840,
            totalMessages: 4521,
            usersThisMonth: 156,
            listingsThisMonth: 342,
        })
        setRecentActivities([
            { id: '1', type: 'user_register', description: 'User baru: Ahmad Fadli mendaftar', time: '5 menit lalu' },
            { id: '2', type: 'listing_created', description: 'Iklan baru: Toyota Avanza 2024', time: '15 menit lalu' },
            { id: '3', type: 'listing_approved', description: 'Iklan disetujui: Honda HR-V 2023', time: '30 menit lalu' },
            { id: '4', type: 'dealer_verified', description: 'Dealer terverifikasi: Auto Prima Motor', time: '1 jam lalu' },
            { id: '5', type: 'listing_created', description: 'Iklan baru: Mitsubishi Xpander 2023', time: '2 jam lalu' },
        ])
        setIsLoading(false)
    }, [])

    const statCards = [
        {
            title: 'Total User',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            change: `+${stats.usersThisMonth} bulan ini`,
            trend: 'up',
        },
        {
            title: 'Total Iklan',
            value: stats.totalListings,
            icon: Car,
            color: 'bg-green-500',
            change: `+${stats.listingsThisMonth} bulan ini`,
            trend: 'up',
        },
        {
            title: 'Total Dealer',
            value: stats.totalDealers,
            icon: Building2,
            color: 'bg-purple-500',
            change: `${stats.pendingDealers} menunggu verifikasi`,
            trend: 'neutral',
        },
        {
            title: 'Iklan Pending',
            value: stats.pendingListings,
            icon: Clock,
            color: 'bg-yellow-500',
            change: 'Menunggu persetujuan',
            trend: 'neutral',
        },
    ]

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_register':
                return <Users className="w-4 h-4 text-blue-400" />
            case 'listing_created':
                return <Car className="w-4 h-4 text-green-400" />
            case 'listing_approved':
                return <CheckCircle className="w-4 h-4 text-emerald-400" />
            case 'dealer_verified':
                return <Building2 className="w-4 h-4 text-purple-400" />
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />
        }
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Selamat datang di Admin Panel CepetDeal</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 rounded-xl border border-gray-700 p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            {stat.trend === 'up' && (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            )}
                            {stat.trend === 'down' && (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {formatNumber(stat.value)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{stat.title}</p>
                        <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                    </div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{formatNumber(stats.totalViews)}</p>
                            <p className="text-sm text-gray-400">Total Views</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{formatNumber(stats.activeListings)}</p>
                            <p className="text-sm text-gray-400">Iklan Aktif</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{formatNumber(stats.totalMessages)}</p>
                            <p className="text-sm text-gray-400">Total Pesan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Aktivitas Terbaru</h2>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="/admin/listings?status=PENDING"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-sm text-gray-300 text-center">Review Iklan Pending</span>
                            <span className="text-xs text-yellow-400">{stats.pendingListings} menunggu</span>
                        </a>
                        <a
                            href="/admin/dealers?status=pending"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-sm text-gray-300 text-center">Verifikasi Dealer</span>
                            <span className="text-xs text-purple-400">{stats.pendingDealers} menunggu</span>
                        </a>
                        <a
                            href="/admin/users"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-sm text-gray-300 text-center">Kelola User</span>
                        </a>
                        <a
                            href="/admin/listings"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Car className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-sm text-gray-300 text-center">Semua Iklan</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
