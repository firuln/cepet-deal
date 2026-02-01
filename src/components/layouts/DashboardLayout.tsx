'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { UserRole } from '@prisma/client'
import { useState, useEffect } from 'react'
import { Menu, X, Bell, Search, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardLayoutProps {
    children: React.ReactNode
    requireAuth?: boolean
    allowedRoles?: UserRole[]
}

export function DashboardLayout({
    children,
    requireAuth = true,
    allowedRoles,
}: DashboardLayoutProps) {
    const { data: session, status } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [financeEnabled, setFinanceEnabled] = useState(false)

    useEffect(() => {
        const fetchFinanceStatus = async () => {
            try {
                const response = await fetch('/api/user/finance-status')
                if (response.ok) {
                    const data = await response.json()
                    setFinanceEnabled(data.financeEnabled)
                }
            } catch (error) {
                console.error('Failed to fetch finance status:', error)
            }
        }
        fetchFinanceStatus()
    }, [])

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Memuat...</p>
                </div>
            </div>
        )
    }

    // Auth check
    if (requireAuth && !session) {
        redirect('/login?callbackUrl=/dashboard')
    }

    // Role check
    if (allowedRoles && session?.user?.role) {
        const userRole = session.user.role as UserRole
        if (!allowedRoles.includes(userRole)) {
            redirect('/dashboard')
        }
    }

    const userRole = (session?.user?.role as UserRole) || 'BUYER'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed on desktop, slide-in on mobile */}
            <div className={`
                fixed md:sticky top-0 left-0 h-screen z-50 md:z-40
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                w-64 flex-shrink-0
            `}>
                <Sidebar
                    userRole={userRole}
                    isOpen={isSidebarOpen}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onClose={() => setIsSidebarOpen(false)}
                    financeEnabled={financeEnabled}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full">
                {/* Mobile Top Bar */}
                <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? (
                                <X className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                        <div>
                            <h1 className="font-semibold text-gray-900 text-sm">Dashboard</h1>
                            <p className="text-xs text-gray-500">{session?.user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Close sidebar button when open on mobile */}
            {isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden fixed top-20 right-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            )}
        </div>
    )
}
