'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownOption {
    value: string
    label: string
    icon?: React.ReactNode
}

interface DropdownProps {
    options: DropdownOption[]
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
    error?: string
    className?: string
    disabled?: boolean
}

export function Dropdown({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    label,
    error,
    className,
    disabled = false,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg text-left transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                    error ? 'border-red-500' : 'border-gray-300',
                    disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400',
                    isOpen && 'ring-2 ring-primary/50 border-primary'
                )}
                disabled={disabled}
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedOption ? (
                        <span className="flex items-center gap-2">
                            {selectedOption.icon}
                            {selectedOption.label}
                        </span>
                    ) : (
                        placeholder
                    )}
                </span>
                <ChevronDown
                    className={cn(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange?.(option.value)
                                setIsOpen(false)
                            }}
                            className={cn(
                                'w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors',
                                option.value === value && 'bg-primary/5 text-primary font-medium'
                            )}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    )
}
