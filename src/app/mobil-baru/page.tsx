'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, Grid, List, X, Loader2 } from 'lucide-react'
import { Button, Badge, DebouncedSearchInput, FilterBottomSheet } from '@/components/ui'
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
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState('createdAt')
    const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())

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

    const fetchListings = async (isSearch = false) => {
        if (isSearch) {
            setIsSearching(true)
        } else {
            setLoading(true)
        }
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
            setIsSearching(false)
        }
    }

    const handleFilterApply = () => {
        setPage(1)
        fetchListings()
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }

    const handleSearchDebounced = (value: string) => {
        fetchListings(true)
    }

    const removeFilter = (filter: string) => {
        if (filter === selectedBrand) setSelectedBrand('')
        if (filter === selectedTransmission) setSelectedTransmission('')
        if (filter === selectedFuelType) setSelectedFuelType('')
        if (filter === selectedPriceRange) setSelectedPriceRange('')
        if (filter === selectedBodyType) setSelectedBodyType('')
    }

    // Check favorite status for all listings
    useEffect(() => {
        const checkFavorites = async () => {
            if (listings.length === 0) return

            try {
                const promises = listings.map(async (listing) => {
                    const res = await fetch(`/api/favorites/toggle?listingId=${listing.id}`)
                    if (res.ok) {
                        const data = await res.json()
                        return { id: listing.id, favorited: data.favorited }
                    }
                    return { id: listing.id, favorited: false }
                })

                const results = await Promise.all(promises)
                const favIds = new Set(results.filter((r) => r.favorited).map((r) => r.id))
                setFavoritedIds(favIds)
            } catch (err) {
                console.error('Error checking favorites:', err)
            }
        }

        checkFavorites()
    }, [listings])

    const handleFavoriteClick = async (id: string) => {
        try {
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: id })
            })

            if (res.status === 401) {
                router.push('/login')
                return
            }

            if (res.ok) {
                const data = await res.json()
                setFavoritedIds((prev) => {
                    const newSet = new Set(prev)
                    if (data.favorited) {
                        newSet.add(id)
                    } else {
                        newSet.delete(id)
                    }
                    return newSet
                })
            }
        } catch (err) {
            console.error('Error toggling favorite:', err)
        }
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
                            <div className="mb-5">
                                <DebouncedSearchInput
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onDebounceComplete={handleSearchDebounced}
                                    placeholder="Cari mobil..."
                                    isLoading={isSearching}
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
                        <FilterBottomSheet
                            isOpen={showFilters}
                            onClose={() => setShowFilters(false)}
                            onApply={handleFilterApply}
                            onClearAll={clearAllFilters}
                            selectedBodyType={selectedBodyType}
                            selectedTransmission={selectedTransmission}
                            selectedFuelType={selectedFuelType}
                            selectedPriceRange={selectedPriceRange}
                            setSelectedBodyType={setSelectedBodyType}
                            setSelectedTransmission={setSelectedTransmission}
                            setSelectedFuelType={setSelectedFuelType}
                            setSelectedPriceRange={setSelectedPriceRange}
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                        />

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
                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tidak ada mobil baru yang ditemukan
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Coba sesuaikan filter atau kata kunci pencarian Anda untuk melihat lebih banyak hasil.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={clearAllFilters}>
                                        Hapus Semua Filter
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push('/mobil-bekas')}>
                                        Lihat Mobil Bekas
                                    </Button>
                                </div>
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
                                            isFavorite={favoritedIds.has(listing.id)}
                                            onFavoriteClick={handleFavoriteClick}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                                        <p className="text-sm text-gray-500">
                                            Halaman <span className="font-medium text-secondary">{page}</span> dari {totalPages}
                                        </p>
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
