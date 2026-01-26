"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera, Loader2, Mail, Phone, Edit2, Calendar, Home, CheckCircle, XCircle, Clock, User, ArrowLeft, ArrowRight, Settings, Sparkles, MessageSquare, MapPin, Heart } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ModalAlert } from "@/components/ui/modal-alert"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileData {
    id: string
    full_name: string
    email: string
    whatsapp: string
    avatar_url: string
    bio: string
    role: string
}

interface Booking {
    id: string
    status: string
    check_in_date: string
    duration_months: number
    created_at: string
    room_number: string
    property_name: string
    property_address: string
}

interface SavedProperty {
    id: string
    name: string
    location: string
    image: string
    price: number
}

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
    const [editOpen, setEditOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" | "warning";
    }>({ isOpen: false, title: "", message: "", type: "info" });

    const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const [formData, setFormData] = useState({
        full_name: "", whatsapp: "", bio: "", avatar_url: ""
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push("/login"); return; }

            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
            if (profileData) {
                setProfile({ ...profileData, email: session.user.email || "" })
                setFormData({
                    full_name: profileData.full_name || "",
                    whatsapp: profileData.whatsapp || "",
                    bio: profileData.bio || "",
                    avatar_url: profileData.avatar_url || ""
                })
            }

            const { data: bookingsData } = await supabase
                .from('bookings')
                .select(`
                    *,
                    rooms (
                        room_number,
                        boarding_houses (name, address)
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (bookingsData && bookingsData.length > 0) {
                const mapped = bookingsData.map((b: any) => {
                    const room = b.rooms
                    const property = room?.boarding_houses
                    return {
                        id: b.id,
                        status: b.status,
                        check_in_date: b.check_in_date,
                        duration_months: b.duration_months,
                        created_at: b.created_at,
                        room_number: room?.room_number || "-",
                        property_name: property?.name || "-",
                        property_address: property?.address || "-"
                    }
                })
                setBookings(mapped)
            } else setBookings([])

            const { data: savedData } = await supabase.from('saved_properties').select(`*, boarding_houses (*)`).eq('user_id', session.user.id)
            if (savedData) {
                const mappedSaved = savedData.map((s: any) => {
                    const bh = s.boarding_houses
                    return {
                        id: bh.id,
                        name: bh.name,
                        location: bh.city,
                        image: (typeof bh.images === 'string' ? JSON.parse(bh.images) : bh.images)?.[0] || bh.image_url,
                        price: bh.price
                    }
                })
                setSavedProperties(mappedSaved)
            }
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
            const fileExt = file.name.split('.').pop()
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
        } catch (error: any) { showAlert("Gagal Upload", error.message, "error") } finally { setUploading(false) }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
            const { error } = await supabase.from('profiles').update({
                full_name: formData.full_name, whatsapp: formData.whatsapp,
                bio: formData.bio, avatar_url: formData.avatar_url
            }).eq('id', session.user.id)
            if (error) throw error
            showAlert("Profil Diperbarui", "Perubahan berhasil disimpan!", "success")
            setEditOpen(false); fetchProfile()
        } catch (error: any) { showAlert("Error", error.message, "error") } finally { setSaving(false) }
    }

    const getStatusBadge = (status: string) => {
        const config = {
            approved: { icon: CheckCircle, label: "DISETUJUI", color: "bg-green-600 shadow-green-500/20" },
            rejected: { icon: XCircle, label: "DITOLAK", color: "bg-red-600 shadow-red-500/20" },
            pending: { icon: Clock, label: "MENUNGGU", color: "bg-amber-500 shadow-amber-500/20" },
        }
        const s = config[status as keyof typeof config] || config.pending
        return (
            <div className={`px-4 py-1.5 rounded-xl ${s.color} text-white text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg`}>
                <s.icon className="w-3 h-3" />
                {s.label}
            </div>
        )
    }

    if (loading) {
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
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20 pt-20">
            <Header />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/">
                        <Button variant="ghost" className="h-10 px-0 hover:bg-transparent group">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary">KEMBALI KE BERANDA</span>
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PENGATURAN AKUN</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left: Profile Information */}
                    <div className="lg:col-span-12 space-y-12">

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="w-6 h-6 text-primary" />
                                <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Identitas <span className="text-primary not-italic">Digital</span></h1>
                            </div>
                            <p className="text-slate-500 font-bold max-w-xl">Kelola data personal dan pantau riwayat interaksi Anda dengan ekosistem NgekosAja.</p>
                        </div>

                        {/* Premium Identity Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-12 relative z-10 items-center md:items-start">
                                {/* Avatar Display and Upload */}
                                <div className="relative group/avatar">
                                    <div className="w-48 h-48 rounded-[3rem] bg-slate-50 dark:bg-white/5 border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/avatar:scale-110" />
                                        ) : (
                                            <span className="text-6xl font-black text-primary">{profile?.full_name?.charAt(0).toUpperCase() || "?"}</span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center cursor-pointer">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8 text-center md:text-left">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="px-3 py-1 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest">MAHASISWA</div>
                                            <div className="flex items-center gap-2 text-green-500 font-black text-[9px] uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                Verified
                                            </div>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter leading-none">{profile?.full_name?.toUpperCase() || "NAME NOT SET"}</h2>
                                        <p className="text-slate-500 font-bold text-lg max-w-lg">{profile?.bio || "Digital nomad looking for best place to stay."}</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary shadow-sm"><Mail className="w-5 h-5" /></div>
                                                <div className="text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-blue-500 shadow-sm"><Phone className="w-5 h-5" /></div>
                                                <div className="text-left">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp ID</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile?.whatsapp || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-center md:justify-end">
                                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="h-14 px-8 rounded-[1.5rem] bg-slate-950 dark:bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 gap-3">
                                                        <Edit2 className="w-4 h-4" />
                                                        UPDATE PROFIL
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2.5rem] p-10 max-w-lg border-none glass-card">
                                                    <DialogHeader className="mb-8">
                                                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Edit Identitas</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-6">
                                                        <div className="flex justify-center mb-8">
                                                            <div className="relative group/edit-avatar">
                                                                <div className="w-24 h-24 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
                                                                    {formData.avatar_url ? <img src={formData.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-primary">{formData.full_name?.charAt(0).toUpperCase()}</span>}
                                                                </div>
                                                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90">
                                                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
                                                                    <input type="file" className="hidden" onChange={handleAvatarUpload} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5 font-black text-[10px] tracking-widest text-slate-400">
                                                            <Label>NAMA LENGKAP</Label>
                                                            <Input value={formData.full_name} onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-sm" />
                                                        </div>
                                                        <div className="space-y-1.5 font-black text-[10px] tracking-widest text-slate-400">
                                                            <Label>BIO SINGKAT</Label>
                                                            <Textarea value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} className="h-24 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-sm resize-none" />
                                                        </div>
                                                        <div className="space-y-1.5 font-black text-[10px] tracking-widest text-slate-400">
                                                            <Label>NOMOR WHATSAPP</Label>
                                                            <Input type="tel" value={formData.whatsapp} onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-sm" />
                                                        </div>
                                                        <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 rounded-2xl bg-primary font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                                            {saving ? "SAVING..." : "SIMPAN PERUBAHAN"}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Booking History Experience */}
                        <div className="space-y-10 pt-10">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-primary" />
                                    <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Riwayat Aktivitas</h3>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bookings.length} TOTAL KEGIATAN</div>
                            </div>

                            {bookings.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-24 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]"
                                >
                                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-6" />
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">BELUM ADA AKTIVITAS</h4>
                                    <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm mt-2">Semua riwayat sewa dan interaksi Anda akan muncul di sini secara otomatis.</p>
                                </motion.div>
                            ) : (
                                <div className="grid gap-8">
                                    <AnimatePresence>
                                        {bookings.map((booking, idx) => (
                                            <motion.div
                                                key={booking.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-2xl"
                                            >
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            {getStatusBadge(booking.status)}
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-200 dark:border-white/10 pl-4 flex items-center gap-2">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                Dibuat: {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase group-hover:text-primary transition-colors">{booking.property_name}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                                                                <MapPin className="w-3 h-3 text-primary" />
                                                                {booking.property_address}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-4 pt-4">
                                                            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">NO. UNIT</span>
                                                                <span className="text-sm font-black text-slate-900 dark:text-white">{booking.room_number.toUpperCase()}</span>
                                                            </div>
                                                            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DURASI</span>
                                                                <span className="text-sm font-black text-slate-900 dark:text-white">{booking.duration_months} BLN</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end md:w-48">
                                                        <Button variant="ghost" className="h-10 px-0 hover:bg-transparent group/see">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/see:text-primary transition-colors">TINJAU DETAIL</span>
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 shadow-sm flex items-center justify-center ml-4 group-hover/see:bg-primary group-hover/see:text-white transition-all">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </div>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Saved Properties Hub */}
                        <div className="space-y-10 pt-20">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                                    <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Hunian Favorit</h3>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{savedProperties.length} TERSIMPAN</div>
                            </div>

                            {savedProperties.length === 0 ? (
                                <div className="text-center py-20 bg-white/40 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
                                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest leading-loose">
                                        Hunian yang Anda sukai akan <br /> muncul secara eksklusif di sini.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {savedProperties.map((prop) => (
                                        <Link key={prop.id} href={`/kos/${prop.id}`}>
                                            <div className="group relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img src={prop.image || "/placeholder.svg"} alt={prop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest shadow-lg">
                                                        Mulai {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(prop.price).replace("Rp", "").trim()}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tighter line-clamp-1">{prop.name}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 tracking-widest flex items-center gap-2 mt-1">
                                                            <MapPin className="w-3 h-3 text-primary" />
                                                            {prop.location.toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-primary font-black text-[9px] tracking-widest mt-4 group-hover:translate-x-1 transition-transform">
                                                        LIHAT DETAIL <ArrowRight className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ModalAlert
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <Footer />
        </main>
    )
}
