"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoomStatisticsCards } from "@/components/dashboard/room-statistics-cards"
import { RoomListTable } from "@/components/dashboard/room-list-table"
import { AddRoomDialog } from "@/components/dashboard/add-room-dialog"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Plus } from "lucide-react"

interface BoardingHouse {
    id: string
    name: string
}

interface Room {
    id: string
    room_number: string
    floor: number | null
    room_type: string | null
    price_per_month: number
    is_occupied: boolean
    tenant_name: string | null
    tenant_phone: string | null
    rent_start_date: string | null
    rent_end_date: string | null
}

export default function RoomManagementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
    const [selectedKosId, setSelectedKosId] = useState<string>("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    const fetchBoardingHouses = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            const { data, error } = await supabase
                .from('boarding_houses')
                .select('id, name')
                .eq('owner_id', session.user.id)
                .order('name')

            if (error) throw error
            setBoardingHouses(data || [])

            if (data && data.length > 0 && !selectedKosId) {
                setSelectedKosId(data[0].id)
            }
        } catch (error) {
            console.error("Error fetching boarding houses:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRooms = async () => {
        if (!selectedKosId) {
            setRooms([])
            return
        }

        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('kos_id', selectedKosId)
                .order('room_number')

            if (error) throw error
            setRooms(data || [])
        } catch (error) {
            console.error("Error fetching rooms:", error)
        }
    }

    useEffect(() => {
        fetchBoardingHouses()
    }, [])

    useEffect(() => {
        if (selectedKosId) {
            fetchRooms()
        }
    }, [selectedKosId])

    const handleEdit = (room: Room) => {
        alert("Edit room feature coming soon! Room: " + room.room_number)
    }

    const handleDelete = async (roomId: string) => {
        if (!confirm("Yakin ingin menghapus kamar ini?")) return

        try {
            const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId)

            if (error) throw error
            alert("✅ Kamar berhasil dihapus")
            fetchRooms()
        } catch (error: any) {
            alert("❌ Gagal menghapus kamar: " + error.message)
        }
    }

    const handleToggleOccupancy = async (roomId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        const action = newStatus ? "terisi" : "kosong"

        try {
            const updateData: any = { is_occupied: newStatus }

            if (!newStatus) {
                updateData.tenant_id = null
                updateData.tenant_name = null
                updateData.tenant_phone = null
                updateData.rent_start_date = null
                updateData.rent_end_date = null
            }

            const { error } = await supabase
                .from('rooms')
                .update(updateData)
                .eq('id', roomId)

            if (error) throw error
            alert(`✅ Kamar ditandai ${action}`)
            fetchRooms()
        } catch (error: any) {
            alert("❌ Gagal mengubah status: " + error.message)
        }
    }

    const handleViewDetail = (room: Room) => {
        alert(`Detail kamar ${room.room_number}\\n\\nFitur detail view coming soon!`)
    }

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.is_occupied).length
    const vacantRooms = totalRooms - occupiedRooms

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Memuat...</p>
            </div>
        )
    }

    if (boardingHouses.length === 0) {
        return (
            <div className="flex h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto lg:ml-64">
                    <div className="p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center py-12 border rounded-lg bg-muted/30">
                                <h2 className="text-xl font-bold mb-2">Belum Ada Kosan</h2>
                                <p className="text-muted-foreground mb-4">
                                    Anda belum memiliki kosan terdaftar. Tambahkan kosan terlebih dahulu.
                                </p>
                                <Button onClick={() => router.push("/dashboard/add-property")}>
                                    Tambah Kosan Baru
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto lg:ml-64">
                <div className="p-6 lg:p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Kelola Kamar</h1>
                        <p className="text-muted-foreground">Manajemen kamar untuk setiap kosan</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Pilih Kosan:</label>
                            <Select value={selectedKosId} onValueChange={setSelectedKosId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih kosan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {boardingHouses.map((kos) => (
                                        <SelectItem key={kos.id} value={kos.id}>
                                            {kos.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-6">
                            <Button onClick={() => setAddDialogOpen(true)} disabled={!selectedKosId}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kamar
                            </Button>
                        </div>
                    </div>

                    {selectedKosId && (
                        <RoomStatisticsCards
                            totalRooms={totalRooms}
                            occupiedRooms={occupiedRooms}
                            vacantRooms={vacantRooms}
                        />
                    )}

                    {selectedKosId && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Daftar Kamar</h2>
                            <RoomListTable
                                rooms={rooms}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleOccupancy={handleToggleOccupancy}
                                onViewDetail={handleViewDetail}
                            />
                        </div>
                    )}

                    <AddRoomDialog
                        open={addDialogOpen}
                        onOpenChange={setAddDialogOpen}
                        kosId={selectedKosId}
                        onSuccess={fetchRooms}
                    />
                </div>
            </main>
        </div>
    )
}
