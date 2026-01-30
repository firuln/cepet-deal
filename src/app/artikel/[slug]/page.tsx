'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Eye, Share2, Facebook, Twitter, Clock, Bookmark, Linkedin, MessageCircle, X, ChevronRight, Menu } from 'lucide-react'
import { Button, Card, CardContent, Badge, useToast } from '@/components/ui'

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
        bio?: string | null
        role?: string | null
    }
    readTime?: number
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
    readTime?: number
}

interface TableOfContentsItem {
    id: string
    text: string
    level: number
}

const categoryColors: Record<string, string> = {
    NEWS: 'bg-blue-50 text-blue-700 border-blue-200',
    REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
    TIPS: 'bg-green-50 text-green-700 border-green-200',
    GUIDE: 'bg-orange-50 text-orange-700 border-orange-200',
    PROMO: 'bg-red-50 text-red-700 border-red-200',
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
    const { addToast } = useToast()
    const contentRef = useRef<HTMLDivElement>(null)
    const [article, setArticle] = useState<Article | null>(null)
    const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([])
    const [activeTocId, setActiveTocId] = useState<string>('')
    const [showTocMobile, setShowTocMobile] = useState(false)

    useEffect(() => {
        if (params.slug) {
            fetchArticle()
        }
    }, [params.slug])

    // Scroll progress effect
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.scrollY
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100
            setScrollProgress(Math.min(100, Math.max(0, progress)))
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Generate table of contents from article content
    useEffect(() => {
        if (article?.content && contentRef.current) {
            const headings = contentRef.current.querySelectorAll('h2, h3, h4')
            const items: TableOfContentsItem[] = []

            headings.forEach((heading, index) => {
                const id = `heading-${index}`
                heading.id = id
                items.push({
                    id,
                    text: heading.textContent || '',
                    level: parseInt(heading.tagName.substring(1)),
                })
            })

            setTocItems(items)
        }
    }, [article?.content])

    // Track active TOC item on scroll
    useEffect(() => {
        if (tocItems.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTocId(entry.target.id)
                    }
                })
            },
            { rootMargin: '-20% 0px -70% 0px' }
        )

        tocItems.forEach((item) => {
            const element = document.getElementById(item.id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [tocItems])

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
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
                break
        }

        window.open(shareUrl, '_blank', 'width=600,height=400')
        addToast({
            type: 'success',
            title: 'Dibagikan!',
            message: `Artikel berhasil dibagikan ke ${platform}`,
        })
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        addToast({
            type: 'success',
            title: 'Link Disalin!',
            message: 'Link artikel berhasil disalin ke clipboard',
        })
        setShowShareMenu(false)
    }

    const scrollToTocItem = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setShowTocMobile(false)
        }
    }

    const calculateReadTime = (content: string): number => {
        // Strip HTML tags and count words
        const text = content.replace(/<[^>]*>/g, '')
        const wordCount = text.split(/\s+/).length
        // Average reading speed: 200 words per minute
        return Math.max(1, Math.ceil(wordCount / 200))
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
        <>
            {/* Skip Link for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium transition-all"
            >
                Skip to main content
            </a>

            {/* Reading Progress Bar */}
            {scrollProgress > 0 && scrollProgress < 100 && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150"
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>
            )}

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: article?.title,
                        description: article?.excerpt || article?.metaDescription,
                        image: article?.featuredImage,
                        datePublished: article?.publishedAt,
                        dateModified: article?.createdAt,
                        author: {
                            '@type': 'Person',
                            name: article?.author.name,
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'CepetDeal',
                            logo: {
                                '@type': 'ImageObject',
                                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cepetdeal.com'}/logo.png`,
                            },
                        },
                    }),
                }}
            />

            {/* Breadcrumb Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cepetdeal.com'}/`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Artikel',
                                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cepetdeal.com'}/artikel`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: article?.title,
                            },
                        ],
                    }),
                }}
            />

            <div id="main-content" className="max-w-4xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
                        <li>
                            <Link href="/" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1">
                                Home
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li>
                            <Link href="/artikel" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1">
                                Artikel
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                            {article.title}
                        </li>
                    </ol>
                </nav>

                {/* TOC Mobile Toggle */}
                {tocItems.length > 0 && (
                    <button
                        onClick={() => setShowTocMobile(!showTocMobile)}
                        className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-expanded={showTocMobile}
                        aria-controls="toc-mobile"
                    >
                        <Menu className="w-4 h-4" />
                        Daftar Isi ({tocItems.length})
                    </button>
                )}

            {/* Back Button */}
            <Link
                href="/artikel"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Artikel
            </Link>

            {/* Article Header */}
            <div className="mb-6">
                <div className="mb-4">
                    <Badge className={`border transition-colors ${categoryColors[article.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {categoryLabels[article.category] || article.category}
                    </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4 leading-tight tracking-tight">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{article.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime || calculateReadTime(article.content)} menit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {article.views} views
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-gray-100">
                    <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full"
                    />
                </div>
            )}

            {/* Share & Actions Bar */}
            <div className="sticky top-16 z-40 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Bagikan:</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleShare('facebook')}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                title="Share ke Facebook"
                                aria-label="Share ke Facebook"
                            >
                                <Facebook className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                                onClick={() => handleShare('twitter')}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                title="Share ke Twitter"
                                aria-label="Share ke Twitter"
                            >
                                <Twitter className="w-5 h-5 text-blue-400" />
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                title="Share ke WhatsApp"
                                aria-label="Share ke WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                                onClick={() => handleShare('linkedin')}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                title="Share ke LinkedIn"
                                aria-label="Share ke LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-blue-700" />
                            </button>
                            <button
                                onClick={copyLink}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                title="Salin Link"
                                aria-label="Salin Link"
                            >
                                <Share2 className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        title="Simpan artikel"
                        aria-label="Simpan artikel"
                    >
                        <Bookmark className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Two Column Layout: Content + TOC */}
            <div className="flex gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Article Content */}
                    <div ref={contentRef} className="ProseMirror prose prose-lg max-w-none mb-8">
                        {article.excerpt && (
                            <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
                                {article.excerpt}
                            </p>
                        )}

                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>

                    {/* Author Bio Card */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {article.author.avatar ? (
                                        <img
                                            src={article.author.avatar}
                                            alt={article.author.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                            <User className="w-8 h-8 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-secondary mb-1">{article.author.name}</h3>
                                    {article.author.role && (
                                        <p className="text-sm text-gray-500 mb-2">{article.author.role}</p>
                                    )}
                                    {article.author.bio && (
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {article.author.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table of Contents - Desktop */}
                {tocItems.length > 0 && (
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-secondary mb-3 text-sm">Daftar Isi</h3>
                                <nav className="space-y-2">
                                    {tocItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToTocItem(item.id)}
                                            className={`block text-left w-full text-sm transition-colors ${
                                                activeTocId === item.id
                                                    ? 'text-primary font-medium'
                                                    : 'text-gray-600 hover:text-primary'
                                            }`}
                                            style={{ paddingLeft: `${(item.level - 2) * 0.75 + 0.5}rem` }}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* TOC Mobile */}
            {showTocMobile && tocItems.length > 0 && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowTocMobile(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-secondary">Daftar Isi</h3>
                            <button
                                onClick={() => setShowTocMobile(false)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
                            <nav className="space-y-3">
                                {tocItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToTocItem(item.id)}
                                        className={`block text-left w-full text-sm transition-colors py-2 ${
                                            activeTocId === item.id
                                                ? 'text-primary font-medium'
                                                : 'text-gray-600 hover:text-primary'
                                        }`}
                                        style={{ paddingLeft: `${(item.level - 2) * 0.75 + 0.5}rem` }}
                                    >
                                        {item.text}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/artikel?tag=${encodeURIComponent(tag)}`}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 rounded-full text-sm transition-all inline-flex items-center gap-1 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-xl font-bold text-secondary">Artikel Terkait</h2>
                        <span className="text-sm text-gray-500">({relatedArticles.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedArticles.map((related) => (
                            <Link key={related.id} href={`/artikel/${related.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-all group">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-32 h-24 flex-shrink-0">
                                            <img
                                                src={related.featuredImage || 'https://placehold.co/200x150?text=No+Image'}
                                                alt={related.title}
                                                className="w-full h-full object-cover rounded-l-lg group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4">
                                            <div className="mb-2">
                                                <Badge className={`text-xs border ${categoryColors[related.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                    {categoryLabels[related.category] || related.category}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold text-secondary line-clamp-2 text-sm group-hover:text-primary transition-colors leading-snug">
                                                {related.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(related.publishedAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {related.readTime || 5} min
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
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
        </>
    )
}
