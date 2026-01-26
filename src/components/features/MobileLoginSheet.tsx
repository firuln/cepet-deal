'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { BottomSheet } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Eye, EyeOff, Lock } from 'lucide-react'

export function MobileLoginSheet() {
    const router = useRouter()
    const { update: updateSession } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    })

    // Listen for custom event to open the sheet
    useEffect(() => {
        const handleOpenLoginSheet = () => setIsOpen(true)
        window.addEventListener('open-login-sheet', handleOpenLoginSheet)
        return () => window.removeEventListener('open-login-sheet', handleOpenLoginSheet)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
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

            if (result?.ok) {
                // Update session to get latest user data
                await updateSession()

                // Fetch current session to check user role
                const sessionRes = await fetch('/api/auth/session')
                if (sessionRes.ok) {
                    const session = await sessionRes.json()
                    const userRole = session?.user?.role

                    // Determine redirect URL based on role
                    const redirectUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard'

                    setIsOpen(false)
                    router.push(redirectUrl)
                    router.refresh()
                } else {
                    // Fallback to dashboard if session fetch fails
                    setIsOpen(false)
                    router.refresh()
                }
            } else {
                setError(result?.error || 'Login gagal')
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('Terjadi kesalahan saat login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setError('')
    }

    const switchToRegister = () => {
        setIsOpen(false)
        // Small delay to allow animation to complete
        setTimeout(() => {
            router.push('/register')
        }, 100)
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={handleClose}
            title="Masuk ke CepetDeal"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username, Email, atau WhatsApp
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="john_doe123"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            required
                            className="pl-10"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Masukkan username, email, atau WhatsApp
                    </p>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Masukkan password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                                <Eye className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

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
                    <button
                        type="button"
                        onClick={() => {
                            handleClose()
                            router.push('/forgot-password')
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        Lupa Password?
                    </button>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <button
                            type="button"
                            onClick={switchToRegister}
                            className="text-primary font-semibold hover:underline"
                        >
                            Daftar Sekarang
                        </button>
                    </p>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">atau</span>
                    </div>
                </div>

                {/* Info Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        ☑️ Ingat Saya = 30 hari &nbsp;|&nbsp; ☐ = 1 hari
                    </p>
                </div>
            </form>
        </BottomSheet>
    )
}

// Helper function to open the login sheet
export function openLoginSheet() {
    window.dispatchEvent(new Event('open-login-sheet'))
}
