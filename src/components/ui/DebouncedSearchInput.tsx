'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DebouncedSearchInputProps {
    value: string
    onChange: (value: string) => void
    onDebounceComplete?: (value: string) => void
    placeholder?: string
    delay?: number
    className?: string
    isLoading?: boolean
}

export function DebouncedSearchInput({
    value,
    onChange,
    onDebounceComplete,
    placeholder = 'Cari...',
    delay = 500,
    className,
    isLoading = false,
}: DebouncedSearchInputProps) {
    const [localValue, setLocalValue] = useState(value)
    const debounceRef = useRef<NodeJS.Timeout>()

    // Sync local value with prop value
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Debounce effect
    useEffect(() => {
        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Only debounce if user has typed something
        if (localValue !== value) {
            debounceRef.current = setTimeout(() => {
                onChange(localValue)
                onDebounceComplete?.(localValue)
            }, delay)
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [localValue, delay, onChange, onDebounceComplete, value])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value)
    }, [])

    const handleClear = useCallback(() => {
        setLocalValue('')
        onChange('')
        onDebounceComplete?.('')
    }, [onChange, onDebounceComplete])

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Immediate search on Enter
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
            onChange(localValue)
            onDebounceComplete?.(localValue)
        }
    }, [localValue, onChange, onDebounceComplete])

    const hasValue = localValue.length > 0

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className={cn(
                    'w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                    'placeholder:text-gray-400',
                    'transition-all duration-200',
                    'hover:border-gray-400'
                )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isLoading && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {!isLoading && hasValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>
        </div>
    )
}
