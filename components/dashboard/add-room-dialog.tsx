"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface AddRoomDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kosId: string
    onSuccess: () => void
}

export function AddRoomDialog({ open, onOpenChange, kosId, onSuccess }: AddRoomDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        room_number: "",
        floor: "",
        room_type: "Standard",
        price_per_month: "",
        notes: ""
    })

    const [facilities, setFacilities] = useState<string[]>([])

    const facilityOptions = [
        { id: "ac", label: "AC" },
        { id: "wifi", label: "WiFi" },
        { id: "kasur", label: "Kasur" },
        { id: "lemari", label: "Lemari" },
        { id: "meja", label: "Meja Belajar" },
        { id: "kursi", label: "Kursi" },
        { id: "kamar_mandi_dalam", label: "Kamar Mandi Dalam" },
    ]

    const handleFacilityChange = (facilityId: string, checked: boolean) => {
        if (checked) {
            setFacilities([...facilities, facilityId])
        } else {
            setFacilities(facilities.filter(f => f !== facilityId))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('rooms')
                .insert({
                    kos_id: kosId,
                    room_number: formData.room_number,
                    floor: formData.floor ? parseInt(formData.floor) : null,
                    room_type: formData.room_type,
                    price_per_month: parseInt(formData.price_per_month),
                    facilities: facilities,
                    notes: formData.notes || null
                })

            if (error) throw error

            alert("✅ Kamar berhasil ditambahkan!")

            // Reset form
            setFormData({
                room_number: "",
                floor: "",
                room_type: "Standard",
                price_per_month: "",
                notes: ""
            })
            setFacilities([])

            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            alert("❌ Gagal menambahkan kamar: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Kamar Baru</DialogTitle>
                    <DialogDescription>
                        Isi informasi kamar yang akan ditambahkan
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room_number">Nomor Kamar *</Label>
                        <Input
                            id="room_number"
                            placeholder="Contoh: 101, A1, dll"
                            value={formData.room_number}
                            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="floor">Lantai</Label>
                        <Input
                            id="floor"
                            type="number"
                            placeholder="1, 2, 3, ..."
                            value={formData.floor}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="room_type">Tipe Kamar</Label>
                        <Select value={formData.room_type} onValueChange={(value) => setFormData({ ...formData, room_type: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="Premium">Premium</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="Deluxe">Deluxe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Harga per Bulan (Rp) *</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="1500000"
                            value={formData.price_per_month}
                            onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fasilitas Kamar</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {facilityOptions.map((facility) => (
                                <div key={facility.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={facility.id}
                                        checked={facilities.includes(facility.id)}
                                        onCheckedChange={(checked) => handleFacilityChange(facility.id, checked as boolean)}
                                    />
                                    <label
                                        htmlFor={facility.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {facility.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea
                            id="notes"
                            placeholder="Catatan tambahan tentang kamar ini..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Kamar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
