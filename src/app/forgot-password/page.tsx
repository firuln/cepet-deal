'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Smartphone, ArrowLeft, Lock, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

function ForgotPasswordForm() {
    const router = useRouter()
    const [method, setMethod] = useState<'choice' | 'email' | 'whatsapp'>('choice')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Email flow state
    const [emailData, setEmailData] = useState({
        email: '',
        resetToken: '',
    })

    // WhatsApp flow state
    const [whatsappData, setWhatsAppData] = useState({
        phone: '',
        otpCode: '',
        countdown: 0,
        canResend: false,
        sent: false, // Track if OTP has been sent
    })

    const [resetSuccess, setResetSuccess] = useState(false)

    // Countdown for OTP resend
    useEffect(() => {
        if (whatsappData.countdown > 0) {
            const timer = setTimeout(() => {
                setWhatsAppData(prev => ({ ...prev, countdown: prev.countdown - 1 }))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [whatsappData.countdown])

    // Auto-focus first OTP input when sent
    useEffect(() => {
        if (whatsappData.sent) {
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0')
                firstInput?.focus()
            }, 100)
        }
    }, [whatsappData.sent])

    // Format phone input
    const formatPhoneNumber = (value: string) => {
        let cleaned = value.replace(/[^\d]/g, '')
        if (cleaned.startsWith('08')) {
            cleaned = '62' + cleaned.substring(1)
        }
        return '+' + cleaned
    }

    // Email flow: Send reset link
    const handleSendEmailLink = async () => {
        if (!emailData.email || emailData.email.trim().length < 1) {
            setError('Email wajib diisi')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(emailData.email)) {
            setError('Format email tidak valid')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailData.email,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim email reset')
            }

            setResetSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim email reset')
        } finally {
            setIsLoading(false)
        }
    }

    // WhatsApp flow: Send OTP
    const handleSendOtp = async () => {
        if (!whatsappData.phone || whatsappData.phone.length < 11) {
            setError('Nomor WhatsApp tidak valid')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: whatsappData.phone,
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

            setWhatsAppData({
                ...whatsappData,
                countdown: 30,
                canResend: false,
                sent: true,
            })

            setTimeout(() => {
                setWhatsAppData(prev => ({ ...prev, canResend: true }))
            }, 30000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim OTP')
        } finally {
            setIsLoading(false)
        }
    }

    // WhatsApp flow: Resend OTP
    const handleResendOtp = async () => {
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: whatsappData.phone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim ulang OTP')
            }

            if (data.dummyOtp) {
                alert(`OTP DUMMY (NEW): ${data.dummyOtp}`)
            }

            setWhatsAppData({
                ...whatsappData,
                countdown: 30,
                canResend: false,
                sent: true,
            })

            setTimeout(() => {
                setWhatsAppData(prev => ({ ...prev, canResend: true }))
            }, 30000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim ulang OTP')
        } finally {
            setIsLoading(false)
        }
    }

    // WhatsApp flow: Verify OTP & redirect to reset page
    const handleVerifyOtp = async () => {
        if (!whatsappData.otpCode || whatsappData.otpCode.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: whatsappData.phone,
                    otp: whatsappData.otpCode,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'OTP tidak valid')
            }

            // Redirect to reset password page with token
            router.push(`/reset-password?token=${data.resetToken}&method=whatsapp`)

        } catch (err: any) {
            setError(err.message || 'Gagal memverifikasi OTP')
        } finally {
            setIsLoading(false)
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
                {/* Back Button */}
                <div className="mb-4">
                    <Link
                        href="/login"
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Login
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Lupa Password</h1>
                        <p className="text-gray-500 mt-2">
                            Pilih metode untuk mereset password Anda
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Choice: Email or WhatsApp */}
                    {method === 'choice' && (
                        <>
                            <div className="space-y-3">
                                {/* Email Option */}
                                <button
                                    onClick={() => setMethod('email')}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <Mail className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Via Email</p>
                                            <p className="text-sm text-gray-500">Kirim link reset ke email</p>
                                        </div>
                                    </div>
                                </button>

                                {/* WhatsApp Option */}
                                <button
                                    onClick={() => setMethod('whatsapp')}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <Smartphone className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Via WhatsApp</p>
                                            <p className="text-sm text-gray-500">Kirim OTP ke WhatsApp</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Email Method */}
                    {method === 'email' && (
                        <>
                            {!resetSuccess ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Anda
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="nama@email.com"
                                            value={emailData.email}
                                            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSendEmailLink}
                                        className="w-full"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={!emailData.email}
                                    >
                                        Kirim Link Reset
                                    </Button>

                                    <button
                                        onClick={() => setMethod('choice')}
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            Email Terkirim!
                                        </h2>
                                        <p className="text-gray-600 mt-2">
                                            Link reset password telah dikirim ke <strong>{emailData.email}</strong>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Silakan check inbox atau folder spam.
                                        </p>
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        Link akan kadaluarsa dalam 1 jam.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* WhatsApp Method */}
                    {method === 'whatsapp' && (
                        <>
                            {!whatsappData.sent && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor WhatsApp
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="+628123456789"
                                            value={whatsappData.phone}
                                            onChange={(e) => setWhatsAppData({ ...whatsappData, phone: formatPhoneNumber(e.target.value) })}
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
                                        disabled={!whatsappData.phone || whatsappData.phone.length < 11}
                                    >
                                        Kirim OTP
                                    </Button>

                                    <button
                                        onClick={() => setMethod('choice')}
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali
                                    </button>
                                </div>
                            )}

                            {whatsappData.sent && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                        <div className="flex items-start gap-2">
                                            <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">
                                                    OTP dikirim ke WhatsApp
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    {whatsappData.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode OTP
                                        </label>
                                        <div className="flex gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <input
                                                    key={i}
                                                    id={`otp-${i}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    className="flex-1 min-w-[40px] h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                    value={whatsappData.otpCode[i] || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (!/^\d*$/.test(value)) return
                                                        const newCode = whatsappData.otpCode.split('')
                                                        newCode[i] = value
                                                        setWhatsAppData({ ...whatsappData, otpCode: newCode.join('') })
                                                        if (value && i < 5) {
                                                            const nextInput = document.getElementById(`otp-${i + 1}`)
                                                            nextInput?.focus()
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        // Handle backspace - move to previous input
                                                        if (e.key === 'Backspace' && !whatsappData.otpCode[i] && i > 0) {
                                                            const prevInput = document.getElementById(`otp-${i - 1}`)
                                                            prevInput?.focus()
                                                        }
                                                        // Handle arrow keys
                                                        if (e.key === 'ArrowLeft' && i > 0) {
                                                            const prevInput = document.getElementById(`otp-${i - 1}`)
                                                            prevInput?.focus()
                                                        }
                                                        if (e.key === 'ArrowRight' && i < 5) {
                                                            const nextInput = document.getElementById(`otp-${i + 1}`)
                                                            nextInput?.focus()
                                                        }
                                                    }}
                                                    onPaste={(e) => {
                                                        e.preventDefault()
                                                        const pastedData = e.clipboardData.getData('text')
                                                        const digits = pastedData.replace(/\D/g, '').slice(0, 6)
                                                        if (digits.length > 0) {
                                                            setWhatsAppData({ ...whatsappData, otpCode: digits.padEnd(6, ' ') })
                                                            // Focus the next empty input or the last one
                                                            const nextEmpty = Math.min(digits.length, 5)
                                                            setTimeout(() => {
                                                                const input = document.getElementById(`otp-${nextEmpty}`)
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
                                        disabled={whatsappData.otpCode.length !== 6}
                                    >
                                        Verifikasi & Reset Password →
                                    </Button>

                                    {/* Resend OTP */}
                                    <div className="text-center">
                                        {whatsappData.countdown > 0 ? (
                                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Kirim ulang dalam {formatCountdown(whatsappData.countdown)}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleResendOtp}
                                                disabled={!whatsappData.canResend || isLoading}
                                                className="text-sm text-primary hover:underline flex items-center justify-center gap-1 disabled:opacity-50"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Kirim ulang OTP
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setMethod('choice')}
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Kembali
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />
}
