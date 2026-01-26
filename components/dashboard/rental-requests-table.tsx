"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Phone, Loader2, Trash2, User, Building2, MapPin, Calendar, ArrowRight, ShieldCheck, Clock, ShieldX, UserCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createNotification } from "@/lib/notifications"
import { motion, AnimatePresence } from "framer-motion"

interface RentalRequestsTableProps {
  bookings?: any[]
  onDelete?: () => void
}

export function RentalRequestsTable({ bookings = [], onDelete }: RentalRequestsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingId(bookingId)
    try {
      await supabase.from('bookings').delete().eq('id', bookingId)
      toast({ title: "Record Deleted", description: "Application history has been cleared from the system." })
      onDelete?.()
    } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
    finally { setDeletingId(null) }
  }

  const handleUpdateStatus = async (bookingId: string, roomId: string | null, newStatus: 'approved' | 'rejected', bookingData: any) => {
    setProcessingId(bookingId)
    try {
      if (newStatus === 'approved' && roomId) {
        const { data: roomData } = await supabase.from('rooms').select('is_occupied, tenant_name, room_number').eq('id', roomId).single()
        if (roomData?.is_occupied) {
          toast({ title: "Unit Occupied", description: `Unit ${roomData.room_number} is already managed by ${roomData.tenant_name}.`, variant: "destructive" })
          setProcessingId(null); return
        }
      }

      await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)

      if (newStatus === 'approved' && roomId && bookingData) {
        const startDate = new Date(bookingData.start_date)
        const endDate = new Date(startDate); endDate.setMonth(endDate.getMonth() + (bookingData.duration_months || 1))
        await supabase.from('rooms').update({
          is_occupied: true, tenant_name: bookingData.guest_name, tenant_phone: bookingData.guest_phone,
          rent_start_date: bookingData.start_date, rent_end_date: endDate.toISOString().split('T')[0]
        }).eq('id', roomId)
        if (bookingData.user_id) await createNotification(bookingData.user_id, "Application Verified", `Your request for Unit ${bookingData.rooms?.room_number || ''} at ${bookingData.boarding_houses?.name} has been approved.`, 'booking_approved', bookingId)
      } else if (newStatus === 'rejected' && bookingData.user_id) {
        await createNotification(bookingData.user_id, "Application Declined", `Your request for Unit ${bookingData.rooms?.room_number || ''} at ${bookingData.boarding_houses?.name} was not accepted.`, 'booking_rejected', bookingId)
      }

      toast({ title: newStatus === 'approved' ? "Asset Deployed" : "Request Denied", description: "Ledger has been updated successfully." })
      window.location.reload()
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); setProcessingId(null) }
  }

  const getInitials = (name: string) => {
    if (!name) return "US"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 px-8 mb-8">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Identity Profile</th>
              <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry Target</th>
              <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Contract Duration</th>
              <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Clearance Tier</th>
              <th className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Audit Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <UserCheck className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">NO PENDING ADMISSIONS</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">System cloud is currently clear of any property admission requests.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                  <td className="px-6 py-5 first:rounded-l-[2.5rem]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
                        {getInitials(booking.guest_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none mb-1">{booking.guest_name}</span>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg w-fit mt-1">
                          <Phone className="w-3 h-3 text-primary" />
                          {booking.guest_phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{booking.boarding_houses?.name}</span>
                      </div>
                      {booking.rooms && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">UNIT {booking.rooms.room_number}</span>
                          {booking.rooms.floor && <span className="text-[9px] font-black text-slate-400">FL {booking.rooms.floor}</span>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[12px] font-black dark:text-white uppercase tracking-tighter">
                        <Calendar className="w-4 h-4 text-primary" />
                        {booking.duration_months || 1} <span className="text-[9px] text-slate-400 font-bold ml-1">MONTHS</span>
                      </div>
                      <div className="w-12 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(((booking.duration_months || 1) / 12) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-xl ${booking.status === 'approved' ? 'bg-green-600 shadow-green-500/20 text-white border border-green-400/20' :
                        booking.status === 'rejected' ? 'bg-red-600 shadow-red-500/20 text-white border border-red-400/20' :
                          'bg-slate-950 shadow-slate-950/20 text-white animate-pulse border border-white/5'
                      }`}>
                      {booking.status === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                        booking.status === 'rejected' ? <ShieldX className="w-3.5 h-3.5" /> :
                          <Clock className="w-3.5 h-3.5 text-primary" />}
                      {booking.status === 'approved' ? 'VERIFIED' : booking.status === 'rejected' ? 'DECLINED' : 'IN REVIEW'}
                    </div>
                  </td>
                  <td className="px-6 py-5 last:rounded-r-[2.5rem] text-right">
                    <div className="flex justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                      {booking.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, booking.room_id, 'approved', booking)}
                            disabled={processingId === booking.id}
                            className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-green-500/5 group/btn"
                            title="Verify Application"
                          >
                            {processingId === booking.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, booking.room_id, 'rejected', booking)}
                            disabled={processingId === booking.id}
                            className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-red-500/5 group/btn"
                            title="Decline"
                          >
                            {processingId === booking.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={deletingId === booking.id}
                          className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl group/btn"
                          title="Purge Record"
                        >
                          {deletingId === booking.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}