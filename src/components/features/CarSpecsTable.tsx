'use client'

import { useState } from 'react'
import {
  Gauge,
  Ruler,
  Users,
  Fuel,
  Zap,
  Shield,
  Cog,
  Wind,
  Settings2,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Spec {
  label: string
  value: string | number
  unit?: string
  icon?: React.ElementType
}

interface SpecCategory {
  id: string
  title: string
  icon: React.ElementType
  specs: Spec[]
}

interface CarSpecsTableProps {
  // Engine Specs
  engineSize?: number
  fuelType?: string
  transmission?: string
  enginePower?: number
  engineTorque?: number
  cylinders?: number

  // Dimensions
  length?: number
  width?: number
  height?: number
  wheelbase?: number
  groundClearance?: number

  // Capacity
  seats?: number
  doors?: number
  fuelTank?: number
  luggageCapacity?: number

  // Performance
  topSpeed?: number
  acceleration?: number

  // Safety & Technology
  airbags?: number
  abs?: boolean
  esp?: boolean
  tractionControl?: boolean

  // Warranty
  warrantyYears?: number
  warrantyKm?: number

  // Custom specs (JSON)
  specs?: Record<string, any>
}

const FUEL_TYPE_LABELS: Record<string, string> = {
  PETROL: 'Bensin',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Listrik',
}

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  CVT: 'CVT',
}

export function CarSpecsTable({
  engineSize,
  fuelType,
  transmission,
  enginePower,
  engineTorque,
  cylinders,
  length,
  width,
  height,
  wheelbase,
  groundClearance,
  seats,
  doors,
  fuelTank,
  luggageCapacity,
  topSpeed,
  acceleration,
  airbags,
  abs,
  esp,
  tractionControl,
  warrantyYears,
  warrantyKm,
  specs,
}: CarSpecsTableProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Build spec categories from props
  const categories: SpecCategory[] = []

  // Engine Category
  const engineSpecs: Spec[] = []
  if (engineSize) engineSpecs.push({ label: 'Kapasitas', value: engineSize, unit: 'cc', icon: Gauge })
  if (fuelType) engineSpecs.push({ label: 'Bahan Bakar', value: FUEL_TYPE_LABELS[fuelType] || fuelType })
  if (transmission) engineSpecs.push({ label: 'Transmisi', value: TRANSMISSION_LABELS[transmission] || transmission })
  if (enginePower) engineSpecs.push({ label: 'Daya Maksimum', value: enginePower, unit: 'hp', icon: Zap })
  if (engineTorque) engineSpecs.push({ label: 'Torsi', value: engineTorque, unit: 'Nm', icon: Settings2 })
  if (cylinders) engineSpecs.push({ label: 'Silinder', value: cylinders })

  if (engineSpecs.length > 0) {
    categories.push({
      id: 'engine',
      title: 'Mesin & Performa',
      icon: Gauge,
      specs: engineSpecs
    })
  }

  // Dimensions Category
  const dimensionSpecs: Spec[] = []
  if (length) dimensionSpecs.push({ label: 'Panjang', value: length, unit: 'mm', icon: Ruler })
  if (width) dimensionSpecs.push({ label: 'Lebar', value: width, unit: 'mm' })
  if (height) dimensionSpecs.push({ label: 'Tinggi', value: height, unit: 'mm' })
  if (wheelbase) dimensionSpecs.push({ label: 'Jarak Poros Roda', value: wheelbase, unit: 'mm' })
  if (groundClearance) dimensionSpecs.push({ label: 'Ground Clearance', value: groundClearance, unit: 'mm' })

  if (dimensionSpecs.length > 0) {
    categories.push({
      id: 'dimensions',
      title: 'Dimensi',
      icon: Ruler,
      specs: dimensionSpecs
    })
  }

  // Capacity Category
  const capacitySpecs: Spec[] = []
  if (seats) capacitySpecs.push({ label: 'Kursi', value: seats, icon: Users })
  if (doors) capacitySpecs.push({ label: 'Pintu', value: doors })
  if (fuelTank) capacitySpecs.push({ label: 'Tangki Bahan Bakar', value: fuelTank, unit: 'L', icon: Fuel })
  if (luggageCapacity) capacitySpecs.push({ label: 'Kapasitas Bagasi', value: luggageCapacity, unit: 'L', icon: Wind })

  if (capacitySpecs.length > 0) {
    categories.push({
      id: 'capacity',
      title: 'Kapasitas',
      icon: Users,
      specs: capacitySpecs
    })
  }

  // Performance Category
  const performanceSpecs: Spec[] = []
  if (topSpeed) performanceSpecs.push({ label: 'Kecepatan Maks', value: topSpeed, unit: 'km/h', icon: Zap })
  if (acceleration) performanceSpecs.push({ label: '0-100 km/h', value: acceleration, unit: 'detik' })

  if (performanceSpecs.length > 0) {
    categories.push({
      id: 'performance',
      title: 'Performa',
      icon: Zap,
      specs: performanceSpecs
    })
  }

  // Safety Category
  const safetySpecs: Spec[] = []
  if (airbags) safetySpecs.push({ label: 'Airbags', value: airbags, unit: 'buah', icon: Shield })
  if (abs) safetySpecs.push({ label: 'ABS', value: 'Ada', icon: CheckCircle })
  if (esp) safetySpecs.push({ label: 'ESP', value: 'Ada', icon: CheckCircle })
  if (tractionControl) safetySpecs.push({ label: 'Traction Control', value: 'Ada', icon: CheckCircle })

  if (safetySpecs.length > 0) {
    categories.push({
      id: 'safety',
      title: 'Keamanan',
      icon: Shield,
      specs: safetySpecs
    })
  }

  // Warranty Category
  const warrantySpecs: Spec[] = []
  if (warrantyYears) warrantySpecs.push({ label: 'Garansi Pabrikan', value: `${warrantyYears} tahun`, icon: CheckCircle })
  if (warrantyKm) warrantySpecs.push({ label: 'Garansi Kilometer', value: `${warrantyKm} km`, icon: CheckCircle })

  if (warrantySpecs.length > 0) {
    categories.push({
      id: 'warranty',
      title: 'Garansi',
      icon: CheckCircle,
      specs: warrantySpecs
    })
  }

  // Custom specs from JSON
  if (specs && Object.keys(specs).length > 0) {
    const customSpecs: Spec[] = []
    Object.entries(specs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        customSpecs.push({ label: key, value: String(value) })
      }
    })
    if (customSpecs.length > 0) {
      categories.push({
        id: 'custom',
        title: 'Lainnya',
        icon: Cog,
        specs: customSpecs
      })
    }
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Cog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Spesifikasi belum tersedia</p>
      </div>
    )
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = category.icon
        const isExpanded = expandedCategory === category.id

        return (
          <div
            key={category.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-secondary">{category.title}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {category.specs.length} item
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y sm:divide-x-0 sm:divide-y-0">
                  {category.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="p-4 flex items-start gap-2 hover:bg-gray-50 transition-colors"
                    >
                      {spec.icon && (
                        <spec.icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{spec.label}</p>
                        <p className="font-medium text-secondary text-sm">
                          {spec.value}
                          {spec.unit && <span className="text-gray-400"> {spec.unit}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
