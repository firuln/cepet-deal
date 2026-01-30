/**
 * Shared listing types for consistency across the application
 */

export interface Listing {
  id: string
  title: string
  slug: string
  price: number
  year: number
  mileage?: number
  condition: 'NEW' | 'USED'
  location: string
  images?: string[]
  createdAt: string
  updatedAt: string
  // Additional fields
  bodyType?: string
  transmission?: string
  fuelType?: string
  color?: string
  seats?: number
  description?: string
  sellerId?: string
  seller?: {
    id: string
    name: string
    avatar?: string
    type: 'USER' | 'DEALER'
  }
  // For new cars
  featured?: boolean
  isNew?: boolean
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content?: string
  featuredImage: string | null
  category: 'NEWS' | 'REVIEW' | 'TIPS' | 'GUIDE' | 'PROMO'
  views: number
  publishedAt: string
  createdAt: string
  featured?: boolean
  readTime?: number
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface Testimonial {
  id: string
  name: string
  role?: string
  content: string
  rating: number
  avatar?: string
  isActive: boolean
  createdAt: string
}

export type FilterSortOption = 'all' | 'price_asc' | 'price_desc' | 'newest'
export type ListingCondition = 'NEW' | 'USED' | 'ALL'
