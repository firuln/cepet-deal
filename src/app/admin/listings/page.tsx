'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Search,
    MoreVertical,
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
    Plus,
    ChevronDown,
    Shield,
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
    images: string[]
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED'
    condition: 'NEW' | 'USED'
    views: number
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

type ConditionTab = 'NEW' | 'USED'
type SourceTab = 'ALL' | 'ADMIN' | 'SELLER'

export default function AdminListingsPage() {
    const router = useRouter()
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [conditionTab, setConditionTab] = useState<ConditionTab>('NEW')
    const [sourceTab, setSourceTab] = useState<SourceTab>('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedListing, setSelectedListing] = useState<string | null>(null)
    const [showAddDropdown, setShowAddDropdown] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        fetchListings()
    }, [statusFilter, conditionTab, sourceTab])

    const fetchListings = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)
            params.append('condition', conditionTab)
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

    // Filter by source (admin vs seller/dealer)
    const filteredBySource = listings.filter(listing => {
        if (sourceTab === 'ALL') return true
        if (sourceTab === 'ADMIN') return listing.user?.role === 'ADMIN'
        if (sourceTab === 'SELLER') return listing.user?.role !== 'ADMIN'
        return true
    })

    // Also filter by search and status
    const filteredListings = filteredBySource.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'NEW':
                return 'bg-accent/20 text-accent'
            case 'USED':
                return 'bg-primary/20 text-primary'
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
                fetchListings()
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
                fetchListings()
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
                fetchListings()
            }
        } catch (error) {
            console.error('Error deleting listing:', error)
        }
    }

    const toggleFeatured = async (listingId: string) => {
        try {
            const res = await fetch('/api/admin/listings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: listingId, featured: true })
            })
            if (res.ok) {
                fetchListings()
            }
        } catch (error) {
            console.error('Error toggling featured:', error)
        }
        setSelectedListing(null)
    }

    // Count statistics
    const getAllCount = () => listings.filter(l => l.condition === conditionTab).length
    const getAdminCount = () => listings.filter(l => l.condition === conditionTab && l.user?.role === 'ADMIN').length
    const getSellerCount = () => listings.filter(l => l.condition === conditionTab && l.user?.role !== 'ADMIN').length
    const pendingCount = () => listings.filter(l => l.status === 'PENDING' && l.condition === conditionTab).length

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Iklan</h1>
                    <p className="text-gray-400 mt-1">
                        Kelola listing mobil {conditionTab === 'NEW' ? 'Baru' : 'Bekas'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchListings()}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowAddDropdown(!showAddDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Iklan</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showAddDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                                <Link
                                    href="/dashboard/listings/new"
                                    onClick={() => setShowAddDropdown(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                >
                                    <Car className="w-4 h-4 text-accent" />
                                    Mobil Baru
                                </Link>
                                <Link
                                    href="/dashboard/listings/used"
                                    onClick={() => setShowAddDropdown(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                >
                                    <Car className="w-4 h-4 text-primary" />
                                    Mobil Bekas
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Condition Tabs */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setConditionTab('NEW'); setSourceTab('ALL'); setCurrentPage(1) }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                            conditionTab === 'NEW'
                                ? 'bg-accent text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <Car className="w-5 h-5" />
                        <span className="font-semibold">Mobil Baru</span>
                    </button>
                    <button
                        onClick={() => { setConditionTab('USED'); setSourceTab('ALL'); setCurrentPage(1) }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                            conditionTab === 'USED'
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <Car className="w-5 h-5" />
                        <span className="font-semibold">Mobil Bekas</span>
                    </button>
                </div>
            </div>

            {/* Sub Source Tabs */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-2 mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSourceTab('ALL'); setCurrentPage(1) }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            sourceTab === 'ALL'
                                ? 'bg-white text-gray-900'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        <span className="font-medium">Semua</span>
                        <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">({getAllCount()})</span>
                    </button>
                    <button
                        onClick={() => { setSourceTab('ADMIN'); setCurrentPage(1) }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            sourceTab === 'ADMIN'
                                ? 'bg-accent/20 text-accent border border-accent/30'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Posting Admin</span>
                        <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">({getAdminCount()})</span>
                    </button>
                    <button
                        onClick={() => { setSourceTab('SELLER'); setCurrentPage(1) }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            sourceTab === 'SELLER'
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        <Car className="w-4 h-4" />
                        <span className="font-medium">Posting Penjual/Dealer</span>
                        <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">({getSellerCount()})</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul iklan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="SOLD">Terjual</option>
                        <option value="REJECTED">Ditolak</option>
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
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Kondisi</th>
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
                                    <td colSpan={7} className="py-8 text-center text-gray-400">Memuat data...</td>
                                </tr>
                            ) : paginatedListings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                                        <p className="text-gray-400 mb-2">Tidak ada iklan {conditionTab === 'NEW' ? 'Baru' : 'Bekas'} ditemukan</p>
                                        <Link
                                            href={`/dashboard/listings/new?condition=${conditionTab}`}
                                            className="text-accent hover:underline inline-flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Buat iklan baru
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                paginatedListings.map((listing) => (
                                    <tr key={listing.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                    {listing.images && listing.images[0] ? (
                                                        <Image
                                                            src={listing.images[0]}
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
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getConditionBadge(listing.condition)}`}>
                                                {listing.condition === 'NEW' ? 'Baru' : 'Bekas'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="text-white font-medium">{formatCurrency(listing.price)}</span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <div>
                                                <p className="text-gray-300">{listing.user?.name || '-'}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500">
                                                        {listing.user?.role === 'DEALER' ? 'Dealer' :
                                                         listing.user?.role === 'ADMIN' ? 'Admin' : 'Pribadi'}
                                                    </p>
                                                    {listing.user?.role === 'ADMIN' && (
                                                        <Shield className="w-3 h-3 text-accent" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                                                {LISTING_STATUS[listing.status]}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <span className="text-gray-300">{formatNumber(listing.views)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={listing.condition === 'NEW' ? `/mobil-baru/${listing.slug}` : `/mobil-bekas/${listing.slug}`}
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
                                                            <button
                                                                onClick={() => toggleFeatured(listing.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                                Jadikan Featured
                                                            </button>
                                                            <Link
                                                                href={`/dashboard/listings/${listing.id}/edit`}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                Edit
                                                            </Link>
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
