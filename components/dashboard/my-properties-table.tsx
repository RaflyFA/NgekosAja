"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation" // <--- Import Router

interface Property {
  id: string
  name: string
  price: number
  city: string
  image_url: string
}

export function MyPropertiesTable({ properties, onDelete }: { properties: Property[], onDelete: () => void }) {
  const router = useRouter() // <--- Inisialisasi Router
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kos ini? Data tidak bisa kembali.")) return;

    setLoadingId(id)
    try {
      const { error } = await supabase
        .from('boarding_houses')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert("Kos berhasil dihapus!")
      onDelete() 

    } catch (error: any) {
      alert("Gagal hapus: " + error.message)
    } finally {
      setLoadingId(null)
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Nama Kos</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Belum ada kos yang didaftarkan.
                    </td>
                </tr>
            ) : (
                properties.map((kos) => (
                <tr key={kos.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                    <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={kos.image_url || "/placeholder.svg"} 
                            alt={kos.name} 
                            className="object-cover w-full h-full"
                        />
                    </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{kos.name}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatRupiah(kos.price)}</td>
                    <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {kos.city}
                        </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                        {/* Tombol Edit: SEKARANG BERFUNGSI! */}
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600" 
                            onClick={() => router.push(`/dashboard/edit-property/${kos.id}`)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        
                        {/* Tombol Hapus */}
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200"
                            onClick={() => handleDelete(kos.id)}
                            disabled={loadingId === kos.id}
                        >
                        {loadingId === kos.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        </Button>
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}