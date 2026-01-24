'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, Plus, GitCompare, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Listing {
    id: string
    title: string
    slug: string
    year: number
    price: string
    condition: string
    transmission: string
    fuelType: string
    bodyType: string
    mileage: number
    color: string
    engineSize?: number
    location: string
    images: string[]
    brand: {
        name: string
        logo?: string
    }
    model: {
        name: string
    }
}

const COMPARE_STORAGE_KEY = 'compare_listings'

export default function ComparePage() {
    const router = useRouter()
    const [listingIds, setListingIds] = useState<string[]>([])
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load compare list from localStorage
        const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
        if (stored) {
            try {
                const ids = JSON.parse(stored)
                setListingIds(ids)
            } catch (e) {
                console.error('Error parsing compare list:', e)
            }
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        const fetchListings = async () => {
            if (listingIds.length === 0) {
                setListings([])
                return
            }

            try {
                // Fetch by slug using the public API
                const promises = listingIds.map(id =>
                    fetch(`/api/listings/public?id=${id}`).then(res => res.json())
                )
                const results = await Promise.all(promises)
                // Extract listings from each response and filter
                const allListings = results.flatMap(r => r.listings || [])
                setListings(allListings)
            } catch (error) {
                console.error('Error fetching listings:', error)
                setListings([])
            }
        }

        fetchListings()
    }, [listingIds])

    const removeCar = (id: string) => {
        const updatedIds = listingIds.filter(item => item !== id)
        setListingIds(updatedIds)
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updatedIds))

        // Update URL
        const url = new URL(window.location.href)
        if (updatedIds.length > 0) {
            url.searchParams.set('ids', updatedIds.join(','))
        } else {
            url.searchParams.delete('ids')
        }
        window.history.replaceState({}, '', url.toString())
    }

    const clearAll = () => {
        setListingIds([])
        setListings([])
        localStorage.removeItem(COMPARE_STORAGE_KEY)
        window.history.replaceState({}, '', window.location.pathname)
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
    }

    const formatMileage = (km: number) => {
        return new Intl.NumberFormat('id-ID').format(km) + ' km'
    }

    const getTransmissionLabel = (trans: string) => {
        const labels: Record<string, string> = {
            MANUAL: 'Manual',
            AUTOMATIC: 'Matic',
            CVT: 'CVT'
        }
        return labels[trans] || trans
    }

    const getFuelTypeLabel = (fuel: string) => {
        const labels: Record<string, string> = {
            PETROL: 'Bensin',
            DIESEL: 'Diesel',
            HYBRID: 'Hybrid',
            ELECTRIC: 'Listrik'
        }
        return labels[fuel] || fuel
    }

    const getConditionLabel = (cond: string) => {
        return cond === 'NEW' ? 'Baru' : 'Bekas'
    }

    const specs = [
        { key: 'brand', label: 'Merk', render: (l: Listing) => l.brand.name },
        { key: 'year', label: 'Tahun', render: (l: Listing) => l.year.toString() },
        { key: 'price', label: 'Harga', render: (l: Listing) => formatCurrency(l.price) },
        { key: 'condition', label: 'Kondisi', render: (l: Listing) => getConditionLabel(l.condition) },
        { key: 'transmission', label: 'Transmisi', render: (l: Listing) => getTransmissionLabel(l.transmission) },
        { key: 'fuelType', label: 'Bahan Bakar', render: (l: Listing) => getFuelTypeLabel(l.fuelType) },
        { key: 'bodyType', label: 'Tipe Body', render: (l: Listing) => l.bodyType },
        { key: 'mileage', label: 'Kilometer', render: (l: Listing) => formatMileage(l.mileage) },
        { key: 'color', label: 'Warna', render: (l: Listing) => l.color },
        { key: 'engineSize', label: 'Kapasitas Mesin', render: (l: Listing) => l.engineSize ? `${l.engineSize} cc` : '-' },
        { key: 'location', label: 'Lokasi', render: (l: Listing) => l.location },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (listingIds.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <GitCompare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Bandingkan Mobil</h1>
                    <p className="text-gray-600 mb-6">
                        Pilih mobil yang ingin Anda bandingkan (maksimal 3 mobil)
                    </p>
                    <Link href="/mobil-bekas">
                        <Button>Cari Mobil</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/mobil-bekas" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke daftar mobil
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Bandingkan Mobil</h1>
                        <p className="text-gray-600">
                            Membandingkan {listings.length} mobil
                        </p>
                    </div>
                    {listings.length < 3 && (
                        <Link href="/mobil-bekas">
                            <Button variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Mobil
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Car Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                        <Card key={listing.id} className="relative">
                            <button
                                onClick={() => removeCar(listing.id)}
                                className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                            <CardContent className="p-4">
                                <img
                                    src={listing.images?.[0] || '/placeholder-car.png'}
                                    alt={listing.title}
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {listing.title}
                                </h3>
                                <p className="text-lg font-bold text-orange-500">
                                    {formatCurrency(listing.price)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {listing.brand.name} {listing.model.name} • {listing.year}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Comparison Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-4 text-left font-semibold text-gray-900 w-48">
                                        Spesifikasi
                                    </th>
                                    {listings.map((listing) => (
                                        <th key={listing.id} className="p-4 text-center min-w-[200px]">
                                            <img
                                                src={listing.images[0] || '/placeholder-car.png'}
                                                alt={listing.title}
                                                className="w-full h-32 object-cover rounded-lg mb-2"
                                            />
                                            <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                                                {listing.title}
                                            </p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {specs.map((spec, index) => (
                                    <tr
                                        key={spec.key}
                                        className={`border-b ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                    >
                                        <td className="p-4 font-medium text-gray-700">
                                            {spec.label}
                                        </td>
                                        {listings.map((listing) => {
                                            const value = spec.render(listing)
                                            const allValues = listings.map(l => spec.render(l))
                                            const isDifferent = new Set(allValues).size > 1

                                            return (
                                                <td
                                                    key={listing.id}
                                                    className={`p-4 text-center ${
                                                        isDifferent ? 'font-semibold text-orange-500 bg-orange-50' : ''
                                                    }`}
                                                >
                                                    {value}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={clearAll}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Hapus Semua
                    </Button>
                </div>
            </div>
        </div>
    )
}
