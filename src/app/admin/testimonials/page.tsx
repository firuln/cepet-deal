'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Quote,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Upload,
  User
} from 'lucide-react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

interface Testimonial {
  id: string
  name: string
  role: string | null
  avatar: string | null
  content: string
  rating: number
  isActive: boolean
  createdAt: string
}

export default function AdminTestimonialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar: '',
    content: '',
    rating: 5,
    isActive: true,
  })

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchTestimonials()
    }
  }, [status, session])

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      avatar: '',
      content: '',
      rating: 5,
      isActive: true,
    })
    setEditingId(null)
    setError('')
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      avatar: testimonial.avatar || '',
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
    })
    setEditingId(testimonial.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingId ? `/api/testimonials/${editingId}` : '/api/testimonials'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menyimpan testimonial')
      }

      setSuccess(editingId ? 'Testimonial berhasil diperbarui' : 'Testimonial berhasil ditambahkan')
      fetchTestimonials()

      setTimeout(() => {
        closeModal()
        setSuccess('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimonial ini?')) return

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Gagal menghapus testimonial')
      }

      fetchTestimonials()
    } catch (err) {
      alert('Gagal menghapus testimonial')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!res.ok) {
        throw new Error('Gagal mengupdate status')
      }

      fetchTestimonials()
    } catch (err) {
      alert('Gagal mengupdate status')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Kelola Testimoni</h1>
              <p className="text-gray-500 text-sm mt-1">Atur testimoni pelanggan yang tampil di halaman home</p>
            </div>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Testimoni
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                testimonial.isActive
                  ? 'border-gray-200 hover:shadow-lg'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Status Badge */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {testimonial.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= testimonial.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{testimonial.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {testimonial.role || 'Pelanggan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(testimonial.id, testimonial.isActive)}
                  className={`text-sm font-medium transition-colors ${
                    testimonial.isActive
                      ? 'text-gray-600 hover:text-red-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {testimonial.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(testimonial)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada testimoni</p>
            <Button onClick={openAddModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Testimoni
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary">
                  {editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role / Pekerjaan
                  </label>
                  <Input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Contoh: Pengusaha, Buyer, Dealer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Avatar
                  </label>
                  <Input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan avatar default</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Testimoni *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Ceritakan pengalaman menggunakan CepetDeal..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.content.length}/500 karakter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-600">Tampilkan di halaman home</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        {editingId ? 'Simpan Perubahan' : 'Tambah Testimoni'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
