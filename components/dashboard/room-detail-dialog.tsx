"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Calendar, DollarSign, Home, MapPin, Phone, User, Activity, ShieldCheck, Clock, Building2 } from "lucide-react"
import { motion } from "framer-motion"

interface Room { id: string; room_number: string; floor: number | null; room_type: string | null; price_per_month: number; is_occupied: boolean; tenant_name: string | null; tenant_phone: string | null; rent_start_date: string | null; rent_end_date: string | null; }
interface RoomDetailDialogProps { open: boolean; onOpenChange: (open: boolean) => void; room: Room | null; }

export function RoomDetailDialog({ open, onOpenChange, room }: RoomDetailDialogProps) {
    if (!room) return null

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        try { return format(new Date(dateString), "dd MMMM yyyy", { locale: localeId }) } catch { return "-" }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[70vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
                <div className="p-10 pb-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="flex items-center gap-3 relative z-10">
                        <Activity className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Unit <span className="text-primary not-italic">Intelligence</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{room.room_number.toUpperCase()} — Real-time Status</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Building2 className="w-5 h-5" /></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UNIT SPECS</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">FL {room.floor || "0"} • {room.room_type || "STANDARD"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><DollarSign className="w-5 h-5" /></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FISCAL RATE</span>
                                <span className="text-lg font-black text-primary tracking-tighter">{formatRupiah(room.price_per_month)} <span className="text-[10px] uppercase font-black">/ mo</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-lg">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CURRENT STATUS</span>
                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl ${room.is_occupied ? 'bg-red-600 shadow-red-500/20 text-white' : 'bg-green-600 shadow-green-500/20 text-white'}`}>
                            {room.is_occupied ? <ShieldCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {room.is_occupied ? 'Ocuppied' : 'Vacant'}
                        </div>
                    </div>

                    {room.is_occupied && room.tenant_name && (
                        <div className="space-y-6 border-t border-slate-100 dark:border-white/5 pt-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TENANT OVERVIEW</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">{room.tenant_name.charAt(0)}</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">{room.tenant_name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> {room.tenant_phone}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Calendar className="w-5 h-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LEASE PERIOD</span>
                                        <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatDate(room.rent_start_date)} — {formatDate(room.rent_end_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
