'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageSliderProps {
    images: string[]
    alt?: string
    className?: string
    showThumbnails?: boolean
    enableLightbox?: boolean
}

export function ImageSlider({
    images,
    alt = 'Image',
    className,
    showThumbnails = true,
    enableLightbox = true,
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    if (images.length === 0) return null

    return (
        <>
            <div className={cn('space-y-3', className)}>
                {/* Main Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                    <Image
                        src={images[currentIndex]}
                        alt={`${alt} ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                    />

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Zoom Button */}
                    {enableLightbox && (
                        <button
                            onClick={() => setIsLightboxOpen(true)}
                            className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            aria-label="Open fullscreen"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-white text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnails */}
                {showThumbnails && images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    'relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all',
                                    index === currentIndex
                                        ? 'ring-2 ring-primary ring-offset-2'
                                        : 'opacity-60 hover:opacity-100'
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`${alt} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                        aria-label="Close lightbox"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <Image
                            src={images[currentIndex]}
                            alt={`${alt} ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Lightbox Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    'relative w-16 h-12 rounded overflow-hidden transition-all',
                                    index === currentIndex
                                        ? 'ring-2 ring-white'
                                        : 'opacity-50 hover:opacity-100'
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`${alt} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
