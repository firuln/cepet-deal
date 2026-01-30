'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Upload,
    X,
    Camera,
    Car,
    Info,
    DollarSign,
    CheckCircle,
    Loader2,
    Settings,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Input, Dropdown, Badge } from '@/components/ui'
import { SpecsFormAccordion, SpecsFormData } from '@/components/forms/SpecsFormAccordion'
import { AiDescriptionButton } from '@/components/forms/AiDescriptionButton'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
} from '@/lib/constants'

const steps = [
    { id: 1, title: 'Informasi Dasar', icon: Car },
    { id: 2, title: 'Detail Mobil', icon: Info },
    { id: 3, title: 'Harga', icon: DollarSign },
    { id: 4, title: 'Foto & Deskripsi', icon: Camera },
    { id: 5, title: 'Spesifikasi Teknis', icon: Settings },
]

const colors = [
    { value: 'putih', label: 'Putih' },
    { value: 'hitam', label: 'Hitam' },
    { value: 'silver', label: 'Silver' },
    { value: 'abu-abu', label: 'Abu-abu' },
    { value: 'merah', label: 'Merah' },
    { value: 'biru', label: 'Biru' },
    { value: 'coklat', label: 'Coklat' },
]

// Vehicle History Options
const PEMAKAIAN_OPTIONS = [
    { value: 'Tangan ke-1', label: 'Tangan ke-1 (Perorangan)' },
    { value: 'Tangan ke-2', label: 'Tangan ke-2' },
    { value: 'Tangan ke-3', label: 'Tangan ke-3' },
    { value: 'Tangan ke-4', label: 'Tangan ke-4 atau lebih' },
]

const BPKB_STATUS_OPTIONS = [
    { value: 'Fisik Ada', label: 'Fisik Ada' },
    { value: 'Di-Leasing', label: 'Masih di Leasing' },
    { value: 'BPKB Hilang', label: 'BPKB Hilang (Proses)' },
]

