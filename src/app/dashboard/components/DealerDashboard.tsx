'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    Car,
    Heart,
    MessageSquare,
    Eye,
    TrendingUp,
    Clock,
    Plus,
    ArrowUpRight,
    Shield,
    Star,
    Award,
    Calendar,
    Filter,
    ChevronDown,
    Loader2,
    BarChart3,
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
    image: string
    createdAt: string
}

interface Activity {
    type: 'sold' | 'inquiry' | 'favorite' | 'view'
    message: string
    time: string
}

interface Stat {
    label: string
    value: number
    icon: any
    color: string
    trend?: number
}

interface StatsResponse {
    stats: {
        totalListings: number
        soldListings: number
        newMessages: number
        totalViews: number
        recentViews: number
        recentFavorites: number
        listingsTrend: number
    }
}

interface ActivitiesResponse {
    activities: Activity[]
}

// Date range options
const dateRanges = [
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: '90d', label: '90 Hari Terakhir' },
    { value: 'all', label: 'Semua Waktu' },
]

// Status filter options
const statusFilters = [
    { value: 'all', label: 'Semua Status' },
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'SOLD', label: 'Terjual' },
    { value: 'PENDING', label: 'Pending' },
]

// Sort options
const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price_high', label: 'Harga Tertinggi' },
    { value: 'price_low', label: 'Harga Terendah' },
]

