'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle,
    ArrowLeft,
    Loader2,
    MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui'

type Method = 'password' | 'otp'
type Step = 'method' | 'process' | 'success'

export default function ChangePasswordPage() {
    const router = useRouter()
    const [method, setMethod] = useState<Method>('password')
    const [step, setStep] = useState<Step>('method')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    // Password method form data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    // OTP method form data
    const [otpData, setOtpData] = useState({
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        cooldown: 0,
    })

    const handlePasswordSubmit = async () => {
        // Validate
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Semua field wajib diisi')
            return
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password minimal 8 karakter')
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(passwordData.newPassword)) {
            setError('Password harus mengandung huruf kapital, huruf kecil, dan angka')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Password baru tidak cocok')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/users/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengubah password')
            }

            setSuccess(true)
            setStep('success')

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/dashboard/settings')
            }, 3000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengubah password')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendOTP = async () => {
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/users/me/change-password/send-otp', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP')
            }

            // Set phone number from response
            if (data.phone) {
                // Mask phone for display
                const maskedPhone = data.phone.slice(0, 4) + '******' + data.phone.slice(-2)
                setOtpData(prev => ({ ...prev, phone: maskedPhone }))
            }

            // Set cooldown (5 minutes)
            setOtpData(prev => ({ ...prev, cooldown: 5 * 60 }))
            startCooldown()

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim OTP')
        } finally {
            setIsLoading(false)
        }
    }

    const startCooldown = () => {
        const interval = setInterval(() => {
            setOtpData(prev => {
                if (prev.cooldown <= 1) {
                    clearInterval(interval)
                    return { ...prev, cooldown: 0 }
                }
                return { ...prev, cooldown: prev.cooldown - 1 }
            })
        }, 1000)
    }

    const handleOTPSubmit = async () => {
        // Validate
        if (!otpData.otp || !otpData.newPassword || !otpData.confirmPassword) {
            setError('Semua field wajib diisi')
            return
        }

        if (!/^\d{6}$/.test(otpData.otp)) {
            setError('Format OTP tidak valid (6 digit angka)')
            return
        }

        if (otpData.newPassword.length < 8) {
            setError('Password minimal 8 karakter')
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(otpData.newPassword)) {
            setError('Password harus mengandung huruf kapital, huruf kecil, dan angka')
            return
        }

        if (otpData.newPassword !== otpData.confirmPassword) {
            setError('Password baru tidak cocok')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/users/me/change-password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: otpData.otp,
                    newPassword: otpData.newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengubah password')
            }

            setSuccess(true)
            setStep('success')

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/dashboard/settings')
            }, 3000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengubah password')
        } finally {
            setIsLoading(false)
        }
    }

    const formatCooldown = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Auto-focus first OTP input when OTP method is shown
    useEffect(() => {
        if (step === 'process' && method === 'otp' && otpData.phone) {
            setTimeout(() => {
                const firstInput = document.getElementById('change-password-otp-0')
                firstInput?.focus()
            }, 100)
        }
    }, [step, method, otpData.phone])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/settings"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">Ubah Password</h1>
                            <p className="text-sm text-gray-500">Ganti password akun Anda</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-8">
                <div className="max-w-lg mx-auto">
                    {/* Method Selection */}
                    {step === 'method' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pilih Metode Verifikasi</h2>
                            <p className="text-gray-500 mb-6">Pilih cara Anda ingin mengubah password</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setMethod('password')
                                        setStep('process')
                                    }}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Lock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">Password Saat Ini</h3>
                                            <p className="text-sm text-gray-500">Masukkan password lama Anda</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setMethod('otp')
                                        setStep('process')
                                        handleSendOTP()
                                    }}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-500/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <MessageCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">WhatsApp OTP</h3>
                                            <p className="text-sm text-gray-500">Verifikasi via WhatsApp (lupa password)</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Password Method */}
                    {step === 'process' && method === 'password' && !success && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Ubah Password</h2>
                                <p className="text-gray-500">Masukkan password saat ini dan password baru</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Saat Ini
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            placeholder="Masukkan password saat ini"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            placeholder="Minimal 8 karakter"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Huruf kapital, huruf kecil, & angka
                                    </p>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            placeholder="Ulangi password baru"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('method')}
                                        className="flex-1"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        onClick={handlePasswordSubmit}
                                        className="flex-1"
                                        isLoading={isLoading}
                                        disabled={
                                            !passwordData.currentPassword ||
                                            !passwordData.newPassword ||
                                            !passwordData.confirmPassword
                                        }
                                    >
                                        Ubah Password
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OTP Method */}
                    {step === 'process' && method === 'otp' && !success && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                                    <MessageCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Verifikasi WhatsApp</h2>
                                <p className="text-gray-500">
                                    {otpData.phone ? `OTP dikirim ke ${otpData.phone}` : 'Mengirim OTP...'}
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <div className="space-y-4">
                                {/* OTP Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode OTP
                                    </label>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <input
                                                key={i}
                                                id={`change-password-otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                className="flex-1 min-w-[40px] h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                                                value={otpData.otp[i] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    if (!/^\d*$/.test(value)) return
                                                    const newOtp = otpData.otp.split('')
                                                    newOtp[i] = value
                                                    setOtpData({ ...otpData, otp: newOtp.join('') })
                                                    if (value && i < 5) {
                                                        const nextInput = document.getElementById(`change-password-otp-${i + 1}`)
                                                        nextInput?.focus()
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    // Handle backspace - move to previous input
                                                    if (e.key === 'Backspace' && !otpData.otp[i] && i > 0) {
                                                        const prevInput = document.getElementById(`change-password-otp-${i - 1}`)
                                                        prevInput?.focus()
                                                    }
                                                    // Handle arrow keys
                                                    if (e.key === 'ArrowLeft' && i > 0) {
                                                        const prevInput = document.getElementById(`change-password-otp-${i - 1}`)
                                                        prevInput?.focus()
                                                    }
                                                    if (e.key === 'ArrowRight' && i < 5) {
                                                        const nextInput = document.getElementById(`change-password-otp-${i + 1}`)
                                                        nextInput?.focus()
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault()
                                                    const pastedData = e.clipboardData.getData('text')
                                                    const digits = pastedData.replace(/\D/g, '').slice(0, 6)
                                                    if (digits.length > 0) {
                                                        setOtpData({ ...otpData, otp: digits.padEnd(6, ' ') })
                                                        // Focus the next empty input or the last one
                                                        const nextEmpty = Math.min(digits.length, 5)
                                                        setTimeout(() => {
                                                            const input = document.getElementById(`change-password-otp-${nextEmpty}`)
                                                            input?.focus()
                                                        }, 0)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">OTP berlaku selama 5 menit</p>
                                        {otpData.cooldown > 0 ? (
                                            <p className="text-xs text-gray-500">
                                                Kirim ulang dalam {formatCooldown(otpData.cooldown)}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleSendOTP}
                                                className="text-xs text-primary hover:text-primary/80 font-medium"
                                            >
                                                Kirim ulang OTP
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            placeholder="Minimal 8 karakter"
                                            value={otpData.newPassword}
                                            onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Huruf kapital, huruf kecil, & angka
                                    </p>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            placeholder="Ulangi password baru"
                                            value={otpData.confirmPassword}
                                            onChange={(e) => setOtpData({ ...otpData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('method')}
                                        className="flex-1"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        onClick={handleOTPSubmit}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        isLoading={isLoading}
                                        disabled={
                                            !otpData.otp ||
                                            !otpData.newPassword ||
                                            !otpData.confirmPassword
                                        }
                                    >
                                        Verifikasi & Ubah
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Berhasil Diubah!</h2>
                            <p className="text-gray-500 mb-6">Password Anda telah berhasil diperbarui</p>
                            <p className="text-sm text-gray-400">Mengalihkan kembali ke pengaturan...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
