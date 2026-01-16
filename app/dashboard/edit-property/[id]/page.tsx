"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save, UploadCloud } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation" // useParams untuk ambil ID dari URL
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/roles"

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
        alert("Akses ditolak.")
        router.push("/")
        return
      }

      // AMBIL DATA KOS YANG MAU DIEDIT
      const { data: kos, error } = await supabase
        .from('boarding_houses')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error || !kos) {
        alert("Data kos tidak ditemukan!")
        router.push("/dashboard")
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
        if (file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB."); return }
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

      // --- PERBAIKAN HARGA DI SINI ---
      // Kita hapus semua titik (.) sebelum dikirim ke database
      const cleanPrice = formData.price.toString().replace(/\./g, "")

      const { error } = await supabase
        .from('boarding_houses')
        .update({
            name: formData.name,
            price: Number(cleanPrice), // <--- Pakai harga yang sudah bersih
            description: formData.description,
            address: formData.address,
            city: formData.city,
            image_url: finalImageUrl
        })
        .eq('id', propertyId)

      if (error) throw error

      alert("✅ Data kos berhasil diperbarui!")
      window.location.href = '/dashboard' 
      
    } catch (error: any) {
      alert("Gagal update: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Data...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Kosan</h1>
        </div>

        <form onSubmit={handleUpdate}>
          <Card>
            <CardHeader>
              <CardTitle>Perbarui Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* INPUT GAMBAR */}
              <div className="space-y-3">
                <Label>Foto Kosan</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                    
                    {imagePreview ? (
                        <div className="relative w-full h-48">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                            <p className="text-xs text-center mt-2 text-green-600 font-medium">Klik untuk ganti foto baru</p>
                        </div>
                    ) : (
                        <div className="text-center">Upload Foto</div>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Kos</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga per Bulan (Rp)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
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
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi & Fasilitas</Label>
                <Textarea id="description" name="description" className="h-32" value={formData.description} onChange={handleChange} required />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4 mr-2" />Simpan Perubahan</>}
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}