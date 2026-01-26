'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    })

    // Get token from URL
    const token = searchParams.get('token')
    const method = searchParams.get('method') // 'email' or 'whatsapp'

    useEffect(() => {
        if (!token) {
            router.push('/forgot-password')
        }
    }, [token, router])

    const handleSubmit = async () => {
        if (!formData.newPassword || formData.newPassword.length < 8) {
            setError('Password minimal 8 karakter')
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(formData.newPassword)) {
            setError('Password harus mengandung huruf kapital, huruf kecil, dan angka')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mereset password')
            }

            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?reset=true')
            }, 3000)

        } catch (err: any) {
            setError(err.message || 'Gagal mereset password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {!token ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                        Link reset tidak valid. Silakan mulai ulang.
                    </div>
                ) : (
                    <>
                        {/* Back Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => router.push('/forgot-password')}
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
                            >
                                ← Kembali
                            </button>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {success ? 'Password Berhasil Direset!' : 'Reset Password'}
                                </h1>
                                <p className="text-gray-500 mt-2">
                                    {success
                                        ? 'Password Anda telah berhasil direset'
                                        : 'Masukkan password baru Anda'
                                    }
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && !success && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="text-center space-y-4 mb-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                    <p className="text-gray-600">
                                        Silakan login dengan password baru Anda.
                                    </p>
                                </div>
                            )}

                            {/* Form */}
                            {!success && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Minimal 8 karakter"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Huruf kapital, huruf kecil, & angka
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Ulangi password baru"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={
                                            !formData.newPassword ||
                                            !formData.confirmPassword ||
                                            formData.newPassword !== formData.confirmPassword
                                        }
                                    >
                                        Reset Password
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md text-center text-gray-500">
                    Loading...
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
