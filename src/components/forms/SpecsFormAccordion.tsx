'use client'

import { useState } from 'react'
import {
    ChevronDown,
    Gauge,
    Ruler,
    Users,
    Shield,
    Zap,
    Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export interface SpecsFormData {
    // Engine & Performance
    enginePower?: number
    engineTorque?: number
    cylinders?: number
    topSpeed?: number
    acceleration?: number

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

    // Warranty
    warrantyYears?: number
    warrantyKm?: number

    // Safety
    airbags?: number
    abs?: boolean
    esp?: boolean
    tractionControl?: boolean
}

interface SpecsFormAccordionProps {
    data?: Partial<SpecsFormData>
    onChange?: (data: Partial<SpecsFormData>) => void
    defaultOpen?: boolean
    defaultOpenSections?: string[]
}

const SPEC_SECTIONS = [
    {
        id: 'engine',
        title: 'Mesin & Performa',
        icon: Gauge,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        fields: [
            {
                name: 'enginePower',
                label: 'Daya Maksimum',
                placeholder: 'Contoh: 120',
                suffix: 'hp',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'engineTorque',
                label: 'Torsi',
                placeholder: 'Contoh: 200',
                suffix: 'Nm',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'cylinders',
                label: 'Silinder',
                placeholder: 'Contoh: 4',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'topSpeed',
                label: 'Kecepatan Maksimum',
                placeholder: 'Contoh: 180',
                suffix: 'km/h',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'acceleration',
                label: 'Akselerasi (0-100 km/h)',
                placeholder: 'Contoh: 10.5',
                suffix: 'detik',
                type: 'number',
                step: '0.1',
                halfWidth: false,
            },
        ],
    },
    {
        id: 'dimensions',
        title: 'Dimensi',
        icon: Ruler,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        fields: [
            {
                name: 'length',
                label: 'Panjang',
                placeholder: 'Contoh: 4500',
                suffix: 'mm',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'width',
                label: 'Lebar',
                placeholder: 'Contoh: 1800',
                suffix: 'mm',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'height',
                label: 'Tinggi',
                placeholder: 'Contoh: 1600',
                suffix: 'mm',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'wheelbase',
                label: 'Jarak Poros Roda',
                placeholder: 'Contoh: 2700',
                suffix: 'mm',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'groundClearance',
                label: 'Ground Clearance',
                placeholder: 'Contoh: 180',
                suffix: 'mm',
                type: 'number',
                halfWidth: false,
            },
        ],
    },
    {
        id: 'capacity',
        title: 'Kapasitas',
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        fields: [
            {
                name: 'seats',
                label: 'Jumlah Kursi',
                placeholder: 'Contoh: 5',
                suffix: 'kursi',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'doors',
                label: 'Jumlah Pintu',
                placeholder: 'Contoh: 4',
                suffix: 'pintu',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'fuelTank',
                label: 'Kapasitas Tangki',
                placeholder: 'Contoh: 50',
                suffix: 'Liter',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'luggageCapacity',
                label: 'Kapasitas Bagasi',
                placeholder: 'Contoh: 500',
                suffix: 'Liter',
                type: 'number',
                halfWidth: true,
            },
        ],
    },
    {
        id: 'warranty',
        title: 'Garansi',
        icon: Shield,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        fields: [
            {
                name: 'warrantyYears',
                label: 'Garansi Pabrikan',
                placeholder: 'Contoh: 3',
                suffix: 'tahun',
                type: 'number',
                halfWidth: true,
            },
            {
                name: 'warrantyKm',
                label: 'Garansi Kilometer',
                placeholder: 'Contoh: 100000',
                suffix: 'km',
                type: 'number',
                halfWidth: true,
            },
        ],
    },
    {
        id: 'safety',
        title: 'Keamanan',
        icon: Zap,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        fields: [
            {
                name: 'airbags',
                label: 'Jumlah Airbag',
                placeholder: 'Contoh: 2',
                suffix: 'airbag',
                type: 'number',
                halfWidth: true,
            },
        ],
        checkboxFields: [
            {
                name: 'abs',
                label: 'ABS (Anti-lock Braking System)',
                halfWidth: true,
            },
            {
                name: 'esp',
                label: 'ESP (Electronic Stability Program)',
                halfWidth: true,
            },
            {
                name: 'tractionControl',
                label: 'Traction Control',
                halfWidth: true,
            },
        ],
    },
]

export function SpecsFormAccordion({
    data = {},
    onChange,
    defaultOpen = false,
    defaultOpenSections = [],
}: SpecsFormAccordionProps) {
    const [openSections, setOpenSections] = useState<Set<string>>(
        new Set(defaultOpen ? SPEC_SECTIONS.map(s => s.id) : defaultOpenSections)
    )

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId)
            } else {
                newSet.add(sectionId)
            }
            return newSet
        })
    }

    const updateField = (name: string, value: string | number | boolean) => {
        const newData = { ...data, [name]: value }
        onChange?.(newData)
    }

    const getFieldValue = (name: string): string => {
        const value = data[name as keyof SpecsFormData]
        if (typeof value === 'boolean') return value.toString()
        return value?.toString() || ''
    }

    const getFilledFieldsCount = (section: typeof SPEC_SECTIONS[0]) => {
        const allFields = [
            ...section.fields.map(f => f.name),
            ...(section.checkboxFields?.map(f => f.name) || []),
        ]
        return allFields.filter(name => {
            const value = data[name as keyof SpecsFormData]
            return value !== undefined && value !== '' && value !== false
        }).length
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base sm:text-lg font-semibold text-secondary">
                            Spesifikasi Teknis
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Lengkapi spesifikasi teknis mobil baru (Opsional)
                        </p>
                    </div>
                    <Badge variant="info" size="sm">
                        {SPEC_SECTIONS.length} Kategori
                    </Badge>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-3 sm:p-4 bg-blue-50 border-b border-blue-100">
                <p className="text-xs sm:text-sm text-blue-700">
                    <span className="font-medium">Tips:</span> Klik pada setiap kategori untuk mengisi spesifikasi.
                    Semua field bersifat opsional, isi data yang tersedia saja.
                </p>
            </div>

            {/* Accordion Sections */}
            <div className="divide-y divide-gray-100">
                {SPEC_SECTIONS.map((section) => {
                    const Icon = section.icon
                    const isOpen = openSections.has(section.id)
                    const filledCount = getFilledFieldsCount(section)

                    return (
                        <div key={section.id} className="transition-all duration-200">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className={cn(
                                    'w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors',
                                    isOpen && 'bg-gray-50'
                                )}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={cn(
                                        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                        section.bgColor
                                    )}>
                                        <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', section.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn(
                                                'text-sm sm:text-base font-semibold transition-colors',
                                                isOpen ? section.color : 'text-gray-700'
                                            )}>
                                                {section.title}
                                            </span>
                                            {filledCount > 0 && (
                                                <Badge variant="success" size="sm">
                                                    {filledCount} terisi
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                                                    {section.fields.length + (section.checkboxFields?.length || 0)} field tersedia
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                'w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
                                                isOpen && 'rotate-180'
                                            )}
                                        />
                                    </button>

                                    {/* Section Content */}
                                    {isOpen && (
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                {/* Number Input Fields */}
                                                {section.fields.map((field) => (
                                                    <div
                                                        key={field.name}
                                                        className={field.halfWidth ? '' : 'sm:col-span-2'}
                                                    >
                                                        <Input
                                                            label={field.label}
                                                            placeholder={field.placeholder}
                                                            type={field.type}
                                                            step={field.step}
                                                            value={getFieldValue(field.name)}
                                                            onChange={(e) => {
                                                                const value = field.step
                                                                    ? parseFloat(e.target.value)
                                                                    : parseInt(e.target.value) || 0
                                                                updateField(field.name, value)
                                                            }}
                                                            helperText={field.suffix ? `Satuan: ${field.suffix}` : undefined}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Checkbox Fields (for Safety section) */}
                                                {section.checkboxFields?.map((field) => (
                                                    <div
                                                        key={field.name}
                                                        className={field.halfWidth ? '' : 'sm:col-span-2'}
                                                    >
                                                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={getFieldValue(field.name) === 'true'}
                                                                onChange={(e) => updateField(field.name, e.target.checked)}
                                                                className="w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {field.label}
                                                            </span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Section Footer Info */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">
                                                    * Semua field di bagian ini bersifat opsional
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                    )
                })}
            </div>

            {/* Overall Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Total {Object.keys(data).length} spesifikasi terisi dari {SPEC_SECTIONS.reduce((acc, s) => acc + s.fields.length + (s.checkboxFields?.length || 0), 0)} field
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                                                            onClick={() => setOpenSections(new Set(SPEC_SECTIONS.map(s => s.id)))}
                                                            className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                                        >
                                                            Buka Semua
                                                        </button>
                                                        <span className="text-gray-300">•</span>
                                                        <button
                                                            onClick={() => setOpenSections(new Set())}
                                                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                                        >
                                                            Tutup Semua
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

export function NewCarSpecsFormAccordion(props: SpecsFormAccordionProps) {
    return (
        <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-amber-600 text-xs sm:text-sm font-semibold">i</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-amber-800 font-medium mb-1">
                                                            Form Spesifikasi Mobil Baru
                                                        </p>
                                                        <p className="text-xs text-amber-700">
                                                            Form ini dirancang khusus untuk mobil baru. Semua spesifikasi bersifat opsional - isi hanya data yang tersedia dari brosur atau website resmi pabrikan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <SpecsFormAccordion {...props} />
                                        </div>
                                    )
                                }
