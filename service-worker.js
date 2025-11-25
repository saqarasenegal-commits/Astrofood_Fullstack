
const CACHE_NAME = "astrofood-cache-v1";

// Mets ici les fichiers importants à mettre en cache
const URLS_TO_CACHE = [
  "/",
  "/AstroFood Premium Gold ",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // On renvoie d’abord le cache, sinon on va chercher sur le réseau
      return response || fetch(event.request);
    })
  );
});

