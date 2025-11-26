const CACHE_NAME = "carcalc-cache-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/ui.js",
  "/js/lang.js",
  "/js/pwa.js",
  "/js/loan.js",
  "/js/extra.js",
  "/js/calc_all.js",
  "/manifest.json",
  "/lang/en.json",
  "/lang/ru.json",
  "/lang/fi.json",

  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch handler (network → cache fallback)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          cached ? cached : Response.error()
        )
      );
    })
  );
});
