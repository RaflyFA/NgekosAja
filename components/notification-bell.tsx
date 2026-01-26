"use client"

import { useState, useEffect } from "react"
import { Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getUnreadCount, getUserNotifications, markAsRead, markAllAsRead, deleteNotification, type Notification } from "@/lib/notifications"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                loadNotifications(user.id)
                loadUnreadCount(user.id)
            }
        }
        fetchUser()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUserId(session.user.id)
                loadNotifications(session.user.id)
                loadUnreadCount(session.user.id)
            } else {
                setUserId(null)
                setNotifications([])
                setUnreadCount(0)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // Real-time subscription for new notifications
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    loadNotifications(userId)
                    loadUnreadCount(userId)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const loadNotifications = async (uid: string) => {
        const data = await getUserNotifications(uid, 10)
        setNotifications(data)
    }

    const loadUnreadCount = async (uid: string) => {
        const count = await getUnreadCount(uid)
        setUnreadCount(count)
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
            if (userId) {
                loadNotifications(userId)
                loadUnreadCount(userId)
            }
        }
    }

    const handleMarkAllAsRead = async () => {
        if (!userId) return
        setLoading(true)
        await markAllAsRead(userId)
        loadNotifications(userId)
        loadUnreadCount(userId)
        setLoading(false)
    }

    const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await deleteNotification(notificationId)
        if (userId) {
            loadNotifications(userId)
            loadUnreadCount(userId)
        }
    }

    if (!userId) return null

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={loading}
                            className="text-xs"
                        >
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 border-b cursor-pointer transition-colors hover:bg-secondary/50 ${!notification.is_read ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                                locale: idLocale
                                            })}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                                            className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                            title="Hapus notifikasi"
                                        >
                                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                        </button>
                                    </div>
                                </div>
                                {!notification.is_read && (
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
