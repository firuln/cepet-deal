import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-gray-800 rounded-xl border border-gray-700',
                    hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-600',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

const CardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('relative aspect-[4/3] overflow-hidden', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardImage.displayName = 'CardImage'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('p-4', className)}
                {...props}
            />
        )
    }
)

CardContent.displayName = 'CardContent'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('px-4 pt-4 pb-2', className)}
                {...props}
            />
        )
    }
)

CardHeader.displayName = 'CardHeader'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('px-4 pb-4 pt-2 border-t border-gray-700', className)}
                {...props}
            />
        )
    }
)

CardFooter.displayName = 'CardFooter'

export { Card, CardImage, CardContent, CardHeader, CardFooter }
