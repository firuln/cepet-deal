'use client'

import { useState } from 'react'
import { Button, Card, CardContent, Input, Dropdown, Badge, Modal } from '@/components/ui'
import { FileText, Download, CheckCircle, Loader2, Eye } from 'lucide-react'

interface ReceiptFormProps {
  listingId: string
  listingTitle: string
  listingPrice: number
  onSuccess?: (receipt: any) => void
  onClose?: () => void
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai (Cash)' },
  { value: 'CREDIT', label: 'Kredit' },
]

interface FormData {
  paymentMethod: string
  tandaJadi: string
  downPayment: string
  buyerName: string
  buyerAddress: string
}

interface PreviewData {
  paymentMethod: string
  tandaJadi: string
  downPayment: string
  buyerName: string
  buyerAddress: string
  subtotalTandaJadi: number
  subtotalDP: number
  totalPaid: number
  remaining: number
}

export function ReceiptForm({ listingId, listingTitle, listingPrice, onSuccess, onClose }: ReceiptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showMarkSoldDialog, setShowMarkSoldDialog] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  const [formData, setFormData] = useState<FormData>({
    paymentMethod: '',
    tandaJadi: '',
    downPayment: '',
    buyerName: '',
    buyerAddress: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (fieldErrors[field as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [field as keyof FormData]: undefined }))
    }
    setError(null)
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Pilih metode pembayaran'
    }

    if (!formData.buyerName.trim()) {
      errors.buyerName = 'Nama pembeli wajib diisi'
    }

    if (!formData.buyerAddress.trim()) {
      errors.buyerAddress = 'Alamat pembeli wajib diisi'
    }

    if (formData.paymentMethod === 'CREDIT') {
      const dp = parseInt(formData.downPayment)
      if (!formData.downPayment || isNaN(dp) || dp <= 0) {
        errors.downPayment = 'DP harus diisi dengan angka yang valid'
      } else if (dp >= listingPrice) {
        errors.downPayment = 'DP tidak boleh melebihi harga kendaraan'
      }
    }

    // Validate tanda jadi if provided
    if (formData.tandaJadi) {
      const tj = parseInt(formData.tandaJadi)
      if (isNaN(tj) || tj <= 0) {
        errors.tandaJadi = 'Tanda jadi harus berupa angka yang valid'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculatePreviewData = (): PreviewData => {
    const tandaJadiValue = parseInt(formData.tandaJadi) || 0
    const downPaymentValue = formData.paymentMethod === 'CREDIT' ? (parseInt(formData.downPayment) || 0) : 0
    const totalPaid = tandaJadiValue + downPaymentValue
    const remaining = listingPrice - totalPaid

    return {
      paymentMethod: formData.paymentMethod,
      tandaJadi: formData.tandaJadi,
      downPayment: formData.downPayment,
      buyerName: formData.buyerName,
      buyerAddress: formData.buyerAddress,
      subtotalTandaJadi: tandaJadiValue,
      subtotalDP: downPaymentValue,
      totalPaid,
      remaining,
    }
  }

  const handlePreview = () => {
    if (!formData.paymentMethod) {
      setFieldErrors({ paymentMethod: 'Pilih metode pembayaran terlebih dahulu' })
      return
    }
    const data = calculatePreviewData()
    setPreviewData(data)
    setShowPreview(true)
  }

  const handleSubmit = async (markAsSold: boolean) => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          paymentMethod: formData.paymentMethod,
          tandaJadi: formData.tandaJadi || null,
          downPayment: formData.paymentMethod === 'CREDIT' ? formData.downPayment : 0,
          buyerName: formData.buyerName,
          buyerAddress: formData.buyerAddress,
          markAsSold,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal membuat kwitansi')
      }

      const data = await response.json()
      setReceipt(data)
      setShowMarkSoldDialog(false)
      onSuccess?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!receipt) return

    // Open PDF in new window/tab
    window.open(`/api/receipts/${receipt.id}/pdf`, '_blank')
  }

  const handleReset = () => {
    setReceipt(null)
    setFormData({
      paymentMethod: '',
      tandaJadi: '',
      downPayment: '',
      buyerName: '',
      buyerAddress: '',
    })
    setFieldErrors({})
    setError(null)
    setShowMarkSoldDialog(false)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {!receipt ? (
        <Card>
          <CardContent className="p-6">
            {/* Listing Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-secondary mb-1">{listingTitle}</h3>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(listingPrice)}
              </p>
            </div>

            {/* Scrollable Form Area */}
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {/* Payment Method */}
              <Dropdown
                label="Metode Pembayaran"
                options={PAYMENT_METHODS}
                value={formData.paymentMethod}
                onChange={(val) => updateFormData('paymentMethod', val)}
                placeholder="Pilih metode pembayaran"
                error={fieldErrors.paymentMethod}
              />

              {/* Tanda Jadi */}
              <Input
                label="Tanda Jadi (Booking Fee)"
                type="number"
                placeholder="Contoh: 1000000"
                value={formData.tandaJadi}
                onChange={(e) => updateFormData('tandaJadi', e.target.value)}
                error={fieldErrors.tandaJadi}
                helperText="Opsional - Masukkan nominal tanda jadi"
              />

              {/* Down Payment (only for Credit) */}
              {formData.paymentMethod === 'CREDIT' && (
                <Input
                  label="Uang Muka (DP)"
                  type="number"
                  placeholder="Contoh: 50000000"
                  value={formData.downPayment}
                  onChange={(e) => updateFormData('downPayment', e.target.value)}
                  error={fieldErrors.downPayment}
                  helperText="Masukkan nominal uang muka"
                />
              )}

              {/* Buyer Name */}
              <Input
                label="Nama Pembeli"
                placeholder="Nama lengkap pembeli"
                value={formData.buyerName}
                onChange={(e) => updateFormData('buyerName', e.target.value)}
                error={fieldErrors.buyerName}
              />

              {/* Buyer Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Pembeli
                </label>
                <textarea
                  rows={4}
                  placeholder="Alamat lengkap pembeli"
                  value={formData.buyerAddress}
                  onChange={(e) => updateFormData('buyerAddress', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                    fieldErrors.buyerAddress
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 hover:border-gray-400 focus:border-primary'
                  }`}
                />
                {fieldErrors.buyerAddress && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.buyerAddress}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={handlePreview}
                variant="outline"
                disabled={!formData.paymentMethod}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={() => setShowMarkSoldDialog(true)}
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Buat Kwitansi
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {/* Success Message */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">
                Kwitansi Berhasil Dibuat!
              </h3>
              <p className="text-gray-500 mb-6">
                Nomor Kwitansi: <span className="font-mono font-semibold">{receipt.receiptNumber}</span>
              </p>

              {/* Receipt Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama Pembeli:</span>
                  <span className="font-medium">{receipt.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode:</span>
                  <span className="font-medium">
                    {receipt.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit'}
                  </span>
                </div>
                {receipt.tandaJadi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanda Jadi:</span>
                    <span className="font-medium">{formatCurrency(Number(receipt.tandaJadi))}</span>
                  </div>
                )}
                {receipt.paymentMethod === 'CREDIT' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DP:</span>
                      <span className="font-medium">{formatCurrency(Number(receipt.downPayment))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa:</span>
                      <span className="font-medium">{formatCurrency(Number(receipt.remainingPayment))}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Total:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(Number(receipt.totalPrice))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  variant="primary"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Buat Kwitansi Baru
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="sm:hidden"
                  >
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview Kwitansi"
        size="lg"
      >
        {previewData && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-secondary mb-2">{listingTitle}</h4>
              <p className="text-sm text-gray-600">Harga: {formatCurrency(listingPrice)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-medium">{previewData.paymentMethod === 'CASH' ? 'Tunai' : 'Kredit'}</span>
              </div>

              {previewData.tandaJadi && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tanda Jadi</span>
                  <span className="font-medium">{formatCurrency(previewData.subtotalTandaJadi)}</span>
                </div>
              )}

              {previewData.paymentMethod === 'CREDIT' && previewData.downPayment && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Uang Muka (DP)</span>
                    <span className="font-medium">{formatCurrency(previewData.subtotalDP)}</span>
                  </div>

                  {previewData.tandaJadi && (
                    <div className="flex justify-between py-2 border-b border-gray-100 bg-blue-50 px-3 rounded">
                      <span className="text-gray-700 font-medium">Total Sudah Dibayar</span>
                      <span className="font-bold text-primary">{formatCurrency(previewData.totalPaid)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sisa Pembayaran</span>
                    <span className="font-medium text-orange-600">{formatCurrency(previewData.remaining)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-3 bg-primary text-white px-4 rounded-lg">
                <span className="font-semibold">Total Harga</span>
                <span className="font-bold">{formatCurrency(listingPrice)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nama Pembeli:</span> {previewData.buyerName || '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Alamat:</span> {previewData.buyerAddress || '-'}
              </p>
            </div>

            <Button onClick={() => setShowPreview(false)} className="w-full">
              Tutup Preview
            </Button>
          </div>
        )}
      </Modal>

      {/* Mark as Sold Confirmation Dialog */}
      <Modal
        isOpen={showMarkSoldDialog}
        onClose={() => setShowMarkSoldDialog(false)}
        title="Konfirmasi Status Listing"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Kwitansi akan dibuat. Apakah Anda ingin menandai listing ini sebagai <strong>TERJUAL</strong>?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-green-700">Ya, Tandai sebagai Terjual</p>
                <p className="text-sm text-gray-500">Listing tidak akan lagi ditampilkan sebagai tersedia</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-blue-700">Tidak, Simpan Draft Saja</p>
                <p className="text-sm text-gray-500">Status listing tetap AKTIF, bisa diubah nanti</p>
              </div>
              <FileText className="w-6 h-6 text-blue-500" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowMarkSoldDialog(false)}
            className="w-full"
            disabled={isSubmitting}
          >
            Batal
          </Button>
        </div>
      </Modal>
    </div>
  )
}
