import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary/20 text-primary border border-primary/30',
            secondary: 'bg-secondary/20 text-secondary border border-secondary/30',
            success: 'bg-green-500/20 text-green-400 border border-green-500/30',
            warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
            danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
            info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        }

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-sm',
        }

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-medium rounded-full',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        )
    }
)

Badge.displayName = 'Badge'

export { Badge }
