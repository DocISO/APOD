/* APOD Service Worker v4 – RSS-based */
const CACHE_NAME = 'apod-v4';
const STATIC = ['/', '/index.html', '/manifest.json'];

// --- Install ---
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// --- Activate ---
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// --- Fetch: network-first for API, cache-first for static ---
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('allorigins') || url.hostname.includes('nasa.gov')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});

// --- Periodic Background Sync ---
self.addEventListener('periodicsync', e => {
  if (e.tag === 'apod-daily') {
    e.waitUntil(showApodNotification());
  }
});

// --- Push fallback ---
self.addEventListener('push', e => {
  e.waitUntil(showApodNotification());
});

// --- Message from page ---
let savedApiKey = 'DEMO_KEY';
self.addEventListener('message', e => {
  if (e.data?.type === 'SET_API_KEY') savedApiKey = e.data.key || 'DEMO_KEY';
});

// --- Show APOD notification via RSS ---
async function showApodNotification() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rssUrl = 'https://science.nasa.gov/feed/apod-basic/';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxyUrl);
    const json = await res.json();
    const xml = json.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const items = [...doc.querySelectorAll('item')];
    let apod = null;
    for (const item of items) {
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const itemDate = new Date(pubDate).toISOString().slice(0, 10);
      if (itemDate === today) { apod = item; break; }
    }
    if (!apod && items.length > 0) apod = items[0];

    const title = apod?.querySelector('title')?.textContent?.trim() || 'APOD';
    const imgMatch = (apod?.getElementsByTagNameNS('*','encoded')[0]?.textContent || '').match(/<IMG\s+SRC="([^"]+)"/i);
    const icon = imgMatch ? imgMatch[1] : '/icon-192.png';

    await self.registration.showNotification('🔭 ' + title, {
      body: 'Astronomy Picture of the Day',
      icon,
      badge: '/icon-192.png',
      tag: 'apod-daily',
      renotify: true,
      data: { url: '/' }
    });
  } catch (err) {
    await self.registration.showNotification('🔭 APOD – Neues Bild verfügbar', {
      body: 'Astronomy Picture of the Day',
      icon: '/icon-192.png',
      tag: 'apod-daily',
      data: { url: '/' }
    });
  }
}

// --- Notification click ---
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
