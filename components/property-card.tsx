"use client"

import { Star, MapPin, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface PropertyCardProps {
  property: {
    id: string
    name: string
    location: string
    price: number
    type: string
    rating: number
    image: string
  }
}

const typeColors: Record<string, string> = {
  putra: "bg-blue-500 text-white",
  putri: "bg-rose-500 text-white",
  campur: "bg-indigo-600 text-white",
}

const typeLabels: Record<string, string> = {
  putra: "PUTRA",
  putri: "PUTRI",
  campur: "CAMPUR",
}

export function PropertyCard({ property }: PropertyCardProps) {
  const normType = (property.type || "campur").toLowerCase();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/kos/${property.id}`} className="block h-full">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-none transition-all duration-700 flex flex-col">
          {/* Magazine-style Image Container */}
          <div className="relative h-72 overflow-hidden">
            <img
              src={property.image || "/placeholder.svg"}
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Premium Badges */}
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg backdrop-blur-md ${normType === 'putra' ? 'bg-blue-500/40 text-white' : normType === 'putri' ? 'bg-rose-500/40 text-white' : 'bg-indigo-600/40 text-white'}`}>
                {typeLabels[normType] || "CAMPUR"}
              </div>
            </div>

            <div className="absolute top-5 right-5 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-white/20 dark:border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-black text-slate-900 dark:text-white">{property.rating}</span>
            </div>

            {/* Price Floating Badge for Magazine Look */}
            <div className="absolute bottom-6 left-6">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Mulai Dari</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white leading-none tracking-tighter">
                  {formatPrice(property.price).replace("Rp", "").trim()}
                </span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">/ BLN</span>
              </div>
            </div>
          </div>

          {/* Clean Content Area */}
          <div className="p-8 flex flex-col flex-1">
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {property.name.toUpperCase()}
              </h3>

              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-8 font-bold">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs uppercase tracking-widest leading-none truncate">{property.location}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${property.id}${i}`} className="w-full h-full object-cover grayscale opacity-80" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary">
                  +12
                </div>
              </div>

              <div className="flex items-center gap-2 text-primary group/btn">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">LIHAT DETAIL</span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
