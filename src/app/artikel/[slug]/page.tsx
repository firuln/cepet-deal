'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Eye, Share2, Facebook, Twitter, Clock } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    featuredImage: string | null
    category: string
    tags: string[]
    views: number
    publishedAt: string
    createdAt: string
    author: {
        id: string
        name: string
        avatar: string | null
    }
    metaTitle?: string | null
    metaDescription?: string | null
}

interface RelatedArticle {
    id: string
    title: string
    slug: string
    excerpt: string | null
    featuredImage: string | null
    category: string
    views: number
    publishedAt: string
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

export default function ArticleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [article, setArticle] = useState<Article | null>(null)
    const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showShareMenu, setShowShareMenu] = useState(false)

    useEffect(() => {
        if (params.slug) {
            fetchArticle()
        }
    }, [params.slug])

    const fetchArticle = async () => {
        setIsLoading(true)
        try {
            // Fetch article
            const res = await fetch(`/api/articles/${params.slug}`)
            if (res.ok) {
                const data = await res.json()
                setArticle(data)

                // Fetch related articles
                if (data.category) {
                    fetchRelatedArticles(data.id, data.category)
                }
            } else {
                setError('Artikel tidak ditemukan')
            }
        } catch (err) {
            setError('Gagal memuat artikel')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRelatedArticles = async (articleId: string, category: string) => {
        try {
            const res = await fetch(`/api/articles/related?articleId=${articleId}&category=${category}`)
            if (res.ok) {
                const data = await res.json()
                setRelatedArticles(data.articles)
            }
        } catch (err) {
            console.error('Error fetching related articles:', err)
        }
    }

    const handleShare = (platform: string) => {
        if (!article) return

        const url = encodeURIComponent(window.location.href)
        const title = encodeURIComponent(article.title)

        let shareUrl = ''
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
                break
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
                break
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`
                break
        }

        window.open(shareUrl, '_blank', 'width=600,height=400')
        setShowShareMenu(false)
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link berhasil disalin!')
        setShowShareMenu(false)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="h-12 bg-gray-200 rounded w-3/4" />
                    <div className="aspect-video bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                <h1 className="text-2xl font-bold text-secondary mb-4">Artikel Tidak Ditemukan</h1>
                <p className="text-gray-600 mb-6">{error || 'Maaf, artikel yang Anda cari tidak tersedia.'}</p>
                <Link href="/artikel">
                    <Button>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Artikel
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
                <ol className="flex items-center gap-2 text-gray-500">
                    <li>
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                    </li>
                    <li>/</li>
                    <li>
                        <Link href="/artikel" className="hover:text-primary">
                            Artikel
                        </Link>
                    </li>
                    <li>/</li>
                    <li className="text-gray-700">{article.title}</li>
                </ol>
            </nav>

            {/* Back Button */}
            <Link href="/artikel" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Artikel
            </Link>

            {/* Article Header */}
            <div className="mb-6">
                <div className="mb-4">
                    <Badge className={categoryColors[article.category] || 'bg-gray-100 text-gray-700'}>
                        {categoryLabels[article.category] || article.category}
                    </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views} views
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full"
                    />
                </div>
            )}

            {/* Share Button */}
            <div className="relative mb-8">
                <Button
                    variant="outline"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    Share Artikel
                </Button>

                {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[200px]">
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Facebook className="w-4 h-4 text-blue-600" />
                            Facebook
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Twitter className="w-4 h-4 text-blue-400" />
                            Twitter
                        </button>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                            <span className="w-4 h-4 text-green-600">📱</span>
                            WhatsApp
                        </button>
                        <button
                            onClick={copyLink}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                            <span className="w-4 h-4">🔗</span>
                            Salin Link
                        </button>
                    </div>
                )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
                {article.excerpt && (
                    <p className="text-xl text-gray-700 leading-relaxed mb-6">
                        {article.excerpt}
                    </p>
                )}

                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-secondary mb-6">Artikel Terkait</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedArticles.map((related) => (
                            <Link key={related.id} href={`/artikel/${related.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-32 h-24 flex-shrink-0">
                                            <img
                                                src={related.featuredImage || 'https://placehold.co/200x150?text=No+Image'}
                                                alt={related.title}
                                                className="w-full h-full object-cover rounded-l-lg"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4">
                                            <div className="mb-2">
                                                <Badge className={`text-xs ${categoryColors[related.category] || 'bg-gray-100 text-gray-700'}`}>
                                                    {categoryLabels[related.category] || related.category}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold text-secondary line-clamp-2 text-sm hover:text-primary transition-colors">
                                                {related.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(related.publishedAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {related.views}
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
        </div>
    )
}
