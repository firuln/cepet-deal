'use client'

import { Calendar } from 'lucide-react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DateRangePickerProps {
    value: string
    onChange: (value: string) => void
    customRange: { startDate: Date | null; endDate: Date | null }
    onCustomRangeChange: (range: { startDate: Date | null; endDate: Date | null }) => void
    showCustomPicker: boolean
    onCustomDateApply: () => void
}

const ranges = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: 'all', label: 'Semua' },
    { value: 'custom', label: 'Kustom' }
]

export default function DateRangePicker({
    value,
    onChange,
    customRange,
    onCustomRangeChange,
    showCustomPicker,
    onCustomDateApply
}: DateRangePickerProps) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                    {ranges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => onChange(range.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                value === range.value
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Pickers */}
                {showCustomPicker && (
                    <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <ReactDatePicker
                                selected={customRange.startDate}
                                onChange={(date) => onCustomRangeChange({ ...customRange, startDate: date })}
                                selectsStart
                                startDate={customRange.startDate}
                                endDate={customRange.endDate}
                                placeholderText="Dari"
                                dateFormat="dd/MM/yyyy"
                                className="bg-transparent text-sm text-gray-700 focus:outline-none"
                            />
                        </div>
                        <span className="text-gray-500">-</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <ReactDatePicker
                                selected={customRange.endDate}
                                onChange={(date) => onCustomRangeChange({ ...customRange, endDate: date })}
                                selectsEnd
                                startDate={customRange.startDate}
                                endDate={customRange.endDate}
                                minDate={customRange.startDate}
                                placeholderText="Sampai"
                                dateFormat="dd/MM/yyyy"
                                className="bg-transparent text-sm text-gray-700 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={onCustomDateApply}
                            disabled={!customRange.startDate || !customRange.endDate}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Terapkan
                        </button>
                    </div>
                )}
            </div>

            {/* Date Range Display */}
            {value !== 'custom' && (
                <div className="mt-3 text-sm text-gray-600">
                    Menampilkan data untuk {ranges.find(r => r.value === value)?.label.toLowerCase()} terakhir
                </div>
            )}
            {value === 'custom' && customRange.startDate && customRange.endDate && !showCustomPicker && (
                <div className="mt-3 text-sm text-gray-600">
                    Menampilkan data dari{' '}
                    <span className="font-medium">
                        {customRange.startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {' '}sampai{' '}
                    <span className="font-medium">
                        {customRange.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            )}
        </div>
    )
}
