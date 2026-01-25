'use client'

import { useState, useEffect } from 'react'
import { MapPin, X, Loader2, Crosshair } from 'lucide-react'
import { Button } from './Button'

interface LocationDetectorModalProps {
    isOpen: boolean
    onClose: () => void
    onLocationDetected: (location: { latitude: number; longitude: number; city: string }) => void
}

const INDONESIA_CITIES = [
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Timur',
    'Jakarta Utara',
    'Tangerang',
    'Tangerang Selatan',
    'Bekasi',
    'Depok',
    'Bogor',
    'Bandung',
    'Surabaya',
    'Medan',
    'Semarang',
    'Makassar',
    'Denpasar',
    'Yogyakarta',
    'Malang',
    'Palembang',
]

// Approximate coordinates for major Indonesian cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Jakarta Selatan': { lat: -6.2615, lng: 106.8106 },
    'Jakarta Pusat': { lat: -6.2088, lng: 106.8456 },
    'Jakarta Barat': { lat: -6.1754, lng: 106.7652 },
    'Jakarta Timur': { lat: -6.2842, lng: 106.9009 },
    'Jakarta Utara': { lat: -6.1395, lng: 106.8696 },
    'Tangerang': { lat: -6.1783, lng: 106.6319 },
    'Tangerang Selatan': { lat: -6.2950, lng: 106.7420 },
    'Bekasi': { lat: -6.2349, lng: 106.9727 },
    'Depok': { lat: -6.4031, lng: 106.8194 },
    'Bogor': { lat: -6.5944, lng: 106.7892 },
    'Bandung': { lat: -6.9175, lng: 107.6191 },
    'Surabaya': { lat: -7.2575, lng: 112.7521 },
    'Medan': { lat: 3.5952, lng: 98.6722 },
    'Semarang': { lat: -6.9667, lng: 110.4167 },
    'Makassar': { lat: -5.1477, lng: 119.4328 },
    'Denpasar': { lat: -8.6705, lng: 115.2126 },
    'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'Malang': { lat: -7.9797, lng: 112.6304 },
    'Palembang': { lat: -2.9761, lng: 104.7604 },
}

export function LocationDetectorModal({
    isOpen,
    onClose,
    onLocationDetected,
}: LocationDetectorModalProps) {
    const [isDetecting, setIsDetecting] = useState(false)
    const [showManual, setShowManual] = useState(false)
    const [selectedCity, setSelectedCity] = useState('')

    // Don't render if not open
    if (!isOpen) return null

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung deteksi lokasi. Silakan pilih lokasi manual.')
            setShowManual(true)
            return
        }

        setIsDetecting(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords

                // Reverse geocode to get city name (simplified - using closest city)
                let closestCity = 'Jakarta Selatan'
                let minDistance = Infinity

                for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
                    const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng)
                    if (distance < minDistance) {
                        minDistance = distance
                        closestCity = city
                    }
                }

                onLocationDetected({
                    latitude,
                    longitude,
                    city: closestCity,
                })

                setIsDetecting(false)
                onClose()
            },
            (error) => {
                console.error('Geolocation error:', error)
                setIsDetecting(false)

                // Fallback to manual selection based on error
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Izin lokasi ditolak. Silakan pilih lokasi manual.')
                } else {
                    alert('Tidak dapat mendeteksi lokasi. Silakan pilih lokasi manual.')
                }
                setShowManual(true)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        )
    }

    const handleManualSelect = () => {
        if (!selectedCity) {
            alert('Silakan pilih kota terlebih dahulu')
            return
        }

        const coords = CITY_COORDINATES[selectedCity]
        if (coords) {
            onLocationDetected({
                latitude: coords.lat,
                longitude: coords.lng,
                city: selectedCity,
            })
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary via-orange-500 to-accent px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Deteksi Lokasi
                                </h2>
                                <p className="text-white/90 text-sm">
                                    Temukan mobil terdekat
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!showManual ? (
                        <div className="space-y-4">
                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    <span className="font-semibold">Izinkan kami mendeteksi lokasi</span> untuk menampilkan mobil terdekat dengan Anda. Data lokasi hanya disimpan di browser.
                                </p>
                            </div>

                            {/* Detect Button */}
                            <Button
                                onClick={handleDetectLocation}
                                disabled={isDetecting}
                                className="w-full py-4 text-base font-semibold"
                            >
                                {isDetecting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Mendeteksi Lokasi...
                                    </>
                                ) : (
                                    <>
                                        <Crosshair className="w-5 h-5 mr-2" />
                                        Deteksi Lokasi Saya
                                    </>
                                )}
                            </Button>

                            {/* Manual Selection */}
                            <div className="text-center">
                                <button
                                    onClick={() => setShowManual(true)}
                                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                                >
                                    atau pilih lokasi manual
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Manual Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Pilih Kota Anda
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {INDONESIA_CITIES.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => setSelectedCity(city)}
                                            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                selectedCity === city
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                            }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowManual(false)}
                                    className="flex-1"
                                >
                                    Kembali
                                </Button>
                                <Button
                                    onClick={handleManualSelect}
                                    disabled={!selectedCity}
                                    className="flex-1"
                                >
                                    Pilih Lokasi
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Privacy Note */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        🔒 Privasi terjamin. Lokasi Anda tidak disimpan di server kami.
                    </p>
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slide-up {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}
