import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Car, Shield, Star, Search, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui'

// Sample dealer data (will be replaced with database query)
const dealers = [
    {
        id: '1',
        name: 'Auto Prima Motor',
        slug: 'auto-prima-motor',
        logo: null,
        city: 'Jakarta Selatan',
        address: 'Jl. TB Simatupang No. 123',
        verified: true,
        rating: 4.8,
        totalListings: 45,
        totalSold: 320,
        memberSince: '2020',
        description: 'Showroom mobil baru dan bekas berkualitas dengan harga terbaik.',
    },
    {
        id: '2',
        name: 'Mobilindo Jaya',
        slug: 'mobilindo-jaya',
        logo: null,
        city: 'Surabaya',
        address: 'Jl. Raya Darmo No. 45',
        verified: true,
        rating: 4.7,
        totalListings: 38,
        totalSold: 250,
        memberSince: '2019',
        description: 'Dealer resmi berbagai merk dengan garansi dan after sales terbaik.',
    },
    {
        id: '3',
        name: 'Prima Auto Gallery',
        slug: 'prima-auto-gallery',
        logo: null,
        city: 'Bandung',
        address: 'Jl. Soekarno Hatta No. 78',
        verified: true,
        rating: 4.9,
        totalListings: 52,
        totalSold: 410,
        memberSince: '2018',
        description: 'Spesialis mobil premium dan luxury dengan kondisi terjamin.',
    },
    {
        id: '4',
        name: 'Central Motor',
        slug: 'central-motor',
        logo: null,
        city: 'Medan',
        address: 'Jl. Gatot Subroto No. 200',
        verified: false,
        rating: 4.5,
        totalListings: 28,
        totalSold: 150,
        memberSince: '2021',
        description: 'Dealer mobil keluarga dengan harga bersaing.',
    },
    {
        id: '5',
        name: 'Otomotif Sejahtera',
        slug: 'otomotif-sejahtera',
        logo: null,
        city: 'Semarang',
        address: 'Jl. Pandanaran No. 55',
        verified: true,
        rating: 4.6,
        totalListings: 35,
        totalSold: 180,
        memberSince: '2020',
        description: 'Showroom terpercaya dengan koleksi mobil berkualitas.',
    },
    {
        id: '6',
        name: 'Maju Jaya Motor',
        slug: 'maju-jaya-motor',
        logo: null,
        city: 'Yogyakarta',
        address: 'Jl. Malioboro No. 89',
        verified: true,
        rating: 4.7,
        totalListings: 42,
        totalSold: 290,
        memberSince: '2019',
        description: 'Dealer dengan pelayanan terbaik dan harga transparan.',
    },
]

const cities = ['Semua Kota', 'Jakarta Selatan', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Yogyakarta']

export default function DealerPage() {
    const verifiedDealers = dealers.filter((d) => d.verified)
    const totalListings = dealers.reduce((acc, d) => acc + d.totalListings, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white">
                <div className="container py-10">
                    <h1 className="text-3xl font-bold">Dealer Resmi & Showroom</h1>
                    <p className="text-white/80 mt-2">
                        {dealers.length} dealer terdaftar dengan total {totalListings.toLocaleString()} mobil tersedia
                    </p>
                </div>
            </div>

            <div className="container py-8">
                {/* Search & Filter */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama dealer..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 md:w-48">
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-primary">{dealers.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Total Dealer</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-accent">{verifiedDealers.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Dealer Terverifikasi</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-secondary">{totalListings}</p>
                        <p className="text-sm text-gray-500 mt-1">Mobil Tersedia</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-secondary">{cities.length - 1}</p>
                        <p className="text-sm text-gray-500 mt-1">Kota Terjangkau</p>
                    </div>
                </div>

                {/* Dealer Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dealers.map((dealer) => (
                        <Link
                            key={dealer.id}
                            href={`/dealer/${dealer.slug}`}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {dealer.logo ? (
                                            <Image
                                                src={dealer.logo}
                                                alt={dealer.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <Building2 className="w-8 h-8 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-secondary group-hover:text-primary truncate transition-colors">
                                                {dealer.name}
                                            </h3>
                                            {dealer.verified && (
                                                <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{dealer.city}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-medium">{dealer.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {dealer.description}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Car className="w-4 h-4" />
                                        <span>{dealer.totalListings} mobil</span>
                                    </div>
                                    <Badge variant={dealer.verified ? 'success' : 'warning'} size="sm">
                                        {dealer.verified ? 'Terverifikasi' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-center text-white">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl font-bold mb-2">Ingin Menjadi Dealer di CepetDeal?</h2>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto">
                        Daftarkan showroom Anda dan jangkau lebih banyak pembeli potensial di seluruh Indonesia.
                    </p>
                    <Link
                        href="/register?role=dealer"
                        className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Daftar Sebagai Dealer
                    </Link>
                </div>
            </div>
        </div>
    )
}
