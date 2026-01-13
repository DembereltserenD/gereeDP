import { subscribeToPushNotification, unsubscribeFromPushNotification } from '@/lib/actions/notifications'

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null
  private isSupported = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    }
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported')
      return false
    }

    try {
      // Register service worker and wait for it to be ready
      this.swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully')

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready
      console.log('Service Worker is ready')

      // Request notification permission
      const permission = await Notification.requestPermission()
      console.log('Notification permission:', permission)

      return permission === 'granted'
    } catch (error) {
      console.error('Error initializing push notifications:', error)
      return false
    }
  }

  async subscribe(userId: string): Promise<boolean> {
    if (!this.isSupported || !this.swRegistration) {
      console.log('Push notifications not available')
      return false
    }

    try {
      // Wait for service worker to be active
      const activeWorker = this.swRegistration.active
      if (!activeWorker) {
        // Wait for the service worker to become active
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Service worker activation timeout'))
          }, 10000)

          const checkActive = () => {
            if (this.swRegistration?.active) {
              clearTimeout(timeout)
              resolve()
            }
          }

          if (this.swRegistration?.installing) {
            this.swRegistration.installing.addEventListener('statechange', checkActive)
          }
          if (this.swRegistration?.waiting) {
            this.swRegistration.waiting.addEventListener('statechange', checkActive)
          }

          // Also check immediately
          checkActive()
        })
      }

      // Double check we have an active worker
      if (!this.swRegistration.active) {
        console.log('No active service worker available')
        return false
      }

      // Check if already subscribed
      const existingSubscription = await this.swRegistration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('Already subscribed to push notifications')
        return true
      }

      // Check if VAPID key is configured
      const vapidKey = this.getVapidPublicKey()
      if (!vapidKey || vapidKey === 'YOUR_VAPID_PUBLIC_KEY') {
        console.log('VAPID public key not configured, skipping push subscription')
        return false
      }

      // Subscribe to push notifications
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      })

      // Send subscription to server
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      await subscribeToPushNotification({
        user_id: userId,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
      })

      console.log('Successfully subscribed to push notifications')
      return true

    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.isSupported || !this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }

      await unsubscribeFromPushNotification(userId)
      console.log('Successfully unsubscribed from push notifications')
      return true

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    if (!this.isSupported || !this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      return subscription !== null
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  private getVapidPublicKey(): string {
    // This should come from your environment variables
    // For now, return a placeholder - you'll need to set this up with your VAPID keys
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY'
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Send a test notification
  async sendTestNotification(): Promise<void> {
    if (!this.isSupported || !this.swRegistration) {
      console.log('Push notifications not available')
      return
    }

    if (Notification.permission === 'granted') {
      new Notification('Тест мэдэгдэл', {
        body: 'Энэ бол тест мэдэгдэл юм',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  // Schedule periodic background sync
  async schedulePeriodicSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = this.swRegistration as ServiceWorkerRegistration & {
          periodicSync?: {
            register: (tag: string, options: { minInterval: number }) => Promise<void>
          }
        }
        await registration?.periodicSync?.register('check-notifications-daily', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        })
        console.log('Periodic sync registered')
      } catch (error) {
        console.error('Error registering periodic sync:', error)
      }
    }
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService()

// Initialize on app startup
export async function initializePushNotifications(userId: string): Promise<boolean> {
  try {
    const initialized = await pushNotificationService.initialize()
    if (initialized) {
      // Check if user has existing subscription
      const isSubscribed = await pushNotificationService.checkSubscriptionStatus()
      if (!isSubscribed) {
        // Auto-subscribe if not already subscribed - wrap in try-catch to avoid blocking
        try {
          await pushNotificationService.subscribe(userId)
        } catch (subscribeError) {
          console.warn('Could not subscribe to push notifications:', subscribeError)
        }
      }

      // Schedule periodic sync - non-blocking
      pushNotificationService.schedulePeriodicSync().catch(console.warn)
    }
    return initialized
  } catch (error) {
    console.warn('Push notifications initialization failed:', error)
    return false
  }
}

