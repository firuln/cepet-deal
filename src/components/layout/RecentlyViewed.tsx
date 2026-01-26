'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Clock, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RecentlyViewedItem {
  id: string
  title: string
  slug: string
  price: number
  image: string
  year: number
  condition: 'NEW' | 'USED'
  viewedAt: string
}

const STORAGE_KEY = 'cepetdeal-recently-viewed'
const MAX_ITEMS = 10
const EXPIRY_DAYS = 30

interface RecentlyViewedProps {
  currentListingId: string
  currentListingSlug: string
}

export function RecentlyViewed({ currentListingId, currentListingSlug }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    loadItems()
  }, [])

  // Add current listing to recently viewed
  useEffect(() => {
    if (!currentListingId || !currentListingSlug) return

    addToRecentlyViewed({
      id: currentListingId,
      slug: currentListingSlug,
    })
  }, [currentListingId, currentListingSlug])

  const loadItems = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored) as RecentlyViewedItem[]
      const now = Date.now()
      const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000

      // Filter expired items and sort by viewedAt (newest first)
      const validItems = data
        .filter((item) => now - new Date(item.viewedAt).getTime() < expiryTime)
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, MAX_ITEMS)

      setItems(validItems)
    } catch (error) {
      console.error('Error loading recently viewed:', error)
    }
  }

  const addToRecentlyViewed = async (item: Partial<RecentlyViewedItem>) => {
    try {
      // Fetch full listing data if we only have id
      if (item.id && !item.title) {
        const res = await fetch(`/api/listings/${item.slug}`)
        if (res.ok) {
          const data = await res.json()
          item = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            price: Number(data.price),
            image: data.images?.[0] || '/placeholder-car.png',
            year: data.year,
            condition: data.condition,
            viewedAt: new Date().toISOString(),
          } as RecentlyViewedItem
        }
      } else {
        item = {
          ...item,
          viewedAt: new Date().toISOString(),
        } as RecentlyViewedItem
      }

      // Get current items
      const stored = localStorage.getItem(STORAGE_KEY)
      let currentItems: RecentlyViewedItem[] = stored ? JSON.parse(stored) : []

      // Remove if same listing exists (to move it to top)
      currentItems = currentItems.filter((i) => i.id !== item.id)

      // Add new item at the beginning
      currentItems.unshift(item as RecentlyViewedItem)

      // Keep only max items and sort by viewedAt
      const now = Date.now()
      const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000
      currentItems = currentItems
        .filter((i) => now - new Date(i.viewedAt).getTime() < expiryTime)
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, MAX_ITEMS)

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItems))

      // Update state
      setItems(currentItems.filter((i) => i.id !== currentListingId))
    } catch (error) {
      console.error('Error adding to recently viewed:', error)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setItems([])
  }

  const removeItem = (id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      let currentItems: RecentlyViewedItem[] = stored ? JSON.parse(stored) : []
      currentItems = currentItems.filter((i) => i.id !== id)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItems))
      setItems(currentItems)
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = Date.now()
    const viewedTime = new Date(dateString).getTime()
    const diffMs = now - viewedTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    return `${diffDays} hari yang lalu`
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-secondary text-sm">Baru Dilihat</h3>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Hapus riwayat"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {items.slice(0, 4).map((item) => {
          const listingUrl = item.condition === 'NEW'
            ? `/mobil-baru/${item.slug}`
            : `/mobil-bekas/${item.slug}`

          return (
            <div
              key={item.id}
              className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group relative"
            >
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="relative w-16 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={listingUrl}
                  className="font-medium text-secondary text-sm line-clamp-1 hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.year} • {item.condition === 'NEW' ? 'Baru' : 'Bekas'}
                </p>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  {formatCurrency(item.price)}
                </p>
                <p className="text-xs text-gray-400">{getTimeAgo(item.viewedAt)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
