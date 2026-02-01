export interface FinanceStats {
    totalRevenue: number
    totalSales: number
    averageSaleValue: number
    totalProfit: number
    profitMargin: number
    cashSales: number
    creditSales: number
    totalCollected: number
    totalPending: number
    collectionRate: number
}

export interface FinanceComparison {
    revenueChange: number
    salesChange: number
    profitChange: number
}

export interface DailyTrend {
    date: string
    revenue: number
    sales: number
    profit: number
}

export interface PaymentMethodDistribution {
    method: string
    count: number
    revenue: number
    percentage: number
}

export interface BrandPerformance {
    brand: string
    sales: number
    revenue: number
}

export interface MonthlyComparison {
    month: string
    revenue: number
    sales: number
}

export interface FinanceTrends {
    daily: DailyTrend[]
    byPaymentMethod: PaymentMethodDistribution[]
    byBrand: BrandPerformance[]
    monthlyComparison: MonthlyComparison[]
}

export interface Transaction {
    id: string
    receiptNumber: string
    vehicle: string
    buyer: string
    paymentMethod: string
    totalPrice: number
    downPayment: number
    tandaJadi: number
    remainingPayment: number
    collected: number
    createdAt: Date
    listingId: string
}

export interface PaginationInfo {
    total: number
    page: number
    limit: number
    totalPages: number
}
