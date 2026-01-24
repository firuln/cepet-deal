'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Trash2, Car, MapPin, Calendar, Gauge, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Badge, Modal } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Sample favorite cars
const favoriteCars = [
    {
        id: '1',
        title: 'Toyota Avanza 1.5 G CVT 2024',
        price: 270000000,
        year: 2024,
        mileage: 0,
        location: 'Jakarta Selatan',
        condition: 'NEW',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
        addedAt: '2024-01-15',
        seller: 'Auto Prima Motor',
    },
    {
        id: '2',
        title: 'Honda HR-V 1.5 SE CVT 2023',
        price: 380000000,
        year: 2023,
        mileage: 15000,
        location: 'Surabaya',
        condition: 'USED',
        image: 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=400',
        addedAt: '2024-01-12',
        seller: 'Budi Santoso',
    },
    {
        id: '3',
        title: 'Mitsubishi Xpander Cross 2024',
        price: 350000000,
        year: 2024,
        mileage: 0,
        location: 'Bandung',
        condition: 'NEW',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
        addedAt: '2024-01-10',
        seller: 'Mobilindo Jaya',
    },
    {
        id: '4',
        title: 'Toyota Fortuner 2.4 VRZ 2022',
        price: 520000000,
        year: 2022,
        mileage: 35000,
        location: 'Medan',
        condition: 'USED',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
        addedAt: '2024-01-08',
        seller: 'Central Motor',
    },
]

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState(favoriteCars)
    const [deleteModal, setDeleteModal] = useState<string | null>(null)

    const handleRemove = (id: string) => {
        setFavorites(favorites.filter((f) => f.id !== id))
        setDeleteModal(null)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500" />
                            Mobil Favorit
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {favorites.length} mobil tersimpan
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                {favorites.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-secondary mb-2">
                                Belum ada favorit
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Simpan mobil yang Anda sukai untuk melihatnya nanti
                            </p>
                            <Link href="/mobil-bekas">
                                <Button>
                                    <Car className="w-4 h-4 mr-2" />
                                    Cari Mobil
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Favorites Grid */
                    <div className="grid md:grid-cols-2 gap-4">
                        {favorites.map((car) => (
                            <Card key={car.id} className="overflow-hidden">
                                <div className="flex">
                                    <div className="relative w-40 h-32 flex-shrink-0">
                                        <img
                                            src={car.image}
                                            alt={car.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <Badge
                                            variant={car.condition === 'NEW' ? 'success' : 'warning'}
                                            className="absolute top-2 left-2"
                                            size="sm"
                                        >
                                            {car.condition === 'NEW' ? 'Baru' : 'Bekas'}
                                        </Badge>
                                    </div>
                                    <CardContent className="flex-1 p-4">
                                        <h3 className="font-semibold text-secondary line-clamp-1 mb-1">
                                            {car.title}
                                        </h3>
                                        <p className="text-primary font-bold mb-2">
                                            {formatCurrency(car.price)}
                                        </p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {car.year}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Gauge className="w-3 h-3" />
                                                {formatNumber(car.mileage)} km
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {car.location}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/mobil-bekas/${car.id}`} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Lihat
                                                </Button>
                                            </Link>
                                            <button
                                                onClick={() => setDeleteModal(car.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Hapus dari Favorit?"
            >
                <p className="text-gray-600 mb-6">
                    Mobil ini akan dihapus dari daftar favorit Anda.
                </p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => deleteModal && handleRemove(deleteModal)}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                        Hapus
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
