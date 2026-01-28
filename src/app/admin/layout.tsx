'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Car,
    Building2,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Shield,
    BarChart3,
    Bell,
    FileText,
    Flag,
    Star,
    Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

interface AdminLayoutProps {
    children: React.ReactNode
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Kelola User', href: '/admin/users' },
    { icon: Car, label: 'Kelola Iklan', href: '/admin/listings' },
    { icon: Building2, label: 'Kelola Dealer', href: '/admin/dealers' },
    { icon: FileText, label: 'Kelola Artikel', href: '/admin/articles' },
    { icon: Star, label: 'Kelola Review', href: '/admin/reviews/list' },
    { icon: Quote, label: 'Testimoni', href: '/admin/testimonials' },
    { icon: Flag, label: 'Laporan', href: '/admin/reports/list' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Memuat...</p>
                </div>
            </div>
        )
    }

    // Auth check - must be logged in
    if (!session) {
        redirect('/login?callbackUrl=/admin')
    }

    // Role check - must be ADMIN
    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 transition-transform duration-300',
                    'lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href))
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                            isActive
                                                ? 'bg-primary text-white'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-700" />

                    {/* Bottom Actions */}
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Kembali ke Website</span>
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Keluar</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-6">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* Admin Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                    {session.user?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                <p className="text-xs text-gray-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
