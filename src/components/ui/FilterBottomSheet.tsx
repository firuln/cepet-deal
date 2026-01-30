'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { Button, Badge } from './index'
import { cn } from '@/lib/utils'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
    PRICE_RANGES,
} from '@/lib/constants'

interface FilterOption {
    value: string
    label: string
}

interface FilterBottomSheetProps {
    isOpen: boolean
    onClose: () => void
    onApply: () => void
    onClearAll: () => void

    // Filter states
    selectedBodyType: string
    selectedTransmission: string
    selectedFuelType: string
    selectedPriceRange: string

    // Setters
    setSelectedBodyType: (value: string) => void
    setSelectedTransmission: (value: string) => void
    setSelectedFuelType: (value: string) => void
    setSelectedPriceRange: (value: string) => void

    // Search
    searchQuery: string
    onSearchChange: (value: string) => void
}

export function FilterBottomSheet({
    isOpen,
    onClose,
    onApply,
    onClearAll,
    selectedBodyType,
    selectedTransmission,
    selectedFuelType,
    selectedPriceRange,
    setSelectedBodyType,
    setSelectedTransmission,
    setSelectedFuelType,
    setSelectedPriceRange,
    searchQuery,
    onSearchChange,
}: FilterBottomSheetProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery)

    const activeFiltersCount = [
        selectedBodyType,
        selectedTransmission,
        selectedFuelType,
        selectedPriceRange,
    ].filter(Boolean).length

    const getFilterLabel = (filterValue: string, options: Record<string, string> | typeof PRICE_RANGES): string => {
        if (!filterValue) return ''

        // Check if it's PRICE_RANGES (array)
        if (Array.isArray(options)) {
            const found = options.find((opt: any) => opt.value === filterValue)
            return found?.label || filterValue
        }

        // It's a record object
        return options[filterValue as keyof typeof options] || filterValue
    }

    const handleRemoveFilter = (filterValue: string) => {
        if (filterValue === selectedBodyType) setSelectedBodyType('')
        if (filterValue === selectedTransmission) setSelectedTransmission('')
        if (filterValue === selectedFuelType) setSelectedFuelType('')
        if (filterValue === selectedPriceRange) setSelectedPriceRange('')
    }

    const handleSearchApply = () => {
        onSearchChange(localSearch)
    }

    const handleApply = () => {
        handleSearchApply()
        onApply()
        onClose()
    }

    const handleClearAll = () => {
        setLocalSearch('')
        onSearchChange('')
        onClearAll()
        onClose()
    }

    const activeFilters = [
        selectedBodyType && getFilterLabel(selectedBodyType, BODY_TYPES),
        selectedTransmission && getFilterLabel(selectedTransmission, TRANSMISSIONS),
        selectedFuelType && getFilterLabel(selectedFuelType, FUEL_TYPES),
        selectedPriceRange && getFilterLabel(selectedPriceRange, PRICE_RANGES),
    ].filter(Boolean) as string[]

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Mobil">
            <div className="flex flex-col gap-5 pb-20">
                {/* Search Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cari Mobil
                    </label>
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Ketik nama mobil..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                                Filter Aktif ({activeFilters.length})
                            </span>
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                Hapus Semua
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter, index) => (
                                <Badge
                                    key={index}
                                    variant="primary"
                                    className="px-3 py-1.5 pr-2 flex items-center gap-1.5"
                                >
                                    <span>{filter}</span>
                                    <button
                                        onClick={() => handleRemoveFilter(filter)}
                                        className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Body
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedBodyType(selectedBodyType === '' ? '' : '')}
                            className={cn(
                                'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                'border',
                                !selectedBodyType
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            )}
                        >
                            Semua
                        </button>
                        {Object.entries(BODY_TYPES).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedBodyType(selectedBodyType === key ? '' : key)}
                                className={cn(
                                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    'border',
                                    selectedBodyType === key
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transmission Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transmisi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedTransmission('')}
                            className={cn(
                                'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                'border',
                                !selectedTransmission
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            )}
                        >
                            Semua
                        </button>
                        {Object.entries(TRANSMISSIONS).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedTransmission(selectedTransmission === key ? '' : key)}
                                className={cn(
                                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    'border',
                                    selectedTransmission === key
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fuel Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bahan Bakar
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedFuelType('')}
                            className={cn(
                                'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                'border',
                                !selectedFuelType
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            )}
                        >
                            Semua
                        </button>
                        {Object.entries(FUEL_TYPES).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedFuelType(selectedFuelType === key ? '' : key)}
                                className={cn(
                                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    'border',
                                    selectedFuelType === key
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rentang Harga
                    </label>
                    <div className="space-y-2">
                        {PRICE_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)}
                                className={cn(
                                    'w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200',
                                    'border',
                                    selectedPriceRange === range.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleClearAll}
                    >
                        Reset
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleApply}
                    >
                        Terapkan {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </Button>
                </div>
            </div>
        </BottomSheet>
    )
}
