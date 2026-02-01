'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Search,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock,
    MapPin,
    Phone,
    FileText,
    User,
    X,
    Loader2,
    Building2,
    Download,
    Filter,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface SellerUser {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    role: string
    isSellerVerified: boolean
    sellerVerifiedAt: string | null
    createdAt: string
    location?: string | null
    bio?: string | null
}

interface SellerVerificationDocument {
    id: string
    type: 'KTP' | 'NPWP' | 'SELFIE' | 'BUSINESS_DOC'
    url: string
    fileName: string
    fileSize: number
    uploadedAt: string
}

interface SellerVerification {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    identityType: 'INDIVIDUAL' | 'BUSINESS'
    idCardNumber: string | null
    taxIdNumber: string | null
    businessName: string | null
    businessAddress: string | null
    submittedAt: string
    reviewedAt: string | null
    reviewedBy: string | null
    rejectionReason: string | null
    notes: string | null
    documents: SellerVerificationDocument[]
    user: SellerUser
    activeListingsCount: number
}

export default function AdminSellerVerificationsPage() {
    const [verifications, setVerifications] = useState<SellerVerification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
    const [identityTypeFilter, setIdentityTypeFilter] = useState<'all' | 'INDIVIDUAL' | 'BUSINESS'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedVerification, setSelectedVerification] = useState<SellerVerification | null>(null)
    const [selectedVerificationDetail, setSelectedVerificationDetail] = useState<SellerVerification | null>(null)
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        const fetchVerifications = async () => {
            setIsLoading(true)
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: '50',
                })
                if (statusFilter !== 'all') params.append('status', statusFilter)
                if (identityTypeFilter !== 'all') params.append('identityType', identityTypeFilter)

                const res = await fetch(`/api/admin/seller-verifications?${params}`)
                if (res.ok) {
                    const data = await res.json()
                    setVerifications(data.verifications)
                }
            } catch (error) {
                console.error('Failed to fetch seller verifications:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchVerifications()
    }, [currentPage, statusFilter, identityTypeFilter])

    const filteredVerifications = verifications.filter(verification => {
        const matchesSearch = verification.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            verification.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            verification.user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            verification.idCardNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            verification.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage)
    const paginatedVerifications = filteredVerifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-500/20 text-green-400'
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400'
            case 'PENDING':
            default:
                return 'bg-yellow-500/20 text-yellow-400'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'Terverifikasi'
            case 'REJECTED':
                return 'Ditolak'
            case 'PENDING':
            default:
                return 'Menunggu'
        }
    }

    const getDocumentTypeLabel = (type: string) => {
        switch (type) {
            case 'KTP':
                return 'KTP'
            case 'NPWP':
                return 'NPWP'
            case 'SELFIE':
                return 'Selfie dengan KTP'
            case 'BUSINESS_DOC':
                return 'Dokumen Usaha'
            default:
                return type
        }
    }

    const handleViewDetail = async (verification: SellerVerification) => {
        setIsDetailLoading(true)
        setSelectedVerificationDetail(verification)
        try {
            const res = await fetch(`/api/admin/seller-verifications/${verification.id}`)
            if (res.ok) {
                const data = await res.json()
                setSelectedVerificationDetail(data)
            }
        } catch (error) {
            console.error('Failed to fetch verification detail:', error)
        } finally {
            setIsDetailLoading(false)
        }
    }

    const handleApprove = async (verificationId: string) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/seller-verifications/${verificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            })
            if (res.ok) {
                // Refetch verifications
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: '50',
                })
                if (statusFilter !== 'all') params.append('status', statusFilter)
                if (identityTypeFilter !== 'all') params.append('identityType', identityTypeFilter)

                const data = await fetch(`/api/admin/seller-verifications?${params}`)
                if (data.ok) {
                    const result = await data.json()
                    setVerifications(result.verifications)
                }
                setSelectedVerificationDetail(null)
            }
        } catch (error) {
            console.error('Failed to approve verification:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectClick = (verification: SellerVerification) => {
        setSelectedVerification(verification)
        setRejectionReason('')
        setShowRejectModal(true)
    }

    const handleReject = async () => {
        if (!selectedVerification || !rejectionReason.trim()) return

        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/seller-verifications/${selectedVerification.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    reason: rejectionReason.trim()
                })
            })
            if (res.ok) {
                // Refetch verifications
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: '50',
                })
                if (statusFilter !== 'all') params.append('status', statusFilter)
                if (identityTypeFilter !== 'all') params.append('identityType', identityTypeFilter)

                const data = await fetch(`/api/admin/seller-verifications?${params}`)
                if (data.ok) {
                    const result = await data.json()
                    setVerifications(result.verifications)
                }
                setShowRejectModal(false)
                setSelectedVerificationDetail(null)
            }
        } catch (error) {
            console.error('Failed to reject verification:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const pendingCount = verifications.filter(v => v.status === 'PENDING').length

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verifikasi Penjual</h1>
                    <p className="text-gray-400 mt-1">
                        {pendingCount > 0 ? (
                            <span className="text-yellow-400">{pendingCount} pengajuan menunggu verifikasi</span>
                        ) : (
                            `Total ${formatNumber(verifications.length)} pengajuan`
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
                            placeholder="Cari nama, email, No. KTP, atau nama usaha..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PENDING' | 'APPROVED' | 'REJECTED')}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="APPROVED">Terverifikasi</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                    <select
                        value={identityTypeFilter}
                        onChange={(e) => setIdentityTypeFilter(e.target.value as 'all' | 'INDIVIDUAL' | 'BUSINESS')}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Semua Jenis</option>
                        <option value="INDIVIDUAL">Perorangan</option>
                        <option value="BUSINESS">Badan Usaha</option>
                    </select>
                </div>
            </div>

            {/* Verifications Grid/List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
                        Memuat data...
                    </div>
                ) : paginatedVerifications.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Tidak ada pengajuan verifikasi ditemukan
                    </div>
                ) : (
                    paginatedVerifications.map((verification) => (
                        <div
                            key={verification.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 p-5"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {verification.user.avatar ? (
                                            <Image
                                                src={verification.user.avatar}
                                                alt={verification.user.name}
                                                width={64}
                                                height={64}
                                                className="rounded-lg object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{verification.user.name}</h3>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(verification.status)}`}>
                                            {verification.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {getStatusLabel(verification.status)}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            verification.identityType === 'BUSINESS'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {verification.identityType === 'BUSINESS' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {verification.identityType === 'BUSINESS' ? 'Badan Usaha' : 'Perorangan'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{verification.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{verification.user.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            <span>KTP: {verification.idCardNumber || '-'}</span>
                                        </div>
                                        {verification.businessName && (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                <span>{verification.businessName}</span>
                                            </div>
                                        )}
                                        {verification.user.location && (
                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{verification.user.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Documents Preview */}
                                    {verification.documents && verification.documents.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            {verification.documents.map((doc) => (
                                                <span key={doc.id} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                                    {getDocumentTypeLabel(doc.type)}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {verification.status === 'REJECTED' && verification.rejectionReason && (
                                        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                                            <p className="text-sm text-red-400">{verification.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    {verification.user.isSellerVerified && (
                                        <span className="text-sm text-gray-400">
                                            {verification.activeListingsCount} iklan
                                        </span>
                                    )}

                                    {verification.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(verification.id)}
                                                disabled={actionLoading}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">Setujui</span>
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(verification)}
                                                disabled={actionLoading}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">Tolak</span>
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleViewDetail(verification)}
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
                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} dari {filteredVerifications.length}
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

            {/* Detail Modal */}
            {selectedVerificationDetail && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-xl w-full max-w-4xl my-8">
                        <div className="sticky top-0 bg-gray-800 rounded-t-xl p-6 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Detail Verifikasi</h3>
                            <button
                                onClick={() => setSelectedVerificationDetail(null)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {isDetailLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* User Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Informasi Penjual</h4>
                                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Nama</span>
                                                <span className="text-white">{selectedVerificationDetail.user.name}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Email</span>
                                                <span className="text-white">{selectedVerificationDetail.user.email}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">No. HP</span>
                                                <span className="text-white">{selectedVerificationDetail.user.phone || '-'}</span>
                                            </div>
                                            {selectedVerificationDetail.user.location && (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-400">Lokasi</span>
                                                    <span className="text-white">{selectedVerificationDetail.user.location}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Terdaftar</span>
                                                <span className="text-white">{new Date(selectedVerificationDetail.user.createdAt).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Info */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Informasi Verifikasi</h4>
                                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Jenis Identitas</span>
                                                <span className="text-white">
                                                    {selectedVerificationDetail.identityType === 'BUSINESS' ? 'Badan Usaha' : 'Perorangan'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Nomor KTP</span>
                                                <span className="text-white font-mono">{selectedVerificationDetail.idCardNumber || '-'}</span>
                                            </div>
                                            {selectedVerificationDetail.taxIdNumber && (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-400">Nomor NPWP</span>
                                                    <span className="text-white font-mono">{selectedVerificationDetail.taxIdNumber}</span>
                                                </div>
                                            )}
                                            {selectedVerificationDetail.businessName && (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-400">Nama Usaha</span>
                                                    <span className="text-white">{selectedVerificationDetail.businessName}</span>
                                                </div>
                                            )}
                                            {selectedVerificationDetail.businessAddress && (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-400">Alamat Usaha</span>
                                                    <span className="text-white">{selectedVerificationDetail.businessAddress}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-400">Diajukan</span>
                                                <span className="text-white">
                                                    {new Date(selectedVerificationDetail.submittedAt).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            {selectedVerificationDetail.reviewedAt && (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-400">Ditinjau</span>
                                                    <span className="text-white">
                                                        {new Date(selectedVerificationDetail.reviewedAt).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Dokumen</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedVerificationDetail.documents.map((doc) => (
                                                <div key={doc.id} className="bg-gray-700/50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-white">{getDocumentTypeLabel(doc.type)}</span>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Unduh
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-400 space-y-1">
                                                        <p>Ukuran: {formatFileSize(doc.fileSize)}</p>
                                                        <p>Diupload: {new Date(doc.uploadedAt).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    {doc.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 rounded overflow-hidden">
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Image
                                                                    src={doc.url}
                                                                    alt={getDocumentTypeLabel(doc.type)}
                                                                    width={300}
                                                                    height={200}
                                                                    className="w-full h-auto object-cover"
                                                                />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {selectedVerificationDetail.notes && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Catatan Admin</h4>
                                            <div className="bg-gray-700/50 rounded-lg p-4">
                                                <p className="text-sm text-white">{selectedVerificationDetail.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedVerificationDetail.status === 'PENDING' && (
                            <div className="sticky bottom-0 bg-gray-800 rounded-b-xl p-6 border-t border-gray-700 flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedVerificationDetail.id)}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Setujui
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedVerification(selectedVerificationDetail)
                                        setShowRejectModal(true)
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Tolak
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Tolak Verifikasi</h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Alasan Penolakan *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Jelaskan alasan penolakan..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    disabled={actionLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        'Tolak Pengajuan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
