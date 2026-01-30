'use client'

import { useState } from 'react'
import { Wand2, Sparkles, Loader2, RefreshCw, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CarData {
    brand: string
    model: string
    variant: string
    year: string
    transmission: string
    fuelType: string
    bodyType: string
    color: string
    price: string
}

interface AiDescriptionButtonProps {
    carData: CarData
    condition: 'NEW' | 'USED'
    onGenerated: (description: string) => void
    disabled?: boolean
}

type ToneOption = 'professional' | 'enthusiastic' | 'casual'
type LengthOption = 'short' | 'medium' | 'long'

const TONES: { value: ToneOption; label: string; description: string }[] = [
    { value: 'professional', label: 'Professional', description: 'Formal & berwibawa' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Antusias & energik' },
    { value: 'casual', label: 'Casual', description: 'Santai & relatable' },
]

const LENGTHS: { value: LengthOption; label: string; description: string }[] = [
    { value: 'short', label: 'Short', description: '~100 kata' },
    { value: 'medium', label: 'Medium', description: '~200 kata' },
    { value: 'long', label: 'Long', description: '~350 kata' },
]

export function AiDescriptionButton({ carData, condition, onGenerated, disabled }: AiDescriptionButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [selectedTone, setSelectedTone] = useState<ToneOption>('professional')
    const [selectedLength, setSelectedLength] = useState<LengthOption>('medium')
    const [error, setError] = useState('')

    // Check if required fields are filled
    const isReadyToGenerate =
        carData.brand &&
        carData.model &&
        carData.variant &&
        carData.year &&
        carData.transmission &&
        carData.fuelType &&
        carData.bodyType &&
        carData.color &&
        carData.price

    const handleGenerate = async () => {
        if (!isReadyToGenerate) {
            setError('Lengkapi data dasar mobil terlebih dahulu (Step 1-3)')
            return
        }

        setIsGenerating(true)
        setError('')
        setShowOptions(false)

        try {
            const res = await fetch('/api/listings/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...carData,
                    condition,
                    tone: selectedTone,
                    length: selectedLength,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to generate description')
            }

            const { data } = await res.json()
            onGenerated(data.description)
        } catch (err: any) {
            setError(err?.message || 'Terjadi kesalahan saat generate deskripsi')
            console.error('AI Generation Error:', err)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="relative">
            {/* Main Button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                disabled={disabled || isGenerating}
                className={cn(
                    "border-primary/50 text-primary hover:bg-primary/5 hover:border-primary",
                    showOptions && "bg-primary/10 border-primary"
                )}
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : showOptions ? (
                    <X className="w-4 h-4 mr-2" />
                ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>

            {/* Options Panel */}
            {showOptions && !isGenerating && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 animate-slide-down">
                    <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-secondary text-sm">AI Description</h4>
                                <p className="text-xs text-gray-500">Generate deskripsi otomatis</p>
                            </div>
                        </div>

                        {/* Car Summary */}
                        {isReadyToGenerate && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-secondary">
                                    {carData.brand} {carData.model} {carData.variant}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {carData.year} • {carData.transmission} • {carData.fuelType}
                                </p>
                            </div>
                        )}

                        {/* Warning if not ready */}
                        {!isReadyToGenerate && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-700">
                                    ⚠️ Lengkapi data mobil di Step 1-3 terlebih dahulu
                                </p>
                            </div>
                        )}

                        {/* Tone Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tone / Gaya Penulisan
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {TONES.map((tone) => (
                                    <button
                                        key={tone.value}
                                        type="button"
                                        onClick={() => setSelectedTone(tone.value)}
                                        className={cn(
                                            "p-2 rounded-lg border text-center transition-all",
                                            selectedTone === tone.value
                                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                        )}
                                    >
                                        <span className="text-xs">{tone.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Length Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Panjang Deskripsi
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LENGTHS.map((length) => (
                                    <button
                                        key={length.value}
                                        type="button"
                                        onClick={() => setSelectedLength(length.value)}
                                        className={cn(
                                            "p-2 rounded-lg border text-center transition-all",
                                            selectedLength === length.value
                                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                        )}
                                    >
                                        <span className="text-xs block">{length.label}</span>
                                        <span className="text-[10px] text-gray-400">{length.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowOptions(false)}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleGenerate}
                                disabled={!isReadyToGenerate}
                                className="flex-1"
                            >
                                <Wand2 className="w-3 h-3 mr-1" />
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {showOptions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOptions(false)}
                />
            )}
        </div>
    )
}
