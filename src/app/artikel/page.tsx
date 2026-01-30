'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Calendar, User, Clock, Filter, TrendingUp, Sparkles, ArrowUpDown, Eye } from 'lucide-react'
import { Button, Card, CardContent, Badge, DebouncedSearchInput } from '@/components/ui'

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
    featured?: boolean
    readTime?: number
}

const categoryColors: Record<string, string> = {
    NEWS: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
    REVIEW: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300',
    TIPS: 'bg-green-50 text-green-700 border-green-200 hover:border-green-300',
    GUIDE: 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300',
    PROMO: 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
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
    const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [sortBy, setSortBy] = useState('latest')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    })

    const categories = [
        { value: '', label: 'Semua Kategori' },
        { value: 'NEWS', label: 'Berita' },
        { value: 'REVIEW', label: 'Review' },
        { value: 'TIPS', label: 'Tips' },
        { value: 'GUIDE', label: 'Panduan' },
        { value: 'PROMO', label: 'Promo' },
    ]

    const sortOptions = [
        { value: 'latest', label: 'Terbaru', icon: Calendar },
        { value: 'popular', label: 'Populer', icon: TrendingUp },
        { value: 'title', label: 'Judul A-Z', icon: ArrowUpDown },
    ]

    useEffect(() => {
        fetchArticles()
        fetchFeaturedArticles()
    }, [pagination.page, categoryFilter, sortBy])

    const fetchArticles = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sort: sortBy,
            })

            if (categoryFilter) params.append('category', categoryFilter)
            if (searchQuery) params.append('search', searchQuery)

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

    const fetchFeaturedArticles = async () => {
        try {
            const res = await fetch('/api/articles?featured=true&limit=3')
            if (res.ok) {
                const data = await res.json()
                setFeaturedArticles(data.articles)
            }
        } catch (error) {
            console.error('Error fetching featured articles:', error)
        }
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPagination({ ...pagination, page: 1 })
    }

    const handleSearchDebounced = (value: string) => {
        setIsSearching(true)
        fetchArticles().finally(() => setIsSearching(false))
    }

    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category)
        setPagination({ ...pagination, page: 1 })
    }

    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setPagination({ ...pagination, page: 1 })
    }

    const clearAllFilters = () => {
        setSearchQuery('')
        setCategoryFilter('')
        setSortBy('latest')
        setPagination({ ...pagination, page: 1 })
    }

    const featuredArticlesToShow = useMemo(() => {
        // Show featured only on first page and when no filters applied
        if (pagination.page === 1 && !categoryFilter && !searchQuery) {
            return featuredArticles
        }
        return []
    }, [pagination.page, categoryFilter, searchQuery, featuredArticles])

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
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-2 tracking-tight">
                    Artikel & Berita
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                    Informasi terbaru seputar otomotif dan tips membeli mobil
                </p>
            </div>

            {/* Featured Articles */}
            {!isLoading && featuredArticlesToShow.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-accent" />
                        <h2 className="text-xl font-bold text-secondary">Artikel Pilihan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredArticlesToShow.map((article) => (
                            <Link key={article.id} href={`/artikel/${article.slug}`}>
                                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-accent/30 shadow-md">
                                    {/* Featured Image */}
                                    <div className="aspect-video overflow-hidden rounded-t-lg relative">
                                        <img
                                            src={article.featuredImage || 'https://placehold.co/600x400?text=No+Image'}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Featured Badge & Category */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge className="bg-accent text-white px-2.5 py-1 text-xs font-semibold shadow-sm">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Pilihan
                                            </Badge>
                                            <Badge className={`border transition-colors ${categoryColors[article.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {categoryLabels[article.category] || article.category}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-secondary line-clamp-2 mb-3 text-lg group-hover:text-primary transition-colors leading-snug">
                                            {article.title}
                                        </h3>

                                        {/* Excerpt */}
                                        {article.excerpt && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(article.publishedAt)}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {article.readTime || 5} min
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {article.views}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    {/* Search Row */}
                    <div className="mb-4">
                        <DebouncedSearchInput
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onDebounceComplete={handleSearchDebounced}
                            placeholder="Cari artikel..."
                            isLoading={isSearching}
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Category Chips */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-2 pb-2 sm:pb-0">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => handleCategoryChange(cat.value)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                            categoryFilter === cat.value
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Urutkan:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(searchQuery || categoryFilter || sortBy !== 'latest') && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Filter aktif:</span>
                            <div className="flex flex-wrap gap-2">
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                        "{searchQuery}"
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="hover:bg-primary/20 rounded p-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {categoryFilter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                        {categoryLabels[categoryFilter]}
                                        <button
                                            onClick={() => setCategoryFilter('')}
                                            className="hover:bg-primary/20 rounded p-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {sortBy !== 'latest' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                        {sortOptions.find(o => o.value === sortBy)?.label}
                                        <button
                                            onClick={() => setSortBy('latest')}
                                            className="hover:bg-primary/20 rounded p-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    Reset semua
                                </button>
                            </div>
                        </div>
                    )}
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
                        <Button onClick={clearAllFilters}>
                            Reset Filter
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-secondary">{articles.length}</span> artikel
                            {pagination.total > 0 && ` dari ${pagination.total} total`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <Link key={article.id} href={`/artikel/${article.slug}`}>
                                <Card className="h-full border border-gray-200/60 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group">
                                    {/* Featured Image */}
                                    <div className="aspect-video overflow-hidden relative rounded-t-lg border-b border-gray-100">
                                        <img
                                            src={article.featuredImage || 'https://placehold.co/600x400?text=No+Image'}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {article.featured && (
                                            <div className="absolute top-3 left-3">
                                                <Badge className="bg-accent text-white px-2 py-0.5 text-xs shadow-sm">
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    Pilihan
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Category Badge */}
                                        <div className="mb-3">
                                            <Badge className={`border transition-colors ${categoryColors[article.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {categoryLabels[article.category] || article.category}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-secondary line-clamp-2 mb-2 group-hover:text-primary transition-colors text-base">
                                            {article.title}
                                        </h3>

                                        {/* Excerpt */}
                                        {article.excerpt && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(article.publishedAt)}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {article.readTime || 5} min
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {article.views}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                            <p className="text-sm text-gray-500">
                                Halaman <span className="font-medium">{pagination.page}</span> dari {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                >
                                    ← Sebelumnya
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
                                    Selanjutnya →
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Scrollbar hide styles */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
