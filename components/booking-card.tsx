"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, CreditCard, Calendar, Users, Home, Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { createNotification } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"
import { ModalAlert } from "@/components/ui/modal-alert"
import { motion, AnimatePresence } from "framer-motion"

interface Room {
  id: string
  room_number: string
  floor: number | null
  price_per_month: number
  is_occupied: boolean
}

interface BookingCardProps {
  price: number
  propertyId: string
  ownerWhatsApp?: string
  ownerName?: string
  propertyName?: string
}

export function BookingCard({ price, propertyId, ownerWhatsApp, ownerName, propertyName }: BookingCardProps) {
  const router = useRouter()
  const [isSticky, setIsSticky] = useState(false)
  const [duration, setDuration] = useState("1")
  const [checkInDate, setCheckInDate] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileFixed, setIsMobileFixed] = useState(false)

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    onClose?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info", onClose?: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type, onClose });
  };

  // Room selection state
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)

  // Active booking check
  const [hasActiveBooking, setHasActiveBooking] = useState(false)
  const [checkingBooking, setCheckingBooking] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 300
      setIsSticky(isScrolled)
      setIsMobileFixed(isScrolled && window.innerWidth < 1024)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchRooms = async () => {
      if (!propertyId) return
      setLoadingRooms(true)
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('kos_id', propertyId)
          .order('room_number')
        if (!error && data) setRooms(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingRooms(false)
      }
    }
    fetchRooms()
  }, [propertyId])

  useEffect(() => {
    checkActiveBooking()
  }, [])

  const checkActiveBooking = async () => {
    setCheckingBooking(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setCheckingBooking(false)
        return
      }
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('status', 'approved')
        .limit(1)
      if (!error && data && data.length > 0) setHasActiveBooking(true)
    } catch (error) {
      console.error(error)
    } finally {
      setCheckingBooking(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalPrice = price * (Number.parseInt(duration))

  const handleBooking = async () => {
    if (hasActiveBooking) {
      showAlert("Sewa Aktif", "Anda sudah memiliki sewa aktif! Silakan putuskan sewa terlebih dahulu jika ingin pindah.", "warning");
      return;
    }
    if (rooms.length === 0) {
      showAlert("Kamar Tidak Tersedia", "Belum ada kamar tersedia di kosan ini.", "error");
      return;
    }
    if (!guestName || !guestPhone || !checkInDate || !selectedRoomId) {
      showAlert("Data Belum Lengkap", "Harap lengkapi semua data pencarian hunian!", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showAlert("Perlu Login", "Anda harus login terlebih dahulu!", "info", () => router.push("/login"));
        return;
      }
      const { data: bookingData, error } = await supabase.from('bookings').insert({
        property_id: propertyId,
        room_id: selectedRoomId,
        user_id: session.user.id,
        guest_name: guestName,
        guest_phone: guestPhone,
        start_date: checkInDate,
        duration_months: parseInt(duration),
        total_price: totalPrice,
        status: 'pending'
      }).select().single();

      if (error) throw error;

      const { data: propertyData } = await supabase
        .from('boarding_houses')
        .select('owner_id, name')
        .eq('id', propertyId)
        .single()

      await createNotification(session.user.id, 'Sewa Berhasil Diajukan', `Pengajuan sewa kos "${propertyData?.name || 'Kosan'}" berhasil dikirim.`, 'booking_submitted', bookingData.id)
      if (propertyData?.owner_id) {
        await createNotification(propertyData.owner_id, 'Pengajuan Sewa Baru', `Ada pengajuan sewa baru untuk kos "${propertyData.name}" dari ${guestName}.`, 'booking_submitted', bookingData.id)
      }

      showAlert("Pengajuan Terkirim", "Permintaan sewa Anda telah terkirim ke pemilik. Silakan hubungi via WhatsApp untuk survey.", "success");
      setGuestName(""); setGuestPhone(""); setCheckInDate(""); setSelectedRoomId("");
    } catch (error: any) {
      showAlert("Gagal", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const commonAlertModal = (
    <ModalAlert
      isOpen={alertConfig.isOpen}
      title={alertConfig.title}
      message={alertConfig.message}
      type={alertConfig.type}
      onClose={() => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        if (alertConfig.onClose) alertConfig.onClose();
      }}
    />
  );

  const cardContent = (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-white/10 p-8 shadow-2xl relative overflow-hidden">
      {/* Animated Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

      {/* Header Price */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">HARGA TERBAIK</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">
            {formatPrice(price).replace("Rp", "").trim()}
          </span>
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">/ BLN</span>
        </div>
        {duration !== "1" && (
          <p className="text-xs font-bold text-slate-400 mt-2">
            Total Estimasi: <span className="text-slate-950 dark:text-slate-200">{formatPrice(totalPrice)}</span>
          </p>
        )}
      </div>

      {/* Input Form Area */}
      <div className="space-y-6 relative z-10">
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-focus-within:bg-primary/10 transition-colors">
              <Users className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />
            </div>
            <input
              type="text"
              placeholder="Nama Lengkap Penanggung Jawab"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full h-14 pl-16 pr-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-focus-within:bg-primary/10 transition-colors">
              <MessageCircle className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />
            </div>
            <input
              type="text"
              placeholder="WhatsApp (Aktif)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full h-14 pl-16 pr-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">DURASI</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-black text-slate-950 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="1">1 BULAN</option>
              <option value="3">3 BULAN</option>
              <option value="6">6 BULAN</option>
              <option value="12">1 TAHUN</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">TGL MASUK</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-[10px] font-black text-slate-950 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">PILIH KAMAR TERSEDIA</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full h-14 pl-16 pr-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-black text-slate-950 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
              disabled={loadingRooms}
            >
              <option value="">{loadingRooms ? "MEMUAT DATA..." : "KETUK UNTUK MEMILIH"}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} disabled={room.is_occupied}>
                  KAMAR {room.room_number.toUpperCase()} {room.is_occupied ? '(PENUH)' : `(TERSEDIA)`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all active:scale-95 gap-3"
          onClick={handleBooking}
          disabled={isLoading || hasActiveBooking || checkingBooking}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (hasActiveBooking ? "SUDAH MENYEWA" : "SEWA SEKARANG")}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-14 rounded-2xl text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5 gap-3"
          onClick={() => {
            if (ownerWhatsApp) {
              const message = encodeURIComponent(`Halo ${ownerName || 'Pemilik'}, saya ingin bertanya terkait kosan ${propertyName || 'ini'}.`)
              const cleanPhone = ownerWhatsApp.replace(/\D/g, '')
              const phoneWithCode = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone.replace(/^0/, '')}`
              window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank')
            } else {
              showAlert("WhatsApp Tidak Tersedia", "Nomor WhatsApp pemilik tidak tersedia.", "error")
            }
          }}
        >
          <MessageCircle className="w-5 h-5" />
          CHAT PEMILIK
        </Button>

        <div className="p-5 rounded-[1.5rem] bg-slate-950/5 dark:bg-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-300">PENTING</span>
          </div>
          <ul className="text-[9px] font-bold text-slate-500 dark:text-slate-400 space-y-1.5 ml-1">
            <li>• Pastikan nomor WhatsApp aktif untuk dihubungi pemilik</li>
            <li>• Pemilik berhak menolak pengajuan jika tidak sesuai</li>
            <li>• Segala transaksi keuangan dilakukan saat survey</li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (isMobileFixed) {
    return (
      <>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 p-6 lg:hidden"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HARGA / BLN</p>
              <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(price).replace("Rp", "").trim()}</p>
            </div>
            <Button
              className="flex-1 h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest active:scale-95"
              onClick={() => {
                const element = document.getElementById('booking-form')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              LIHAT KAMAR
            </Button>
          </div>
        </motion.div>
        {commonAlertModal}
      </>
    )
  }

  return (
    <div id="booking-form" className={`transition-all duration-500 ${isSticky ? "sticky top-28 lg:block" : ""} hidden lg:block pb-10`}>
      {cardContent}
      {commonAlertModal}
    </div>
  )
}