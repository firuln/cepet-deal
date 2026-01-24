'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    Car,
    Heart,
    MessageSquare,
    Eye,
    TrendingUp,
    Clock,
    Plus,
    ArrowUpRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Sample dashboard stats
const stats = [
    { label: 'Total Iklan', value: 5, icon: Car, color: 'bg-blue-500' },
    { label: 'Favorit', value: 12, icon: Heart, color: 'bg-red-500' },
    { label: 'Pesan Baru', value: 3, icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Total Views', value: 1234, icon: Eye, color: 'bg-purple-500' },
]

// Sample recent listings
const recentListings = [
    {
        id: '1',
        title: 'Toyota Avanza 1.5 G CVT 2023',
        price: 265000000,
        views: 156,
        inquiries: 8,
        status: 'ACTIVE',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
    },
    {
        id: '2',
        title: 'Honda Brio RS CVT 2024',
        price: 215000000,
        views: 89,
        inquiries: 3,
        status: 'ACTIVE',
        image: 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=200',
    },
    {
        id: '3',
        title: 'Daihatsu Xenia 1.3 R MT 2022',
        price: 195000000,
        views: 45,
        inquiries: 2,
        status: 'PENDING',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200',
    },
]

// Sample recent activities
const recentActivities = [
    { type: 'view', message: 'Seseorang melihat iklan Toyota Avanza Anda', time: '5 menit lalu' },
    { type: 'inquiry', message: 'Pesan baru untuk Honda Brio RS', time: '1 jam lalu' },
    { type: 'favorite', message: 'Iklan Toyota Avanza ditambahkan ke favorit', time: '2 jam lalu' },
    { type: 'view', message: '15 orang melihat iklan Anda hari ini', time: '3 jam lalu' },
]

export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">
                            Selamat datang, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Kelola iklan dan pantau performa Anda
                        </p>
                    </div>
                    <Link href="/dashboard/listings/used">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Pasang Iklan Baru
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-secondary mt-1">
                                            {formatNumber(stat.value)}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Listings */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary">Iklan Terbaru</h2>
                                    <Link
                                        href="/dashboard/listings"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        Lihat Semua
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentListings.map((listing) => (
                                        <div key={listing.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                            <img
                                                src={listing.image}
                                                alt={listing.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-secondary truncate">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-primary font-semibold text-sm mt-0.5">
                                                    {formatCurrency(listing.price)}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {listing.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {listing.inquiries}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={listing.status === 'ACTIVE' ? 'success' : 'warning'}
                                                size="sm"
                                            >
                                                {listing.status === 'ACTIVE' ? 'Aktif' : 'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <Card>
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-gray-100">
                                    <h2 className="font-semibold text-secondary">Aktivitas Terbaru</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="p-4 flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'view' ? 'bg-purple-100 text-purple-600' :
                                                    activity.type === 'inquiry' ? 'bg-green-100 text-green-600' :
                                                        'bg-red-100 text-red-600'
                                                }`}>
                                                {activity.type === 'view' && <Eye className="w-4 h-4" />}
                                                {activity.type === 'inquiry' && <MessageSquare className="w-4 h-4" />}
                                                {activity.type === 'favorite' && <Heart className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700">{activity.message}</p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardContent className="p-5">
                        <h2 className="font-semibold text-secondary mb-4">Aksi Cepat</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Link
                                href="/dashboard/listings/used"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-center"
                            >
                                <Plus className="w-6 h-6 text-primary" />
                                <span className="text-sm font-medium text-secondary">Pasang Iklan</span>
                            </Link>
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
                                href="/dashboard/settings"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                            >
                                <TrendingUp className="w-6 h-6 text-gray-600" />
                                <span className="text-sm font-medium text-secondary">Statistik</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
