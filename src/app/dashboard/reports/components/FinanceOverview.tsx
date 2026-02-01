'use client'

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, PiggyBank, Percent, CheckCircle, Clock } from 'lucide-react'
import { formatPrice, formatNumber } from '@/lib/utils'
import { FinanceStats, FinanceComparison } from '../types'

interface StatCardProps {
    title: string
    value: string
    change?: number
    icon: React.ElementType
    iconColor: string
    iconBg: string
}

function StatCard({ title, value, change, icon: Icon, iconColor, iconBg }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
                            <span className="text-gray-500 ml-1">vs periode lalu</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    )
}

interface FinanceOverviewProps {
    stats: FinanceStats | null
    comparison?: FinanceComparison
}

export default function FinanceOverview({ stats, comparison }: FinanceOverviewProps) {
    if (!stats) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
                title="Total Pendapatan"
                value={formatPrice(stats.totalRevenue)}
                change={comparison?.revenueChange}
                icon={DollarSign}
                iconColor="text-green-600"
                iconBg="bg-green-100"
            />
            <StatCard
                title="Total Penjualan"
                value={formatNumber(stats.totalSales)}
                change={comparison?.salesChange}
                icon={ShoppingCart}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
            />
            <StatCard
                title="Profit Bersih"
                value={formatPrice(stats.totalProfit)}
                change={comparison?.profitChange}
                icon={PiggyBank}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
            />
            <StatCard
                title="Margin Profit"
                value={`${(stats.profitMargin ?? 0).toFixed(1)}%`}
                icon={Percent}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
            />
            <StatCard
                title="Terkumpul"
                value={formatPrice(stats.totalCollected)}
                icon={CheckCircle}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
            />
            <StatCard
                title="Tertunda"
                value={formatPrice(stats.totalPending)}
                icon={Clock}
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
            />
        </div>
    )
}
