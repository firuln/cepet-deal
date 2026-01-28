'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    Car,
    Heart,
    MessageSquare,
    Eye,
    Plus,
    ArrowUpRight,
    Clock,
    TrendingUp,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Types
interface Listing {
    id: string
    title: string
    price: number
    views: number
    inquiries: number
    status: 'ACTIVE' | 'SOLD' | 'PENDING'
    images: string[]
    createdAt: string
}

interface Activity {
    type: 'view' | 'inquiry' | 'favorite' | 'sold'
    message: string
    time: string
}

interface Stats {
    totalListings: number
    soldListings: number
    newMessages: number
    totalViews: number
    recentViews: number
    recentFavorites: number
}

interface StatsResponse {
    stats: Stats
}

interface ActivitiesResponse {
    activities: Activity[]
}

interface ListingsResponse {
    listings: Listing[]
}

export function SellerDashboard() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Data states
    const [stats, setStats] = useState<Stats>({
        totalListings: 0,
        soldListings: 0,
        newMessages: 0,
        totalViews: 0,
        recentViews: 0,
        recentFavorites: 0,
    })
    const [recentListings, setRecentListings] = useState<Listing[]>([])
    const [recentActivities, setRecentActivities] = useState<Activity[]>([])

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats')
            if (res.ok) {
                const data: StatsResponse = await res.json()
                setStats(data.stats)
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        }
    }

    // Fetch recent listings
    const fetchRecentListings = async () => {
        try {
            const res = await fetch('/api/listings?limit=5&sort=newest')
            if (res.ok) {
                const data: ListingsResponse = await res.json()
                setRecentListings(data.listings || [])
            }
        } catch (err) {
            console.error('Failed to fetch listings:', err)
        }
    }

    // Fetch activities
    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/dashboard/activities?limit=5')
            if (res.ok) {
                const data: ActivitiesResponse = await res.json()
                setRecentActivities(data.activities || [])
            }
        } catch (err) {
            console.error('Failed to fetch activities:', err)
        }
    }

    // Initial fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                await Promise.all([
                    fetchStats(),
                    fetchRecentListings(),
                    fetchActivities()
                ])
            } catch (err) {
                setError('Gagal memuat data. Silakan refresh halaman.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 60) return 'Baru saja'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes} menit lalu`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours} jam lalu`
        const days = Math.floor(hours / 24)
        return `${days} hari lalu`
    }

    return (
        <>
            {/* Error State */}
            {error && (
                <Card className="mb-6 bg-red-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-secondary">
                        Selamat datang, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Kelola iklan dan pantau performa Anda
                    </p>
                </div>
                <Link href="/dashboard/listings/used" className="shrink-0">
                    <Button size="sm" className="text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Pasang Iklan</span>
                        <span className="sm:hidden">Pasang</span>
                    </Button>
                </Link>
            </div>

            {/* Stats Grid - Fully Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Total Iklan</p>
                                {isLoading ? (
                                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                        {stats.totalListings}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Terjual</p>
                                {isLoading ? (
                                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                        {stats.soldListings}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Pesan Baru</p>
                                {isLoading ? (
                                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                        {stats.newMessages}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Total Views</p>
                                {isLoading ? (
                                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                ) : (
                                    <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                        {formatNumber(stats.totalViews)}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Recent Listings */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-100">
                                <h2 className="font-semibold text-secondary text-sm sm:text-base">Iklan Terbaru</h2>
                                <Link
                                    href="/dashboard/listings"
                                    className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <span className="hidden sm:inline">Lihat Semua</span>
                                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Link>
                            </div>
                            {isLoading ? (
                                <div className="p-4 space-y-3 sm:space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse bg-gray-100 h-20 sm:h-24 rounded-lg" />
                                    ))}
                                </div>
                            ) : recentListings.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                    <Car className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm sm:text-base">Belum ada iklan</p>
                                    <Link href="/dashboard/listings/used" className="inline-block mt-3">
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Pasang Iklan Pertama
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentListings.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            href={`/dashboard/listings/${listing.id}/edit`}
                                            className="block"
                                        >
                                            <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors">
                                                <img
                                                    src={listing.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                                                    alt={listing.title}
                                                    className="w-full h-32 sm:w-16 sm:h-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-secondary text-sm sm:text-base truncate">
                                                        {listing.title}
                                                    </h3>
                                                    <p className="text-primary font-semibold text-sm mt-0.5">
                                                        {formatCurrency(listing.price)}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            {listing.views || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" />
                                                            {listing.inquiries || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={listing.status === 'ACTIVE' ? 'success' : listing.status === 'SOLD' ? 'info' : 'warning'}
                                                    size="sm"
                                                    className="shrink-0 self-start sm:self-auto"
                                                >
                                                    {listing.status === 'ACTIVE' ? 'Aktif' : listing.status === 'SOLD' ? 'Terjual' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-3 sm:p-5 border-b border-gray-100">
                                <h2 className="font-semibold text-secondary text-sm sm:text-base">Aktivitas Terbaru</h2>
                            </div>
                            {isLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="animate-pulse bg-gray-100 h-14 rounded-lg" />
                                    ))}
                                </div>
                            ) : recentActivities.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                    <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm sm:text-base">Belum ada aktivitas</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="p-3 sm:p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                activity.type === 'sold' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'inquiry' ? 'bg-orange-100 text-orange-600' :
                                                activity.type === 'favorite' ? 'bg-red-100 text-red-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {activity.type === 'sold' && <TrendingUp className="w-4 h-4" />}
                                                {activity.type === 'inquiry' && <MessageSquare className="w-4 h-4" />}
                                                {activity.type === 'favorite' && <Heart className="w-4 h-4" />}
                                                {activity.type === 'view' && <Eye className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-700">{activity.message}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions - Fully Responsive */}
            <Card>
                <CardContent className="p-3 sm:p-5">
                    <h2 className="font-semibold text-secondary mb-3 sm:mb-4 text-sm sm:text-base">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <Link
                            href="/dashboard/listings/used"
                            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-center"
                        >
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Pasang Iklan</span>
                        </Link>
                        <Link
                            href="/dashboard/listings"
                            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center"
                        >
                            <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Daftar Iklan</span>
                        </Link>
                        <Link
                            href="/dashboard/favorites"
                            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-center"
                        >
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Favorit</span>
                        </Link>
                        <Link
                            href="/dashboard/messages"
                            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
                        >
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Pesan</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
