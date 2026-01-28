'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SettingsForm } from '@/components/admin/SettingsForm'

interface AppSettings {
    aiProvider: 'zhipu' | 'gemini'
    zhipuApiKey: string
    zhipuModel: string
    geminiApiKey: string
    geminiModel: string
}

export default function AdminSettingsPage() {
    const { data: session, status } = useSession()
    const [settings, setSettings] = useState<AppSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        redirect('/login?callbackUrl=/admin/settings')
    }

    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (newSettings: Partial<AppSettings>) => {
        setIsSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            })

            if (res.ok) {
                const data = await res.json()
                setSettings(data.data)
                setMessage({ type: 'success', text: data.message || 'Settings saved successfully' })
            } else {
                const error = await res.json()
                setMessage({ type: 'error', text: error.error || 'Failed to save settings' })
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Pengaturan Aplikasi</h1>
                <p className="text-gray-400 mt-1">Kelola konfigurasi aplikasi dan API</p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Settings Form */}
            {isLoading ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
                    Memuat pengaturan...
                </div>
            ) : settings ? (
                <SettingsForm
                    settings={settings}
                    onSave={handleSave}
                    isSaving={isSaving}
                />
            ) : null}
        </div>
    )
}
