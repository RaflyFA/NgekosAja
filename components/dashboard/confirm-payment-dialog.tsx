"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Calendar, CreditCard, Image as ImageIcon, ShieldCheck, AlertCircle, Bookmark, DollarSign, User, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ConfirmPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: {
        id: string; tenant_name: string; amount: number; period_month: string; status: string;
        payment_method: string | null; proof_image_url: string | null; payment_date: string | null; admin_notes: string | null;
    } | null
    onSuccess: () => void
}

export function ConfirmPaymentDialog({ open, onOpenChange, transaction, onSuccess }: ConfirmPaymentDialogProps) {
    const [adminNotes, setAdminNotes] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
    }

    const formatPaymentMethod = (method: string | null) => {
        const methods: Record<string, string> = { 'transfer': 'Bank Transfer', 'cash': 'Direct Cash', 'e-wallet': 'E-Wallet Hub', 'other': 'Miscellaneous' }
        return (methods[method || ''] || method || 'UNSPECIFIED').toUpperCase()
    }

    const handleConfirm = async () => {
        if (!transaction) return
        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const { error } = await supabase.from('transactions').update({
                status: 'paid', confirmed_at: new Date().toISOString(), confirmed_by: session?.user.id,
                admin_notes: adminNotes || transaction.admin_notes
            }).eq('id', transaction.id)
            if (error) throw error
            toast({ title: "Audit Successful", description: "Payment has been verified and settled in the ledger." })
            onOpenChange(false); onSuccess(); setAdminNotes("")
        } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
        finally { setSubmitting(false) }
    }

    if (!transaction) return null
    const isReadOnly = transaction.status === 'paid'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl h-[85vh] overflow-hidden p-0 bg-white dark:bg-slate-950 border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
                <div className="p-10 pb-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 relative">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">{isReadOnly ? "Audit <span class='text-primary not-italic'>Summary</span>" : "Clearance <span class='text-primary not-italic'>Audit</span>"}</h1>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Transaction Verification Console</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isReadOnly ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-primary/10 border-primary/20 text-primary animate-pulse'}`}>
                            {isReadOnly ? 'SETTLED' : 'REQUIRED AUDIT'}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-950 dark:bg-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><User className="w-4 h-4" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PAYER</span>
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-tighter">{transaction.tenant_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><Bookmark className="w-4 h-4" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PERIOD</span>
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-tighter">{transaction.period_month}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><DollarSign className="w-4 h-4" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SETTLEMENT</span>
                                </div>
                                <span className="text-2xl font-black text-primary tracking-tighter">{formatRupiah(Number(transaction.amount))}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TENANT SUBMISSION</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">TIMESTAMP</Label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{transaction.payment_date ? format(new Date(transaction.payment_date), 'dd MMM yyyy', { locale: localeId }) : 'UNSPECIFIED'}</span>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CHANNEL</Label>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{formatPaymentMethod(transaction.payment_method)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">VISUAL EVIDENCE</Label>
                            {transaction.proof_image_url ? (
                                <div className="relative group rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-white/5 shadow-2xl bg-slate-900">
                                    <img src={transaction.proof_image_url} alt="Proof" className="w-full h-72 object-contain transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest">TAP FOR FULL RESOLUTION VIEW</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-xl shadow-xl">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 rounded-[2rem] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 text-center">
                                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NO ASSET EVIDENCE SUBMITTED</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AUDIT LOGS (PRIVATE)</Label>
                        <Textarea placeholder="Digital signature or private auditing notes..." value={adminNotes || transaction.admin_notes || ""} onChange={(e) => setAdminNotes(e.target.value)} disabled={isReadOnly} className="h-28 rounded-[2rem] bg-slate-50 dark:bg-white/5 border-none p-6 font-black text-[10px] uppercase tracking-widest shadow-inner leading-relaxed" />
                    </div>
                </div>

                <DialogFooter className="p-10 pt-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 gap-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">{isReadOnly ? 'CLOSE REPORT' : 'DISCARD'}</Button>
                    {!isReadOnly && (
                        <Button onClick={handleConfirm} disabled={submitting} className="h-14 px-12 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {submitting ? "ADJUSTING LEDGER..." : "SETTLE TRANSACTION"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
