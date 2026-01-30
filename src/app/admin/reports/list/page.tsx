'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Flag, CheckCircle, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface Report {
    id: string
    reporterId: string
    reportableType: string
    reportableId: string
    reason: string
    description: string | null
    status: string
    notes: string | null
    reviewedBy: string | null
    reviewedAt: string | null
    createdAt: string
    updatedAt: string
    reporter: {
        id: string
        name: string
        email: string
        phone: string | null
    }
    reviewer?: {
        id: string
        name: string
    }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', icon: Eye },
    RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    DISMISSED: { label: 'Dismissed', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

const reasonLabels: Record<string, string> = {
    FRAUD: 'Penipuan',
    SPAM: 'Spam',
    INAPPROPRIATE_CONTENT: 'Konten Tidak Pantas',
    FALSE_INFORMATION: 'Informasi Salah',
    SCAM: 'Scam',
    OTHER: 'Lainnya'
}

const typeLabels: Record<string, string> = {
    LISTING: 'Iklan',
    USER: 'Pengguna',
    MESSAGE: 'Pesan',
    ARTICLE: 'Artikel',
    REVIEW: 'Review'
}

export default function AdminReportsListPage() {
    const { data: session, status } = useSession()
    const [reports, setReports] = useState<Report[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            fetchReports()
        }
    }, [session, pagination.page, statusFilter, typeFilter])

    const fetchReports = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (statusFilter) params.append('status', statusFilter)
            if (typeFilter) params.append('type', typeFilter)

            const res = await fetch(`/api/admin/reports?${params}`)
            if (res.ok) {
                const data = await res.json()
                setReports(data.reports)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResolve = async (reportId: string, notes: string, action?: string) => {
        const res = await fetch(`/api/admin/reports/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'RESOLVED',
                notes,
                action
            })
        })

        if (res.ok) {
            fetchReports()
            setSelectedReport(null)
        } else {
            alert('Failed to resolve report')
        }
    }

    const handleDismiss = async (reportId: string, notes: string) => {
        const res = await fetch(`/api/admin/reports/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'DISMISSED',
                notes
            })
        })

        if (res.ok) {
            fetchReports()
            setSelectedReport(null)
        } else {
            alert('Failed to dismiss report')
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/admin')
    }

    const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.PENDING

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Manajemen Laporan</h1>
                <p className="text-gray-400 mt-1">Kelola laporan yang masuk dari pengguna</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(statusConfig).map(([status, info]) => (
                    <div key={status} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center`}>
                                <info.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {reports.filter(r => r.status === status).length}
                        </p>
                        <p className="text-sm text-gray-400">{info.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <Card variant="dark" className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination({ ...pagination, page: 1 })
                            }}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="DISMISSED">Dismissed</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value)
                                setPagination({ ...pagination, page: 1 })
                            }}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="LISTING">Iklan</option>
                            <option value="USER">Pengguna</option>
                            <option value="MESSAGE">Pesan</option>
                            <option value="ARTICLE">Artikel</option>
                            <option value="REVIEW">Review</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card variant="dark">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            Memuat laporan...
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada laporan yang ditemukan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-4 text-gray-400 font-medium">Pelapor</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Tipe</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Alasan</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Deskripsi</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Tanggal</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{report.reporter.name}</p>
                                                    <p className="text-sm text-gray-500">{report.reporter.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className="bg-purple-100 text-purple-700">
                                                    {typeLabels[report.reportableType] || report.reportableType}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-300">
                                                    {reasonLabels[report.reason] || report.reason}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-400 max-w-xs truncate">
                                                    {report.description || '-'}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                {(() => {
                                                    const statusInfo = getStatusInfo(report.status)
                                                    return (
                                                        <Badge className={statusInfo.color}>
                                                            <statusInfo.icon className="w-3 h-3 mr-1 inline" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    )
                                                })()}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setSelectedReport(report)}
                                                    >
                                                        Lihat
                                                    </Button>
                                                    {report.status === 'PENDING' || report.status === 'REVIEWING' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setSelectedReport(report)}
                                                        >
                                                            Proses
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {report.status === 'RESOLVED' || report.status === 'DISMISSED' ? (
                                                                <span className="text-xs text-gray-500">
                                                                    {report.reviewer?.name || 'Admin'}
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-gray-400">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card variant="dark" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Detail Laporan</h2>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Reporter Info */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Pelapor</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Nama</p>
                                            <p className="text-white">{selectedReport.reporter.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="text-white">{selectedReport.reporter.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Telepon</p>
                                            <p className="text-white">{selectedReport.reporter.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Lapor Pada</p>
                                            <p className="text-white">{new Date(selectedReport.createdAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Details */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Detail Laporan</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <p className="text-gray-500">Tipe</p>
                                            <p className="text-white">{typeLabels[selectedReport.reportableType]}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-gray-500">Alasan</p>
                                            <p className="text-white">{reasonLabels[selectedReport.reason]}</p>
                                        </div>
                                        {selectedReport.description && (
                                            <div>
                                                <p className="text-gray-500">Deskripsi</p>
                                                <p className="text-white">{selectedReport.description}</p>
                                            </div>
                                        )}
                                        {selectedReport.notes && (
                                            <div>
                                                <p className="text-gray-500">Catatan Admin</p>
                                                <p className="text-white">{selectedReport.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {selectedReport.status === 'PENDING' || selectedReport.status === 'REVIEWING' ? (
                                        <>
                                            <Button
                                                className="flex-1"
                                                onClick={() => {
                                                    const notes = prompt('Catatan (opsional):')
                                                    handleResolve(selectedReport.id, notes || '')
                                                }}
                                            >
                                                Terima & Selesaikan
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="flex-1"
                                                onClick={() => {
                                                    const notes = prompt('Alasan ditolak (opsional):')
                                                    if (notes !== null) handleDismiss(selectedReport.id, notes)
                                                }}
                                            >
                                                Tolak Laporan
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-gray-400 text-center w-full">
                                            Laporan ini sudah {selectedReport.status === 'RESOLVED' ? 'diselesaikan' : 'ditolak'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
