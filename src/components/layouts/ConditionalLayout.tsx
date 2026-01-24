'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

interface ConditionalLayoutProps {
    children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname()

    // Hide Header/Footer on admin and dashboard pages
    const isAdminPage = pathname?.startsWith('/admin')
    const isDashboardPage = pathname?.startsWith('/dashboard')
    const hideLayout = isAdminPage || isDashboardPage

    return (
        <>
            {!hideLayout && <Header />}
            <main className="min-h-screen">{children}</main>
            {!hideLayout && <Footer />}
        </>
    )
}
