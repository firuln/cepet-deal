'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingDown, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function CalculatorPage() {
    const [price, setPrice] = useState('')
    const [downPayment, setDownPayment] = useState('20') // percentage
    const [downPaymentType, setDownPaymentType] = useState<'percentage' | 'amount'>('percentage')
    const [tenor, setTenor] = useState('5') // years
    const [interestRate, setInterestRate] = useState('8') // annual percentage

    // Calculated values
    const [monthlyPayment, setMonthlyPayment] = useState(0)
    const [totalPayment, setTotalPayment] = useState(0)
    const [totalInterest, setTotalInterest] = useState(0)
    const [loanAmount, setLoanAmount] = useState(0)

    useEffect(() => {
        calculateLoan()
    }, [price, downPayment, downPaymentType, tenor, interestRate])

    const calculateLoan = () => {
        const carPrice = parseFloat(price) || 0
        if (carPrice === 0) {
            setMonthlyPayment(0)
            setTotalPayment(0)
            setTotalInterest(0)
            setLoanAmount(0)
            return
        }

        let dpAmount = 0
        if (downPaymentType === 'percentage') {
            dpAmount = carPrice * (parseFloat(downPayment) || 0) / 100
        } else {
            dpAmount = parseFloat(downPayment) || 0
        }

        const principal = carPrice - dpAmount
        const annualRate = parseFloat(interestRate) || 0
        const years = parseInt(tenor) || 1

        if (principal <= 0 || years <= 0) {
            setMonthlyPayment(0)
            setTotalPayment(0)
            setTotalInterest(0)
            setLoanAmount(0)
            return
        }

        // Calculate monthly interest rate
        const monthlyRate = annualRate / 100 / 12
        const numberOfPayments = years * 12

        let monthly = 0
        if (annualRate === 0) {
            monthly = principal / numberOfPayments
        } else {
            monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        }

        const total = monthly * numberOfPayments
        const interest = total - principal

        setLoanAmount(principal)
        setMonthlyPayment(monthly)
        setTotalPayment(total)
        setTotalInterest(interest)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const handleQuickPrice = (value: string) => {
        setPrice(value)
    }

    const handleQuickTenor = (years: string) => {
        setTenor(years)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Calculator className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-secondary">Kalkulator Kredit Mobil</h1>
                    </div>
                    <p className="text-gray-600">
                        Hitung cicilan kredit mobil dengan mudah
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Calculator Form */}
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h2 className="text-lg font-semibold text-secondary">Detail Kredit</h2>

                            {/* Harga Mobil */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Harga Mobil
                                    </label>
                                    {price && (
                                        <span className="text-sm text-gray-500">
                                            {formatCurrency(parseFloat(price) || 0)}
                                        </span>
                                    )}
                                </div>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 250000000"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                                {/* Quick Price Buttons */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {[
                                        { label: '100 Juta', value: '100000000' },
                                        { label: '200 Juta', value: '200000000' },
                                        { label: '300 Juta', value: '300000000' },
                                        { label: '500 Juta', value: '500000000' },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => handleQuickPrice(item.value)}
                                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Down Payment */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Uang Muka (DP)
                                    </label>
                                    <div className="flex items-center gap-1 ml-auto">
                                        <button
                                            type="button"
                                            onClick={() => setDownPaymentType('percentage')}
                                            className={`px-2 py-0.5 text-xs rounded ${
                                                downPaymentType === 'percentage'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            %
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDownPaymentType('amount')}
                                            className={`px-2 py-0.5 text-xs rounded ${
                                                downPaymentType === 'amount'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            Rp
                                        </button>
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    placeholder={downPaymentType === 'percentage' ? '20' : '50000000'}
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
                                />
                                {downPaymentType === 'percentage' && price && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency((parseFloat(price) || 0) * (parseFloat(downPayment) || 0) / 100)}
                                    </p>
                                )}
                            </div>

                            {/* Tenor */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Tenor (Tahun)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={tenor}
                                    onChange={(e) => setTenor(e.target.value)}
                                />
                                {/* Quick Tenor Buttons */}
                                <div className="flex gap-2 mt-2">
                                    {['1', '3', '5', '7'].map((years) => (
                                        <button
                                            key={years}
                                            onClick={() => handleQuickTenor(years)}
                                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                                tenor === years
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {years} Thn
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bunga */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Bunga per Tahun (%)
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="20"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2">
                                    {['5', '8', '10', '12'].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => setInterestRate(rate)}
                                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                                interestRate === rate
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    <div className="space-y-4">
                        {/* Monthly Payment */}
                        <Card className="bg-primary text-white">
                            <CardContent className="p-6 text-center">
                                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                <p className="text-sm opacity-90 mb-1">Cicilan per Bulan</p>
                                <p className="text-4xl font-bold">
                                    {formatCurrency(monthlyPayment)}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Breakdown */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-secondary">Rincian Kredit</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Harga Mobil</span>
                                        <span className="font-semibold">{formatCurrency(parseFloat(price) || 0)}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Uang Muka (DP)</span>
                                        <span className="font-semibold text-red-500">
                                            -{formatCurrency(
                                                downPaymentType === 'percentage'
                                                    ? (parseFloat(price) || 0) * (parseFloat(downPayment) || 0) / 100
                                                    : parseFloat(downPayment) || 0
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Plafon Pinjaman</span>
                                        <span className="font-semibold">{formatCurrency(loanAmount)}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Tenor</span>
                                        <span className="font-semibold">{tenor} Tahun ({parseInt(tenor) * 12} Bulan)</span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Bunga per Tahun</span>
                                        <span className="font-semibold">{interestRate}%</span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Total Bunga</span>
                                        <span className="font-semibold text-amber-600">
                                            {formatCurrency(totalInterest)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 bg-primary/5 -mx-2 px-2 rounded">
                                        <span className="font-semibold text-secondary">Total Pembayaran</span>
                                        <span className="font-bold text-lg text-primary">
                                            {formatCurrency(totalPayment)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info */}
                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                                Perhitungan ini adalah estimasi. Actual cicilan mungkin berbeda tergantung
                                kebijakan leasing dan biaya administrasi.
                            </p>
                        </div>
                    </div>
                </div>
        </div>
    )
}
