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
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Dealer {
    id: string
    companyName: string
    ownerName: string
    email: string
    phone: string
    address: string
    logo: string | null
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
    documents: string[]
    listingsCount: number
    createdAt: string
}

export default function AdminDealersPage() {
    const [dealers, setDealers] = useState<Dealer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
    const itemsPerPage = 10

    useEffect(() => {
        // Sample data
        setDealers([
            { id: '1', companyName: 'Auto Prima Motor', ownerName: 'Ahmad Fadli', email: 'ahmad@autoprima.com', phone: '081234567890', address: 'Jl. Sudirman No. 123, Jakarta Selatan', logo: null, status: 'PENDING', documents: ['NIB', 'SIUP', 'KTP'], listingsCount: 0, createdAt: '2024-01-20' },
            { id: '2', companyName: 'Jaya Motor Group', ownerName: 'Budi Santoso', email: 'budi@jayamotor.com', phone: '081234567891', address: 'Jl. Gatot Subroto No. 45, Bandung', logo: null, status: 'VERIFIED', documents: ['NIB', 'SIUP', 'KTP', 'NPWP'], listingsCount: 42, createdAt: '2024-01-10' },
            { id: '3', companyName: 'Mega Auto Surabaya', ownerName: 'Citra Dewi', email: 'citra@megaauto.co.id', phone: '081234567892', address: 'Jl. Basuki Rahmat No. 78, Surabaya', logo: null, status: 'PENDING', documents: ['NIB', 'KTP'], listingsCount: 0, createdAt: '2024-01-21' },
            { id: '4', companyName: 'Mobil88 Medan', ownerName: 'Dian Pratama', email: 'dian@mobil88.com', phone: '081234567893', address: 'Jl. Ahmad Yani No. 200, Medan', logo: null, status: 'VERIFIED', documents: ['NIB', 'SIUP', 'KTP', 'NPWP'], listingsCount: 28, createdAt: '2024-01-05' },
            { id: '5', companyName: 'Sinar Jaya Motor', ownerName: 'Eko Wijaya', email: 'eko@sinarjaya.com', phone: '081234567894', address: 'Jl. Diponegoro No. 56, Semarang', logo: null, status: 'REJECTED', documents: ['KTP'], listingsCount: 0, createdAt: '2024-01-15' },
        ])
        setIsLoading(false)
    }, [])

    const filteredDealers = dealers.filter(dealer => {
        const matchesSearch = dealer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dealer.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = !statusFilter || dealer.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredDealers.length / itemsPerPage)
    const paginatedDealers = filteredDealers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'VERIFIED':
                return 'bg-green-500/20 text-green-400'
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400'
            default:
                return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Menunggu'
            case 'VERIFIED': return 'Terverifikasi'
            case 'REJECTED': return 'Ditolak'
            default: return status
        }
    }

    const handleVerify = async (dealerId: string) => {
        // TODO: API call
        setDealers(prev => prev.map(d =>
            d.id === dealerId ? { ...d, status: 'VERIFIED' as const } : d
        ))
        setSelectedDealer(null)
    }

    const handleReject = async (dealerId: string) => {
        const reason = prompt('Alasan penolakan:')
        if (!reason) return
        // TODO: API call
        setDealers(prev => prev.map(d =>
            d.id === dealerId ? { ...d, status: 'REJECTED' as const } : d
        ))
        setSelectedDealer(null)
    }

    const pendingCount = dealers.filter(d => d.status === 'PENDING').length

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
                            placeholder="Cari nama dealer atau pemilik..."
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
                        <option value="PENDING">Menunggu</option>
                        <option value="VERIFIED">Terverifikasi</option>
                        <option value="REJECTED">Ditolak</option>
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
                                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                        {dealer.logo ? (
                                            <Image
                                                src={dealer.logo}
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
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(dealer.status)}`}>
                                            {dealer.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {getStatusLabel(dealer.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{dealer.ownerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{dealer.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{dealer.address}</span>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        {dealer.documents.map((doc, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                                {doc}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    {dealer.status === 'VERIFIED' && (
                                        <span className="text-sm text-gray-400">
                                            {dealer.listingsCount} iklan
                                        </span>
                                    )}

                                    {dealer.status === 'PENDING' && (
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
        </div>
    )
}
