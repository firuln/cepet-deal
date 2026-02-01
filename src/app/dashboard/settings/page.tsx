'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User,
    MapPin,
    Building2,
    Mail,
    Phone,
    MessageCircle,
    Camera,
    Shield,
    Clock,
    Save,
    X,
    XCircle,
    Check,
    Car,
    Eye,
    Star,
    ArrowLeft,
    Loader2,
    KeyRound,
    Lock,
    Edit,
    AlertCircle,
    FileText,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import Image from 'next/image'

interface UserProfile {
    id: string
    name: string
    email: string
    username?: string
    usernameUpdatedAt?: string
    phone?: string
    whatsapp?: string
    location?: string
    bio?: string
    avatar?: string
    role: string
    dealer?: {
        id?: string
        companyName?: string
        address?: string
        verified?: boolean
        companyNameEditCount?: number
        companyNameEditedAt?: string
    }
}

interface FormData {
    name: string
    username: string
    location: string
    bio: string
    phone: string
    whatsapp: string
    email: string
    showroomName: string
    address: string
    city: string
    responseTime: string
    businessHours: {
        monday: { open: string; close: string; enabled: boolean }
        tuesday: { open: string; close: string; enabled: boolean }
        wednesday: { open: string; close: string; enabled: boolean }
        thursday: { open: string; close: string; enabled: boolean }
        friday: { open: string; close: string; enabled: boolean }
        saturday: { open: string; close: string; enabled: boolean }
        sunday: { open: string; close: string; enabled: boolean }
    }
}

interface UsernameUpdateInfo {
    canUpdate: boolean
    hasUsername: boolean
    currentUsername?: string
    lastUpdated?: string
    daysSinceLastUpdate?: number
    remainingDays?: number
    nextUpdateDate?: string
    message: string
}

const DAYS = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' },
]

