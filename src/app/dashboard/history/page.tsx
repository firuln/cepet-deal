'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Eye,
    Car,
    Clock,
    ArrowRight,
    Filter,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Badge, Dropdown } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface ViewedListing {
    id: string
    title: string
    slug: string
    price: number
    year: number
    mileage: number
    location: string
    image: string
    condition: 'NEW' | 'USED'
    viewedAt: string
    brand: string
    model: string
}

const timeFilterOptions = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' },
]

export default function HistoryPage() {
    const [viewedListings, setViewedListings] = useState<ViewedListing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [timeFilter, setTimeFilter] = useState('all')

    useEffect(() => {
        async function fetchHistory() {
            try {
                // Get history from localStorage
                const historyData = localStorage.getItem('viewedListings')
                if (historyData) {
                    const parsed = JSON.parse(historyData)

                    // Apply time filter
                    const now = new Date()
                    let filtered = parsed

                    if (timeFilter === 'today') {
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                        filtered = parsed.filter((item: ViewedListing) => new Date(item.viewedAt).getTime() >= today)
                    } else if (timeFilter === 'week') {
                        const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
                        filtered = parsed.filter((item: ViewedListing) => new Date(item.viewedAt).getTime() >= weekAgo)
                    } else if (timeFilter === 'month') {
                        const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000
                        filtered = parsed.filter((item: ViewedListing) => new Date(item.viewedAt).getTime() >= monthAgo)
                    }

                    // Sort by viewedAt (most recent first)
                    filtered.sort((a: ViewedListing, b: ViewedListing) =>
                        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
                    )

                    setViewedListings(filtered)
                }
            } catch (error) {
                console.error('Error fetching history:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [timeFilter])

    const formatViewedTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit yang lalu`
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        if (diffDays < 7) return `${diffDays} hari yang lalu`

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const clearHistory = () => {
        if (confirm('Hapus semua riwayat penelusuran?')) {
            localStorage.removeItem('viewedListings')
            setViewedListings([])
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" />
                            Riwayat Penelusuran
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Mobil yang pernah Anda lihat
                        </p>
                    </div>
                    {viewedListings.length > 0 && (
                        <Button variant="outline" onClick={clearHistory}>
                            Hapus Riwayat
                        </Button>
                    )}
                </div>

                {/* Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <Dropdown
                                options={timeFilterOptions}
                                value={timeFilter}
                                onChange={(val) => setTimeFilter(val)}
                                placeholder="Filter Waktu"
                                className="sm:w-48"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Memuat riwayat...</p>
                        </CardContent>
                    </Card>
                ) : viewedListings.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-secondary mb-2">
                                Belum Ada Riwayat
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Mobil yang Anda lihat akan muncul di sini
                            </p>
                            <Link href="/mobil-bekas">
                                <Button>
                                    Cari Mobil
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {viewedListings.map((listing) => (
                            <Card key={`${listing.id}-${listing.viewedAt}`} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Image */}
                                        <Link
                                            href={`/mobil-bekas/${listing.slug}`}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={listing.image || 'https://placehold.co/200x150?text=No+Image'}
                                                alt={listing.title}
                                                className="w-full sm:w-32 h-32 rounded-lg object-cover"
                                            />
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-secondary line-clamp-1">
                                                        {listing.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatViewedTime(listing.viewedAt)}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={listing.condition === 'NEW' ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {listing.condition === 'NEW' ? 'Baru' : 'Bekas'}
                                                </Badge>
                                            </div>

                                            <p className="text-lg font-bold text-primary mb-2">
                                                {formatCurrency(listing.price)}
                                            </p>

                                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                <span>{listing.year}</span>
                                                <span>•</span>
                                                <span>{formatNumber(listing.mileage)} km</span>
                                                <span>•</span>
                                                <span>{listing.location}</span>
                                            </div>

                                            <Link
                                                href={`/mobil-bekas/${listing.slug}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                            >
                                                Lihat Detail
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
