"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, MapPin, DollarSign, Calendar, Upload, Loader2, CheckCircle, Clock, XCircle, Trash2, ShieldCheck, CreditCard, Navigation, ArrowLeft, MoreVertical, LayoutDashboard } from "lucide-react"
import { PaymentUploadDialog } from "@/components/payment-upload-dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ModalAlert } from "@/components/ui/modal-alert"
import { motion, AnimatePresence } from "framer-motion"

interface RentalInfo {
    room_number: string
    floor: number
    price_per_month: number
    rent_start_date: string
    rent_end_date: string
    kosan_name: string
    kosan_address: string
    kosan_city: string
    room_id: string
}

interface Transaction {
    id: string
    amount: number
    due_date: string
    period_month: string
    status: string
    payment_method: string | null
    proof_image_url: string | null
    payment_date: string | null
    created_at: string
}

export default function MyRentalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [rentalInfo, setRentalInfo] = useState<RentalInfo | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
    const [paymentDate, setPaymentDate] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("")
    const [proofImage, setProofImage] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [terminating, setTerminating] = useState(false)
    const [ownerId, setOwnerId] = useState<string | null>(null)
    const { toast } = useToast()

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

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            const { data: approvedBooking } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('status', 'approved')
                .not('room_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (!approvedBooking || !approvedBooking.room_id) {
                setLoading(false)
                return
            }

            const { data: roomData } = await supabase
                .from('rooms')
                .select(`
                    id, room_number, floor, price_per_month, rent_start_date, rent_end_date,
                    boarding_houses ( name, address, city, owner_id )
                `)
                .eq('id', approvedBooking.room_id)
                .single()

            if (roomData && roomData.boarding_houses) {
                const kosan = roomData.boarding_houses as any
                setRentalInfo({
                    room_number: roomData.room_number,
                    floor: roomData.floor,
                    price_per_month: roomData.price_per_month,
                    rent_start_date: roomData.rent_start_date,
                    rent_end_date: roomData.rent_end_date,
                    kosan_name: kosan.name,
                    kosan_address: kosan.address,
                    kosan_city: kosan.city,
                    room_id: roomData.id
                })
                if (kosan.owner_id) setOwnerId(kosan.owner_id)

                const { data: transData } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('room_id', roomData.id)
                    .order('due_date', { ascending: false })
                setTransactions(transData || [])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0,
        }).format(amount)
    }

    const handleUploadProof = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setPaymentDate(new Date().toISOString().split('T')[0])
        setUploadDialogOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setProofImage(e.target.files[0])
    }

    const handleSubmit = async () => {
        if (!selectedTransaction || !proofImage || !paymentDate || !paymentMethod) {
            showAlert("Data Belum Lengkap", "Semua field wajib diisi!", "warning")
            return
        }
        setUploading(true)
        try {
            const fileExt = proofImage.name.split('.').pop()
            const fileName = `${selectedTransaction.id}_${Date.now()}.${fileExt}`
            const filePath = `payment-proofs/${fileName}`
            const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(filePath, proofImage)
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(filePath)
            const { error: updateError } = await supabase.from('transactions').update({
                proof_image_url: publicUrl, payment_date: paymentDate, payment_method: paymentMethod,
            }).eq('id', selectedTransaction.id)
            if (updateError) throw updateError
            showAlert("Berhasil", "Bukti pembayaran diupload! Menunggu konfirmasi.", "success", () => window.location.reload())
        } catch (error: any) {
            showAlert("Gagal", error.message, "error")
        } finally {
            setUploading(false)
        }
    }

    const handleDeletePayment = async (transactionId: string) => {
        if (!confirm("Hapus riwayat pembayaran ini?")) return
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', transactionId)
            if (error) throw error
            toast({ title: "Berhasil", description: "Riwayat dihapus" })
            fetchData()
        } catch (error: any) {
            toast({ title: "Gagal", description: error.message, variant: "destructive" })
        }
    }

    const handleTerminateRental = async () => {
        setTerminating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { showAlert("Login Required", "", "info"); return; }
            const { error: deleteError } = await supabase.from('bookings').delete().eq('user_id', session.user.id).eq('status', 'approved')
            if (deleteError) throw deleteError
            showAlert("Berhasil", "Sewa diputuskan.", "success", () => router.push("/"))
        } catch (error: any) {
            showAlert("Error", error.message, "error")
        } finally {
            setTerminating(false)
        }
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

    if (!rentalInfo) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-20">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-none glass-card rounded-[3rem] overflow-hidden">
                            <CardContent className="p-16 text-center space-y-8">
                                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                                    <Home className="w-12 h-12 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">BELUM ADA SEWA AKTIF</h2>
                                    <p className="text-slate-500 font-bold max-w-sm mx-auto">Kami tidak dapat menemukan data sewa terverifikasi untuk akun Anda.</p>
                                </div>
                                <Button onClick={() => router.push("/")} className="h-16 px-10 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95">
                                    CARI KOSAN SEKARANG
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        )
    }

    const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'overdue')
    const paidTransactions = transactions.filter(t => t.status === 'paid')

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20 pt-20">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

                    <div className="flex gap-2 p-1 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                            Riwayat Transaksi
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                            Dokumen Sewa
                        </Button>
                    </div>

                    <Button
                        onClick={() => setTerminateDialogOpen(true)}
                        variant="ghost"
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        PUMUTUSAN SEWA
                    </Button>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left: Main Hub */}
                    <div className="lg:col-span-8 space-y-12">

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className="w-6 h-6 text-primary" />
                                <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Pusat Kendali <span className="text-primary not-italic">Hub</span></h1>
                            </div>
                            <p className="text-slate-500 font-bold max-w-xl">Kelola hunian, pantau tagihan, dan akses layanan bantuan dalam satu antarmuka premium.</p>
                        </div>

                        {/* Rental Intelligence Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />

                            <div className="grid md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Terverifikasi & Aktif</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter leading-none">{rentalInfo.kosan_name.toUpperCase()}</h2>
                                    </div>

                                    <div className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-white/5">
                                        <MapPin className="w-6 h-6 text-primary shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat Unit</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{rentalInfo.kosan_address}, {rentalInfo.kosan_city}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 rounded-[2rem] bg-slate-950 dark:bg-primary/20 text-white dark:text-primary-foreground shadow-2xl shadow-slate-900/20">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">No. Unit</p>
                                            <p className="text-3xl font-black">{rentalInfo.room_number}</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-transparent">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lantai</p>
                                            <p className="text-3xl font-black text-slate-950 dark:text-white">{rentalInfo.floor}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 flex flex-col justify-center">
                                    <div className="p-8 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-[1.02] transition-transform duration-500">
                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Biaya Sewa / Bln
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                                {formatRupiah(rentalInfo.price_per_month).replace("Rp", "").trim()}
                                            </span>
                                            <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">IDR</span>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            MASA BERLAKU SEWA
                                        </p>
                                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.1em]">
                                            {format(new Date(rentalInfo.rent_start_date), 'dd MMM yyyy', { locale: idLocale })} — {format(new Date(rentalInfo.rent_end_date), 'dd MMM yyyy', { locale: idLocale })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tagihan Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-primary" />
                                <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Tagihan & Invoicing</h3>
                            </div>

                            {pendingTransactions.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {pendingTransactions.map((tx) => (
                                        <motion.div
                                            key={tx.id}
                                            whileHover={{ y: -5 }}
                                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />

                                            <div className="flex justify-between items-start mb-8">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Periode</p>
                                                    <p className="text-xl font-black dark:text-white uppercase">{tx.period_month}</p>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-widest">MENUNGGU</div>
                                            </div>

                                            <div className="mb-8">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL PEMBAYARAN</p>
                                                <p className="text-4xl font-black text-primary tracking-tighter">{formatRupiah(tx.amount)}</p>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 mb-8 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <Clock className="w-4 h-4 text-amber-500" />
                                                JATUH TEMPO: {format(new Date(tx.due_date), 'dd MMM yyyy', { locale: idLocale }).toUpperCase()}
                                            </div>

                                            {!tx.proof_image_url ? (
                                                <Button
                                                    onClick={() => handleUploadProof(tx)}
                                                    className="w-full h-14 rounded-2xl bg-slate-950 dark:bg-slate-800 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                                                >
                                                    UNGGAH BUKTI SEKARANG
                                                </Button>
                                            ) : (
                                                <div className="w-full h-14 flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    VERIFIKASI ADMIN
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">SEMUA LUNAS!</h4>
                                    <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm">Hebat! Anda tidak memiliki tagihan tertunda untuk saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar Activity */}
                    <div className="lg:col-span-4 space-y-8">
                        {ownerId && (
                            <PaymentUploadDialog
                                roomId={rentalInfo.room_id}
                                propertyId=""
                                ownerId={ownerId}
                                monthlyRent={rentalInfo.price_per_month}
                                propertyName={rentalInfo.kosan_name}
                                onPaymentUploaded={fetchData}
                            />
                        )}

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="text-2xl font-black tracking-tighter leading-none">Pusat Layanan Mahasiswa</h4>
                                <p className="text-sm font-medium text-slate-400">Hubungi kami jika mengalami kendala fasilitas, sanitasi, atau gangguan di area hunian.</p>
                                <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                                    HUBUNGI ADMIN KOS
                                </Button>
                            </div>
                        </div>

                        {/* Mini Logs */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Histori Pembayaran</span>
                                <Button variant="link" className="text-[10px] font-black uppercase tracking-widest p-0 h-auto">Lihat Semua</Button>
                            </div>

                            <div className="space-y-4">
                                {paidTransactions.slice(0, 3).map((tx) => (
                                    <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-primary/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-green-500">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.period_month}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{format(new Date(tx.payment_date!), 'dd MMM yyyy')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-green-600 leading-none">{formatRupiah(tx.amount)}</p>
                                            <button onClick={() => handleDeletePayment(tx.id)} className="text-[9px] font-black text-red-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-1">Hapus</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Dialogs Redesign */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="rounded-[3rem] p-10 max-w-lg border-none glass-card">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">Konfirmasi Bayar</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-sm">Selesaikan transaksi untuk periode sebulan ke depan.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-slate-950 dark:bg-primary/20 text-white dark:text-primary-foreground shadow-2xl relative overflow-hidden">
                            <CreditCard className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">TOTAL TRANSFER</p>
                            <p className="text-4xl font-black tracking-tighter">
                                {selectedTransaction && formatRupiah(Number(selectedTransaction.amount))}
                            </p>
                            <div className="mt-4 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black w-fit uppercase tracking-widest">{selectedTransaction?.period_month}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TGL BAYAR</Label>
                                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-xs" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">METODE</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-xs uppercase tracking-widest px-6">
                                        <SelectValue placeholder="PILIH" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/10 glass-card">
                                        <SelectItem value="transfer" className="font-bold text-xs uppercase tracking-widest">BANK TRANSFER</SelectItem>
                                        <SelectItem value="e-wallet" className="font-bold text-xs uppercase tracking-widest">E-WALLET</SelectItem>
                                        <SelectItem value="cash" className="font-bold text-xs uppercase tracking-widest">TUNAI / CASH</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FOTO BUKTI TRANSAKSI</Label>
                            <label className="flex flex-col items-center justify-center h-48 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary/50 bg-slate-50 dark:bg-white/5 cursor-pointer transition-all overflow-hidden group">
                                {proofImage ? (
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-8 h-8 text-primary" />
                                            <span className="text-primary font-black text-[9px] tracking-widest">GANTI FILE</span>
                                        </div>
                                        <p className="p-4 text-center font-black text-slate-500 text-xs truncate w-full">{proofImage.name}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Klik atau drop file gambar</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={uploading || !proofImage || !paymentDate || !paymentMethod}
                            className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all active:scale-95"
                        >
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "KONFIRMASI PEMBAYARAN"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
                <DialogContent className="max-w-md rounded-[3rem] p-10 border-none glass-card">
                    <DialogHeader className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">PUTUSKAN SEWA?</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold">Konfirmasi pengosongan unit hunian.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center leading-relaxed italic">
                            Dengan menekan tombol di bawah, Anda secara resmi menyatakan keluar dari hunian ini dan mengembalikan akses bagi mahasiswa lain.
                        </p>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setTerminateDialogOpen(false)}
                                className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest"
                            >
                                BATAL
                            </Button>
                            <Button
                                onClick={handleTerminateRental}
                                disabled={terminating}
                                className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20"
                            >
                                {terminating ? <Loader2 className="w-5 h-5 animate-spin" /> : "YA, KELUAR UNIT"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
            <Footer />
        </main>
    )
}
