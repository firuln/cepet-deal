'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
    question: string
    answer: string
}

const DEFAULT_FAQS: FAQItem[] = [
    {
        question: 'Apakah unit masih tersedia?',
        answer: 'Silakan hubungi seller via WhatsApp untuk memastikan ketersediaan unit. Stok dapat berubah sewaktu-waktu.',
    },
    {
        question: 'Bisa test drive?',
        answer: 'Sebagian besar seller mengizinkan test drive. Silakan konfirmasi dengan seller untuk membuat janji temu.',
    },
    {
        question: 'Lokasi test drive dimana?',
        answer: 'Lokasi test drive biasanya di area seller atau tempat yang disepakati bersama. Hubungi seller untuk koordinasi lebih lanjut.',
    },
    {
        question: 'Apakah bisa nego?',
        answer: 'Banyak seller yang terbuka untuk negosiasi. Silakan diskusikan harga yang wajar secara sopan melalui WhatsApp.',
    },
    {
        question: 'Apakah BBN pajak ditanggung?',
        answer: 'Hal ini tergantung kesepakatan dengan seller. Tanyakan secara langsung apakah harga sudah termasuk balik nama dan pajak.',
    },
    {
        question: 'Bagaimana cara pembayaran?',
        answer: 'Disarankan melakukan transaksi secara bertatap muka (COD) setelah melakukan pengecekan unit. Hindari transfer sebelum melihat kondisi fisik mobil.',
    },
]

interface FAQAccordionProps {
    faqs?: FAQItem[]
}

export function FAQAccordion({ faqs = DEFAULT_FAQS }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-secondary flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Pertanyaan Umum
                </h2>
            </div>

            <div className="divide-y divide-gray-100">
                {faqs.map((faq, index) => (
                    <div key={index} className="last:border-0">
                        <button
                            onClick={() => toggle(index)}
                            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                            <span className={cn(
                                'text-sm font-medium transition-colors',
                                openIndex === index ? 'text-primary' : 'text-gray-700'
                            )}>
                                {faq.question}
                            </span>
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-3',
                                    openIndex === index && 'rotate-180'
                                )}
                            />
                        </button>

                        {openIndex === index && (
                            <div className="px-5 pb-3.5 pt-0">
                                <p className="text-sm text-gray-600 leading-relaxed pl-0">
                                    {faq.answer}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
