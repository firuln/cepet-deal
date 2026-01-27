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
    X,
    Loader2,
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
    const [isUpdating, setIsUpdating] = useState(false)
    // Role change dialog state
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)
    const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null)
    const [selectedRole, setSelectedRole] = useState('')
    const itemsPerPage = 10

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                // Map API data to User interface
                const mappedUsers = data.users.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    createdAt: u.createdAt,
                    listingsCount: u._count?.listings || 0,
                    isDealer: !!u.dealer,
                }))
                setUsers(mappedUsers)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
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
        setIsUpdating(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole }),
            })

            if (res.ok) {
                const result = await res.json()

                // Update local state
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, role: newRole as any } : u
                ))
                setSelectedUser(null)
                setRoleDialogOpen(false)
                setRoleDialogUser(null)

                // Show success message with session invalidation info
                const userName = roleDialogUser?.name || 'User'
                alert(`✅ Role ${userName} berhasil diubah menjadi ${USER_ROLES[newRole as keyof typeof USER_ROLES]}.\n\nUser akan diminta untuk login ulang agar perubahan role berlaku.`)
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal mengubah role')
            }
        } catch (error) {
            console.error('Error changing role:', error)
            alert('Terjadi kesalahan saat mengubah role')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                // Remove from local state
                setUsers(prev => prev.filter(u => u.id !== userId))
                setSelectedUser(null)
            } else {
                const error = await res.json()
                alert(error.error || 'Gagal menghapus user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Terjadi kesalahan saat menghapus user')
        } finally {
            setIsUpdating(false)
        }
    }

    const openRoleDialog = (user: User) => {
        setRoleDialogUser(user)
        setSelectedRole(user.role)
        setRoleDialogOpen(true)
        setSelectedUser(null)
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
                                                                onClick={() => openRoleDialog(user)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                                            >
                                                                <UserCog className="w-4 h-4" />
                                                                Ubah Role
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                disabled={isUpdating}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600 disabled:opacity-50"
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

            {/* Role Change Dialog */}
            {roleDialogOpen && roleDialogUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Ubah Role User</h3>
                            <button
                                onClick={() => setRoleDialogOpen(false)}
                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                            <p className="text-sm text-gray-300">
                                <span className="font-medium text-white">{roleDialogUser.name}</span>
                            </p>
                            <p className="text-xs text-gray-400">{roleDialogUser.email}</p>
                        </div>

                        {/* Warning Info */}
                        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200">
                                    Setelah role diubah, user akan <strong>diminta login ulang</strong> agar perubahan berlaku.
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role Baru
                            </label>
                            <div className="space-y-2">
                                {Object.entries(USER_ROLES).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedRole(key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                                            selectedRole === key
                                                ? 'bg-primary/20 border-primary text-white'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={selectedRole === key}
                                            onChange={() => setSelectedRole(key)}
                                            className="w-4 h-4 text-primary border-gray-500 focus:ring-primary"
                                        />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRoleDialogOpen(false)}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => selectedRole && handleChangeRole(roleDialogUser.id, selectedRole)}
                                disabled={isUpdating || !selectedRole || selectedRole === roleDialogUser.role}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
