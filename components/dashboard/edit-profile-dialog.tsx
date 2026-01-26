"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { User, Camera, Loader2, Sparkles, ShieldCheck, Phone, Mail, Fingerprint, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface EditProfileDialogProps {
    trigger?: React.ReactNode
}

export function EditProfileDialog({ trigger }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({ full_name: "", whatsapp: "", avatar_url: "" })

    useEffect(() => { if (open) fetchProfile() }, [open])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return
            const { data } = await supabase.from('profiles').select('full_name, whatsapp, avatar_url').eq('id', session.user.id).single()
            if (data) setFormData({ full_name: data.full_name || "", whatsapp: data.whatsapp || "", avatar_url: data.avatar_url || "" })
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setUploading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return
            const fileName = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
        } catch (error: any) { toast({ title: "Upload Gagal", description: error.message, variant: "destructive" }) }
        finally { setUploading(false) }
    }

    const handleSave = async () => {
        if (formData.whatsapp && !/^\d+$/.test(formData.whatsapp)) {
            toast({ title: "Format Salah", description: "WhatsApp ID hanya boleh berisi angka digital.", variant: "destructive" }); return
        }
        setSaving(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return
            await supabase.from('profiles').update({ full_name: formData.full_name, whatsapp: formData.whatsapp, avatar_url: formData.avatar_url }).eq('id', session.user.id)
            toast({ title: "Identity Updated", description: "Your digital profile has been successfully synchronized." })
            setOpen(false)
        } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
        finally { setSaving(false) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="flex items-center gap-4 px-5 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-500 hover:text-primary transition-all shadow-sm hover:shadow-xl group w-full">
                        <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">Modify Identity</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md h-[80vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col font-geist">
                <div className="p-10 pb-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="flex items-center gap-3 relative z-10">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Profile <span className="text-primary not-italic">Identity</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{formData.full_name.toUpperCase() || 'USER'} — Digital Credentials</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10 text-center">
                    <div className="relative inline-block mx-auto group">
                        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-white/5 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-700 group-hover:scale-105">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <span className="text-4xl font-black text-primary">{formData.full_name.charAt(0).toUpperCase() || "?"}</span>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all border-2 border-white dark:border-slate-800">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    </div>

                    <div className="space-y-8 text-left">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">LEGAL FULL NAME</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <Input value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter full name" className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">WHATSAPP DIGITAL ID</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <Input type="tel" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value.replace(/\D/g, '') }))} placeholder="08123456789" className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-10 pt-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">DISCARD</Button>
                    <Button onClick={handleSave} disabled={saving} className="h-14 px-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {saving ? "SYNCHRONIZING..." : "PUBLISH IDENTITY"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
