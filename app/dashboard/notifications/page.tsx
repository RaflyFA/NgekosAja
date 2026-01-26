"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, CheckCheck } from "lucide-react"
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, type Notification } from "@/lib/notifications"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function NotificationsPage() {
    const { toast } = useToast()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                loadNotifications(user.id)
            }
        }
        loadUser()
    }, [])

    // Real-time subscription
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel('notifications-page')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    if (userId) loadNotifications(userId)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const loadNotifications = async (uid: string) => {
        setLoading(true)
        const data = await getUserNotifications(uid, 50)
        setNotifications(data)
        setLoading(false)
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
            if (userId) {
                loadNotifications(userId)
            }
        }
    }

    const handleMarkAllAsRead = async () => {
        if (!userId) return
        await markAllAsRead(userId)
        loadNotifications(userId)
        toast({
            title: "Berhasil",
            description: "Semua notifikasi ditandai sudah dibaca"
        })
    }

    const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await deleteNotification(notificationId)
        if (userId) {
            loadNotifications(userId)
        }
        toast({
            title: "Berhasil",
            description: "Notifikasi dihapus"
        })
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />

            <main className="flex-1 lg:ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Notifikasi</h1>
                            <p className="text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
                                <CheckCheck className="w-4 h-4" />
                                Tandai Semua Dibaca
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    Memuat notifikasi...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">Belum ada notifikasi</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${!notification.is_read ? 'bg-primary/5' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                                            }`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatDistanceToNow(new Date(notification.created_at), {
                                                            addSuffix: true,
                                                            locale: idLocale
                                                        })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                    className="p-2 hover:bg-destructive/10 rounded transition-colors"
                                                    title="Hapus notifikasi"
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
