'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { CarCard } from '@/components/features'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
    PRICE_RANGES
} from '@/lib/constants'

interface Listing {
    id: string
    title: string
    slug: string
    price: number
    year: number
    mileage: number
    location: string
    images: string[]
    condition: 'NEW' | 'USED'
    transmission: string
    fuelType: string
    bodyType: string
    brand: {
        id: string
        name: string
        slug: string
    }
    model: {
        id: string
        name: string
        slug: string
    }
}

export default function MobilBaruPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState('createdAt')

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedTransmission, setSelectedTransmission] = useState('')
    const [selectedFuelType, setSelectedFuelType] = useState('')
    const [selectedPriceRange, setSelectedPriceRange] = useState('')
    const [selectedBodyType, setSelectedBodyType] = useState('')

    const activeFilters = [
        selectedBrand,
        selectedTransmission,
        selectedFuelType,
        selectedPriceRange,
        selectedBodyType,
    ].filter(Boolean)

    const clearAllFilters = () => {
        setSelectedBrand('')
        setSelectedTransmission('')
        setSelectedFuelType('')
        setSelectedPriceRange('')
        setSelectedBodyType('')
        setSearchQuery('')
        setPage(1)
    }

    useEffect(() => {
        fetchListings()
    }, [page, sortBy])

    const fetchListings = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                condition: 'NEW',
                sort: sortBy,
            })

            if (searchQuery) params.append('search', searchQuery)
            if (selectedBrand) params.append('brand', selectedBrand)
            if (selectedTransmission) params.append('transmission', selectedTransmission)
            if (selectedFuelType) params.append('fuelType', selectedFuelType)
            if (selectedBodyType) params.append('bodyType', selectedBodyType)
            if (selectedPriceRange) {
                const [min, max] = selectedPriceRange.split('-').map(s => s.replace(/[^0-9]/g, ''))
                if (min) params.append('minPrice', min)
                if (max) params.append('maxPrice', max)
            }

            const res = await fetch(`/api/listings/public?${params}`)
            if (res.ok) {
                const data = await res.json()
                setListings(data.listings || [])
                setTotalPages(data.pagination?.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching listings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterApply = () => {
        setPage(1)
        fetchListings()
    }

    const removeFilter = (filter: string) => {
        if (filter === selectedBrand) setSelectedBrand('')
        if (filter === selectedTransmission) setSelectedTransmission('')
        if (filter === selectedFuelType) setSelectedFuelType('')
        if (filter === selectedPriceRange) setSelectedPriceRange('')
        if (filter === selectedBodyType) setSelectedBodyType('')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent to-accent/80 text-white">
                <div className="container py-8">
                    <h1 className="text-3xl font-bold">Mobil Baru</h1>
                    <p className="text-white/80 mt-2">
                        {loading ? 'Memuat...' : `Temukan ${listings.length}+ mobil baru dengan harga dan promo terbaik dari dealer resmi`}
                    </p>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-semibold text-secondary">Filter</h2>
                                {activeFilters.length > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative mb-5">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari mobil..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilterApply()}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Body Type Filter */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipe Body
                                </label>
                                <select
                                    value={selectedBodyType}
                                    onChange={(e) => setSelectedBodyType(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Semua Tipe</option>
                                    {Object.entries(BODY_TYPES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Transmission Filter */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transmisi
                                </label>
                                <select
                                    value={selectedTransmission}
                                    onChange={(e) => setSelectedTransmission(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Semua Transmisi</option>
                                    {Object.entries(TRANSMISSIONS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fuel Type Filter */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bahan Bakar
                                </label>
                                <select
                                    value={selectedFuelType}
                                    onChange={(e) => setSelectedFuelType(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Semua Bahan Bakar</option>
                                    {Object.entries(FUEL_TYPES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rentang Harga
                                </label>
                                <select
                                    value={selectedPriceRange}
                                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Semua Harga</option>
                                    {PRICE_RANGES.map((range, index) => (
                                        <option key={index} value={range.value}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            <Button className="w-full" onClick={handleFilterApply}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filter
                                    {activeFilters.length > 0 && (
                                        <Badge variant="primary" size="sm">{activeFilters.length}</Badge>
                                    )}
                                </button>

                                {/* Sort & View */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="createdAt">Terbaru</option>
                                        <option value="price_asc">Harga Terendah</option>
                                        <option value="price_desc">Harga Tertinggi</option>
                                        <option value="views_desc">Populer</option>
                                    </select>

                                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Results count */}
                                <p className="text-sm text-gray-500">
                                    {!loading && (
                                        <>Menampilkan <span className="font-medium text-secondary">{listings.length}</span> mobil baru</>
                                    )}
                                </p>
                            </div>

                            {/* Active Filters */}
                            {activeFilters.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                    {activeFilters.map((filter, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {filter}
                                            <button
                                                onClick={() => removeFilter(filter)}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 lg:hidden">
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Cari mobil..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <select
                                        value={selectedTransmission}
                                        onChange={(e) => setSelectedTransmission(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="">Semua Transmisi</option>
                                        {Object.entries(TRANSMISSIONS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    <Button className="w-full" onClick={() => { handleFilterApply(); setShowFilters(false); }}>
                                        Terapkan Filter
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">Tidak ada mobil baru yang ditemukan</p>
                                <Button onClick={clearAllFilters} className="mt-4">
                                    Hapus Filter
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Car Grid */}
                                <div className={`grid gap-6 ${viewMode === 'grid'
                                        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                        : 'grid-cols-1'
                                    }`}>
                                    {listings.map((listing) => (
                                        <CarCard
                                            key={listing.id}
                                            id={listing.id}
                                            title={listing.title}
                                            slug={listing.slug}
                                            price={listing.price}
                                            year={listing.year}
                                            mileage={listing.mileage}
                                            location={listing.location}
                                            image={listing.images[0] || '/placeholder-car.png'}
                                            condition={listing.condition}
                                            transmission={listing.transmission}
                                            fuelType={listing.fuelType}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                                                disabled={page === 1}
                                            >
                                                Sebelumnya
                                            </button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const pageNum = i + 1
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`px-4 py-2 rounded-lg text-sm ${
                                                            page === pageNum
                                                                ? 'bg-accent text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            })}
                                            {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
                                            {totalPages > 5 && (
                                                <button
                                                    onClick={() => setPage(totalPages)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                                                >
                                                    {totalPages}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                                                disabled={page === totalPages}
                                            >
                                                Selanjutnya
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
