'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { BottomSheet } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export function MobileLoginSheet() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
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

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.ok) {
                setIsOpen(false)
                router.refresh()
            } else {
                alert(result?.error || 'Login gagal')
            }
        } catch (error) {
            console.error('Login error:', error)
            alert('Terjadi kesalahan saat login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="pl-10"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
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

                <div className="flex items-center justify-between">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            // TODO: Implement forgot password
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        Lupa Password?
                    </a>
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

                {/* Social Login */}
                <div className="space-y-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                            // TODO: Implement Google login
                        }}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.23-2.13-.77a10.44 10.44 0 0 0-1.53-.22c-.76-.3-1.18-.89-1.18-1.63V7.25c0-1.67 1.08-3.12 2.62-3.44 1.46.32 3.33 1.12 4.88.77a10.44 10.44 0 0 0 2.13.77c.75.3 1.17.89 1.18 1.63V19.5c0 .83.69 1.44 1.88 1.12 3.44-.3.32-.78-.77-1.18-.77-1.63V14.5c0-3.64-2.83-6.62-6.62-6.62-3.64 0-6.62 2.83-6.62 6.62v5.25c0 .46.06.92.15 1.3.33 1.55.72.23 1.16.36.37 1.88.76 1.88.76v2.36c0 .85-.34 1.53-1.11 2.07-.4.54-.54.89-.82-1.53-.82-2.73v-.4c0-1.4 1.05-2.81 2.62-3.13.78-.27.77-1.33.77-1.33 1.63v.88c0 .85-.34 1.53-1.11 2.07-.4.54-.54.89-.82-1.53-.82-2.73v-.4c0-1.4 1.05-2.81 2.62-3.13.78-.27.77-1.33.77-1.33 1.63v.88c0 .85-.34 1.53-1.11 2.07-.4.54-.54.89-.82-1.53-.82-2.73z"
                            />
                        </svg>
                        Masuk dengan Google
                    </Button>
                </div>
            </form>
        </BottomSheet>
    )
}

// Helper function to open the login sheet
export function openLoginSheet() {
    window.dispatchEvent(new Event('open-login-sheet'))
}
