'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Search,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Building2,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock,
    MapPin,
    Phone,
    FileText,
    User,
    DollarSign,
    Pencil,
    X,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface DealerUser {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    role: string
    financeEnabled: boolean
}

interface Dealer {
    id: string
    companyName: string
    address: string
    city?: string
    description?: string
    logo: string | null
    documents: string[]
    verified: boolean
    verifiedAt: string | null
    createdAt: string
    updatedAt: string
    companyNameEditCount: number
    companyNameEditedAt: string | null
    user: DealerUser
    activeListingsCount: number
}

export default function AdminDealersPage() {
    const [dealers, setDealers] = useState<Dealer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
    const [editModalDealer, setEditModalDealer] = useState<Dealer | null>(null)
    const [editCompanyName, setEditCompanyName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        const fetchDealers = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/admin/dealers?page=${currentPage}&limit=20`)
                if (res.ok) {
                    const data = await res.json()
                    setDealers(data.dealers)
                }
            } catch (error) {
                console.error('Failed to fetch dealers:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDealers()
    }, [currentPage])

    const filteredDealers = dealers.filter(dealer => {
        const matchesSearch = dealer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dealer.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dealer.user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'verified' && dealer.verified) ||
            (statusFilter === 'pending' && !dealer.verified)
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredDealers.length / itemsPerPage)
    const paginatedDealers = filteredDealers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getStatusBadge = (verified: boolean) => {
        return verified
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
    }

    const getStatusLabel = (verified: boolean) => {
        return verified ? 'Terverifikasi' : 'Menunggu'
    }

    const handleVerify = async (dealerId: string) => {
        try {
            const res = await fetch('/api/admin/dealers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: dealerId, action: 'approve' })
            })
            if (res.ok) {
                // Refetch dealers
                const data = await fetch(`/api/admin/dealers?page=${currentPage}&limit=20`)
                if (data.ok) {
                    const result = await data.json()
                    setDealers(result.dealers)
                }
            }
        } catch (error) {
            console.error('Failed to verify dealer:', error)
        }
        setSelectedDealer(null)
    }

    const handleReject = async (dealerId: string) => {
        const reason = prompt('Alasan penolakan:')
        if (!reason) return
        try {
            const res = await fetch('/api/admin/dealers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: dealerId, action: 'reject', notes: reason })
            })
            if (res.ok) {
                // Refetch dealers
                const data = await fetch(`/api/admin/dealers?page=${currentPage}&limit=20`)
                if (data.ok) {
                    const result = await data.json()
                    setDealers(result.dealers)
                }
            }
        } catch (error) {
            console.error('Failed to reject dealer:', error)
        }
        setSelectedDealer(null)
    }

    const handleToggleFinance = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/dealers/${userId}/toggle-finance`, {
                method: 'POST',
            })
            if (res.ok) {
                // Refetch dealers
                const data = await fetch(`/api/admin/dealers?page=${currentPage}&limit=20`)
                if (data.ok) {
                    const result = await data.json()
                    setDealers(result.dealers)
                }
            }
        } catch (error) {
            console.error('Failed to toggle finance feature:', error)
        }
    }

    const handleSaveCompanyName = async () => {
        if (!editModalDealer || !editCompanyName.trim()) return

        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/dealers/${editModalDealer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName: editCompanyName })
            })

            if (res.ok) {
                const data = await res.json()
                // Update local state
                setDealers(dealers.map(d =>
                    d.id === editModalDealer.id
                        ? { ...d, companyName: data.dealer.companyName }
                        : d
                ))
                setEditModalDealer(null)
                setEditCompanyName('')
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal mengubah nama showroom')
            }
        } catch (error) {
            console.error('Failed to update company name:', error)
            alert('Terjadi kesalahan')
        } finally {
            setIsSaving(false)
        }
    }

    const openEditModal = (dealer: Dealer) => {
        setEditModalDealer(dealer)
        setEditCompanyName(dealer.companyName)
    }

    const pendingCount = dealers.filter(d => !d.verified).length

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Dealer</h1>
                    <p className="text-gray-400 mt-1">
                        {pendingCount > 0 ? (
                            <span className="text-yellow-400">{pendingCount} dealer menunggu verifikasi</span>
                        ) : (
                            `Total ${formatNumber(dealers.length)} dealer`
                        )}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama dealer, pemilik, atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'pending')}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="verified">Terverifikasi</option>
                    </select>
                </div>
            </div>

            {/* Dealers Grid/List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
                        Memuat data...
                    </div>
                ) : paginatedDealers.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Tidak ada dealer ditemukan
                    </div>
                ) : (
                    paginatedDealers.map((dealer) => (
                        <div
                            key={dealer.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 p-5"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {dealer.logo || dealer.user.avatar ? (
                                            <Image
                                                src={dealer.logo || dealer.user.avatar!}
                                                alt={dealer.companyName}
                                                width={64}
                                                height={64}
                                                className="rounded-lg object-cover"
                                            />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{dealer.companyName}</h3>
                                        <button
                                            onClick={() => openEditModal(dealer)}
                                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Edit nama showroom"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(dealer.verified)}`}>
                                            {!dealer.verified && <Clock className="w-3 h-3" />}
                                            {getStatusLabel(dealer.verified)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{dealer.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{dealer.user.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{dealer.address}</span>
                                        </div>
                                        {dealer.city && (
                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span>{dealer.city}</span>
                                            </div>
                                        )}
                                        {dealer.description && (
                                            <div className="flex items-center gap-2 sm:col-span-2 text-xs">
                                                <span className="text-gray-500">{dealer.description}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Documents */}
                                    {dealer.documents && dealer.documents.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            {dealer.documents.map((doc, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                                    {doc}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Finance Feature Toggle */}
                                    {dealer.verified && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-300">Fitur Keuangan</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                                                    dealer.user.financeEnabled
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-600/30 text-gray-400'
                                                }`}>
                                                    {dealer.user.financeEnabled ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleFinance(dealer.user.id)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        dealer.user.financeEnabled ? 'bg-primary' : 'bg-gray-600'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                        dealer.user.financeEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    {dealer.verified && (
                                        <span className="text-sm text-gray-400">
                                            {dealer.activeListingsCount} iklan
                                        </span>
                                    )}

                                    {!dealer.verified && (
                                        <>
                                            <button
                                                onClick={() => handleVerify(dealer.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">Verifikasi</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(dealer.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">Tolak</span>
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setSelectedDealer(selectedDealer?.id === dealer.id ? null : dealer)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-gray-800 rounded-xl border border-gray-700 px-4 py-3">
                    <p className="text-sm text-gray-400">
                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDealers.length)} dari {filteredDealers.length}
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

            {/* Edit Dealer Name Modal */}
            {editModalDealer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Edit Nama Showroom</h3>
                            <button
                                onClick={() => setEditModalDealer(null)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Showroom
                                </label>
                                <input
                                    type="text"
                                    value={editCompanyName}
                                    onChange={(e) => setEditCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Masukkan nama showroom"
                                    autoFocus
                                />
                            </div>

                            {/* Show edit info if available */}
                            {editModalDealer.companyNameEditCount > 0 && editModalDealer.companyNameEditedAt && (
                                <div className="bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">
                                        Terakhir diedit: {new Date(editModalDealer.companyNameEditedAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Jumlah edit: {editModalDealer.companyNameEditCount}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditModalDealer(null)}
                                    className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    disabled={isSaving}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveCompanyName}
                                    disabled={isSaving || !editCompanyName.trim()}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
