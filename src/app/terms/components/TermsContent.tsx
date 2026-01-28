'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { TERMS_UPDATED_DATE } from '@/lib/constants'

const sections = [
    {
        id: 'pendahuluan',
        title: '1. Pendahuluan & Penerimaan Syarat',
        icon: AlertCircle,
        defaultOpen: true,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>
                    Selamat datang di <strong>CepetDeal</strong> - platform jual beli mobil baru dan bekas terpercaya di Indonesia.
                </p>
                <p>
                    Dengan mengakses, mendaftar, atau menggunakan layanan CepetDeal, Anda secara otomatis menyetujui dan terikat oleh Syarat & Ketentuan ini.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-amber-800 text-sm">
                        <strong>Usia Minimal:</strong> Untuk menggunakan platform ini, Anda harus berusia minimal 18 tahun atau telah menikah.
                    </p>
                </div>
                <p>
                    CepetDeal berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui email atau dashboard Anda.
                </p>
            </div>
        ),
    },
    {
        id: 'pendaftaran',
        title: '2. Pendaftaran & Keamanan Akun',
        icon: CheckCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Untuk menggunakan layanan CepetDeal, Anda harus mendaftar akun dengan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Username (3-20 karakter, huruf & angka)</li>
                    <li>Password (minimal 8 karakter, kombinasi huruf kapital, huruf kecil, dan angka)</li>
                    <li>Nomor WhatsApp (untuk verifikasi & komunikasi)</li>
                    <li>Email (opsional, untuk pemulihan password)</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm font-medium">Kewajiban Pengguna:</p>
                    <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                        <li>Memberikan data yang valid, benar, dan akurat</li>
                        <li>Menjaga kerahasiaan password dan akun</li>
                        <li>Tidak memberikan akses akun kepada pihak lain</li>
                        <li>Segala aktivitas yang terjadi di akun Anda adalah tanggung jawab Anda</li>
                    </ul>
                </div>
                <p className="text-sm text-gray-600">
                    Akun dengan data palsu atau tidak valid berisiko di-suspend atau di-banned secara permanen.
                </p>
            </div>
        ),
    },
    {
        id: 'role-user',
        title: '3. Role User & Perizinan',
        icon: CheckCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>CepetDeal memiliki 4 role user dengan perizinan berbeda:</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kuota Iklan</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fitur</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">BUYER</td>
                                <td className="px-4 py-3 text-sm text-gray-600">0 (tidak bisa pasang)</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Cari, bandingkan, favorit, pesan</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Email</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">SELLER</td>
                                <td className="px-4 py-3 text-sm text-gray-600">5 iklan aktif</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Pasang iklan mobil bekas, kelola iklan</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Email</td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">DEALER</td>
                                <td className="px-4 py-3 text-sm text-gray-600 font-semibold">25 iklan aktif</td>
                                <td className="px-4 py-3 text-sm text-gray-600">Showroom, statistik, <strong>fitur premium</strong></td>
                                <td className="px-4 py-3 text-sm text-gray-600">KTP + SIUP/NIB</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                    <p className="text-primary font-semibold mb-2">Fitur Dealer Berbayar:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Premium Placement:</strong> Iklan muncul di paling atas pencarian</li>
                        <li>• <strong>Slot Iklan Tambahan:</strong> Bisa tambah slot di luar kuota gratis</li>
                        <li>• <strong>Analytics:</strong> Statistik lengkap performa iklan</li>
                        <li>• <strong>Badge Verified:</strong> Tanda terverifikasi di profil</li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: 'verifikasi-dealer',
        title: '4. Verifikasi Dealer (Khusus Dealer)',
        icon: CheckCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Untuk upgrade ke Dealer, Anda harus mengupload dokumen verifikasi:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>KTP (Kartu Tanda Penduduk)</strong> - Identitas pemilik dealer</li>
                    <li><strong>SIUP (Surat Izin Usaha Perdagangan)</strong> atau <strong>NIB (Nomor Induk Berusaha)</strong></li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                        <strong>Proses Verifikasi:</strong> 1-3 hari kerja. Dokumen dienkripsi dan TIDAK dipublikasikan.
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm font-medium">Penolakan Verifikasi:</p>
                    <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                        <li>Dokumen tidak valid / palsu</li>
                        <li>Dokumen tidak sesuai dengan data pendaftaran</li>
                        <li>Dokumen kadaluarsa</li>
                        <li>Dokumen tidak terbaca / buram</li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: 'aturan-iklan',
        title: '5. Aturan Pasang Iklan',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">Syarat Iklan:</p>
                    <ul className="list-disc list-inside text-green-700 text-sm mt-2 space-y-1">
                        <li>Mobil yang diiklankan harus milik sendiri atau ada kuasa jual</li>
                        <li>Data spesifikasi harus akurat (tahun, odometer, kondisi)</li>
                        <li>Foto harus asli (minimal 3-6 foto)</li>
                        <li>Lokasi mobil sesuai dengan kota yang dipilih</li>
                    </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold">Larangan Iklan:</p>
                    <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                        <li>Iklan mobil bodong / hasil curian</li>
                        <li>Upload foto dari internet</li>
                        <li>Manipulasi data (tahun, odometer, dokumen)</li>
                        <li>Iklan duplikat / spam</li>
                        <li>Konten porno, SARA, atau ujaran kebencian</li>
                    </ul>
                </div>
                <p className="text-sm text-gray-600">
                    <strong>Moderasi:</strong> Iklan akan ditinjau sebelum dipublish. Status iklan: PENDING → ACTIVE atau REJECTED.
                </p>
            </div>
        ),
    },
    {
        id: 'kuota-iklan',
        title: '6. Kuota Iklan',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-900 mb-2">SELLER</p>
                        <p className="text-2xl font-bold text-primary mb-2">5 Iklan</p>
                        <p className="text-sm text-gray-600">Jika penuh, hapus iklan lama untuk pasang baru. Upgrade ke Dealer untuk kuota lebih banyak.</p>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-900 mb-2">DEALER</p>
                        <p className="text-2xl font-bold text-primary mb-2">25 Iklan</p>
                        <p className="text-sm text-gray-600">Gratis. Bisa tambah slot dengan harga Rp 250.000/bulan (Premium Placement).</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    <strong>Kadaluarsa:</strong> Iklan otomatis kadaluarsa setelah 30 hari. Bisa diperpanjang secara manual.
                </p>
            </div>
        ),
    },
    {
        id: 'transaksi',
        title: '7. Transaksi & Pembayaran',
        icon: AlertTriangle,
        content: (
            <div className="space-y-4 text-gray-700">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-bold text-lg mb-2">⚠️ PENTING: TIDAK ADA REKENING BERSAMA</p>
                    <p className="text-red-700 text-sm">
                        CepetDeal hanya sebagai platform perantara (marketplace). Transaksi dilakukan <strong>langsung antara pembeli & penjual</strong>.
                    </p>
                </div>
                <p>Cara pembayaran diatur sendiri oleh penjual (cash, transfer, kredit). CepetDeal <strong>tidak terlibat</strong> dalam proses pembayaran.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 font-semibold">CepetDeal TIDAK Bertanggung Jawab Atas:</p>
                    <ul className="list-disc list-inside text-amber-700 text-sm mt-2 space-y-1">
                        <li>Penipuan yang terjadi saat transaksi</li>
                        <li>Mobil yang tidak sesuai setelah dibeli</li>
                        <li>Sengketa pembayaran antar user</li>
                        <li>Kerusakan atau kekurangan mobil setelah transaksi</li>
                    </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold">Tips Keamanan Transaksi:</p>
                    <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                        <li>Lakukan COD (Cash on Delivery) jika memungkinkan</li>
                        <li>Cek kondisi fisik mobil sebelum bayar</li>
                        <li>Gunakan notifikasi jual beli (Fisik) jika diperlukan</li>
                        <li>Hindari transfer uang muka (DP) sebelum lihat mobil</li>
                        <li>Temui penjual di lokasi aman</li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: 'fitur-berbayar',
        title: '8. Fitur Berbayar Dealer',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Dealer dapat berlangganan fitur premium:</p>
                <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-lg p-4">
                    <p className="font-bold text-lg text-secondary mb-2">Premium Placement</p>
                    <p className="text-3xl font-bold text-primary mb-2">Rp 250.000 <span className="text-base font-normal text-gray-600">/bulan</span></p>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Iklan muncul di paling atas pencarian</li>
                        <li>• Prioritas di hasil pencarian</li>
                        <li>• Badge "Premium" di iklan</li>
                        <li>• Analytics performa iklan</li>
                    </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 text-sm">
                        <strong>Periode:</strong> Bulanan, auto-renew. Pembayaran via transfer bank / e-wallet.<br />
                        <strong>Non-refundable:</strong> Pembayaran fitur premium tidak dapat dikembalikan.<br />
                        <strong>Gagal bayar:</strong> Fitur premium akan dihentikan otomatis.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: 'larangan',
        title: '9. Larangan & Aktivitas Terlarang',
        icon: XCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Pengguna dilarang melakukan:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-semibold text-red-800 text-sm">Pelanggaran Berat (Banned)</p>
                        <ul className="list-disc list-inside text-red-700 text-xs mt-2 space-y-1">
                            <li>Penipuan atau fraud</li>
                            <li>Iklan mobil curian</li>
                            <li>Dokumen dealer palsu</li>
                            <li>Hacking, bot, atau scraping</li>
                        </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="font-semibold text-amber-800 text-sm">Pelanggaran Sedang (Suspend)</p>
                        <ul className="list-disc list-inside text-amber-700 text-xs mt-2 space-y-1">
                            <li>Manipulasi data iklan</li>
                            <li>Spamming pesan</li>
                            <li>Transaksi di luar platform</li>
                            <li>Multiple akun tanpa izin</li>
                        </ul>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    <strong>Sanksi:</strong> Pelanggaran berat = banned permanen. Pelanggaran sedang = suspend 30 hari. Pelanggaran ringan = peringatan.
                </p>
            </div>
        ),
    },
    {
        id: 'pesan-komunikasi',
        title: '10. Pesan & Komunikasi',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Fitur pesan CepetDeal digunakan untuk komunikasi antar user. Aturan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Pesan dipantau untuk keamanan dan mencegah penipuan</li>
                    <li>Dilarang share kontak eksternal di pesan pertama</li>
                    <li>Dilarang konten porno, SARA, politik, ujaran kebencian</li>
                    <li>Dilarang promosi produk lain di luar CepetDeal</li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                        <strong>Tip:</strong> Gunakan sistem pesan CepetDeal untuk bertransaksi dengan aman. Jika terjadi penipuan, bukti pesan dapat digunakan untuk laporan.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: 'hak-kekayaan-intelektual',
        title: '11. Hak Kekayaan Intelektual',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Foto, deskripsi, dan konten iklan tetap menjadi hak milik user</li>
                    <li>Desain sistem, logo, brand "CepetDeal" dilindungi hak cipta</li>
                    <li>Dilarang copy-paste konten user lain tanpa izin</li>
                    <li>Dilarang menggunakan data CepetDeal untuk kepentingan komersial lain</li>
                </ul>
            </div>
        ),
    },
    {
        id: 'privasi',
        title: '12. Privasi Data',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>CepetDeal mengumpulkan data berikut:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nama, username, email</li>
                    <li>Nomor WhatsApp & telepon</li>
                    <li>Lokasi (kota)</li>
                    <li>Foto profil & avatar</li>
                    <li><strong>Dealer:</strong> KTP, SIUP/NIB (dienkripsi, hanya untuk verifikasi)</li>
                </ul>
                <p>Data digunakan untuk:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Verifikasi akun & keamanan</li>
                    <li>Komunikasi antar user</li>
                    <li>Notifikasi & update</li>
                    <li>Analisis & perbaikan layanan</li>
                </ul>
                <p className="text-sm">
                    Lihat kebijakan privasi lengkap di <a href="/privacy" className="text-primary hover:underline">Halaman Privasi</a>.
                </p>
            </div>
        ),
    },
    {
        id: 'batasan-tanggung-jawab',
        title: '13. Batasan Tanggung Jawab',
        icon: AlertTriangle,
        content: (
            <div className="space-y-4 text-gray-700">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold">CepetDeal TIDAK Menjamin:</p>
                    <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                        <li>Ketersediaan mobil yang diiklankan</li>
                        <li>Kondisi mobil sesuai iklan</li>
                        <li>Keaslian dokumen kendaraan</li>
                        <li>Respons penjual terhadap pesan</li>
                    </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 font-semibold">CepetDeal TIDAK Bertanggung Jawab Atas:</p>
                    <ul className="list-disc list-inside text-amber-700 text-sm mt-2 space-y-1">
                        <li>Kerugian finansial dari transaksi</li>
                        <li>Sengketa antar user</li>
                        <li>Kehilangan data karena force majeure (bencana, dll)</li>
                        <li>Gangguan layanan (maintenance, server down)</li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: 'sanksi-penghentian',
        title: '14. Sanksi & Penghentian Akun',
        icon: XCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>CepetDeal berhak menghentikan atau menangguhkan akun jika:</p>
                <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-500 p-3">
                        <p className="font-semibold text-red-800">Banned Permanen</p>
                        <p className="text-sm text-red-700">Penipuan terbukti, iklan mobil curian, dokumen palsu, hacking</p>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
                        <p className="font-semibold text-amber-800">Suspend 30 Hari</p>
                        <p className="text-sm text-amber-700">Manipulasi data, spamming, transaksi di luar platform</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                        <p className="font-semibold text-blue-800">Peringatan</p>
                        <p className="text-sm text-blue-700">Iklan tidak lengkap, foto tidak sesuai, kurang sopan</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    <strong>Proses Banding:</strong> Jika akun di-suspend, Anda dapat mengajukan banding melalui email hello@cepetdeal.com dengan menjelaskan alasan dan bukti pendukung.
                </p>
            </div>
        ),
    },
    {
        id: 'perubahan-layanan',
        title: '15. Perubahan Layanan',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>CepetDeal berhak mengubah atau menghentikan fitur layanan sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Perubahan akan diberitahukan melalui email / dashboard</li>
                    <li>Pengguna dianggap setuju jika tetap menggunakan layanan setelah perubahan</li>
                    <li>CepetDeal tidak bertanggung jawab atas kerugian akibat perubahan layanan</li>
                </ul>
            </div>
        ),
    },
    {
        id: 'hukum-berlaku',
        title: '16. Hukum yang Berlaku',
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia</li>
                    <li>Sengketa akan diselesaikan secara musyawarah terlebih dahulu</li>
                    <li>Jika musyawarah tidak mencapai mufakat, sengketa akan dibawa ke pengadilan di Jakarta Pusat</li>
                    <li>Segala tindakan hukum akan tunduk pada yurisdiksi pengadilan Indonesia</li>
                </ul>
            </div>
        ),
    },
    {
        id: 'kontak',
        title: '17. Kontak',
        icon: CheckCircle,
        content: (
            <div className="space-y-4 text-gray-700">
                <p>Jika Anda memiliki pertanyaan, saran, atau keluhan, silakan hubungi:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <p><strong>Email:</strong> hello@cepetdeal.com</p>
                    <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
                    <p><strong>Alamat:</strong> Jl. Sudirman No. 123, Jakarta Pusat</p>
                    <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
                </div>
                <p className="text-sm">
                    Kunjungi juga <a href="/help" className="text-primary hover:underline">Halaman Bantuan</a> untuk FAQ dan panduan penggunaan.
                </p>
            </div>
        ),
    },
]

export function TermsContent() {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['pendahuluan']))

    const toggleSection = (id: string) => {
        const newOpenSections = new Set(openSections)
        if (newOpenSections.has(id)) {
            newOpenSections.delete(id)
        } else {
            newOpenSections.add(id)
        }
        setOpenSections(newOpenSections)
    }

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setOpenSections(new Set([id]))
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-8">
                    Terakhir diperbarui: {TERMS_UPDATED_DATE}
                </p>
            </div>

            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon
                    const isOpen = openSections.has(section.id)

                    return (
                        <div
                            key={section.id}
                            id={section.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 md:p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        isOpen ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-semibold text-secondary text-sm md:text-base">
                                        {section.title}
                                    </h3>
                                </div>
                                {isOpen ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {isOpen && (
                                <div className="p-4 md:p-5 border-t border-gray-200">
                                    {section.content}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
