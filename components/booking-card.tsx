"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase" 
import { useRouter } from "next/navigation" 

interface BookingCardProps {
  price: number
  propertyId: string 
}

export function BookingCard({ price, propertyId }: BookingCardProps) {
  const router = useRouter()
  const [isSticky, setIsSticky] = useState(false)
  const [duration, setDuration] = useState("1")
  const [checkInDate, setCheckInDate] = useState("")
  
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isMobileFixed, setIsMobileFixed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 300
      setIsSticky(isScrolled)
      setIsMobileFixed(isScrolled && window.innerWidth < 1024)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalPrice = price * (Number.parseInt(duration))

  const handleBooking = async () => {
    if (!guestName || !guestPhone || !checkInDate) {
      alert("Harap lengkapi Nama, Nomor HP, dan Tanggal Masuk!");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('bookings').insert({
      property_id: propertyId,
      guest_name: guestName,
      guest_phone: guestPhone,
      start_date: checkInDate,
      duration_months: parseInt(duration),
      total_price: totalPrice,
      status: 'pending'
    });

    if (error) {
      alert("Gagal melakukan booking: " + error.message);
    } else {
      alert("✅ Berhasil! Pengajuan sewa telah dikirim ke pemilik kos.");
      // Reset form
      setGuestName("");
      setGuestPhone("");
      setCheckInDate("");
    }

    setIsLoading(false);
  }

  if (isMobileFixed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-4 lg:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Harga per bulan</p>
              <p className="text-lg font-bold text-primary">{formatPrice(price)}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex-1">
                Isi Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Card
  return (
    <div className={`space-y-6 ${isSticky ? "sticky top-20 lg:block" : ""} hidden lg:block`}>
      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        
        {/* Price Section */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Harga per bulan</p>
          <p className="text-3xl font-bold text-primary">{formatPrice(price)}</p>
          <p className="text-sm text-muted-foreground">
            Total: {formatPrice(totalPrice)} ({duration} bulan)
          </p>
        </div>

        {/* INPUT DATA PENYEWA (BARU) */}
        <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-semibold text-sm">Data Penyewa</h3>
            
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
             <input
              type="tel"
              placeholder="Nomor WhatsApp (08xxxx)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>

        {/* Duration Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Durasi Sewa</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">1 Bulan</option>
            <option value="3">3 Bulan</option>
            <option value="6">6 Bulan</option>
            <option value="12">1 Tahun</option>
          </select>
        </div>

        {/* Check-in Date */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Tanggal Masuk</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleBooking}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Ajukan Sewa"}
          </Button>
          
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <MessageCircle className="w-4 h-4" />
            Chat Pemilik
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-secondary space-y-2">
          <p className="text-xs font-semibold text-foreground">Informasi Penting</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Pastikan data diri sesuai KTP</li>
            <li>• Pemilik akan menghubungi via WhatsApp</li>
            <li>• Pembayaran dilakukan setelah survey</li>
          </ul>
        </div>
      </div>
    </div>
  )
}