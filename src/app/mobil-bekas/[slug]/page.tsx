'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Heart,
    Share2,
    MapPin,
    Calendar,
    Gauge,
    Fuel,
    Settings2,
    MessageCircle,
    Phone,
    User,
    Shield,
    CheckCircle,
    Car,
    Home,
    ChevronRight,
    Eye,
    Clock,
    Star,
    Zap,
    Users,
    Palette,
    FileText,
    Sparkles,
    AlertTriangle,
} from 'lucide-react'
import { Button, Badge, ImageSlider, Tabs, TabsList, TabsTrigger, TabsContent, YouTubePlayer, CreditCalculator, VehicleHistory, FAQAccordion, NewCarCard, CompactCarCard } from '@/components/ui'
import { CarCard, CarFeatures } from '@/components/features'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface CarFeature {
    id: string
    category: string
    name: string
}

interface ListingDetail {
    id: string
    title: string
    slug: string
    brand: string
    model: string
    year: number
    price: number
    condition: 'NEW' | 'USED'
    status: string
    transmission: string
    fuelType: string
    bodyType: string
    mileage: number
    color: string
    engineSize?: number
    description: string
    location: string
    images: string[]
    youtubeUrl?: string
    views: number
    createdAt: string
    features: CarFeature[]
    seller: {
        id: string
        name: string
        type: 'DEALER' | 'PERSONAL'
        verified: boolean
        phone?: string
        avatar?: string
        memberSince: string
    }
    // Vehicle History Fields
    pajakStnk?: string | null
    pemakaian?: string | null
    serviceTerakhir?: string | null
    bpkbStatus?: string | null
    kecelakaan?: boolean | null
    kondisiMesin?: string | null
    kondisiKaki?: string | null
    kondisiAc?: string | null
    kondisiBan?: string | null
}

interface RelatedCar {
    id: string
    title: string
    slug: string
    price: number
    year: number
    mileage: number
    location: string
    image: string | null
    condition: 'NEW' | 'USED'
    transmission: string
    fuelType: string
}

