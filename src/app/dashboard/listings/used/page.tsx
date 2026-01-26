'use client'

import { useState, Suspense, useEffect } from 'react'
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
    MapPin,
    FileText,
    CheckCircle,
    Loader2,
    Calendar,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Save,
    Eye,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Input, Dropdown, Badge, LocationDetectorModal } from '@/components/ui'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
} from '@/lib/constants'

const steps = [
    { id: 1, title: 'Mobil', icon: Car, subtitle: 'Merk, model, tahun' },
    { id: 2, title: 'Detail', icon: Info, subtitle: 'Spesifikasi' },
    { id: 3, title: 'Harga', icon: DollarSign, subtitle: 'Lokasi' },
    { id: 4, title: 'Foto', icon: Camera, subtitle: 'Deskripsi' },
    { id: 5, title: 'Riwayat', icon: FileText, subtitle: 'Opsional' },
    { id: 6, title: 'Preview', icon: Eye, subtitle: 'Review' },
]

// Vehicle History Options
const PEMAKAIAN_OPTIONS = [
    { value: 'Tangan ke-1', label: 'Tangan ke-1' },
    { value: 'Tangan ke-2', label: 'Tangan ke-2' },
    { value: 'Tangan ke-3', label: 'Tangan ke-3' },
    { value: 'Tangan ke-4+', label: 'Tangan ke-4+' },
]

const BPKB_STATUS_OPTIONS = [
    { value: 'Asli', label: 'Asli (BPKB Fisik)' },
    { value: 'Fotokopi', label: 'Fotokopi' },
    { value: 'Prosess', label: 'Dalam Proses' },
    { value: 'Leasing', label: 'Masih di Leasing' },
]

const KONDISI_OPTIONS = [
    { value: 'Baik', label: 'Baik' },
    { value: 'Sangat Baik', label: 'Sangat Baik' },
    { value: 'Perlu Servis', label: 'Perlu Servis' },
]

const KONDISI_BAN_OPTIONS = [
    { value: '90%', label: '90% - Seperti Baru' },
    { value: '80%', label: '80% - Masih Tebal' },
    { value: '60%', label: '60% - Masih Aman' },
    { value: '40%', label: '40% - Hampir Habis' },
    { value: 'Perlu Ganti', label: 'Perlu Ganti' },
]

// Quick Years (recent first, more practical)
const quickYears = [
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
]

const allYears = Array.from({ length: 30 }, (_, i) => ({
    value: String(2025 - i),
    label: String(2025 - i),
}))

const colors = [
    { value: 'putih', label: 'Putih' },
    { value: 'hitam', label: 'Hitam' },
    { value: 'silver', label: 'Silver' },
    { value: 'abu-abu', label: 'Abu-abu' },
    { value: 'merah', label: 'Merah' },
    { value: 'biru', label: 'Biru' },
    { value: 'coklat', label: 'Coklat' },
    { value: 'hijau', label: 'Hijau' },
    { value: 'kuning', label: 'Kuning' },
    { value: 'orange', label: 'Orange' },
    { value: 'graya', label: 'Gray' },
    { value: 'lainnya', label: 'Lainnya' },
]

// Car Data
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
    "Timor": {
        "SOCH": ["1.5", "2.0"],
    },
    "Proton": {
        "SAVVY": ["1.2", "AMT"],
        "GEN2": ["1.3", "1.6"],
        "WIRA": ["1.3", "1.5", "1.6"],
        "WAJA": ["1.6", "1.8"],
        "PERDANA": ["1.8", "2.0 V6"],
        "EXORA": ["1.6", "Bold"],
    },
    "Chery": {
        "QQ": ["0.8", "1.1"],
        "TIGGO": ["1.6", "1.8", "2.0"],
        "EASTAR": ["2.0", "2.4"],
    },
    "Geely": {
        "Panda": ["1.0", "1.3"],
        "LC": ["1.3", "1.5", "Cross"],
        "MK": ["1.5", "1.8"],
        "EC7": ["1.5", "1.8"],
        "Emgrand": ["1.8", "2.0"],
    },
    "DFSK": {
        "GELORA": ["Blind Van", "Box"],
        "SUPER CAB": ["1.3", "1.5", "1.6"],
    },
}

