"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Clock, Eye, FileText, Phone, User, Landmark, ShieldCheck, DollarSign } from "lucide-react"
import { format, parseISO } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

interface Transaction {
    id: string
    tenant_name: string
    tenant_phone: string | null
    amount: number
    due_date: string
    period_month: string
    status: string
    payment_method: string | null
    proof_image_url: string | null
    payment_date: string | null
    rooms?: {
        room_number: string
        floor: number
    }
    boarding_houses?: {
        name: string
    }
}

interface TransactionsTableProps {
    transactions: Transaction[]
    onConfirmPayment: (transaction: Transaction) => void
    onViewProof: (imageUrl: string) => void
}

export function TransactionsTable({ transactions, onConfirmPayment, onViewProof }: TransactionsTableProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        try { return format(parseISO(dateString), "dd MMM yyyy", { locale: localeId }) } catch { return "-" }
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] mx-8 my-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">NO FISCAL RECORDS DISCOVERED</h4>
                <p className="text-slate-500 font-bold max-w-xs mx-auto text-[10px] uppercase tracking-widest mt-2 leading-relaxed">System has not found any transactions for the selected audit period.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-4 px-8 mb-8">
                    <thead>
                        <tr>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Payer Identity</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Amount</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fiscal Period</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Status</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearing Method</th>
                            <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Audit Tools</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                                <td className="px-6 py-5 first:rounded-l-[2rem]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20">
                                            {transaction.tenant_name.charAt(0).toUpperCase()}{transaction.tenant_name.split(' ').pop()?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none mb-1">{transaction.tenant_name}</span>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="text-primary font-black">UNIT {transaction.rooms?.room_number || "—"}</span>
                                                <span>• {transaction.boarding_houses?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{formatRupiah(transaction.amount).replace("Rp", "").trim()}</span>
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">IDR</span>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                            {format(parseISO(`${transaction.period_month}-01`), "MMMM yyyy", { locale: localeId }).toUpperCase()}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">DUE: {formatDate(transaction.due_date)}</p>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg ${transaction.status === 'paid' ? 'bg-green-600 shadow-green-500/20 text-white' :
                                            transaction.status === 'overdue' ? 'bg-red-600 shadow-red-500/20 text-white' :
                                                'bg-amber-400 shadow-amber-400/20 text-amber-950'
                                        }`}>
                                        {transaction.status === 'paid' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                                            transaction.status === 'overdue' ? <AlertCircle className="w-3.5 h-3.5" /> :
                                                <Clock className="w-3.5 h-3.5" />}
                                        {transaction.status === 'paid' ? 'SETTLED' : transaction.status === 'overdue' ? 'OVERDUE' : 'CLEARANCE'}
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center">
                                            <Landmark className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{transaction.payment_method || "PENDING"}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-5 last:rounded-r-[2rem] text-right">
                                    <div className="flex justify-end gap-3">
                                        {transaction.proof_image_url && (
                                            <button
                                                onClick={() => onViewProof(transaction.proof_image_url!)}
                                                className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-primary/5"
                                                title="View Evidence"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                        {transaction.status === 'pending' && (
                                            <button
                                                onClick={() => onConfirmPayment(transaction)}
                                                className="h-10 px-4 rounded-xl bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                                            >
                                                CLEAR AUDIT
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
