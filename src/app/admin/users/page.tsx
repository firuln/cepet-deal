'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    UserCog,
    Eye,
    ChevronLeft,
    ChevronRight,
    Users,
    Shield,
    AlertCircle,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'

interface User {
    id: string
    name: string
    email: string
    phone: string | null
    role: 'ADMIN' | 'DEALER' | 'SELLER' | 'BUYER'
    createdAt: string
    listingsCount: number
    isDealer: boolean
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const itemsPerPage = 10

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/users')
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data.users)
                }
            } catch (error) {
                console.error('Failed to fetch users:', error)
            } finally {
                setIsLoading(false)
            }
        }

        // Sample data for now
        setUsers([
            { id: '1', name: 'Admin CepetDeal', email: 'admin@cepetdeal.com', phone: '081234567890', role: 'ADMIN', createdAt: '2024-01-01', listingsCount: 0, isDealer: false },
            { id: '2', name: 'Ahmad Dealer', email: 'ahmad@dealer.com', phone: '081234567891', role: 'DEALER', createdAt: '2024-01-15', listingsCount: 25, isDealer: true },
            { id: '3', name: 'Budi Seller', email: 'budi@email.com', phone: '081234567892', role: 'SELLER', createdAt: '2024-02-01', listingsCount: 5, isDealer: false },
            { id: '4', name: 'Citra Buyer', email: 'citra@email.com', phone: '081234567893', role: 'BUYER', createdAt: '2024-02-15', listingsCount: 0, isDealer: false },
            { id: '5', name: 'Dian Seller', email: 'dian@email.com', phone: '081234567894', role: 'SELLER', createdAt: '2024-03-01', listingsCount: 3, isDealer: false },
            { id: '6', name: 'Eko Buyer', email: 'eko@email.com', phone: null, role: 'BUYER', createdAt: '2024-03-10', listingsCount: 0, isDealer: false },
            { id: '7', name: 'Fitri Dealer', email: 'fitri@autodealers.com', phone: '081234567896', role: 'DEALER', createdAt: '2024-03-15', listingsCount: 42, isDealer: true },
            { id: '8', name: 'Gunawan Seller', email: 'gunawan@email.com', phone: '081234567897', role: 'SELLER', createdAt: '2024-04-01', listingsCount: 8, isDealer: false },
        ])
        setIsLoading(false)
    }, [])

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = !roleFilter || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-500/20 text-red-400'
            case 'DEALER':
                return 'bg-purple-500/20 text-purple-400'
            case 'SELLER':
                return 'bg-blue-500/20 text-blue-400'
            case 'BUYER':
                return 'bg-green-500/20 text-green-400'
            default:
                return 'bg-gray-500/20 text-gray-400'
        }
    }

    const handleChangeRole = async (userId: string, newRole: string) => {
        // TODO: Implement API call
        console.log('Change role:', userId, newRole)
        setSelectedUser(null)
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return
        // TODO: Implement API call
        console.log('Delete user:', userId)
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola User</h1>
                    <p className="text-gray-400 mt-1">Total {formatNumber(users.length)} user terdaftar</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">Semua Role</option>
                        {Object.entries(USER_ROLES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden md:table-cell">Telepon</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Role</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Iklan</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Bergabung</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        Tidak ada user ditemukan
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-primary">
                                                        {user.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-white truncate">{user.name}</p>
                                                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="text-gray-300">{user.phone || '-'}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                                {USER_ROLES[user.role]}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <span className="text-gray-300">{user.listingsCount}</span>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell">
                                            <span className="text-gray-300">
                                                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {selectedUser === user.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                                                            <button
                                                                onClick={() => handleChangeRole(user.id, 'SELLER')}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                                            >
                                                                <UserCog className="w-4 h-4" />
                                                                Ubah Role
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Hapus User
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
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-300">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
