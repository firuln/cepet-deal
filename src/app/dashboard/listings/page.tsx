'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Car,
    Plus,
    Eye,
    MessageSquare,
    Edit,
    Trash2,
    MoreVertical,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    DollarSign,
    Ban,
    FileText,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Badge, Modal, Dropdown, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ReceiptForm } from '@/components/forms'
import { formatCurrency, formatNumber } from '@/lib/utils'

type ListingStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'EXPIRED' | 'REJECTED'

interface Listing {
    id: string
    title: string
    slug: string
    brand: { name: string }
    model: { name: string }
    year: number
    price: number
    views: number
    inquiries: number
    status: ListingStatus
    condition: 'NEW' | 'USED'
    image: string
    createdAt: string
    canEdit: boolean
    canDelete: boolean
    canMarkSold: boolean
}

const statusConfig: Record<ListingStatus, { label: string; variant: 'success' | 'warning' | 'primary' | 'info' | 'danger'; icon: typeof CheckCircle }> = {
    ACTIVE: { label: 'Aktif', variant: 'success', icon: CheckCircle },
    PENDING: { label: 'Menunggu', variant: 'warning', icon: Clock },
    SOLD: { label: 'Terjual', variant: 'primary', icon: CheckCircle },
    EXPIRED: { label: 'Kadaluarsa', variant: 'info', icon: XCircle },
    REJECTED: { label: 'Ditolak', variant: 'danger', icon: XCircle },
}

const filterOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'SOLD', label: 'Terjual' },
    { value: 'EXPIRED', label: 'Kadaluarsa' },
    { value: 'REJECTED', label: 'Ditolak' },
]

