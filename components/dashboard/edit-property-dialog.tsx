"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Pencil, UploadCloud, X, Sparkles, Building2, MapPin, DollarSign, Waves, Wind, Bed, DoorOpen, LayoutGrid, Warehouse, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface EditPropertyDialogProps {
    propertyId: string
    onSuccess?: () => void
}

export function EditPropertyDialog({ propertyId, onSuccess }: EditPropertyDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const { toast } = useToast()

    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: "", price: "", room_count: "", address: "", city: "", gender_type: "campur", general_description: "", other_facilities: "",
    })

    const [facilities, setFacilities] = useState({
        wifi: false, ac: false, kamar_mandi_dalam: false, kasur: false, lemari: false,
    })

    useEffect(() => { if (open) loadPropertyData() }, [open, propertyId])

    const loadPropertyData = async () => {
        setIsLoadingData(true)
        try {
            const { data: kos, error } = await supabase.from('boarding_houses').select('*').eq('id', propertyId).single()
            if (error || !kos) { showAlert("Error", "Asset not found", "error"); setOpen(false); return }

            setFormData({
                name: kos.name || "", price: kos.price?.toString() || "", room_count: kos.room_count?.toString() || "",
                address: kos.address || "", city: kos.city || "", gender_type: kos.gender_type || "campur",
                general_description: kos.general_description || "", other_facilities: "",
            })

            let images: string[] = []
            if (typeof kos.images === 'string') { try { images = JSON.parse(kos.images) } catch { images = [kos.images] } }
            else if (Array.isArray(kos.images)) images = kos.images
            else if (kos.image_url) images = [kos.image_url]
            setExistingImages(images)

            const desc = kos.description || ""
            setFacilities({
                wifi: desc.toLowerCase().includes("wifi"), ac: desc.toLowerCase().includes("ac"),
                kamar_mandi_dalam: desc.toLowerCase().includes("kamar mandi dalam"), kasur: desc.toLowerCase().includes("kasur"),
                lemari: desc.toLowerCase().includes("lemari"),
            })

            const parts = desc.split(". ")
            if (parts.length > 1) setFormData(prev => ({ ...prev, other_facilities: parts.slice(1).join(". ") }))
        } catch (error: any) { console.error(error) } finally { setIsLoadingData(false) }
    }

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (existingImages.length + imageFiles.length + files.length > 20) {
            toast({ title: "Batas Gambar", description: "Maksimal 20 gambar.", variant: "destructive" }); return
        }
        const validFiles: File[] = []; const validPreviews: string[] = []
        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) continue
            validFiles.push(file); validPreviews.push(URL.createObjectURL(file))
        }
        setImageFiles(prev => [...prev, ...validFiles]); setImagePreviews(prev => [...prev, ...validPreviews])
    }

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index) })
    }

    const uploadImages = async (files: File[]): Promise<string[]> => {
        const uploadedUrls: string[] = []
        for (const file of files) {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
            const { error } = await supabase.storage.from('kos-images').upload(fileName, file)
            if (error) throw error
            const { data } = supabase.storage.from('kos-images').getPublicUrl(fileName)
            uploadedUrls.push(data.publicUrl)
        }
        return uploadedUrls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (existingImages.length + imageFiles.length < 2) {
            toast({ title: "Minimal 2 Gambar", description: "Wajib ada minimal 2 dokumentasi visual.", variant: "destructive" }); return
        }
        setIsLoading(true)
        try {
            const newImageUrls = imageFiles.length > 0 ? await uploadImages(imageFiles) : []
            const allImageUrls = [...existingImages, ...newImageUrls]
            const selectedFacilities: string[] = []
            if (facilities.wifi) selectedFacilities.push("WiFi")
            if (facilities.ac) selectedFacilities.push("AC")
            if (facilities.kamar_mandi_dalam) selectedFacilities.push("Kamar Mandi Dalam")
            if (facilities.kasur) selectedFacilities.push("Kasur")
            if (facilities.lemari) selectedFacilities.push("Lemari")
            let description = "Fasilitas: " + selectedFacilities.join(", ")
            if (formData.other_facilities) description += ". " + formData.other_facilities

            await supabase.from('boarding_houses').update({
                name: formData.name, price: Number(formData.price), description, general_description: formData.general_description,
                address: formData.address, city: formData.city, gender_type: formData.gender_type, images: allImageUrls,
                room_count: Number(formData.room_count) || null
            }).eq('id', propertyId)

            toast({ title: "Asset Modified", description: "Data properti telah berhasil diperbarui dalam ekosistem." })
            setOpen(false); router.refresh(); if (onSuccess) onSuccess()
        } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
        finally { setIsLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all active:scale-90">
                    <Pencil className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">

                <div className="p-12 pb-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Modify <span className="text-primary not-italic">Asset</span></h1>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update technical specifications and visual documentation</p>
                        </div>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar p-12 space-y-12">
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">VISUAL INDEX ({existingImages.length + imageFiles.length}/20)</Label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-white/5">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">ACTIVE</div>
                                    </div>
                                ))}
                                {imagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-green-500/50">
                                        <img src={preview} className="w-full h-full object-cover" />
                                        <button onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">STAGED</div>
                                    </div>
                                ))}
                                {(existingImages.length + imageFiles.length) < 20 && (
                                    <label className="aspect-video border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 transition-all cursor-pointer group">
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                                        <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-primary mb-2" />
                                        <span className="text-[9px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest">Append Assets</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ASSET METRICS</Label>
                                    <Input name="name" value={formData.name} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input name="room_count" type="number" value={formData.room_count} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                                        <Input name="price" type="number" value={formData.price} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">LOCATION DATA</Label>
                                    <Input name="city" value={formData.city} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner" />
                                    <Textarea name="address" value={formData.address} onChange={handleChange} required className="h-28 rounded-[2rem] bg-slate-50 dark:bg-white/5 border-none p-6 font-black text-[10px] uppercase tracking-widest shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">DESCRIPTION AUDIT</Label>
                                    <Textarea name="general_description" value={formData.general_description} onChange={handleChange} required className="h-[200px] rounded-[2rem] bg-slate-50 dark:bg-white/5 border-none p-8 font-black text-[10px] uppercase tracking-widest shadow-inner leading-relaxed" />
                                </div>
                                <div className="space-y-6">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AMENITIES INDEX</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'wifi', label: 'DIGITAL CONNECT', icon: <Waves className="w-4 h-4" /> },
                                            { key: 'ac', label: 'CLIMATE CONTROL', icon: <Wind className="w-4 h-4" /> },
                                            { key: 'kamar_mandi_dalam', label: 'PRIVATE BATH', icon: <DoorOpen className="w-4 h-4" /> },
                                            { key: 'kasur', label: 'SLEEP SYSTEMS', icon: <Bed className="w-4 h-4" /> },
                                            { key: 'lemari', label: 'STORAGE HUB', icon: <Warehouse className="w-4 h-4" /> }
                                        ].map(fac => (
                                            <label key={fac.key} className={`flex items-center gap-3 px-5 py-4 rounded-xl cursor-pointer transition-all border-2 ${facilities[fac.key as keyof typeof facilities] ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}>
                                                <input type="checkbox" checked={facilities[fac.key as keyof typeof facilities]} onChange={(e) => setFacilities({ ...facilities, [fac.key]: e.target.checked })} className="hidden" />
                                                {fac.icon}
                                                <span className="text-[9px] font-black uppercase tracking-widest">{fac.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <input type="submit" id="edit-submit" className="hidden" />
                        </form>
                    </div>
                )}

                <DialogFooter className="p-12 pt-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">CANCEL</Button>
                    <Button onClick={() => document.getElementById('edit-submit')?.click()} disabled={isLoading} className="h-14 px-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoading ? "UPDATING ASSETS..." : "PUSH MODIFICATIONS"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