export function DealerDashboard() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<Stat[]>([
        { label: 'Total Iklan', value: 0, icon: Car, color: 'bg-blue-500' },
        { label: 'Mobil Terjual', value: 0, icon: Award, color: 'bg-green-500' },
        { label: 'Pesan Baru', value: 0, icon: MessageSquare, color: 'bg-orange-500' },
        { label: 'Total Views', value: 0, icon: Eye, color: 'bg-purple-500' },
    ])
    const [listings, setListings] = useState<Listing[]>([])
    const [activities, setActivities] = useState<Activity[]>([])

    // Filter & Sort states
    const [dateRange, setDateRange] = useState('30d')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Dropdown states
    const [dateRangeOpen, setDateRangeOpen] = useState(false)
    const [statusFilterOpen, setStatusFilterOpen] = useState(false)
    const [sortByOpen, setSortByOpen] = useState(false)

    // Fetch stats
    const fetchStats = async (range: string) => {
        try {
            const res = await fetch(`/api/dashboard/stats?range=${range}`)
            if (res.ok) {
                const data: StatsResponse = await res.json()
                setStats([
                    {
                        label: 'Total Iklan',
                        value: data.stats.totalListings,
                        icon: Car,
                        color: 'bg-blue-500',
                        trend: data.stats.listingsTrend
                    },
                    {
                        label: 'Mobil Terjual',
                        value: data.stats.soldListings,
                        icon: Award,
                        color: 'bg-green-500'
                    },
                    {
                        label: 'Pesan Baru',
                        value: data.stats.newMessages,
                        icon: MessageSquare,
                        color: 'bg-orange-500'
                    },
                    {
                        label: 'Total Views',
                        value: data.stats.totalViews,
                        icon: Eye,
                        color: 'bg-purple-500'
                    },
                ])
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        }
    }

    // Fetch listings
    const fetchListings = async () => {
        try {
            const res = await fetch('/api/listings')
            if (res.ok) {
                const data: Listing[] = await res.json()
                setListings(data)
            } else {
                console.error('Failed to fetch listings')
            }
        } catch (err) {
            console.error('Failed to fetch listings:', err)
        }
    }

    // Fetch activities
    const fetchActivities = async (range: string) => {
        try {
            const res = await fetch(`/api/dashboard/activities?range=${range}`)
            if (res.ok) {
                const data: ActivitiesResponse = await res.json()
                setActivities(data.activities)
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
                    fetchStats(dateRange),
                    fetchListings(),
                    fetchActivities(dateRange)
                ])
            } catch (err) {
                setError('Gagal memuat data. Silakan coba lagi.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Refresh when date range changes
    useEffect(() => {
        if (!isLoading) {
            fetchStats(dateRange)
            fetchActivities(dateRange)
        }
    }, [dateRange])

    // Filter and sort listings
    const filteredListings = listings
        .filter(listing => statusFilter === 'all' || listing.status === statusFilter)
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case 'price_high':
                    return b.price - a.price
                case 'price_low':
                    return a.price - b.price
                default:
                    return 0
            }
        })

    // Pagination
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleRefresh = () => {
        setIsLoading(true)
        setError(null)

        Promise.all([
            fetchStats(dateRange),
            fetchListings(),
            fetchActivities(dateRange)
        ]).finally(() => {
            setIsLoading(false)
        })
    }

    return (
        <>
            {/* Header with Verification Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-secondary">
                            {session?.user?.name || 'Dealer'}
                        </h1>
                        <Badge variant="success" className="flex items-center gap-1 text-xs">
                            <Shield className="w-3 h-3" />
                            Verified Dealer
                        </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-500">
                        Kelola iklan dan pantau performa showroom Anda
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="shrink-0"
                    >
                        <Loader2 className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Link href="/dashboard/listings/used">
                        <Button size="sm" className="shrink-0">
                            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Pasang Iklan</span>
                            <span className="sm:hidden">Pasang</span>
                        </Button>
                    </Link>
                </div>
            </div>

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

            {/* Dealer Stats Banner - Responsive */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left Info */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-secondary text-sm sm:text-base">Performa Showroom</p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Rating <span className="font-bold text-amber-600">4.8</span> dari 128 ulasan
                                </p>
                            </div>
                        </div>

                        {/* Right Stats - Stack on mobile, row on desktop */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full md:w-auto">
                            <div className="text-center md:text-left">
                                <p className="text-xl sm:text-2xl font-bold text-primary">72%</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Response Rate</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xl sm:text-2xl font-bold text-accent">2jam</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Avg. Response</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xl sm:text-2xl font-bold text-secondary">{stats[1]?.value || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Mobil Terjual</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid - Responsive with md breakpoint */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.label}</p>
                                    {isLoading ? (
                                        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                    ) : (
                                        <>
                                            <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                                {formatNumber(stat.value)}
                                            </p>
                                            {stat.trend !== undefined && (
                                                <p className={`text-[10px] sm:text-xs mt-1 hidden sm:block ${
                                                    stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {/* Recent Listings */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            {/* Header with Filter & Sort */}
                            <div className="p-3 sm:p-5 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <h2 className="font-semibold text-secondary text-sm sm:text-base">
                                        Iklan Terbaru
                                        <span className="text-gray-400 font-normal ml-2">({filteredListings.length})</span>
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {/* Status Filter */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">{statusFilters.find(f => f.value === statusFilter)?.label}</span>
                                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            {statusFilterOpen && (
                                                <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                    {statusFilters.map((filter) => (
                                                        <button
                                                            key={filter.value}
                                                            onClick={() => {
                                                                setStatusFilter(filter.value)
                                                                setStatusFilterOpen(false)
                                                                setCurrentPage(1)
                                                            }}
                                                            className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${
                                                                statusFilter === filter.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {filter.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sort */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setSortByOpen(!sortByOpen)}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">{sortOptions.find(f => f.value === sortBy)?.label}</span>
                                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            {sortByOpen && (
                                                <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                    {sortOptions.map((sort) => (
                                                        <button
                                                            key={sort.value}
                                                            onClick={() => {
                                                                setSortBy(sort.value)
                                                                setSortByOpen(false)
                                                            }}
                                                            className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${
                                                                sortBy === sort.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {sort.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href="/dashboard/listings"
                                            className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
                                        >
                                            <span className="hidden sm:inline">Lihat Semua</span>
                                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Listings */}
                            {isLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse bg-gray-100 h-20 sm:h-24 rounded-lg" />
                                    ))}
                                </div>
                            ) : paginatedListings.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                    <Car className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm sm:text-base">Tidak ada iklan ditemukan</p>
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100">
                                        {paginatedListings.map((listing) => (
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
                                                    <div className="flex-1 min-w-0 flex-1">
                                                        <h3 className="font-medium text-secondary text-sm sm:text-base truncate">
                                                            {listing.title}
                                                        </h3>
                                                        <p className="text-primary font-semibold text-sm mt-0.5">
                                                            {formatCurrency(listing.price)}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-gray-500">
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

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-t border-gray-100">
                                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredListings.length)} dari {filteredListings.length}
                                            </p>
                                            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                >
                                                    ←
                                                </button>
                                                <span className="text-xs sm:text-sm text-gray-600">
                                                    {currentPage} / {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-3 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-semibold text-secondary text-sm sm:text-base">Aktivitas Terbaru</h2>
                                <div className="relative">
                                    <button
                                        onClick={() => setDateRangeOpen(!dateRangeOpen)}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{dateRanges.find(r => r.value === dateRange)?.label.split(' ')[0]}</span>
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    {dateRangeOpen && (
                                        <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                            {dateRanges.map((range) => (
                                                <button
                                                    key={range.value}
                                                    onClick={() => {
                                                        setDateRange(range.value)
                                                        setDateRangeOpen(false)
                                                    }}
                                                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${
                                                        dateRange === range.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                                                    }`}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="animate-pulse bg-gray-100 h-14 rounded-lg" />
                                        ))}
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="p-6 sm:p-8 text-center text-gray-500">
                                        <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm sm:text-base">Belum ada aktivitas</p>
                                    </div>
                                ) : (
                                    activities.map((activity, index) => (
                                        <div key={index} className="p-3 sm:p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                activity.type === 'sold' ? 'bg-green-100 text-green-600' :
                                                    activity.type === 'inquiry' ? 'bg-orange-100 text-orange-600' :
                                                        activity.type === 'favorite' ? 'bg-red-100 text-red-600' :
                                                            'bg-purple-100 text-purple-600'
                                            }`}>
                                                {activity.type === 'sold' && <Award className="w-4 h-4" />}
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
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions - Better responsive breakpoints */}
            <Card>
                <CardContent className="p-3 sm:p-5">
                    <h2 className="font-semibold text-secondary mb-3 sm:mb-4 text-sm sm:text-base">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <Link
                            href="/dashboard/listings/used"
                            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-center"
                        >
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Pasang Iklan</span>
                        </Link>
                        <Link
                            href="/dashboard/listings"
                            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center"
                        >
                            <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Daftar Iklan</span>
                        </Link>
                        <Link
                            href="/dashboard/favorites"
                            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-center"
                        >
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                            <span className="text-xs sm:text-sm font-medium text-secondary">Favorit</span>
                        </Link>
                        <Link
                            href="/dashboard/messages"
                            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
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
