'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Building2, Shield, Share2, Loader2, AlertCircle, Car, ChevronLeft, Eye, Calendar, MessageCircle, Navigation, Star, Heart } from 'lucide-react'
import { DealerListingCard } from '@/components/ui/DealerListingCard'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

// WhatsApp formatting utility
function formatWhatsApp(phone: string): string {
    if (!phone) return ''
    let cleaned = phone.replace(/[^\d]/g, '')
    if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.substring(1)
    }
    return cleaned
}

interface DealerUser {
    id: string
    name: string
    phone: string | null
    avatar: string | null
    role: string
    _count: {
        listings: number
    }
}

interface Dealer {
    id: string
    companyName: string
    address: string
    city: string | null
    description: string | null
    logo: string | null
    verified: boolean
    verifiedAt: string | null
    createdAt: string
    views: number
    user: DealerUser
    activeListingsCount: number
}

interface Brand {
    id: string
    name: string
    slug: string
}

interface Model {
    id: string
    name: string
    slug: string
}

interface Listing {
    id: string
    title: string
    slug: string
    year: number
    price: string
    condition: 'NEW' | 'USED'
    transmission: string | null
    fuelType: string | null
    bodyType: string | null
    mileage: number | null
    color: string | null
    location: string | null
    images: string[]
    youtubeUrl: string | null
    status: string
    featured: boolean
    views: number
    createdAt: string
    updatedAt: string
    brand: Brand | null
    model: Model | null
    favoriteCount: number
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
}

interface ApiResponse {
    dealer: Dealer | null
    listings: Listing[]
    pagination: Pagination
    error?: string
}

