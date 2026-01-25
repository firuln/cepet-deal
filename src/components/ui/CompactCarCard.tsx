'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface CompactCarCardProps {
    id: string
    title: string
    slug: string
    price: number
    year: number
    mileage: number
    transmission: string
    fuelType: string
    image: string
    condition: 'NEW' | 'USED'
}

const TRANSMISSION_LABELS: Record<string, string> = {
    MANUAL: 'Manual',
    AUTOMATIC: 'Automatic',
    CVT: 'CVT',
}

const FUEL_TYPE_LABELS: Record<string, string> = {
    PETROL: 'Bensin',
    DIESEL: 'Diesel',
    HYBRID: 'Hybrid',
    ELECTRIC: 'Listrik',
}

export function CompactCarCard({
    id,
    title,
    slug,
    price,
    year,
    mileage,
    transmission,
    fuelType,
    image,
    condition,
}: CompactCarCardProps) {
    const transmissionLabel = TRANSMISSION_LABELS[transmission] || transmission
    const fuelTypeLabel = FUEL_TYPE_LABELS[fuelType] || fuelType

    return (
        <Link href={`/${condition === 'NEW' ? 'mobil-baru' : 'mobil-bekas'}/${slug}`}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                {/* Image */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v9a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-2.5">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug mb-1.5">
                        {title}
                    </h3>

                    {/* Specs - Compact */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 mb-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{year}</span>
                        <span>{formatNumber(mileage)} km</span>
                        <span>•</span>
                        <span>{transmissionLabel}</span>
                        <span>•</span>
                        <span>{fuelTypeLabel}</span>
                    </div>

                    {/* Price */}
                    <div className="border-t border-gray-100 pt-1.5">
                        <p className="text-sm font-bold text-primary">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
