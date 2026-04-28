const CACHE_NAME = 'distrileco-v1';
const BASE = '/pedidos-a-distrileco/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalar: cachear assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para el HTML, cache-first para el resto
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Solo cachear peticiones GET
  if (e.request.method !== 'GET') return;

  // WhatsApp y externos: siempre red
  if (url.includes('wa.me') || url.includes('api.whatsapp')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Guardar copia en cache si es válida
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
