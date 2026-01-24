'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showPageNumbers?: boolean
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showPageNumbers = true,
    className,
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const showEllipsis = totalPages > 7

        if (!showEllipsis) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        // Always show first page
        pages.push(1)

        if (currentPage > 3) {
            pages.push('...')
        }

        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i)
            }
        }

        if (currentPage < totalPages - 2) {
            pages.push('...')
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages)
        }

        return pages
    }

    if (totalPages <= 1) return null

    return (
        <nav className={cn('flex items-center justify-center gap-1', className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
                    currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                )}
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {showPageNumbers && getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all',
                            page === currentPage
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                    >
                        {page}
                    </button>
                ) : (
                    <span
                        key={index}
                        className="flex items-center justify-center w-10 h-10 text-gray-400"
                    >
                        {page}
                    </span>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
                    currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                )}
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </nav>
    )
}
