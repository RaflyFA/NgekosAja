"use client"

import { TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Activity } from "lucide-react"
import { motion } from "framer-motion"

interface TransactionStatsProps {
    totalRevenue: number
    pendingAmount: number
    paidCount: number
    overdueCount: number
}

export function TransactionStatsCards({
    totalRevenue,
    pendingAmount,
    paidCount,
    overdueCount
}: TransactionStatsProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatsCard
                label="TOTAL REVENUE"
                value={formatRupiah(totalRevenue)}
                subtitle="Verified lunas payments"
                icon={<DollarSign className="w-6 h-6" />}
                variant="dark"
            />

            <StatsCard
                label="PENDING CLEARANCE"
                value={formatRupiah(pendingAmount)}
                subtitle="Requires manual audit"
                icon={<Clock className="w-6 h-6" />}
                variant="glass"
                accent="amber"
            />

            <StatsCard
                label="PAID TRANSACTIONS"
                value={paidCount}
                unit="Confirmed"
                subtitle="Successfully processed"
                icon={<CheckCircle className="w-6 h-6" />}
                variant="glass"
                accent="green"
            />

            <StatsCard
                label="OVERDUE ALERTS"
                value={overdueCount}
                unit="Critical"
                subtitle="Immediate action required"
                icon={<AlertCircle className="w-6 h-6" />}
                variant="glass"
                accent="red"
                pulse={overdueCount > 0}
            />
        </div>
    )
}

function StatsCard({ label, value, unit, subtitle, icon, variant, accent, pulse }: any) {
    const isDark = variant === "dark"
    const colorClass =
        accent === "amber" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
            accent === "green" ? "text-green-500 bg-green-500/10 border-green-500/20" :
                accent === "red" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                    "text-primary bg-primary/10 border-primary/20"

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-10 min-h-[200px] shadow-xl border transition-all duration-500 ${isDark ? "bg-slate-950 text-white border-white/5" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
                }`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 ${isDark ? "bg-primary" : "bg-primary/50"}`} />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/10" : colorClass}`}>
                        {icon}
                    </div>
                    {pulse && (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 animate-pulse">
                            <Activity className="w-3 h-3" /> CRITICAL
                        </div>
                    )}
                    {isDark && !pulse && <Sparkles className="w-5 h-5 text-primary opacity-50" />}
                </div>

                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-950 dark:text-white"}`}>{value}</span>
                        {unit && <span className="text-[10px] font-black text-primary uppercase tracking-widest">{unit}</span>}
                    </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50 dark:border-white/5">{subtitle}</p>
            </div>
        </motion.div>
    )
}
