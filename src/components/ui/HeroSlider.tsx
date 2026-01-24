'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
    id: string
    title: string
    subtitle?: string
    image: string
    link?: string
}

interface HeroSliderProps {
    slides: Slide[]
    autoPlay?: boolean
    autoPlayInterval?: number
    showArrows?: boolean
    showDots?: boolean
    className?: string
}

export function HeroSlider({
    slides,
    autoPlay = true,
    autoPlayInterval = 5000,
    showArrows = true,
    showDots = true,
    className,
}: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index)
    }, [])

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }, [slides.length])

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, [slides.length])

    useEffect(() => {
        if (!autoPlay || isHovered || slides.length <= 1) return

        const interval = setInterval(goToNext, autoPlayInterval)
        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval, isHovered, goToNext, slides.length])

    if (slides.length === 0) return null

    return (
        <div
            className={cn('relative w-full overflow-hidden rounded-2xl', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0 relative">
                        {slide.link ? (
                            <Link href={slide.link} className="block">
                                <SlideContent slide={slide} />
                            </Link>
                        ) : (
                            <SlideContent slide={slide} />
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {showArrows && slides.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                'w-2.5 h-2.5 rounded-full transition-all',
                                index === currentIndex
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 hover:bg-white/75'
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function SlideContent({ slide }: { slide: Slide }) {
    return (
        <div className="relative aspect-[16/6] md:aspect-[16/5] w-full">
            <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-xl">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                            {slide.title}
                        </h2>
                        {slide.subtitle && (
                            <p className="text-sm md:text-lg text-white/90">
                                {slide.subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
