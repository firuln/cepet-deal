'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinancingCalculatorWidgetProps {
  price: number
  title?: string
}

export function FinancingCalculatorWidget({ price, title = 'Estimasi Kredit' }: FinancingCalculatorWidgetProps) {
  const [dp, setDp] = useState(20) // Default 20% DP
  const [tenor, setTenor] = useState(5) // Default 5 years
  const [interestRate, setInterestRate] = useState(8) // Default 8%

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const principal = price - (price * dp / 100)
    const monthlyRate = interestRate / 100 / 12
    const months = tenor * 12

    if (monthlyRate === 0) {
      return principal / months
    }

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)

    return monthlyPayment
  }

  const monthlyPayment = calculateMonthlyPayment()
  const dpAmount = price * dp / 100

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-secondary">{title}</h3>
      </div>

      {/* Monthly Payment Highlight */}
      <div className="bg-white rounded-lg p-4 mb-4 text-center shadow-sm">
        <p className="text-xs text-gray-500 mb-1">Cicilan per bulanan</p>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(Math.round(monthlyPayment))}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {tenor} tahun x {interestRate}%
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        {/* Uang Muka (DP) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Uang Muka (DP)</label>
            <span className="text-xs font-semibold text-secondary">
              {dp}% ({formatCurrency(Math.round(dpAmount))})
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={dp}
            onChange={(e) => setDp(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            style={{ background: `linear-gradient(to right, primary ${dp}%, #e5e7eb ${dp}%)` }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Tenor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Tenor</label>
            <span className="text-xs font-semibold text-secondary">
              {tenor} tahun
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((year) => (
              <button
                key={year}
                onClick={() => setTenor(year)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  tenor === year
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Bunga */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Bunga</label>
            <span className="text-xs font-semibold text-secondary">
              {interestRate}%
            </span>
          </div>
          <div className="flex gap-2">
            {[8, 9, 10, 11, 12, 15].map((rate) => (
              <button
                key={rate}
                onClick={() => setInterestRate(rate)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  interestRate === rate
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Harga Mobil</span>
            <span className="font-medium text-secondary">{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Uang Muka</span>
            <span className="font-medium text-secondary">{formatCurrency(Math.round(dpAmount))}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="text-gray-500">Pokok Pinjaman</span>
            <span className="font-medium text-secondary">{formatCurrency(Math.round(price - dpAmount))}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <p>
            *Perhitungan estimasi. Hubungi dealer untuk penawaran terbaik.
          </p>
        </div>

        {/* CTA */}
        <button className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow">
          <TrendingUp className="w-4 h-4 mr-1.5 inline" />
          Ajukan Kredit
        </button>
      </div>
    </div>
  )
}
