'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
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
    AlertTriangle,
    Loader2,
} from 'lucide-react'
import { Button, Badge, ImageSlider, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton } from '@/components/ui'
import { CarCard } from '@/components/features'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TRANSMISSIONS, FUEL_TYPES, BODY_TYPES } from '@/lib/constants'

interface Seller {
    id: string
    name: string
    type: 'DEALER' | 'PERSONAL'
    verified: boolean
    phone: string | null
    avatar: string | null
    memberSince: string
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

interface CarDetail {
    id: string
    title: string
    slug: string
    brand: string
    model: string
    year: number
    price: number
    negotiable: boolean
    condition: 'NEW' | 'USED'
    transmission: string
    fuelType: string
    bodyType: string
    mileage: number
    color: string
    engineSize: number | null
    description: string
    location: string
    images: string[]
    youtubeUrl: string | null
    views: number
    createdAt: string
    features: Record<string, string[]>
    seller: Seller
    relatedCars: RelatedCar[]
}

// Sample data fallback for when no listings exist yet
const sampleCarDetail: CarDetail = {
    id: '1',
    title: 'Honda HR-V 1.5 SE CVT 2023',
    slug: 'honda-hrv-15-se-cvt-2023',
    brand: 'Honda',
    model: 'HR-V',
    year: 2023,
    price: 380000000,
    negotiable: true,
    condition: 'USED',
    transmission: 'CVT',
    fuelType: 'PETROL',
    bodyType: 'SUV',
    mileage: 15000,
    color: 'Abu-abu Metalik',
    engineSize: 1498,
    description: `Honda HR-V 1.5 SE CVT 2023 dalam kondisi sangat terawat. Mobil ini merupakan tangan pertama dari baru dengan service record lengkap di bengkel resmi Honda.

Kondisi:
• Mesin halus, tidak ada rembes
• Transmisi CVT responsif
• Kaki-kaki empuk, tidak ada bunyi
• Interior bersih, tidak ada sobek
• Pajak hidup sampai bulan 10/2024
• STNK & BPKB lengkap

Alasan jual: upgrade ke mobil yang lebih besar.

Harga masih bisa nego tipis untuk pembeli serius. Bisa bantu proses kredit dengan berbagai leasing.`,
    location: 'Jakarta Selatan',
    images: [
        'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=800',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    ],
    youtubeUrl: null,
    views: 856,
    createdAt: '2024-01-10',
    features: {
        'Eksterior': ['LED Headlamp', 'DRL', 'Chrome Grille', 'Alloy Wheels 17"', 'Rear Spoiler'],
        'Interior': ['Fabric Seat', 'Automatic AC', 'Push Start Button', 'Multi-info Display', 'Cruise Control'],
        'Keselamatan': ['Dual Airbag', 'ABS + EBD', 'Hill Start Assist', 'Rear Camera', 'Parking Sensor'],
        'Hiburan': ['8 inch Touchscreen', 'Bluetooth', 'USB Port', 'Steering Audio Control'],
    },
    seller: {
        id: '2',
        name: 'Andi Pratama',
        type: 'PERSONAL',
        verified: false,
        phone: '081298765432',
        avatar: null,
        memberSince: '2023',
    },
    relatedCars: [
        {
            id: '2',
            title: 'Honda HR-V 1.8 Prestige 2022',
            slug: 'honda-hrv-18-prestige-2022',
            price: 350000000,
            year: 2022,
            mileage: 25000,
            location: 'Jakarta Barat',
            image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500',
            condition: 'USED',
            transmission: 'CVT',
            fuelType: 'PETROL',
        },
        {
            id: '3',
            title: 'Toyota C-HR Hybrid 2023',
            slug: 'toyota-chr-hybrid-2023',
            price: 420000000,
            year: 2023,
            mileage: 8000,
            location: 'Tangerang',
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500',
            condition: 'USED',
            transmission: 'CVT',
            fuelType: 'HYBRID',
        },
        {
            id: '4',
            title: 'Hyundai Creta Prime 2023',
            slug: 'hyundai-creta-prime-2023',
            price: 360000000,
            year: 2023,
            mileage: 12000,
            location: 'Depok',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500',
            condition: 'USED',
            transmission: 'AUTOMATIC',
            fuelType: 'PETROL',
        },
    ]
}

export default function UsedCarDetailPage() {
    const params = useParams()
    const slug = params.slug as string

    const [carDetail, setCarDetail] = useState<CarDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        async function fetchListing() {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/listings/${slug}`)

                if (res.status === 404) {
                    // Use sample data for demo purposes
                    setCarDetail(sampleCarDetail)
                    setIsLoading(false)
                    return
                }

                if (!res.ok) {
                    throw new Error('Failed to fetch listing')
                }

                const data = await res.json()
                setCarDetail(data)
            } catch (err) {
                console.error('Error fetching listing:', err)
                // Fallback to sample data
                setCarDetail(sampleCarDetail)
            } finally {
                setIsLoading(false)
            }
        }

        if (slug) {
            fetchListing()
        }
    }, [slug])

    const handleWhatsApp = () => {
        if (!carDetail?.seller.phone) return
        const message = encodeURIComponent(`Halo, saya tertarik dengan ${carDetail.title} (${carDetail.mileage.toLocaleString()} km) yang dijual di CepetDeal. Apakah masih tersedia?`)
        window.open(`https://wa.me/${carDetail.seller.phone}?text=${message}`, '_blank')
    }

    const getTransmissionLabel = (value: string) => {
        return TRANSMISSIONS[value as keyof typeof TRANSMISSIONS] || value
    }

    const getFuelTypeLabel = (value: string) => {
        return FUEL_TYPES[value as keyof typeof FUEL_TYPES] || value
    }

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="container py-4">
                        <Skeleton className="h-5 w-64" />
                    </div>
                </div>
                <div className="container py-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <Skeleton className="aspect-[4/3] rounded-xl mb-6" />
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <Skeleton className="h-6 w-20 mb-3" />
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-10 w-48 mb-4" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} className="h-12" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <aside className="lg:w-80">
                            <Skeleton className="h-64 rounded-xl" />
                        </aside>
                    </div>
                </div>
            </div>
        )
    }

    if (!carDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-secondary mb-2">Mobil Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-4">Iklan yang Anda cari tidak tersedia.</p>
                    <Link href="/mobil-bekas">
                        <Button>Kembali ke Daftar Mobil</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary">Beranda</Link>
                        <span>/</span>
                        <Link href="/mobil-bekas" className="hover:text-primary">Mobil Bekas</Link>
                        <span>/</span>
                        <span className="text-secondary">{carDetail.brand} {carDetail.model}</span>
                    </div>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <ImageSlider
                                images={carDetail.images.length > 0 ? carDetail.images : ['https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=800']}
                                alt={carDetail.title}
                                className="p-4"
                            />
                        </div>

                        {/* Car Info Header */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="warning">Bekas</Badge>
                                {carDetail.negotiable && (
                                    <Badge variant="outline">Bisa Nego</Badge>
                                )}
                                <Badge variant="outline">{formatNumber(carDetail.mileage)} km</Badge>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                                {carDetail.title}
                            </h1>

                            <p className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                {formatCurrency(carDetail.price)}
                            </p>

                            {/* Quick Specs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Tahun</p>
                                        <p className="font-medium">{carDetail.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gauge className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Kilometer</p>
                                        <p className="font-medium">{formatNumber(carDetail.mileage)} km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Transmisi</p>
                                        <p className="font-medium">{getTransmissionLabel(carDetail.transmission)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Fuel className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Bahan Bakar</p>
                                        <p className="font-medium">{getFuelTypeLabel(carDetail.fuelType)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{carDetail.location}</span>
                            </div>
                        </div>

                        {/* Tabbed Content */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <Tabs defaultValue="description">
                                <TabsList>
                                    <TabsTrigger value="description">Deskripsi</TabsTrigger>
                                    <TabsTrigger value="features">Fitur</TabsTrigger>
                                    <TabsTrigger value="specs">Spesifikasi</TabsTrigger>
                                </TabsList>

                                {/* Description Tab */}
                                <TabsContent value="description">
                                    <div className="prose prose-gray max-w-none">
                                        <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                                            {carDetail.description}
                                        </p>
                                    </div>
                                </TabsContent>

                                {/* Features Tab */}
                                <TabsContent value="features">
                                    {Object.keys(carDetail.features).length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {Object.entries(carDetail.features).map(([category, items]) => (
                                                <div key={category}>
                                                    <h3 className="font-semibold text-secondary mb-3">{category}</h3>
                                                    <ul className="space-y-2">
                                                        {items.map((item, index) => (
                                                            <li key={index} className="flex items-center gap-2 text-gray-600">
                                                                <CheckCircle className="w-4 h-4 text-accent" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum ada data fitur untuk mobil ini.</p>
                                    )}
                                </TabsContent>

                                {/* Specifications Tab */}
                                <TabsContent value="specs">
                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <tbody>
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3 text-gray-500 w-1/3">Merk</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{carDetail.brand}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-gray-500">Model</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{carDetail.model}</td>
                                                </tr>
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3 text-gray-500">Tahun</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{carDetail.year}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-gray-500">Warna</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{carDetail.color}</td>
                                                </tr>
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3 text-gray-500">Kilometer</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{formatNumber(carDetail.mileage)} km</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-gray-500">Transmisi</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{getTransmissionLabel(carDetail.transmission)}</td>
                                                </tr>
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3 text-gray-500">Bahan Bakar</td>
                                                    <td className="px-4 py-3 font-medium text-secondary">{getFuelTypeLabel(carDetail.fuelType)}</td>
                                                </tr>
                                                {carDetail.engineSize && (
                                                    <tr>
                                                        <td className="px-4 py-3 text-gray-500">Kapasitas Mesin</td>
                                                        <td className="px-4 py-3 font-medium text-secondary">{formatNumber(carDetail.engineSize)} cc</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Warning for used cars */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-yellow-800">Tips Beli Mobil Bekas</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Selalu cek kondisi mobil secara langsung, periksa dokumen kendaraan, dan lakukan test drive sebelum membeli.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Related Cars */}
                        {carDetail.relatedCars.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-secondary mb-4">Mobil Serupa</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {carDetail.relatedCars.map((car) => (
                                        <CarCard
                                            key={car.id}
                                            id={car.id}
                                            title={car.title}
                                            price={car.price}
                                            year={car.year}
                                            mileage={car.mileage}
                                            location={car.location}
                                            image={car.image || 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=500'}
                                            condition={car.condition}
                                            transmission={getTransmissionLabel(car.transmission)}
                                            fuelType={getFuelTypeLabel(car.fuelType)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-20 space-y-4">
                            {/* Seller Card */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                                        {carDetail.seller.avatar ? (
                                            <Image
                                                src={carDetail.seller.avatar}
                                                alt={carDetail.seller.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <User className="w-7 h-7 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-semibold text-secondary">{carDetail.seller.name}</h3>
                                            {carDetail.seller.verified && (
                                                <Shield className="w-4 h-4 text-accent" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Badge variant="outline" size="sm">
                                                {carDetail.seller.type === 'DEALER' ? 'Dealer' : 'Pribadi'}
                                            </Badge>
                                            <span>Sejak {carDetail.seller.memberSince}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full" onClick={handleWhatsApp} disabled={!carDetail.seller.phone}>
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Chat via WhatsApp
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Hubungi Penjual
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${isFavorited
                                            ? 'bg-red-50 border-red-200 text-red-500'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">Simpan</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        <span className="text-sm font-medium">Bagikan</span>
                                    </button>
                                </div>
                            </div>

                            {/* Views Counter */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold text-secondary">{formatNumber(carDetail.views)}</span> orang melihat iklan ini
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
