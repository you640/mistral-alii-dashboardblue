const CACHE_VERSION = 'alibi-pwa-v2.1.0';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${CACHE_VERSION}`;

// Statické assety pre okamžitý offline štart
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico'
];

// 1. Install Event — prednačítanie kľúčových assetov
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event — okamžité prevzatie kontroly a prečistenie starých cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — inteligentné stratégie podľa typu požiadavky
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignoruj ne-GET a ne-HTTP protokoly (chrome-extension, blob, data)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API a dynamické endpointy — VŽDY Network-Only (nikdy neukladať API odpovede do PWA cache)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('mistral.ai') || url.hostname.includes('base44.com')) {
    return;
  }

  // 1. Stratégia: Network-First s Cache Fallback pre stránky (Navigácia)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Skús vrátiť stránku z cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // Ak nie je v cache, vráť koreňovú stránku
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          return new Response(
            `<!DOCTYPE html>
            <html lang="sk">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
              <title>Offline — Alibi Forenzná Platforma</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #020617; color: #F8FAFC; display: flex; align-items: center; justify-content: center; height: 100dvh; margin: 0; padding: 20px; text-align: center; box-sizing: border-box; }
                .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.6); padding: 32px; border-radius: 20px; max-width: 380px; }
                h1 { font-size: 20px; margin-bottom: 8px; color: #38BDF8; }
                p { font-size: 14px; color: #94A3B8; line-height: 1.5; margin-bottom: 24px; }
                button { background: #38BDF8; color: #020617; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Forenzná Platforma Offline</h1>
                <p>Momentálne nemáte pripojenie na internet. Predtým načítané spisy a dáta zostávajú v pamäti zariadenia.</p>
                <button onclick="window.location.reload()">Skúsiť znova</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // 2. Stratégia: Stale-While-Revalidate pre statické assety (CSS, JS, Ikony, Fonty)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
