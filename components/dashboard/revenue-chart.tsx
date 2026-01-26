"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { TrendingUp, Calendar, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface Transaction {
    period_month: string
    amount: number
    status: string
}

interface RevenueChartProps {
    transactions: Transaction[]
}

export function RevenueChart({ transactions }: RevenueChartProps) {
    const chartData = useMemo(() => {
        const monthlyData: Record<string, number> = {}
        transactions
            .filter(t => t.status === 'paid')
            .forEach(transaction => {
                const month = transaction.period_month
                if (!monthlyData[month]) monthlyData[month] = 0
                monthlyData[month] += Number(transaction.amount)
            })

        const dataArray = Object.entries(monthlyData)
            .map(([month, revenue]) => ({
                month,
                revenue,
                monthLabel: format(parseISO(`${month}-01`), 'MMM yyyy', { locale: idLocale }).toUpperCase()
            }))
            .sort((a, b) => a.month.localeCompare(b.month))

        return dataArray.slice(-6)
    }, [transactions])

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0, minimumFractionDigits: 0,
        }).format(value)
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-[3rem] p-12 text-center h-[400px] flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center opacity-50">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">INSUFFICIENT DATA FOR FISCAL TRENDS</h4>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary" />
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Fiscal Growth Velocity</h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rolling 6-Month Revenue Analysis</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    <Calendar className="w-4 h-4 text-primary" /> ACTIVE AUDIT PERIOD
                </div>
            </div>

            <div className="h-[350px] w-full relative z-10 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                        <XAxis
                            dataKey="monthLabel"
                            axisLine={false}
                            tickLine={false}
                            className="text-[9px] font-black tracking-widest text-slate-400"
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            className="text-[9px] font-black tracking-widest text-slate-400"
                            tickFormatter={(value) => `IDR ${(value / 1000000).toFixed(1)}M`}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{payload[0].payload.monthLabel}</p>
                                            <p className="text-lg font-black text-white">{formatRupiah(payload[0].value as number)}</p>
                                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest">NET EARNINGS</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}
