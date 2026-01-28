'use client'

import { useState } from 'react'
import { Wand2, Sparkles, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui'

interface AiGeneratePanelProps {
    onGenerated: (data: {
        title: string
        excerpt: string
        content: string
        metaTitle: string
        metaDescription: string
    }) => void
    onCancel: () => void
    defaultTitle?: string
}

export function AiGeneratePanel({ onGenerated, onCancel, defaultTitle = '' }: AiGeneratePanelProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [title, setTitle] = useState(defaultTitle)
    const [category, setCategory] = useState<'NEWS' | 'REVIEW' | 'TIPS' | 'GUIDE' | 'PROMO'>('NEWS')
    const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'informative'>('professional')
    const [keywords, setKeywords] = useState('')
    const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
    const [error, setError] = useState('')

    const categories = [
        { value: 'NEWS', label: 'News', description: 'Berita terkini dengan fakta & data' },
        { value: 'REVIEW', label: 'Review', description: 'Review komprehensif dengan spesifikasi' },
        { value: 'TIPS', label: 'Tips', description: 'Tips praktis untuk pemilik/buyer' },
        { value: 'GUIDE', label: 'Guide', description: 'Panduan lengkap step-by-step' },
        { value: 'PROMO', label: 'Promo', description: 'Konten promosi dengan CTA' },
    ]

    const tones = [
        { value: 'professional', label: 'Professional', description: 'Formal & berwibawa' },
        { value: 'casual', label: 'Casual', description: 'Santai & mudah dipahami' },
        { value: 'enthusiastic', label: 'Enthusiastic', description: 'Antusias & energik' },
        { value: 'informative', label: 'Informative', description: 'Edukatif & informatif' },
    ]

    const lengths = [
        { value: 'short', label: 'Short', description: '~300-500 kata' },
        { value: 'medium', label: 'Medium', description: '~800-1200 kata' },
        { value: 'long', label: 'Long', description: '~1500-2500 kata' },
    ]

    const handleGenerate = async () => {
        if (!title.trim()) {
            setError('Judul artikel wajib diisi')
            return
        }

        setIsGenerating(true)
        setError('')

        try {
            const keywordArray = keywords
                .split(',')
                .map(k => k.trim())
                .filter(Boolean)

            const res = await fetch('/api/admin/articles/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    category,
                    tone,
                    keywords: keywordArray,
                    length,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to generate article')
            }

            const { data } = await res.json()

            onGenerated({
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
            })
        } catch (err: any) {
            setError(err?.message || 'Terjadi kesalahan saat generate artikel')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5 text-primary" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Generate with AI</h3>
                        <p className="text-sm text-gray-400">Buat konten artikel otomatis dengan Gemini AI</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onCancel} disabled={isGenerating}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-4">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Judul Artikel *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Review Toyota Avanza 2024..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Kategori
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value as any)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    category === cat.value
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-medium text-sm">{cat.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tone */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tone / Gaya Penulisan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {tones.map((tn) => (
                            <button
                                key={tn.value}
                                type="button"
                                onClick={() => setTone(tn.value as any)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    tone === tn.value
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-medium text-sm">{tn.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{tn.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Kata Kunci (Opsional)
                    </label>
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="avanza, 2024, mpv, keluarga"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
                </div>

                {/* Length */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Panjang Artikel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {lengths.map((ln) => (
                            <button
                                key={ln.value}
                                type="button"
                                onClick={() => setLength(ln.value as any)}
                                className={`p-3 rounded-lg border text-center transition-all ${
                                    length === ln.value
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="font-medium text-sm">{ln.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{ln.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isGenerating}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        disabled={!title.trim()}
                        className="flex-1"
                    >
                        {!isGenerating && <Wand2 className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
