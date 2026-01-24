'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { ArticleForm } from '@/components/forms/ArticleForm'
import { use } from 'react'

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [article, setArticle] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const resolvedParams = use(params)

    useEffect(() => {
        async function fetchArticle() {
            try {
                const res = await fetch(`/api/admin/articles/${resolvedParams.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setArticle(data)
                } else {
                    setError('Artikel tidak ditemukan')
                }
            } catch (err) {
                setError('Gagal memuat artikel')
            } finally {
                setIsLoading(false)
            }
        }

        if (session?.user?.role === 'ADMIN') {
            fetchArticle()
        }
    }, [resolvedParams.id, session])

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        redirect('/login?callbackUrl=/admin/articles/' + resolvedParams.id + '/edit')
    }

    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-primary hover:underline"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Edit Artikel</h1>
                <p className="text-gray-400 mt-1">Edit artikel yang sudah ada</p>
            </div>

            {article && <ArticleForm article={article} isEditing={true} />}
        </div>
    )
}
