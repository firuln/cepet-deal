'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { Badge } from './Badge'
import { formatCurrency, formatMileage } from '@/lib/utils'

interface Brand {
    id: string
    name: string
    slug: string
    logo?: string | null
}

interface Model {
    id: string
    name: string
    slug: string
}

interface DealerListingCardProps {
    id: string
    title: string
    slug: string
    price: string
    year: number
    condition: 'NEW' | 'USED'
    mileage?: number | null
    transmission?: string | null
    location?: string | null
    images: string[]
    brand?: Brand | null
    model?: Model | null
    favoriteCount?: number
}

export function DealerListingCard({
    id,
    title,
    slug,
    price,
    year,
    condition,
    mileage,
    transmission,
    location,
    images,
    brand,
    model,
    favoriteCount = 0
}: DealerListingCardProps) {
    const router = useRouter()
    const [isFavorited, setIsFavorited] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const res = await fetch(`/api/favorites/toggle?listingId=${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setIsFavorited(data.favorited)
                }
            } catch (err) {
                console.error('Error checking favorite status:', err)
            }
        }

        checkFavoriteStatus()
    }, [id])

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isToggling) return

        try {
            setIsToggling(true)
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: id })
            })

            if (res.status === 401) {
                router.push('/login')
                return
            }

            if (!res.ok) {
                throw new Error('Failed to toggle favorite')
            }

            const data = await res.json()
            setIsFavorited(data.favorited)
        } catch (err) {
            console.error('Error toggling favorite:', err)
        } finally {
            setIsToggling(false)
        }
    }

    // Determine the link based on condition
    const detailPath = condition === 'NEW' ? `/mobil-baru/${slug}` : `/mobil-bekas/${slug}`

    // Get the first image or use a placeholder
    const imageUrl = images && images.length > 0 ? images[0] : null

    // Badge text and color based on condition
    const badgeText = condition === 'NEW' ? 'BARU' : 'BEKAS'
    const badgeColor = condition === 'NEW' ? 'bg-blue-500' : 'bg-orange-500'

    return (
        <Link href={detailPath}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group relative">
                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={isToggling}
                    className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isFavorited
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
                    } disabled:opacity-50`}
                >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                {/* Image */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
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

                    {/* Condition Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor} text-white`}>
                        {badgeText}
                    </div>
                </div>

                {/* Content */}
                <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
                        {title}
                    </h3>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                        <span>{year}</span>
                        {mileage && <span>{formatMileage(mileage)}</span>}
                        {transmission && <span>{transmission}</span>}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                        <p className="text-base font-bold text-primary">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
