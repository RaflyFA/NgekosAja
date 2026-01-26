"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, MapPin, Edit2, ArrowRight, Home, Building2, LayoutGrid, Sparkles, Building, Trash } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { EditPropertyDialog } from "./edit-property-dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Property {
  id: string; name: string; price: number; city: string; image_url?: string; images?: any;
}

export function MyPropertiesTable({ properties, onDelete }: { properties: Property[], onDelete: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(properties.length / itemsPerPage)

  const currentProperties = properties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    try {
      const { error } = await supabase.from('boarding_houses').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Asset Liquidated", description: "Property has been removed from the registry." })
      onDelete()
      if (currentProperties.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error: any) { toast({ title: "Gagal", description: error.message, variant: "destructive" }) }
    finally { setLoadingId(null) }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
  }

  const getImageUrl = (kos: Property): string => {
    if (kos.images) {
      const images = typeof kos.images === 'string' ? JSON.parse(kos.images) : kos.images
      return Array.isArray(images) && images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
    }
    return kos.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 px-8">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry Index</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Asset Identity</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Yield Generation</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Regional Hub</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {currentProperties.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <Building className="w-10 h-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PORTFOLIO IS EMPTY</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">Digitize your first property asset to unlock full owner console potential.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              currentProperties.map((kos) => (
                <tr key={kos.id} className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[2rem]">
                  <td className="px-6 py-5 first:rounded-l-[2rem]">
                    <div className="w-24 h-16 relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 shadow-2xl border-2 border-white dark:border-white/10 group-hover:scale-105 transition-transform duration-700">
                      <img src={getImageUrl(kos)} alt={kos.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors duration-500">{kos.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-slate-100 dark:bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase tracking-[0.2em]">{kos.id.slice(0, 8)}</span>
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{formatRupiah(kos.price).replace("Rp", "").trim()}</span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">IDR</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 w-fit shadow-inner group-hover:bg-primary/5 transition-colors">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{kos.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 last:rounded-r-[2rem] text-right">
                    <div className="flex justify-end items-center gap-4 translate-x-3 group-hover:translate-x-0 transition-transform duration-700">
                      <EditPropertyDialog propertyId={kos.id} onSuccess={onDelete} />
                      <button
                        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-500 shadow-xl group/btn"
                        onClick={() => handleDelete(kos.id)}
                        disabled={loadingId === kos.id}
                      >
                        {loadingId === kos.id ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Trash className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Hub */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-12 py-8 mt-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary gap-2"
            >
              PREVIOUS
            </Button>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary gap-2"
            >
              NEXT
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}