# Web Push Notifications

Push notifications allow you to re-engage users even when they're not actively using your app. Supported in all modern browsers including iOS 16.4+ (home screen installed apps) and Safari 16+ for macOS 13+.

## How it works

```
App → Push Service → Browser → Service Worker → Notification
```

1. Client subscribes to push with VAPID public key
2. Subscription (endpoint + keys) is sent to server
3. Server uses `web-push` library to send notification via push service
4. Browser wakes up service worker
5. Service worker shows notification

## VAPID keys

**V**oluntary **A**pplication Server **Id**entification — identifies your server to push services.

### Generate keys
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Output:
```
=======================================
Public Key:
BExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
=======================================
```

### Add to `.env`
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BExxxxxxxxxxxxx...
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxx...
```

The public key prefix `NEXT_PUBLIC_` makes it available to client code for subscription.

## Client-side: Subscribe

```tsx
// Utility: convert VAPID base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeUser() {
  // Wait for service worker
  const registration = await navigator.serviceWorker.ready

  // Check existing subscription
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
  }

  // Send subscription to server
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  })

  return subscription
}
```

## Server-side: Send notification

```ts
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  keys: {
    p256dh: '...',
    auth: '...',
  },
}

await webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: 'Hello!',
    body: 'This is a push notification.',
    icon: '/icon-192x192.png',
    badge: '/badge-96x96.png',
    image: '/notification-image.png',
    vibrate: [200, 100, 200],
    tag: 'unique-tag',
    data: {
      url: '/some-page',
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  })
)
```

### Using Next.js Server Actions

```ts
// app/actions.ts
'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
  '<mailto:your@email.com>',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// In production, store subscriptions in a database
let subscription: PushSubscription | null = null

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) throw new Error('No subscription available')
  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: 'Notification',
      body: message,
      icon: '/icon.png',
    })
  )
  return { success: true }
}
```

## Service worker: Handle events

```js
// public/sw.js

self.addEventListener('push', function (event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    image: data.image,
    vibrate: data.vibrate || [100, 50, 100],
    tag: data.tag,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: false,
    renotify: false,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
```

## Notification options

| Option | Description |
|--------|-------------|
| `title` | Notification title (required) |
| `body` | Body text |
| `icon` | Notification icon |
| `badge` | Monochrome badge icon (Android) |
| `image` | Large image in notification |
| `vibrate` | Vibration pattern array `[200, 100, 200]` |
| `tag` | Replace existing notification with same tag |
| `data` | Arbitrary data for click handler |
| `actions` | Array of `{ action, title, icon? }` |
| `requireInteraction` | Stay until user dismisses |
| `renotify` | Notify even if tag matches existing |
| `silent` | No sound/vibration |

## Browser support

| Browser | Push | Notification |
|---------|------|-------------|
| Chrome | Yes | Yes |
| Firefox | Yes | Yes |
| Edge | Yes | Yes |
| Safari 16+ (macOS 13+) | Yes | Yes |
| iOS Safari 16.4+ (PWA installed) | Yes | Yes |
| Opera | Yes | Yes |

## Testing

1. Run locally with HTTPS: `next dev --experimental-https`
2. Accept notification permission when prompted
3. Test subscription flow
4. Test notification delivery
5. Test notification click behavior
6. Test unsubscribe flow
7. Always test in incognito for clean state

## Production considerations

1. **Store subscriptions** in a database (not in memory)
2. **Handle multiple subscriptions** per user (different devices)
3. **Handle expired subscriptions** (push service returns 410 Gone)
4. **Rate limit** notification sending
5. **Handle errors gracefully**: `webpush.sendNotification` can throw
6. **Set up a mailto** in `vapidDetails` (required by spec)
7. **Request permission at appropriate time** — not on first load
8. **Provide clear opt-out** mechanism
