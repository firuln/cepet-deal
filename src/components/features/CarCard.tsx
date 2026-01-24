'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, GitCompare, Check, X } from 'lucide-react'
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

const COMPARE_STORAGE_KEY = 'compare_listings'

// Event for compare list changes
const COMPARE_EVENT = 'compare-list-changed'

// Function to trigger compare event
export function triggerCompareEvent() {
    window.dispatchEvent(new Event(COMPARE_EVENT))
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
    const router = useRouter()
    const [compareList, setCompareList] = useState<string[]>([])
    const [isComparing, setIsComparing] = useState(false)

    useEffect(() => {
        // Load compare list from localStorage
        const loadCompareList = () => {
            const stored = localStorage.getItem(COMPARE_STORAGE_KEY)
            if (stored) {
                try {
                    setCompareList(JSON.parse(stored))
                } catch (e) {
                    console.error('Error parsing compare list:', e)
                    setCompareList([])
                }
            } else {
                setCompareList([])
            }
        }

        loadCompareList()

        // Listen for compare list changes from other cards
        const handleCompareEvent = () => {
            loadCompareList()
        }

        window.addEventListener(COMPARE_EVENT, handleCompareEvent)
        return () => window.removeEventListener(COMPARE_EVENT, handleCompareEvent)
    }, [])

    useEffect(() => {
        // Check if current car is in compare list
        setIsComparing(compareList.includes(id))
    }, [compareList, id])

    const href = condition === 'NEW'
        ? `/mobil-baru/${slug || id}`
        : `/mobil-bekas/${slug || id}`

    const handleCardClick = () => {
        router.push(href)
    }

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onFavoriteClick?.(id)
    }

    const handleCompareClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        let newCompareList: string[]

        if (isComparing) {
            // Remove from compare
            newCompareList = compareList.filter(item => item !== id)
        } else {
            // Add to compare (max 3)
            if (compareList.length >= 3) {
                alert('Maksimal 3 mobil untuk dibandingkan')
                return
            }
            newCompareList = [...compareList, id]
        }

        setCompareList(newCompareList)
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(newCompareList))

        // Trigger event so other cards update
        triggerCompareEvent()

        // Show notification or update URL
        if (newCompareList.length > 0) {
            const url = new URL(window.location.href)
            url.searchParams.set('compare', newCompareList.join(','))
            window.history.replaceState({}, '', url.toString())
        } else {
            // Remove compare param if list is empty
            const url = new URL(window.location.href)
            url.searchParams.delete('compare')
            window.history.replaceState({}, '', url.toString())
        }
    }

    const handleComparePageClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/compare')
    }

    const handleResetCompare = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Clear compare list
        setCompareList([])
        localStorage.removeItem(COMPARE_STORAGE_KEY)

        // Trigger event so other cards update
        triggerCompareEvent()

        // Remove compare param from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('compare')
        window.history.replaceState({}, '', url.toString())
    }

    return (
        <div onClick={handleCardClick} className="cursor-pointer">
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

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {/* Compare Button */}
                        <button
                            onClick={handleCompareClick}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                isComparing
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-orange-500'
                            }`}
                            title={isComparing ? 'Hapus dari compare' : 'Tambah ke compare'}
                        >
                            {isComparing ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <GitCompare className="w-4 h-4" />
                            )}
                        </button>

                        {/* Favorite Button */}
                        <button
                            onClick={handleFavoriteClick}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                isFavorite
                                    ? 'bg-primary text-white'
                                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-primary'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Compare Counter & Reset (if any cars in compare) */}
                    {compareList.length > 0 && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            {/* Reset Button */}
                            <button
                                onClick={handleResetCompare}
                                className="w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-all shadow-lg"
                                title="Reset Compare"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Compare Link */}
                            <button
                                onClick={handleComparePageClick}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg"
                            >
                                <GitCompare className="w-3.5 h-3.5" />
                                Bandingkan ({compareList.length})
                            </button>
                        </div>
                    )}
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
        </div>
    )
}
