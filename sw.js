const CACHE_NAME = 'apod-v2';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first (with cache fallback) for API + CDN calls; cache-first for app shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const networkFirst = (
    url.hostname === 'api.nasa.gov' ||
    url.hostname === 'api.allorigins.win' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );

  if (networkFirst) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => null);
      })
    );
  }
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() ?? { title:'APOD', body:'Das neue Weltraumbild wartet! 🌌' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body, icon:'./icon-192.png', badge:'./icon-192.png',
      tag:'apod-daily', renotify:true, data:{ url:'./' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});

let reminderTimeout = null;

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_REMINDER') {
    if (reminderTimeout) clearTimeout(reminderTimeout);
    const { hour, minute } = e.data;
    reminderTimeout = setTimeout(() => fireReminder(hour, minute), nextAlarmMs(hour, minute));
  }
});

function nextAlarmMs(h, m) {
  const now = Date.now();
  const d = new Date(now); d.setHours(h, m, 0, 0);
  if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  return d.getTime() - now;
}

function fireReminder(h, m) {
  self.registration.showNotification('🌌 APOD – Neues Weltraumbild!', {
    body:'Das heutige Astronomie-Bild der NASA wartet auf dich.',
    icon:'./icon-192.png', tag:'apod-daily', renotify:true
  });
  reminderTimeout = setTimeout(() => fireReminder(h, m), nextAlarmMs(h, m));
}
