'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Trash2, Car, MapPin, Calendar, Gauge, ExternalLink, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Badge, Modal, Skeleton, useToast } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface FavoriteListing {
    id: string
    listing: {
        id: string
        title: string
        slug: string
        price: string
        year: number
        mileage: number
        location: string
        condition: 'NEW' | 'USED'
        images: string[]
        brand: {
            name: string
            slug: string
        }
        model: {
            name: string
            slug: string
        }
    }
    createdAt: string
}

export default function FavoritesPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [favorites, setFavorites] = useState<FavoriteListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteModal, setDeleteModal] = useState<string | null>(null)
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true)
                const res = await fetch('/api/favorites')

                if (res.status === 401) {
                    router.push('/login')
                    return
                }

                if (!res.ok) {
                    throw new Error('Failed to fetch favorites')
                }

                const data = await res.json()
                setFavorites(data)
            } catch (err) {
                console.error('Error fetching favorites:', err)
                setError(err instanceof Error ? err.message : 'Failed to load favorites')
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [router])

    const handleRemove = async (id: string) => {
        if (!id) return

        try {
            setRemovingId(id)
            const res = await fetch('/api/favorites/toggle', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: id })
            })

            if (!res.ok) {
                throw new Error('Failed to remove favorite')
            }

            // Update local state
            setFavorites(favorites.filter((f) => f.listing.id !== id))
            setDeleteModal(null)

            addToast({
                type: 'success',
                title: 'Dihapus!',
                message: 'Listing dihapus dari favorit'
            })
        } catch (err) {
            console.error('Error removing favorite:', err)
            addToast({
                type: 'error',
                title: 'Gagal',
                message: 'Gagal menghapus dari favorit, silakan coba lagi'
            })
        } finally {
            setRemovingId(null)
        }
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
                            {!loading && `${favorites.length} mobil tersimpan`}
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="flex">
                                    <Skeleton className="w-40 h-32 flex-shrink-0" />
                                    <CardContent className="flex-1 p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-1/2" />
                                        <div className="flex gap-3">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-9 w-full" />
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-secondary mb-2">
                                Gagal Memuat Favorit
                            </h2>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Coba Lagi
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && favorites.length === 0 && (
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
                )}

                {/* Favorites Grid */}
                {!loading && !error && favorites.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {favorites.map((fav) => {
                            const car = fav.listing
                            const listingUrl = car.condition === 'NEW'
                                ? `/mobil-baru/${car.slug}`
                                : `/mobil-bekas/${car.slug}`

                            return (
                                <Card key={fav.id} className="overflow-hidden">
                                    <div className="flex">
                                        <div className="relative w-40 h-32 flex-shrink-0">
                                            <img
                                                src={car.images[0] || '/placeholder-car.png'}
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
                                                {formatCurrency(Number(car.price))}
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
                                                <Link href={listingUrl} className="flex-1">
                                                    <Button size="sm" className="w-full">
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        Lihat
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal(car.id)}
                                                    disabled={removingId === car.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            )
                        })}
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
                        disabled={removingId !== null}
                    >
                        {removingId ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
