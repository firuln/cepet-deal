'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Eye, TrendingUp, Bell, Car, ArrowUpRight, UserPlus, Search, Calculator } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Sample recommended cars based on browsing history
const recommendedCars = [
    {
        id: '1',
        title: 'Honda Brio Satya E 2023',
        price: 175000000,
        year: 2023,
        mileage: 15000,
        image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=200',
        location: 'Jakarta Selatan',
        condition: 'USED',
    },
    {
        id: '2',
        title: 'Toyota Agya 1.2 GR Sport 2024',
        price: 165000000,
        year: 2024,
        mileage: 5000,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
        location: 'Tangerang',
        condition: 'NEW',
    },
    {
        id: '3',
        title: 'Daihatsu Sigra 1.2 R 2022',
        price: 135000000,
        year: 2022,
        mileage: 25000,
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200',
        location: 'Bekasi',
        condition: 'USED',
    },
    {
        id: '4',
        title: 'Suzuki Ignis GX 2023',
        price: 190000000,
        year: 2023,
        mileage: 12000,
        image: 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=200',
        location: 'Depok',
        condition: 'USED',
    },
]

// Sample search history
const searchHistory = [
    { id: '1', query: 'Honda Brio', date: '2 jam lalu', results: 24 },
    { id: '2', query: 'Toyota Agya under 200 juta', date: 'Kemarin', results: 18 },
    { id: '3', query: 'Mobil MPV 7 kursi', date: '2 hari lalu', results: 32 },
]

// Sample price alerts
const priceAlerts = [
    { id: '1', car: 'Honda Brio Satya', targetPrice: 150000000, currentPrice: 175000000, status: 'waiting' },
    { id: '2', car: 'Toyota Agya GR', targetPrice: 160000000, currentPrice: 158000000, status: 'ready' },
]

export function BuyerDashboard() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [upgradeReason, setUpgradeReason] = useState('')
    const [isUpgrading, setIsUpgrading] = useState(false)

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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Temukan Mobil Impian Anda 🚗</h1>
                        <p className="text-gray-500 mt-1">
                            Rekomendasi mobil berdasarkan pencarian Anda
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Favorit</p>
                                    <p className="text-2xl font-bold text-secondary mt-1">12</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pesan</p>
                                    <p className="text-2xl font-bold text-secondary mt-1">3</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Dilihat</p>
                                    <p className="text-2xl font-bold text-secondary mt-1">48</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Alert</p>
                                    <p className="text-2xl font-bold text-secondary mt-1">{priceAlerts.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Recommended Cars */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recommended Cars */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary flex items-center gap-2">
                                        <Car className="w-5 h-5 text-primary" />
                                        Rekomendasi Untuk Anda
                                    </h2>
                                    <Link
                                        href="/mobil-bekas"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        Lihat Semua
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                                    {recommendedCars.map((car) => (
                                        <Link
                                            key={car.id}
                                            href={car.condition === 'NEW' ? `/mobil-baru/${car.id}` : `/mobil-bekas/${car.id}`}
                                            className="group"
                                        >
                                            <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={car.image}
                                                        alt={car.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    {car.condition === 'NEW' && (
                                                        <span className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-xs font-medium rounded-full">
                                                            Baru
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-medium text-secondary text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                        {car.title}
                                                    </h3>
                                                    <p className="text-primary font-bold text-sm mt-1">
                                                        {formatCurrency(car.price)}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                        <span>{car.year}</span>
                                                        <span>{formatNumber(car.mileage)} km</span>
                                                        <span>{car.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Search History */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary flex items-center gap-2">
                                        <Search className="w-5 h-5 text-gray-500" />
                                        Riwayat Pencarian
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {searchHistory.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium text-secondary">{item.query}</p>
                                                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">{item.results} hasil</p>
                                                <Link
                                                    href={`/mobil-bekas?search=${encodeURIComponent(item.query)}`}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Cari Lagi
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Quick Actions & Price Alerts */}
                    <div className="space-y-6">
                        {/* Upgrade to Seller CTA */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <UserPlus className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-secondary mb-2">
                                        Ingin Mulai Jual Mobil?
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Ubah akun Anda menjadi Penjual untuk mulai memasang iklan mobil
                                    </p>
                                    <Button
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Jadi Penjual
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Price Alerts */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-orange-500" />
                                        Alert Harga
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {priceAlerts.map((alert) => (
                                        <div key={alert.id} className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="font-medium text-secondary text-sm">{alert.car}</p>
                                                <Badge
                                                    variant={alert.status === 'ready' ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {alert.status === 'ready' ? 'Tersedia!' : 'Menunggu'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">Target: {formatCurrency(alert.targetPrice)}</span>
                                                <span className={`font-medium ${alert.status === 'ready' ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {formatCurrency(alert.currentPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-gray-100">
                                    <Link
                                        href="/mobil-bekas"
                                        className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                                    >
                                        <Bell className="w-4 h-4" />
                                        Buat Alert Baru
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardContent className="p-5">
                                <h2 className="font-semibold text-secondary mb-4">Aksi Cepat</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/dashboard/favorites"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-center"
                                    >
                                        <Heart className="w-6 h-6 text-red-500" />
                                        <span className="text-sm font-medium text-secondary">Favorit</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/messages"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
                                    >
                                        <MessageSquare className="w-6 h-6 text-green-500" />
                                        <span className="text-sm font-medium text-secondary">Pesan</span>
                                    </Link>
                                    <Link
                                        href="/compare"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center"
                                    >
                                        <TrendingUp className="w-6 h-6 text-blue-500" />
                                        <span className="text-sm font-medium text-secondary">Banding</span>
                                    </Link>
                                    <Link
                                        href="/calculator"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center"
                                    >
                                        <Calculator className="w-6 h-6 text-purple-500" />
                                        <span className="text-sm font-medium text-secondary">Kalkulator</span>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-4">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-secondary text-center mb-2">
                                Jadi Penjual
                            </h2>
                            <p className="text-gray-600 text-center text-sm mb-6">
                                Ubah akun Anda menjadi Penjual untuk mulai memasang iklan mobil di CepetDeal
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan jual mobil (opsional)
                                </label>
                                <textarea
                                    value={upgradeReason}
                                    onChange={(e) => setUpgradeReason(e.target.value)}
                                    placeholder="Contoh: Saya mau jual mobil pribadi..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowUpgradeModal(false)
                                        setUpgradeReason('')
                                    }}
                                    className="flex-1"
                                    disabled={isUpgrading}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleUpgradeToSeller}
                                    className="flex-1"
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
