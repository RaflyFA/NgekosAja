"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Home, ArrowLeft, MoreVertical, CreditCard, ShieldCheck, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { motion, AnimatePresence } from "framer-motion"

export default function MyBookingsPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMyBookings = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                  *,
                  boarding_houses ( name, image_url, city, address )
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

    const getStatusBadge = (status: string) => {
        const config = {
            'Diterima': { icon: CheckCircle, label: "DISETUJUI", color: "bg-green-600 shadow-green-500/20" },
            'Ditolak': { icon: XCircle, label: "DITOLAK", color: "bg-red-600 shadow-red-500/20" },
            'pending': { icon: Clock, label: "MENUNGGU", color: "bg-amber-500 shadow-amber-500/20" },
        }
        const s = config[status as keyof typeof config] || config.pending
        return (
            <div className={`px-4 py-1.5 rounded-xl ${s.color} text-white text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg`}>
                <s.icon className="w-3 h-3" />
                {s.label}
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        })
    }

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
            <Header />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <Link href="/">
                            <Button variant="ghost" className="h-10 px-0 hover:bg-transparent group">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary">KEMBALI KE BERANDA</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-primary" />
                            <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Status <span className="text-primary not-italic">Sewa</span></h1>
                        </div>
                    </div>

                    <Link href="/">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-950 dark:bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95">
                            CARI UNIT LAIN
                        </Button>
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-none glass-card rounded-[3rem] overflow-hidden">
                            <CardContent className="p-16 text-center space-y-8">
                                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                                    <Home className="w-12 h-12 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter uppercase">BELUM ADA PENGAJUAN</h2>
                                    <p className="text-slate-500 font-bold max-w-sm mx-auto uppercase text-xs tracking-widest">Anda belum mengajukan sewa di unit kos manapun saat ini.</p>
                                </div>
                                <Link href="/">
                                    <Button className="h-16 px-10 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95">
                                        TELUSURI UNIT SEKARANG
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid gap-10">
                        <AnimatePresence>
                            {bookings.map((booking, idx) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-2xl"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Image Area */}
                                        <div className="lg:w-72 h-64 lg:h-auto bg-slate-100 dark:bg-white/5 relative overflow-hidden shrink-0">
                                            <img
                                                src={booking.boarding_houses?.image_url || "/placeholder.svg"}
                                                alt="Kos"
                                                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                            />
                                            <div className="absolute top-6 left-6">
                                                {getStatusBadge(booking.status)}
                                            </div>
                                        </div>

                                        {/* Content Detail */}
                                        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h3 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase group-hover:text-primary transition-colors">{booking.boarding_houses?.name}</h3>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                                            {booking.boarding_houses?.city} — {booking.boarding_houses?.address}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(booking.created_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">DURASI SEWA</p>
                                                        <p className="text-xl font-black italic dark:text-white">{booking.duration_months} BULAN</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ESTIMASI TOTAL</p>
                                                        <p className="text-xl font-black text-primary">{formatRupiah(booking.total_price)}</p>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">PENGAJUAN ID</p>
                                                        <p className="text-xs font-bold text-slate-500 truncate">#{booking.id.slice(0, 8).toUpperCase()}</p>
                                                    </div>
                                                    <div className="flex justify-end items-end">
                                                        {booking.status === 'Diterima' ? (
                                                            <Link href="/my-rental" className="w-full">
                                                                <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95">
                                                                    KELOLA SEWA
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                <ShieldCheck className="w-4 h-4" />
                                                                IN REVIEW
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    )
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)