export default function DealerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slugs = params.slugs as string[]

    const [data, setData] = useState<ApiResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showToast, setShowToast] = useState(false)
    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        const fetchDealerData = async () => {
            if (!slugs || slugs.length < 2) {
                setError('Invalid URL format')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const res = await fetch(`/api/dealers/by-slug/${slugs.join('/')}`)

                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Dealer tidak ditemukan')
                    } else {
                        setError('Gagal memuat data dealer')
                    }
                    return
                }

                const apiData: ApiResponse = await res.json()
                setData(apiData)
            } catch (err) {
                console.error('Error fetching dealer data:', err)
                setError('Gagal memuat data dealer')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDealerData()
    }, [slugs])

    const handleShare = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleWhatsAppChat = () => {
        if (!data?.dealer?.user?.phone) return
        const formattedPhone = formatWhatsApp(data.dealer.user.phone)
        const message = encodeURIComponent(`Halo, saya melihat profil ${data.dealer.companyName} di CepetDeal. Apakah mobil yang dijual masih tersedia?`)
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank')
    }

    const handlePhoneCall = () => {
        if (!data?.dealer?.user?.phone) return
        window.open(`tel:${data.dealer.user.phone}`, '_self')
    }

    const handleGetDirections = () => {
        if (!data?.dealer) return
        const address = encodeURIComponent(`${data.dealer.address}, ${data.dealer.city || ''}`)
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
    }

    const handleFavorite = () => {
        setIsFavorited(!isFavorited)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const formatMemberSince = (dateString: string): string => {
        const date = new Date(dateString)
        return date.getFullYear().toString()
    }

    const handleLoadMore = () => {
        if (!data?.pagination.hasMore || !data?.dealer) return

        const nextPage = data.pagination.page + 1
        fetch(`/api/dealers/by-slug/${slugs.join('/')}?page=${nextPage}`)
            .then(res => res.json())
            .then((newData: ApiResponse) => {
                setData(prev => ({
                    ...newData,
                    listings: [...(prev?.listings || []), ...newData.listings]
                }))
            })
            .catch(err => console.error('Error loading more:', err))
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-gray-600">Memuat data dealer...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !data?.dealer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Dealer Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'Dealer yang Anda cari tidak dapat ditemukan.'}
                    </p>
                    <Link
                        href="/dealer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 font-semibold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Kembali ke Daftar Dealer
                    </Link>
                </div>
            </div>
        )
    }

    const { dealer, listings, pagination } = data

    // Use dealer.logo first, fallback to dealer.user.avatar
    const profileImage = dealer.logo || dealer.user.avatar

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
            {/* Header with gradient background and decorative pattern */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat'
                    }} />
                </div>

                <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </button>
                        <h1 className="text-lg font-semibold text-white hidden sm:block">Profil Dealer</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleFavorite}
                                className={`flex items-center justify-center w-10 h-10 backdrop-blur-sm rounded-xl transition-all duration-300 ${
                                    isFavorited
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Centered with proper spacing */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-5 md:p-8">
                        {/* Profile Content */}
                        <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                            {/* Logo - Using fallback to user avatar */}
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg border-4 border-white">
                                    {profileImage ? (
                                        <Image
                                            src={profileImage}
                                            alt={dealer.companyName}
                                            width={144}
                                            height={144}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Building2 className="w-16 h-16 text-primary/50" />
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                {/* Company Name with Verified Badge */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        {dealer.companyName}
                                    </h1>
                                    {dealer.verified && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                            <Shield className="w-3.5 h-3.5 fill-current" />
                                            VERIFIED
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 mb-4 justify-center md:justify-start">
                                    <div className="flex items-center gap-1.5 justify-center md:justify-start">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{dealer.city || dealer.address}</span>
                                    </div>
                                </div>

                                {/* Stats Row - Views and Member Since */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Eye className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{formatNumber(dealer.views || 0)} views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Member since {formatMemberSince(dealer.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                {dealer.description && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Tentang Dealer</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {dealer.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Actions Bar - Sticky on scroll */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 sticky top-4 z-40">
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* WhatsApp - Primary Action */}
                            <button
                                onClick={handleWhatsAppChat}
                                disabled={!dealer.user.phone}
                                className="relative overflow-hidden group flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>Chat WhatsApp</span>
                            </button>

                            {/* Phone Call - Secondary Action */}
                            <button
                                onClick={handlePhoneCall}
                                disabled={!dealer.user.phone}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Phone className="w-5 h-5" />
                                <span className="hidden sm:inline">Telepon</span>
                            </button>

                            {/* Get Directions - Tertiary Action */}
                            <button
                                onClick={handleGetDirections}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 font-semibold border border-blue-200"
                            >
                                <Navigation className="w-5 h-5" />
                                <span className="hidden sm:inline">Petunjuk Arah</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-5 md:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {/* Active Listings */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-100">
                                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                                    {dealer.activeListingsCount}
                                </p>
                                <p className="text-xs md:text-sm text-blue-700 font-medium">Mobil Aktif</p>
                            </div>

                            {/* Total Views */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-100">
                                <p className="text-2xl md:text-3xl font-bold text-purple-600">
                                    {formatNumber(dealer.views || 0)}
                                </p>
                                <p className="text-xs md:text-sm text-purple-700 font-medium">Total Views</p>
                            </div>

                            {/* Rating Placeholder */}
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-100">
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="w-6 h-6 md:w-8 md:h-8 fill-amber-400 text-amber-400" />
                                    <p className="text-2xl md:text-3xl font-bold text-amber-600">5.0</p>
                                </div>
                                <p className="text-xs md:text-sm text-amber-700 font-medium">Rating</p>
                            </div>

                            {/* Member Since */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-100">
                                <p className="text-2xl md:text-3xl font-bold text-green-600">
                                    {formatMemberSince(dealer.createdAt)}
                                </p>
                                <p className="text-xs md:text-sm text-green-700 font-medium">Member Since</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="p-5 md:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border border-blue-200">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lokasi Showroom</h3>
                                <p className="text-gray-600 mb-4">{dealer.address}</p>
                                <button
                                    onClick={handleGetDirections}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-500/25"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Buka di Google Maps
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-5 md:p-6">
                        {/* Section Title */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border border-blue-200">
                                <Car className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Mobil Tersedia ({pagination.total})
                            </h2>
                        </div>

                        {/* Listings Grid or Empty State */}
                        {listings.length === 0 ? (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100 p-12 text-center">
                                <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Mobil</h3>
                                <p className="text-gray-500">
                                    Dealer ini belum memiliki listing mobil aktif saat ini.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {listings.map((listing) => (
                                        <DealerListingCard
                                            key={listing.id}
                                            id={listing.id}
                                            title={listing.title}
                                            slug={listing.slug}
                                            price={listing.price}
                                            year={listing.year}
                                            condition={listing.condition}
                                            mileage={listing.mileage}
                                            transmission={listing.transmission}
                                            location={listing.location}
                                            images={listing.images}
                                            brand={listing.brand}
                                            model={listing.model}
                                            favoriteCount={listing.favoriteCount}
                                        />
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {pagination.hasMore && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={handleLoadMore}
                                            className="group flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-primary/30"
                                        >
                                            Muat Lebih Banyak
                                            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 bg-gray-900 text-white px-6 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
                    {isFavorited ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <span className="text-green-400">✓</span>}
                    <span className="font-medium">{isFavorited ? 'Ditambahkan ke Favorit' : 'Link disalin!'}</span>
                </div>
            )}
        </div>
    )
}
