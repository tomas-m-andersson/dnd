// Nat20 service worker: lets the app start offline.
// The page, the app manifest and this file always try the network first,
// so a new name, icon or version shows up right away. The saved copy is only
// used when there is no internet. Icons and fonts use the saved copy first.
const CACHE = 'nat20-v57';
const CORE = ['./', './index.html', './manifest.webmanifest?v=5', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function networkFirst(req, key) {
  return fetch(req, {cache: 'no-cache'}).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key || req, copy)); }
    return res;
  }).catch(() => caches.match(key || req, {ignoreSearch: true}));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req, './index.html')); return; }
  if (sameOrigin && (url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.html') || url.pathname.endsWith('/'))) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