const KONDISI_OPTIONS = [
    { value: 'Baik/Sehat', label: 'Baik/Sehat' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Perlu Servis', label: 'Perlu Servis Ringan' },
    { value: 'Rusak', label: 'Perlu Perbaikan' },
]

// Comprehensive Car Data
const CAR_DATA: Record<string, Record<string, string[]>> = {
    "Toyota": {
        "AGYA": ["1.0 E", "1.0 G", "1.0 S", "1.2 G", "1.0 TRD Sportivo", "1.2 TRD Sportivo", "1.2 G STD", "1.2 TRD", "1.0 G TRD", "1.2 GR", "1.2 G TRD", "1.2 GR Sport"],
        "ALPHARD": ["2.4 X", "2.4 G", "3.5 V", "2.5 G", "2.4 S", "2.5 X", "3.5 Q", "2.4 2WD", "G ATPM"],
        "ALTIS": ["G", "V", "HYBRID"],
        "AVANZA": ["1.5 S", "1.3 E", "1.3 G", "1.5 G", "1.5 Veloz", "1.3 Veloz", "1.3 E STD", "1.5 G Luxury"],
        "CALYA": ["1.2 E", "1.2 G", "1.2 E STD", "1.2"],
        "CAMRY": ["2.5 Hybrid", "2.5 G", "2.5 V", "3.5 Q", "2.4 G", "2.4 V"],
        "C-HR": ["1.8", "1.8 HV"],
        "COROLLA": ["1.8 G", "Cross 1.8"],
        "FORTUNER": ["2.4 G", "2.4 VRZ", "2.7 SRZ", "2.4 TRD", "2.8 GR Sport", "2.7 GR Sport"],
        "INNOVA": ["2.0 G", "2.0 V", "2.0 Q", "2.4 G", "2.4 V", "2.4 Q", "Venturer", "Zenix G", "Zenix V", "Zenix Q Hybrid"],
        "RUSH": ["1.5 G", "1.5 S TRD", "1.5 GR Sport"],
        "VELOZ": ["1.3", "1.5", "1.5 Q", "1.5 Q TSS"],
        "YARIS": ["1.5 E", "1.5 G", "1.5 S TRD", "1.5 GR Sport", "Cross"],
        "RAIZE": ["1.2 G", "1.0 G Turbo", "1.0 GR Sport", "1.0 GR TSS"],
        "KIJANG": ["LGX 1.8", "LGX 2.0", "Kijang Kapsul", "Super", "Grand Extra", "Rover"],
        "SOLUNA": ["GLi", "GLi Plus", "VTi"],
        "VIOS": ["G", "E", "Limo"],
        "ETIOS": ["1.2 J", "1.2 G", "1.2 V"],
        "NAV1": ["G", "V"],
        "SIENTA": ["1.5 E", "1.5 G", "1.5 V"],
        "WISH": ["1.8", "2.0"],
        "RUMPH": ["1.3", "1.5"],
    },
    "Daihatsu": {
        "AYLA": ["1.0 D", "1.0 M", "1.0 X", "1.2 X", "1.2 R", "1.2 R Deluxe"],
        "SIGRA": ["1.0 D", "1.0 M", "1.2 X", "1.2 R", "1.2 R Deluxe"],
        "XENIA": ["1.3 M", "1.3 X", "1.3 R", "1.5 R", "1.3 R ADS", "1.5 R ASA", "Li Deluxe", "Xi Deluxe"],
        "TERIOS": ["X", "X Deluxe", "R", "R Deluxe", "R Custom", "X ADS", "R ADS", "TX Adventure"],
        "ROCKY": ["1.2 M", "1.2 X", "1.0 R TC", "1.0 R TC ASA", "1.2 X ADS"],
        "GRAN MAX": ["1.3 D", "1.3 FF", "1.5 D PS", "Blind Van 1.3", "Pick Up 1.3", "Pick Up 1.5"],
        "LUXIO": ["1.5 D", "1.5 X"],
        "SIRION": ["1.3 D", "1.3 X", "1.3 R"],
        "CHARADE": ["1.0", "G10", "G11", "CS"],
        "CLASSY": ["1.0", "1.2"],
        "ZEBRA": ["1.0", "1.3", "Espass"],
        "TAFT": ["GT", "GT Diesel", "Hiline", "Feroza"],
    },
    "Honda": {
        "BRIO": ["Satya S", "Satya E", "RS", "RS Urbanite"],
        "HR-V": ["1.5 S", "1.5 E", "1.5 SE", "1.5 RS Turbo"],
        "CR-V": ["2.0", "1.5 Turbo", "1.5 Turbo Prestige"],
        "BR-V": ["S", "E", "Prestige", "Prestige HS"],
        "CITY": ["Sedan", "Hatchback RS"],
        "CIVIC": ["Sedan RS", "Type R", "Ferio", "VTi"],
        "MOBILIO": ["S", "E", "RS"],
        "JAZZ": ["S", "RS", "IDSI", "VTEC", "Fit"],
        "FREED": ["S", "E", "PSD"],
        "STREAM": ["1.7", "2.0"],
        "ODYSSEY": ["2.4", "Absolute"],
        "ACCORD": ["VTi", "VTi-L", "Cielo", "Maestro"],
        "BALADE": ["1.5", "1.6"],
    },
    "Mitsubishi": {
        "XPANDER": ["GLS", "Exceed", "Sport", "Ultimate"],
        "XPANDER CROSS": ["MT", "Premium CVT"],
        "PAJERO SPORT": ["Exceed", "GLX", "Dakar", "Dakar Ultimate"],
        "TRITON": ["Single Cab", "Double Cab HDX", "Double Cab GLS", "Double Cab Ultimate"],
        "L300": ["Pick Up Flat Deck", "Cab Chassis"],
        "COLT": ["T120SS", "L300", "Diesel"],
        "KUDA": ["GLS", "Grandia"],
        "GALANT": ["2.0", "V6"],
    },
    "Suzuki": {
        "ERTIGA": ["GA", "GL", "GX", "Sport", "Hybrid GX", "Hybrid SS"],
        "XL7": ["Zeta", "Beta", "Alpha", "Hybrid Beta", "Hybrid Alpha"],
        "IGNIS": ["GL", "GX"],
        "BALENO": ["Hatchback MT", "Hatchback AT"],
        "JIMNY": ["MT", "AT"],
        "S-PRESSO": ["MT", "AGS"],
        "CARRY": ["Pick Up FD", "Pick Up WD"],
        "APV": ["GE", "GL", "SGX", "Arena"],
        "KARIMUN": ["Wagon R", "Estillo", "GX"],
        "SWIFT": ["GL", "GT", "SB308"],
        "GRAND VITARA": ["2.0", "2.4", "JLX"],
        "SIDEKICK": ["1.6", "2.0"],
        "KATANA": ["1.3", "1.6"],
    },
    "Hyundai": {
        "CRETA": ["Active", "Trend", "Style", "Prime"],
        "STARGAZER": ["Active", "Trend", "Style", "Prime", "X Style", "X Prime"],
        "IONIQ 5": ["Prime Standard", "Prime Long Range", "Signature Standard", "Signature Long Range"],
        "PALISADE": ["Prime", "Signature", "Signature AWD"],
        "SANTA FE": ["Gasoline G 2.5", "Diesel D 2.2"],
        "TUCSON": ["Gasoline", "Diesel", "GLS", "XG"],
        "GETZ": ["1.4 GL", "1.6 GLS"],
        "ATOZ": ["1.0", "1.1"],
        "ACCENT": ["1.5", "Verna"],
    },
    "Wuling": {
        "CONFERO": ["S 1.5 C", "S 1.5 L", "DB"],
        "ALMAZ": ["Smart Enjoy", "Exclusive", "RS Ex", "RS Pro", "Hybrid"],
        "CORTEZ": ["S", "CT", "New Cortez CE", "New Cortez EX"],
        "AIR EV": ["Lite", "Standard Range", "Long Range"],
        "ALVEZ": ["SE", "CE", "EX"],
    },
    "Mazda": {
        "2": ["GT", "R", "V"],
        "3": ["Hatchback", "Sedan", "Speed"],
        "CX-3": ["1.5 Sport", "2.0 Pro"],
        "CX-5": ["Elite", "Kuro", "Touring"],
        "CX-30": ["GT", "Pro"],
        "CX-9": ["Elite", "Signature"],
        "CAPRELLA": ["1.6", "1.8"],
        "FAMILY": ["1.8", "2.0"],
        "INTERPLAY": ["1.6", "2.0"],
        "LANCER": ["1.6", "2.0", "SL"],
    },
    "Nissan": {
        "LIVINA": ["1.5 X-Gear", "1.5 Highway Star", "1.5 SV"],
        "GRAND LIVINA": ["1.5 SV", "1.5 XV", "1.8 HWS"],
        "MARCH": ["1.2", "1.5"],
        "JUKE": ["1.5", "1.5 RX", "Nismo"],
        "X-TRAIL": ["2.0", "2.5", "32", "36"],
        "TERRANO": ["2.0", "2.5"],
        "SERENA": ["2.0 X", "2.0 HWS"],
        "ELGRAND": ["2.5", "3.5"],
        "TEANA": ["2.3", "2.5", "3.5"],
        "CEDRIC": ["2.0", "3.0"],
        "SUNNY": ["1.4", "1.6", "Super Saloon"],
    },
    "BMW": {
        "320i": ["Sport", "Luxury", "Modern"],
        "318i": ["Sport", "Luxury"],
        "520i": ["Sport", "Luxury"],
        "X1": ["sDrive18i", "sDrive20i", "xDrive25i"],
        "X3": ["xDrive20i", "xDrive30i"],
        "X5": ["xDrive30d", "xDrive40d"],
        "MINI": ["Cooper", "Cooper S", "Countryman"],
    },
    "Mercedes-Benz": {
        "C200": ["Avantgarde", "Exclusive"],
        "C300": ["AMG Line", "Avantgarde"],
        "E300": ["Avantgarde", "Exclusive"],
        "A200": ["Progressive", "Urban"],
        "GLA200": ["Progressive", "AMG Line"],
        "GLC300": ["AMG Line", "Exclusive"],
    },
    "Audi": {
        "A3": ["1.4 TFSI", "2.0 TDI"],
        "A4": ["1.8 TFSI", "2.0 TDI"],
        "A6": ["2.0 TFSI", "3.0 TDI"],
        "Q3": ["1.4 TFSI", "2.0 TDI"],
        "Q5": ["2.0 TFSI", "3.0 TDI"],
        "TT": ["2.0 TFSI", "RS"],
    },
    "Volkswagen": {
        "Polo": ["1.2 TSI", "1.4 TSI"],
        "Golf": ["1.4 TSI", "2.0 TDI"],
        "Tiguan": ["1.4 TSI", "2.0 TDI"],
        "Touareg": ["2.0 TDI", "3.0 V6 TDI"],
        "Caravelle": ["2.0 TDI", "2.5 TDI"],
    },
    "Ford": {
        "FIESTA": ["1.4 Trend", "1.6 Sport"],
        "FOCUS": ["1.8 Trend", "2.0 Sport", "RS"],
        "EVEREST": ["2.2 Trend", "3.2 Titanium"],
        "RANGER": ["2.2 Single Cab", "2.2 Double Cab", "3.2 Wildtrak"],
        "ECOSPORT": ["1.5 Trend", "1.5 Titanium"],
        "LASER": ["1.3", "1.6", "TX3"],
        "TELSTAR": ["1.8", "2.0"],
    },
    "Chevrolet": {
        "SPARK": ["1.0", "1.2"],
        "TRAX": ["1.4 LT", "1.4 Premier"],
        "CAPTIVA": ["1.8", "2.0 Diesel"],
        "ORLANDO": ["1.8", "2.0 Diesel"],
        "COLORADO": ["2.5", "2.8"],
        "ZAFIRA": ["1.8", "2.0"],
    },
    "Kia": {
        "PICANTO": ["1.0", "1.2", "SE"],
        "RIO": ["1.4", "1.6"],
        "CERATO": ["1.8", "2.0"],
        "SOUL": ["1.6", "2.0"],
        "SPORTAGE": ["2.0", "2.0 Diesel"],
        "SORENTO": ["2.4", "3.5", "2.2 Diesel"],
        "CARNIVAL": ["2.5", "3.5"],
        "BEGO": ["1.5", "2.0"],
    },
    "Isuzu": {
        "PANTHER": ["2.3", "2.5", "Touring", "Grand Touring"],
        "D-MAX": ["Single Cab", "Double Cab", "Rodeo"],
        "MU-X": ["3.0", "4x4"],
        "NHR": ["55", "100"],
        "NKR": ["55", "66"],
    },
}

// Car Features by Category
const CAR_FEATURES = {
    'Eksterior': ['LED Headlamp', 'DRL', 'Chrome Grille', 'Alloy Wheels 17"', 'Rear Spoiler'],
    'Interior': ['Fabric Seat', 'Automatic AC', 'Push Start Button', 'Multi-info Display', 'Cruise Control'],
    'Keselamatan': ['Dual Airbag', 'ABS + EBD', 'Hill Start Assist', 'Rear Camera', 'Parking Sensor'],
    'Hiburan': ['8 inch Touchscreen', 'Bluetooth', 'USB Port', 'Steering Audio Control'],
}

function NewListingForm() {
    const router = useRouter()
    const { data: session, status: sessionStatus } = useSession()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
        'Eksterior': [],
        'Interior': [],
        'Keselamatan': [],
        'Hiburan': [],
    })

    // Form data - khusus mobil baru
    const [formData, setFormData] = useState(() => ({
        // Step 1
        brand: '',
        model: '',
        variant: '',
        year: '',
        // Step 2
        transmission: '',
        fuelType: '',
        bodyType: '',
        color: '',
        // Step 3
        price: '',
        negotiable: true,
        // Step 4
        description: '',
        // Step 5 - Technical Specifications
        specs: {} as Partial<SpecsFormData>,
    }))

    // Auto-generate title from brand, model, variant
    const autoTitle = useMemo(() => {
        const parts = [formData.brand, formData.model, formData.variant].filter(Boolean)
        return parts.join(' ') || 'Judul iklan akan otomatis dibuat'
    }, [formData.brand, formData.model, formData.variant])

    const updateFormData = (field: string, value: string | boolean | Partial<SpecsFormData>) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach((file) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImages((prev) => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const start = Date.now()

            const payload = {
                ...formData,
                title: autoTitle,
                images,
                features: selectedFeatures,
                condition: 'NEW',
                specs: formData.specs,
            }

            const res = await fetch('/api/listings/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Gagal menyimpan iklan')
            }

            const duration = Date.now() - start
            if (duration < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1000 - duration))
            }

            router.push('/admin/listings?success=true')
        } catch (error) {
            console.error('=== SUBMIT ERROR ===')
            console.error(error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan iklan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const goNext = () => setCurrentStep((prev) => Math.min(5, prev + 1))
    const goPrev = () => setCurrentStep((prev) => Math.max(1, prev - 1))

    // Check if user is admin
    if (sessionStatus === 'loading') {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-t-primary border-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Memuat...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (sessionStatus === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Akses ditolak. Hanya admin yang dapat membuat iklan mobil baru.</p>
                        <Link href="/dashboard">
                            <Button>Kembali ke Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Header - Mobile First */}
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/admin/listings">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-secondary">
                            Pasang Iklan Mobil Baru
                        </h1>
                    </div>
                </div>

                {/* Badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <Badge variant="success">
                        🚗 Mobil Baru (Admin Only)
                    </Badge>
                    <p className="text-sm text-gray-500">
                        Langkah {currentStep} dari 5
                    </p>
                </div>

                {/* Progress Steps - Mobile First */}
                <div className="hidden sm:block bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${currentStep > step.id
                                            ? 'bg-primary text-white'
                                            : currentStep === step.id
                                                ? 'bg-primary/10 text-primary border-2 border-primary'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <step.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline text-xs font-medium">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-6 sm:w-24 h-0.5 mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Progress Indicator */}
                <div className="sm:hidden bg-white rounded-xl border border-gray-200 p-3 mb-6">
                    <div className="flex items-center gap-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        currentStep > step.id
                                            ? 'bg-primary text-white'
                                            : currentStep === step.id
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {currentStep > step.id ? '✓' : step.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Steps */}
                <Card>
                    <CardContent className="p-3 sm:p-6">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-base sm:text-lg font-semibold text-secondary">Informasi Dasar</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Dropdown
                                        label="Merk"
                                        options={Object.keys(CAR_DATA).map(brand => ({ value: brand, label: brand }))}
                                        value={formData.brand}
                                        onChange={(val) => {
                                            updateFormData('brand', val)
                                            updateFormData('model', '')
                                            updateFormData('variant', '')
                                        }}
                                        placeholder="Pilih merk"
                                    />
                                    <Dropdown
                                        label="Model"
                                        options={
                                            formData.brand && CAR_DATA[formData.brand]
                                                ? Object.keys(CAR_DATA[formData.brand]).map(model => ({ value: model, label: model }))
                                                : []
                                        }
                                        value={formData.model}
                                        onChange={(val) => {
                                            updateFormData('model', val)
                                            updateFormData('variant', '')
                                        }}
                                        placeholder={formData.brand ? "Pilih model" : "Pilih merk dulu"}
                                        disabled={!formData.brand}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Dropdown
                                        label="Varian"
                                        options={
                                            formData.brand && formData.model && CAR_DATA[formData.brand]?.[formData.model]
                                                ? CAR_DATA[formData.brand][formData.model].map(variant => ({ value: variant, label: variant }))
                                                : []
                                        }
                                        value={formData.variant}
                                        onChange={(val) => updateFormData('variant', val)}
                                        placeholder={formData.model ? "Pilih varian" : "Pilih model dulu"}
                                        disabled={!formData.model}
                                    />
                                    <Input
                                        label="Tahun"
                                        placeholder="Contoh: 2024"
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => updateFormData('year', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {currentStep === 2 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-base sm:text-lg font-semibold text-secondary">Detail Mobil</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Dropdown
                                        label="Transmisi"
                                        options={Object.entries(TRANSMISSIONS).map(([k, v]) => ({ value: k, label: v }))}
                                        value={formData.transmission}
                                        onChange={(val) => updateFormData('transmission', val)}
                                        placeholder="Pilih transmisi"
                                    />
                                    <Dropdown
                                        label="Bahan Bakar"
                                        options={Object.entries(FUEL_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                                        value={formData.fuelType}
                                        onChange={(val) => updateFormData('fuelType', val)}
                                        placeholder="Pilih bahan bakar"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Dropdown
                                        label="Tipe Body"
                                        options={Object.entries(BODY_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                                        value={formData.bodyType}
                                        onChange={(val) => updateFormData('bodyType', val)}
                                        placeholder="Pilih tipe body"
                                    />
                                    <Dropdown
                                        label="Warna"
                                        options={colors}
                                        value={formData.color}
                                        onChange={(val) => updateFormData('color', val)}
                                        placeholder="Pilih warna"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Price */}
                        {currentStep === 3 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-base sm:text-lg font-semibold text-secondary">Harga</h2>

                                <div>
                                    <Input
                                        label="Harga (Rp)"
                                        placeholder="Contoh: 250000000"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => updateFormData('price', e.target.value)}
                                    />
                                    <label className="flex items-center gap-2 mt-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.negotiable}
                                            onChange={(e) => updateFormData('negotiable', e.target.checked)}
                                            className="w-4 h-4 text-primary rounded"
                                        />
                                        <span className="text-sm text-gray-600">Harga bisa nego</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Photos & Description */}
                        {currentStep === 4 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-base sm:text-lg font-semibold text-secondary">Foto & Deskripsi</h2>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Foto Mobil (Min. 3 foto)
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {index === 0 && (
                                                    <Badge className="absolute bottom-1 left-1" size="sm" variant="primary">
                                                        Utama
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                        {images.length < 10 && (
                                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Format: JPG, PNG. Ukuran maks: 5MB per foto.
                                    </p>
                                </div>

                                {/* Auto-generated Title Display */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Iklan (Otomatis)
                                    </label>
                                    <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-secondary text-sm sm:text-base font-medium">
                                        {autoTitle}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Judul akan otomatis dibuat dari Merk, Model, dan Varian</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Deskripsi
                                        </label>
                                        <AiDescriptionButton
                                            carData={{
                                                brand: formData.brand,
                                                model: formData.model,
                                                variant: formData.variant,
                                                year: formData.year,
                                                transmission: formData.transmission,
                                                fuelType: formData.fuelType,
                                                bodyType: formData.bodyType,
                                                color: formData.color,
                                                price: formData.price,
                                            }}
                                            condition="NEW"
                                            onGenerated={(description) => updateFormData('description', description)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <textarea
                                        id="description-textarea"
                                        rows={10}
                                        placeholder="Jelaskan spesifikasi, fitur, dan keunggulan mobil baru ini."
                                        value={formData.description}
                                        onChange={(e) => updateFormData('description', e.target.value)}
                                        className="w-full px-3 py-2 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[200px]"
                                    />
                                </div>

                                {/* Features Checklist */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                                        Fitur Mobil
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                        {Object.entries(CAR_FEATURES).map(([category, features]) => (
                                            <div key={category} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h4 className="font-medium text-secondary mb-2 sm:mb-3">{category}</h4>
                                                <div className="space-y-1.5 sm:space-y-2">
                                                    {features.map((feature) => (
                                                        <label key={feature} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFeatures[category]?.includes(feature)}
                                                                onChange={(e) => {
                                                                    setSelectedFeatures(prev => {
                                                                        const current = prev[category] || []
                                                                        if (e.target.checked) {
                                                                            return { ...prev, [category]: [...current, feature] }
                                                                        } else {
                                                                            return { ...prev, [category]: current.filter(f => f !== feature) }
                                                                        }
                                                                    })
                                                                }}
                                                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                            />
                                                            <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Technical Specifications */}
                        {currentStep === 5 && (
                            <div className="space-y-4 sm:space-y-6">
                                <SpecsFormAccordion
                                    data={formData.specs}
                                    onChange={(specs) => updateFormData('specs', specs)}
                                    defaultOpen={false}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goPrev}
                        disabled={currentStep === 1}
                        className="flex-1"
                    >
                        Sebelumnya
                    </Button>

                    {currentStep < 5 ? (
                        <Button onClick={goNext} size="sm" className="flex-1">Selanjutnya</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="flex-1">
                            {isSubmitting ? 'Memproses...' : 'Pasang Iklan'}
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

// Export with Suspense wrapper
export default function NewListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <NewListingForm />
        </Suspense>
    )
}
