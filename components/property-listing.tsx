import { PropertyCard } from "@/components/property-card"

export function PropertyListing({ properties = [] }: { properties: any[] }) {
  
  return (
    <section className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Rekomendasi Kost Pilihan</h2>
          <p className="text-muted-foreground">Temukan kost nyaman dengan fasilitas lengkap di lokasi strategis.</p>
        </div>
        
        {/* Looping data asli dari database */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.length > 0 ? (
            properties.map((kos) => (
              <PropertyCard 
                key={kos.id} 
                property={{
                  id: kos.id,
                  name: kos.name,     // Sesuai DB
                  location: kos.city, // Sesuai DB
                  
                  // PERBAIKAN UTAMA DI SINI:
                  // Gunakan 'kos.price' (sesuai database), BUKAN 'price_per_month'
                  price: kos.price, 
                  
                  // Gunakan gambar dari DB, kalau kosong pakai placeholder
                  image: kos.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
                  
                  rating: 4.8, // Hardcode dulu karena belum ada sistem rating
                  type: "campur", // Default dulu
                }} 
              />
            ))
          ) : (
             <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Belum ada data kost yang tersedia.</p>
             </div>
          )}
        </div>
      </div>
    </section>
  )
}