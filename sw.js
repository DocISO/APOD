const CACHE_NAME = 'apod-v3';
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

// Fetch handler
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
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => null))
    );
  }
});

// ── Periodic Background Sync ──────────────────────────────
// Fires once per day (browser decides exact timing, typically within ±2h of registration)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'apod-daily') {
    e.waitUntil(showApodNotification());
  }
});

async function showApodNotification() {
  // Try to fetch today's APOD title for a richer notification
  let title = '🌌 Neues Weltraumbild!';
  let body  = 'Das heutige Astronomie-Bild der NASA wartet auf dich.';
  try {
    // Read stored API key from IndexedDB isn't easily possible here,
    // so we use DEMO_KEY – one request/day is well within limits
    const apiKey = await getStoredApiKey();
    const today  = new Date().toISOString().slice(0, 10);
    const res    = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${today}&thumbs=true`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        title = '🌌 ' + data.title;
        body  = data.explanation
          ? data.explanation.slice(0, 100) + '…'
          : body;
      }
    }
  } catch (_) { /* use defaults */ }

  return self.registration.showNotification(title, {
    body,
    icon:     './icon-192.png',
    badge:    './icon-192.png',
    tag:      'apod-daily',
    renotify: true,
    data:     { url: './' }
  });
}

// Read API key stored by the page via postMessage
let storedApiKey = 'DEMO_KEY';
self.addEventListener('message', e => {
  if (e.data?.type === 'SET_API_KEY') {
    storedApiKey = e.data.key || 'DEMO_KEY';
  }
});
function getStoredApiKey() {
  return Promise.resolve(storedApiKey);
}

// Notification click → open / focus app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const appClient = list.find(c => c.url.includes(self.location.origin));
      if (appClient) return appClient.focus();
      return clients.openWindow('./');
    })
  );
});
