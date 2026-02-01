'use client'

import { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Trash2 } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { Transaction, PaginationInfo } from '../types'

interface FinanceTableProps {
    dateRange: string
    customRange: { startDate: Date | null; endDate: Date | null }
}

type SortField = 'receiptNumber' | 'vehicle' | 'buyer' | 'paymentMethod' | 'totalPrice' | 'remainingPayment' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function FinanceTable({ dateRange, customRange }: FinanceTableProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const [loading, setLoading] = useState(true)
    const [sortField, setSortField] = useState<SortField>('createdAt')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isAllSelected, setIsAllSelected] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('range', dateRange)
            params.append('page', currentPage.toString())
            params.append('limit', '10')
            params.append('sortBy', sortField)
            params.append('sortOrder', sortOrder)

            if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
                params.append('startDate', customRange.startDate.toISOString())
                params.append('endDate', customRange.endDate.toISOString())
            }

            const response = await fetch(`/api/dashboard/finance/transactions?${params}`)
            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [dateRange, customRange, currentPage, sortField, sortOrder])

    // Clear selection when page changes
    useEffect(() => {
        setSelectedIds(new Set())
        setIsAllSelected(false)
    }, [currentPage, dateRange, customRange])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
        setCurrentPage(1)
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
        setIsAllSelected(newSelected.size === transactions.length)
    }

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)))
        }
        setIsAllSelected(!isAllSelected)
    }

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return

        const confirmed = confirm(
            `Anda yakin ingin menghapus ${selectedIds.size} transaksi? Tindakan ini tidak dapat dibatalkan.`
        )
        if (!confirmed) return

        setIsDeleting(true)
        try {
            const response = await fetch('/api/receipts/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            })

            if (response.ok) {
                setSelectedIds(new Set())
                setIsAllSelected(false)
                await fetchTransactions()
            } else {
                const data = await response.json()
                alert(data.error || 'Gagal menghapus transaksi')
            }
        } catch (error) {
            console.error('Error deleting transactions:', error)
            alert('Terjadi kesalahan saat menghapus transaksi')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleExportPDF = async () => {
        try {
            const params = new URLSearchParams()
            params.append('range', dateRange)
            params.append('sortBy', sortField)
            params.append('sortOrder', sortOrder)

            if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
                params.append('startDate', customRange.startDate.toISOString())
                params.append('endDate', customRange.endDate.toISOString())
            }

            const response = await fetch(`/api/dashboard/finance/export/pdf?${params}`)
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `laporan-keuangan-${Date.now()}.pdf`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Error exporting PDF:', error)
        }
    }

    const handleExportExcel = async () => {
        try {
            const params = new URLSearchParams()
            params.append('range', dateRange)
            params.append('sortBy', sortField)
            params.append('sortOrder', sortOrder)

            if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
                params.append('startDate', customRange.startDate.toISOString())
                params.append('endDate', customRange.endDate.toISOString())
            }

            const response = await fetch(`/api/dashboard/finance/export/excel?${params}`)
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `laporan-keuangan-${Date.now()}.xlsx`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Error exporting Excel:', error)
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        return sortOrder === 'asc' ?
            <ArrowUpDown className="w-4 h-4 text-primary rotate-180" /> :
            <ArrowUpDown className="w-4 h-4 text-primary" />
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Detail Transaksi</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedIds.size > 0
                                ? `${selectedIds.size} transaksi dipilih`
                                : `Menampilkan ${transactions.length} dari ${pagination.total} transaksi`
                            }
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {isDeleting ? 'Menghapus...' : `Hapus (${selectedIds.size})`}
                                </span>
                                <span className="sm:hidden">
                                    {isDeleting ? '...' : `Hapus (${selectedIds.size})`}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Export PDF</span>
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="hidden sm:inline">Export Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-4 py-3 sticky left-0 bg-gray-50 z-10">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected && transactions.length > 0}
                                    onChange={handleSelectAll}
                                    disabled={transactions.length === 0}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </th>
                            {[
                                { field: 'receiptNumber' as SortField, label: 'No. Kwitansi' },
                                { field: 'vehicle' as SortField, label: 'Kendaraan' },
                                { field: 'buyer' as SortField, label: 'Pembeli' },
                                { field: 'paymentMethod' as SortField, label: 'Metode' },
                                { field: 'totalPrice' as SortField, label: 'Total' },
                                { field: 'remainingPayment' as SortField, label: 'Sisa' },
                                { field: 'createdAt' as SortField, label: 'Tanggal' }
                            ].map((column) => (
                                <th
                                    key={column.field}
                                    onClick={() => handleSort(column.field)}
                                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1">
                                        {column.label}
                                        <SortIcon field={column.field} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="w-12 px-4 py-4 sticky left-0 bg-white">
                                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td colSpan={7} className="px-4 sm:px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    <p className="text-lg font-medium">Tidak ada transaksi</p>
                                    <p className="text-sm mt-1">Belum ada data transaksi untuk periode ini</p>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(transaction.id) ? 'bg-blue-50' : ''}`}
                                >
                                    <td className="w-12 px-4 py-4 sticky left-0 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(transaction.id)}
                                            onChange={() => toggleSelection(transaction.id)}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary focus:ring-2"
                                        />
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-primary">
                                            {transaction.receiptNumber}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 min-w-[200px]">
                                            {transaction.vehicle}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="text-sm text-gray-600 min-w-[150px]">
                                            {transaction.buyer}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            transaction.paymentMethod === 'CASH'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {transaction.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatPrice(transaction.totalPrice)}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-medium ${
                                            transaction.remainingPayment > 0 ? 'text-amber-600' : 'text-green-600'
                                        }`}>
                                            {transaction.remainingPayment > 0
                                                ? formatPrice(transaction.remainingPayment)
                                                : 'Lunas'}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {timeAgo(transaction.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
