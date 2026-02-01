'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Car, Shield, Star, Search, Building2, Loader2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import { createDealerSlug } from '@/lib/slug'

interface DealerUser {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    _count: {
        listings: number
    }
}

interface Dealer {
    id: string
    companyName: string
    address: string
    city?: string
    description?: string
    logo: string | null
    verified: boolean
    verifiedAt: string | null
    createdAt: string
    user: DealerUser
    inventoryCount: number
}

export default function DealerPage() {
    const [dealers, setDealers] = useState<Dealer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCity, setSelectedCity] = useState('Semua Kota')
    const [cities, setCities] = useState<string[]>(['Semua Kota'])

    useEffect(() => {
        const fetchDealers = async () => {
            setIsLoading(true)
            try {
                const res = await fetch('/api/dealers')
                if (res.ok) {
                    const data: Dealer[] = await res.json()
                    setDealers(data)

                    // Extract unique cities
                    const uniqueCities = Array.from(
                        new Set(data.map((d) => d.city).filter((c): c is string => !!c))
                    ).sort()
                    setCities(['Semua Kota', ...uniqueCities])
                }
            } catch (error) {
                console.error('Failed to fetch dealers:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDealers()
    }, [])

    // Filter dealers based on search and city
    const filteredDealers = dealers.filter((dealer) => {
        const matchesSearch = dealer.companyName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCity = selectedCity === 'Semua Kota' || dealer.city === selectedCity
        return matchesSearch && matchesCity
    })

    // Calculate statistics based on filtered data
    const verifiedDealers = filteredDealers.filter((d) => d.verified)
    const totalListings = filteredDealers.reduce((acc, d) => acc + d.inventoryCount, 0)
    const uniqueCitiesCount = new Set(filteredDealers.map((d) => d.city).filter((c): c is string => !!c)).size

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white">
                <div className="container py-10">
                    <h1 className="text-3xl font-bold">Dealer Resmi & Showroom</h1>
                    <p className="text-white/80 mt-2">
                        {isLoading ? (
                            'Memuat data dealer...'
                        ) : (
                            `${filteredDealers.length} dealer terdaftar dengan total ${totalListings.toLocaleString()} mobil tersedia`
                        )}
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 md:w-48"
                        >
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-primary">
                            {isLoading ? '-' : filteredDealers.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Total Dealer</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-accent">
                            {isLoading ? '-' : verifiedDealers.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Dealer Terverifikasi</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-secondary">
                            {isLoading ? '-' : totalListings}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Mobil Tersedia</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                        <p className="text-3xl font-bold text-secondary">
                            {isLoading ? '-' : uniqueCitiesCount}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Kota Terjangkau</p>
                    </div>
                </div>

                {/* Dealer Grid */}
                {isLoading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
                        <p className="text-gray-500">Memuat data dealer...</p>
                    </div>
                ) : filteredDealers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak ada dealer ditemukan</h3>
                        <p className="text-gray-500">
                            {searchQuery || selectedCity !== 'Semua Kota'
                                ? 'Coba ubah kata kunci pencarian atau filter kota Anda.'
                                : 'Belum ada dealer terdaftar saat ini.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDealers.map((dealer) => (
                            <Link
                                key={dealer.id}
                                href={`/dealer/${createDealerSlug(dealer.companyName, dealer.city || '')}`}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {dealer.logo ? (
                                                <Image
                                                    src={dealer.logo}
                                                    alt={dealer.companyName}
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
                                                    {dealer.companyName}
                                                </h3>
                                                {dealer.verified && (
                                                    <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4" />
                                                <span className="truncate">{dealer.city || dealer.address}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-medium">4.5</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {dealer.description || `Dealer mobil terpercaya di ${dealer.city || dealer.address}.`}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Car className="w-4 h-4" />
                                            <span>{dealer.inventoryCount} mobil</span>
                                        </div>
                                        <Badge variant={dealer.verified ? 'success' : 'warning'} size="sm">
                                            {dealer.verified ? 'Terverifikasi' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

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
