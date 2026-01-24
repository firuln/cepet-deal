'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ArticleForm } from '@/components/forms/ArticleForm'

export default function NewArticlePage() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        redirect('/login?callbackUrl=/admin/articles/new')
    }

    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Buat Artikel Baru</h1>
                <p className="text-gray-400 mt-1">Tulis dan publikasikan artikel baru</p>
            </div>

            <ArticleForm />
        </div>
    )
}
