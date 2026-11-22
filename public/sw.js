/* Only the offline notice is cached. Game pages, code, API and sockets stay live. */
const CACHE = 'table-des-amis-offline-v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add('/offline.html')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('table-des-amis-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).catch(async () => {
    const cache = await caches.open(CACHE);
    return await cache.match('/offline.html') || new Response('Connexion indisponible. Reconnectez-vous pour jouer.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
