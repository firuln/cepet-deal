'use client'

import { useState } from 'react'
import { SpecsFormAccordion, SpecsFormData } from '@/components/forms/SpecsFormAccordion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

/**
 * Demo Page for SpecsFormAccordion Component
 *
 * Visit: /demo/specs-form
 *
 * This page showcases the SpecsFormAccordion component with:
 * - Interactive demo with live data preview
 * - Example data loading
 * - Reset functionality
 * - Integration examples
 */
export default function SpecsFormDemoPage() {
    const [specs, setSpecs] = useState<Partial<SpecsFormData>>({})

    // Example data for a Toyota Avanza
    const exampleData: Partial<SpecsFormData> = {
        enginePower: 106,
        engineTorque: 140,
        cylinders: 4,
        topSpeed: 170,
        acceleration: 12.5,
        length: 4190,
        width: 1660,
        height: 1695,
        wheelbase: 2655,
        groundClearance: 200,
        seats: 7,
        doors: 5,
        fuelTank: 45,
        luggageCapacity: 268,
        warrantyYears: 3,
        warrantyKm: 100000,
        airbags: 2,
        abs: true,
        esp: false,
        tractionControl: false,
    }

    // Example data for a Honda Brio RS
    const exampleData2: Partial<SpecsFormData> = {
        enginePower: 120,
        engineTorque: 173,
        cylinders: 4,
        topSpeed: 180,
        acceleration: 10.8,
        length: 3815,
        width: 1680,
        height: 1485,
        wheelbase: 2525,
        groundClearance: 165,
        seats: 5,
        doors: 5,
        fuelTank: 40,
        luggageCapacity: 258,
        warrantyYears: 5,
        warrantyKm: 150000,
        airbags: 6,
        abs: true,
        esp: true,
        tractionControl: true,
    }

    const loadExample = (data: Partial<SpecsFormData>) => {
        setSpecs(data)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const resetForm = () => {
        setSpecs({})
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = () => {
        console.log('Submitting specs:', specs)
        alert(`Spesifikasi berhasil disimpan!\n\nTotal fields: ${Object.keys(specs).length}\nCek console untuk detail JSON.`)
    }

    const filledCount = Object.keys(specs).length
    const totalCount = 19 // Total number of fields across all sections

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Specs Form Accordion
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        Demo Komponen Spesifikasi Teknis Mobil Baru
                    </p>
                </div>

                {/* Info Card */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600">5</div>
                                <div className="text-xs sm:text-sm text-blue-700 mt-1">Kategori</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalCount}</div>
                                <div className="text-xs sm:text-sm text-green-700 mt-1">Total Fields</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{filledCount}</div>
                                <div className="text-xs sm:text-sm text-purple-700 mt-1">Terisi</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadExample(exampleData)}
                            >
                                Load Avanza
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadExample(exampleData2)}
                            >
                                Load Brio RS
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetForm}
                            >
                                Reset Form
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit}
                                className="ml-auto"
                            >
                                Simpan Spesifikasi
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* JSON Preview */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Live Data Preview (JSON)
                            </h3>
                            <span className="text-xs text-gray-500">
                                {filledCount} of {totalCount} fields filled
                            </span>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs text-green-400 font-mono">
                                {JSON.stringify(specs, null, 2)}
                            </pre>
                        </div>
                        {filledCount === 0 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Belum ada data yang diisi. Coba load contoh data atau isi form di bawah.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Main Form */}
                <SpecsFormAccordion
                    data={specs}
                    onChange={setSpecs}
                    defaultOpen={false}
                />

                {/* Usage Guide */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Panduan Penggunaan
                        </h3>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">1. Cara Mengisi</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Klik pada kategori untuk membuka/menutup form</li>
                                    <li>Isi field yang tersedia (semua opsional)</li>
                                    <li>Data akan tersimpan otomatis saat diinput</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">2. Fitur</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Responsive design untuk mobile & desktop</li>
                                    <li>Progress indicator per kategori</li>
                                    <li>Buka/tutup semua kategori dengan tombol di bawah</li>
                                    <li>Badge menampilkan jumlah field yang terisi</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">3. Integrasi</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Import: <code className="bg-gray-100 px-2 py-0.5 rounded">import &#123; SpecsFormAccordion &#125; from '@/components/forms/SpecsFormAccordion'</code></li>
                                    <li>Pass data state via <code className="bg-gray-100 px-2 py-0.5 rounded">data</code> prop</li>
                                    <li>Handle changes via <code className="bg-gray-100 px-2 py-0.5 rounded">onChange</code> prop</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 py-4">
                    <p>SpecsFormAccordion Component Demo</p>
                    <p className="mt-1">Built with React, TypeScript, and Tailwind CSS</p>
                </div>
            </div>
        </div>
    )
}
