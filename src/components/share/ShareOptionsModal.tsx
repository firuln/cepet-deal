'use client'

import { useState } from 'react'
import {
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  MessageCircle,
  QrCode
} from 'lucide-react'
import { Modal } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

interface ShareOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  listingTitle: string
  listingPrice: number
  listingSlug: string
  listingCondition: 'NEW' | 'USED'
}

export function ShareOptionsModal({
  isOpen,
  onClose,
  listingTitle,
  listingPrice,
  listingSlug,
  listingCondition,
}: ShareOptionsModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cepetdeal.com'}/${listingCondition === 'NEW' ? 'mobil-baru' : 'mobil-bekas'}/${listingSlug}`

  // Generate WhatsApp message
  const whatsappMessage = `Halo, saya tertarik dengan ${listingTitle}

Harga: ${formatCurrency(listingPrice)}

Link: ${shareUrl}

Apakah mobil ini masih tersedia?`

  // Native Share
  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
      try {
        await navigator.share({
          title: listingTitle,
          text: `${listingTitle} - ${formatCurrency(listingPrice)}`,
          url: shareUrl
        })
        onClose()
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    }
  }

  // Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
    onClose()
  }

  // Facebook Share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(listingTitle)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  // Twitter Share
  const handleTwitterShare = () => {
    const text = `${listingTitle} - ${formatCurrency(listingPrice)}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Listing">
      <div className="space-y-4">
        {/* Link Preview */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Link Listing:</p>
          <p className="text-sm text-gray-700 break-all">{shareUrl}</p>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Native Share */}
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-secondary">Share</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center relative">
              {copied ? (
                <Check className="w-5 h-5 text-blue-600" />
              ) : (
                <Copy className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <span className="text-sm font-medium text-secondary">
              {copied ? 'Tersalin!' : 'Salin'}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary">WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary">Facebook</span>
          </button>

          {/* Twitter */}
          <button
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary">Twitter</span>
          </button>

          {/* QR Code */}
          <button
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary">QR Code</span>
          </button>
        </div>

        {/* Car Summary for Copy/Share */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-secondary mb-1">Ringkasan:</p>
          <p className="text-gray-600">
            {listingTitle} - {formatCurrency(listingPrice)}
          </p>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center">
          *Share ke WhatsApp akan membuka aplikasi WhatsApp dengan pesan pre-format
        </p>
      </div>
    </Modal>
  )
}
