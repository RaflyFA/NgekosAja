"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

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

interface RoomListTableProps {
    rooms: Room[]
    onEdit: (room: Room) => void
    onDelete: (roomId: string) => void
    onToggleOccupancy: (roomId: string, currentStatus: boolean) => void
    onViewDetail: (room: Room) => void
}

export function RoomListTable({ rooms, onEdit, onDelete, onToggleOccupancy, onViewDetail }: RoomListTableProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd MMM yyyy", { locale: localeId })
        } catch {
            return "-"
        }
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Belum ada kamar. Klik "Tambah Kamar" untuk menambahkan.</p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No. Kamar</TableHead>
                        <TableHead>Lantai</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Harga/Bulan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Penyewa</TableHead>
                        <TableHead>Masa Sewa</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map((room) => (
                        <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.room_number}</TableCell>
                            <TableCell>{room.floor || "-"}</TableCell>
                            <TableCell>{room.room_type || "Standard"}</TableCell>
                            <TableCell>{formatRupiah(room.price_per_month)}</TableCell>
                            <TableCell>
                                {room.is_occupied ? (
                                    <Badge variant="destructive" className="gap-1">
                                        🔴 Terisi
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        🟢 Kosong
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {room.is_occupied && room.tenant_name ? (
                                    <div>
                                        <div className="font-medium">{room.tenant_name}</div>
                                        <div className="text-sm text-muted-foreground">{room.tenant_phone || "-"}</div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {room.rent_start_date && room.rent_end_date ? (
                                    <div className="text-sm">
                                        <div>{formatDate(room.rent_start_date)}</div>
                                        <div className="text-muted-foreground">s/d {formatDate(room.rent_end_date)}</div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetail(room)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Lihat Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(room)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Kamar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onToggleOccupancy(room.id, room.is_occupied)}>
                                            {room.is_occupied ? (
                                                <>
                                                    <UserX className="mr-2 h-4 w-4" />
                                                    Tandai Kosong
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    Tandai Terisi
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(room.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus Kamar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
