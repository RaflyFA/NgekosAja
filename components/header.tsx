"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard, User as UserIcon, Bell, Settings, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/roles"
import { User } from "@supabase/supabase-js"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const userRole = await getCurrentUserRole()
        setRole(userRole)
      } else {
        setRole(null)
      }
    }

    checkUserAndRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const r = await getCurrentUserRole()
        setRole(r)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const roleStr = String(role || "").toUpperCase();
  const isOwner = roleStr === 'PEMILIK' || roleStr === 'ADMIN';

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
        ? "py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg"
        : "py-5 bg-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform -rotate-6">
            <span className="text-white font-black text-xl">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white leading-none">NGEKOSAJA</span>
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase leading-none mt-1">Premium Hub</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {(!user || isOwner) && (
            <Link
              href={user ? "/dashboard/add-property" : "/login"}
              className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors py-2 px-1 relative group"
            >
              Sewakan Kos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {mounted ? (
            user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                {isOwner ? (
                  <Link href="/dashboard">
                    <Button className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/my-rental">
                      <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 dark:border-white/10 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-all gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Kelola Kosan
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" size="icon" className="w-11 h-11 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-all shadow-sm">
                        <UserIcon className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-all">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                    Daftar
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="w-32 h-11" /> // Placeholder while mounting
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-300 active:scale-90 transition-all"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Theme</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="space-y-3">
                  <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400 py-2">
                    {isOwner ? "Halo, Juragan!" : "Halo, Mahasiswa!"}
                  </p>

                  {isOwner && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-14 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest gap-3">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard Utama
                      </Button>
                    </Link>
                  )}

                  {!isOwner && (
                    <>
                      <Link href="/my-rental" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-14 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest gap-3">
                          <LayoutDashboard className="w-5 h-5" />
                          Kelola Kosan
                        </Button>
                      </Link>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest gap-3">
                          <UserIcon className="w-5 h-5" />
                          Profil Saya
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl bg-primary font-black text-xs uppercase tracking-widest">
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}