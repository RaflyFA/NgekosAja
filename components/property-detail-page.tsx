"use client"

import { useState } from "react"
import { PhotoGallery } from "./photo-gallery"
import { FacilitiesSection } from "./facilities-section"
import { BookingCard } from "./booking-card"

export function PropertyDetailPage({ dataKos }: { dataKos: any }) {
  
  const property = {
    id: dataKos.id,
    name: dataKos.name,
    location: dataKos.city,
    price: dataKos.price_per_month, 
    type: (dataKos.category || "Campur"), 
    rating: 4.8, 
    reviews: 15,
    verified: true,
    
    // PENTING: Supabase cuma punya 1 gambar (string), tapi Gallery butuh Array (list).
    // Jadi kita bungkus dalam kurung siku [ ]
    images: dataKos.image_url 
      ? [dataKos.image_url, "/placeholder.svg"] // Jika ada gambar, pakai. Tambah placeholder biar gallery gak sepi.
      : ["/placeholder.svg"], 

    description: dataKos.description || "Belum ada deskripsi untuk kos ini.",

    // Fasilitas kita biarkan default dulu karena format di DB mungkin berbeda
    facilities: [
      { name: "WiFi", icon: "wifi" },
      { name: "AC", icon: "air-vent" },
      { name: "Parkir", icon: "car" },
      { name: "Kamar Mandi Dalam", icon: "droplet" },
      { name: "Dapur", icon: "utensils" },
      { name: "Keamanan 24 Jam", icon: "shield" },
    ],
  }

  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 70% on desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <PhotoGallery images={property.images} selectedIndex={selectedImage} onSelectImage={setSelectedImage} />

            {/* Title Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{property.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {property.verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.048A3.066 3.066 0 006.267 3.455zm9.8 2.908a3.066 3.066 0 11-4.321 4.321 3.066 3.066 0 014.321-4.32zm7.34 5.24a6.218 6.218 0 10-9.86 7.465h5.676a4.119 4.119 0 001.946-7.465z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Terverifikasi
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                      ⭐ {property.rating} ({property.reviews} ulasan)
                    </span>
                    {/* Menampilkan Tipe Kos (Putra/Putri) */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium uppercase">
                      {property.type}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {property.location}
              </p>
            </div>

            {/* Facilities Section */}
            <FacilitiesSection facilities={property.facilities} />

            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Deskripsi Kost</h2>
              <p className="text-foreground leading-relaxed text-base">{property.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingCard price={property.price} propertyId={property.id} />
          </div>
        </div>
      </div>
    </main>
  )
}