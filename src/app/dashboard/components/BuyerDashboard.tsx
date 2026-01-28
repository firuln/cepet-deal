'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Eye, Bell, Car, ArrowUpRight, UserPlus, Search, Calculator, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Types
interface Stats {
    totalFavorites: number
    newMessages: number
    totalViews: number
    recentViews: number
}

interface Listing {
    id: string
    title: string
    price: number
    year: number
    mileage: number
    images: string[]
    location: string
    condition: 'NEW' | 'USED'
    status: string
}

interface StatsResponse {
    stats: {
        totalFavorites: number
        newMessages: number
        totalViews: number
        recentViews: number
    }
}

export function BuyerDashboard() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [upgradeReason, setUpgradeReason] = useState('')
    const [isUpgrading, setIsUpgrading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Data states
    const [stats, setStats] = useState<Stats>({
        totalFavorites: 0,
        newMessages: 0,
        totalViews: 0,
        recentViews: 0,
    })
    const [recommendedCars, setRecommendedCars] = useState<Listing[]>([])

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

    // Fetch recommended cars (recent active listings)
    const fetchRecommendedCars = async () => {
        try {
            const res = await fetch('/api/listings?status=ACTIVE&limit=4&sort=newest')
            if (res.ok) {
                const data = await res.json()
                setRecommendedCars(data.listings || [])
            }
        } catch (err) {
            console.error('Failed to fetch recommended cars:', err)
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
                    fetchRecommendedCars()
                ])
            } catch (err) {
                setError('Gagal memuat data. Silakan refresh halaman.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleUpgradeToSeller = async () => {
        setIsUpgrading(true)
        try {
            const res = await fetch('/api/users/role', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'SELLER', reason: upgradeReason }),
            })

            if (res.ok) {
                window.location.reload()
            } else {
                alert('Gagal upgrade role. Silakan coba lagi.')
            }
        } catch (error) {
            alert('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsUpgrading(false)
        }
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

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-secondary">Temukan Mobil Impian Anda 🚗</h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">
                            Rekomendasi mobil terbaru untuk Anda
                        </p>
                    </div>
                </div>

                {/* Stats Grid - Fully Responsive */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">Favorit</p>
                                    {isLoading ? (
                                        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                    ) : (
                                        <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                            {stats.totalFavorites}
                                        </p>
                                    )}
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">Pesan</p>
                                    {isLoading ? (
                                        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                    ) : (
                                        <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                            {stats.newMessages}
                                        </p>
                                    )}
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">Dilihat</p>
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
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">Views Baru</p>
                                    {isLoading ? (
                                        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2" />
                                    ) : (
                                        <p className="text-xl sm:text-2xl font-bold text-secondary mt-1">
                                            {formatNumber(stats.recentViews)}
                                        </p>
                                    )}
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Recommended Cars */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Recommended Cars */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary flex items-center gap-2 text-sm sm:text-base">
                                        <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                        Rekomendasi Mobil Terbaru
                                    </h2>
                                    <Link
                                        href="/mobil-bekas"
                                        className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        Lihat Semua
                                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Link>
                                </div>
                                {isLoading ? (
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="animate-pulse bg-gray-100 h-48 rounded-xl" />
                                        ))}
                                    </div>
                                ) : recommendedCars.length === 0 ? (
                                    <div className="p-6 sm:p-8 text-center text-gray-500">
                                        <Car className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm sm:text-base">Belum ada mobil yang tersedia</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-5">
                                        {recommendedCars.map((car) => (
                                            <Link
                                                key={car.id}
                                                href={`/mobil-bekas/${car.id}`}
                                                className="group"
                                            >
                                                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={car.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
                                                            alt={car.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        {car.condition === 'NEW' && (
                                                            <span className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-xs font-medium rounded-full">
                                                                Baru
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-3 sm:p-4">
                                                        <h3 className="font-medium text-secondary text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                            {car.title}
                                                        </h3>
                                                        <p className="text-primary font-bold text-sm mt-1">
                                                            {formatCurrency(car.price)}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                            <span>{car.year}</span>
                                                            <span>{formatNumber(car.mileage)} km</span>
                                                            <span className="hidden sm:inline truncate max-w-[80px]">{car.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Upgrade & Quick Actions */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upgrade to Seller CTA */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                            <CardContent className="p-4 sm:p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-secondary mb-2">
                                        Ingin Mulai Jual Mobil?
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                        Ubah akun Anda menjadi Penjual untuk mulai memasang iklan mobil
                                    </p>
                                    <Button
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="w-full text-xs sm:text-sm"
                                        size="sm"
                                    >
                                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        Jadi Penjual
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardContent className="p-3 sm:p-5">
                                <h2 className="font-semibold text-secondary mb-3 sm:mb-4 text-sm sm:text-base">Aksi Cepat</h2>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                                    <Link
                                        href="/mobil-bekas"
                                        className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center"
                                    >
                                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                        <span className="text-xs sm:text-sm font-medium text-secondary">Cari Mobil</span>
                                    </Link>
                                    <Link
                                        href="/calculator"
                                        className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center"
                                    >
                                        <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                                        <span className="text-xs sm:text-sm font-medium text-secondary">Kalkulator</span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-3 sm:mb-4">
                                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-secondary text-center mb-2">
                                Jadi Penjual
                            </h2>
                            <p className="text-gray-600 text-center text-xs sm:text-sm mb-4 sm:mb-6">
                                Ubah akun Anda menjadi Penjual untuk mulai memasang iklan mobil di CepetDeal
                            </p>

                            <div className="mb-3 sm:mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan jual mobil (opsional)
                                </label>
                                <textarea
                                    value={upgradeReason}
                                    onChange={(e) => setUpgradeReason(e.target.value)}
                                    placeholder="Contoh: Saya mau jual mobil pribadi..."
                                    rows={3}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowUpgradeModal(false)
                                        setUpgradeReason('')
                                    }}
                                    className="flex-1 text-xs sm:text-sm"
                                    disabled={isUpgrading}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleUpgradeToSeller}
                                    className="flex-1 text-xs sm:text-sm"
                                    disabled={isUpgrading}
                                >
                                    {isUpgrading ? 'Memproses...' : 'Konfirmasi'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