interface RecommendedNewCar {
    id: string
    title: string
    slug: string
    price: number
    year: number
    image: string
    badge: 'NEW' | 'PROMO'
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

const BODY_TYPE_LABELS: Record<string, string> = {
    SEDAN: 'Sedan',
    SUV: 'SUV',
    MPV: 'MPV',
    HATCHBACK: 'Hatchback',
    COUPE: 'Coupe',
    PICKUP: 'Pickup',
    VAN: 'Van',
}

export default function MobilBekasDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [listing, setListing] = useState<ListingDetail | null>(null)
    const [relatedCars, setRelatedCars] = useState<RelatedCar[]>([])
    const [recommendedNewCars, setRecommendedNewCars] = useState<RecommendedNewCar[]>([])
    const [isFavorited, setIsFavorited] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/listings/${slug}`)

                if (!res.ok) {
                    throw new Error('Listing not found')
                }

                const data = await res.json()

                // If this is a NEW car listing, redirect to the correct page
                if (data.condition === 'NEW') {
                    router.replace(`/mobil-baru/${slug}`)
                    return
                }

                // Verify this is a USED car listing
                if (data.condition !== 'USED') {
                    throw new Error('This is not a used car listing')
                }

                // Extract related cars from response
                const relatedCarsData = data.relatedCars || []
                delete data.relatedCars

                // Extract recommended new cars from response
                const recommendedNewCarsData = data.recommendedNewCars || []
                delete data.recommendedNewCars

                setListing(data)
                setRelatedCars(relatedCarsData)
                setRecommendedNewCars(recommendedNewCarsData)
            } catch (err) {
                console.error('Error fetching listing:', err)
                setError(err instanceof Error ? err.message : 'Failed to load listing')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchListing()
        }
    }, [slug, router])

    const handleWhatsApp = () => {
        if (!listing?.seller.phone) return
        const message = encodeURIComponent(`Halo, saya tertarik dengan ${listing.title} yang dijual di CepetDeal. Apakah masih tersedia?`)
        window.open(`https://wa.me/${listing.seller.phone}?text=${message}`, '_blank')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-primary border-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        )
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-secondary mb-2">Iklan Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-4">{error || 'Maaf, iklan yang Anda cari tidak tersedia.'}</p>
                    <Link href="/mobil-bekas">
                        <Button>Lihat Mobil Bekas Lainnya</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const transmissionLabel = TRANSMISSION_LABELS[listing.transmission] || listing.transmission
    const fuelTypeLabel = FUEL_TYPE_LABELS[listing.fuelType] || listing.fuelType
    const bodyTypeLabel = BODY_TYPE_LABELS[listing.bodyType] || listing.bodyType

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Schema.org Breadcrumb */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Beranda',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cepetdeal.com'}/`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Mobil Bekas',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cepetdeal.com'}/mobil-bekas`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: `${listing.brand} ${listing.model}`,
                            },
                        ],
                    }),
                }}
            />

            {/* Modern Breadcrumb */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container py-3 px-4 sm:px-6">
                    <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 group whitespace-nowrap"
                        >
                            <Home className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="font-medium">Beranda</span>
                        </Link>

                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mx-1" />

                        <Link
                            href="/mobil-bekas"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 group whitespace-nowrap"
                        >
                            <Car className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="font-medium">Mobil Bekas</span>
                        </Link>

                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mx-1" />

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-900 whitespace-nowrap">
                            <span className="font-semibold text-xs sm:text-sm">{listing.brand} {listing.model}</span>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <div className="container pt-8 pb-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <ImageSlider
                                images={listing.images}
                                alt={listing.title}
                                className="p-4"
                            />
                        </div>

                        {/* Car Info Header - Modern Gradient Accent */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            {/* Trust Badges Bar */}
                            <div className="bg-gradient-to-r from-primary/5 via-orange-50 to-accent/5 px-6 py-2.5 border-b border-gray-100">
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-primary font-medium">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>VERIFIED LISTING</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-600 font-medium">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>PREMIUM QUALITY</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{formatNumber(listing.views)} views</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Condition Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {listing.status === 'PENDING' && (
                                        <Badge variant="warning" className="px-3 py-1 bg-amber-100 text-amber-800 border-amber-200">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Menunggu Approval
                                        </Badge>
                                    )}
                                    <Badge variant="warning" className="px-3 py-1">
                                        Bekas
                                    </Badge>
                                    <Badge variant="primary" className="px-3 py-1">{bodyTypeLabel}</Badge>
                                    <Badge variant="success" className="px-3 py-1 border-green-200 text-green-700 bg-green-50">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Siap Pakai
                                    </Badge>
                                </div>

                                {/* Title & Quick Info */}
                                <div className="mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                                        {listing.title}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {listing.year} • {bodyTypeLabel} • {transmissionLabel} • {fuelTypeLabel}
                                    </p>
                                </div>

                                {/* Price with Gradient */}
                                <div className="bg-gradient-to-r from-primary via-orange-500 to-accent bg-clip-text text-transparent mb-4">
                                    <p className="text-4xl md:text-5xl font-bold">
                                        {formatCurrency(listing.price)}
                                    </p>
                                </div>

                                {/* Credit Calculator */}
                                <div className="mb-6">
                                    <CreditCalculator price={listing.price} />
                                </div>

                                {/* Specs Grid - Modern Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                                        <p className="text-lg font-bold text-secondary">{listing.year}</p>
                                        <p className="text-xs text-gray-500">Tahun</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
                                        <p className="text-lg font-bold text-secondary">{formatNumber(listing.mileage)}</p>
                                        <p className="text-xs text-gray-500">Kilometer</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Settings2 className="w-6 h-6 text-primary mx-auto mb-2" />
                                        <p className="text-lg font-bold text-secondary">{transmissionLabel}</p>
                                        <p className="text-xs text-gray-500">Transmisi</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Fuel className="w-6 h-6 text-primary mx-auto mb-2" />
                                        <p className="text-lg font-bold text-secondary">{fuelTypeLabel}</p>
                                        <p className="text-xs text-gray-500">Bahan Bakar</p>
                                    </div>
                                </div>

                                {/* Additional Specs Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Palette className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                                        <p className="text-sm font-semibold text-secondary">{listing.color}</p>
                                        <p className="text-xs text-gray-500">Warna</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Users className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                                        <p className="text-sm font-semibold text-secondary">{bodyTypeLabel}</p>
                                        <p className="text-xs text-gray-500">Tipe Body</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <Zap className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                                        <p className="text-sm font-semibold text-secondary">{listing.engineSize || '-'} cc</p>
                                        <p className="text-xs text-gray-500">Mesin</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                                        <MapPin className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
                                        <p className="text-sm font-semibold text-secondary truncate">{listing.location}</p>
                                        <p className="text-xs text-gray-500">Lokasi</p>
                                    </div>
                                </div>

                                {/* Location & Meta */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span>{listing.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>Posted {new Date(listing.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust & Safety Banner */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-800 mb-1">Mobil Bekas Terjamin</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-700">
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Kondisi terawat</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Dokumen lengkap</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Transaksi aman</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Video */}
                        {listing.youtubeUrl && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <h2 className="text-lg font-semibold text-secondary mb-4">Video</h2>
                                <YouTubePlayer
                                    url={listing.youtubeUrl}
                                    title={listing.title}
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-secondary mb-4">Deskripsi</h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                                    {listing.description}
                                </p>
                            </div>
                        </div>

                        {/* Car Features */}
                        {listing.features && listing.features.length > 0 && (
                            <CarFeatures features={listing.features} />
                        )}

                        {/* Vehicle History */}
                        <VehicleHistory
                            pajakStnk={listing.pajakStnk}
                            pemakaian={listing.pemakaian}
                            serviceTerakhir={listing.serviceTerakhir}
                            bpkbStatus={listing.bpkbStatus}
                            kecelakaan={listing.kecelakaan}
                            kondisiMesin={listing.kondisiMesin}
                            kondisiKaki={listing.kondisiKaki}
                            kondisiAc={listing.kondisiAc}
                            kondisiBan={listing.kondisiBan}
                        />

                        {/* FAQ Accordion */}
                        <FAQAccordion />

                        {/* Mobile Seller Card - Only visible on mobile */}
                        <div className="lg:hidden bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-primary via-orange-500 to-accent px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">
                                            {listing.seller.verified ? 'VERIFIED DEALER' : 'SELLER'}
                                        </p>
                                        <div className="flex items-center gap-1 text-white/90 text-xs">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>4.8 (128 ulasan)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-primary/10">
                                            {listing.seller.avatar ? (
                                                <Image
                                                    src={listing.seller.avatar}
                                                    alt={listing.seller.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                                    <User className="w-8 h-8 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-secondary mb-1 truncate">{listing.seller.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={listing.seller.type === 'DEALER' ? 'primary' : 'info'} size="sm">
                                                {listing.seller.type === 'DEALER' ? 'Dealer' : 'Pribadi'}
                                            </Badge>
                                            {listing.seller.verified && (
                                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <Car className="w-4 h-4 text-primary mx-auto mb-1" />
                                        <p className="text-xs font-bold text-secondary">156</p>
                                        <p className="text-xs text-gray-500">Listing</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <Clock className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                        <p className="text-xs font-bold text-secondary">2jam</p>
                                        <p className="text-xs text-gray-500">Respon</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                        <p className="text-xs font-bold text-secondary">98%</p>
                                        <p className="text-xs text-gray-500">Rate</p>
                                    </div>
                                </div>

                                {listing.seller.phone && (
                                    <Button className="w-full" onClick={handleWhatsApp}>
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Chat WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Related Cars - Desktop & Mobile */}
                        {relatedCars.length > 0 && (
                            <div className="bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 mb-6">
                                <h2 className="text-base font-semibold text-secondary mb-4">Mobil Serupa</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {relatedCars.map((car) => (
                                        <CompactCarCard
                                            key={car.id}
                                            id={car.id}
                                            title={car.title}
                                            slug={car.slug}
                                            price={car.price}
                                            year={car.year}
                                            mileage={car.mileage}
                                            transmission={car.transmission}
                                            fuelType={car.fuelType}
                                            image={car.image || '/placeholder-car.png'}
                                            condition={car.condition}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended New Cars - Desktop & Mobile */}
                        {recommendedNewCars.length > 0 && (
                            <div className="bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 border-t border-gray-200">
                                <h2 className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Rekomendasi Mobil Baru
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {recommendedNewCars.map((car) => (
                                        <NewCarCard
                                            key={car.id}
                                            id={car.id}
                                            title={car.title}
                                            slug={car.slug}
                                            price={car.price}
                                            year={car.year}
                                            image={car.image}
                                            badge={car.badge}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                        <div className="sticky top-20 space-y-4">
                            {/* Premium Seller Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* Gradient Header */}
                                <div className="bg-gradient-to-r from-primary via-orange-500 to-accent px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">
                                                    {listing.seller.verified ? 'VERIFIED DEALER' : 'SELLER'}
                                                </p>
                                                <div className="flex items-center gap-1 text-white/90 text-xs">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>4.8 (128 ulasan)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {listing.seller.verified && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs font-medium">
                                                    ⭐ Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {/* Avatar & Info */}
                                    <div className="flex flex-col items-center text-center mb-5">
                                        <div className="relative mb-3">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-primary/10">
                                                {listing.seller.avatar ? (
                                                    <Image
                                                        src={listing.seller.avatar}
                                                        alt={listing.seller.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                                        <User className="w-12 h-12 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Online Status */}
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-secondary mb-1">{listing.seller.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Badge variant={listing.seller.type === 'DEALER' ? 'primary' : 'info'} size="sm">
                                                {listing.seller.type === 'DEALER' ? 'Dealer' : 'Pribadi'}
                                            </Badge>
                                            {listing.seller.verified && (
                                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin className="w-3 h-3" />
                                            <span>{listing.location}</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-2 mb-5">
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Car className="w-4 h-4 text-primary mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">156</p>
                                            <p className="text-xs text-gray-500">Listing</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Clock className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">2jam</p>
                                            <p className="text-xs text-gray-500">Respon</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">98%</p>
                                            <p className="text-xs text-gray-500">Rate</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">12k</p>
                                            <p className="text-xs text-gray-500">Views</p>
                                        </div>
                                    </div>

                                    {/* Response Info */}
                                    <div className="bg-blue-50 rounded-lg p-3 mb-5">
                                        <div className="flex items-start gap-2">
                                            <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Chat dibalas cepat</p>
                                                <p className="text-xs text-blue-600">Biasanya dalam 2 jam</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {listing.seller.phone && (
                                            <Button className="w-full" onClick={handleWhatsApp}>
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Chat WhatsApp
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" className="w-full" disabled>
                                                <Phone className="w-4 h-4 mr-2" />
                                                Telepon
                                            </Button>
                                            <Button variant="outline" className="w-full">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Jadwal
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Modern */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-5">
                                    <p className="text-sm font-medium text-secondary mb-3">Simpan & Bagikan</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsFavorited(!isFavorited)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200 ${
                                                isFavorited
                                                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                        >
                                            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{isFavorited ? 'Disimpan' : 'Simpan'}</span>
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                                            <Share2 className="w-5 h-5" />
                                            <span className="text-sm font-medium">Bagikan</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="px-5 pb-5">
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Eye className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Listing ini dilihat</p>
                                            <p className="text-sm font-bold text-secondary">{formatNumber(listing.views)} kali</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    ⚠️ <span className="font-medium text-gray-700">Kendaraan bekas</span> mengalami keausakan pemakaian wajar.
                                    Cek kondisi langsung sebelum transaksi.
                                    <span className="text-gray-600">Risiko penipuan</span> bukan tanggung jawab CepetDeal.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
