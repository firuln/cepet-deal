'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TestimonialCard } from './TestimonialCard'

interface Testimonial {
    id: string
    name: string
    role?: string
    avatar?: string
    content: string
    rating?: number
}

interface TestimonialSliderProps {
    testimonials: Testimonial[]
    autoPlay?: boolean
    autoPlayInterval?: number
    className?: string
}

export function TestimonialSlider({
    testimonials,
    autoPlay = true,
    autoPlayInterval = 5000,
    className,
}: TestimonialSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const itemsPerView = {
        mobile: 1,
        tablet: 2,
        desktop: 3,
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
    }

    const goToNext = () => {
        const maxIndex = Math.max(0, testimonials.length - itemsPerView.desktop)
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    }

    useEffect(() => {
        if (!autoPlay || isHovered || testimonials.length <= itemsPerView.desktop) return

        const maxIndex = Math.max(0, testimonials.length - itemsPerView.desktop)
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval, isHovered, testimonials.length])

    if (testimonials.length === 0) return null

    const maxIndex = Math.max(0, testimonials.length - itemsPerView.desktop)

    return (
        <div
            className={cn('relative', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slider Container */}
            <div className="overflow-hidden" ref={containerRef}>
                <div
                    className="flex transition-transform duration-500 ease-out gap-6"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop + 2)}%)`,
                    }}
                >
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0"
                        >
                            <TestimonialCard
                                name={testimonial.name}
                                role={testimonial.role}
                                avatar={testimonial.avatar}
                                content={testimonial.content}
                                rating={testimonial.rating}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            {testimonials.length > itemsPerView.desktop && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                            currentIndex === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                        aria-label="Previous testimonials"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        disabled={currentIndex >= maxIndex}
                        className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                            currentIndex >= maxIndex
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                        aria-label="Next testimonials"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    )
}
