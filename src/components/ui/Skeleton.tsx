import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'bg-gray-200',
                animation === 'pulse' && 'animate-pulse',
                animation === 'wave' && 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded-lg',
                variant === 'text' && 'rounded h-4',
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    )
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8" variant="circular" />
                </div>
            </div>
        </div>
    )
}

export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
            <Skeleton className="w-16 h-16" variant="rectangular" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}
