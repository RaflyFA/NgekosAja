"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PhotoGallery } from "./photo-gallery"
import { FacilitiesSection } from "./facilities-section"
import { BookingCard } from "./booking-card"
import { OwnerProfile } from "./owner-profile"
import { ReviewsSection } from "./reviews-section"
import { Header } from "./header"
import { Footer } from "./footer"
import { ShareDialog } from "./share-dialog"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { ArrowLeft, MapPin, Star, ShieldCheck, Share2, Heart, Navigation } from "lucide-react"
import { motion } from "framer-motion"

export function PropertyDetailPage({ dataKos, ownerData, reviewsData }: {
  dataKos: any
  ownerData: any
  reviewsData: any[]
}) {

  // Parse images array
  let imagesArray: string[] = []
  if (dataKos.images) {
    const parsed = typeof dataKos.images === 'string' ? JSON.parse(dataKos.images) : dataKos.images
    imagesArray = Array.isArray(parsed) ? parsed : [parsed]
  } else if (dataKos.image_url) {
    imagesArray = [dataKos.image_url]
  }

  if (imagesArray.length === 0) {
    imagesArray = ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"]
  }

  // State management
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLoved, setIsLoved] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [reviews, setReviews] = useState(reviewsData)

  // Parse facilities from description
  const description = dataKos.description || ""
  const facilitiesMatch = description.match(/Fasilitas: ([^.]+)/)
  const facilitiesList = facilitiesMatch ? facilitiesMatch[1].split(", ").map((f: string) => f.trim()) : []
  const parts = description.split(". ")
  const otherFacilitiesText = parts.length > 1 ? parts.slice(1).join(". ").trim() : ""
  const otherFacilities = otherFacilitiesText ? otherFacilitiesText.split(", ").map((f: string) => f.trim()).filter((f: string) => f) : []
  const allFacilitiesText = [...facilitiesList, ...otherFacilities].filter((f: string) => f)

  const getIcon = (facilityName: string): string => {
    const lower = facilityName.toLowerCase()
    if (lower.includes('parkir')) return 'car'
    if (lower.includes('dapur')) return 'utensils'
    if (lower.includes('wifi')) return 'wifi'
    if (lower.includes('ac')) return 'air-vent'
    if (lower.includes('mandi')) return 'droplet'
    if (lower.includes('kasur')) return 'bed'
    return 'check-circle'
  }

  const facilities = allFacilitiesText.map(name => ({
    name,
    icon: getIcon(name)
  }))

  const property = {
    id: dataKos.id,
    name: dataKos.name,
    location: dataKos.city,
    price: dataKos.price,
    type: (dataKos.gender_type || "campur").toUpperCase(),
    rating: 4.8,
    reviews: reviewsData.length,
    verified: true,
    images: imagesArray,
    description: dataKos.general_description || "Belum ada deskripsi untuk kos ini. Kos ini merupakan pilihan terbaik untuk kenyamanan Anda.",
    facilities: facilities.length > 0 ? facilities : [
      { name: "Sewa Fleksibel", icon: "calendar" },
      { name: "Lokasi Strategis", icon: "map-pin" }
    ],
  }

  useEffect(() => {
    checkIfLoved()
  }, [property.id])

  const checkIfLoved = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('saved_properties').select('*').eq('user_id', session.user.id).eq('property_id', property.id).single()
    if (data) setIsLoved(true)
  }

  const toggleLove = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = "/login"
      return
    }

    if (isLoved) {
      const { error } = await supabase.from('saved_properties').delete().eq('user_id', session.user.id).eq('property_id', property.id)
      if (!error) setIsLoved(false)
    } else {
      const { error } = await supabase.from('saved_properties').insert({ user_id: session.user.id, property_id: property.id })
      if (!error) setIsLoved(true)
    }
  }

  const handleReviewAdded = () => {
    window.location.reload()
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Magazine-style Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            <div className="flex flex-col gap-4">
              <Link href="/">
                <Button variant="ghost" className="w-fit h-10 px-0 hover:bg-transparent group">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary">KEMBALI KE BERANDA</span>
                </Button>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{property.name.toUpperCase()}</h1>
                  <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex items-center gap-6 text-slate-400 font-bold overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase tracking-widest">{property.location}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex items-center gap-2 shrink-0">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs uppercase tracking-widest">{property.rating} ({property.reviews} ULASAN)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="w-12 h-12 rounded-2xl border-slate-200 dark:border-white/10 flex items-center justify-center p-0 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition-all"
                onClick={() => setShowShare(true)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className={`w-12 h-12 rounded-2xl border-slate-200 dark:border-white/10 flex items-center justify-center p-0 transition-all ${isLoved ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                onClick={toggleLove}
              >
                <Heart className={`w-5 h-5 ${isLoved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </motion.div>

          {/* Luxury Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Main Content (Left) */}
            <div className="lg:col-span-8 space-y-12">

              {/* Photo Gallery Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <PhotoGallery images={property.images} selectedIndex={selectedImage} onSelectImage={setSelectedImage} />
              </motion.div>

              {/* Badges & Stats Row */}
              <div className="flex flex-wrap gap-4">
                <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg ${property.type === 'PUTRA' ? 'bg-blue-600 text-white shadow-blue-500/20' :
                  property.type === 'PUTRI' ? 'bg-pink-600 text-white shadow-pink-500/20' :
                    'bg-indigo-600 text-white shadow-indigo-500/20'
                  }`}>
                  <span className="text-lg leading-none">{property.type === 'PUTRA' ? '♂' : property.type === 'PUTRI' ? '♀' : '⚥'}</span>
                  KHUSUS {property.type}
                </div>

                <div className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Navigation className="w-4 h-4 text-primary" />
                  LOKASI STRATEGIS
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white/40 dark:bg-white/5 rounded-[2.5rem] p-10 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Lokasi & Alamat</h3>
                </div>
                <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {dataKos.address || "Alamat lengkap tersedia untuk penyewa yang telah diverifikasi."}
                </p>
                <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dataKos.address || property.location)}`} target="_blank">
                  <Button variant="ghost" className="mt-8 h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 gap-3">
                    LIHAT DI GOOGLE MAPS
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </div>

              {/* Owner Section */}
              <OwnerProfile
                ownerName={ownerData.full_name || "Pemilik Kos"}
                ownerWhatsApp={ownerData.whatsapp}
                propertyName={property.name}
                ownerAvatar={ownerData.avatar_url}
              />

              {/* Facilities Section */}
              <FacilitiesSection facilities={property.facilities} />

              {/* Premium Description */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Tentang Kos</h2>
                  <div className="h-0.5 flex-1 bg-slate-100 dark:bg-white/5" />
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-[1.8]">
                    {property.description}
                  </p>
                </div>
              </div>

              {/* Reviews Experience */}
              <ReviewsSection
                propertyId={property.id}
                reviews={reviews}
                onReviewAdded={handleReviewAdded}
              />
            </div>

            {/* Sidebar (Right) */}
            <aside className="lg:col-span-4 relative">
              <BookingCard
                price={property.price}
                propertyId={property.id}
                ownerWhatsApp={ownerData?.whatsapp}
                ownerName={ownerData?.full_name}
                propertyName={property.name}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <ShareDialog
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url={currentUrl}
        title={property.name}
      />
    </>
  )
}