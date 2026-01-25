'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, TrendingDown, Calculator } from 'lucide-react'

interface CreditCalculatorProps {
    price: number
}

interface CalculationResult {
    downPayment: number
    loanAmount: number
    monthlyPayment: number
    totalPrice: number
    interest: number
}

const DOWN_PAYMENT_OPTIONS = [
    { value: 10, label: '10%' },
    { value: 20, label: '20%' },
    { value: 30, label: '30%' },
    { value: 40, label: '40%' },
    { value: 50, label: '50%' },
]

const TENOR_OPTIONS = [
    { value: 12, label: '12 bulan (1 tahun)' },
    { value: 24, label: '24 bulan (2 tahun)' },
    { value: 36, label: '36 bulan (3 tahun)' },
    { value: 48, label: '48 bulan (4 tahun)' },
    { value: 60, label: '60 bulan (5 tahun)' },
]

const INTEREST_RATES = [
    { value: 3.5, label: '3.5%' },
    { value: 4.5, label: '4.5%' },
    { value: 5.5, label: '5.5%' },
    { value: 6.5, label: '6.5%' },
    { value: 7.5, label: '7.5%' },
]

export function CreditCalculator({ price }: CreditCalculatorProps) {
    const [downPaymentPercent, setDownPaymentPercent] = useState(30)
    const [tenor, setTenor] = useState(60)
    const [interestRate, setInterestRate] = useState(5.5)
    const [isOpen, setIsOpen] = useState(false)

    const [result, setResult] = useState<CalculationResult>({
        downPayment: 0,
        loanAmount: 0,
        monthlyPayment: 0,
        totalPrice: 0,
        interest: 0,
    })

    useEffect(() => {
        const dp = Math.floor(price * (downPaymentPercent / 100))
        const loan = price - dp
        const totalInterest = Math.floor(loan * (interestRate / 100) * (tenor / 12))
        const total = loan + totalInterest
        const monthly = Math.floor(total / tenor)

        setResult({
            downPayment: dp,
            loanAmount: loan,
            monthlyPayment: monthly,
            totalPrice: total,
            interest: totalInterest,
        })
    }, [price, downPaymentPercent, tenor, interestRate])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-secondary text-sm">Simulasi Kredit</p>
                        <p className="text-xs text-gray-500">
                            Cicilan dari {formatCurrency(result.monthlyPayment)}/bulan
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                        {/* Down Payment */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Uang Muka (DP)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DOWN_PAYMENT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setDownPaymentPercent(option.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                            downPaymentPercent === option.value
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-primary mt-2">
                                {formatCurrency(result.downPayment)}
                            </p>
                        </div>

                        {/* Tenor */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Tenor
                            </label>
                            <div className="relative">
                                <select
                                    value={tenor}
                                    onChange={(e) => setTenor(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {TENOR_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Interest Rate */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Bunga (Flat)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_RATES.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setInterestRate(option.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                                            interestRate === option.value
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Result */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Pokok Hutang</span>
                                <span className="font-semibold text-secondary">{formatCurrency(result.loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Bunga</span>
                                <span className="font-semibold text-secondary">{formatCurrency(result.interest)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Total Pengembalian</span>
                                <span className="font-bold text-secondary">{formatCurrency(result.totalPrice)}</span>
                            </div>
                        </div>

                        {/* Monthly Payment Highlight */}
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Cicilan per Bulan</p>
                            <p className="text-2xl font-bold text-secondary">
                                {formatCurrency(result.monthlyPayment)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Selama {tenor / 12} {tenor / 12 === 1 ? 'tahun' : 'tahun'}
                            </p>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-gray-400 text-center">
                            *Simulasi ini hanya estimasi. Hubungi leasing untuk perhitungan yang lebih akurat.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
