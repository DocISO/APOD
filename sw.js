const CACHE_NAME = 'apod-v1';
const ASSETS = ['./index.html', './manifest.json'];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch (cache-first for app shell, network-first for NASA API) ─────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'api.nasa.gov') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() ?? { title: 'APOD', body: 'Das neue Astronomie-Bild wartet auf dich! 🌌' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'apod-daily',
      renotify: true,
      data: { url: './' }
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});

// ── Scheduled local reminder (alarm via message from page) ───────────────────
let reminderTimeout = null;

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_REMINDER') {
    if (reminderTimeout) clearTimeout(reminderTimeout);
    const now = Date.now();
    const { hour, minute } = e.data;
    const next = nextAlarmMs(hour, minute, now);
    reminderTimeout = setTimeout(() => fireReminder(hour, minute), next);
  }
});

function nextAlarmMs(hour, minute, now) {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime() - now;
}

function fireReminder(hour, minute) {
  self.registration.showNotification('🌌 APOD – Neues Bild!', {
    body: 'Das heutige Astronomie-Bild der NASA wartet auf dich.',
    icon: './icon-192.png',
    tag: 'apod-daily',
    renotify: true
  });
  // Schedule next day
  const next = nextAlarmMs(hour, minute, Date.now());
  reminderTimeout = setTimeout(() => fireReminder(hour, minute), next);
}
