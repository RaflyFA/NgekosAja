"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save, UploadCloud } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/roles"
import { ModalAlert } from "@/components/ui/modal-alert"

export default function EditPropertyPage() {
    const router = useRouter()
    const params = useParams()
    const propertyId = params.id // Ambil ID kos dari URL

    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    // State Gambar
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [currentImageUrl, setCurrentImageUrl] = useState("")

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info" | "warning";
        onClose?: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info", onClose?: () => void) => {
        setAlertConfig({ isOpen: true, title, message, type, onClose });
    };

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        address: "",
        city: "Jakarta Selatan",
    })

    // 1. SATPAM & AMBIL DATA LAMA
    useEffect(() => {
        const init = async () => {
            // Cek Login & Role
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push("/login"); return }

            const role = await getCurrentUserRole()
            if (role !== 'PEMILIK' && role !== 'admin') {
                showAlert("Akses Ditolak", "Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.", "error", () => {
                    router.push("/")
                })
                return
            }

            // AMBIL DATA KOS YANG MAU DIEDIT
            const { data: kos, error } = await supabase
                .from('boarding_houses')
                .select('*')
                .eq('id', propertyId)
                .single()

            if (error || !kos) {
                showAlert("Data Tidak Ditemukan", "Maaf, data kosan yang Anda cari tidak tersedia atau telah dihapus.", "warning", () => {
                    router.push("/dashboard")
                })
                return
            }

            // Isi Form dengan Data Lama
            setFormData({
                name: kos.name,
                price: kos.price,
                description: kos.description,
                address: kos.address,
                city: kos.city
            })
            setCurrentImageUrl(kos.image_url) // Simpan URL lama
            setImagePreview(kos.image_url)    // Tampilkan foto lama di preview

            setIsCheckingAuth(false)
        }

        init()
    }, [propertyId, router])

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showAlert("File Terlalu Besar", "Ukuran file foto maksimal adalah 2MB.", "warning")
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleUpdate = async (e: any) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let finalImageUrl = currentImageUrl

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('kos-images')
                    .upload(filePath, imageFile)

                if (uploadError) throw new Error("Gagal upload: " + uploadError.message)

                const { data: publicUrlData } = supabase.storage
                    .from('kos-images')
                    .getPublicUrl(filePath)

                finalImageUrl = publicUrlData.publicUrl
            }

            const cleanPrice = formData.price.toString().replace(/\./g, "")

            const { error } = await supabase
                .from('boarding_houses')
                .update({
                    name: formData.name,
                    price: Number(cleanPrice),
                    description: formData.description,
                    address: formData.address,
                    city: formData.city,
                    image_url: finalImageUrl
                })
                .eq('id', propertyId)

            if (error) throw error

            showAlert("Update Berhasil", "Data kosan Anda telah berhasil diperbarui!", "success", () => {
                window.location.href = '/dashboard'
            })

        } catch (error: any) {
            showAlert("Gagal Update", "Terjadi kesalahan saat menyimpan perubahan: " + error.message, "error")
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingAuth) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-slate-500 font-bold animate-pulse">Menyiapkan Data Kosan...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Edit Data Kos</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Perbarui rincian properti Anda di sini</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <div className="grid lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 space-y-8">
                            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-left-8 duration-700">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                                    <CardTitle className="text-xl font-bold">Rincian Baru Properti</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-bold">Nama Kos</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="rounded-xl h-12 border-slate-200" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="font-bold">Harga per Bulan (IDR)</Label>
                                            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required className="rounded-xl h-12 border-slate-200" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="font-bold">Kota</Label>
                                            <select name="city" className="flex h-12 w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none" value={formData.city} onChange={handleChange}>
                                                <option value="Jakarta Selatan">Jakarta Selatan</option>
                                                <option value="Jakarta Pusat">Jakarta Pusat</option>
                                                <option value="Bandung">Bandung</option>
                                                <option value="Yogyakarta">Yogyakarta</option>
                                                <option value="Surabaya">Surabaya</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="font-bold">Alamat Lengkap</Label>
                                        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required className="min-h-[100px] rounded-2xl border-slate-200" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="font-bold">Fasilitas Properti</Label>
                                        <Textarea id="description" name="description" className="min-h-[180px] rounded-2xl border-slate-200" value={formData.description} onChange={handleChange} required />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                                    <CardTitle className="text-xl font-bold">Media Utama</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        <div className="relative group/image">
                                            <div className={`border-4 border-dashed rounded-[2.5rem] p-4 min-h-[320px] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${imagePreview ? 'border-primary/40 bg-slate-50' : 'border-slate-100 bg-slate-50/30'}`}>
                                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />

                                                {imagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={imagePreview} alt="Preview" className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-lg transition-transform hover:scale-[1.02] duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                                                            <p className="text-white font-black text-xs uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg">Ubah Foto Kosan</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                            <UploadCloud className="w-8 h-8 text-primary" />
                                                        </div>
                                                        <p className="text-sm font-black uppercase text-slate-400">Pilih Foto Baru</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-3xl border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs font-bold text-green-700 dark:text-green-400 leading-relaxed">
                                                💡 INFO: Anda tetap bisa mengganti informasi dasar tanpa harus mengupload foto baru jika tidak diperlukan.
                                            </p>
                                        </div>

                                        <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 flex gap-2" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    Memperbarui...
                                                </>
                                            ) : (
                                                <>
                                                    Simpan Perubahan
                                                    <Save className="w-5 h-5" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            <ModalAlert
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    if (alertConfig.onClose) alertConfig.onClose();
                }}
            />
        </div>
    )
}
