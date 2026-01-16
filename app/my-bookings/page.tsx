"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Home } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function MyBookingsPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMyBookings = async () => {
            // 1. Cek Loginb
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            // 2. Ambil data booking milik user yang sedang login
            // Kita join dengan tabel boarding_houses untuk dapat nama & foto kos
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          boarding_houses (
            name,
            image_url,
            city,
            address
          )
        `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Error:", error)
            } else {
                setBookings(data || [])
            }
            setIsLoading(false)
        }

        fetchMyBookings()
    }, [router])

    // Helper Warna Status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Diterima':
                return <Badge className="bg-green-500 hover:bg-green-600">Disetujui</Badge>
            case 'Ditolak':
                return <Badge className="bg-red-500 hover:bg-red-600">Ditolak</Badge>
            default:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu Konfirmasi</Badge>
        }
    }

    // Format Tanggal
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        })
    }

    // Format Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
    }

    if (isLoading) return <div className="min-h-screen pt-20 flex justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Pengajuan Sewa</h1>
                    <Link href="/">
                        <Button variant="outline">Cari Kos Lagi</Button>
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Belum ada riwayat booking</h3>
                            <p className="text-gray-500 mb-4">Kamu belum mengajukan sewa di kos manapun.</p>
                            <Link href="/">
                                <Button>Mulai Cari Kos</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Gambar Kos */}
                                    <div className="w-full md:w-48 h-32 bg-gray-200 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={booking.boarding_houses?.image_url || "/placeholder.svg"}
                                            alt="Kos"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Detail */}
                                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(booking.status)}
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {formatDate(booking.created_at)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg">{booking.boarding_houses?.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {booking.boarding_houses?.city}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm font-medium mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-primary" /> {booking.duration} Bulan
                                                </span>
                                                <span className="text-primary">
                                                    {formatRupiah(booking.total_price)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Aksi (Jika diterima) */}
                                        {booking.status === 'Diterima' && (
                                            <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                                                Bayar Sekarang
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}