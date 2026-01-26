"use client"

import { MessageCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface OwnerProfileProps {
    ownerName: string
    ownerWhatsApp?: string
    propertyName: string
    ownerAvatar?: string
}

export function OwnerProfile({ ownerName, ownerWhatsApp, propertyName, ownerAvatar }: OwnerProfileProps) {
    const handleWhatsAppClick = () => {
        if (!ownerWhatsApp) return
        const message = encodeURIComponent(`Halo ${ownerName}, saya ingin bertanya terkait kosan ${propertyName}.`)
        const cleanPhone = ownerWhatsApp.replace(/\D/g, '')
        const phoneWithCode = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone.replace(/^0/, '')}`
        window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank')
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                {/* Avatar Section */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center overflow-hidden">
                        {ownerAvatar ? (
                            <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        ) : (
                            <span className="text-primary text-3xl font-black">{ownerName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {/* Info & Action */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mitra Terverifikasi</p>
                    <h4 className="text-xl font-black text-slate-950 dark:text-white tracking-tight leading-none pt-1">{ownerName.toUpperCase()}</h4>
                    <p className="text-sm font-bold text-slate-500">Pemilik Aktif Sejak 2023</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleWhatsAppClick}
                        className="h-14 px-8 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#25D366]/20 transition-all active:scale-95 gap-3"
                    >
                        <MessageCircle className="w-5 h-5" />
                        KONTAK PEMILIK
                    </Button>
                </div>
            </div>

            {/* Social Proof */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-center sm:justify-start gap-8">
                <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">42+</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Unit</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">4.9/5</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Rating User</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">99%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Respon Chat</span>
                </div>
            </div>
        </motion.div>
    )
}
