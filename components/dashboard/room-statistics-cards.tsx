"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CheckCircle2, XCircle } from "lucide-react"

interface RoomStatisticsCardsProps {
    totalRooms: number
    occupiedRooms: number
    vacantRooms: number
}

export function RoomStatisticsCards({ totalRooms, occupiedRooms, vacantRooms }: RoomStatisticsCardsProps) {
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Kamar */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRooms} Kamar</div>
                    <p className="text-xs text-muted-foreground">
                        Semua kamar terdaftar
                    </p>
                </CardContent>
            </Card>

            {/* Kamar Terisi */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kamar Terisi</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{occupiedRooms} Kamar</div>
                    <p className="text-xs text-muted-foreground">
                        {occupancyRate}% tingkat hunian
                    </p>
                </CardContent>
            </Card>

            {/* Kamar Kosong */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kamar Kosong</CardTitle>
                    <XCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{vacantRooms} Kamar</div>
                    <p className="text-xs text-muted-foreground">
                        Siap disewakan
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
