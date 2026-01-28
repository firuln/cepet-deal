import { Metadata } from 'next'
import { TERMS_UPDATED_DATE } from '@/lib/constants'
import { TermsContent } from './components/TermsContent'
import { TermsTOC } from './components/TermsTOC'

export const metadata: Metadata = {
    title: 'Syarat & Ketentuan - CepetDeal',
    description: 'Syarat dan ketentuan penggunaan platform CepetDeal',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-8">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-bold text-secondary mb-2">Syarat & Ketentuan</h1>
                        <p className="text-gray-500">
                            Terakhir diperbarui: {TERMS_UPDATED_DATE}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-8">
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">
                    {/* Sidebar TOC - Desktop */}
                    <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                        <TermsTOC />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <TermsContent />
                    </main>
                </div>
            </div>
        </div>
    )
}
