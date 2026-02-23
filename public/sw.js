// Service Worker for Push Notifications
const CACHE_NAME = 'sales-crm-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline.html'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Let the browser handle navigation requests so middleware redirects work correctly
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    )
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push event received')
  
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (error) {
    console.error('Error parsing push data:', error)
  }

  const title = data.title || 'Шинэ мэдэгдэл'
  const options = {
    body: data.body || 'Танд шинэ мэдэгдэл ирсэн байна',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'notification',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'Үзэх'
      },
      {
        action: 'dismiss',
        title: 'Хаах'
      }
    ],
    requireInteraction: true
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked')
  
  event.notification.close()

  // Handle action button clicks
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Background sync for periodic tasks
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNotifications())
  }
})

// Function to check for notifications
async function checkNotifications() {
  try {
    const response = await fetch('/api/notifications/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Notifications checked:', data)
    }
  } catch (error) {
    console.error('Error checking notifications:', error)
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications-daily') {
    event.waitUntil(checkNotifications())
  }
})