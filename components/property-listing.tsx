import { PropertyCard } from "@/components/property-card"

export function PropertyListing({ properties = [] }: { properties: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {properties.length > 0 ? (
        properties.map((kos) => {
          // Parse images array - support both new JSONB and old image_url
          let imageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
          if (kos.images) {
            const images = typeof kos.images === 'string' ? JSON.parse(kos.images) : kos.images
            imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : imageUrl
          } else if (kos.image_url) {
            imageUrl = kos.image_url
          }

          return (
            <PropertyCard
              key={kos.id}
              property={{
                id: kos.id,
                name: kos.name,
                location: kos.city,
                price: kos.price,
                image: imageUrl,
                rating: 4.8,
                type: kos.gender_type || "campur",
              }}
            />
          )
        })
      ) : (
        <div className="col-span-full text-center py-20 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada data kost yang tersedia di wilayah ini.</p>
        </div>
      )}
    </div>
  )
}