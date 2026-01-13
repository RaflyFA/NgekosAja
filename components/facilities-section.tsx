import type React from "react"
import { Wifi, Wind, Car, Droplet, UtensilsCrossed, Sofa, Shield, Shirt } from "lucide-react"

interface Facility {
  name: string
  icon: string
}

interface FacilitiesSectionProps {
  facilities: Facility[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  "air-vent": Wind,
  car: Car,
  droplet: Droplet,
  utensils: UtensilsCrossed,
  sofa: Sofa,
  shield: Shield,
  shirt: Shirt,
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Fasilitas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {facilities.map((facility, index) => {
          const IconComponent = iconMap[facility.icon] || Wifi
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
            >
              <IconComponent className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground text-center">{facility.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
