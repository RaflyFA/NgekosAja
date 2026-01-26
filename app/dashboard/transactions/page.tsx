"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TransactionStatsCards } from "@/components/dashboard/transaction-stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { ConfirmPaymentDialog } from "@/components/dashboard/confirm-payment-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Landmark, Filter, Search, Zap, Info, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Transaction {
    id: string; tenant_name: string; tenant_phone: string | null; amount: number; due_date: string; period_month: string; status: string; payment_method: string | null; proof_image_url: string | null; payment_date: string | null; property_id: string; room_id: string | null; admin_notes: string | null; rooms?: { room_number: string; floor: number; }; boarding_houses?: { name: string; };
}
interface BoardingHouse { id: string; name: string; }

export default function TransactionsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
    const [selectedProperty, setSelectedProperty] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [proofDialogOpen, setProofDialogOpen] = useState(false)
    const [proofImageUrl, setProofImageUrl] = useState("")

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push("/login"); return }
            const { data: properties } = await supabase.from('boarding_houses').select('id, name').eq('owner_id', session.user.id).order('name')
            setBoardingHouses(properties || [])
            const { data: transactionsData, error } = await supabase.from('transactions').select(`*, rooms (room_number, floor), boarding_houses (name)`).in('property_id', (properties || []).map(p => p.id)).order('due_date', { ascending: false })
            if (error) throw error
            setTransactions(transactionsData || [])
            await supabase.rpc('update_overdue_transactions')
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const filteredTransactions = useMemo(() => {
        let filtered = transactions
        if (selectedProperty !== "all") filtered = filtered.filter(t => t.property_id === selectedProperty)
        if (selectedStatus !== "all") filtered = filtered.filter(t => t.status === selectedStatus)
        return filtered
    }, [transactions, selectedProperty, selectedStatus])

    const stats = useMemo(() => {
        const paid = filteredTransactions.filter(t => t.status === 'paid')
        const pending = filteredTransactions.filter(t => t.status === 'pending')
        const overdue = filteredTransactions.filter(t => t.status === 'overdue')
        return { totalRevenue: paid.reduce((sum, t) => sum + Number(t.amount), 0), pendingAmount: pending.reduce((sum, t) => sum + Number(t.amount), 0), paidCount: paid.length, overdueCount: overdue.length, }
    }, [filteredTransactions])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 overflow-auto lg:ml-72 no-scrollbar">
                <div className="p-8 lg:p-14 space-y-14 max-w-7xl mx-auto">

                    {/* Fiscal Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Landmark className="w-8 h-8 text-primary" />
                                <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Fiscal <span className="text-primary not-italic">Ledger</span></h1>
                            </div>
                            <p className="text-slate-500 font-bold max-w-xl">Audit real-time cash flow, manage receivables, and verify tenant settlements with enterprise precision.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Audit Active</span>
                        </div>
                    </div>

                    <TransactionStatsCards
                        totalRevenue={stats.totalRevenue}
                        pendingAmount={stats.pendingAmount}
                        paidCount={stats.paidCount}
                        overdueCount={stats.overdueCount}
                    />

                    <RevenueChart transactions={transactions} />

                    {/* Integrated Filters Component */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sticky top-0 z-20">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">HUB ORIGIN FILTER</label>
                            </div>
                            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                <SelectTrigger className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-6 font-black text-[11px] uppercase tracking-widest text-slate-700 dark:text-slate-200 shadow-inner">
                                    <SelectValue placeholder="ALL PROPERTY ASSETS" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/10 glass-card">
                                    <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest p-4 cursor-pointer">ALL PROPERTY ASSETS</SelectItem>
                                    {boardingHouses.map((house) => (
                                        <SelectItem key={house.id} value={house.id} className="font-bold text-[10px] uppercase tracking-widest p-4 cursor-pointer">{house.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">CLEARANCE STAGE</label>
                            </div>
                            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
                                <TabsList className="grid grid-cols-4 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl p-1 shadow-inner border-none">
                                    {['all', 'pending', 'paid', 'overdue'].map(st => (
                                        <TabsTrigger key={st} value={st} className="rounded-xl font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">{st}</TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </motion.div>
                    </div>

                    {/* Audit Ledger List */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-8">
                            <div className="flex items-center gap-4">
                                <Search className="w-8 h-8 text-primary" />
                                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Fiscal Audit Ledger</h2>
                            </div>
                            <div className="px-5 py-2 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">
                                {filteredTransactions.length} RECORDS DISCOVERED
                            </div>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl">
                            <TransactionsTable
                                transactions={filteredTransactions}
                                onConfirmPayment={(t) => { setSelectedTransaction(t); setDialogOpen(true); }}
                                onViewProof={(url) => { setProofImageUrl(url); setProofDialogOpen(true); }}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} transaction={selectedTransaction} onSuccess={fetchData} />

            <AnimatePresence>
                {proofDialogOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-8"
                        onClick={() => setProofDialogOpen(false)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-4xl w-full aspect-[3/4] md:aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                            <img src={proofImageUrl} alt="Bukti Transfer" className="w-full h-full object-contain bg-slate-900" />
                            <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest">EVIDENCE VERIFICATION</div>
                            <button className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20">✕</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
