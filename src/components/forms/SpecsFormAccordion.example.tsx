'use client'

import { useState } from 'react'
import { SpecsFormAccordion, SpecsFormData } from './SpecsFormAccordion'
import { Button } from '@/components/ui/Button'

/**
 * Example usage of SpecsFormAccordion component
 *
 * This file demonstrates how to integrate the SpecsFormAccordion
 * into your multi-step form or standalone page.
 */
export function SpecsFormExample() {
    const [specs, setSpecs] = useState<Partial<SpecsFormData>>({
        // Pre-fill some example data
        enginePower: 120,
        engineTorque: 200,
        cylinders: 4,
        seats: 5,
        fuelTank: 50,
        abs: true,
        esp: false,
    })

    const handleSubmit = () => {
        console.log('Submitting specs:', specs)
        // Handle form submission
        alert('Spesifikasi berhasil disimpan! Cek console untuk detail.')
    }

    const handleReset = () => {
        setSpecs({})
    }

    const loadExampleData = () => {
        setSpecs({
            enginePower: 150,
            engineTorque: 250,
            cylinders: 4,
            topSpeed: 200,
            acceleration: 8.5,
            length: 4550,
            width: 1820,
            height: 1680,
            wheelbase: 2750,
            groundClearance: 185,
            seats: 7,
            doors: 5,
            fuelTank: 55,
            luggageCapacity: 480,
            warrantyYears: 5,
            warrantyKm: 150000,
            airbags: 6,
            abs: true,
            esp: true,
            tractionControl: true,
        })
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Contoh Form Spesifikasi Teknis
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Demo penggunaan SpecsFormAccordion untuk form mobil baru
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadExampleData}
                >
                    Load Contoh Data
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                >
                    Reset Form
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                >
                    Simpan Spesifikasi
                </Button>
            </div>

            {/* JSON Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Data Preview (JSON):
                </h3>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(specs, null, 2)}
                </pre>
            </div>

            {/* The Accordion Form */}
            <SpecsFormAccordion
                data={specs}
                onChange={setSpecs}
                defaultOpen={false}
                defaultOpenSections={['engine', 'dimensions']}
            />
        </div>
    )
}

/**
 * Example: Integration with Multi-Step Form
 */
export function MultiStepFormExample() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        price: '',
        specs: {} as Partial<SpecsFormData>,
    })

    const updateSpecs = (specs: Partial<SpecsFormData>) => {
        setFormData(prev => ({ ...prev, specs }))
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-4 mb-6">
                {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentStep >= step
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {step}
                        </div>
                        {step < 5 && (
                            <div className={`w-16 h-1 ${
                                currentStep > step ? 'bg-primary' : 'bg-gray-200'
                            }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 5: Specs Form */}
            {currentStep === 5 && (
                <SpecsFormAccordion
                    data={formData.specs}
                    onChange={updateSpecs}
                    defaultOpen={true}
                />
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                    disabled={currentStep === 5}
                    className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

/**
 * Example: Minimal Integration
 */
export function MinimalExample() {
    const [specs, setSpecs] = useState<Partial<SpecsFormData>>({})

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Spesifikasi Mobil</h1>
            <SpecsFormAccordion
                data={specs}
                onChange={setSpecs}
            />
        </div>
    )
}
