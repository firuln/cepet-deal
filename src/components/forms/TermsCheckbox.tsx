'use client'

import { useState } from 'react'
import { AlertCircle, FileText } from 'lucide-react'

interface TermsCheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    error?: string
    label?: string
    className?: string
}

export function TermsCheckbox({
    checked,
    onChange,
    error,
    label = 'Saya menyetujui Syarat & Ketentuan yang berlaku di CepetDeal',
    className = '',
}: TermsCheckboxProps) {
    const [showTerms, setShowTerms] = useState(false)

    const openTerms = () => {
        // For mobile, show bottom sheet
        if (window.innerWidth < 768) {
            // Dispatch custom event for bottom sheet
            window.dispatchEvent(new CustomEvent('open-terms-bottomsheet'))
        } else {
            // For desktop, open in new tab
            window.open('/terms', '_blank')
        }
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary focus:ring-2"
                    />
                </div>
                <span className="text-sm text-gray-600 flex-1">
                    {label}{' '}
                    <button
                        type="button"
                        onClick={openTerms}
                        className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Baca Syarat & Ketentuan
                    </button>
                </span>
            </label>

            {error && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Mobile Bottom Sheet Portal Target */}
            <div id="terms-bottomsheet-portal" />
        </div>
    )
}
