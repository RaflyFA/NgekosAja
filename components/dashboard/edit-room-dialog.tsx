"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2, ShieldCheck, Sparkles, Building2, DollarSign, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface Room { id: string; room_number: string; floor: number | null; room_type: string | null; price_per_month: number; is_occupied: boolean; }
interface EditRoomDialogProps { open: boolean; onOpenChange: (open: boolean) => void; room: Room | null; onSuccess: () => void; }

export function EditRoomDialog({ open, onOpenChange, room, onSuccess }: EditRoomDialogProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const [roomNumber, setRoomNumber] = useState("")
    const [floor, setFloor] = useState("")
    const [roomType, setRoomType] = useState("")
    const [price, setPrice] = useState("")

    useEffect(() => {
        if (room) { setRoomNumber(room.room_number); setFloor(room.floor?.toString() || ""); setRoomType(room.room_type || "Standard"); setPrice(room.price_per_month.toString()); }
    }, [room])

    const handleSubmit = async () => {
        if (!room) return
        if (!roomNumber || !price) { toast({ title: "Validasi Gagal", description: "Nomor kamar dan tarif sewa wajib diisi.", variant: "destructive" }); return }
        setLoading(true)
        try {
            await supabase.from('rooms').update({ room_number: roomNumber, floor: floor ? parseInt(floor) : null, room_type: roomType, price_per_month: parseInt(price.replace(/[.,]/g, '')) }).eq('id', room.id)
            toast({ title: "Unit Modified", description: "Spefisikasi unit telah berhasil diperbarui." })
            onOpenChange(false); onSuccess()
        } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
        finally { setLoading(false) }
    }

    if (!room) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[75vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
                <div className="p-10 pb-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Modify <span className="text-primary not-italic">Unit</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{room.room_number.toUpperCase()} — Inventory Control</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IDENTIFICATION</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="01" className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                            <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Floor" className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SPECIFICATIONS</Label>
                        <Select value={roomType} onValueChange={setRoomType}>
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/10 glass-card">
                                {['Standard', 'Deluxe', 'Premium', 'VIP'].map(t => <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase tracking-widest p-4 cursor-pointer">{t.toUpperCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">FISCAL RATE / MO</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1.500.000" className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner text-primary" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-10 pt-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">DISCARD</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="h-14 px-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? "UPDATING..." : "PUSH MODIFICATIONS"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
