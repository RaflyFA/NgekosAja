import { Star } from "lucide-react"
import Link from "next/link"

interface PropertyCardProps {
  property: {
    id: string
    name: string
    location: string
    price: number
    type: "putra" | "putri" | "campur"
    rating: number
    image: string
  }
}

const typeColors = {
  putra: "bg-blue-100 text-blue-800",
  putri: "bg-pink-100 text-pink-800",
  campur: "bg-purple-100 text-purple-800",
}

const typeLabels = {
  putra: "Putra",
  putri: "Putri",
  campur: "Campur",
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/kos/${property.id}`}>
    <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img src={property.image || "/placeholder.svg"} alt={property.name} className="w-full h-full object-cover" />
        {/* Type Badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${typeColors[property.type]}`}
        >
          {typeLabels[property.type]}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-foreground text-base mb-1 line-clamp-2">{property.name}</h3>

        {/* Location */}
        <p className="text-sm text-muted-foreground mb-3">{property.location}</p>

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-primary">
            {formatPrice(property.price)}
            <span className="text-xs font-normal text-muted-foreground ml-1">/bulan</span>
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-foreground">{property.rating}</span>
        </div>
      </div>
    </div>
    </Link>
  )
}
