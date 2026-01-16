
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PropertyListing } from "@/components/property-listing"
import { supabase } from "@/lib/supabase"

export const revalidate = 0
export default async function Home() {
  const { data: kosan, error } = await supabase
    .from('boarding_houses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data:", error)
  } else {
    console.log("Berhasil! Data dari Supabase:", kosan)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PropertyListing properties={kosan || []} />
    </main>
  )
}
