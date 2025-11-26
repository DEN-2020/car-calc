const CACHE_NAME = "carcalc-cache-v2";  // важно: v2 чтобы обновить кеш

const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/ui.js",
  "./js/lang.js",
  "./js/pwa.js",
  "./js/loan.js",
  "./js/extra.js",
  "./js/calc_all.js",
  "./js/update-notify.js",
  "./manifest.json",
  "./lang/en.json",
  "./lang/ru.json",
  "./lang/fi.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Send message to client when new SW takes over
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Normal fetch fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
