/* ============================================================
   BASIC SERVICE WORKER FOR PWA CACHING
============================================================ */

const CACHE_NAME = "t1d-cache-v1";

const urlsToCache = [
    "./",
    "index.html",
    "style.css",
    "app.js",
    "history.html",
    "history.js",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-256.png",
    "icon-512.png",
    "icon-1024.png",
    "favicon-16.png",
    "favicon-32.png",
    "apple-touch-icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(names => {
            return Promise.all(
                names.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
