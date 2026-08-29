const CACHE_NAME = 'radio-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Instalar el Service Worker y guardar los archivos básicos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones para que la app cargue incluso si el internet falla momentáneamente
self.addEventListener('fetch', event => {
  // No cacheamos el stream de audio, solo los archivos de la app
  if (event.request.url.includes('/stream')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});