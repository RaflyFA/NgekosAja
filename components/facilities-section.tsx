import type React from "react"
import { Wifi, Wind, Car, Droplet, UtensilsCrossed, Sofa, Shield, Shirt, Bath, BedDouble, Archive, Tv, Refrigerator, WashingMachine, CookingPot, Bike, Home, Coffee, Utensils, Box, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface Facility {
  name: string
  icon: string
}

interface FacilitiesSectionProps {
  facilities: Facility[]
}

const iconMapByName: Record<string, React.ComponentType<{ className?: string }>> = {
  "wifi": Wifi,
  "ac": Wind,
  "kamar mandi dalam": Bath,
  "kasur": BedDouble,
  "lemari": Archive,
  "tv": Tv,
  "kulkas": Refrigerator,
  "mesin cuci": WashingMachine,
  "dapur": CookingPot,
  "dapur bersama": CookingPot,
  "parkir motor": Bike,
  "parkir mobil": Car,
  "keamanan": Shield,
  "keamanan 24 jam": Shield,
  "laundry": Shirt,
  "kopi gratis": Coffee,
  "makan": Utensils,
  "sofa": Sofa,
  "air panas": Droplet,
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
  bath: Bath,
  bed: BedDouble,
  archive: Archive,
}

function getIconForFacility(facility: Facility): React.ComponentType<{ className?: string }> {
  if (facility.icon && iconMap[facility.icon]) return iconMap[facility.icon]
  const nameLower = facility.name.toLowerCase().trim()
  if (iconMapByName[nameLower]) return iconMapByName[nameLower]
  if (nameLower.includes("wifi")) return Wifi
  if (nameLower.includes("ac") || nameLower.includes("pendingin")) return Wind
  if (nameLower.includes("mandi") || nameLower.includes("bathroom")) return Bath
  if (nameLower.includes("kasur") || nameLower.includes("bed") || nameLower.includes("tidur")) return BedDouble
  if (nameLower.includes("lemari") || nameLower.includes("wardrobe") || nameLower.includes("almari")) return Archive
  if (nameLower.includes("dapur") || nameLower.includes("kitchen") || nameLower.includes("masak")) return CookingPot
  if (nameLower.includes("parkir") || nameLower.includes("motor") || nameLower.includes("bike")) return Bike
  if (nameLower.includes("mobil") || nameLower.includes("car")) return Car
  if (nameLower.includes("tv") || nameLower.includes("televisi")) return Tv
  if (nameLower.includes("kulkas") || nameLower.includes("refrigerator")) return Refrigerator
  if (nameLower.includes("cuci") || nameLower.includes("laundry")) return WashingMachine
  if (nameLower.includes("keamanan") || nameLower.includes("security") || nameLower.includes("satpam")) return Shield
  if (nameLower.includes("air panas") || nameLower.includes("water heater")) return Droplet
  return Box
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fasilitas Eksklusif</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {facilities.map((facility, index) => {
          const IconComponent = getIconForFacility(facility)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest leading-tight">{facility.name}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
