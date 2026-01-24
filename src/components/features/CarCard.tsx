'use client'

import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { CAR_CONDITIONS } from '@/lib/constants'

interface CarCardProps {
    id: string
    title: string
    price: number | bigint
    year: number
    mileage: number
    location: string
    image: string
    condition: 'NEW' | 'USED'
    slug?: string
    transmission?: string
    fuelType?: string
    isFavorite?: boolean
    onFavoriteClick?: (id: string) => void
}

export function CarCard({
    id,
    title,
    price,
    year,
    mileage,
    location,
    image,
    condition,
    slug,
    transmission,
    fuelType,
    isFavorite = false,
    onFavoriteClick,
}: CarCardProps) {
    const href = condition === 'NEW'
        ? `/mobil-baru/${slug || id}`
        : `/mobil-bekas/${slug || id}`

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onFavoriteClick?.(id)
    }

    return (
        <Link href={href}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Condition Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${condition === 'NEW'
                                ? 'bg-accent text-white'
                                : 'bg-primary text-white'
                            }`}>
                            {CAR_CONDITIONS[condition]}
                        </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFavorite
                                ? 'bg-primary text-white'
                                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-primary'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    <p className="text-primary font-bold text-lg mt-1">
                        {formatPrice(price)}
                    </p>

                    {/* Specs */}
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 flex-wrap">
                        <span>{year}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{mileage.toLocaleString('id-ID')} km</span>
                        {transmission && (
                            <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{transmission}</span>
                            </>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{location}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
