const CACHE_NAME = "t1d-cache-v2";

const FILES_TO_CACHE = [
    "index.html",
    "history.html",
    "style.css",
    "app.js",
    "history.js",
    "manifest.webmanifest",

    "apple-touch-icon.png",
    "favicon-16.png",
    "favicon-32.png",
    "icon-192.png",
    "icon-256.png",
    "icon-512.png",
    "icon-1024.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
