"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LayoutDashboard, Book as Door, CreditCard, Building2, Menu, X, LogOut } from "lucide-react"
import { MetricCard } from "./metric-card"
import { RentalRequestsTable } from "./rental-requests-table"
import { MyPropertiesTable } from "./my-properties-table"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface NavLink {
  label: string
  icon: React.ReactNode
  href: string
  isActive: boolean
}

export default function DashboardLayout() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // STATE BARU: Untuk menyimpan data dari database
  const [bookings, setBookings] = useState<any[]>([])
  const [myProperties, setMyProperties] = useState<any[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    revenue: 0,
    occupied: 0
  })

  // FUNGSI BARU: Ambil data saat halaman dibuka
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { console.log("⚠️ No session"); return }

        console.log("🔍 Fetching data for user:", session.user.id)

        // 1. Ambil data kos milik admin
        const { data: propsData } = await supabase
          .from('boarding_houses')
          .select('*')
          .eq('owner_id', session.user.id)

        console.log("🏠 My properties:", propsData?.length || 0, propsData)
        setMyProperties(propsData || [])

        // 2. Ambil semua booking TANPA join
        const { data: allBookings, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })

        console.log("📦 All bookings fetched:", allBookings?.length || 0)
        console.log("❌ Booking error:", bookingError)

        // 2b. Fetch room data untuk booking yang punya room_id
        const bookingsWithRooms = await Promise.all(
          (allBookings || []).map(async (booking: any) => {
            if (booking.room_id) {
              const { data: roomData } = await supabase
                .from('rooms')
                .select('id, room_number, floor, room_type')
                .eq('id', booking.room_id)
                .single()

              return { ...booking, rooms: roomData }
            }
            return booking
          })
        )

        // 3. Filter: hanya booking untuk property milik admin
        const myPropertyIds = (propsData || []).map((p: any) => p.id)
        console.log("🔑 My property IDs:", myPropertyIds)

        const filteredBookings = bookingsWithRooms.filter((b: any) => {
          const match = myPropertyIds.includes(b.property_id)
          if (b.id) console.log(`Booking ${b.guest_name} - property: ${b.property_id} - match: ${match}`)
          return match
        })

        console.log("✅ Filtered bookings:", filteredBookings.length, filteredBookings)
        setBookings(filteredBookings)

        // 4. Hitung Statistik dari filtered bookings
        const pendingCount = filteredBookings.filter((item: any) => item.status === 'pending').length
        const totalMoney = filteredBookings.reduce((acc: number, curr: any) => {
          return acc + (Number(curr.total_price) || 0)
        }, 0)

        setStats({
          pending: pendingCount,
          revenue: totalMoney,
          occupied: filteredBookings.length
        })
      } catch (err) {
        console.error("💥 Error:", err)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { console.log("⚠️ No session"); return }

      console.log("🔍 Fetching data for user:", session.user.id)

      const { data: propsData } = await supabase
        .from('boarding_houses')
        .select('*')
        .eq('owner_id', session.user.id)

      console.log("🏠 My properties:", propsData?.length || 0, propsData)
      setMyProperties(propsData || [])

      // 2. Ambil semua booking TANPA join (untuk avoid error jika room_id NULL)
      const { data: allBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      console.log("📦 All bookings fetched:", allBookings?.length || 0)
      console.log("❌ Booking error:", bookingError)

      const myPropertyIds = (propsData || []).map((p: any) => p.id)
      console.log("🔑 My property IDs:", myPropertyIds)
      console.log("📋 Full properties:", propsData)

      const filteredBookings = (allBookings || []).filter((b: any) => {
        const match = myPropertyIds.includes(b.property_id)
        if (b.id) console.log(`Booking ${b.guest_name} - property: ${b.property_id} - match: ${match}`)
        return match
      })

      console.log("✅ Filtered bookings:", filteredBookings.length, filteredBookings)
      setBookings(filteredBookings)

      const pendingCount = filteredBookings.filter((item: any) => item.status === 'pending').length
      const totalMoney = filteredBookings.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.total_price) || 0)
      }, 0)

      setStats({
        pending: pendingCount,
        revenue: totalMoney,
        occupied: filteredBookings.length
      })
    } catch (err) {
      console.error("💥 Error:", err)
    }
  }

  const navLinks: NavLink[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
      isActive: true,
    },
    {
      label: "Kelola Kamar",
      icon: <Door className="w-5 h-5" />,
      href: "/dashboard/rooms",
      isActive: false,
    },
    {
      label: "Transaksi",
      icon: <CreditCard className="w-5 h-5" />,
      href: "#transaksi",
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
        className={`${sidebarOpen ? "w-64" : "w-0"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${link.isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
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

            {/* KARTU 2: Properti Saya */}
            <MetricCard
              title="Properti Saya"
              value={`${myProperties.length} Unit`}
              subtitle="Total kos terdaftar"
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

          {/* TABEL 1: DAFTAR KOS SAYA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Daftar Kosan Saya
              </h2>
              <a href="/dashboard/add-property" className="text-sm text-primary hover:underline font-semibold">+ Tambah Baru</a>
            </div>
            <MyPropertiesTable properties={myProperties} onDelete={fetchData} />
          </div>

          {/* TABEL 2: BOOKING MASUK */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-2xl font-bold text-foreground">Pengajuan Sewa Masuk</h2>
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