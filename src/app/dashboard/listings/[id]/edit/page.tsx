'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Button, Card, CardContent, Input, Dropdown, Badge } from '@/components/ui'
import {
    TRANSMISSIONS,
    FUEL_TYPES,
    BODY_TYPES,
} from '@/lib/constants'

const steps = [
    { id: 1, title: 'Informasi Dasar', icon: Car },
    { id: 2, title: 'Detail Mobil', icon: Info },
    { id: 3, title: 'Harga & Lokasi', icon: DollarSign },
    { id: 4, title: 'Foto & Deskripsi', icon: Camera },
]

const years = Array.from({ length: 15 }, (_, i) => ({
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
        "YARIS": ["1.5 E", "1.5 G", "1.5 S TRD", "1.5 GR Sport"],
        "RAIZE": ["1.2 G", "1.0 G Turbo", "1.0 GR Sport", "1.0 GR TSS"]
    },
    "Daihatsu": {
        "AYLA": ["1.0 D", "1.0 M", "1.0 X", "1.2 X", "1.2 R", "1.2 R Deluxe"],
        "SIGRA": ["1.0 D", "1.0 M", "1.2 X", "1.2 R", "1.2 R Deluxe"],
        "XENIA": ["1.3 M", "1.3 X", "1.3 R", "1.5 R", "1.3 R ADS", "1.5 R ASA"],
        "TERIOS": ["X", "X Deluxe", "R", "R Deluxe", "R Custom", "X ADS", "R ADS"],
        "ROCKY": ["1.2 M", "1.2 X", "1.0 R TC", "1.0 R TC ASA", "1.2 X ADS"],
        "GRAN MAX": ["1.3 D", "1.3 FF", "1.5 D PS", "Blind Van 1.3", "Pick Up 1.3", "Pick Up 1.5"],
        "LUXIO": ["1.5 D", "1.5 X"],
        "SIRION": ["1.3 D", "1.3 X", "1.3 R"]
    },
    "Honda": {
        "BRIO": ["Satya S", "Satya E", "RS", "RS Urbanite"],
        "HR-V": ["1.5 S", "1.5 E", "1.5 SE", "1.5 RS Turbo"],
        "CR-V": ["2.0", "1.5 Turbo", "1.5 Turbo Prestige"],
        "BR-V": ["S", "E", "Prestige", "Prestige HS"],
        "CITY": ["Sedan", "Hatchback RS"],
        "CIVIC": ["Sedan RS", "Type R"],
        "MOBILIO": ["S", "E", "RS"]
    },
    "Mitsubishi": {
        "XPANDER": ["GLS", "Exceed", "Sport", "Ultimate"],
        "XPANDER CROSS": ["MT", "Premium CVT"],
        "PAJERO SPORT": ["Exceed", "GLX", "Dakar", "Dakar Ultimate"],
        "TRITON": ["Single Cab", "Double Cab HDX", "Double Cab GLS", "Double Cab Ultimate"],
        "L300": ["Pick Up Flat Deck", "Cab Chassis"]
    },
    "Suzuki": {
        "ERTIGA": ["GA", "GL", "GX", "Sport", "Hybrid GX", "Hybrid SS"],
        "XL7": ["Zeta", "Beta", "Alpha", "Hybrid Beta", "Hybrid Alpha"],
        "IGNIS": ["GL", "GX"],
        "BALENO": ["Hatchback MT", "Hatchback AT"],
        "JIMNY": ["MT", "AT"],
        "S-PRESSO": ["MT", "AGS"],
        "CARRY": ["Pick Up FD", "Pick Up WD"]
    },
    "Hyundai": {
        "CRETA": ["Active", "Trend", "Style", "Prime"],
        "STARGAZER": ["Active", "Trend", "Style", "Prime", "X Style", "X Prime"],
        "IONIQ 5": ["Prime Standard", "Prime Long Range", "Signature Standard", "Signature Long Range"],
        "PALISADE": ["Prime", "Signature", "Signature AWD"],
        "SANTA FE": ["Gasoline G 2.5", "Diesel D 2.2"]
    },
    "Wuling": {
        "CONFERO": ["S 1.5 C", "S 1.5 L", "DB"],
        "ALMAZ": ["Smart Enjoy", "Exclusive", "RS Ex", "RS Pro", "Hybrid"],
        "CORTEZ": ["S", "CT", "New Cortez CE", "New Cortez EX"],
        "AIR EV": ["Lite", "Standard Range", "Long Range"],
        "ALVEZ": ["SE", "CE", "EX"]
    },
    "Mazda": {
        "2": ["GT"],
        "3": ["Hatchback", "Sedan"],
        "CX-3": ["1.5 Sport", "2.0 Pro"],
        "CX-5": ["Elite", "Kuro"],
        "CX-30": ["GT"]
    }
}

// Car Features by Category
const CAR_FEATURES = {
    'Eksterior': ['LED Headlamp', 'DRL', 'Chrome Grille', 'Alloy Wheels 17"', 'Rear Spoiler'],
    'Interior': ['Fabric Seat', 'Automatic AC', 'Push Start Button', 'Multi-info Display', 'Cruise Control'],
    'Keselamatan': ['Dual Airbag', 'ABS + EBD', 'Hill Start Assist', 'Rear Camera', 'Parking Sensor'],
    'Hiburan': ['8 inch Touchscreen', 'Bluetooth', 'USB Port', 'Steering Audio Control'],
}

export default function EditListingPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [images, setImages] = useState<string[]>([])
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
        'Eksterior': [],
        'Interior': [],
        'Keselamatan': [],
        'Hiburan': [],
    })

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
        color: '',
        plateNumber: '',
        // Step 3
        price: '',
        negotiable: true,
        location: '',
        address: '',
        // Step 4
        title: '',
        description: '',
    })

    // Fetch existing listing data
    useEffect(() => {
        async function fetchListing() {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/listings`)
                if (!res.ok) throw new Error('Failed to fetch listing')

                const listings = await res.json()
                const listing = listings.find((l: any) => l.id === id)

                if (!listing) {
                    alert('Iklan tidak ditemukan')
                    router.push('/dashboard/listings')
                    return
                }

                // Load listing data into form
                setFormData({
                    brand: listing.brand?.name || '',
                    model: listing.model?.name || '',
                    variant: '', // Extract from title if needed
                    year: String(listing.year),
                    transmission: listing.transmission || '',
                    fuelType: listing.fuelType || '',
                    bodyType: listing.bodyType || '',
                    mileage: String(listing.mileage || 0),
                    color: listing.color || '',
                    plateNumber: listing.plateNumber || '',
                    price: String(listing.price),
                    negotiable: listing.negotiable ?? true,
                    location: listing.location || '',
                    address: listing.address || '',
                    title: listing.title || '',
                    description: listing.description || '',
                })

                setImages(listing.images || [])

                // Load features
                if (listing.features) {
                    setSelectedFeatures(listing.features)
                }
            } catch (error) {
                console.error('Error fetching listing:', error)
                alert('Gagal memuat data iklan')
                router.push('/dashboard/listings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchListing()
    }, [id, router])

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        // Simulate upload - in real app, upload to Cloudinary
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
            const payload = {
                id,
                ...formData,
                images,
                features: selectedFeatures,
            }

            const res = await fetch('/api/listings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...payload, action: 'update' }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Gagal mengupdate iklan')
            }

            router.push('/dashboard/listings?success=updated')
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate iklan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const goNext = () => setCurrentStep((prev) => Math.min(4, prev + 1))
    const goPrev = () => setCurrentStep((prev) => Math.max(1, prev - 1))

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-gray-500">Memuat data iklan...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/listings">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Edit Iklan</h1>
                        <p className="text-gray-500 mt-1">Edit informasi mobil yang Anda jual</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep > step.id
                                            ? 'bg-primary text-white'
                                            : currentStep === step.id
                                                ? 'bg-primary/10 text-primary border-2 border-primary'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-12 sm:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Steps */}
                <Card>
                    <CardContent className="p-6">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-secondary">Informasi Dasar</h2>

                                <div className="grid sm:grid-cols-2 gap-4">
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

                                <div className="grid sm:grid-cols-2 gap-4">
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
                                    <Dropdown
                                        label="Tahun"
                                        options={years}
                                        value={formData.year}
                                        onChange={(val) => updateFormData('year', val)}
                                        placeholder="Pilih tahun"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-secondary">Detail Mobil</h2>

                                <div className="grid sm:grid-cols-2 gap-4">
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

                                <div className="grid sm:grid-cols-2 gap-4">
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

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Kilometer"
                                        placeholder="Contoh: 15000"
                                        type="number"
                                        value={formData.mileage}
                                        onChange={(e) => updateFormData('mileage', e.target.value)}
                                    />
                                    <Input
                                        label="Nomor Plat (Opsional)"
                                        placeholder="Contoh: B 1234 ABC"
                                        value={formData.plateNumber}
                                        onChange={(e) => updateFormData('plateNumber', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Price & Location */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-secondary">Harga & Lokasi</h2>

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

                                <Input
                                    label="Kota/Kabupaten"
                                    placeholder="Contoh: Jakarta Selatan"
                                    value={formData.location}
                                    onChange={(e) => updateFormData('location', e.target.value)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Lengkap (Opsional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Alamat detail untuk pembeli yang ingin melihat mobil"
                                        value={formData.address}
                                        onChange={(e) => updateFormData('address', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Photos & Description */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-secondary">Foto & Deskripsi</h2>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Foto Mobil (Min. 3 foto)
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Format: JPG, PNG. Ukuran maks: 5MB per foto.
                                    </p>
                                </div>

                                <Input
                                    label="Judul Iklan"
                                    placeholder="Contoh: Toyota Avanza 1.5 G CVT 2023 - Kondisi Istimewa"
                                    value={formData.title}
                                    onChange={(e) => updateFormData('title', e.target.value)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Jelaskan kondisi mobil, kelengkapan, alasan jual, dll."
                                        value={formData.description}
                                        onChange={(e) => updateFormData('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>

                                {/* Features Checklist */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Fitur Mobil
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {Object.entries(CAR_FEATURES).map(([category, features]) => (
                                            <div key={category} className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-secondary mb-3">{category}</h4>
                                                <div className="space-y-2">
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
                                                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                            />
                                                            <span className="text-sm text-gray-600">{feature}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={goPrev}
                        disabled={currentStep === 1}
                    >
                        Sebelumnya
                    </Button>

                    {currentStep < 4 ? (
                        <Button onClick={goNext}>Selanjutnya</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
