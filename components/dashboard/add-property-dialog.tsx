"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, UploadCloud, X, Sparkles, Building2, MapPin, DollarSign, Waves, Wind, Bed, DoorOpen, LayoutGrid } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export function AddPropertyDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        room_count: "",
        address: "",
        city: "",
        gender_type: "campur",
        general_description: "",
        other_facilities: "",
    })

    const [facilities, setFacilities] = useState({
        wifi: false,
        ac: false,
        kamar_mandi_dalam: false,
        kasur: false,
        lemari: false,
    })

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (imageFiles.length + files.length > 20) {
            toast({ title: "Batas Gambar", description: "Maksimal 20 gambar!", variant: "destructive" })
            return
        }
        const validFiles: File[] = []
        const validPreviews: string[] = []
        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) {
                toast({ title: "File Terlalu Besar", description: `${file.name} melebihi 2MB.`, variant: "destructive" })
                continue
            }
            validFiles.push(file)
            validPreviews.push(URL.createObjectURL(file))
        }
        setImageFiles(prev => [...prev, ...validFiles])
        setImagePreviews(prev => [...prev, ...validPreviews])
    }

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const uploadImages = async (files: File[]): Promise<string[]> => {
        const uploadedUrls: string[] = []
        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`
            const { error } = await supabase.storage.from('kos-images').upload(filePath, file)
            if (error) throw new Error(`Upload failed: ${error.message}`)
            const { data } = supabase.storage.from('kos-images').getPublicUrl(filePath)
            uploadedUrls.push(data.publicUrl)
        }
        return uploadedUrls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (imageFiles.length < 2) {
            toast({ title: "Minimal 2 Gambar", description: "Wajib upload minimal 2 dokumentasi visual.", variant: "destructive" })
            return
        }
        setIsLoading(true)
        try {
            const imageUrls = await uploadImages(imageFiles)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Auth failed")

            const selectedFacilities: string[] = []
            if (facilities.wifi) selectedFacilities.push("WiFi")
            if (facilities.ac) selectedFacilities.push("AC")
            if (facilities.kamar_mandi_dalam) selectedFacilities.push("Kamar Mandi Dalam")
            if (facilities.kasur) selectedFacilities.push("Kasur")
            if (facilities.lemari) selectedFacilities.push("Lemari")

            let description = "Fasilitas: " + selectedFacilities.join(", ")
            if (formData.other_facilities) description += ". " + formData.other_facilities

            const { error } = await supabase.from('boarding_houses').insert({
                name: formData.name, price: Number(formData.price), description, general_description: formData.general_description,
                address: formData.address, city: formData.city, gender_type: formData.gender_type, images: imageUrls,
                owner_id: user.id, room_count: Number(formData.room_count) || null
            })
            if (error) throw error
            toast({ title: "Asset Registered", description: "Properti baru telah berhasil didaftarkan ke ekosistem." })
            setOpen(false)
            window.location.reload()
        } catch (error: any) {
            toast({ title: "Gagal", description: error.message, variant: "destructive" })
        } finally { setIsLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> TAMBAH ASSET
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">

                {/* Cinematic Header Overlay */}
                <div className="p-12 pb-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 blur-3xl rounded-full" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-primary" />
                                <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Register <span className="text-primary not-italic">Asset</span></h1>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digitalize your property portfolio with precision</p>
                        </div>
                        <Sparkles className="w-8 h-8 text-primary opacity-20" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-12 space-y-12">
                    {/* Visual Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4" /> VISUAL DOCUMENTATION ({imageFiles.length}/20)
                            </Label>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MIN 2 ASSETS REQUIRED</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {imagePreviews.map((preview, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-white/5 shadow-inner">
                                        <img src={preview} alt="Upload Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase">ASSET #{index + 1}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {imageFiles.length < 20 && (
                                <label className="aspect-video border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                                    <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors mb-2" />
                                    <span className="text-[9px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">Digital Upload</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">IDENTITY & CAPACITY</Label>
                                <div className="space-y-4">
                                    <Input name="name" placeholder="ASSET NAME (e.g. KOST PREMIER X)" value={formData.name} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <Input name="room_count" type="number" placeholder="CAPACITY" value={formData.room_count} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input name="price" type="number" placeholder="BASE PRICE / MO" value={formData.price} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">LOCATION HUB</Label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <Input name="city" placeholder="TARGET CITY" value={formData.city} onChange={handleChange} required className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none pl-12 pr-6 font-black text-[11px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                                    </div>
                                    <Textarea name="address" placeholder="FULL GEO-LOCATION ADDRESS..." value={formData.address} onChange={handleChange} required className="h-28 rounded-[2rem] bg-slate-50 dark:bg-white/5 border-none p-6 font-black text-[10px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TENANT TARGETING</Label>
                                <div className="flex gap-4">
                                    {['PUTRA', 'PUTRI', 'CAMPUR'].map(type => (
                                        <label key={type} className={`flex-1 flex items-center justify-center h-14 rounded-2xl cursor-pointer transition-all border-2 font-black text-[9px] tracking-widest ${formData.gender_type === type.toLowerCase() ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}>
                                            <input type="radio" name="gender_type" value={type.toLowerCase()} checked={formData.gender_type === type.toLowerCase()} onChange={handleChange} className="hidden" />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">EXECUTIVE SUMMARY</Label>
                                <Textarea name="general_description" placeholder="DESCRIBE THE CORE VALUE OF THIS ASSET..." value={formData.general_description} onChange={handleChange} required className="h-[200px] rounded-[2rem] bg-slate-50 dark:bg-white/5 border-none p-8 font-black text-[10px] uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-relaxed" />
                            </div>

                            <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">CORE AMENITIES</Label>
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
                                            <div className="flex-shrink-0">{fac.icon}</div>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{fac.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Global Submit Hidden, using Footer instead */}
                        <input type="submit" id="submit-form" className="hidden" />
                    </form>
                </div>

                <DialogFooter className="p-12 pt-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                        DISCARD
                    </Button>
                    <Button
                        onClick={() => document.getElementById('submit-form')?.click()}
                        disabled={isLoading}
                        className="h-14 px-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoading ? "DIGITALIZING ASSETS..." : "CONFIRM ASSET REGISTRATION"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
