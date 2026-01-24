import Image from 'next/image'
import Link from 'next/link'
import { Car, ChevronRight, Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getBrands() {
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { listings: true },
            },
        },
    })
    return brands
}

export default async function BrandPage() {
    const brands = await getBrands()

    // Group brands by first letter
    const groupedBrands: Record<string, typeof brands> = {}
    brands.forEach((brand) => {
        const firstLetter = brand.name.charAt(0).toUpperCase()
        if (!groupedBrands[firstLetter]) {
            groupedBrands[firstLetter] = []
        }
        groupedBrands[firstLetter].push(brand)
    })

    const totalCars = brands.reduce((acc, brand) => acc + brand._count.listings, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-8">
                    <h1 className="text-3xl font-bold text-secondary">Cari Berdasarkan Merk</h1>
                    <p className="text-gray-500 mt-2">
                        {brands.length} merk mobil tersedia dengan total {totalCars.toLocaleString()} iklan
                    </p>
                </div>
            </div>

            <div className="container py-8">
                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari merk mobil..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Popular Brands */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-secondary mb-4">Merk Populer</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {brands.slice(0, 6).map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brand/${brand.slug}`}
                                className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all group"
                            >
                                <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    {brand.logo ? (
                                        <Image
                                            src={brand.logo}
                                            alt={brand.name}
                                            fill
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Car className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors">
                                    {brand.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {brand._count.listings} mobil
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* All Brands by Alphabet */}
                <div>
                    <h2 className="text-xl font-bold text-secondary mb-4">Semua Merk</h2>
                    <div className="space-y-6">
                        {Object.entries(groupedBrands).sort().map(([letter, letterBrands]) => (
                            <div key={letter}>
                                <h3 className="text-lg font-bold text-primary mb-3">{letter}</h3>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {letterBrands.map((brand) => (
                                        <Link
                                            key={brand.id}
                                            href={`/brand/${brand.slug}`}
                                            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 flex-shrink-0">
                                                    {brand.logo ? (
                                                        <Image
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <Car className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                                                        {brand.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {brand._count.listings} mobil
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
