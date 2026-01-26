"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Sparkles, Home, Users, ShieldCheck, Star, ArrowRight, TrendingUp, Navigation } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { PropertyListing } from "@/components/property-listing"
import { Footer } from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function HomePageClient() {
    const [location, setLocation] = useState("")
    const [kosType, setKosType] = useState("")
    const [properties, setProperties] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [searchParams, setSearchParams] = useState({ location: "", type: "" })

    const initialFetchDone = useRef(false)

    const fetchProperties = useCallback(async (searchLocation?: string, searchType?: string) => {
        setIsLoading(true)
        try {
            let query = supabase
                .from('boarding_houses')
                .select('*')
                .order('created_at', { ascending: false })

            if (searchLocation && searchLocation.trim()) {
                query = query.or(`city.ilike.%${searchLocation.trim()}%,address.ilike.%${searchLocation.trim()}%,name.ilike.%${searchLocation.trim()}%`)
            }

            if (searchType && searchType !== "all" && searchType !== "") {
                query = query.eq('gender_type', searchType.toLowerCase())
            }

            const { data, error } = await query
            setProperties(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchProperties()
            initialFetchDone.current = true
        }
    }, [fetchProperties])

    const handleSearch = async () => {
        setIsSearching(true)
        setHasSearched(true)
        setSearchParams({ location, type: kosType })
        await fetchProperties(location, kosType)
        setIsSearching(false)
    }

    const handleReset = () => {
        setLocation("")
        setKosType("")
        setHasSearched(false)
        setSearchParams({ location: "", type: "" })
        fetchProperties()
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
            <Header />

            {/* Hero Section: Cinematic & Engaging */}
            <section className="relative w-full min-h-[85vh] flex items-center pt-20 pb-24 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>SOLUSI HUNIAN MAHASISWA TERBAIK</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[0.9] tracking-tighter"
                        >
                            TEMUKAN KOS <br />
                            <span className="text-primary tracking-[-0.05em] relative">
                                PREMIUM-MU
                                <motion.span
                                    className="absolute -bottom-2 left-0 h-2 bg-primary/20 w-full -z-10"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 1 }}
                                />
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-bold mb-16 leading-relaxed"
                        >
                            Akses ribuan pilihan kos eksklusif dengan standar kenyamanan hotel,
                            keamanan 24 jam, dan harga yang tetap bersahabat untuk mahasiswa.
                        </motion.p>

                        {/* Search Bar: Large & Elevated */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="w-full max-w-5xl"
                        >
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none p-4 md:p-5 border border-white dark:border-white/5">
                                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col md:flex-row items-center gap-4">
                                    <div className="relative flex-1 w-full group">
                                        <div className="w-12 h-12 absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl group-focus-within:bg-primary/10 transition-colors">
                                            <Navigation className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Cari Kota, Universitas, atau Nama Kos..."
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="h-16 pl-16 pr-6 border-none focus-visible:ring-0 text-slate-900 dark:text-white bg-transparent text-lg font-bold placeholder:text-slate-300 placeholder:font-bold"
                                        />
                                    </div>

                                    <div className="w-full md:w-56">
                                        <Select value={kosType} onValueChange={setKosType}>
                                            <SelectTrigger className="h-16 border-none focus:ring-0 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest px-8">
                                                <SelectValue placeholder="SEMUA TIPE" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-white/10 glass-card">
                                                <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">Semua Tipe</SelectItem>
                                                <SelectItem value="putra" className="font-black text-[10px] uppercase tracking-widest">Putra</SelectItem>
                                                <SelectItem value="putri" className="font-black text-[10px] uppercase tracking-widest">Putri</SelectItem>
                                                <SelectItem value="campur" className="font-black text-[10px] uppercase tracking-widest">Campur</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="h-16 px-10 w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        CARI SEKARANG
                                    </Button>
                                </form>
                            </div>

                            {/* Tags / Quick Filters */}
                            <div className="flex flex-wrap justify-center gap-8 mt-12">
                                {[
                                    { icon: ShieldCheck, text: "PEMILIK TERVERIFIKASI", color: "text-green-500" },
                                    { icon: Users, text: "15RB+ MAHASISWA", color: "text-blue-500" },
                                    { icon: Star, text: "RATING 4.8/5.0", color: "text-amber-500" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Properties Grid: Focused on Visuals */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200 dark:border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                            <TrendingUp className="w-4 h-4" />
                            REKOMENDASI TERBAIK
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {hasSearched ? "HASIL PENCARIAN" : "REKOMENDASI TERPOPULER"}
                        </h2>
                        <p className="text-slate-500 font-bold">
                            {hasSearched
                                ? `Ditemukan ${properties.length} unit yang sesuai dengan ekspektasi Anda.`
                                : "Temukan pilihan hunian yang telah dikurasi ketat oleh tim ahli kami."
                            }
                        </p>
                    </div>
                    {hasSearched && (
                        <Button onClick={handleReset} variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                            RESET PENCARIAN
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="bg-slate-200 dark:bg-white/5 rounded-[2.5rem] h-[450px] animate-pulse" />
                            ))}
                        </motion.div>
                    ) : properties.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-32 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10"
                        >
                            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <Home className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">KOS TIDAK DITEMUKAN</h3>
                            <p className="text-slate-500 font-bold max-w-md mx-auto mb-10">
                                Maaf, kami tidak menemukan kriteria yang sesuai. Coba cari dengan lokasi atau tipe yang berbeda.
                            </p>
                            <Button onClick={handleReset} className="h-14 px-10 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20">
                                LIHAT SEMUA KOSAN
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="transition-all duration-700"
                        >
                            <PropertyListing properties={properties} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Premium CTA Section */}
            {!hasSearched && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                    <div className="bg-slate-900 dark:bg-primary/10 rounded-[4rem] p-12 md:p-24 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full -mr-40 -mt-40 blur-[150px] group-hover:bg-primary/30 transition-colors duration-1000" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    OWNER PARTNERSHIP
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-none">
                                    INGIN KOSAN <br /> <span className="text-primary italic">FULL-OCCUPIED?</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-12 max-w-xl font-medium leading-relaxed">
                                    Bergabunglah sebagai mitra premium dan dapatkan prioritas listing di platform pencarian kos terbesar khusus mahasiswa.
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                    <Link href="/register?role=admin">
                                        <Button className="h-16 px-10 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3">
                                            DAFTAR SEBAGAI PEMILIK
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="h-16 px-10 rounded-[1.5rem] border-white/20 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all">
                                        PELAJARI SISTEM KAMI
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full lg:w-2/5 grid grid-cols-2 gap-6">
                                {[
                                    { val: "1.2K+", label: "MITRA AKTIF", icon: ShieldCheck },
                                    { val: "98%", label: "TINGKAT KEPUASAN", icon: Star },
                                    { val: "24/7", label: "SUPPORT SISTEM", icon: Users },
                                    { val: "5M+", label: "VIEWS / BULAN", icon: TrendingUp }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors">
                                        <item.icon className="w-8 h-8 text-primary mb-6" />
                                        <div className="text-3xl font-black text-white tracking-tighter mb-2">{item.val}</div>
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    )
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)
