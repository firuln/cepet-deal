'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Car, Users, Shield, ChevronRight, Star, MapPin, Heart, TrendingUp, Clock, DollarSign, Flame, Sparkles, Zap, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui'

// Hero Section
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="relative bg-gradient-to-br from-secondary via-secondary to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-slide-down">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm">Marketplace Mobil #1 di Indonesia</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Cari Mobil Impian
            <span className="block mt-2 gradient-text">Cepat & Mudah</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in">
            Temukan ribuan mobil baru dan bekas dengan harga terbaik.
            Jual beli mobil jadi lebih aman dan transparan.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl animate-slide-up">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari merk, model, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button size="lg" className="md:px-8">
                <Search className="w-5 h-5 mr-2" />
                Cari Mobil
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/mobil-baru" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Car className="w-4 h-4" />
              Mobil Baru
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/mobil-bekas" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Car className="w-4 h-4" />
              Mobil Bekas
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/dealer" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Users className="w-4 h-4" />
              Dealer Terpercaya
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Stats Section
function StatsSection() {
  const stats = [
    { label: 'Mobil Terdaftar', value: '10,000+', icon: Car },
    { label: 'Dealer Terverifikasi', value: '500+', icon: Shield },
    { label: 'Pengguna Aktif', value: '50,000+', icon: Users },
    { label: 'Rating Kepuasan', value: '4.9/5', icon: Star },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// New Cars Container
function NewCarsContainer() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'price_asc' | 'price_desc' | 'newest'>('all')

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/listings/public?condition=NEW&limit=8')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching new listings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Filter and sort listings
  const filteredListings = [...listings].sort((a, b) => {
    if (filter === 'price_asc') return a.price - b.price
    if (filter === 'price_desc') return b.price - a.price
    if (filter === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return 0
  })

  if (isLoading) {
    return (
      <section className="py-16 animate-fade-in">
        <div className="container">
          {/* Loading Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Baru</h2>
                <p className="text-gray-500 text-sm">Temukan mobil baru dengan harga terbaik</p>
              </div>
            </div>
          </div>
          {/* Loading Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <section className="py-16 animate-fade-in">
      <div className="container">
        {/* Container with gradient background and border */}
        <div className="bg-gradient-to-br from-accent/5 to-transparent rounded-2xl border-l-4 border-accent p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Baru</h2>
                <p className="text-gray-500 text-sm">Temukan mobil baru dengan harga terbaik dari dealer resmi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 px-3 py-1 rounded-full">
                <span className="text-accent font-semibold text-sm">{listings.length} Mobil Tersedia</span>
              </div>
              <Link href="/mobil-baru">
                <Button variant="outline" size="sm" className="hover:bg-accent hover:text-white hover:border-accent transition-all">
                  Lihat Semua
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('price_asc')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'price_asc'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Termurah
            </button>
            <button
              onClick={() => setFilter('newest')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'newest'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              Terbaru
            </button>
            <button
              onClick={() => setFilter('price_desc')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'price_desc'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Premium
            </button>
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.slice(0, 8).map((listing, index) => (
              <Link key={listing.id} href={`/mobil-baru/${listing.slug}`}>
                <div
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={listing.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent text-white shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Baru
                      </span>
                      {index < 2 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Hot
                        </span>
                      )}
                    </div>
                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary line-clamp-1 group-hover:text-accent transition-colors">{listing.title}</h3>
                    <p className="text-accent font-bold text-lg mt-1">{formatPrice(listing.price)}</p>

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <span>{listing.year}</span>
                      <span>•</span>
                      <span className="text-accent font-medium">0 km</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {listing.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 text-center">
            <Link href="/mobil-baru">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Lihat Semua Mobil Baru
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Used Cars Container
function UsedCarsContainer() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'price_asc' | 'price_desc' | 'newest'>('all')

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/listings/public?condition=USED&limit=8')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching used listings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Filter and sort listings
  const filteredListings = [...listings].sort((a, b) => {
    if (filter === 'price_asc') return a.price - b.price
    if (filter === 'price_desc') return b.price - a.price
    if (filter === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return 0
  })

  if (isLoading) {
    return (
      <section className="py-16 animate-fade-in">
        <div className="container">
          {/* Loading Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Bekas</h2>
                <p className="text-gray-500 text-sm">Mobil bekas berkualitas & terverifikasi</p>
              </div>
            </div>
          </div>
          {/* Loading Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <section className="py-16 animate-fade-in">
      <div className="container">
        {/* Container with gradient background and border */}
        <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border-l-4 border-primary p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Bekas</h2>
                <p className="text-gray-500 text-sm">Mobil bekas berkualitas & terverifikasi, harga terjangkau</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-primary font-semibold text-sm">{listings.length} Mobil Tersedia</span>
              </div>
              <Link href="/mobil-bekas">
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white hover:border-primary transition-all">
                  Lihat Semua
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('price_asc')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'price_asc'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Termurah
            </button>
            <button
              onClick={() => setFilter('newest')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'newest'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              Terbaru
            </button>
            <button
              onClick={() => setFilter('price_desc')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filter === 'price_desc'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Premium
            </button>
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.slice(0, 8).map((listing, index) => (
              <Link key={listing.id} href={`/mobil-bekas/${listing.slug}`}>
                <div
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={listing.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-white shadow-sm">
                        Bekas
                      </span>
                      {index < 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Laris
                        </span>
                      )}
                    </div>
                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
                    <p className="text-primary font-bold text-lg mt-1">{formatPrice(listing.price)}</p>

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <span>{listing.year}</span>
                      <span>•</span>
                      <span>{listing.mileage?.toLocaleString()} km</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {listing.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 text-center">
            <Link href="/mobil-bekas">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Car className="w-4 h-4 mr-2" />
                Lihat Semua Mobil Bekas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Articles Section
function ArticlesContainer() {
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?limit=4')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content?.split(/\s+/).length || 0
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min baca`
  }

  if (isLoading) {
    return (
      <section className="py-16 animate-fade-in">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">Artikel & Tips</h2>
                <p className="text-gray-500 text-sm">Panduan lengkap jual beli mobil</p>
              </div>
            </div>
          </div>
          {/* Loading Cards */}
          <div className="space-y-4 max-w-3xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white animate-fade-in">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary">Artikel & Tips</h2>
              <p className="text-gray-500 text-sm">Panduan lengkap jual beli mobil</p>
            </div>
          </div>
          <Link href="/artikel">
            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-all">
              Lihat Semua
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Articles List - Horizontal Cards */}
        <div className="space-y-4 max-w-3xl">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              href={`/artikel/${article.slug}`}
              className="block group"
            >
              <div
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-md hover:border-blue-300 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                      <Newspaper className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    <span>•</span>
                    <span>{getReadTime(article.excerpt || article.content || '')}</span>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center max-w-3xl">
          <Link href="/artikel">
            <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-all">
              <Newspaper className="w-4 h-4 mr-2" />
              Baca Semua Artikel
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Browse by Brand
function BrowseByBrand() {
  const brands = [
    { name: 'Toyota', logo: '🚗', count: 2500 },
    { name: 'Honda', logo: '🚙', count: 1800 },
    { name: 'Mitsubishi', logo: '🚘', count: 1200 },
    { name: 'Daihatsu', logo: '🚐', count: 1000 },
    { name: 'Suzuki', logo: '🚕', count: 900 },
    { name: 'Nissan', logo: '🚖', count: 750 },
    { name: 'Mazda', logo: '🏎️', count: 500 },
    { name: 'BMW', logo: '🚒', count: 400 },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary">Cari Berdasarkan Merk</h2>
          <p className="text-gray-500 mt-2">Temukan mobil favorit dari berbagai merk ternama</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link key={brand.name} href={`/brand/${brand.name.toLowerCase()}`}>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                <div className="text-4xl mb-2">{brand.logo}</div>
                <div className="font-medium text-secondary">{brand.name}</div>
                <div className="text-xs text-gray-500">{brand.count.toLocaleString()} mobil</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/brand">
            <Button variant="outline">
              Lihat Semua Merk
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ingin Jual Mobil Anda?</h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Jual mobil Anda dengan mudah di CepetDeal. Jangkau ribuan pembeli potensial dan dapatkan harga terbaik.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/listings/used">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Jual Mobil Sekarang
            </Button>
          </Link>
          <Link href="/dealer/apply">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Daftar Sebagai Dealer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Main Homepage
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <NewCarsContainer />
      <UsedCarsContainer />
      <ArticlesContainer />
      <BrowseByBrand />
      <CTASection />
    </main>
  )
}
