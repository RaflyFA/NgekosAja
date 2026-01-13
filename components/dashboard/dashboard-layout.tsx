"use client"

import type React from "react"
import { useState, useEffect } from "react" // Tambah useEffect
import { LayoutDashboard, Book as Door, CreditCard, BarChart3, Menu, X } from "lucide-react"
import { MetricCard } from "./metric-card"
import { RentalRequestsTable } from "./rental-requests-table"
import { supabase } from "@/lib/supabase" // Import Supabase Client

interface NavLink {
  label: string
  icon: React.ReactNode
  href: string
  isActive: boolean
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // STATE BARU: Untuk menyimpan data dari database
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    revenue: 0,
    occupied: 0
  })

  // FUNGSI BARU: Ambil data saat halaman dibuka
  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil semua data booking, urutkan dari yang terbaru
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setBookings(data)

        // 2. Hitung Statistik Sederhana
        const pendingCount = data.filter((item: any) => item.status === 'pending').length
        
        // Hitung total uang (Total Price)
        const totalMoney = data.reduce((acc: number, curr: any) => {
          return acc + (Number(curr.total_price) || 0)
        }, 0)

        setStats({
          pending: pendingCount,
          revenue: totalMoney,
          occupied: data.length // Sementara kita anggap semua booking = kamar terisi
        })
      }
    }

    fetchData()
  }, [])

  // Fungsi Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const navLinks: NavLink[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "#dashboard",
      isActive: true,
    },
    {
      label: "Kelola Kamar",
      icon: <Door className="w-5 h-5" />,
      href: "#kelola-kamar",
      isActive: false,
    },
    {
      label: "Transaksi",
      icon: <CreditCard className="w-5 h-5" />,
      href: "#transaksi",
      isActive: false,
    },
    {
      label: "Laporan",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "#laporan",
      isActive: false,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-card border-r border-border transition-all duration-300 overflow-hidden lg:w-64 lg:block`}
      >
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-lg text-foreground">KosanOwner</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  link.isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KARTU 1: Total Pendapatan (Dinamis) */}
            <MetricCard 
                title="Total Pendapatan" 
                value={formatRupiah(stats.revenue)} 
                subtitle="Total omzet masuk" 
                icon="💰" 
            />
            
            {/* KARTU 2: Kamar Terisi (Dinamis Sederhana) */}
            <MetricCard 
                title="Total Booking" 
                value={`${stats.occupied} Unit`} 
                subtitle="Data dari database" 
                icon="🏠" 
            />
            
            {/* KARTU 3: Menunggu Konfirmasi (Dinamis) */}
            <MetricCard 
                title="Menunggu Konfirmasi" 
                value={stats.pending.toString()} 
                subtitle="Pengajuan sewa baru" 
                icon="⏳" 
            />

          </div>

          {/* Rental Requests Table */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Pengajuan Sewa Terbaru</h2>
            {/* Kita kirim data bookings ke tabel ini */}
            {/* @ts-ignore sementara biar tidak error dulu sebelum file tabel diedit */}
            <RentalRequestsTable bookings={bookings} />
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}