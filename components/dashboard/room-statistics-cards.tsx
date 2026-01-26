"use client"

import { Building2, CheckCircle2, DoorOpen, TrendingUp, Users, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface RoomStatisticsCardsProps {
    totalRooms: number
    occupiedRooms: number
    vacantRooms: number
}

export function RoomStatisticsCards({ totalRooms, occupiedRooms, vacantRooms }: RoomStatisticsCardsProps) {
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCard
                label="TOTAL INVENTORY"
                value={totalRooms}
                unit="Units"
                subtitle="All listed property units"
                icon={<Building2 className="w-6 h-6" />}
                variant="dark"
            />

            <StatsCard
                label="OCCUPIED UNITS"
                value={occupiedRooms}
                unit="Active"
                subtitle={`${occupancyRate}% global occupancy rate`}
                icon={<Users className="w-6 h-6" />}
                variant="glass"
                progress={occupancyRate}
                accent="primary"
            />

            <StatsCard
                label="VACANT CAPACITY"
                value={vacantRooms}
                unit="Available"
                subtitle="Ready for immediate lease"
                icon={<DoorOpen className="w-6 h-6" />}
                variant="glass"
                accent="green"
            />
        </div>
    )
}

function StatsCard({ label, value, unit, subtitle, icon, variant, progress, accent }: any) {
    const isDark = variant === "dark"
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-10 min-h-[200px] shadow-xl border transition-all duration-500 ${isDark ? "bg-slate-950 text-white border-white/5" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
                }`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 ${isDark ? "bg-primary" : "bg-primary/50"}`} />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/10" : "bg-primary/10 text-primary"}`}>
                        {icon}
                    </div>
                    {isDark && <Sparkles className="w-5 h-5 text-primary opacity-50" />}
                </div>

                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-950 dark:text-white"}`}>{value}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{unit}</span>
                    </div>
                </div>

                {progress !== undefined ? (
                    <div className="space-y-2 pt-2">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>
                    </div>
                ) : (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50 dark:border-white/5">{subtitle}</p>
                )}
            </div>
        </motion.div>
    )
}
