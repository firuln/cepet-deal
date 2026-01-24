'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
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
    ChevronLeft,
    User,
    Shield,
    CheckCircle,
    Car,
} from 'lucide-react'
import { Button, Badge, ImageSlider, Tabs, TabsList, TabsTrigger, TabsContent, YouTubePlayer } from '@/components/ui'
import { CarCard } from '@/components/features'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Sample car detail data
const carDetail = {
    id: '1',
    title: 'Toyota Avanza 1.5 G CVT 2024',
    slug: 'toyota-avanza-15-g-cvt-2024',
    brand: 'Toyota',
    model: 'Avanza',
    year: 2024,
    price: 270000000,
    negotiable: true,
    condition: 'NEW' as const,
    transmission: 'CVT',
    fuelType: 'Bensin',
    bodyType: 'MPV',
    mileage: 0,
    color: 'Putih',
    engineSize: 1496,
    location: 'Jakarta Selatan',
    views: 1234,
    createdAt: '2024-01-15',
    images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
        'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=800',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: `Toyota Avanza 1.5 G CVT 2024 adalah mobil keluarga yang sempurna untuk aktivitas sehari-hari. Dilengkapi dengan mesin 1.5L Dual VVT-i yang bertenaga namun tetap irit bahan bakar, transmisi CVT yang halus, serta fitur keselamatan lengkap termasuk Toyota Safety Sense.

Mobil ini dalam kondisi baru dengan kilometer 0 dan garansi resmi Toyota Indonesia. Tersedia dalam berbagai pilihan warna.

Keunggulan:
• Mesin 1.5L Dual VVT-i dengan tenaga 106 HP
• Transmisi CVT dengan 7-speed sequential shift
• Kapasitas 7 penumpang
• Toyota Safety Sense (TSS)
• Layar head unit 9 inch dengan Apple CarPlay & Android Auto
• AC Auto dengan rear blower
• Cruise Control`,
    features: {
        'Eksterior': ['LED Headlamp', 'DRL', 'Fog Lamp', 'Roof Rail', 'Shark Fin Antenna', 'Chrome Door Handle'],
        'Interior': ['Leather Steering Wheel', 'Automatic AC', 'Rear AC Blower', 'Power Window', 'Central Lock', 'Keyless Entry'],
        'Keselamatan': ['Airbag (6)', 'ABS + EBD', 'Hill Start Assist', 'Vehicle Stability Control', 'Parking Sensor', 'Rear Camera'],
        'Hiburan': ['9 inch Touchscreen', 'Apple CarPlay', 'Android Auto', 'Bluetooth', 'USB Port', '6 Speakers'],
    },
    specifications: {
        'Dimensi': {
            'Panjang': '4,395 mm',
            'Lebar': '1,730 mm',
            'Tinggi': '1,700 mm',
            'Jarak Sumbu Roda': '2,750 mm',
            'Ground Clearance': '200 mm',
        },
        'Mesin': {
            'Tipe Mesin': '2NR-VE',
            'Kapasitas': '1,496 cc',
            'Tenaga Maksimum': '106 HP @ 6,000 rpm',
            'Torsi Maksimum': '138 Nm @ 4,200 rpm',
            'Sistem Bahan Bakar': 'EFI',
        },
        'Transmisi': {
            'Tipe': 'CVT (Continuously Variable Transmission)',
            'Sistem Penggerak': 'FWD (Front Wheel Drive)',
        },
        'Kapasitas': {
            'Tangki BBM': '43 Liter',
            'Kapasitas Penumpang': '7 Orang',
            'Kapasitas Bagasi': '188 Liter',
        },
    },
    seller: {
        id: '1',
        name: 'Auto Prima Motor',
        type: 'DEALER',
        verified: true,
        phone: '081234567890',
        avatar: null,
        rating: 4.8,
        totalListings: 45,
        memberSince: '2020',
    },
}

