'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Building2,
    Upload,
    X,
    FileText,
    CheckCircle,
    Mail,
    UserPlus,
    ArrowLeft,
    ChevronRight,
    Clock,
    RefreshCw,
    AlertCircle,
    Shield,
} from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { formatWhatsApp } from '@/lib/validation'

const CITIES = [
    'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
    'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor',
    'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Denpasar',
    'Yogyakarta', 'Malang', 'Palembang', 'Balikpapan', 'Samarinda',
]

const DOCUMENT_TYPES = [
    { id: 'siup', label: 'SIUP (Surat Izin Usaha Perdagangan)', required: true },
    { id: 'npwp', label: 'NPWP (Nomor Pokok Wajib Pajak)', required: true },
    { id: 'tdp', label: 'TDP (Tanda Daftar Perusahaan)', required: false },
]

interface FormData {
    // User info
    name: string
    phone: string
    email: string

    // Dealer info
    companyName: string
    address: string
    city: string
    description: string
    logo: string

    // Documents
    documents: {
        siup: string
        npwp: string
        tdp: string
    }
}

interface DealerApp {
    id: string
    name: string
    phone: string
    email: string
    companyName: string
    address: string
    city: string
    description: string
    logo: string
    documents: string[]
}

const STEPS = {
    form: { id: 'form', title: 'Formulir Aplikasi', icon: FileText },
    otp: { id: 'otp', title: 'Verifikasi WhatsApp', icon: Mail },
    success: { id: 'success', title: 'Aplikasi Terkirim!', icon: CheckCircle },
}

