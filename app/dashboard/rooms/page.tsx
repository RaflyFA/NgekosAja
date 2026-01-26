"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoomStatisticsCards } from "@/components/dashboard/room-statistics-cards"
import { RoomListTable } from "@/components/dashboard/room-list-table"
import { AddRoomDialog } from "@/components/dashboard/add-room-dialog"
import { AddBulkRoomsDialog } from "@/components/dashboard/add-bulk-rooms-dialog"
import { RoomDetailDialog } from "@/components/dashboard/room-detail-dialog"
import { EditRoomDialog } from "@/components/dashboard/edit-room-dialog"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Plus, LayoutDashboard, Search, Filter, Warehouse, Sparkles, Loader2, Info } from "lucide-react"
import { ModalAlert } from "@/components/ui/modal-alert"
import { motion, AnimatePresence } from "framer-motion"

interface BoardingHouse { id: string; name: string; }
interface Room { id: string; room_number: string; floor: number | null; room_type: string | null; price_per_month: number; is_occupied: boolean; tenant_name: string | null; tenant_phone: string | null; rent_start_date: string | null; rent_end_date: string | null; }

export default function RoomManagementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
    const [selectedKosId, setSelectedKosId] = useState<string>("")
    const [rooms, setRooms] = useState<Room[]>([])
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addBulkDialogOpen, setAddBulkDialogOpen] = useState(false)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" | "warning"; }>({ isOpen: false, title: "", message: "", type: "info" });
    const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => setAlertConfig({ isOpen: true, title, message, type });

    const fetchBoardingHouses = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push("/login"); return }
            const { data, error } = await supabase.from('boarding_houses').select('id, name').eq('owner_id', session.user.id).order('name')
            if (error) throw error
            setBoardingHouses(data || [])
            if (data && data.length > 0 && !selectedKosId) setSelectedKosId(data[0].id)
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const fetchRooms = async () => {
        if (!selectedKosId) { setRooms([]); return }
        try {
            const { data, error } = await supabase.from('rooms').select('*').eq('kos_id', selectedKosId).order('room_number')
            if (error) throw error
            setRooms(data || [])
        } catch (error) { console.error(error) }
    }

    useEffect(() => { fetchBoardingHouses() }, [])
    useEffect(() => { if (selectedKosId) fetchRooms() }, [selectedKosId])

    const handleEdit = (room: Room) => { setSelectedRoom(room); setEditDialogOpen(true); }
    const handleDelete = async (roomId: string) => {
        if (!confirm("Yakin ingin menghapus kamar ini?")) return
        try {
            const { error } = await supabase.from('rooms').delete().eq('id', roomId)
            if (error) throw error
            showAlert("Berhasil", "Unit telah dihapus dari aset digital.", "success")
            fetchRooms()
        } catch (error: any) { showAlert("Gagal", error.message, "error") }
    }

    const handleToggleOccupancy = async (roomId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        try {
            const updateData: any = { is_occupied: newStatus }
            if (!newStatus) {
                updateData.tenant_id = null; updateData.tenant_name = null; updateData.tenant_phone = null;
                updateData.rent_start_date = null; updateData.rent_end_date = null;
            }
            await supabase.from('rooms').update(updateData).eq('id', roomId)
            showAlert("Unit Updated", `Status unit berhasil diubah menjadi ${newStatus ? 'Terisi' : 'Kosong'}.`, "success")
            fetchRooms()
        } catch (error: any) { showAlert("Gagal", error.message, "error") }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
            <DashboardSidebar />

            <main className="flex-1 overflow-auto lg:ml-72 no-scrollbar">
                <div className="p-8 lg:p-14 space-y-14 max-w-7xl mx-auto">

                    {/* Console Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Warehouse className="w-8 h-8 text-primary" />
                                <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">Inventory <span className="text-primary not-italic">Console</span></h1>
                            </div>
                            <p className="text-slate-500 font-bold max-w-xl">Precision management for your dwelling units. Monitor capacity, occupation, and lease lifecycles.</p>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => setAddDialogOpen(true)} disabled={!selectedKosId} className="h-14 px-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 text-slate-950 dark:text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> UNIT SATUAN
                            </Button>
                            <Button onClick={() => setAddBulkDialogOpen(true)} disabled={!selectedKosId} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> BATCH IMPORT
                            </Button>
                        </div>
                    </div>

                    {/* Selector Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white dark:border-white/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />
                        <div className="relative z-10 max-w-md space-y-4">
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PROPERTI AKTIF</label>
                            </div>
                            <Select value={selectedKosId} onValueChange={setSelectedKosId}>
                                <SelectTrigger className="w-full h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border-none px-8 font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 shadow-inner">
                                    <SelectValue placeholder="PILIH PROPERTI" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/10 glass-card">
                                    {boardingHouses.map((kos) => (
                                        <SelectItem key={kos.id} value={kos.id} className="font-bold text-xs uppercase tracking-widest p-4">
                                            {kos.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-1">
                                <Info className="w-3 h-3" />
                                Switch between your property assets
                            </div>
                        </div>
                    </motion.div>

                    {selectedKosId ? (
                        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <RoomStatisticsCards
                                totalRooms={rooms.length}
                                occupiedRooms={rooms.filter(r => r.is_occupied).length}
                                vacantRooms={rooms.length - rooms.filter(r => r.is_occupied).length}
                            />

                            <div className="space-y-10">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-8">
                                    <div className="flex items-center gap-4">
                                        <LayoutDashboard className="w-8 h-8 text-primary" />
                                        <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Live Inventory</h2>
                                    </div>
                                    <div className="px-5 py-2 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">
                                        {rooms.length} TOTAL UNITS
                                    </div>
                                </div>

                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl">
                                    <RoomListTable
                                        rooms={rooms}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleOccupancy={handleToggleOccupancy}
                                        onViewDetail={(room) => { setSelectedRoom(room); setDetailDialogOpen(true); }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-40 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                            <Warehouse className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">SELECT PROPERTY TO DISPLAY CONSOLE</h3>
                        </div>
                    )}
                </div>
            </main>

            {/* Management Dialogs Unchanged Logic - Redesign within Dialogs planned next */}
            <AddRoomDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} kosId={selectedKosId} onSuccess={fetchRooms} />
            <RoomDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} room={selectedRoom} />
            <EditRoomDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} room={selectedRoom} onSuccess={fetchRooms} />
            <AddBulkRoomsDialog open={addBulkDialogOpen} onOpenChange={setAddBulkDialogOpen} kosId={selectedKosId} onSuccess={fetchRooms} />

            <ModalAlert isOpen={alertConfig.isOpen} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} />
        </div>
    )
}
