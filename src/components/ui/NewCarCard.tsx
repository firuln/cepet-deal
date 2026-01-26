'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface NewCarCardProps {
    id: string
    title: string
    slug: string
    price: number
    year: number
    image: string
    badge?: 'NEW' | 'PROMO'
}

export function NewCarCard({ id, title, slug, price, year, image, badge = 'NEW' }: NewCarCardProps) {
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

    return (
        <Link href={`/mobil-baru/${slug}`}>
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

                    {/* Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        badge === 'PROMO'
                            ? 'bg-orange-500 text-white'
                            : 'bg-blue-500 text-white'
                    }`}>
                        {badge === 'PROMO' ? 'PROMO' : 'BARU'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-2.5">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
                        {title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1.5">
                        <span>{year}</span>
                    </div>

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
