const CACHE = 'technova-public-shell-v6';
const CORE = [
  './offline.html',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isPublicStaticAsset(url, request) {
  if (url.origin !== self.location.origin) return false;
  if (request.headers.has('Authorization')) return false;
  if (url.searchParams.has('token') || url.searchParams.has('code')) return false;
  return /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation and data/API requests are always network-only. Never cache
  // authenticated HTML, Supabase responses, or user-specific pages.
  if (request.mode === 'navigate' || url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => {
      if (request.mode === 'navigate') return caches.match('./offline.html');
      return Response.error();
    }));
    return;
  }

  if (!isPublicStaticAsset(url, request)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
      const cacheControl = response.headers.get('Cache-Control') || '';
      if (response.ok && response.type === 'basic' &&
          !/private|no-store/i.test(cacheControl) &&
          !response.headers.has('Set-Cookie')) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    });
    return cached || network;
  })());
});