export default function DealerApplyPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<'form' | 'otp' | 'success'>('form')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: '',
        companyName: '',
        address: '',
        city: '',
        description: '',
        logo: '',
        documents: {
            siup: '',
            npwp: '',
            tdp: '',
        },
    })

    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }[]>({})

    const [otpData, setOtpData] = useState({
        code: '',
        countdown: 0,
        canResend: false,
    })

    const [applicationId, setApplicationId] = useState<string | null>(null)

    // Countdown timer for resend
    useEffect(() => {
        if (otpData.countdown > 0) {
            const timer = setTimeout(() => {
                setOtpData(prev => ({ ...prev, countdown: prev.countdown - 1 }))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [otpData.countdown])

    // Format phone input
    const formatPhoneNumber = (value: string) => {
        let cleaned = value.replace(/[^\d]/g, '')
        if (cleaned.startsWith('08')) {
            cleaned = '62' + cleaned.substring(1)
        }
        return '+' + cleaned
    }

    const handlePhoneChange = (value: string) => {
        setFormData({ ...formData, phone: formatPhoneNumber(value) })
    }

    // Handle file upload
    const handleFileUpload = (docType: 'siup' | 'npwp' | 'tdp', file: File) => {
        // In production, upload to Cloudinary/S3
        // For now, use local object URL
        const url = URL.createObjectURL(file)
        setUploadedFiles(prev => ({
            ...prev,
            [docType]: [...(prev[docType] || []), file],
        }))
        setFormData({
            ...formData,
            documents: {
                ...formData.documents,
                [docType]: url,
            },
        })
    }

    const removeFile = (docType: 'siup' | 'npwp' | 'tdp') => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev }
            if (newFiles[docType]) {
                newFiles[docType] = []
            }
            return newFiles
        })
        setFormData({
            ...formData,
            documents: {
                ...formData.documents,
                [docType]: '',
            },
        })
    }

    // Step 1: Submit form & send OTP
    const handleSubmitForm = async () => {
        // Validate required fields
        if (!formData.name || formData.name.trim().length < 2) {
            setError('Nama minimal 2 karakter')
            return
        }

        if (!formData.phone || !formatWhatsApp(formData.phone)) {
            setError('Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx')
            return
        }

        if (!formData.companyName || formData.companyName.trim().length < 2) {
            setError('Nama perusahaan minimal 2 karakter')
            return
        }

        if (!formData.address || formData.address.trim().length < 5) {
            setError('Alamat harus diisi lengkap')
            return
        }

        if (!formData.city) {
            setError('Kota harus dipilih')
            return
        }

        // Check required documents
        if (!uploadedFiles.siup) {
            setError('SIUP wajib diupload')
            return
        }

        if (!uploadedFiles.npwp) {
            setError('NPWP wajib diupload')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // First, create the dealer application
            const res = await fetch('/api/dealers/apply-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    companyName: formData.companyName,
                    address: formData.address,
                    city: formData.city,
                    description: formData.description,
                    logo: formData.logo,
                    documents: Object.values(formData.documents).filter(Boolean),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim aplikasi')
            }

            // Show OTP in development
            if (data.dummyOtp) {
                alert(`OTP DUMMY: ${data.dummyOtp}\n(Gunakan kode ini untuk verifikasi)`)
            } else {
                alert('OTP dikirim ke WhatsApp Anda')
            }

            // Set application ID for verification
            setApplicationId(data.applicationId)

            // Set countdown for resend (30 seconds)
            setOtpData({ ...otpData, countdown: 30, canResend: false })

            // Enable resend after countdown
            setTimeout(() => {
                setOtpData(prev => ({ ...prev, canResend: true }))
            }, 30000)

            // Move to OTP step
            setCurrentStep('otp')

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim aplikasi')
        } finally {
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (!applicationId) return

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/dealers/apply-public/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim ulang OTP')
            }

            if (data.dummyOtp) {
                alert(`OTP DUMMY (NEW): ${data.dummyOtp}\n(Gunakan kode baru ini untuk verifikasi)`)
            } else {
                alert('OTP baru dikirim ke WhatsApp Anda')
            }

            // Reset countdown
            setOtpData({ ...otpData, countdown: 30, canResend: false })

            setTimeout(() => {
                setOtpData(prev => ({ ...prev, canResend: true }))
            }, 30000)

        } catch (err: any) {
            setError(err.message || 'Gagal mengirim ulang OTP')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP and create account
    const handleVerifyOtp = async () => {
        if (!otpData.code || otpData.code.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/dealers/apply-public/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                    code: otpData.code,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'OTP tidak valid')
            }

            // Success! Move to success step
            setCurrentStep('success')

            // Auto-login and redirect after 3 seconds
            setTimeout(() => {
                router.push('/dashboard?registered=true')
            }, 3000)

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

    const goBack = () => {
        if (currentStep === 'otp') {
            setCurrentStep('form')
            setError('')
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-3xl">
                {/* Back Button */}
                <div className="mb-4">
                    <button
                        onClick={goBack}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-center gap-3">
                        {Object.values(STEPS).map((step, index) => {
                            const stepNumber = index + 1
                            const isCurrent = currentStep === step.id
                            const isPast = !isCurrent && (
                                (step.id === 'form' && currentStep !== 'form') ||
                                (step.id === 'otp' && currentStep === 'success')
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
                                    {index < Object.values(STEPS).length - 1 && (
                                        <div
                                            className={`h-1 w-8 ${
                                                isPast || (isCurrent && step.id === 'form')
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
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Application Form */}
                {currentStep === 'form' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary">
                            Daftar sebagai Dealer
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Kelola showroom Anda di CepetDeal dengan mudah
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Section: User Info */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-secondary mb-4">Data Diri Pemilik</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama lengkap pemilik"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        WhatsApp *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+628123456789"
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: +62812xxxx atau 0812xxxx
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (opsional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="email@contoh.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Showroom Info */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-secondary mb-4">Data Showroom</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Perusahaan/Showroom *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Auto Prima Motor"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kota *
                                    </label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    >
                                        <option value="">Pilih kota</option>
                                        {CITIES.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Lengkap *
                                    </label>
                                    <textarea
                                        placeholder="Alamat lengkap showroom..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi Showroom (opsional)
                                    </label>
                                    <textarea
                                        placeholder="Deskripsi singkat tentang showroom..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Documents */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-secondary mb-4">
                                Dokumen Upload *
                                <span className="text-xs font-normal text-gray-500">
                                    (SIUP & NPWP wajib)
                                </span>
                            </h2>
                            <div className="space-y-4">
                                {DOCUMENT_TYPES.map((doc) => (
                                    <div key={doc.id}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {doc.label}
                                            {doc.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        handleFileUpload(doc.id as 'siup' | 'npwp' | 'tdp', file)
                                                    }
                                                }}
                                                className="flex-1 min-w-0"
                                            />
                                            {uploadedFiles[doc.id] && (
                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                                        {uploadedFiles[doc.id]?.[0]?.name || 'Uploaded'}
                                                    </span>
                                                    <button
                                                        onClick={() => removeFile(doc.id as 'siup' | 'npwp' | 'tdp')}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmitForm}
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Kirim Aplikasi & Kirim OTP →
                        </Button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                )}

                {/* Step 2: OTP Verification */}
                {currentStep === 'otp' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary">
                            Verifikasi WhatsApp
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Masukkan kode OTP yang dikirim ke WhatsApp
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">
                                    OTP dikirim ke WhatsApp
                                </p>
                                <p className="text-xs text-blue-600">
                                    {formData.phone}
                                </p>
                            </div>
                        </div>
                    </div>

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
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="w-full h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={otpData.code[i] || ''}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (!/^\d*$/.test(value)) return
                                            const newCode = otpData.code.split('')
                                            newCode[i] = value
                                            setOtpData({ ...otpData, code: newCode.join('') })
                                            if (value && i < 5) {
                                                const nextInput = document.getElementById(`otp-${i + 1}`)
                                                nextInput?.focus()
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        )}

                        {/* Verify Button */}
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

                        {/* Back Button */}
                        <button
                            onClick={goBack}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </button>
                    </div>
                </div>
                )}

                {/* Step 3: Success */}
                {currentStep === 'success' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-secondary">
                                    Aplikasi Dealer Berhasil Dikirim!
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Akun Anda telah berhasil dibuat dan aplikasi dealer sedang ditinjau oleh admin.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-blue-800">
                                            Status: Menunggu Verifikasi
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Admin akan memverifikasi aplikasi Anda dalam 1-3 hari kerja.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-gray-500">
                                Mengarahkan ke dashboard dalam beberapa saat...
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
