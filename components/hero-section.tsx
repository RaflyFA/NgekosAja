"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search } from "lucide-react"

export function HeroSection() {
  const [location, setLocation] = useState("")
  const [kosType, setKosType] = useState("")

  const handleSearch = () => {
    console.log("Searching for:", { location, kosType })
  }

  return (
    <section className="w-full bg-gradient-to-b from-background to-muted/30 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading and Subtext */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 text-balance">
            Temukan Kost Nyaman Impianmu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Ribuan pilihan kost eksklusif di berbagai kota besar
          </p>
        </div>

        {/* Search Component */}
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Pilih kota..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 border-border bg-background"
                />
              </div>
            </div>

            {/* Kos Type Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Tipe Kos</label>
              <Select value={kosType} onValueChange={setKosType}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue placeholder="Pilih tipe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="putra">Putra</SelectItem>
                  <SelectItem value="putri">Putri</SelectItem>
                  <SelectItem value="campur">Campur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex flex-col justify-end">
              <Button
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
              >
                <Search className="w-4 h-4" />
                Cari
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
