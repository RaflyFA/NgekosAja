"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { Loader2, Sparkles, LayoutGrid, DollarSign, Info, Layers, Activity, Wind, Waves, Bed, Warehouse, DoorOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface AddBulkRoomsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kosId: string
    onSuccess: () => void
}

export function AddBulkRoomsDialog({ open, onOpenChange, kosId, onSuccess }: AddBulkRoomsDialogProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        room_count: "1", start_number: "01", floor: "1", room_type: "Standard", price_per_month: ""
    })

    const [facilities, setFacilities] = useState<string[]>([])
    const facilityOptions = [
        { id: "ac", label: "CLIMATE CONTROL", icon: <Wind className="w-3.5 h-3.5" /> },
        { id: "wifi", label: "DIGITAL CONNECT", icon: <Waves className="w-3.5 h-3.5" /> },
        { id: "kasur", label: "SLEEP SYSTEM", icon: <Bed className="w-3.5 h-3.5" /> },
        { id: "lemari", label: "STORAGE HUB", icon: <Warehouse className="w-3.5 h-3.5" /> },
        { id: "kamar_mandi_dalam", label: "PRIVATE BATH", icon: <DoorOpen className="w-3.5 h-3.5" /> },
    ]

    const handleFacilityChange = (facilityId: string, checked: boolean) => {
        if (checked) setFacilities([...facilities, facilityId])
        else setFacilities(facilities.filter(f => f !== facilityId))
    }

    const generateRoomNumbers = (startNum: string, count: number): string[] => {
        const startInt = parseInt(startNum) || 1
        const padLength = startNum.length
        const roomNumbers: string[] = []
        for (let i = 0; i < count; i++) {
            const num = startInt + i
            roomNumbers.push(num.toString().padStart(padLength, '0'))
        }
        return roomNumbers
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const count = parseInt(formData.room_count) || 1
            const roomNumbers = generateRoomNumbers(formData.start_number, count)
            const roomsData = roomNumbers.map(roomNumber => ({
                kos_id: kosId, room_number: roomNumber, floor: formData.floor ? parseInt(formData.floor) : null,
                room_type: formData.room_type, price_per_month: parseInt(formData.price_per_month), facilities: facilities
            }))
            const { error } = await supabase.from('rooms').insert(roomsData)
            if (error) throw error
            toast({ title: "Batch Processed", description: `Successfully deployed ${count} property units to the database.` })
            setFormData({ room_count: "1", start_number: "01", floor: "1", room_type: "Standard", price_per_month: "" })
            setFacilities([]); onSuccess(); onOpenChange(false)
        } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
        finally { setLoading(false) }
    }

    const previewNumbers = () => {
        const total = parseInt(formData.room_count) || 1
        const count = Math.min(total, 5)
        const numbers = generateRoomNumbers(formData.start_number, count)
        return total > 5 ? `${numbers.join(", ")}, ... (${total} units)` : numbers.join(", ")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl h-[85vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
                <div className="p-10 pb-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <Layers className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Batch <span className="text-primary not-italic">Import</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sequential unit synchronization for high-density assets</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10">
                    <form onSubmit={handleSubmit} id="bulk-room-form" className="space-y-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL QUANTITY *</Label>
                                <div className="relative">
                                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <Input type="number" min="1" max="50" value={formData.room_count} onChange={(e) => setFormData({ ...formData, room_count: e.target.value })} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">START SEQUENCE *</Label>
                                <Input value={formData.start_number} onChange={(e) => setFormData({ ...formData, start_number: e.target.value })} placeholder="01" required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">SEQUENCE PREVIEW</Label>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter">{previewNumbers()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TARGET FLOOR</Label>
                                <Input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SHARED CLASS</Label>
                                <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/10 glass-card">
                                        {['Standard', 'Premium', 'VIP', 'Deluxe'].map(t => <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase tracking-widest p-4 cursor-pointer">{t.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">UNIFIED BASE RATE *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <Input type="number" value={formData.price_per_month} onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })} placeholder="1500000" required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner text-primary" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">UNIFIED AMENITIES</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {facilityOptions.map((fac) => (
                                    <label key={fac.id} className={`flex items-center gap-3 px-5 py-4 rounded-xl cursor-pointer transition-all border-2 ${facilities.includes(fac.id) ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}>
                                        <input type="checkbox" checked={facilities.includes(fac.id)} onChange={(e) => handleFacilityChange(fac.id, e.target.checked)} className="hidden" />
                                        {fac.icon}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{fac.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="p-10 pt-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">DISCARD</Button>
                    <Button onClick={() => document.getElementById('bulk-room-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} disabled={loading} className="h-14 px-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? "PROCESSING BATCH..." : `DEPLOY ${formData.room_count} UNITS`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
