"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, Mail, Lock, User, ShieldCheck, ArrowLeft, UserPlus, Phone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ForceLightMode } from "@/components/force-light-mode"
import { ModalAlert } from "@/components/ui/modal-alert"

type AuthMode = "login" | "register"
type UserRole = "user" | "admin"

interface AuthScreenProps {
    initialMode: AuthMode
}

export function AuthScreen({ initialMode }: AuthScreenProps) {
    const router = useRouter()
    const [mode, setMode] = useState<AuthMode>(initialMode)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [role, setRole] = useState<UserRole>("user")

    // Shared Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        whatsapp: ""
    })

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

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Handle URL sync
    useEffect(() => {
        if (mode === "login" && window.location.pathname !== "/login") {
            window.history.pushState(null, "", "/login")
        } else if (mode === "register" && window.location.pathname !== "/register") {
            window.history.pushState(null, "", "/register")
        }
    }, [mode])

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })
            if (error) throw error
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user?.id)
                .single()
            if (userError || !userData || !userData.role) throw new Error("Profile tidak ditemukan.")
            const userRole = userData.role
            const normalized = String(userRole || '').toLowerCase().replace(/\s|_/g, '')
            const isAdmin = normalized === 'admin' || normalized.includes('pemilik') || normalized.includes('owner') || normalized.includes('adminkos')
            if (isAdmin) router.push("/dashboard")
            else router.push("/")
            router.refresh()
        } catch (error: any) {
            showAlert("Login Gagal", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.fullName, role: role } },
            })
            if (error) throw error
            if (data.user) {
                const dbRole = role === 'admin' ? 'PEMILIK' : 'PENCARI'
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    role: dbRole,
                    full_name: formData.fullName,
                    whatsapp: formData.whatsapp
                }, { onConflict: 'id' })
                if (profileError) throw new Error("Gagal membuat profile.")
            }
            showAlert("Pendaftaran Berhasil", "Akun Anda telah terdaftar. Silakan login.", "success", () => setMode("login"));
        } catch (error: any) {
            showAlert("Gagal Mendaftar", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/${role === "admin" ? "dashboard" : ""}` },
            })
            if (error) throw error
        } catch (error: any) {
            showAlert("Login Google Gagal", error.message, "error")
        } finally {
            setGoogleLoading(false)
        }
    }

    const isLogin = mode === "login"

    return (
        <ForceLightMode>
            <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans">
                {/* Background Image (Static: no x transformation) */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7) contrast(1.1)'
                    }}
                />

                {/* Home Button */}
                <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-900/60 hover:text-slate-900 transition-colors font-bold group">
                    <div className="w-9 h-9 rounded-full bg-white/40 shadow-sm flex items-center justify-center group-hover:bg-white/80 transition-all border border-slate-200/50">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">KEMBALI KE BERANDA</span>
                </Link>

                <div className="relative w-full h-full max-w-[1100px] max-h-[660px] flex overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.15)] sm:rounded-[3rem] border border-white/50 z-10 scale-[0.9] sm:scale-100 bg-white/80 transition-all duration-700">
                    {/* Panels Container */}
                    <div className="absolute inset-0 flex">
                        {/* Left Panel (Form or Info) */}
                        <div className="flex-1 relative bg-white/40 border-r border-slate-200/50 z-20">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login-form"
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full flex flex-col justify-center p-10 sm:p-14 lg:p-20 text-slate-900"
                                    >
                                        <div className="mb-8">
                                            <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary/20">
                                                <span className="font-black text-2xl text-white">K</span>
                                            </div>
                                            <h2 className="text-4xl font-black mb-2 tracking-tight">MASUK AKUN</h2>
                                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                                                <button type="button" onClick={() => setRole("user")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === "user" ? "bg-white text-primary shadow-lg border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Mahasiswa</button>
                                                <button type="button" onClick={() => setRole("admin")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === "admin" ? "bg-white text-primary shadow-lg border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Pemilik</button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleLogin} className="space-y-4 max-w-sm">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</Label>
                                                <div className="relative">
                                                    <Input name="email" type="email" placeholder="email@anda.com" required onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-xl px-12 focus:ring-primary focus:border-primary transition-all text-slate-900" />
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                                                <div className="relative">
                                                    <Input name="password" type="password" placeholder="••••••••" required onChange={handleChange} className="h-12 bg-white border-slate-200 rounded-xl px-12 focus:ring-primary focus:border-primary transition-all text-slate-900" />
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                            <Button disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-[0.98]">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "MASUK SEKARANG"}
                                            </Button>

                                            <div className="pt-2 flex items-center gap-4">
                                                <div className="flex-1 h-px bg-slate-200" />
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">ATAU</span>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>

                                            <Button type="button" onClick={handleGoogleLogin} disabled={googleLoading} variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-[10px] tracking-widest">
                                                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "GOOGLE LOGIN"}
                                            </Button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register-info"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full flex flex-col justify-center items-center p-16 text-center text-slate-900"
                                    >
                                        <h3 className="text-4xl font-black mb-6 tracking-tighter">SUDAH PUNYA AKUN?</h3>
                                        <p className="text-slate-500 font-bold mb-10 max-w-xs text-base">Kembali masuk ke dashboard Anda dan lanjutkan pencarian hunian terbaik.</p>
                                        <Button onClick={() => setMode("login")} className="px-14 h-16 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-black text-xs tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.95]">
                                            LOGIN DISINI
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Panel (Form or Info) */}
                        <div className="flex-1 relative bg-white/40 z-20">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login-info"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full flex flex-col justify-center items-center p-16 text-center text-slate-900"
                                    >
                                        <h3 className="text-4xl font-black mb-6 tracking-tighter uppercase">Baru di Sini?</h3>
                                        <p className="text-slate-500 font-bold mb-10 max-w-xs text-base">Daftar sekarang dan temukan kemudahan mengelola serta mencari kosan impian Anda!</p>
                                        <Button onClick={() => setMode("register")} className="px-14 h-16 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-black text-xs tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.95]">
                                            DAFTAR SEKARANG
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register-form"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full flex flex-col justify-center p-10 sm:p-14 lg:p-20 text-slate-900"
                                    >
                                        <div className="mb-6">
                                            <h2 className="text-3xl font-black mb-4 tracking-tight">BUAT AKUN BARU</h2>
                                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                                                <button type="button" onClick={() => setRole("user")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === "user" ? "bg-white text-primary shadow-lg border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Mahasiswa</button>
                                                <button type="button" onClick={() => setRole("admin")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === "admin" ? "bg-white text-primary shadow-lg border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Pemilik</button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleRegister} className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</Label>
                                                    <Input name="fullName" placeholder="Contoh: Budi Gunawan" required onChange={handleChange} className="h-10 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all text-xs font-bold" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</Label>
                                                    <Input name="whatsapp" type="tel" placeholder="08..." required onChange={handleChange} className="h-10 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all text-xs font-bold" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Aktif</Label>
                                                <Input name="email" type="email" placeholder="nama@email.com" required onChange={handleChange} className="h-10 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all text-sm" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                                                <Input name="password" type="password" placeholder="••••••••" required minLength={6} onChange={handleChange} className="h-10 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all text-sm" />
                                            </div>
                                            <Button disabled={loading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest mt-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "DAFTAR SEKARANG"}
                                            </Button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sliding Overlay Layer */}
                    <motion.div
                        className="absolute inset-y-0 w-1/2 pointer-events-none hidden lg:block z-30"
                        animate={{ x: isLogin ? "100%" : "0%" }}
                        transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
                    >
                        <div className="w-full h-full bg-white/10 border-x border-white/20" />
                    </motion.div>
                </div>

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
            </div>
        </ForceLightMode>
    )
}
