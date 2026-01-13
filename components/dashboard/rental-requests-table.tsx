"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Phone, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase" // Import Supabase
import { useRouter } from "next/navigation" // Untuk refresh halaman

interface RentalRequestsTableProps {
  bookings?: any[] 
}

export function RentalRequestsTable({ bookings = [] }: RentalRequestsTableProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  // --- FUNGSI UPDATE STATUS ---
  const handleUpdateStatus = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(bookingId) // Aktifkan loading di tombol

    // 1. Update ke Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    // 2. Cek Hasil
    if (error) {
      alert("Gagal mengupdate status: " + error.message)
    } else {
      // 3. Refresh halaman agar data tabel & kartu statistik di atas berubah
      window.location.reload() 
    }
    
    setProcessingId(null)
  }
  
  // Fungsi pembuat inisial nama
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
                      ? "bg-green-100 text-green-800 hover:bg-green-100" // Hijau
                      : booking.status === "rejected"
                      ? "bg-red-100 text-red-800 hover:bg-red-100" // Merah
                      : "bg-amber-100 text-amber-800 hover:bg-amber-100" // Kuning (Pending)
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
                      onClick={() => handleUpdateStatus(booking.id, 'approved')}
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
                      onClick={() => handleUpdateStatus(booking.id, 'rejected')}
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