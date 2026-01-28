'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserPlus, Mail, ArrowLeft, CheckCircle, Clock, RefreshCw, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { TermsCheckbox } from '@/components/forms/TermsCheckbox'
import { TermsBottomSheet } from '@/app/terms/components/TermsBottomSheet'

const ROLES = [
    {
        id: 'BUYER',
        label: 'Pembeli',
        icon: '🛒',
        description: 'Cari dan beli mobil impian',
        color: 'bg-green-50 border-green-200 hover:bg-green-100',
        titleColor: 'text-green-800',
        iconBg: 'bg-green-100',
    },
    {
        id: 'SELLER',
        label: 'Penjual',
        icon: '🚗',
        description: 'Jual mobil bekas pribadi',
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        titleColor: 'text-blue-800',
        iconBg: 'bg-blue-100',
    },
]

const STEP_DATA = {
    account: { id: 'account', title: 'Buat Akun', icon: User },
    verify: { id: 'verify', title: 'Verifikasi WhatsApp', icon: Mail },
    success: { id: 'success', title: 'Registrasi Berhasil!', icon: CheckCircle },
}

function RegisterForm() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<'account' | 'verify' | 'success'>('account')
    const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER'>('BUYER')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Account form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    // Phone for verification
    const [phone, setPhone] = useState('')

    // Username validation
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

    // OTP data
    const [otpData, setOtpData] = useState({
        code: '',
        countdown: 0,
        canResend: false,
        sent: false, // Track if OTP has been sent
    })

    // Stored data after account creation
    const [userId, setUserId] = useState<string | null>(null)
    const [registeredUsername, setRegisteredUsername] = useState<string | null>(null)

    // Terms & Conditions
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [showTermsBottomSheet, setShowTermsBottomSheet] = useState(false)
    const [termsError, setTermsError] = useState('')

    // Check username availability (debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.username && formData.username.length >= 3) {
                // Check format first
                const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
                if (!usernameRegex.test(formData.username)) {
                    setUsernameStatus('taken')
                    return
                }

                // Check if starts with number
                if (/^\d/.test(formData.username)) {
                    setUsernameStatus('taken')
                    return
                }

                setUsernameStatus('checking')
                try {
                    const res = await fetch('/api/auth/register/check-username', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: formData.username }),
                    })
                    const data = await res.json()
                    setUsernameStatus(data.available ? 'available' : 'taken')
                } catch {
                    setUsernameStatus('idle')
                }
            } else {
                setUsernameStatus('idle')
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.username])

    // Countdown timer for resend
    useEffect(() => {
        if (otpData.countdown > 0) {
            const timer = setTimeout(() => {
                setOtpData(prev => ({ ...prev, countdown: prev.countdown - 1 }))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [otpData.countdown])

    // Auto-focus first OTP input when sent
    useEffect(() => {
        if (otpData.sent) {
            setTimeout(() => {
                const firstInput = document.getElementById('register-otp-0')
                firstInput?.focus()
            }, 100)
        }
    }, [otpData.sent])

    // Listen for custom event to open terms bottom sheet
    useEffect(() => {
        const handleOpenTerms = () => setShowTermsBottomSheet(true)

        window.addEventListener('open-terms-bottomsheet', handleOpenTerms)

        return () => {
            window.removeEventListener('open-terms-bottomsheet', handleOpenTerms)
        }
    }, [])

    // Format phone input
    const formatPhoneNumber = (value: string) => {
        let cleaned = value.replace(/[^\d]/g, '')
        if (cleaned.startsWith('08')) {
            cleaned = '62' + cleaned.substring(1)
        }
        return '+' + cleaned
    }

    // Step 1: Create Account
    const handleCreateAccount = async () => {
        // Validation
        if (!formData.username || formData.username.length < 3) {
            setError('Username minimal 3 karakter')
            return
        }

        if (usernameStatus !== 'available') {
            setError('Username tidak tersedia')
            return
        }

        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                setError('Format email tidak valid')
                return
            }
        }

        if (!formData.password || formData.password.length < 8) {
            setError('Password minimal 8 karakter')
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        if (!passwordRegex.test(formData.password)) {
            setError('Password harus mengandung huruf kapital, huruf kecil, dan angka')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (!termsAccepted) {
            setTermsError('Anda harus menyetujui Syarat & Ketentuan')
            setError('Anda harus menyetujui Syarat & Ketentuan')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email || undefined,
                    password: formData.password,
                    role: selectedRole,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal membuat akun')
            }

            setUserId(data.userId)
            setRegisteredUsername(data.username)

            // Move to verification step
            setCurrentStep('verify')

        } catch (err: any) {
            setError(err.message || 'Gagal membuat akun')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Send OTP
    const handleSendOtp = async () => {
        if (!phone || phone.length < 11) {
            setError('Nomor WhatsApp tidak valid')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    phone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP')
            }

            // Show OTP in development
            if (data.dummyOtp) {
                alert(`OTP DUMMY: ${data.dummyOtp}\n(Gunakan kode ini untuk verifikasi)`)
            }

            setOtpData({ ...otpData, countdown: 30, canResend: false, sent: true })

            setTimeout(() => {
                setOtpData(prev => ({ ...prev, canResend: true }))
            }, 30000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim OTP')
        } finally {
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    phone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim ulang OTP')
            }

            if (data.dummyOtp) {
                alert(`OTP DUMMY (NEW): ${data.dummyOtp}`)
            }

            setOtpData({ ...otpData, countdown: 30, canResend: false, sent: true })

            setTimeout(() => {
                setOtpData(prev => ({ ...prev, canResend: true }))
            }, 30000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim ulang OTP')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (!otpData.code || otpData.code.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    otp: otpData.code,
                    phone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'OTP tidak valid')
            }

            setCurrentStep('success')

            // Auto-login and redirect after 2 seconds
            setTimeout(async () => {
                try {
                    const loginRes = await signIn('credentials', {
                        identifier: formData.username,
                        password: formData.password,
                        redirect: false,
                    })

                    if (loginRes?.ok) {
                        // Fetch session to check role
                        const sessionRes = await fetch('/api/auth/session')
                        if (sessionRes.ok) {
                            const session = await sessionRes.json()
                            const userRole = session?.user?.role
                            router.push(userRole === 'ADMIN' ? '/admin' : '/dashboard')
                        } else {
                            router.push('/dashboard')
                        }
                    } else {
                        router.push('/login?registered=true')
                    }
                } catch {
                    router.push('/login?registered=true')
                }
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Gagal memverifikasi OTP')
        } finally {
            setIsLoading(false)
        }
    }

    const goBack = () => {
        if (currentStep === 'verify') {
            setCurrentStep('account')
            setError('')
        } else {
            router.push('/')
        }
    }

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {Object.values(STEP_DATA).map((step, index) => {
                            const stepNumber = index + 1
                            const isCurrent = currentStep === step.id
                            const isPast = !isCurrent && (
                                (step.id === 'verify' && currentStep === 'success') ||
                                (step.id === 'account' && currentStep !== 'account')
                            )
                            const isFuture = !isCurrent && !isPast

                            return (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                            isCurrent
                                                ? 'bg-primary text-white'
                                                : isPast
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {isFuture ? stepNumber : <CheckCircle className="w-4 h-4" />}
                                    </div>
                                    {index < Object.values(STEP_DATA).length - 1 && (
                                        <div
                                            className={`h-1 w-8 ${
                                                isPast || (isCurrent && step.id === 'account')
                                                    ? 'bg-primary'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                    <p className={`text-xs mt-1 font-medium ${
                                        isCurrent ? 'text-primary' : isPast ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                            {currentStep === 'account' && <UserPlus className="w-8 h-8 text-primary" />}
                            {currentStep === 'verify' && <Mail className="w-8 h-8 text-primary" />}
                            {currentStep === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {STEP_DATA[currentStep].title}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {currentStep === 'account' && 'Buat akun Anda untuk memulai'}
                            {currentStep === 'verify' && 'Verifikasi nomor WhatsApp Anda'}
                            {currentStep === 'success' && 'Selamat datang di CepetDeal!'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {currentStep === 'account' && (
                        <>
                            <div className="space-y-4">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="john_doe123"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                            3-20 karakter, huruf & angka saja
                                        </p>
                                        {usernameStatus === 'checking' && (
                                            <span className="text-xs text-gray-400">Memeriksa...</span>
                                        )}
                                        {usernameStatus === 'available' && (
                                            <span className="text-xs text-green-600">✓ Tersedia</span>
                                        )}
                                        {usernameStatus === 'taken' && (
                                            <span className="text-xs text-red-500">✗ Tidak tersedia</span>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (Opsional)
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Untuk pemulihan password
                                    </p>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Minimal 8 karakter"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Huruf kapital, huruf kecil, & angka
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password *
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Ulangi password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Daftar Sebagai *
                                    </label>
                                    <div className="space-y-2">
                                        {ROLES.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setSelectedRole(role.id as 'BUYER' | 'SELLER')}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                    selectedRole === role.id
                                                        ? role.color + ' border-current ring-2 ring-offset-2'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 ${role.iconBg} rounded-lg flex items-center justify-center text-lg`}>
                                                        {role.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${role.titleColor}`}>
                                                            {role.label}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {role.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="pt-2">
                                    <TermsCheckbox
                                        checked={termsAccepted}
                                        onChange={setTermsAccepted}
                                        error={termsError}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <Button
                                onClick={handleCreateAccount}
                                className="w-full mt-6"
                                size="lg"
                                isLoading={isLoading}
                                disabled={
                                    !formData.username ||
                                    !formData.password ||
                                    formData.password !== formData.confirmPassword ||
                                    usernameStatus !== 'available'
                                }
                            >
                                Lanjut →
                            </Button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Sudah punya akun?{' '}
                                    <Link href="/login" className="text-primary font-medium hover:underline">
                                        Masuk di sini
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}

                    {/* Step 2: Verify Phone */}
                    {currentStep === 'verify' && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">
                                            Username: {registeredUsername}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Silakan verifikasi nomor WhatsApp Anda
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!otpData.sent && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor WhatsApp *
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="+628123456789"
                                            value={phone}
                                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Format: +62812xxxx atau 0812xxxx
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleSendOtp}
                                        className="w-full"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={!phone || phone.length < 11}
                                    >
                                        Kirim OTP →
                                    </Button>
                                </div>
                            )}

                            {otpData.sent && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode OTP
                                        </label>
                                        <div className="flex gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <input
                                                    key={i}
                                                    id={`register-otp-${i}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    className="flex-1 min-w-[40px] h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                    value={otpData.code[i] || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (!/^\d*$/.test(value)) return
                                                        const newCode = otpData.code.split('')
                                                        newCode[i] = value
                                                        setOtpData({ ...otpData, code: newCode.join('') })
                                                        if (value && i < 5) {
                                                            const nextInput = document.getElementById(`register-otp-${i + 1}`)
                                                            nextInput?.focus()
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        // Handle backspace - move to previous input
                                                        if (e.key === 'Backspace' && !otpData.code[i] && i > 0) {
                                                            const prevInput = document.getElementById(`register-otp-${i - 1}`)
                                                            prevInput?.focus()
                                                        }
                                                        // Handle arrow keys
                                                        if (e.key === 'ArrowLeft' && i > 0) {
                                                            const prevInput = document.getElementById(`register-otp-${i - 1}`)
                                                            prevInput?.focus()
                                                        }
                                                        if (e.key === 'ArrowRight' && i < 5) {
                                                            const nextInput = document.getElementById(`register-otp-${i + 1}`)
                                                            nextInput?.focus()
                                                        }
                                                    }}
                                                    onPaste={(e) => {
                                                        e.preventDefault()
                                                        const pastedData = e.clipboardData.getData('text')
                                                        const digits = pastedData.replace(/\D/g, '').slice(0, 6)
                                                        if (digits.length > 0) {
                                                            setOtpData({ ...otpData, code: digits.padEnd(6, ' ') })
                                                            // Focus the next empty input or the last one
                                                            const nextEmpty = Math.min(digits.length, 5)
                                                            setTimeout(() => {
                                                                const input = document.getElementById(`register-otp-${nextEmpty}`)
                                                                input?.focus()
                                                            }, 0)
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleVerifyOtp}
                                        className="w-full"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={otpData.code.length !== 6}
                                    >
                                        Verifikasi & Buat Akun →
                                    </Button>

                                    {/* Resend OTP */}
                                    <div className="text-center">
                                        {otpData.countdown > 0 ? (
                                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Kirim ulang dalam {formatCountdown(otpData.countdown)}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleResendOtp}
                                                disabled={!otpData.canResend || isLoading}
                                                className="text-sm text-primary hover:underline flex items-center justify-center gap-1 disabled:opacity-50"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Kirim ulang OTP
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={goBack}
                                className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali
                            </button>
                        </>
                    )}

                    {/* Step 3: Success */}
                    {currentStep === 'success' && (
                        <>
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Registrasi Berhasil!
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        Akun Anda telah berhasil dibuat
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        <strong>Username:</strong> {registeredUsername}<br />
                                        <strong>Role:</strong> {selectedRole === 'BUYER' ? 'Pembeli' : 'Penjual'}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-500">
                                    Mengarahkan ke dashboard...
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Terms Bottom Sheet (Mobile) */}
                <TermsBottomSheet
                    isOpen={showTermsBottomSheet}
                    onClose={() => setShowTermsBottomSheet(false)}
                />
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return <RegisterForm />
}