export default function MyListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deleteModal, setDeleteModal] = useState<string | null>(null)
    const [receiptModal, setReceiptModal] = useState<Listing | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [financeEnabled, setFinanceEnabled] = useState(false)

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await fetch('/api/listings')
                if (res.ok) {
                    const data = await res.json()
                    const mapped = data.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        slug: item.slug,
                        brand: item.brand,
                        model: item.model,
                        year: item.year,
                        price: item.price,
                        views: item.views || 0,
                        inquiries: item.inquiries || 0,
                        status: item.status,
                        canEdit: item.canEdit || false,
                        canDelete: item.canDelete || false,
                        canMarkSold: item.canMarkSold || false,
                        image: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/200x150?text=No+Image',
                        createdAt: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    }))
                    setListings(mapped)
                }
            } catch (error) {
                console.error('Failed to fetch listings', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchListings()
    }, [])

    useEffect(() => {
        const fetchFinanceStatus = async () => {
            const response = await fetch('/api/user/finance-status')
            if (response.ok) {
                const data = await response.json()
                setFinanceEnabled(data.financeEnabled)
            }
        }
        fetchFinanceStatus()
    }, [])

    const filteredListings = listings.filter((listing) => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleMarkAsSold = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch('/api/listings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'mark_sold' })
            })

            if (res.ok) {
                // Update local state
                setListings(listings.map(l =>
                    l.id === id ? { ...l, status: 'SOLD' as ListingStatus, canMarkSold: false, canEdit: false } : l
                ))
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal menandai sebagai terjual')
            }
        } catch (error) {
            console.error('Error marking as sold:', error)
            alert('Terjadi kesalahan')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReceiptCreated = (receipt: any) => {
        // Refresh listings to update status
        const fetchListings = async () => {
            try {
                const res = await fetch('/api/listings')
                if (res.ok) {
                    const data = await res.json()
                    const mapped = data.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        slug: item.slug,
                        brand: item.brand,
                        model: item.model,
                        year: item.year,
                        price: item.price,
                        views: item.views || 0,
                        inquiries: item.inquiries || 0,
                        status: item.status,
                        canEdit: item.canEdit || false,
                        canDelete: item.canDelete || false,
                        canMarkSold: item.canMarkSold || false,
                        image: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/200x150?text=No+Image',
                        createdAt: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    }))
                    setListings(mapped)
                }
            } catch (error) {
                console.error('Failed to refresh listings', error)
            }
        }
        fetchListings()
        // Modal tetap terbuka agar user bisa download PDF
    }

    const handleDelete = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`/api/listings/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setListings(listings.filter((l) => l.id !== id))
                setDeleteModal(null)
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal menghapus iklan')
            }
        } catch (error) {
            console.error('Error deleting listing:', error)
            alert('Terjadi kesalahan')
        } finally {
            setActionLoading(null)
        }
    }

    const stats = {
        total: listings.length,
        active: listings.filter((l) => l.status === 'ACTIVE').length,
        pending: listings.filter((l) => l.status === 'PENDING').length,
        sold: listings.filter((l) => l.status === 'SOLD').length,
    }

    const getListingTitle = (listing: Listing) => {
        // Format: Merk Model Variant Tahun
        const { brand, model, year } = listing
        // Extract variant from title if it exists
        const titleLower = listing.title.toLowerCase()
        const brandLower = brand.name.toLowerCase()
        const modelLower = model.name.toLowerCase()

        let variant = ''
        const parts = titleLower.split(modelLower)
        if (parts.length > 1) {
            const afterModel = parts[1].trim()
            // Try to extract variant (usually comes before year)
            const yearMatch = afterModel.match(/\d{4}/)
            if (yearMatch) {
                variant = afterModel.substring(0, yearMatch.index).trim()
            } else {
                variant = afterModel.split(',')[0].trim()
            }
        }

        const variantStr = variant ? ` ${variant.charAt(0).toUpperCase() + variant.slice(1)}` : ''
        return `${brand.name} ${model.name}${variantStr} ${year}`
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <Car className="w-6 h-6 text-primary" />
                            Iklan Saya
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Kelola semua iklan mobil Anda
                        </p>
                    </div>
                    <Link href="/dashboard/listings/used">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Pasang Iklan Baru
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-secondary">{stats.total}</p>
                        <p className="text-sm text-gray-500">Total Iklan</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                        <p className="text-sm text-gray-500">Aktif</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                        <p className="text-sm text-gray-500">Menunggu</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{stats.sold}</p>
                        <p className="text-sm text-gray-500">Terjual</p>
                    </div>
                </div>

                {/* Info Banner */}
                {(stats.pending > 0 || stats.active > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Informasi Status Iklan:</p>
                            <ul className="space-y-1 text-xs">
                                {stats.pending > 0 && (
                                    <li>
                                        <span className="font-semibold">Menunggu:</span> Iklan sedang direview oleh admin, tidak dapat diedit
                                    </li>
                                )}
                                {stats.active > 0 && (
                                    <li>
                                        <span className="font-semibold">Aktif:</span> Iklan sudah tayang, dapat diedit atau ditandai terjual
                                    </li>
                                )}
                                <li>
                                    <span className="font-semibold">Terjual:</span> Iklan terjual tidak dapat diedit atau dihapus demi SEO
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari iklan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <Dropdown
                                options={filterOptions}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Filter Status"
                                className="sm:w-48"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Listings */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Memuat iklan...</p>
                        </CardContent>
                    </Card>
                ) : filteredListings.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-secondary mb-2">
                                Tidak ada iklan
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Tidak ada iklan yang sesuai filter'
                                    : 'Mulai jual mobil Anda sekarang'}
                            </p>
                            {!searchQuery && statusFilter === 'all' && (
                                <Link href="/dashboard/listings/used">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Pasang Iklan
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredListings.map((listing) => {
                            const status = statusConfig[listing.status]
                            return (
                                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Image */}
                                            <img
                                                src={listing.image}
                                                alt={listing.title}
                                                className="w-full sm:w-32 h-32 rounded-lg object-cover flex-shrink-0"
                                            />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-secondary line-clamp-2">
                                                            {getListingTitle(listing)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Dibuat: {listing.createdAt}
                                                        </p>
                                                    </div>
                                                    <Badge variant={status.variant} size="sm">
                                                        <status.icon className="w-3 h-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </div>

                                                <p className="text-lg font-bold text-primary mb-3">
                                                    {formatCurrency(listing.price)}
                                                </p>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        {formatNumber(listing.views)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {listing.inquiries}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Edit Button - Only for ACTIVE listings */}
                                                    {listing.canEdit ? (
                                                        <Link
                                                            href={`/dashboard/listings/${listing.id}/edit`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            title="Tidak dapat diedit pada status ini"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                    )}

                                                    {/* Mark as Sold Button - Only for ACTIVE listings */}
                                                    {listing.canMarkSold && financeEnabled ? (
                                                        <button
                                                            onClick={() => setReceiptModal(listing)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Buat Kwitansi
                                                        </button>
                                                    ) : listing.canMarkSold && !financeEnabled ? (
                                                        <button
                                                            disabled
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                                            title="Fitur keuangan belum diaktifkan oleh admin"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Buat Kwitansi
                                                        </button>
                                                    ) : listing.status === 'SOLD' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-100 border border-green-300 rounded-lg">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Terjual
                                                        </span>
                                                    ) : null}

                                                    {/* Delete Button - Only for PENDING listings */}
                                                    {listing.canDelete ? (
                                                        <button
                                                            onClick={() => setDeleteModal(listing.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Hapus
                                                        </button>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            title="Tidak dapat dihapus pada status ini"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Hapus
                                                        </button>
                                                    )}

                                                    {/* View Button */}
                                                    <Link
                                                        href={listing.condition === 'NEW' ? `/mobil-baru/${listing.slug}` : `/mobil-bekas/${listing.slug}`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Lihat
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            <Modal
                isOpen={!!receiptModal}
                onClose={() => setReceiptModal(null)}
                title="Buat Kwitansi Transaksi"
                size="lg"
            >
                {receiptModal && (
                    <ReceiptForm
                        listingId={receiptModal.id}
                        listingTitle={receiptModal.title}
                        listingPrice={receiptModal.price}
                        onSuccess={handleReceiptCreated}
                        onClose={() => setReceiptModal(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Hapus Iklan?"
            >
                <p className="text-gray-600 mb-4">
                    Iklan ini akan dihapus secara permanen dan tidak dapat dikembalikan.
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setDeleteModal(null)}
                        className="flex-1"
                        disabled={actionLoading === deleteModal}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={() => deleteModal && handleDelete(deleteModal)}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        disabled={actionLoading === deleteModal}
                    >
                        {actionLoading === deleteModal ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
