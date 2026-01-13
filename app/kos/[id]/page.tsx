import { supabase } from "@/lib/supabase"
import { PropertyDetailPage } from "@/components/property-detail-page"

// Perhatikan tipe data 'params' di sini berubah menjadi Promise
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. WAJIB: Kita harus 'await' params dulu di Next.js 15
  const { id } = await params 

  // 2. Ambil data dari database berdasarkan ID yang sudah didapat
  const { data: detailKos, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id) // Gunakan variable 'id' yang sudah di-await
    .single()

  // Cek terminal
  if (detailKos) {
    console.log("✅ Berhasil ambil detail kos:", detailKos.name)
  } else {
    console.error("❌ Gagal ambil data:", error)
  }

 return (
    <main>
      {/* SEBELUMNYA: <PropertyDetailPage propertyId={id} /> */}
      
      {/* UBAH JADI INI: Kita kirim seluruh data 'detailKos' ke dalam props bernama 'dataKos' */}
      <PropertyDetailPage dataKos={detailKos} />
    </main>
  )
}