// Essential features (always visible)
const CAR_FEATURES_ESSENTIAL = {
    'Eksterior': ['LED Headlamp', 'DRL', 'Chrome Grille', 'Alloy Wheels'],
    'Interior': ['Leather Seat', 'Automatic AC', 'Push Start Button'],
    'Keselamatan': ['Dual Airbag', 'ABS + EBD', 'Rear Camera'],
    'Hiburan': ['Touchscreen', 'Bluetooth', 'Apple CarPlay / Android Auto'],
}

// Full features list (expandable)
const CAR_FEATURES_FULL = {
    'Eksterior': [
        'LED Headlamp',
        'DRL',
        'Chrome Grille',
        'Alloy Wheels 17"',
        'Rear Spoiler',
        'Sunroof',
        'Roof Rail',
        'Fog Lamp',
    ],
    'Interior': [
        'Fabric Seat',
        'Leather Seat',
        'Automatic AC',
        'Manual AC',
        'Push Start Button',
        'Multi-info Display',
        'Cruise Control',
        'Power Window',
    ],
    'Keselamatan': [
        'Dual Airbag',
        'ABS + EBD',
        'Hill Start Assist',
        'Rear Camera',
        'Parking Sensor',
        'VSA',
        'ESP',
        'ISOFIX',
    ],
    'Hiburan': [
        '8 inch Touchscreen',
        '9 inch Touchscreen',
        'Bluetooth',
        'USB Port',
        'Steering Audio Control',
        'Apple CarPlay',
        'Android Auto',
        '6 Speakers',
    ],
}

// Auto-save key
const DRAFT_KEY = 'listing_draft_used'

