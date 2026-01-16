"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type UserRole = "user" | "admin"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>("user")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Mendaftar ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role, // metadata di auth.users (boleh tetap 'user'/'admin')
          },
        },
      })

      if (error) throw error

      // 2. Buat profile di tabel profiles
      if (data.user) {
        const dbRole = role === 'admin' ? 'PEMILIK' : 'PENCARI'
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: dbRole,
            full_name: formData.fullName
          })
          .select()
      }

      alert("Pendaftaran Berhasil! Silakan cek email Anda untuk verifikasi, atau coba login langsung.")
      
      // 3. Arahkan berdasarkan role
      if (role === "admin") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }

    } catch (error: any) {
      alert("Gagal Mendaftar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Daftar Akun Baru</CardTitle>
          <CardDescription>
            Bergabunglah untuk memulai
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            
            {/* Pilihan Role */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Saya adalah:</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    role === "user"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="font-semibold text-sm">Mahasiswa</div>
                  <div className="text-xs text-gray-500 mt-1">Pencari Kosan</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    role === "admin"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="font-semibold text-sm">Pemilik Kos</div>
                  <div className="text-xs text-gray-500 mt-1">Admin Kos</div>
                </button>
              </div>
            </div>
            
            {/* Input Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="Rafly Akbar" 
                required 
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Minimal 6 karakter" 
                required 
                minLength={6}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar Sekarang
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}