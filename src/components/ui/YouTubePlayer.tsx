'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface YouTubePlayerProps {
    url: string
    title?: string
    className?: string
    thumbnail?: string
    autoPlay?: boolean
}

function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
        /youtube\.com\/watch\?.*v=([^&\s]+)/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }

    return null
}

export function YouTubePlayer({
    url,
    title = 'Video',
    className,
    thumbnail,
    autoPlay = false,
}: YouTubePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const videoId = getYouTubeVideoId(url)

    if (!videoId) {
        return (
            <div className={cn('aspect-video bg-gray-100 rounded-xl flex items-center justify-center', className)}>
                <p className="text-gray-500">Video tidak tersedia</p>
            </div>
        )
    }

    const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return (
        <div className={cn('relative aspect-video rounded-xl overflow-hidden', className)}>
            {isPlaying ? (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            ) : (
                <>
                    <Image
                        src={thumbnailUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors shadow-lg group"
                            aria-label="Play video"
                        >
                            <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

// Modal version for fullscreen video playback
interface YouTubeModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    title?: string
}

export function YouTubeModal({ isOpen, onClose, url, title = 'Video' }: YouTubeModalProps) {
    const videoId = getYouTubeVideoId(url)

    if (!isOpen || !videoId) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close video"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-5xl aspect-video">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-xl"
                />
            </div>
        </div>
    )
}
