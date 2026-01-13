import { PropertyCard } from "@/components/property-card"

interface Property {
  id: string
  name: string
  city: string
  price_per_month: number
  image_url: string
  rating?: number
  category?: string
}

export function PropertyListing({ properties = [] }: { properties: any[] }) {
  
  return (
    <section className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Rekomendasi Kost Pilihan</h2>
          <p className="text-muted-foreground">Temukan kost nyaman dengan fasilitas lengkap di lokasi strategis.</p>
        </div>
        
        {/* 3. Looping data asli dari database */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.length > 0 ? (
            properties.map((kos) => (
              <PropertyCard 
                key={kos.id} 
                property={{
                  
                  id: kos.id,
                  name: kos.name,
                  location: kos.city, 
                  price: kos.price_per_month,
                  image: kos.image_url || "/placeholder.svg",
                  rating: 4.8,
                  type: (kos.category || "campur").toLowerCase() as any,
                }} 
              />
            ))
          ) : (
             <p>Belum ada data kost.</p>
          )}
        </div>
      </div>
    </section>
  )
}