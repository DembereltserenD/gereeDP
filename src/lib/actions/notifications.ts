import { createClient } from '@/lib/supabase/client'
import { Notification, NotificationInsert, NotificationUpdate, PushSubscriptionInsert } from '@/types/database'

const supabase = createClient()

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }

  return data || []
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() } as never)
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() } as never)
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

export async function createNotification(notification: NotificationInsert): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }

  return data as Notification
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

export async function subscribeToPushNotification(subscription: PushSubscriptionInsert): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(subscription as never, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

export async function unsubscribeFromPushNotification(userId: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error unsubscribing from push notifications:', error)
    throw error
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread notification count:', error)
    throw error
  }

  return count || 0
}

export function createContractExpiryNotification(contract: {
  id: string
  user_id: string
  customer_name: string
  close_date: string
}): NotificationInsert {
  const daysUntilExpiry = Math.ceil(
    (new Date(contract.close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    user_id: contract.user_id,
    type: 'reminder',
    title: 'Гэрээний хугацаа дуусгавар болж байна',
    message: `"${contract.customer_name}"-ийн гэрээний хугацаа ${daysUntilExpiry} өдрийн дараа дуусна`,
    related_type: 'service_contract',
    related_id: contract.id,
    link: `/service-contracts/${contract.id}`,
    is_read: false
  }
}

export function createMeetingReminderNotification(meeting: {
  id: string
  user_id: string
  customer_name: string
  meeting_date: string
}): NotificationInsert {
  const meetingDate = new Date(meeting.meeting_date)
  const today = new Date()
  const daysUntilMeeting = Math.ceil(
    (meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    user_id: meeting.user_id,
    type: 'reminder',
    title: 'Уулзалтын сануулга',
    message: `"${meeting.customer_name}"-тай ${daysUntilMeeting} өдрийн дараа уулзалт товлогдсон`,
    related_type: 'sales_funnel',
    related_id: meeting.id,
    link: `/sales-funnel/${meeting.id}`,
    is_read: false
  }
}