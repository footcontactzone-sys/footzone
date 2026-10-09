// FootZone : met en cache l'appli pour qu'elle s'ouvre vite et soit installable.
// Les données (Supabase, cartes, OpenStreetMap) ne sont jamais mises en cache ici.
const CACHE = 'footzone-v12';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192-v3.png', './icon-512-v3.png', './apple-touch-icon-v3.png', './favicon-32-v3.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // seulement les fichiers de l'appli
  // réseau d'abord (toujours la dernière version), cache si hors ligne
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
