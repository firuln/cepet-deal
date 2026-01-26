'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button, Input } from '@/components/ui'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { update: updateSession } = useSession()

    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    })

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                identifier: formData.identifier,
                password: formData.password,
                rememberMe: rememberMe,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                // Update session to get latest user data
                await updateSession()

                // Fetch current session to check user role
                const sessionRes = await fetch('/api/auth/session')
                if (sessionRes.ok) {
                    const session = await sessionRes.json()
                    const userRole = session?.user?.role

                    // Determine redirect URL based on role
                    const callbackUrlParam = searchParams.get('callbackUrl')
                    let redirectUrl = '/dashboard' // default for regular users

                    // If callbackUrl is explicitly provided, use it (backward compatibility)
                    if (callbackUrlParam) {
                        redirectUrl = callbackUrlParam
                    } else if (userRole === 'ADMIN') {
                        // Admin goes to admin panel by default
                        redirectUrl = '/admin'
                    }

                    router.push(redirectUrl)
                    router.refresh()
                } else {
                    // Fallback to dashboard if session fetch fails
                    router.push('/dashboard')
                    router.refresh()
                }
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Masuk ke Akun</h1>
                        <p className="text-gray-500 mt-2">
                            Selamat datang kembali! Silakan masuk untuk melanjutkan.
                        </p>
                    </div>

                    {/* Success Message (for newly registered users) */}
                    {searchParams.get('registered') === 'true' && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            Registrasi berhasil! Silakan masuk dengan username dan password Anda.
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Identifier (Username/Email/Phone) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username, Email, atau WhatsApp
                            </label>
                            <Input
                                type="text"
                                placeholder="john_doe123"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                required
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Masukkan username, email, atau nomor WhatsApp Anda
                            </p>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Ingat Saya</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Lupa Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Masuk
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">atau</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-primary font-medium hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Info Text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Login dengan: Username / Email / WhatsApp
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        ☑️ Ingat Saya = 30 hari &nbsp;|&nbsp; ☐ Ingat Saya = 1 hari
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                            <div className="space-y-2 mt-8">
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
