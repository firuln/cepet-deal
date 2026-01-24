'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
    const [isAnimating, setIsAnimating] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Preload next and previous images for smoother navigation
    useEffect(() => {
        if (currentIndex > 0) {
            const prevImg = new window.Image()
            prevImg.src = images[currentIndex - 1]
        }
        if (currentIndex < images.length - 1) {
            const nextImg = new window.Image()
            nextImg.src = images[currentIndex + 1]
        }
    }, [currentIndex, images])

    // Reset loaded state when changing images
    useEffect(() => {
        setImageLoaded(false)
    }, [currentIndex])

    // Handle image load
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true)
    }, [])

    const goToPrevious = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        setTimeout(() => setIsAnimating(false), 200)
    }, [images.length, isAnimating])

    const goToNext = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        setTimeout(() => setIsAnimating(false), 200)
    }, [images.length, isAnimating])

    const goToSlide = useCallback((index: number) => {
        if (isAnimating || index === currentIndex) return
        setIsAnimating(true)
        setCurrentIndex(index)
        setTimeout(() => setIsAnimating(false), 200)
    }, [currentIndex, isAnimating])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            switch (e.key) {
                case 'ArrowLeft':
                    goToPrevious()
                    break
                case 'ArrowRight':
                    goToNext()
                    break
                case 'Escape':
                    setIsLightboxOpen(false)
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, goToPrevious, goToNext])

    // Touch/Swipe handlers
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) goToNext()
        if (isRightSwipe) goToPrevious()
    }

    if (images.length === 0) return null

    return (
        <>
            <div className={cn('space-y-4', className)}>
                {/* Main Image */}
                <div
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Skeleton loader */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}

                    {/* Main image with fade transition */}
                    <div
                        className={cn(
                            'absolute inset-0 transition-opacity duration-200',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    >
                        <Image
                            src={images[currentIndex]}
                            alt={`${alt} ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            onLoad={handleImageLoad}
                        />
                    </div>

                    {/* Navigation buttons - show on hover/focus */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 shadow-lg"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 shadow-lg"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Zoom/Lightbox button */}
                    {enableLightbox && (
                        <button
                            onClick={() => setIsLightboxOpen(true)}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 shadow-lg"
                            aria-label="Open fullscreen"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    )}

                    {/* Dot indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={cn(
                                        'w-1.5 h-1.5 rounded-full transition-all duration-200',
                                        index === currentIndex
                                            ? 'bg-white w-5'
                                            : 'bg-white/60 hover:bg-white/80'
                                    )}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails - horizontal scroll with snap */}
                {showThumbnails && images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    'relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-200 snap-start',
                                    index === currentIndex
                                        ? 'ring-2 ring-primary ring-offset-2 scale-105'
                                        : 'opacity-60 hover:opacity-100 hover:scale-105'
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

            {/* Lightbox - minimalist */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={(e) => {
                        // Only close if clicking the backdrop, not the content
                        if (e.target === e.currentTarget) {
                            setIsLightboxOpen(false)
                        }
                    }}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsLightboxOpen(false)
                            }}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                            aria-label="Close lightbox"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Main image in lightbox */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={images[currentIndex]}
                                alt={`${alt} ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Lightbox dot indicators */}
                        {images.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={cn(
                                            'w-2 h-2 rounded-full transition-all duration-200',
                                            index === currentIndex
                                                ? 'bg-white w-6'
                                                : 'bg-white/50 hover:bg-white/80'
                                        )}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom scrollbar hide */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    )
}
