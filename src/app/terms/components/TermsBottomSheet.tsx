'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TERMS_UPDATED_DATE } from '@/lib/constants'
import { TermsContent } from './TermsContent'

interface TermsBottomSheetProps {
    isOpen: boolean
    onClose: () => void
}

export function TermsBottomSheet({ isOpen, onClose }: TermsBottomSheetProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            setIsVisible(false)
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isVisible) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
                <div
                    className={`bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
                        isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                    style={{ height: '85vh', maxHeight: '85vh' }}
                >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div>
                            <h2 className="text-lg font-bold text-secondary">Syarat & Ketentuan</h2>
                            <p className="text-xs text-gray-500">
                                Update: {TERMS_UPDATED_DATE}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="overflow-y-auto px-4 py-4" style={{ height: 'calc(100% - 70px)' }}>
                        <TermsContent />
                    </div>
                </div>
            </div>
        </>
    )
}
