'use client'

import { useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PushNotificationProviderProps {
  children: React.ReactNode
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Non-blocking initialization - don't await
    const initializeNotifications = async () => {
      try {
        // Dynamic import to avoid blocking
        const { initializePushNotifications } = await import('@/lib/push-notifications')
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Initialize push notifications for the logged-in user (non-blocking)
          initializePushNotifications(user.id).catch(console.warn)
        }
      } catch (error) {
        console.warn('Push notifications not available:', error)
      }
    }

    // Delay initialization to not block page load
    const timeoutId = setTimeout(initializeNotifications, 2000)

    // Set up periodic notification check (non-blocking)
    const checkInterval = setInterval(() => {
      fetch('/api/notifications/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        // Silently ignore errors
      })
    }, 60 * 60 * 1000) // Check every hour

    return () => {
      clearTimeout(timeoutId)
      clearInterval(checkInterval)
    }
  }, [supabase])

  return <>{children}</>
}