'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
    Menu,
    X,
    User,
    Heart,
    MessageSquare,
    Car,
    LogOut,
    ChevronDown,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const navLinks = [
    { href: '/mobil-baru', label: 'Mobil Baru' },
    { href: '/mobil-bekas', label: 'Mobil Bekas' },
    { href: '/dealer', label: 'Dealer' },
    { href: '/brand', label: 'Merk' },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const pathname = usePathname()
    const { data: session, status } = useSession()

    const isActive = (href: string) => pathname === href

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1">
                        <span className="text-2xl font-bold">
                            <span className="text-primary">Cepet</span>
                            <span className="text-secondary">Deal</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-sm font-medium transition-colors',
                                    isActive(link.href)
                                        ? 'text-primary'
                                        : 'text-gray-600 hover:text-primary'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        ) : session ? (
                            <>
                                {/* Sell Button */}
                                <Link href="/dashboard/listings/new">
                                    <Button size="sm">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Jual Mobil
                                    </Button>
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            {session.user.avatar ? (
                                                <img
                                                    src={session.user.avatar}
                                                    alt={session.user.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <ChevronDown className={cn(
                                            'w-4 h-4 text-gray-500 transition-transform',
                                            userMenuOpen && 'rotate-180'
                                        )} />
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-slide-down">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="font-medium text-secondary">{session.user.name}</p>
                                                    <p className="text-sm text-gray-500">{session.user.email}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Car className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/dashboard/favorites"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Heart className="w-4 h-4" />
                                                    Favorit
                                                </Link>
                                                <Link
                                                    href="/dashboard/messages"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Pesan
                                                </Link>
                                                <div className="border-t border-gray-100 mt-2 pt-2">
                                                    <button
                                                        onClick={() => signOut()}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Keluar
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Masuk</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Daftar</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-secondary" />
                        ) : (
                            <Menu className="w-6 h-6 text-secondary" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg font-medium transition-colors',
                                        isActive(link.href)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 px-4">
                            {session ? (
                                <>
                                    <Link href="/dashboard/listings/new" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Jual Mobil
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">Dashboard</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">Masuk</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">Daftar</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
