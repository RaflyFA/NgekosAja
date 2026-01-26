"use client"

import { DollarSign, Home, Clock, TrendingUp, Sparkles, Activity, ShieldCheck, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: string
  variant?: "revenue" | "property" | "pending" | "default"
}

export function MetricCard({ title, value, subtitle, icon, variant = "default" }: MetricCardProps) {
  const isRevenue = variant === "revenue" || icon === "💰"
  const isProperty = variant === "property" || icon === "🏠"
  const isPending = variant === "pending" || icon === "⏳"

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-[2.5rem] p-10 min-h-[220px] shadow-2xl transition-all duration-500 border ${isRevenue ? "bg-slate-950 text-white border-white/5 shadow-primary/10" :
          "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
        }`}
    >
      <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 ${isRevenue ? "bg-primary" : "bg-primary/50"
        }`} />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isRevenue ? "bg-white/10 text-white border border-white/10" : "bg-primary/10 text-primary border border-primary/20"
              }`}>
              {icon === "💰" ? <DollarSign className="w-7 h-7" /> :
                icon === "🏠" ? <Home className="w-7 h-7" /> :
                  icon === "⏳" ? <Clock className="w-7 h-7" /> :
                    <Activity className="w-7 h-7" />}
            </div>
            {isRevenue ? (
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                <Zap className="w-3 h-3fill-primary" /> REAL-TIME
              </div>
            ) : (
              <Sparkles className="w-5 h-5 text-primary/30" />
            )}
          </div>

          <div className="space-y-2">
            <p className={`text-[10px] font-black uppercase tracking-[0.25em] leading-none ${isRevenue ? "text-slate-400" : "text-slate-500"
              }`}>{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-4xl lg:text-5xl font-black tracking-tighter leading-tight ${isRevenue ? "text-white" : "text-slate-950 dark:text-white"
                }`}>{value}</h3>
              {isRevenue && <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">IDR</span>}
            </div>
          </div>
        </div>

        <div className={`pt-6 border-t flex items-center gap-2 ${isRevenue ? "border-white/5" : "border-slate-50 dark:border-white/5"
          }`}>
          <div className={`w-2 h-2 rounded-full ${isRevenue ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "bg-slate-200 dark:bg-white/10"}`} />
          <p className={`text-[10px] font-black uppercase tracking-widest ${isRevenue ? "text-slate-500" : "text-slate-400"
            }`}>{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}
