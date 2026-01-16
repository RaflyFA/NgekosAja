"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase" // Import Supabase

type UserRole = "user" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [role, setRole] = useState<UserRole>("user")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Kirim email & password ke Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // 2. Ambil user data untuk verifikasi role
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single()

      // Jika belum ada profile, buat dengan role yang dipilih
      // Map role pilihan UI ke skema DB yang ada (PEMILIK/PENCARI)
      const selectedDbRole = role === 'admin' ? 'PEMILIK' : 'PENCARI'
      let userRole = role
      if (userError || !userData) {
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user?.id,
            role: selectedDbRole,
            full_name: undefined
          })
          .select('role')
          .single()
        
        if (!insertError && insertData) {
          userRole = insertData.role
        }
      } else {
        // Jika profile sudah ada, gunakan role dari database
        userRole = userData.role
      }

      alert("Login Berhasil! Selamat datang.")
      
      // 3. Arahkan berdasarkan role dari database
      const normalized = String(userRole || '').toLowerCase().replace(/\s|_/g, '')
      const isAdmin = normalized === 'admin' || normalized.includes('pemilik') || normalized.includes('owner') || normalized.includes('adminkos')
      if (isAdmin) {
        router.push("/dashboard")
      } else {
        router.push("/") // User biasa ke beranda
      }
      router.refresh()

    } catch (error: any) {
      alert("Login Gagal: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${role === "admin" ? "dashboard" : ""}`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      alert("Login Google Gagal: " + error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Masuk Akun</CardTitle>
          <CardDescription>
            Silakan login untuk mengelola akun Anda
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                onChange={handleChange}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 mt-10">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk Sekarang
                </>
              )}
            </Button>

            <Button 
              type="button"
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghubungkan...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Masuk dengan Google
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}