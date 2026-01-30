import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/receipts/[id]/pdf - Generate PDF receipt
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            brand: true,
            model: true,
            user: {
              include: {
                dealer: true,
              },
            },
          },
        },
      },
    })

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Verify ownership
    if (receipt.dealerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate HTML for PDF
    const html = generateReceiptHTML(receipt)

    // Return HTML that can be printed to PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="kwitansi-${receipt.receiptNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generateReceiptHTML(receipt: any): string {
  const dealer = receipt.listing.user.dealer
  const listing = receipt.listing
  const formatDate = new Date(receipt.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount))
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwitansi - ${receipt.receiptNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #e63946;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #e63946;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .receipt-number {
      color: #666;
      font-size: 14px;
    }
    .dealer-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .dealer-info h2 {
      color: #1d3557;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .dealer-info p {
      color: #555;
      font-size: 14px;
      margin: 5px 0;
    }
    .section-title {
      color: #1d3557;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }
    .car-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .detail-item {
      background: #f8f9fa;
      padding: 12px 15px;
      border-radius: 6px;
    }
    .detail-label {
      color: #666;
      font-size: 12px;
      margin-bottom: 3px;
    }
    .detail-value {
      color: #1d3557;
      font-size: 15px;
      font-weight: 600;
    }
    .buyer-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .payment-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .payment-row:last-child {
      border-bottom: none;
    }
    .payment-label {
      color: #555;
      font-size: 14px;
    }
    .payment-value {
      color: #1d3557;
      font-size: 16px;
      font-weight: 600;
    }
    .total-row {
      background: #e63946;
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }
    .total-row .payment-label,
    .total-row .payment-value {
      color: white;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-left p {
      color: #666;
      font-size: 12px;
      margin: 5px 0;
    }
    .signature {
      text-align: center;
    }
    .signature-box {
      border: 2px dashed #adb5bd;
      padding: 30px 50px;
      border-radius: 6px;
      margin-top: 10px;
    }
    .signature-box p {
      color: #555;
      font-size: 14px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .receipt-container {
        box-shadow: none;
        padding: 20px;
      }
    }
    @media (max-width: 600px) {
      .receipt-container {
        padding: 20px;
      }
      .car-details {
        grid-template-columns: 1fr;
      }
      .footer {
        flex-direction: column;
        gap: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>KWITANSI TRANSAKSI</h1>
      <p class="receipt-number">Nomor: ${receipt.receiptNumber}</p>
      <p class="receipt-number">Tanggal: ${formatDate}</p>
    </div>

    <div class="dealer-info">
      <h2>${dealer?.companyName || 'Dealer Mobil'}</h2>
      <p>${dealer?.address || ''}</p>
      <p>${dealer?.city || ''}</p>
    </div>

    <div class="section-title">Detail Kendaraan</div>
    <div class="car-details">
      <div class="detail-item">
        <div class="detail-label">Merk & Model</div>
        <div class="detail-value">${listing.brand.name} ${listing.model.name}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Tahun</div>
        <div class="detail-value">${listing.year}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Transmisi</div>
        <div class="detail-value">${listing.transmission === 'AUTOMATIC' ? 'Otomatis' : listing.transmission === 'MANUAL' ? 'Manual' : 'CVT'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Warna</div>
        <div class="detail-value">${listing.color}</div>
      </div>
    </div>

    <div class="section-title">Informasi Pembeli</div>
    <div class="buyer-info">
      <p><strong>Nama:</strong> ${receipt.buyerName}</p>
      <p><strong>Alamat:</strong> ${receipt.buyerAddress}</p>
    </div>

    <div class="section-title">Detail Pembayaran</div>
    <div class="payment-details">
      <div class="payment-row">
        <span class="payment-label">Metode Pembayaran</span>
        <span class="payment-value">${receipt.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit'}</span>
      </div>
      ${receipt.tandaJadi ? `
      <div class="payment-row">
        <span class="payment-label">Tanda Jadi</span>
        <span class="payment-value">${formatCurrency(receipt.tandaJadi)}</span>
      </div>
      ` : ''}
      ${receipt.paymentMethod === 'CREDIT' ? `
      <div class="payment-row">
        <span class="payment-label">Uang Muka (DP)</span>
        <span class="payment-value">${formatCurrency(receipt.downPayment)}</span>
      </div>
      ${receipt.tandaJadi ? `
      <div class="payment-row">
        <span class="payment-label">Total Sudah Dibayar</span>
        <span class="payment-value">${formatCurrency(BigInt(receipt.tandaJadi) + receipt.downPayment)}</span>
      </div>
      ` : ''}
      <div class="payment-row">
        <span class="payment-label">Sisa Pembayaran</span>
        <span class="payment-value">${formatCurrency(receipt.remainingPayment)}</span>
      </div>
      ` : ''}
      <div class="total-row payment-row">
        <span class="payment-label">Total Harga</span>
        <span class="payment-value">${formatCurrency(receipt.totalPrice)}</span>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">
        <p><strong>Dokumen ini sah sebagai bukti transaksi</strong></p>
        <p>Terbit: ${formatDate}</p>
        <p>${receipt.receiptNumber}</p>
      </div>
      <div class="signature">
        <p style="margin-bottom: 10px; font-size: 14px;">Hormat Kami,</p>
        <div class="signature-box">
          <p>${dealer?.companyName || 'Dealer'}</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Auto print when page loads
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `
}