type TabType = 'profile' | 'contact' | 'security' | 'business' | 'response' | 'verification'

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [showroomNameStatus, setShowroomNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [showroomNameError, setShowroomNameError] = useState('')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isEditingShowroomName, setIsEditingShowroomName] = useState(false)

    // Username update info
    const [usernameInfo, setUsernameInfo] = useState<UsernameUpdateInfo | null>(null)
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

    // Phone change modal state
    const [showPhoneModal, setShowPhoneModal] = useState(false)
    const [phoneModalStep, setPhoneModalStep] = useState<'input' | 'otp'>('input')
    const [newPhone, setNewPhone] = useState('')
    const [phoneOtp, setPhoneOtp] = useState('')
    const [phoneOtpSent, setPhoneOtpSent] = useState(false)
    const [phoneOtpCountdown, setPhoneOtpCountdown] = useState(0)
    const [phoneError, setPhoneError] = useState('')
    const [phoneLoading, setPhoneLoading] = useState(false)

    // Seller verification state
    const [sellerVerificationStatus, setSellerVerificationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null)
    const [sellerVerificationData, setSellerVerificationData] = useState<any>(null)
    const [isSellerVerified, setIsSellerVerified] = useState(false)
    const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
    const [verificationError, setVerificationError] = useState('')
    const [verificationSuccess, setVerificationSuccess] = useState(false)

    // Verification form state
    const [verificationForm, setVerificationForm] = useState({
        identityType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
        idCardNumber: '',
        taxIdNumber: '',
        businessName: '',
        businessAddress: '',
    })
    const [verificationFiles, setVerificationFiles] = useState({
        ktpDocument: null as File | null,
        selfieDocument: null as File | null,
        npwpDocument: null as File | null,
        businessDocument: null as File | null,
    })

    const [formData, setFormData] = useState<FormData>({
        name: '',
        username: '',
        location: '',
        bio: '',
        phone: '',
        whatsapp: '',
        email: '',
        showroomName: '',
        address: '',
        city: '',
        responseTime: '2',
        businessHours: {
            monday: { open: '09:00', close: '17:00', enabled: true },
            tuesday: { open: '09:00', close: '17:00', enabled: true },
            wednesday: { open: '09:00', close: '17:00', enabled: true },
            thursday: { open: '09:00', close: '17:00', enabled: true },
            friday: { open: '09:00', close: '17:00', enabled: true },
            saturday: { open: '09:00', close: '15:00', enabled: true },
            sunday: { open: '00:00', close: '00:00', enabled: false },
        },
    })

    // Fetch user profile and username update info on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                const profileRes = await fetch('/api/users/me')
                if (profileRes.ok) {
                    const data = await profileRes.json()
                    setUserProfile(data)
                    setFormData(prev => ({
                        ...prev,
                        name: data.name || '',
                        username: data.username || '',
                        location: data.location || '',
                        bio: data.bio || '',
                        phone: data.phone || '',
                        whatsapp: data.whatsapp || '',
                        email: data.email || '',
                        showroomName: data.dealer?.companyName || '',
                        address: data.dealer?.address || '',
                        city: data.dealer?.city || '',
                    }))
                    setAvatarPreview(data.avatar || null)
                }

                // Fetch username update info
                const usernameRes = await fetch('/api/users/me/can-update-username')
                if (usernameRes.ok) {
                    const info = await usernameRes.json()
                    setUsernameInfo(info)
                }

                // Fetch seller verification status
                const verificationRes = await fetch('/api/seller/verification/status')
                if (verificationRes.ok) {
                    const verificationData = await verificationRes.json()
                    setSellerVerificationStatus(verificationData.status)
                    setIsSellerVerified(verificationData.isSellerVerified)
                    setSellerVerificationData(verificationData)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Phone OTP countdown
    useEffect(() => {
        if (phoneOtpCountdown > 0) {
            const timer = setTimeout(() => {
                setPhoneOtpCountdown(prev => prev - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [phoneOtpCountdown])

    // Debounced username check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.username && formData.username.length >= 3 && usernameInfo?.canUpdate) {
                const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
                if (!usernameRegex.test(formData.username)) {
                    setUsernameStatus('taken')
                    return
                }

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
    }, [formData.username, usernameInfo])

    const handleSave = async () => {
        setSaveStatus('saving')
        setErrorMessage('')

        try {
            // Validate email if changed
            if (formData.email && formData.email !== userProfile?.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(formData.email)) {
                    throw new Error('Format email tidak valid')
                }
            }

            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    location: formData.location,
                    bio: formData.bio,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    avatar: avatarPreview,
                    // Note: showroomName, address, city are saved separately via dealer profile API
                    showroomAddress: formData.address,
                    showroomCity: formData.city,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menyimpan profil')
            }

            setSaveStatus('saved')
            // Refresh username info after update
            const usernameRes = await fetch('/api/users/me/can-update-username')
            if (usernameRes.ok) {
                const info = await usernameRes.json()
                setUsernameInfo(info)
            }

            // Update session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: formData.name,
                    avatar: avatarPreview || session?.user?.avatar,
                }
            })
            setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (error: any) {
            setSaveStatus('error')
            setErrorMessage(error.message || 'Gagal menyimpan profil')
        }
    }

    const handleSaveShowroomName = async () => {
        if (!isDealer) return

        setShowroomNameStatus('saving')
        setShowroomNameError('')

        try {
            const res = await fetch('/api/dealer/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: formData.showroomName,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.canEdit === false) {
                    throw new Error(data.error || 'Nama showroom hanya dapat diubah 1 kali')
                }
                throw new Error(data.error || 'Gagal mengubah nama showroom')
            }

            setShowroomNameStatus('saved')
            setIsEditingShowroomName(false)

            // Refresh user profile to get updated edit count
            const profileRes = await fetch('/api/users/me')
            if (profileRes.ok) {
                const profileData = await profileRes.json()
                setUserProfile(profileData)
            }

            setTimeout(() => setShowroomNameStatus('idle'), 2000)
        } catch (error: any) {
            setShowroomNameStatus('error')
            setShowroomNameError(error.message || 'Gagal mengubah nama showroom')
        }
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Phone change with OTP
    const openPhoneModal = () => {
        setShowPhoneModal(true)
        setPhoneModalStep('input')
        setNewPhone('')
        setPhoneOtp('')
        setPhoneError('')
    }

    const handleSendPhoneOtp = async () => {
        setPhoneLoading(true)
        setPhoneError('')

        try {
            const res = await fetch('/api/users/me/change-phone/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: newPhone }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP')
            }

            setPhoneModalStep('otp')
            setPhoneOtpSent(true)
            setPhoneOtpCountdown(5 * 60) // 5 minutes

            if (data.dummyOtp) {
                alert(`OTP DUMMY: ${data.dummyOtp}`)
            }
        } catch (error: any) {
            setPhoneError(error.message || 'Gagal mengirim OTP')
        } finally {
            setPhoneLoading(false)
        }
    }

    const handleVerifyPhoneOtp = async () => {
        setPhoneLoading(true)
        setPhoneError('')

        try {
            const res = await fetch('/api/users/me/change-phone/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: phoneOtp,
                    newPhone: newPhone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'OTP tidak valid')
            }

            // Update formData with new phone
            updateField('whatsapp', newPhone)
            setShowPhoneModal(false)

            // Show success
            setErrorMessage('')
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (error: any) {
            setPhoneError(error.message || 'Gagal memverifikasi OTP')
        } finally {
            setPhoneLoading(false)
        }
    }

    const formatPhoneCooldown = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Seller verification submit handler
    const handleVerificationSubmit = async () => {
        setIsSubmittingVerification(true)
        setVerificationError('')
        setVerificationSuccess(false)

        try {
            // Validate required fields
            if (!verificationForm.idCardNumber.trim()) {
                throw new Error('Nomor KTP wajib diisi')
            }

            if (!verificationFiles.ktpDocument) {
                throw new Error('Dokumen KTP wajib diupload')
            }

            if (!verificationFiles.selfieDocument) {
                throw new Error('Foto selfie dengan KTP wajib diupload')
            }

            if (verificationForm.identityType === 'BUSINESS') {
                if (!verificationForm.businessName.trim()) {
                    throw new Error('Nama usaha wajib diisi untuk jenis identitas Badan Usaha')
                }
                if (!verificationForm.businessAddress.trim()) {
                    throw new Error('Alamat usaha wajib diisi untuk jenis identitas Badan Usaha')
                }
            }

            // Create FormData for file upload
            const formDataToSend = new FormData()
            formDataToSend.append('identityType', verificationForm.identityType)
            formDataToSend.append('idCardNumber', verificationForm.idCardNumber.trim())
            if (verificationForm.taxIdNumber.trim()) {
                formDataToSend.append('taxIdNumber', verificationForm.taxIdNumber.trim())
            }
            if (verificationForm.identityType === 'BUSINESS') {
                formDataToSend.append('businessName', verificationForm.businessName.trim())
                formDataToSend.append('businessAddress', verificationForm.businessAddress.trim())
            }
            if (verificationFiles.ktpDocument) {
                formDataToSend.append('ktpDocument', verificationFiles.ktpDocument)
            }
            if (verificationFiles.selfieDocument) {
                formDataToSend.append('selfieDocument', verificationFiles.selfieDocument)
            }
            if (verificationFiles.npwpDocument) {
                formDataToSend.append('npwpDocument', verificationFiles.npwpDocument)
            }
            if (verificationFiles.businessDocument) {
                formDataToSend.append('businessDocument', verificationFiles.businessDocument)
            }

            const res = await fetch('/api/seller/verification/request', {
                method: 'POST',
                body: formDataToSend,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim pengajuan verifikasi')
            }

            setVerificationSuccess(true)
            setSellerVerificationStatus('PENDING')

            // Reset form
            setTimeout(() => {
                ;(async () => {
                    setVerificationSuccess(false)
                    // Refresh verification status
                    const verificationRes = await fetch('/api/seller/verification/status')
                    if (verificationRes.ok) {
                        const verificationData = await verificationRes.json()
                        setSellerVerificationStatus(verificationData.status)
                        setSellerVerificationData(verificationData)
                    }
                })()
            }, 3000)

        } catch (error: any) {
            setVerificationError(error.message || 'Gagal mengirim pengajuan verifikasi')
        } finally {
            setIsSubmittingVerification(false)
        }
    }

    const displayName = formData.showroomName || formData.name
    const displayType = session?.user?.role === 'DEALER' ? 'Dealer' : 'Pribadi'
    const isVerified = userProfile?.dealer?.verified || false
    const isDealer = session?.user?.role === 'DEALER'

    // Define tabs based on role
    const isSeller = session?.user?.role === 'SELLER'

    const tabs = [
        { key: 'profile' as TabType, label: 'Profil', icon: User },
        { key: 'contact' as TabType, label: 'Kontak', icon: MessageCircle },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield },
        ...(isSeller ? [
            { key: 'verification' as TabType, label: 'Verifikasi', icon: Check },
        ] : []),
        ...(isDealer ? [
            { key: 'business' as TabType, label: 'Bisnis', icon: Building2 },
            { key: 'response' as TabType, label: 'Respon', icon: Clock },
        ] : []),
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat profil...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-secondary">Pengaturan Profil</h1>
                                <p className="text-sm text-gray-500">Kelola profil dan tampilan kartu penjual Anda</p>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={saveStatus === 'saving' || activeTab === 'security'}>
                            {saveStatus === 'saving' ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : saveStatus === 'saved' ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Tersimpan
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                    {saveStatus === 'error' && (
                        <div className="mt-3 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container py-6">
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Left Panel - Form */}
                    <div className="flex-1 max-w-2xl">
                        {/* Tabs */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="flex border-b border-gray-200 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                                activeTab === tab.key
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        {/* Avatar Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Foto Profil
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                                    {avatarPreview ? (
                                                        <Image
                                                            src={avatarPreview}
                                                            alt="Avatar"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                            <User className="w-12 h-12 text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                                                        <Camera className="w-4 h-4" />
                                                        Upload Foto
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleAvatarUpload}
                                                        />
                                                    </label>
                                                    {avatarPreview && (
                                                        <button
                                                            onClick={() => setAvatarPreview(null)}
                                                            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            Hapus Foto
                                                        </button>
                                                    )}
                                                    <p className="text-xs text-gray-500">Max 2MB. JPG atau PNG.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Budi Santoso"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Nama untuk tampilan di profil (bisa diubah kapan saja).</p>
                                        </div>

                                        {/* Username with Cooldown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Username
                                            </label>
                                            {usernameInfo?.canUpdate ? (
                                                <>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                                                            @
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => updateField('username', e.target.value)}
                                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                            placeholder="budisantoso"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-xs text-gray-500">3-20 karakter, huruf & angka saja.</p>
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
                                                </>
                                            ) : (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                                        <span className="text-sm font-medium text-gray-700">@{usernameInfo?.currentUsername}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Username dapat diubah dalam {usernameInfo?.remainingDays} hari lagi
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Tersedia pada: {usernameInfo?.nextUpdateDate ? new Date(usernameInfo.nextUpdateDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lokasi
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => updateField('location', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Jakarta Selatan"
                                                />
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio / Deskripsi Singkat
                                            </label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => updateField('bio', e.target.value)}
                                                rows={3}
                                                maxLength={200}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                placeholder="Ceritakan sedikit tentang Anda atau bisnis Anda..."
                                            />
                                            <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/200 karakter</p>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Tab */}
                                {activeTab === 'contact' && (
                                    <div className="space-y-6">
                                        {/* WhatsApp */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No. WhatsApp *
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.whatsapp}
                                                        disabled
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                        placeholder="081234567890"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={openPhoneModal}
                                                    className="flex-shrink-0"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Ubah
                                                </Button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Nomor WhatsApp utama untuk chat dengan pembeli.
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No. Telepon
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => updateField('phone', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="021-12345678"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Nomor telepon kantor/toko (opsional).</p>
                                        </div>

                                        {/* Email (Editable now) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => updateField('email', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="nama@email.com"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Untuk notifikasi dan pemulihan password.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Security Tab (New) */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubah Password</h3>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Ganti password untuk keamanan akun Anda.
                                            </p>
                                            <Link href="/dashboard/settings/change-password">
                                                <Button className="w-full md:w-auto">
                                                    <KeyRound className="w-4 h-4 mr-2" />
                                                    Ubah Password
                                                </Button>
                                            </Link>
                                        </div>

                                        <hr className="border-gray-200" />

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Akun</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-600">Email</span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {userProfile?.email || 'Tidak diatur'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-600">Username</span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        @{userProfile?.username || 'Tidak diatur'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-600">Role</span>
                                                    <Badge variant={isDealer ? 'primary' : 'info'} size="sm">
                                                        {userProfile?.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Business Tab (DEALER only) */}
                                {activeTab === 'business' && isDealer && (
                                    <div className="space-y-6">
                                        {/* Showroom Name with Limited Edits */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Nama Showroom *
                                                </label>
                                                {userProfile?.dealer?.companyNameEditCount === 0 && !isEditingShowroomName && (
                                                    <button
                                                        onClick={() => setIsEditingShowroomName(true)}
                                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                )}
                                            </div>

                                            {/* Warning Box */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-800">
                                                            Nama showroom hanya dapat diubah 1 kali
                                                        </p>
                                                        <p className="text-xs text-amber-700 mt-1">
                                                            Perubahan nama showroom dibatasi untuk keperluan SEO. Pastikan nama yang dimasukkan sudah benar dan sesuai dengan bisnis Anda.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Show last edited info if already edited */}
                                            {userProfile?.dealer?.companyNameEditCount && userProfile.dealer.companyNameEditCount >= 1 && userProfile.dealer.companyNameEditedAt && (
                                                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                                                    <p className="text-sm text-gray-600">
                                                        Nama showroom terakhir diubah pada{' '}
                                                        {new Date(userProfile.dealer.companyNameEditedAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}

                                            <input
                                                type="text"
                                                value={formData.showroomName}
                                                onChange={(e) => updateField('showroomName', e.target.value)}
                                                disabled={!isEditingShowroomName || (userProfile?.dealer?.companyNameEditCount && userProfile.dealer.companyNameEditCount >= 1)}
                                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                    !isEditingShowroomName || (userProfile?.dealer?.companyNameEditCount && userProfile.dealer.companyNameEditCount >= 1)
                                                        ? 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="Auto Space Motor"
                                            />

                                            {/* Edit/Cancel/Save Buttons */}
                                            {isEditingShowroomName && (!userProfile?.dealer?.companyNameEditCount || userProfile.dealer.companyNameEditCount < 1) && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingShowroomName(false)
                                                            setFormData(prev => ({ ...prev, showroomName: userProfile?.dealer?.companyName || '' }))
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                        disabled={showroomNameStatus === 'saving'}
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        onClick={handleSaveShowroomName}
                                                        disabled={showroomNameStatus === 'saving' || !formData.showroomName.trim()}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {showroomNameStatus === 'saving' ? 'Menyimpan...' : 'Simpan Nama'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Show error message */}
                                            {showroomNameStatus === 'error' && showroomNameError && (
                                                <p className="mt-2 text-xs text-red-600">{showroomNameError}</p>
                                            )}

                                            {/* Show success message */}
                                            {showroomNameStatus === 'saved' && (
                                                <p className="mt-2 text-xs text-green-600">Nama showroom berhasil diubah</p>
                                            )}

                                            {!isEditingShowroomName && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {userProfile?.dealer?.companyNameEditCount && userProfile.dealer.companyNameEditCount >= 1
                                                        ? 'Nama showroom sudah tidak dapat diubah.'
                                                        : 'Klik tombol Edit untuk mengubah nama showroom.'
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kota *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Jakarta Selatan"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Kota lokasi showroom.</p>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Alamat Showroom *
                                            </label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                placeholder="Jl. Sudirman No. 123, Kebayoran Baru"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Response Tab (DEALER only) */}
                                {activeTab === 'response' && isDealer && (
                                    <div className="space-y-6">
                                        {/* Response Time */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Waktu Respon Target
                                            </label>
                                            <select
                                                value={formData.responseTime}
                                                onChange={(e) => updateField('responseTime', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="1">1 Jam</option>
                                                <option value="2">2 Jam</option>
                                                <option value="4">4 Jam</option>
                                                <option value="8">8 Jam</option>
                                                <option value="24">24 Jam</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Waktu respon yang ditampilkan di kartu profil.</p>
                                        </div>

                                        {/* Business Hours */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Jam Operasional
                                            </label>
                                            <div className="space-y-3">
                                                {DAYS.map((day) => (
                                                    <div key={day.key} className="flex items-center gap-3">
                                                        <div className="w-24 text-sm">
                                                            <span className="text-gray-700">{day.label}</span>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.businessHours[day.key as keyof typeof formData.businessHours].enabled}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    businessHours: {
                                                                        ...prev.businessHours,
                                                                        [day.key]: {
                                                                            ...prev.businessHours[day.key as keyof typeof prev.businessHours],
                                                                            enabled: e.target.checked
                                                                        }
                                                                    }
                                                                }))
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <input
                                                            type="time"
                                                            value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    businessHours: {
                                                                        ...prev.businessHours,
                                                                        [day.key]: {
                                                                            ...prev.businessHours[day.key as keyof typeof prev.businessHours],
                                                                            open: e.target.value
                                                                        }
                                                                    }
                                                                }))
                                                            }}
                                                            disabled={!formData.businessHours[day.key as keyof typeof formData.businessHours].enabled}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                                        />
                                                        <span className="text-gray-500">-</span>
                                                        <input
                                                            type="time"
                                                            value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    businessHours: {
                                                                        ...prev.businessHours,
                                                                        [day.key]: {
                                                                            ...prev.businessHours[day.key as keyof typeof prev.businessHours],
                                                                            close: e.target.value
                                                                        }
                                                                    }
                                                                }))
                                                            }}
                                                            disabled={!formData.businessHours[day.key as keyof typeof formData.businessHours].enabled}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Tab (SELLER only) */}
                                {activeTab === 'verification' && isSeller && (
                                    <div className="space-y-6">
                                        {/* Verification Status Display */}
                                        {isSellerVerified ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <Check className="w-5 h-5" />
                                                    <span className="font-medium">Akun Anda sudah terverifikasi</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">
                                                    Terverifikasi sejak {sellerVerificationData?.sellerVerifiedAt
                                                        ? new Date(sellerVerificationData.sellerVerifiedAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })
                                                        : '-'}
                                                </p>
                                            </div>
                                        ) : sellerVerificationStatus === 'PENDING' ? (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                                    <Clock className="w-5 h-5" />
                                                    <span className="font-medium">Verifikasi sedang diproses</span>
                                                </div>
                                                <p className="text-sm text-yellow-700">
                                                    Pengajuan verifikasi Anda sedang ditinjau oleh admin. Proses ini biasanya memakan waktu 1-3 hari kerja.
                                                </p>
                                                {sellerVerificationData?.submittedAt && (
                                                    <p className="text-xs text-yellow-600 mt-2">
                                                        Diajukan pada {new Date(sellerVerificationData.submittedAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        ) : sellerVerificationStatus === 'REJECTED' ? (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-red-800 mb-2">
                                                    <XCircle className="w-5 h-5" />
                                                    <span className="font-medium">Verifikasi ditolak</span>
                                                </div>
                                                <p className="text-sm text-red-700">
                                                    {sellerVerificationData?.rejectionReason || 'Pengajuan verifikasi Anda tidak disetujui. Silakan periksa kembali dokumen Anda dan ajukan kembali.'}
                                                </p>
                                            </div>
                                        ) : null}

                                        {/* Verification Form */}
                                        {!isSellerVerified && sellerVerificationStatus !== 'PENDING' && (
                                            <>
                                                {verificationSuccess && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 text-green-800">
                                                            <Check className="w-5 h-5" />
                                                            <span className="font-medium">Pengajuan verifikasi berhasil dikirim</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {verificationError && (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                        <p className="text-sm text-red-800">{verificationError}</p>
                                                    </div>
                                                )}

                                                {/* Identity Type Selection */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Jenis Identitas *
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setVerificationForm(prev => ({ ...prev, identityType: 'INDIVIDUAL' }))}
                                                            className={`flex-1 px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                                                                verificationForm.identityType === 'INDIVIDUAL'
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="font-medium">Perorangan</div>
                                                            <div className="text-xs mt-1 opacity-70">Untuk penjual perseorangan</div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVerificationForm(prev => ({ ...prev, identityType: 'BUSINESS' }))}
                                                            className={`flex-1 px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                                                                verificationForm.identityType === 'BUSINESS'
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="font-medium">Badan Usaha</div>
                                                            <div className="text-xs mt-1 opacity-70">Untuk dealer atau bisnis</div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* KTP Number */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nomor KTP *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={verificationForm.idCardNumber}
                                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, idCardNumber: e.target.value }))}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="16 digit nomor KTP"
                                                        maxLength={16}
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Masukkan 16 digit nomor KTP Anda.</p>
                                                </div>

                                                {/* NPWP Number */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nomor NPWP {verificationForm.identityType === 'INDIVIDUAL' && '(Opsional)'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={verificationForm.taxIdNumber}
                                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, taxIdNumber: e.target.value }))}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="15 digit nomor NPWP"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {verificationForm.identityType === 'BUSINESS'
                                                            ? 'Wajib diisi untuk jenis identitas Badan Usaha.'
                                                            : 'Opsional untuk perorangan.'}
                                                    </p>
                                                </div>

                                                {/* Business Name (for BUSINESS type) */}
                                                {verificationForm.identityType === 'BUSINESS' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Nama Usaha *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={verificationForm.businessName}
                                                                onChange={(e) => setVerificationForm(prev => ({ ...prev, businessName: e.target.value }))}
                                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                                placeholder="Nama usaha atau bisnis Anda"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Alamat Usaha *
                                                            </label>
                                                            <textarea
                                                                value={verificationForm.businessAddress}
                                                                onChange={(e) => setVerificationForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                                                                rows={3}
                                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                                placeholder="Alamat lengkap usaha Anda"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {/* Document Upload Section */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Upload Dokumen *
                                                    </label>
                                                    <div className="space-y-4">
                                                        {/* KTP Document */}
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                                    <span className="font-medium text-gray-700">KTP (Kartu Tanda Penduduk)</span>
                                                                    <span className="text-red-500">*</span>
                                                                </div>
                                                                {verificationFiles.ktpDocument && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setVerificationFiles(prev => ({ ...prev, ktpDocument: null }))}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0]
                                                                    if (file) setVerificationFiles(prev => ({ ...prev, ktpDocument: file }))
                                                                }}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG. Maksimal 5MB.</p>
                                                        </div>

                                                        {/* Selfie with KTP Document */}
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Camera className="w-5 h-5 text-gray-400" />
                                                                    <span className="font-medium text-gray-700">Foto Selfie dengan KTP</span>
                                                                    <span className="text-red-500">*</span>
                                                                </div>
                                                                {verificationFiles.selfieDocument && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setVerificationFiles(prev => ({ ...prev, selfieDocument: null }))}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0]
                                                                    if (file) setVerificationFiles(prev => ({ ...prev, selfieDocument: file }))
                                                                }}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG. Maksimal 5MB. Pastikan wajah dan KTP terlihat jelas.</p>
                                                        </div>

                                                        {/* NPWP Document */}
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                                    <span className="font-medium text-gray-700">NPWP (Nomor Pokok Wajib Pajak)</span>
                                                                </div>
                                                                {verificationFiles.npwpDocument && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setVerificationFiles(prev => ({ ...prev, npwpDocument: null }))}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0]
                                                                    if (file) setVerificationFiles(prev => ({ ...prev, npwpDocument: file }))
                                                                }}
                                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, PDF. Maksimal 5MB.</p>
                                                        </div>

                                                        {/* Business Document (for BUSINESS type) */}
                                                        {verificationForm.identityType === 'BUSINESS' && (
                                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary/50 transition-colors">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                                        <span className="font-medium text-gray-700">Dokumen Usaha</span>
                                                                    </div>
                                                                    {verificationFiles.businessDocument && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setVerificationFiles(prev => ({ ...prev, businessDocument: null }))}
                                                                            className="text-red-500 hover:text-red-700"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0]
                                                                        if (file) setVerificationFiles(prev => ({ ...prev, businessDocument: file }))
                                                                    }}
                                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, PDF. Maksimal 5MB. (Opsional)</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    onClick={handleVerificationSubmit}
                                                    disabled={isSubmittingVerification}
                                                    className="w-full"
                                                >
                                                    {isSubmittingVerification ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Mengirim...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-4 h-4 mr-2" />
                                                            Ajukan Verifikasi
                                                        </>
                                                    )}
                                                </Button>

                                                {/* Info Box */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <div className="text-sm text-blue-800">
                                                            <p className="font-medium mb-1">Informasi Verifikasi</p>
                                                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                                                <li>Pastikan semua dokumen dalam keadaan jelas dan dapat dibaca</li>
                                                                <li>Proses verifikasi memakan waktu 1-3 hari kerja</li>
                                                                <li>Anda akan mendapatkan badge "Terverifikasi" setelah disetujui</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary">Verifikasi Akun</h3>
                                    <p className="text-sm text-gray-500">Tingkatkan kepercayaan pembeli</p>
                                </div>
                            </div>
                            {/* For Dealers - show dealer verification status */}
                            {isDealer && (
                                <>
                                    {isVerified ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <Check className="w-5 h-5" />
                                                <span className="font-medium">Akun Dealer sudah terverifikasi</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-3">Verifikasi akun dealer Anda untuk mendapatkan badge verified dan meningkatkan kepercayaan pembeli.</p>
                                            <Button variant="outline" className="w-full" disabled>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Ajukan Verifikasi Dealer
                                            </Button>
                                            <p className="text-xs text-gray-500 mt-2">Hubungi admin untuk verifikasi dealer</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {/* For Sellers - show seller verification status */}
                            {isSeller && (
                                <>
                                    {isSellerVerified ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <Check className="w-5 h-5" />
                                                <span className="font-medium">Akun Anda sudah terverifikasi</span>
                                            </div>
                                        </div>
                                    ) : sellerVerificationStatus === 'PENDING' ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-800 mb-1">
                                                <Clock className="w-5 h-5" />
                                                <span className="font-medium">Verifikasi sedang diproses</span>
                                            </div>
                                            <p className="text-sm text-yellow-700">Admin akan meninjau pengajuan Anda dalam 1-3 hari kerja.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-3">Verifikasi akun Anda untuk mendapatkan badge verified dan meningkatkan kepercayaan pembeli.</p>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setActiveTab('verification')}
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                Ajukan Verifikasi
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                            {/* For Buyers - show info */}
                            {!isDealer && !isSeller && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Daftar sebagai SELLER atau DEALER untuk mengakses fitur verifikasi.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div className="xl:w-80 flex-shrink-0">
                        <div className="sticky top-20">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-secondary">Live Preview</h3>
                                <p className="text-sm text-gray-500">Tampilan kartu profil Anda</p>
                            </div>

                            {/* Premium Profile Card Preview */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                                {/* Gradient Header */}
                                <div className="bg-gradient-to-r from-primary via-orange-500 to-accent px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">
                                                    {isVerified ? 'VERIFIED DEALER' : isSellerVerified ? 'VERIFIED SELLER' : isSeller ? 'SELLER' : displayType}
                                                </p>
                                                <div className="flex items-center gap-1 text-white/90 text-xs">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>4.8 (128 ulasan)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {/* Avatar & Info */}
                                    <div className="flex flex-col items-center text-center mb-5">
                                        <div className="relative mb-3">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-primary/10">
                                                {avatarPreview ? (
                                                    <Image
                                                        src={avatarPreview}
                                                        alt="Avatar"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                                        <User className="w-12 h-12 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Online Status */}
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-secondary mb-1">{displayName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Badge variant={isDealer ? 'primary' : isSeller ? 'success' : 'info'} size="sm">
                                                {displayType}
                                            </Badge>
                                            {(isVerified || isSellerVerified) && (
                                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                        {formData.location && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>{formData.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-2 mb-5">
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Car className="w-4 h-4 text-primary mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">156</p>
                                            <p className="text-xs text-gray-500">Listing</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Clock className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">{formData.responseTime}jam</p>
                                            <p className="text-xs text-gray-500">Respon</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Check className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">98%</p>
                                            <p className="text-xs text-gray-500">Rate</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                            <p className="text-sm font-bold text-secondary">12k</p>
                                            <p className="text-xs text-gray-500">Views</p>
                                        </div>
                                    </div>

                                    {/* Response Info */}
                                    <div className="bg-blue-50 rounded-lg p-3 mb-5">
                                        <div className="flex items-start gap-2">
                                            <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Chat dibalas cepat</p>
                                                <p className="text-xs text-blue-600">Biasanya dalam {formData.responseTime} jam</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Preview */}
                                    <div className="space-y-2">
                                        <div className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-sm font-medium">
                                            💬 Chat WhatsApp
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="w-full border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg text-sm font-medium">
                                                📞 Telepon
                                            </div>
                                            <div className="w-full border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg text-sm font-medium">
                                                📅 Jadwal
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Status */}
                            <div className="mt-4 text-center text-sm text-gray-500">
                                {saveStatus === 'saved' ? (
                                    <span className="text-green-600">✓ Perubahan tersimpan</span>
                                ) : (
                                    <span>Klik "Simpan Perubahan" untuk menyimpan</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phone Change Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Ubah Nomor WhatsApp
                                </h3>
                                <button
                                    onClick={() => setShowPhoneModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {phoneError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                                    {phoneError}
                                </div>
                            )}

                            {phoneModalStep === 'input' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor WhatsApp Baru
                                        </label>
                                        <input
                                            type="tel"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="+628123456789"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Format: +62812xxxx atau 0812xxxx
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowPhoneModal(false)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            onClick={handleSendPhoneOtp}
                                            className="flex-1"
                                            isLoading={phoneLoading}
                                            disabled={!newPhone || newPhone.length < 11}
                                        >
                                            Kirim OTP
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {phoneModalStep === 'otp' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-blue-800">
                                            OTP dikirim ke <strong>{newPhone}</strong>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode OTP
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={phoneOtp}
                                            onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                        />
                                        {phoneOtpCountdown > 0 ? (
                                            <p className="mt-2 text-xs text-gray-500 text-center">
                                                Kirim ulang dalam {formatPhoneCooldown(phoneOtpCountdown)}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleSendPhoneOtp}
                                                className="mt-2 text-xs text-primary hover:underline w-full"
                                            >
                                                Kirim ulang OTP
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPhoneModalStep('input')}
                                            className="flex-1"
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            onClick={handleVerifyPhoneOtp}
                                            className="flex-1"
                                            isLoading={phoneLoading}
                                            disabled={phoneOtp.length !== 6}
                                        >
                                            Verifikasi
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
