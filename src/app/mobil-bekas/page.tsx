'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, Grid, List, ChevronDown, X } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { CarCard } from '@/components/features'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
    PRICE_RANGES,
    MILEAGE_RANGES
} from '@/lib/constants'

// Sample data - will be replaced with API data
const sampleListings = [
    {
        id: '1',
        title: 'Toyota Avanza 1.5 G CVT',
        price: 250000000,
        year: 2023,
        mileage: 15000,
        location: 'Jakarta Selatan',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500',
        condition: 'USED' as const,
        transmission: 'CVT',
        fuelType: 'Bensin',
    },
    {
        id: '2',
        title: 'Honda HR-V 1.5 SE CVT',
        price: 380000000,
        year: 2024,
        mileage: 5000,
        location: 'Surabaya',
        image: 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=500',
        condition: 'USED' as const,
        transmission: 'CVT',
        fuelType: 'Bensin',
    },
    {
        id: '3',
        title: 'Mitsubishi Xpander Ultimate AT',
        price: 320000000,
        year: 2023,
        mileage: 8000,
        location: 'Bandung',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500',
        condition: 'USED' as const,
        transmission: 'Automatic',
        fuelType: 'Bensin',
    },
    {
        id: '4',
        title: 'Daihatsu Xenia 1.3 R MT',
        price: 210000000,
        year: 2023,
        mileage: 20000,
        location: 'Yogyakarta',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500',
        condition: 'USED' as const,
        transmission: 'Manual',
        fuelType: 'Bensin',
    },
    {
        id: '5',
        title: 'Toyota Fortuner 2.4 VRZ AT',
        price: 520000000,
        year: 2022,
        mileage: 35000,
        location: 'Medan',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500',
        condition: 'USED' as const,
        transmission: 'Automatic',
        fuelType: 'Diesel',
    },
    {
        id: '6',
        title: 'Honda Brio RS CVT',
        price: 195000000,
        year: 2023,
        mileage: 12000,
        location: 'Semarang',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500',
        condition: 'USED' as const,
        transmission: 'CVT',
        fuelType: 'Bensin',
    },
]

export default function MobilBekasPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedTransmission, setSelectedTransmission] = useState('')
    const [selectedFuelType, setSelectedFuelType] = useState('')
    const [selectedPriceRange, setSelectedPriceRange] = useState('')
    const [selectedMileageRange, setSelectedMileageRange] = useState('')

    const activeFilters = [
        selectedBrand,
        selectedTransmission,
        selectedFuelType,
        selectedPriceRange,
        selectedMileageRange,
    ].filter(Boolean)

    const clearAllFilters = () => {
        setSelectedBrand('')
        setSelectedTransmission('')
        setSelectedFuelType('')
        setSelectedPriceRange('')
        setSelectedMileageRange('')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-8">
                    <h1 className="text-3xl font-bold text-secondary">Mobil Bekas</h1>
                    <p className="text-gray-500 mt-2">
                        Temukan {sampleListings.length}+ mobil bekas berkualitas dengan harga terbaik
                    </p>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters - Desktop */}
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
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
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
                                    {PRICE_RANGES.map((range, index) => (
                                        <option key={index} value={range.label}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mileage Range Filter */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kilometer
                                </label>
                                <select
                                    value={selectedMileageRange}
                                    onChange={(e) => setSelectedMileageRange(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {MILEAGE_RANGES.map((range, index) => (
                                        <option key={index} value={range.label}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            <Button className="w-full">
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
                                    <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                                        <option>Terbaru</option>
                                        <option>Harga Terendah</option>
                                        <option>Harga Tertinggi</option>
                                        <option>Kilometer Terendah</option>
                                    </select>

                                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Results count */}
                                <p className="text-sm text-gray-500">
                                    Menampilkan <span className="font-medium text-secondary">{sampleListings.length}</span> mobil
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
                                            <button className="hover:bg-primary/20 rounded-full p-0.5">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Car Grid */}
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                            }`}>
                            {sampleListings.map((listing) => (
                                <CarCard
                                    key={listing.id}
                                    {...listing}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                                    Sebelumnya
                                </button>
                                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">1</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">3</button>
                                <span className="px-2 text-gray-400">...</span>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">10</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
