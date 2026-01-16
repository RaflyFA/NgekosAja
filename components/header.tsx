"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/roles" // Import fungsi role kamu
import { User } from "@supabase/supabase-js"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null) // State untuk simpan role

  useEffect(() => {
    const checkUserAndRole = async () => {
      // 1. Ambil Session User
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 2. Jika user ada, Ambil Rolenya
      if (user) {
        const userRole = await getCurrentUserRole()
        console.log("🔍 DEBUG HEADER:")
        console.log("👉 Email User:", user.email)
        console.log("👉 Role dari Database:", userRole)
        setRole(userRole)
      } else {
        setRole(null)
      }
    }

    checkUserAndRole()

    // Listener jika login/logout terjadi
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await getCurrentUserRole()
        setRole(r)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Cek apakah user adalah Pemilik Kos (Admin)
  // Kita cek variasi string untuk jaga-jaga ('admin', 'PEMILIK', dll)
  const roleStr = String(role || "").toUpperCase();
  const isOwner = roleStr === 'PEMILIK' || roleStr === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">KosanHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            Cari Kos
          </Link>
          {/* Menu Sewakan Kos hanya muncul untuk Owner atau User yang belum login */}
          {(!user || isOwner) && (
             <Link href={user ? "/dashboard/add-property" : "/login"} className="text-foreground hover:text-primary transition-colors">
               Sewakan Kos
             </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            // JIKA LOGIN
            <div className="flex gap-2">
                {/* HANYA PEMILIK YANG LIHAT TOMBOL DASHBOARD */}
                {isOwner && (
                    <Link href="/dashboard">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Button>
                    </Link>
                )}
                {/* User biasa (Mahasiswa) mungkin cuma butuh tombol Profile/Logout nanti */}
                {!isOwner && (
                    <Button variant="ghost" size="sm" disabled>
                        Hai, Mahasiswa
                    </Button>
                )}
            </div>
          ) : (
            // JIKA BELUM LOGIN
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Logic (Sederhana) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4">
             {/* ... (Isi mobile menu bisa disesuaikan sama seperti desktop logic di atas) ... */}
             {user ? <p className="text-sm text-center mb-2">Halo, {isOwner ? "Juragan!" : "Pencari Kost!"}</p> : null}
             {isOwner && (
                 <Link href="/dashboard">
                    <Button className="w-full mb-2">Ke Dashboard</Button>
                 </Link>
             )}
             {!user && (
                 <Link href="/login"><Button className="w-full">Masuk</Button></Link>
             )}
        </div>
      )}
    </header>
  )
}