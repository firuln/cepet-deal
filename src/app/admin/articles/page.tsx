'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    Calendar,
    FileText,
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    category: string
    status: string
    views: number
    publishedAt: string | null
    createdAt: string
    author: {
        id: string
        name: string
    }
}

const categoryColors: Record<string, string> = {
    NEWS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    REVIEW: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    TIPS: 'bg-green-500/20 text-green-400 border border-green-500/30',
    GUIDE: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    PROMO: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    PUBLISHED: 'bg-green-500/20 text-green-400 border border-green-500/30',
    ARCHIVED: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        fetchArticles()
    }, [pagination.page, statusFilter, categoryFilter])

    const fetchArticles = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (statusFilter) params.append('status', statusFilter)
            if (categoryFilter) params.append('category', categoryFilter)

            const res = await fetch(`/api/admin/articles?${params}`)
            if (res.ok) {
                const data = await res.json()
                setArticles(data.articles)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching articles:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => {
        if (searchQuery.trim()) {
            fetchArticlesWithSearch()
        }
    }

    const fetchArticlesWithSearch = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: pagination.limit.toString(),
                search: searchQuery,
            })

            const res = await fetch(`/api/admin/articles?${params}`)
            if (res.ok) {
                const data = await res.json()
                setArticles(data.articles)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error searching articles:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        try {
            const res = await fetch(`/api/admin/articles/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchArticles()
            } else {
                alert('Failed to delete article')
            }
        } catch (error) {
            console.error('Error deleting article:', error)
            alert('Failed to delete article')
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Artikel</h1>
                    <p className="text-gray-400 mt-1">Buat dan kelola konten blog/artikel</p>
                </div>
                <Link href="/admin/articles/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Artikel Baru
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card variant="dark" className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari judul artikel..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <Button onClick={handleSearch}>Cari</Button>
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPagination({ ...pagination, page: 1 })
                                }}
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Semua Status</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value)
                                    setPagination({ ...pagination, page: 1 })
                                }}
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="NEWS">News</option>
                                <option value="REVIEW">Review</option>
                                <option value="TIPS">Tips</option>
                                <option value="GUIDE">Guide</option>
                                <option value="PROMO">Promo</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Articles List */}
            <Card variant="dark">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            Memuat artikel...
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada artikel yang ditemukan</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout */}
                            <div className="sm:hidden divide-y divide-gray-700">
                                {articles.map((article) => (
                                    <div key={article.id} className="p-4 space-y-3">
                                        {/* Title & Actions */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white line-clamp-2">{article.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{article.excerpt || 'Tidak ada excerpt'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Link href={`/admin/articles/${article.id}/edit`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id, article.title)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={categoryColors[article.category] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}>
                                                {article.category}
                                            </Badge>
                                            <Badge className={statusColors[article.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}>
                                                {article.status === 'PUBLISHED' && <Eye className="w-3 h-3 mr-1 inline" />}
                                                {article.status === 'DRAFT' && <EyeOff className="w-3 h-3 mr-1 inline" />}
                                                {article.status.toLowerCase()}
                                            </Badge>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(article.publishedAt)}
                                            </div>
                                            <div>•</div>
                                            <div>{article.views.toLocaleString()} views</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table Layout */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-4 text-gray-400 font-medium">Judul</th>
                                            <th className="text-left p-4 text-gray-400 font-medium">Kategori</th>
                                            <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                            <th className="text-left p-4 text-gray-400 font-medium hidden md:table-cell">Penulis</th>
                                            <th className="text-left p-4 text-gray-400 font-medium hidden lg:table-cell">Views</th>
                                            <th className="text-left p-4 text-gray-400 font-medium hidden lg:table-cell">Published</th>
                                            <th className="text-right p-4 text-gray-400 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articles.map((article) => (
                                            <tr key={article.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-white line-clamp-1">{article.title}</p>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt || 'Tidak ada excerpt'}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={categoryColors[article.category] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}>
                                                        {article.category}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={statusColors[article.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}>
                                                        {article.status === 'PUBLISHED' && <Eye className="w-3 h-3 mr-1 inline" />}
                                                        {article.status === 'DRAFT' && <EyeOff className="w-3 h-3 mr-1 inline" />}
                                                        {article.status.toLowerCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-gray-400 hidden md:table-cell">{article.author.name}</td>
                                                <td className="p-4 text-gray-400 hidden lg:table-cell">{article.views.toLocaleString()}</td>
                                                <td className="p-4 text-gray-400 hidden lg:table-cell">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(article.publishedAt)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/admin/articles/${article.id}/edit`}>
                                                            <Button size="sm" variant="ghost">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(article.id, article.title)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <p className="text-sm text-gray-400 text-center sm:text-left">
                        Menampilkan {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} artikel
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                        >
                            ← Prev
                        </Button>
                        <span className="text-sm text-gray-400 px-2">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
