"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2, UserCheck, UserX, User, MapPin, Calendar, CreditCard, ShieldCheck, Clock } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

interface Room {
    id: string
    room_number: string
    floor: number | null
    room_type: string | null
    price_per_month: number
    is_occupied: boolean
    tenant_name: string | null
    tenant_phone: string | null
    rent_start_date: string | null
    rent_end_date: string | null
}

interface RoomListTableProps {
    rooms: Room[]
    onEdit: (room: Room) => void
    onDelete: (roomId: string) => void
    onToggleOccupancy: (roomId: string, currentStatus: boolean) => void
    onViewDetail: (room: Room) => void
}

export function RoomListTable({ rooms, onEdit, onDelete, onToggleOccupancy, onViewDetail }: RoomListTableProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        try { return format(new Date(dateString), "dd MMM yyyy", { locale: localeId }) } catch { return "-" }
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] mx-8 my-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">BELUM ADA DATA UNIT</h4>
                <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm mt-2 uppercase tracking-widest text-[10px]">Silahkan tambahkan unit kamar pertama Anda melalui tombol di atas.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-4 px-8 mb-8">
                    <thead>
                        <tr>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Room Identity</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing Specs</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Occupancy Status</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Lease Period</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id} className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                                <td className="px-6 py-5 first:rounded-l-[2rem]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-xl shadow-primary/20">
                                            {room.room_number.toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">FLOOR</span>
                                            <span className="text-xl font-black text-slate-950 dark:text-white tracking-tighter leading-none">{room.floor || "0"}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{room.room_type || "STANDARD"}</span>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3 text-primary" />
                                            Fully Serviced
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-primary tracking-tighter">{formatRupiah(room.price_per_month).replace("Rp", "").trim()}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase">/MO</span>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg ${room.is_occupied ? 'bg-red-600 shadow-red-500/20 text-white' : 'bg-green-600 shadow-green-500/20 text-white'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${room.is_occupied ? 'bg-white' : 'bg-white'}`} />
                                        {room.is_occupied ? 'OCCUPIED' : 'AVAILABLE'}
                                    </div>
                                    {room.is_occupied && room.tenant_name && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <User className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px]">{room.tenant_name}</span>
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            {formatDate(room.rent_start_date).toUpperCase().split(' ').slice(0, 2).join(' ')} — {formatDate(room.rent_end_date).toUpperCase().split(' ').slice(0, 2).join(' ')}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5 leading-none">LEASE DURATION</p>
                                    </div>
                                </td>

                                <td className="px-6 py-5 last:rounded-r-[2rem] text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-white/5 glass-card p-2 min-w-[180px]">
                                            <DropdownMenuItem onClick={() => onViewDetail(room)} className="rounded-xl flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                                                <Eye className="w-4 h-4" /> Lihat Konsol
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(room)} className="rounded-xl flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                                                <Edit className="w-4 h-4" /> Modifikasi Data
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onToggleOccupancy(room.id, room.is_occupied)} className="rounded-xl flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                                                {room.is_occupied ? <><UserX className="w-4 h-4" /> Tandai Kosong</> : <><UserCheck className="w-4 h-4" /> Tandai Terisi</>}
                                            </DropdownMenuItem>
                                            <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                                            <DropdownMenuItem onClick={() => onDelete(room.id)} className="rounded-xl flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer text-red-500 hover:bg-red-500/10 transition-all">
                                                <Trash2 className="w-4 h-4" /> Hapus Permanen
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
