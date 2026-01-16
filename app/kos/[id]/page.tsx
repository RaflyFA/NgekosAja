import { supabase } from "@/lib/supabase"
import { PropertyDetailPage } from "@/components/property-detail-page"

// PENTING: Paksa halaman ini untuk selalu ambil data terbaru (tidak cache)
export const revalidate = 0 

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Ambil ID dari URL
  const { id } = await params 

  // 2. PERBAIKAN UTAMA:
  // Ubah 'properties' menjadi 'boarding_houses' (Tabel yang benar)
  const { data: detailKos, error } = await supabase
    .from('boarding_houses')
    .select('*')
    .eq('id', id)
    .single()

  // 3. Cek Error / Kosong
  if (error || !detailKos) {
    console.error("❌ Gagal ambil data:", error)
    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-xl font-bold text-red-500">
                Kos tidak ditemukan atau ID salah.
            </h1>
        </div>
    )
  }

  console.log("✅ Berhasil ambil detail kos:", detailKos.name)

  return (
    <main>
      {/* Kirim data kos yang berhasil diambil ke komponen tampilan */}
      <PropertyDetailPage dataKos={detailKos} />
    </main>
  )
}