// Related cars
const relatedCars = [
    {
        id: '2',
        title: 'Toyota Veloz 1.5 Q CVT 2024',
        price: 310000000,
        year: 2024,
        mileage: 0,
        location: 'Jakarta Selatan',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500',
        condition: 'NEW' as const,
        transmission: 'CVT',
        fuelType: 'Bensin',
    },
    {
        id: '3',
        title: 'Daihatsu Xenia 1.5 R CVT 2024',
        price: 260000000,
        year: 2024,
        mileage: 0,
        location: 'Jakarta Barat',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500',
        condition: 'NEW' as const,
        transmission: 'CVT',
        fuelType: 'Bensin',
    },
    {
        id: '4',
        title: 'Mitsubishi Xpander Cross 2024',
        price: 350000000,
        year: 2024,
        mileage: 0,
        location: 'Bekasi',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500',
        condition: 'NEW' as const,
        transmission: 'Automatic',
        fuelType: 'Bensin',
    },
]

export default function CarDetailPage() {
    const params = useParams()
    const [isFavorited, setIsFavorited] = useState(false)

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Halo, saya tertarik dengan ${carDetail.title} yang dijual di CepetDeal. Apakah masih tersedia?`)
        window.open(`https://wa.me/${carDetail.seller.phone}?text=${message}`, '_blank')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary">Beranda</Link>
                        <span>/</span>
                        <Link href="/mobil-baru" className="hover:text-primary">Mobil Baru</Link>
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
                                images={carDetail.images}
                                alt={carDetail.title}
                                className="p-4"
                            />
                        </div>

                        {/* Car Info Header */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant={carDetail.condition === 'NEW' ? 'success' : 'warning'}>
                                    {carDetail.condition === 'NEW' ? 'Baru' : 'Bekas'}
                                </Badge>
                                {carDetail.negotiable && (
                                    <Badge variant="outline">Bisa Nego</Badge>
                                )}
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
                                        <p className="font-medium">{carDetail.transmission}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Fuel className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Bahan Bakar</p>
                                        <p className="font-medium">{carDetail.fuelType}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{carDetail.location}</span>
                            </div>
                        </div>

                        {/* YouTube Video */}
                        {carDetail.youtubeUrl && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <h2 className="text-lg font-semibold text-secondary mb-4">Video</h2>
                                <YouTubePlayer
                                    url={carDetail.youtubeUrl}
                                    title={carDetail.title}
                                />
                            </div>
                        )}

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
                                </TabsContent>

                                {/* Specifications Tab */}
                                <TabsContent value="specs">
                                    <div className="space-y-6">
                                        {Object.entries(carDetail.specifications).map(([category, specs]) => (
                                            <div key={category}>
                                                <h3 className="font-semibold text-secondary mb-3">{category}</h3>
                                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                                    <table className="w-full">
                                                        <tbody>
                                                            {Object.entries(specs).map(([key, value], index) => (
                                                                <tr key={key} className={index % 2 === 0 ? 'bg-white' : ''}>
                                                                    <td className="px-4 py-3 text-gray-500 w-1/3">{key}</td>
                                                                    <td className="px-4 py-3 font-medium text-secondary">{value}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Related Cars */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-secondary mb-4">Mobil Serupa</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedCars.map((car) => (
                                    <CarCard key={car.id} {...car} />
                                ))}
                            </div>
                        </div>
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
                                            <Badge variant={carDetail.seller.type === 'DEALER' ? 'primary' : 'outline'} size="sm">
                                                {carDetail.seller.type === 'DEALER' ? 'Dealer' : 'Pribadi'}
                                            </Badge>
                                            <span>★ {carDetail.seller.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-lg font-bold text-secondary">{carDetail.seller.totalListings}</p>
                                        <p className="text-xs text-gray-500">Iklan Aktif</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-lg font-bold text-secondary">{carDetail.seller.memberSince}</p>
                                        <p className="text-xs text-gray-500">Bergabung</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full" onClick={handleWhatsApp}>
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
