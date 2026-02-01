'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FinanceOverview from './components/FinanceOverview'
import FinanceCharts from './components/FinanceCharts'
import FinanceTable from './components/FinanceTable'
import DateRangePicker from './components/DateRangePicker'
import { FinanceStats, FinanceTrends, Transaction } from './types'

export default function FinanceReportPage() {
    const router = useRouter()
    const [financeEnabled, setFinanceEnabled] = useState<boolean | null>(null)
    const [dateRange, setDateRange] = useState('30d')
    const [customRange, setCustomRange] = useState({ startDate: null as Date | null, endDate: null as Date | null })
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [stats, setStats] = useState<FinanceStats | null>(null)
    const [comparison, setComparison] = useState<any>(null)
    const [trends, setTrends] = useState<FinanceTrends | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const checkFinanceStatus = async () => {
            const response = await fetch('/api/user/finance-status')
            if (response.ok) {
                const data = await response.json()
                if (!data.financeEnabled) {
                    router.push('/dashboard')
                } else {
                    setFinanceEnabled(true)
                }
            }
        }
        checkFinanceStatus()
    }, [router])

    const fetchData = async (showRefreshLoading = false) => {
        if (showRefreshLoading) setRefreshing(true)
        else setLoading(true)

        try {
            const params = new URLSearchParams()
            params.append('range', dateRange)
            if (dateRange === 'custom' && customRange.startDate && customRange.endDate) {
                params.append('startDate', customRange.startDate.toISOString())
                params.append('endDate', customRange.endDate.toISOString())
            }

            const [statsRes, trendsRes] = await Promise.all([
                fetch(`/api/dashboard/finance/stats?${params}`),
                fetch(`/api/dashboard/finance/trends?${params}`)
            ])

            if (statsRes.ok && trendsRes.ok) {
                const [statsData, trendsData] = await Promise.all([statsRes.json(), trendsRes.json()])
                setStats(statsData.stats)
                setComparison(statsData.comparison)
                setTrends(trendsData.trends)
            }
        } catch (error) {
            console.error('Error fetching finance data:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, customRange])

    const handleDateRangeChange = (range: string) => {
        setDateRange(range)
        if (range === 'custom') {
            setShowCustomPicker(true)
        } else {
            setShowCustomPicker(false)
            setCustomRange({ startDate: null, endDate: null })
        }
    }

    const handleCustomDateApply = () => {
        if (customRange.startDate && customRange.endDate) {
            setDateRange('custom')
            setShowCustomPicker(false)
            fetchData()
        }
    }

    const handleRefresh = () => {
        fetchData(true)
    }

    if (financeEnabled === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!financeEnabled) {
        return null // Will redirect
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Laporan Keuangan
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Pantau performa keuangan dealer Anda
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="max-w-7xl mx-auto mb-6">
                <DateRangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    customRange={customRange}
                    onCustomRangeChange={setCustomRange}
                    showCustomPicker={showCustomPicker}
                    onCustomDateApply={handleCustomDateApply}
                />
            </div>

            {/* Finance Overview Cards */}
            <div className="max-w-7xl mx-auto mb-6">
                <FinanceOverview stats={stats} comparison={comparison} />
            </div>

            {/* Charts */}
            <div className="max-w-7xl mx-auto mb-6">
                <FinanceCharts trends={trends} />
            </div>

            {/* Transactions Table */}
            <div className="max-w-7xl mx-auto">
                <FinanceTable dateRange={dateRange} customRange={customRange} />
            </div>
        </div>
    )
}
