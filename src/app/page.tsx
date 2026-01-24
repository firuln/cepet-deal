'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Car, Users, Shield, ChevronRight, Star, MapPin, Heart } from 'lucide-react'
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

// Featured Listings
function FeaturedListings() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/listings/public?limit=4')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
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

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Pilihan</h2>
              <p className="text-gray-500 mt-1">Rekomendasi mobil terbaik untuk Anda</p>
            </div>
          </div>
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
    return null // Hide section if no listings
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary">Mobil Pilihan</h2>
            <p className="text-gray-500 mt-1">Rekomendasi mobil terbaik untuk Anda</p>
          </div>
          <Link href="/mobil-bekas">
            <Button variant="outline">
              Lihat Semua
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/mobil-bekas/${listing.slug}`}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover">
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <img
                    src={listing.image || 'https://placehold.co/400x300?text=No+Image'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.condition === 'NEW'
                      ? 'bg-accent text-white'
                      : 'bg-primary text-white'
                      }`}>
                      {listing.condition === 'NEW' ? 'Baru' : 'Bekas'}
                    </span>
                  </div>
                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-secondary line-clamp-1">{listing.title}</h3>
                  <p className="text-primary font-bold text-lg mt-1">{formatPrice(listing.price)}</p>

                  <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                    <span>{listing.year}</span>
                    <span>•</span>
                    <span>{listing.mileage.toLocaleString()} km</span>
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
          <Link href="/dashboard/listings/new">
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
      <FeaturedListings />
      <BrowseByBrand />
      <CTASection />
    </main>
  )
}
