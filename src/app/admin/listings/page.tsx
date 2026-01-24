'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Star,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Car,
    AlertCircle,
    Clock,
    ExternalLink,
    RefreshCw,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { LISTING_STATUS } from '@/lib/constants'

interface Listing {
    id: string
    title: string
    slug: string
    price: number
    year: number
    mileage: number
    location: string
    image: string | null
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED'
    views: number
    createdAt: string
    seller: {
        name: string
        type: 'DEALER' | 'PERSONAL'
    }
}

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedListing, setSelectedListing] = useState<string | null>(null)
    const itemsPerPage = 10

    useEffect(() => {
        fetchListings()
    }, [statusFilter])

    const fetchListings = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)
            // Add timestamp to prevent caching
            params.append('_t', Date.now().toString())

            const res = await fetch(`/api/admin/listings?${params.toString()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            })
            if (res.ok) {
                const data = await res.json()
                setListings(data.listings || [])
            } else {
                console.error('Failed to fetch listings')
                setListings([])
            }
        } catch (error) {
            console.error('Error fetching listings:', error)
            setListings([])
        } finally {
            setIsLoading(false)
        }
    }

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = !statusFilter || listing.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'ACTIVE':
                return 'bg-green-500/20 text-green-400'
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400'
            case 'SOLD':
                return 'bg-blue-500/20 text-blue-400'
            case 'EXPIRED':
                return 'bg-gray-500/20 text-gray-400'
            default:
                return 'bg-gray-500/20 text-gray-400'
        }
    }

    const handleApprove = async (listingId: string) => {
        try {
            const res = await fetch('/api/admin/listings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: listingId, status: 'ACTIVE' })
            })
            if (res.ok) {
                fetchListings() // Refresh data
            }
        } catch (error) {
            console.error('Error approving listing:', error)
        }
        setSelectedListing(null)
    }

    const handleReject = async (listingId: string) => {
        const reason = prompt('Alasan penolakan:')
        if (!reason) return
        try {
            const res = await fetch('/api/admin/listings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: listingId, status: 'REJECTED', rejectReason: reason })
            })
            if (res.ok) {
                fetchListings() // Refresh data
            }
        } catch (error) {
            console.error('Error rejecting listing:', error)
        }
        setSelectedListing(null)
    }

    const handleDelete = async (listingId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus iklan ini?')) return
        try {
            const res = await fetch(`/api/admin/listings?id=${listingId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchListings() // Refresh data
            }
        } catch (error) {
            console.error('Error deleting listing:', error)
        }
    }

    const pendingCount = listings.filter(l => l.status === 'PENDING').length

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Iklan</h1>
                    <p className="text-gray-400 mt-1">
                        {pendingCount > 0 ? (
                            <span className="text-yellow-400">{pendingCount} iklan menunggu persetujuan</span>
                        ) : (
                            `Total ${formatNumber(listings.length)} iklan`
                        )}
                    </p>
                </div>
                <button
                    onClick={() => fetchListings()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul atau penjual..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(LISTING_STATUS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Iklan</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden md:table-cell">Harga</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Penjual</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Views</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">Memuat data...</td>
                                </tr>
                            ) : paginatedListings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        Tidak ada iklan ditemukan
                                    </td>
                                </tr>
                            ) : (
                                paginatedListings.map((listing) => (
                                    <tr key={listing.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                    {listing.image ? (
                                                        <Image
                                                            src={listing.image}
                                                            alt={listing.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Car className="w-6 h-6 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-white truncate">{listing.title}</p>
                                                    <p className="text-sm text-gray-400">{listing.year} • {formatNumber(listing.mileage)} km</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="text-white font-medium">{formatCurrency(listing.price)}</span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <div>
                                                <p className="text-gray-300">{listing.seller.name}</p>
                                                <p className="text-xs text-gray-500">{listing.seller.type === 'DEALER' ? 'Dealer' : 'Pribadi'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                                                {listing.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                {LISTING_STATUS[listing.status]}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <span className="text-gray-300">{formatNumber(listing.views)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/mobil-bekas/${listing.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Lihat di Website"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>

                                                {listing.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(listing.id)}
                                                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(listing.id)}
                                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Tolak"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {selectedListing === listing.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600">
                                                                <Star className="w-4 h-4" />
                                                                Jadikan Featured
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(listing.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Hapus Iklan
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredListings.length)} dari {filteredListings.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-300">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
