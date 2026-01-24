import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialCardProps {
    name: string
    role?: string
    avatar?: string
    content: string
    rating?: number
    className?: string
}

export function TestimonialCard({
    name,
    role,
    avatar,
    content,
    rating = 5,
    className,
}: TestimonialCardProps) {
    return (
        <div className={cn(
            'bg-white p-6 rounded-2xl shadow-sm border border-gray-100',
            className
        )}>
            {/* Rating Stars */}
            <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            'w-5 h-5',
                            star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                        )}
                    />
                ))}
            </div>

            {/* Content */}
            <p className="text-gray-600 mb-4 leading-relaxed">
                "{content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                                {name.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{name}</p>
                    {role && <p className="text-sm text-gray-500">{role}</p>}
                </div>
            </div>
        </div>
    )
}
