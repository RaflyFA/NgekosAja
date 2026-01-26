"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save, UploadCloud } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/roles"
import { ModalAlert } from "@/components/ui/modal-alert"

export default function AddPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // State khusus untuk File Gambar
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  // SATPAM ROLE
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const role = await getCurrentUserRole()
      const isOwner = role === 'PEMILIK' || role === 'admin'

      if (!isOwner) {
        showAlert("Akses Ditolak", "Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini khusus untuk Pemilik Kos.", "error", () => {
          router.push("/")
        })
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAccess()
  }, [router])

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    address: "",
    city: "Jakarta Selatan",
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // FUNGSI BARU: Handle saat user pilih file foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Cek ukuran file (Maksimal 2MB supaya hemat storage)
      if (file.size > 2 * 1024 * 1024) {
        showAlert("File Terlalu Besar", "Ukuran file terlalu besar! Maksimal 2MB untuk menjaga performa.", "warning")
        return
      }
      setImageFile(file)
      // Buat preview gambar biar user lihat apa yang diupload
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" // Default kalau gak upload

      // 1. PROSES UPLOAD GAMBAR (Jika ada file dipilih)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}` // Nama file unik pakai waktu
        const filePath = `${fileName}`

        // Upload ke Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('kos-images')
          .upload(filePath, imageFile)

        if (uploadError) {
          throw new Error("Gagal upload gambar: " + uploadError.message)
        }

        // Ambil Public URL-nya
        const { data: publicUrlData } = supabase.storage
          .from('kos-images')
          .getPublicUrl(filePath)

        finalImageUrl = publicUrlData.publicUrl
      }

      // 2. SIMPAN DATA KOS KE DATABASE
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('boarding_houses')
        .insert([
          {
            name: formData.name,
            price: Number(formData.price),
            description: formData.description,
            address: formData.address,
            city: formData.city,
            image_url: finalImageUrl,
            owner_id: user?.id // Simpan URL asli dari Storage
          }
        ])

      if (error) throw error

      showAlert("Berhasil", "Kos baru Anda berhasil ditambahkan dan siap dipasarkan!", "success", () => {
        router.push('/dashboard')
      })

    } catch (error: any) {
      showAlert("Gagal", "Terjadi kesalahan saat menyimpan data: " + error.message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pasang Iklan Kos</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Lengkapi detail untuk menarik minat mahasiswa</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-left-8 duration-700">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                  <CardTitle className="text-xl font-bold">Detail Properti</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Nama Kosan</Label>
                    <Input id="name" name="name" placeholder="Kost Eksklusif Mawar Merah" value={formData.name} onChange={handleChange} required className="rounded-xl h-12 border-slate-200 focus:ring-primary" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="font-bold">Harga per Bulan (IDR)</Label>
                      <Input id="price" name="price" type="number" placeholder="1500000" value={formData.price} onChange={handleChange} required className="rounded-xl h-12 border-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-bold">Wilayah Kota</Label>
                      <select name="city" className="flex h-12 w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={formData.city} onChange={handleChange}>
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
                    <Textarea id="address" name="address" placeholder="Jl. Raya Utama No. 42, Kebayoran Baru..." value={formData.address} onChange={handleChange} required className="min-h-[100px] rounded-2xl border-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">Fasilitas & Deskripsi</Label>
                    <Textarea id="description" name="description" placeholder="WiFi 100Mbps, AC LG, Kamar Mandi Dalam, Kasur Springbed..." className="min-h-[180px] rounded-2xl border-slate-200" value={formData.description} onChange={handleChange} required />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                  <CardTitle className="text-xl font-bold">Media & Foto</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className={`border-4 border-dashed rounded-[2.5rem] p-4 min-h-[320px] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${imagePreview ? 'border-primary/40 bg-slate-50 dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 hover:border-primary/20 hover:bg-slate-50'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleImageChange}
                          required
                        />

                        {imagePreview ? (
                          <div className="relative w-full h-full animate-in zoom-in duration-500">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Preview" className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-2xl" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                              <p className="text-white font-black text-sm uppercase tracking-widest">Ganti Foto Properti</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-500">
                              <UploadCloud className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Upload Foto</p>
                              <p className="text-xs text-slate-400 font-bold mt-1">HASIL TERBAIK: JPG/PNG • MAX 2MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                        💡 TIP: Foto kosan yang terang dan bersih terbukti meningkatkan konfirmasi sewa hingga 3X lipat.
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 flex gap-2" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Mempublikasikan...
                        </>
                      ) : (
                        <>
                          Pasang Iklan Sekarang
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