"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Book as Door, CreditCard, Menu, X, LogOut, User, Moon, Sun, Bell, Sparkles, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { EditProfileDialog } from "./edit-profile-dialog"
import { useTheme } from "next-themes"
import { getUnreadCount } from "@/lib/notifications"
import { motion, AnimatePresence } from "framer-motion"

export function DashboardSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [userId, setUserId] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<any>(null)

    useEffect(() => {
        setMounted(true)
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                const count = await getUnreadCount(user.id)
                setUnreadCount(count)

                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setUserProfile(profile)
            }
        }
        loadUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUserId(session.user.id)
                const count = await getUnreadCount(session.user.id)
                setUnreadCount(count)
            } else {
                setUserId(null)
                setUnreadCount(0)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!userId) return
        const channel = supabase.channel('notifications-count').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, async () => {
            const count = await getUnreadCount(userId)
            setUnreadCount(count)
        }).subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [userId])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const navLinks = [
        { label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
        { label: "Unit Hunian", icon: <Door className="w-5 h-5" />, href: "/dashboard/rooms" },
        { label: "Manajemen Keuangan", icon: <CreditCard className="w-5 h-5" />, href: "/dashboard/transactions" },
        { label: "Pusat Pesan", icon: <Bell className="w-5 h-5" />, href: "/dashboard/notifications", badge: unreadCount > 0 ? unreadCount : undefined },
    ]

    return (
        <>
            {/* Mobile Sidebar Trigger */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-6 right-6 z-50 w-12 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 dark:text-white transition-all active:scale-95"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar Shell */}
            <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-r border-slate-100 dark:border-white/5 transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex flex-col h-full p-8">

                    {/* Brand Identity */}
                    <div className="flex items-center gap-4 mb-16 px-2">
                        <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-950 dark:text-white tracking-tighter leading-none italic">NGEKOS<span className="text-primary not-italic">AJA</span></span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Plateform</span>
                        </div>
                    </div>

                    {/* Navigation Tracks */}
                    <nav className="flex-1 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4 mt-2">Main Console</p>
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-4 h-14 rounded-2xl transition-all duration-300 group ${isActive
                                            ? "bg-primary text-white shadow-xl shadow-primary/20"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                                        }`}
                                >
                                    <div className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-primary"}`}>
                                        {link.icon}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                                    {link.badge && (
                                        <div className="ml-auto w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-lg flex items-center justify-center shadow-lg">
                                            {link.badge}
                                        </div>
                                    )}
                                    {isActive && (
                                        <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 rounded-full bg-white opacity-40" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom Management Layer */}
                    <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
                        <div className="px-4 py-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 border-2 border-white dark:border-slate-800">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-primary uppercase">{userProfile?.full_name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">{userProfile?.full_name || "Guest"}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate tracking-widest">Administrator</p>
                                </div>
                            </div>
                            <EditProfileDialog />
                        </div>

                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                className="flex items-center gap-4 px-4 h-12 w-full rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 h-12 w-full rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>System Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop Mask */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    )
}
