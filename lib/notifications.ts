import { supabase } from "./supabase"

export type NotificationType =
    | 'booking_submitted'
    | 'booking_approved'
    | 'booking_rejected'
    | 'payment_uploaded'
    | 'payment_confirmed'
    | 'termination_requested'
    | 'termination_approved'
    | 'termination_rejected'

export interface Notification {
    id: string
    user_id: string
    title: string
    description: string
    type: NotificationType
    related_id: string | null
    is_read: boolean
    created_at: string
}

// Create a new notification using database function to bypass RLS
export async function createNotification(
    userId: string,
    title: string,
    description: string,
    type: NotificationType,
    relatedId?: string
) {
    // Use RPC to call the database function which bypasses RLS
    const { data, error } = await supabase
        .rpc('create_notification', {
            p_user_id: userId,
            p_title: title,
            p_description: description,
            p_type: type,
            p_related_id: relatedId || null,
        })

    if (error) {
        console.error('Error creating notification:', error)
        return null
    }

    return data
}

// Get user notifications
export async function getUserNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }

    return data as Notification[]
}

// Get unread count
export async function getUnreadCount(userId: string) {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

    if (error) {
        console.error('Error getting unread count:', error)
        return 0
    }

    return count || 0
}

// Mark notification as read
export async function markAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    if (error) {
        console.error('Error marking notification as read:', error)
        return false
    }

    return true
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all as read:', error)
        return false
    }

    return true
}

// Delete notification
export async function deleteNotification(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

    if (error) {
        console.error('Error deleting notification:', error)
        return false
    }

    return true
}
