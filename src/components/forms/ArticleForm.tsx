'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Eye, Upload } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

const articleSchema = z.object({
    title: z.string().min(1, 'Judul wajib diisi'),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().min(1, 'Konten wajib diisi'),
    featuredImage: z.string().optional(),
    category: z.enum(['NEWS', 'REVIEW', 'TIPS', 'GUIDE', 'PROMO']),
    tags: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
})

type ArticleFormData = z.infer<typeof articleSchema>

interface Article {
    id?: string
    title: string
    slug?: string
    excerpt?: string | null
    content: string
    featuredImage?: string | null
    category: string
    tags?: string[]
    metaTitle?: string | null
    metaDescription?: string | null
    status: string
}

interface ArticleFormProps {
    article?: Article
    isEditing?: boolean
}

const categories = [
    { value: 'NEWS', label: 'News', color: 'bg-blue-100 text-blue-700' },
    { value: 'REVIEW', label: 'Review', color: 'bg-purple-100 text-purple-700' },
    { value: 'TIPS', label: 'Tips', color: 'bg-green-100 text-green-700' },
    { value: 'GUIDE', label: 'Guide', color: 'bg-orange-100 text-orange-700' },
    { value: 'PROMO', label: 'Promo', color: 'bg-red-100 text-red-700' },
]

export function ArticleForm({ article, isEditing = false }: ArticleFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [imagePreview, setImagePreview] = useState(article?.featuredImage || '')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: article?.title || '',
            slug: article?.slug || '',
            excerpt: article?.excerpt || '',
            content: article?.content || '',
            featuredImage: article?.featuredImage || '',
            category: (article?.category as any) || 'NEWS',
            tags: article?.tags?.join(', ') || '',
            metaTitle: article?.metaTitle || '',
            metaDescription: article?.metaDescription || '',
            status: (article?.status as any) || 'DRAFT',
        },
    })

    const titleValue = watch('title')

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && titleValue) {
            const slug = titleValue
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setValue('slug', slug)
        }
    }, [titleValue, setValue, isEditing])

    const onSubmit = async (data: ArticleFormData) => {
        setIsLoading(true)
        try {
            const payload = {
                ...data,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            }

            const url = isEditing && article?.id
                ? `/api/admin/articles/${article.id}`
                : '/api/admin/articles'

            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                router.push('/admin/articles')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to save article')
            }
        } catch (error) {
            console.error('Error saving article:', error)
            alert('Failed to save article')
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // For now, just create a preview URL
        // In production, you would upload to Cloudinary or similar service
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
            setValue('featuredImage', reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    if (previewMode) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Preview Artikel</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewMode(false)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Tutup Preview
                        </Button>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Featured"
                                className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                        )}

                        <div className="mb-4">
                            <span className={`px-2 py-1 rounded text-sm ${categories.find(c => c.value === watch('category'))?.color}`}>
                                {categories.find(c => c.value === watch('category'))?.label}
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4">{watch('title')}</h1>

                        {watch('excerpt') && (
                            <p className="text-gray-400 text-lg mb-6">{watch('excerpt')}</p>
                        )}

                        <div dangerouslySetInnerHTML={{ __html: watch('content') }} />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setPreviewMode(true)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        Batal
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Artikel
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Judul Artikel *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('title')}
                                        placeholder="Masukkan judul artikel..."
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Slug URL
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">/artikel/</span>
                                        <input
                                            type="text"
                                            {...register('slug')}
                                            placeholder="url-slug-artikel"
                                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    {errors.slug && (
                                        <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Excerpt (Ringkasan)
                                    </label>
                                    <textarea
                                        {...register('excerpt')}
                                        placeholder="Ringkasan singkat artikel (akan ditampilkan di listing)..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Konten Artikel * <span className="text-gray-500">(HTML supported)</span>
                                </label>
                                <textarea
                                    {...register('content')}
                                    placeholder="Tulis konten artikel di sini. Anda bisa menggunakan tag HTML seperti &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, dll..."
                                    rows={20}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                                />
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Category */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-white mb-4">Publikasi</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        {...register('status')}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Kategori *
                                    </label>
                                    <select
                                        {...register('category')}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        {...register('tags')}
                                        placeholder="toyota, review, 2024"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Pisahkan dengan koma</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-white mb-4">Gambar Utama</h3>

                            <div className="space-y-4">
                                {imagePreview && (
                                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Featured"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Upload Gambar
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-400">
                                                <span className="font-semibold">Klik untuk upload</span>
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Atau masukkan URL gambar
                                    </label>
                                    <input
                                        type="text"
                                        {...register('featuredImage')}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-white mb-4">SEO Meta Tags</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        {...register('metaTitle')}
                                        placeholder="Judul untuk SEO (default: judul artikel)"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        {...register('metaDescription')}
                                        placeholder="Deskripsi untuk search engines..."
                                        rows={3}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
