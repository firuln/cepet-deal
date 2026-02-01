'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Car,
    Heart,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Plus,
    User,
    Bell,
    History,
    LucideIcon,
    X,
    Home,
    BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

interface MenuItem {
    icon: LucideIcon
    label: string
    href: string
    badge?: number
}

interface SidebarProps {
    userRole?: 'BUYER' | 'SELLER' | 'DEALER' | 'ADMIN'
    isOpen?: boolean
    isCollapsed?: boolean
    onToggleCollapse?: () => void
    onClose?: () => void
    financeEnabled?: boolean
}

const buyerMenuItems: MenuItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Heart, label: 'Favorit', href: '/dashboard/favorites' },
    { icon: History, label: 'Riwayat', href: '/dashboard/history' },
    { icon: MessageSquare, label: 'Pesan', href: '/dashboard/messages', badge: 3 },
]

const sellerMenuItems: MenuItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Car, label: 'Iklan Saya', href: '/dashboard/listings' },
    { icon: Plus, label: 'Pasang Iklan', href: '/dashboard/listings/used' },
    { icon: BarChart3, label: 'Laporan Keuangan', href: '/dashboard/reports' },
    { icon: MessageSquare, label: 'Pesan', href: '/dashboard/messages', badge: 5 },
    { icon: Heart, label: 'Favorit', href: '/dashboard/favorites' },
]

const adminMenuItems: MenuItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: User, label: 'Pengguna', href: '/admin/users' },
    { icon: Car, label: 'Iklan', href: '/admin/listings' },
    { icon: Settings, label: 'Dealer', href: '/admin/dealers' },
    { icon: Bell, label: 'Notifikasi', href: '/admin/notifications' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
]

const bottomMenuItems: MenuItem[] = [
    { icon: Settings, label: 'Pengaturan', href: '/dashboard/settings' },
    { icon: HelpCircle, label: 'Bantuan', href: '/help' },
]


export function Sidebar({ userRole = 'BUYER', isOpen = false, isCollapsed = false, onToggleCollapse, onClose, financeEnabled = false }: SidebarProps) {
    const pathname = usePathname()

    const getSellerMenuItems = (): MenuItem[] => [
        { icon: Home, label: 'Home', href: '/' },
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Car, label: 'Iklan Saya', href: '/dashboard/listings' },
        { icon: Plus, label: 'Pasang Iklan', href: '/dashboard/listings/used' },
        ...(financeEnabled ? [{ icon: BarChart3, label: 'Laporan Keuangan', href: '/dashboard/reports' }] : []),
        { icon: MessageSquare, label: 'Pesan', href: '/dashboard/messages', badge: 5 },
        { icon: Heart, label: 'Favorit', href: '/dashboard/favorites' },
    ]

    const getMenuItems = () => {
        switch (userRole) {
            case 'ADMIN':
                return adminMenuItems
            case 'SELLER':
            case 'DEALER':
                return getSellerMenuItems()
            default:
                return buyerMenuItems
        }
    }

    const menuItems = getMenuItems()

    return (
        <aside className="w-full h-full bg-white flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Menu</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Collapsible Toggle */}
            {onToggleCollapse && (
                <div className="hidden md:block absolute -right-3 top-6 z-10">
                    <button
                        onClick={onToggleCollapse}
                        className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            )}

            {/* Main Menu */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        // Close sidebar on mobile after navigation
                                        if (window.innerWidth < 768 && onClose) {
                                            onClose()
                                        }
                                    }}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group',
                                        isActive
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <>
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {item.badge && (
                                                <span className={cn(
                                                    'ml-auto text-xs font-bold px-2 py-0.5 rounded-full',
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-primary text-white'
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {/* Collapsed badge */}
                                    {isCollapsed && item.badge && (
                                        <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                    {/* Desktop tooltip */}
                                    {isCollapsed && (
                                        <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Bottom Menu */}
            <div className="border-t border-gray-200 py-4 px-3">
                <ul className="space-y-1">
                    {bottomMenuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all group relative"
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                                {isCollapsed && (
                                    <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group relative"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium text-sm">Keluar</span>}
                            {isCollapsed && (
                                <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                                    Keluar
                                </span>
                            )}
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    )
}