function NewUsedListingForm() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
        'Eksterior': [],
        'Interior': [],
        'Keselamatan': [],
        'Hiburan': [],
    })
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [showAllYears, setShowAllYears] = useState(false)
    const [showAllFeatures, setShowAllFeatures] = useState(false)
    const [showLocationModal, setShowLocationModal] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        // Step 1
        brand: '',
        model: '',
        variant: '',
        year: '',
        // Step 2
        transmission: '',
        fuelType: '',
        bodyType: '',
        mileage: '',
        engineSize: '',
        color: '',
        // Step 3
        price: '',
        negotiable: true,
        location: '',
        latitude: '',
        longitude: '',
        // Step 4
        description: '',
        // Step 5
        pajakStnk: '',
        pemakaian: '',
        serviceTerakhir: '',
        bpkbStatus: '',
        kecelakaan: false,
        kondisiMesin: '',
        kondisiKaki: '',
        kondisiAc: '',
        kondisiBan: '',
    })

    // Auto-save draft
    useEffect(() => {
        const timer = setInterval(() => {
            const draft = { formData, images, selectedFeatures, currentStep }
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
            setLastSaved(new Date())
        }, 10000) // Save every 10 seconds
        return () => clearInterval(timer)
    }, [formData, images, selectedFeatures, currentStep])

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY)
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft)
                if (confirm('Draft tersimpan. Lanjutkan isi form?')) {
                    setFormData(draft.formData)
                    setImages(draft.images || [])
                    setSelectedFeatures(draft.selectedFeatures)
                    setCurrentStep(draft.currentStep)
                }
            } catch (e) {
                console.error('Failed to load draft', e)
            }
        }
    }, [])

    // Auto-fill location from localStorage (Smart Location Detection)
    useEffect(() => {
        const savedLocation = localStorage.getItem('user_location')
        if (savedLocation && !formData.location) {
            try {
                const loc = JSON.parse(savedLocation)
                updateFormData('location', loc.city)
                updateFormData('latitude', loc.latitude.toString())
                updateFormData('longitude', loc.longitude.toString())
            } catch (e) {
                console.error('Failed to parse saved location:', e)
            }
        }
    }, [])

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Handle location detected from LocationDetectorModal
    const handleLocationDetected = (loc: { latitude: number; longitude: number; city: string }) => {
        updateFormData('location', loc.city)
        updateFormData('latitude', loc.latitude.toString())
        updateFormData('longitude', loc.longitude.toString())
        setShowLocationModal(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setUploading(true)

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error || 'Failed to upload image')
                }

                const data = await res.json()
                setImages((prev) => [...prev, data.url])
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            alert(error instanceof Error ? error.message : 'Failed to upload image')
        } finally {
            setUploading(false)
            // Clear input
            e.target.value = ''
        }
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const autoTitle = `${formData.brand} ${formData.model} ${formData.variant} ${formData.year}`.trim()

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                title: autoTitle,
                images,
                features: selectedFeatures,
                condition: 'USED',
            }

            const res = await fetch('/api/listings/used', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Gagal menyimpan iklan')
            }

            // Clear draft on success
            localStorage.removeItem(DRAFT_KEY)

            router.push('/dashboard/listings?success=true')
        } catch (error) {
            console.error('Error creating listing:', error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const goNext = () => setCurrentStep((prev) => Math.min(6, prev + 1))
    const goPrev = () => setCurrentStep((prev) => Math.max(1, prev - 1))

    const progressPercent = Math.round(((currentStep - 1) / 5) * 100)

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Sticky Header - Minimal */}
                <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                    <div className="container max-w-2xl">
                        {/* Top bar */}
                        <div className="flex items-center justify-between py-3">
                            <button
                                onClick={() => currentStep > 1 ? goPrev() : router.back()}
                                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-secondary">{steps[currentStep - 1].title}</p>
                                <p className="text-xs text-gray-500">{steps[currentStep - 1].subtitle}</p>
                            </div>
                            <div className="w-9"></div>
                        </div>

                        {/* Progress bar - Clean */}
                        <div className="pb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                <span>Langkah {currentStep} dari 5</span>
                                <span className="font-medium text-primary">{progressPercent}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container max-w-2xl px-4 py-6">
                    {/* Step 1: Mobil (Brand, Model, Variant, Year) */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {/* Brand & Model Cards */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Merk & Model</p>
                                </div>
                                <div className="p-4 space-y-3">
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
                            </div>

                            {/* Variant & Year Cards */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Varian & Tahun</p>
                                </div>
                                <div className="p-4 space-y-3">
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

                                    {/* Year Quick Select */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                                        <div className="grid grid-cols-4 gap-2 mb-2">
                                            {quickYears.map((year) => (
                                                <button
                                                    key={year.value}
                                                    type="button"
                                                    onClick={() => updateFormData('year', year.value)}
                                                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                                        formData.year === year.value
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {year.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAllYears(!showAllYears)}
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            {showAllYears ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            {showAllYears ? 'Tutup' : 'Lihat semua tahun'}
                                        </button>
                                        {showAllYears && (
                                            <div className="mt-2 grid grid-cols-4 gap-2">
                                                {allYears.filter(y => !quickYears.find(qy => qy.value === y.value)).map((year) => (
                                                    <button
                                                        key={year.value}
                                                        type="button"
                                                        onClick={() => updateFormData('year', year.value)}
                                                        className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                                            formData.year === year.value
                                                                ? 'bg-primary text-white border-primary'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    >
                                                        {year.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Detail Mobil */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="rounded-t-xl px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Spesifikasi</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Dropdown
                                            label="Transmisi"
                                            options={Object.entries(TRANSMISSIONS).map(([k, v]) => ({ value: k, label: v }))}
                                            value={formData.transmission}
                                            onChange={(val) => updateFormData('transmission', val)}
                                            placeholder="Pilih"
                                        />
                                        <Dropdown
                                            label="Bahan Bakar"
                                            options={Object.entries(FUEL_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                                            value={formData.fuelType}
                                            onChange={(val) => updateFormData('fuelType', val)}
                                            placeholder="Pilih"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Dropdown
                                            label="Tipe Body"
                                            options={Object.entries(BODY_TYPES).map(([k, v]) => ({ value: k, label: v }))}
                                            value={formData.bodyType}
                                            onChange={(val) => updateFormData('bodyType', val)}
                                            placeholder="Pilih"
                                        />
                                        <Dropdown
                                            label="Warna"
                                            options={colors}
                                            value={formData.color}
                                            onChange={(val) => updateFormData('color', val)}
                                            placeholder="Pilih"
                                        />
                                    </div>

                                    <Input
                                        label="Kilometer"
                                        placeholder="Contoh: 25000"
                                        type="number"
                                        value={formData.mileage}
                                        onChange={(e) => updateFormData('mileage', e.target.value)}
                                        required
                                    />

                                    <Input
                                        label="Kapasitas Mesin (cc)"
                                        placeholder="Contoh: 1500"
                                        type="number"
                                        value={formData.engineSize}
                                        onChange={(e) => updateFormData('engineSize', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Harga & Lokasi */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Harga</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual (Rp)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.price}
                                                onChange={(e) => updateFormData('price', e.target.value.replace(/\D/g, ''))}
                                                placeholder="250000000"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            {formData.price && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                    {parseInt(formData.price).toLocaleString('id-ID')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.negotiable}
                                            onChange={(e) => updateFormData('negotiable', e.target.checked)}
                                            className="w-4 h-4 text-primary rounded"
                                        />
                                        <span className="text-sm text-gray-600">Bisa nego</span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="rounded-t-xl px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Lokasi</p>
                                </div>
                                <div className="p-4">
                                    <div className="relative">
                                        <Input
                                            label="Kota/Kabupaten"
                                            placeholder="Contoh: Jakarta Selatan"
                                            value={formData.location}
                                            onChange={(e) => updateFormData('location', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLocationModal(true)}
                                            className="absolute right-3 top-8 p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            title="Deteksi Lokasi Otomatis"
                                        >
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {formData.latitude && formData.longitude && (
                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded-lg">
                                            <MapPin className="w-3 h-3" />
                                            <span>Koordinat tersimpan: {formData.latitude}, {formData.longitude}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Foto & Deskripsi */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            {/* Photo Upload */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Foto Mobil</p>
                                    <p className="text-xs text-gray-500">Minimal 3 foto</p>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {index === 0 && (
                                                    <Badge className="absolute bottom-2 left-2" size="sm" variant="primary">
                                                        Utama
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                        {images.length < 10 && !uploading && (
                                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
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
                                        {uploading && (
                                            <div className="aspect-square border-2 border-dashed border-primary bg-primary/5 rounded-lg flex flex-col items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                                                <span className="text-xs text-primary font-medium">Mengupload...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Title Auto-generated */}
                            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
                                <p className="text-xs text-gray-500 mb-1">Judul Iklan</p>
                                <p className="text-sm font-semibold text-primary">{autoTitle || 'Akan dibuat otomatis'}</p>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Deskripsi</p>
                                </div>
                                <div className="p-4">
                                    <textarea
                                        rows={4}
                                        placeholder="Jelaskan kondisi mobil, kelengkapan, alasan jual..."
                                        value={formData.description}
                                        onChange={(e) => updateFormData('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Features - Hybrid: Essential + Expandable */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Fitur Mobil</p>
                                    <p className="text-xs text-gray-500">Pilih fitur yang ada pada mobil</p>
                                </div>

                                {/* Essential Features (Always Visible) */}
                                <div className="p-4 space-y-4">
                                    {Object.entries(CAR_FEATURES_ESSENTIAL).map(([category, features]) => (
                                        <div key={category}>
                                            <p className="text-xs font-medium text-gray-500 mb-2">{category}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {features.map((feature) => (
                                                    <label key={feature} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
                                                            className="w-3 h-3 text-primary rounded"
                                                        />
                                                        <span>{feature}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Expand/Collapse All Features */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        {showAllFeatures ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Tampilkan fitur utama saja
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Lihat semua fitur lengkap
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Full Features (Expandable) */}
                                {showAllFeatures && (
                                    <div className="p-4 pt-0 space-y-4 border-t border-gray-200">
                                        {Object.entries(CAR_FEATURES_FULL).map(([category, features]) => (
                                            <div key={category}>
                                                <p className="text-xs font-medium text-gray-500 mb-2 mt-4">{category} (Lengkap)</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {features.map((feature) => (
                                                        <label key={feature} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
                                                                className="w-3 h-3 text-primary rounded"
                                                            />
                                                            <span>{feature}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Riwayat Kendaraan */}
                    {currentStep === 5 && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-800">
                                    💡 <span className="font-medium">Opsional:</span> Lengkapi untuk meningkatkan kepercayaan pembeli.
                                </p>
                            </div>

                            {/* Documents */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="rounded-t-xl px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Dokumen</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pajak STNK</label>
                                        <Input
                                            type="month"
                                            value={formData.pajakStnk}
                                            onChange={(e) => updateFormData('pajakStnk', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Dropdown
                                            label="Pemakaian"
                                            options={PEMAKAIAN_OPTIONS}
                                            value={formData.pemakaian}
                                            onChange={(val) => updateFormData('pemakaian', val)}
                                            placeholder="Pilih"
                                        />
                                        <Dropdown
                                            label="BPKB"
                                            options={BPKB_STATUS_OPTIONS}
                                            value={formData.bpkbStatus}
                                            onChange={(val) => updateFormData('bpkbStatus', val)}
                                            placeholder="Pilih"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Condition */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div className="rounded-t-xl px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-secondary">Kondisi</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecelakaan</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="kecelakaan"
                                                    checked={!formData.kecelakaan}
                                                    onChange={() => updateFormData('kecelakaan', false)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span className="text-sm">Tidak Pernah</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="kecelakaan"
                                                    checked={formData.kecelakaan === true}
                                                    onChange={() => updateFormData('kecelakaan', true)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span className="text-sm">Pernah</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Dropdown
                                            label="Mesin"
                                            options={KONDISI_OPTIONS}
                                            value={formData.kondisiMesin}
                                            onChange={(val) => updateFormData('kondisiMesin', val)}
                                            placeholder="Kondisi"
                                        />
                                        <Dropdown
                                            label="Kaki-kaki"
                                            options={KONDISI_OPTIONS}
                                            value={formData.kondisiKaki}
                                            onChange={(val) => updateFormData('kondisiKaki', val)}
                                            placeholder="Kondisi"
                                        />
                                        <Dropdown
                                            label="AC"
                                            options={KONDISI_OPTIONS}
                                            value={formData.kondisiAc}
                                            onChange={(val) => updateFormData('kondisiAc', val)}
                                            placeholder="Kondisi"
                                        />
                                        <Dropdown
                                            label="Ban"
                                            options={KONDISI_BAN_OPTIONS}
                                            value={formData.kondisiBan}
                                            onChange={(val) => updateFormData('kondisiBan', val)}
                                            placeholder="Kondisi"
                                        />
                                    </div>
                                    <Input
                                        label="Service Terakhir"
                                        placeholder="Contoh: 50.000 km lalu"
                                        value={formData.serviceTerakhir}
                                        onChange={(e) => updateFormData('serviceTerakhir', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Auto-save indicator */}
                    {lastSaved && (
                        <div className="flex items-center justify-center gap-1.5 py-2">
                            <Save className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Tersimpan {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                </div>

                {/* Inline Navigation Buttons */}
                <div className="container max-w-2xl px-4 py-6">
                    <div className="flex items-center gap-3">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={goPrev}
                                className="flex-1"
                            >
                                Sebelumnya
                            </Button>
                        )}
                        <Button
                            onClick={currentStep === 5 ? handleSubmit : goNext}
                            disabled={isSubmitting}
                            className={`${currentStep === 1 ? 'w-full' : 'flex-[2]'}`}
                        >
                            {isSubmitting ? 'Memproses...' : currentStep === 5 ? 'Pasang Iklan' : 'Lanjut'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Location Detector Modal */}
            <LocationDetectorModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onLocationDetected={handleLocationDetected}
            />
        </DashboardLayout>
    )
}

export default function NewUsedListingPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        }>
            <NewUsedListingForm />
        </Suspense>
    )
}
