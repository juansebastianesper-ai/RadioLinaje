const CACHE_NAME = 'radio-cache-v2';
const STREAM_HOST = 'radiolinaje-audio.juansebastianesper.workers.dev';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // No interceptar el stream de audio ni peticiones al proxy de Workers
  if (url.hostname === STREAM_HOST || url.pathname.includes('/stream')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});