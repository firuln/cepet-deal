'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Star, CheckCircle, XCircle, AlertTriangle, Clock, Eye, MessageSquare, User } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface Review {
    id: string
    listingId: string | null
    reviewerId: string
    sellerId: string
    rating: number
    title: string | null
    content: string
    response: string | null
    status: string
    verified: boolean
    createdAt: string
    updatedAt: string
    reviewer: {
        id: string
        name: string
        email: string
        phone: string | null
    }
    seller: {
        id: string
        name: string
        email: string
    }
    listing?: {
        id: string
        title: string
        slug: string
        images: string[]
    }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    HIDDEN: { label: 'Hidden', color: 'bg-gray-100 text-gray-700', icon: Eye }
}

export default function AdminReviewsListPage() {
    const { data: session, status } = useSession()
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [ratingFilter, setRatingFilter] = useState('')
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            fetchReviews()
        }
    }, [session, pagination.page, statusFilter, ratingFilter])

    const fetchReviews = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (statusFilter) params.append('status', statusFilter)
            if (ratingFilter) params.append('rating', ratingFilter)

            const res = await fetch(`/api/admin/reviews?${params}`)
            if (res.ok) {
                const data = await res.json()
                setReviews(data.reviews)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (reviewId: string) => {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'APPROVED'
            })
        })

        if (res.ok) {
            fetchReviews()
            setSelectedReview(null)
        } else {
            alert('Failed to approve review')
        }
    }

    const handleReject = async (reviewId: string) => {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'REJECTED'
            })
        })

        if (res.ok) {
            fetchReviews()
            setSelectedReview(null)
        } else {
            alert('Failed to reject review')
        }
    }

    const handleHide = async (reviewId: string) => {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE'
        })

        if (res.ok) {
            fetchReviews()
            setSelectedReview(null)
        } else {
            alert('Failed to hide review')
        }
    }

    const handleAddResponse = async (reviewId: string, response: string) => {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'APPROVED',
                response
            })
        })

        if (res.ok) {
            fetchReviews()
            setSelectedReview(null)
        } else {
            alert('Failed to add response')
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 inline ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ))
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/admin')
    }

    const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.PENDING

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Manajemen Review</h1>
                <p className="text-gray-400 mt-1">Kelola review dan rating dari pengguna</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(statusConfig).map(([status, info]) => (
                    <div key={status} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center`}>
                                <info.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {reviews.filter(r => r.status === status).length}
                        </p>
                        <p className="text-sm text-gray-400">{info.label}</p>
                    </div>
                ))}
            </div>

            {/* Rating Distribution */}
            <Card variant="dark" className="mb-6">
                <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Distribusi Rating</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400 w-16">{star} bintang</span>
                                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-yellow-400 h-full rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card variant="dark" className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination({ ...pagination, page: 1 })
                            }}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="HIDDEN">Hidden</option>
                        </select>

                        <select
                            value={ratingFilter}
                            onChange={(e) => {
                                setRatingFilter(e.target.value)
                                setPagination({ ...pagination, page: 1 })
                            }}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Semua Rating</option>
                            <option value="5">5 Bintang</option>
                            <option value="4">4 Bintang</option>
                            <option value="3">3 Bintang</option>
                            <option value="2">2 Bintang</option>
                            <option value="1">1 Bintang</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            <Card variant="dark">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            Memuat review...
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada review yang ditemukan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-4 text-gray-400 font-medium">Reviewer</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Seller</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Listing</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Rating</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Review</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Tanggal</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => (
                                        <tr key={review.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{review.reviewer.name}</p>
                                                    <p className="text-sm text-gray-500">{review.reviewer.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-300">{review.seller.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {review.listing ? (
                                                    <span className="text-sm text-gray-400">{review.listing.title}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Direct Review</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    {review.title && (
                                                        <p className="font-medium text-white text-sm">{review.title}</p>
                                                    )}
                                                    <p className="text-sm text-gray-400 max-w-xs truncate">
                                                        {review.content}
                                                    </p>
                                                    {review.response && (
                                                        <div className="mt-1 p-2 bg-blue-900/30 rounded text-xs text-blue-300">
                                                            <span className="font-medium">Response:</span> {review.response}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const statusInfo = getStatusInfo(review.status)
                                                        return (
                                                            <Badge className={statusInfo.color}>
                                                                <statusInfo.icon className="w-3 h-3 mr-1 inline" />
                                                                {statusInfo.label}
                                                            </Badge>
                                                        )
                                                    })()}
                                                    {review.verified && (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            <CheckCircle className="w-3 h-3 mr-1 inline" />
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setSelectedReview(review)}
                                                    >
                                                        Lihat
                                                    </Button>
                                                    {review.status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setSelectedReview(review)}
                                                        >
                                                            Proses
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-gray-400">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Review Detail Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Detail Review</h2>
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Reviewer Info */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Reviewer</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Nama</p>
                                            <p className="text-white">{selectedReview.reviewer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="text-white">{selectedReview.reviewer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Telepon</p>
                                            <p className="text-white">{selectedReview.reviewer.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Review Pada</p>
                                            <p className="text-white">{new Date(selectedReview.createdAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Seller</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Nama</p>
                                            <p className="text-white">{selectedReview.seller.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="text-white">{selectedReview.seller.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Listing Info */}
                                {selectedReview.listing && (
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h3 className="font-semibold text-white mb-3">Listing</h3>
                                        <p className="text-white">{selectedReview.listing.title}</p>
                                    </div>
                                )}

                                {/* Review Content */}
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Isi Review</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        {renderStars(selectedReview.rating)}
                                        <span className="text-sm text-gray-400">({selectedReview.rating}/5)</span>
                                    </div>
                                    {selectedReview.title && (
                                        <p className="font-medium text-white mb-2">{selectedReview.title}</p>
                                    )}
                                    <p className="text-gray-300">{selectedReview.content}</p>
                                    {selectedReview.response && (
                                        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                                            <p className="text-sm text-blue-300 font-medium mb-1">Response dari Seller:</p>
                                            <p className="text-white">{selectedReview.response}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    {selectedReview.status === 'PENDING' || selectedReview.status === 'REJECTED' ? (
                                        <>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleApprove(selectedReview.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve Review
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={() => {
                                                    const response = prompt('Response dari seller (opsional):')
                                                    if (response !== null) handleAddResponse(selectedReview.id, response)
                                                }}
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Approve & Add Response
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full text-red-400 hover:text-red-300"
                                                onClick={() => handleReject(selectedReview.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject Review
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {selectedReview.status === 'APPROVED' && !selectedReview.response && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full"
                                                    onClick={() => {
                                                        const response = prompt('Response dari seller:')
                                                        if (response !== null) handleAddResponse(selectedReview.id, response)
                                                    }}
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Add Seller Response
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                className="w-full text-red-400 hover:text-red-300"
                                                onClick={() => handleHide(selectedReview.id)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Hide Review
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
