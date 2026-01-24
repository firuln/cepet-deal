'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, Plus, GitCompare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConditionalLayout } from '@/components/layouts/ConditionalLayout'

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

export default function ComparePage() {
    const searchParams = useSearchParams()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListings = async () => {
            const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []

            if (ids.length === 0) {
                setLoading(false)
                return
            }

            try {
                const promises = ids.map(id =>
                    fetch(`/api/listings/${id}`).then(res => res.json())
                )
                const results = await Promise.all(promises)
                setListings(results.filter(Boolean))
            } catch (error) {
                console.error('Error fetching listings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchListings()
    }, [searchParams])

    const removeCar = (id: string) => {
        const updated = listings.filter(l => l.id !== id)
        setListings(updated)
        // Update URL
        const newIds = updated.map(l => l.id).join(',')
        const url = new URL(window.location.href)
        if (newIds) {
            url.searchParams.set('ids', newIds)
        } else {
            url.searchParams.delete('ids')
        }
        window.history.replaceState({}, '', url.toString())
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
            <ConditionalLayout>
                <div className="max-w-7xl mx-auto py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </ConditionalLayout>
        )
    }

    if (listings.length === 0) {
        return (
            <ConditionalLayout>
                <div className="max-w-2xl mx-auto py-16 text-center">
                    <GitCompare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Bandingkan Mobil</h1>
                    <p className="text-gray-600 mb-6">
                        Pilih mobil yang ingin Anda bandingkan (maksimal 3 mobil)
                    </p>
                    <Button href="/mobil-bekas">Cari Mobil</Button>
                </div>
            </ConditionalLayout>
        )
    }

    return (
        <ConditionalLayout>
            <div className="max-w-7xl mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Bandingkan Mobil</h1>
                        <p className="text-gray-600">
                            Membandingkan {listings.length} mobil
                        </p>
                    </div>
                    {listings.length < 3 && (
                        <Button href="/mobil-bekas" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Mobil
                        </Button>
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
                                    src={listing.images[0] || '/placeholder-car.png'}
                                    alt={listing.title}
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-semibold text-secondary mb-1 line-clamp-2">
                                    {listing.title}
                                </h3>
                                <p className="text-lg font-bold text-primary">
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
                                    <th className="p-4 text-left font-semibold text-secondary w-48">
                                        Spesifikasi
                                    </th>
                                    {listings.map((listing) => (
                                        <th key={listing.id} className="p-4 text-center min-w-[200px]">
                                            <img
                                                src={listing.images[0] || '/placeholder-car.png'}
                                                alt={listing.title}
                                                className="w-full h-32 object-cover rounded-lg mb-2"
                                            />
                                            <p className="font-semibold text-sm text-secondary line-clamp-2">
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
                                                        isDifferent ? 'font-semibold text-primary bg-primary/5' : ''
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
                        onClick={() => {
                            setListings([])
                            window.history.replaceState({}, '', window.location.pathname)
                        }}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Hapus Semua
                    </Button>
                </div>
            </div>
        </ConditionalLayout>
    )
}
