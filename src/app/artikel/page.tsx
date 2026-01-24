'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Calendar, User, Clock, Filter } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    featuredImage: string | null
    category: string
    views: number
    publishedAt: string
    createdAt: string
}

const categoryColors: Record<string, string> = {
    NEWS: 'bg-blue-100 text-blue-700',
    REVIEW: 'bg-purple-100 text-purple-700',
    TIPS: 'bg-green-100 text-green-700',
    GUIDE: 'bg-orange-100 text-orange-700',
    PROMO: 'bg-red-100 text-red-700',
}

const categoryLabels: Record<string, string> = {
    NEWS: 'Berita',
    REVIEW: 'Review',
    TIPS: 'Tips',
    GUIDE: 'Panduan',
    PROMO: 'Promo',
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        fetchArticles()
    }, [pagination.page, categoryFilter])

    const fetchArticles = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (categoryFilter) params.append('category', categoryFilter)

            const res = await fetch(`/api/articles?${params}`)
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchArticles()
            return
        }

        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: pagination.limit.toString(),
                search: searchQuery,
            })

            if (categoryFilter) params.append('category', categoryFilter)

            const res = await fetch(`/api/articles?${params}`)
            if (res.ok) {
                const data = await res.json()
                setArticles(data.articles)
                setPagination({ ...data.pagination, page: 1 })
            }
        } catch (error) {
            console.error('Error searching articles:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2">Artikel & Berita</h1>
                <p className="text-gray-600">Informasi terbaru seputar otomotif dan tips membeli mobil</p>
            </div>

            {/* Search & Filter Bar */}
            <Card className="mb-8">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari artikel..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <Button onClick={handleSearch}>Cari</Button>
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value)
                                setPagination({ ...pagination, page: 1 })
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="NEWS">Berita</option>
                            <option value="REVIEW">Review</option>
                            <option value="TIPS">Tips</option>
                            <option value="GUIDE">Panduan</option>
                            <option value="PROMO">Promo</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Articles Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-gray-200" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-secondary mb-2">Tidak ada artikel ditemukan</h3>
                        <p className="text-gray-500 mb-4">Coba kata kunci atau filter lain</p>
                        <Button
                            onClick={() => {
                                setSearchQuery('')
                                setCategoryFilter('')
                                setPagination({ ...pagination, page: 1 })
                            }}
                        >
                            Reset Filter
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <Link key={article.id} href={`/artikel/${article.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    {/* Featured Image */}
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={article.featuredImage || 'https://placehold.co/600x400?text=No+Image'}
                                            alt={article.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Category Badge */}
                                        <div className="mb-3">
                                            <Badge className={categoryColors[article.category] || 'bg-gray-100 text-gray-700'}>
                                                {categoryLabels[article.category] || article.category}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-semibold text-secondary line-clamp-2 mb-2 hover:text-primary transition-colors">
                                            {article.title}
                                        </h3>

                                        {/* Excerpt */}
                                        {article.excerpt && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(article.publishedAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.views} views
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i
                                    } else {
                                        pageNum = pagination.page - 2 + i
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                            className={`w-10 h-10 rounded-lg ${
                                                pagination.page === pageNum
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
