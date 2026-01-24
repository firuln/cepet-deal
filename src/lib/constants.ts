// Brand Colors
export const COLORS = {
    primary: '#ff6348',
    secondary: '#2d3436',
    accent: '#00b894',
} as const

// Site Info
export const SITE_NAME = 'CepetDeal'
export const SITE_DESCRIPTION = 'Marketplace Mobil Baru & Bekas Terpercaya di Indonesia'
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Car Constants
export const CAR_CONDITIONS = {
    NEW: 'Baru',
    USED: 'Bekas',
} as const

export const TRANSMISSIONS = {
    MANUAL: 'Manual',
    AUTOMATIC: 'Automatic',
    CVT: 'CVT',
} as const

export const FUEL_TYPES = {
    PETROL: 'Bensin',
    DIESEL: 'Diesel',
    HYBRID: 'Hybrid',
    ELECTRIC: 'Listrik',
} as const

export const BODY_TYPES = {
    SEDAN: 'Sedan',
    SUV: 'SUV',
    MPV: 'MPV',
    HATCHBACK: 'Hatchback',
    COUPE: 'Coupe',
    PICKUP: 'Pickup',
    VAN: 'Van',
} as const

export const LISTING_STATUS = {
    PENDING: 'Menunggu',
    ACTIVE: 'Aktif',
    SOLD: 'Terjual',
    REJECTED: 'Ditolak',
    EXPIRED: 'Kadaluarsa',
} as const

// User Roles
export const USER_ROLES = {
    ADMIN: 'Admin',
    DEALER: 'Dealer',
    SELLER: 'Penjual',
    BUYER: 'Pembeli',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 12

// Price Range Options
export const PRICE_RANGES = [
    { label: 'Semua Harga', min: 0, max: 0 },
    { label: 'Di bawah 100 Juta', min: 0, max: 100000000 },
    { label: '100 - 200 Juta', min: 100000000, max: 200000000 },
    { label: '200 - 300 Juta', min: 200000000, max: 300000000 },
    { label: '300 - 500 Juta', min: 300000000, max: 500000000 },
    { label: '500 Juta - 1 Milyar', min: 500000000, max: 1000000000 },
    { label: 'Di atas 1 Milyar', min: 1000000000, max: 0 },
] as const

// Year Range
export const MIN_YEAR = 2000
export const MAX_YEAR = new Date().getFullYear() + 1

// Mileage Range Options
export const MILEAGE_RANGES = [
    { label: 'Semua Kilometer', min: 0, max: 0 },
    { label: 'Di bawah 10.000 km', min: 0, max: 10000 },
    { label: '10.000 - 30.000 km', min: 10000, max: 30000 },
    { label: '30.000 - 50.000 km', min: 30000, max: 50000 },
    { label: '50.000 - 100.000 km', min: 50000, max: 100000 },
    { label: 'Di atas 100.000 km', min: 100000, max: 0 },
] as const
