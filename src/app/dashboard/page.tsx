'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layouts'
import { BuyerDashboard } from './components/BuyerDashboard'
import { SellerDashboard } from './components/SellerDashboard'
import { DealerDashboard } from './components/DealerDashboard'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // Redirect ADMIN to /admin
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            router.push('/admin')
        }
    }, [status, session, router])

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="w-12 h-12 border-4 border-t-primary border-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/dashboard')
        return null
    }

    // Role-based dashboard rendering
    const userRole = session?.user?.role

    return (
        <DashboardLayout>
            {userRole === 'BUYER' && <BuyerDashboard />}
            {userRole === 'SELLER' && <SellerDashboard />}
            {userRole === 'DEALER' && <DealerDashboard />}
            {userRole === 'ADMIN' && null} // Will redirect to /admin
        </DashboardLayout>
    )
}
