import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatPrice } from './utils'

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

export interface FinanceTrends {
    daily: Array<{ date: string; revenue: number; sales: number; profit: number }>
    byPaymentMethod: Array<{ method: string; count: number; revenue: number; percentage: number }>
    byBrand: Array<{ brand: string; sales: number; revenue: number }>
    monthlyComparison: Array<{ month: string; revenue: number; sales: number }>
}

export interface Transaction {
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
}

export async function exportFinanceReportToPDF(
    stats: FinanceStats,
    trends: FinanceTrends,
    transactions: Transaction[],
    dateRange: string,
    customDate?: { startDate: Date; endDate: Date }
): Promise<Blob> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Add Indonesian font support for special characters
    doc.setFont('helvetica')

    // Helper function for text wrapping
    const addText = (text: string, x: number, y: number, options?: any) => {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
        doc.text(lines, x, y, options)
        return lines.length * 7
    }

    let yPos = margin

    // Title
    doc.setFontSize(20)
    doc.setTextColor(30, 41, 59)
    doc.text('Laporan Keuangan Dealer', pageWidth / 2, yPos, { align: 'center' })
    yPos += 12

    // Date Range
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    const dateRangeText = dateRange === 'custom' && customDate
        ? `${customDate.startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${customDate.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : `Periode: ${dateRange}`
    doc.text(dateRangeText, pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // Line separator
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // Summary Statistics Section
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Ringkasan Statistik', margin, yPos)
    yPos += 8

    // Summary Table
    autoTable(doc, {
        startY: yPos,
        head: [['Metrik', 'Nilai']],
        body: [
            ['Total Pendapatan', formatPrice(stats.totalRevenue)],
            ['Total Penjualan', stats.totalSales.toString()],
            ['Rata-rata Nilai Penjualan', formatPrice(stats.averageSaleValue)],
            ['Profit Bersih', formatPrice(stats.totalProfit)],
            ['Margin Profit', `${stats.profitMargin.toFixed(1)}%`],
            ['Penjualan Tunai', stats.cashSales.toString()],
            ['Penjualan Kredit', stats.creditSales.toString()],
            ['Total Terkumpul', formatPrice(stats.totalCollected)],
            ['Total Tertunda', formatPrice(stats.totalPending)],
            ['Tingkat Pengumpulan', `${stats.collectionRate.toFixed(1)}%`],
        ],
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 100, halign: 'right' },
        },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Check if we need a new page
    if (yPos > pageHeight - 80) {
        doc.addPage()
        yPos = margin
    }

    // Payment Method Distribution
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Distribusi Metode Pembayaran', margin, yPos)
    yPos += 8

    const paymentData = trends.byPaymentMethod.map(p => [
        p.method === 'CASH' ? 'Tunai' : 'Kredit',
        p.count.toString(),
        formatPrice(p.revenue),
        `${p.percentage.toFixed(1)}%`
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Metode', 'Jumlah', 'Pendapatan', 'Persentase']],
        body: paymentData,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: 'bold',
        },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Check if we need a new page
    if (yPos > pageHeight - 80) {
        doc.addPage()
        yPos = margin
    }

    // Brand Performance
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Performa Brand (Top 5)', margin, yPos)
    yPos += 8

    const brandData = trends.byBrand.map(b => [
        b.brand,
        b.sales.toString(),
        formatPrice(b.revenue)
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Brand', 'Penjualan', 'Pendapatan']],
        body: brandData,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [245, 158, 11],
            textColor: 255,
            fontStyle: 'bold',
        },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // New page for transactions
    doc.addPage()
    yPos = margin

    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Detail Transaksi', margin, yPos)
    yPos += 8

    // Transactions Table
    const transactionData = transactions.map(t => [
        t.receiptNumber,
        t.vehicle,
        t.buyer,
        t.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit',
        formatPrice(t.totalPrice),
        t.remainingPayment > 0 ? formatPrice(t.remainingPayment) : 'Lunas',
        new Date(t.createdAt).toLocaleDateString('id-ID')
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['No. Kwitansi', 'Kendaraan', 'Pembeli', 'Metode', 'Total', 'Sisa', 'Tanggal']],
        body: transactionData,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [139, 92, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 20 },
            6: { cellWidth: 25 },
        },
    })

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.text(
            `Halaman ${i} dari ${totalPages} | Cepet Deal - Laporan Keuangan Dealer`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        )
    }

    return doc.output('blob')
}

export async function exportFinanceReportToExcel(
    stats: FinanceStats,
    trends: FinanceTrends,
    transactions: Transaction[],
    dateRange: string,
    customDate?: { startDate: Date; endDate: Date }
): Promise<Blob> {
    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
        ['LAPORAN KEUANGAN DEALER'],
        [''],
        ['Periode', dateRange === 'custom' && customDate ? `${customDate.startDate.toLocaleDateString('id-ID')} - ${customDate.endDate.toLocaleDateString('id-ID')}` : dateRange],
        ['Dibuat', new Date().toLocaleString('id-ID')],
        [''],
        ['RINGKASAN STATISTIK'],
        [''],
        ['Metrik', 'Nilai'],
        ['Total Pendapatan', stats.totalRevenue],
        ['Total Penjualan', stats.totalSales],
        ['Rata-rata Nilai Penjualan', stats.averageSaleValue],
        ['Profit Bersih', stats.totalProfit],
        ['Margin Profit (%)', stats.profitMargin],
        ['Penjualan Tunai', stats.cashSales],
        ['Penjualan Kredit', stats.creditSales],
        ['Total Terkumpul', stats.totalCollected],
        ['Total Tertunda', stats.totalPending],
        ['Tingkat Pengumpulan (%)', stats.collectionRate],
        [''],
        ['DISTRIBUSI METODE PEMBAYARAN'],
        [''],
        ['Metode', 'Jumlah', 'Pendapatan', 'Persentase (%)'],
        ...trends.byPaymentMethod.map(p => [
            p.method === 'CASH' ? 'Tunai' : 'Kredit',
            p.count,
            p.revenue,
            p.percentage
        ]),
        [''],
        ['PERFORMA BRAND'],
        [''],
        ['Brand', 'Penjualan', 'Pendapatan'],
        ...trends.byBrand.map(b => [b.brand, b.sales, b.revenue]),
        [''],
        ['PERBANDINGAN BULANAN'],
        [''],
        ['Bulan', 'Pendapatan', 'Penjualan'],
        ...trends.monthlyComparison.map(m => [m.month, m.revenue, m.sales]),
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths for summary sheet
    summarySheet['!cols'] = [
        { wch: 25 },
        { wch: 20 }
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')

    // Transactions Sheet
    const transactionData = [
        ['DETAIL TRANSAKSI'],
        [''],
        ['No. Kwitansi', 'Kendaraan', 'Pembeli', 'Metode', 'Total', 'DP', 'Tanda Jadi', 'Terkumpul', 'Sisa', 'Tanggal'],
        ...transactions.map(t => [
            t.receiptNumber,
            t.vehicle,
            t.buyer,
            t.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit',
            t.totalPrice,
            t.downPayment,
            t.tandaJadi,
            t.collected,
            t.remainingPayment,
            new Date(t.createdAt).toLocaleDateString('id-ID')
        ])
    ]

    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)

    // Set column widths for transactions sheet
    transactionSheet['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 25 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 }
    ]

    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transaksi')

    // Daily Trends Sheet
    const dailyData = [
        ['TREN HARIAN'],
        [''],
        ['Tanggal', 'Pendapatan', 'Penjualan', 'Profit'],
        ...trends.daily.map(d => [
            new Date(d.date).toLocaleDateString('id-ID'),
            d.revenue,
            d.sales,
            d.profit
        ])
    ]

    const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)

    // Set column widths for daily trends sheet
    dailySheet['!cols'] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 }
    ]

    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Tren Harian')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
