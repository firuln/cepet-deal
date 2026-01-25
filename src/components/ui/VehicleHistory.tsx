'use client'

import { FileText, Calendar, Users, Wrench, Shield, AlertCircle } from 'lucide-react'

interface VehicleHistoryProps {
    pajakStnk?: string | null
    pemakaian?: string | null
    serviceTerakhir?: string | null
    bpkbStatus?: string | null
    kecelakaan?: boolean | null
    kondisiMesin?: string | null
    kondisiKaki?: string | null
    kondisiAc?: string | null
    kondisiBan?: string | null
}

export function VehicleHistory({
    pajakStnk,
    pemakaian,
    serviceTerakhir,
    bpkbStatus,
    kecelakaan,
    kondisiMesin,
    kondisiKaki,
    kondisiAc,
    kondisiBan,
}: VehicleHistoryProps) {
    const hasData =
        pajakStnk ||
        pemakaian ||
        serviceTerakhir ||
        bpkbStatus ||
        kecelakaan !== null ||
        kondisiMesin ||
        kondisiKaki ||
        kondisiAc ||
        kondisiBan

    if (!hasData) {
        return null
    }

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        } catch {
            return dateStr
        }
    }

    const getKondisiColor = (kondisi?: string | null) => {
        if (!kondisi) return 'text-gray-400'
        if (kondisi.toLowerCase().includes('baik') || kondisi.toLowerCase().includes('sehat') || kondisi.toLowerCase().includes('normal')) {
            return 'text-green-600'
        }
        if (kondisi.toLowerCase().includes('perlu') || kondisi.toLowerCase().includes('rusak')) {
            return 'text-orange-600'
        }
        return 'text-gray-600'
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-base font-semibold text-secondary mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Riwayat Kendaraan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {/* Pajak STNK */}
                {pajakStnk && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pajak STNK</p>
                            <p className="text-sm font-medium text-secondary">{formatDate(pajakStnk)}</p>
                        </div>
                    </div>
                )}

                {/* Pemakaian */}
                {pemakaian && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pemakaian</p>
                            <p className="text-sm font-medium text-secondary">{pemakaian}</p>
                        </div>
                    </div>
                )}

                {/* Service Terakhir */}
                {serviceTerakhir && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Service Terakhir</p>
                            <p className="text-sm font-medium text-secondary">{serviceTerakhir}</p>
                        </div>
                    </div>
                )}

                {/* BPKB Status */}
                {bpkbStatus && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">BPKB</p>
                            <p className="text-sm font-medium text-secondary">{bpkbStatus}</p>
                        </div>
                    </div>
                )}

                {/* Kecelakaan */}
                {kecelakaan !== null && (
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${kecelakaan ? 'bg-red-50' : 'bg-green-50'}`}>
                            <AlertCircle className={`w-4 h-4 ${kecelakaan ? 'text-red-600' : 'text-green-600'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Kecelakaan</p>
                            <p className={`text-sm font-medium ${kecelakaan ? 'text-red-600' : 'text-green-600'}`}>
                                {kecelakaan ? 'Pernah' : 'Tidak pernah'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Kondisi Mesin */}
                {kondisiMesin && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className={`w-4 h-4 ${getKondisiColor(kondisiMesin)}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Kondisi Mesin</p>
                            <p className={`text-sm font-medium ${getKondisiColor(kondisiMesin)}`}>{kondisiMesin}</p>
                        </div>
                    </div>
                )}

                {/* Kondisi Kaki-kaki */}
                {kondisiKaki && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className={`w-4 h-4 ${getKondisiColor(kondisiKaki)}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Kondisi Kaki-kaki</p>
                            <p className={`text-sm font-medium ${getKondisiColor(kondisiKaki)}`}>{kondisiKaki}</p>
                        </div>
                    </div>
                )}

                {/* Kondisi AC */}
                {kondisiAc && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className={`w-4 h-4 ${getKondisiColor(kondisiAc)}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Kondisi AC</p>
                            <p className={`text-sm font-medium ${getKondisiColor(kondisiAc)}`}>{kondisiAc}</p>
                        </div>
                    </div>
                )}

                {/* Kondisi Ban */}
                {kondisiBan && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className={`w-4 h-4 ${getKondisiColor(kondisiBan)}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Kondisi Ban</p>
                            <p className={`text-sm font-medium ${getKondisiColor(kondisiBan)}`}>{kondisiBan}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
