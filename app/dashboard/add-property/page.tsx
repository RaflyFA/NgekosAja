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

export default function AddPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // State khusus untuk File Gambar
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        alert("Maaf, akses ditolak. Halaman ini khusus Pemilik Kos.")
        router.push("/") 
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
            alert("Ukuran file terlalu besar! Maksimal 2MB.")
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

      alert("✅ Kos baru (dengan foto asli) berhasil ditambahkan!")
      router.push('/dashboard') 
      
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Kos Baru</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Properti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* INPUT GAMBAR */}
              <div className="space-y-3">
                <Label>Foto Kosan</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                        required // Wajib upload
                    />
                    
                    {imagePreview ? (
                        <div className="relative w-full h-48">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                            <p className="text-xs text-center mt-2 text-green-600 font-medium">Klik untuk ganti foto</p>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <UploadCloud className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Klik untuk upload foto</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG (Maks 2MB)</p>
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Kos</Label>
                <Input id="name" name="name" placeholder="Contoh: Kost Mawar Melati" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga per Bulan (Rp)</Label>
                <Input id="price" name="price" type="number" placeholder="1500000" value={formData.price} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <select name="city" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.city} onChange={handleChange}>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Pusat">Jakarta Pusat</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Surabaya">Surabaya</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea id="address" name="address" placeholder="Nama jalan, nomor rumah..." value={formData.address} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi & Fasilitas</Label>
                <Textarea id="description" name="description" placeholder="Fasilitas: WiFi, AC..." className="h-32" value={formData.description} onChange={handleChange} required />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengupload...</> : <><Save className="w-4 h-4 mr-2" />Simpan Kos</>}
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}