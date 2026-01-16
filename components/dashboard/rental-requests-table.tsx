"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Phone, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface RentalRequestsTableProps {
  bookings?: any[]
}

export function RentalRequestsTable({ bookings = [] }: RentalRequestsTableProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleUpdateStatus = async (
    bookingId: string,
    roomId: string | null,
    newStatus: 'approved' | 'rejected',
    bookingData: any
  ) => {
    setProcessingId(bookingId)

    try {
      // 1. Jika APPROVED dan ada room_id, CHECK dulu apakah room masih kosong
      if (newStatus === 'approved' && roomId) {
        const { data: roomData, error: checkError } = await supabase
          .from('rooms')
          .select('is_occupied, tenant_name, room_number')
          .eq('id', roomId)
          .single()

        if (checkError) throw new Error("Gagal mengecek status kamar: " + checkError.message)

        // Jika kamar sudah terisi, TOLAK approval
        if (roomData?.is_occupied) {
          alert(`❌ Kamar ${roomData.room_number} sudah terisi oleh ${roomData.tenant_name}. Approval ditolak!`)
          setProcessingId(null)
          return
        }
      }

      // 2. Update status booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (bookingError) throw new Error(bookingError.message)

      // 3. Jika APPROVED dan ada room_id, update room status
      if (newStatus === 'approved' && roomId && bookingData) {
        const startDate = new Date(bookingData.start_date)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + (bookingData.duration_months || 1))

        const { error: roomError } = await supabase
          .from('rooms')
          .update({
            is_occupied: true,
            tenant_name: bookingData.guest_name,
            tenant_phone: bookingData.guest_phone,
            rent_start_date: bookingData.start_date,
            rent_end_date: endDate.toISOString().split('T')[0]
          })
          .eq('id', roomId)

        if (roomError) throw new Error(roomError.message)

        alert(`✅ Booking disetujui! Kamar ${bookingData.rooms?.room_number || ''} otomatis ditandai terisi.`)
      } else if (newStatus === 'approved') {
        alert("✅ Booking disetujui!")
      } else {
        alert("❌ Booking ditolak.")
      }

      window.location.reload()
    } catch (error: any) {
      alert("Gagal mengupdate: " + error.message)
      setProcessingId(null)
    }
  }


  const getInitials = (name: string) => {
    if (!name) return "Guest"
    const names = name.split(" ")
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center border border-border rounded-lg bg-card">
        <p className="text-muted-foreground">Belum ada pengajuan sewa yang masuk.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-foreground">Calon Penyewa</TableHead>
            <TableHead className="text-foreground">No. Kamar</TableHead>
            <TableHead className="text-foreground">Kontak (HP)</TableHead>
            <TableHead className="text-foreground">Durasi</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="border-b border-border hover:bg-secondary/30">

              {/* NAMA */}
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                      {getInitials(booking.guest_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {booking.guest_name || "Tanpa Nama"}
                  </span>
                </div>
              </TableCell>

              {/* NO. KAMAR */}
              <TableCell>
                {booking.rooms ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {booking.rooms.room_number}
                    </Badge>
                    {booking.rooms.floor && (
                      <span className="text-xs text-muted-foreground">
                        Lt. {booking.rooms.floor}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* KONTAK */}
              <TableCell className="text-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  {booking.guest_phone}
                </div>
              </TableCell>

              {/* DURASI */}
              <TableCell className="text-foreground">
                {booking.duration_months ? `${booking.duration_months} Bulan` : "1 Bulan"}
              </TableCell>

              {/* STATUS (Warna-warni) */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    booking.status === "approved"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : booking.status === "rejected"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                >
                  {booking.status === "approved" ? "Diterima" :
                    booking.status === "rejected" ? "Ditolak" : "Menunggu Konfirmasi"}
                </Badge>
              </TableCell>

              {/* TOMBOL AKSI */}
              <TableCell className="text-right">
                {booking.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2">
                    {/* Tombol TERIMA */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                      title="Terima Pengajuan"
                      onClick={() => handleUpdateStatus(booking.id, booking.room_id, 'approved', booking)}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>

                    {/* Tombol TOLAK */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      title="Tolak Pengajuan"
                      onClick={() => handleUpdateStatus(booking.id, booking.room_id, 'rejected', booking)}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                {/* Jika status sudah bukan pending, sembunyikan tombol */}
                {booking.status !== 'pending' && (
                  <span className="text-xs text-muted-foreground">Selesai</span>
                )}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}