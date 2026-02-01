'use client'

import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, TooltipProps } from 'recharts'
import { formatPrice } from '@/lib/utils'
import { FinanceTrends } from '../types'

interface FinanceChartsProps {
    trends: FinanceTrends | null
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function FinanceCharts({ trends }: FinanceChartsProps) {
    if (!trends) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-48 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Format daily data for the chart
    const dailyData = trends.daily.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }))

    // Format payment method data for pie chart
    const paymentData = trends.byPaymentMethod.map(p => ({
        name: p.method === 'CASH' ? 'Tunai' : 'Kredit',
        value: p.revenue,
        count: p.count,
        percentage: p.percentage
    }))

    // Format brand data for bar chart
    const brandData = trends.byBrand.map(b => ({
        name: b.brand,
        penjualan: b.sales,
        pendapatan: b.revenue
    }))

    interface LineChartPayload {
        name: string
        value: number
        color: string
    }

    const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                    {payload.map((entry: LineChartPayload, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Penjualan' ? entry.value : formatPrice(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const CustomPieTooltip = ({ active, payload }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as { name: string; value: number; count: number; percentage: number }
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(data.value)}</p>
                    <p className="text-sm text-gray-500">{data.count} transaksi</p>
                    <p className="text-sm font-semibold text-gray-700">{data.percentage.toFixed(1)}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Pendapatan</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickFormatter={(value: number) => formatPrice(value).split(',')[0]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Pendapatan"
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Profit"
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Metode Pembayaran</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={paymentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: { name: string; percentage: number }) => `${entry.name} (${entry.percentage.toFixed(1)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {paymentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Brand Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa Brand (Top 5)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={brandData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            type="category"
                            dataKey="name"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickFormatter={(value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                        />
                        <YAxis
                            type="number"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickFormatter={(value: number) => formatPrice(value).split(',')[0]}
                        />
                        <Tooltip
                            content={({ active, payload }: TooltipProps<any, any>) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as { name: string; penjualan: number; pendapatan: number }
                                    return (
                                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">{data.name}</p>
                                            <p className="text-sm text-gray-600">Penjualan: {data.penjualan}</p>
                                            <p className="text-sm text-gray-600">Pendapatan: {formatPrice(data.pendapatan)}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="pendapatan" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
