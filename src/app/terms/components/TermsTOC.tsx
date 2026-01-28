'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Section {
    id: string
    title: string
    icon: typeof CheckCircle
}

const sections: Section[] = [
    { id: 'pendahuluan', title: 'Pendahuluan', icon: AlertCircle },
    { id: 'pendaftaran', title: 'Pendaftaran Akun', icon: CheckCircle },
    { id: 'role-user', title: 'Role User', icon: CheckCircle },
    { id: 'verifikasi-dealer', title: 'Verifikasi Dealer', icon: CheckCircle },
    { id: 'aturan-iklan', title: 'Aturan Iklan', icon: AlertCircle },
    { id: 'kuota-iklan', title: 'Kuota Iklan', icon: AlertCircle },
    { id: 'transaksi', title: 'Transaksi', icon: AlertTriangle },
    { id: 'fitur-berbayar', title: 'Fitur Berbayar', icon: AlertCircle },
    { id: 'larangan', title: 'Larangan', icon: XCircle },
    { id: 'pesan-komunikasi', title: 'Pesan & Komunikasi', icon: AlertCircle },
    { id: 'hak-kekayaan-intelektual', title: 'Hak Kekayaan Intelektual', icon: AlertCircle },
    { id: 'privasi', title: 'Privasi Data', icon: AlertCircle },
    { id: 'batasan-tanggung-jawab', title: 'Batasan Tanggung Jawab', icon: AlertTriangle },
    { id: 'sanksi-penghentian', title: 'Sanksi & Penghentian', icon: XCircle },
    { id: 'perubahan-layanan', title: 'Perubahan Layanan', icon: AlertCircle },
    { id: 'hukum-berlaku', title: 'Hukum Berlaku', icon: AlertCircle },
    { id: 'kontak', title: 'Kontak', icon: CheckCircle },
]

export function TermsTOC() {
    const [activeSection, setActiveSection] = useState('pendahuluan')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { threshold: 0.3, rootMargin: '-80px 0px -70% 0px' }
        )

        sections.forEach((section) => {
            const element = document.getElementById(section.id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 80
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth',
            })
        }
    }

    return (
        <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-secondary mb-4 text-sm">Daftar Isi</h3>
                <nav className="space-y-1">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id
                        const Icon = section.icon

                        return (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                                    isActive ? 'text-primary' : 'text-gray-400'
                                }`} />
                                <span className="text-xs leading-snug">{section.title}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
