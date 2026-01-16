"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Book as Door, CreditCard, Menu, X, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DashboardSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const navLinks = [
        {
            label: "Dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: "/dashboard",
        },
        {
            label: "Kelola Kamar",
            icon: <Door className="w-5 h-5" />,
            href: "/dashboard/rooms",
        },
        {
            label: "Transaksi",
            icon: <CreditCard className="w-5 h-5" />,
            href: "#transaksi",
        },
    ]

    return (
        <>
            {/* Mobile Toggle Button */}
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
                    } bg-card border-r border-border transition-all duration-300 overflow-hidden lg:w-64 lg:block fixed lg:fixed left-0 top-0 h-screen z-30`}
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === link.href
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-secondary"
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

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 lg:hidden z-20" onClick={() => setSidebarOpen(false)} />
            )}
        </>
    )
}
