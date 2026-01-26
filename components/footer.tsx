"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Search, Phone, Mail, MapPin, Facebook, Instagram, Twitter, LogOut, ClipboardList, Shield, CreditCard, HelpCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

export function Footer() {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <footer className="bg-slate-950 text-slate-400 mt-24 border-t border-white/5 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform w-fit">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-black text-xl">N</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter text-white leading-none">NGEKOSAJA</span>
                                <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase leading-none mt-1">Premium Housing</span>
                            </div>
                        </Link>

                        <p className="text-sm leading-relaxed max-w-xs font-medium text-slate-500">
                            Solusi hunian premium untuk masa depan yang lebih nyaman. Temukan, kelola, dan sewa kosan terbaik dengan standar eksklusif.
                        </p>

                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                                <Link
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-8 lg:ml-12">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Navigasi Utama</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Beranda", href: "/", icon: Home },
                                { name: "Cari Hunian", href: "/search", icon: Search },
                                { name: "Kelola Sewa", href: "/my-bookings", icon: ClipboardList },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="group flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-all duration-300" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Layanan & Keamanan</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Metode Pembayaran", icon: CreditCard },
                                { name: "Pusat Bantuan", icon: HelpCircle },
                                { name: "Jaminan Keamanan", icon: Shield },
                            ].map((item) => (
                                <li key={item.name}>
                                    <button className="group flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-all text-left">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-all duration-300" />
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="group flex items-center gap-3 text-sm font-bold text-red-400/70 hover:text-red-400 transition-all"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 scale-0 group-hover:scale-100 transition-all duration-300" />
                                    Keluar Sesi
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Kontak Resmi</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    Jl. Menteng Raya No. 42,<br />Jakarta Pusat, 10310
                                </span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">+62 21 8000 9000</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">contact@ngekosaja.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 mt-20 pt-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                                © {new Date().getFullYear()} NGEKOSAJA
                            </p>
                            <span className="hidden md:inline text-slate-800 text-[10px]">•</span>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                                PREMIUM HOUSING HUB INDONESIA
                            </p>
                        </div>

                        <div className="flex items-center gap-8">
                            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
