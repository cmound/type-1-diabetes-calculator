/* ============================================================
   SERVICE WORKER FOR T1D DIABETES CALCULATOR
   ✓ Offline support
   ✓ Cache versioning
   ✓ Avoid stale GitHub Pages cache
   ✓ Supports: index, history, JS, CSS, icons, manifest
============================================================ */

const CACHE_VERSION = "t1d-cache-v7";
const ASSET_CACHE = CACHE_VERSION;

// Files to cache offline
const ASSETS = [
    "./",
    "./index.html",
    "./history.html",
    "./style.css",
    "./app.js",
    "./history.js",
    "./scanner.js",

    // Icons
    "./icon-192.png",
    "./icon-256.png",
    "./icon-512.png",
    "./icon-1024.png",
    "./favicon-16.png",
    "./favicon-32.png",
    "./apple-touch-icon.png",

    "./manifest.webmanifest"
];

/* ============================================================
   INSTALL: Precache Assets
============================================================ */
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(ASSET_CACHE).then(cache => {
            return cache.addAll(ASSETS).catch(err => {
                console.error("Cache install failed:", err);
            });
        })
    );
    self.skipWaiting();
});

/* ============================================================
   ACTIVATE: Delete Old Caches
============================================================ */
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== ASSET_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

/* ============================================================
   FETCH: Cache-first, fallback to network
============================================================ */
self.addEventListener("fetch", event => {
    const request = event.request;

    // Only use caching for GET requests
    if (request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(request).then(cacheRes => {
            if (cacheRes) {
                return cacheRes; // Serve from cache
            }

            return fetch(request)
                .then(networkRes => {
                    // Only cache valid responses
                    if (!networkRes || networkRes.status !== 200) {
                        return networkRes;
                    }

                    // Clone response and store it
                    const cloned = networkRes.clone();
                    caches.open(ASSET_CACHE).then(cache => {
                        cache.put(request, cloned);
                    });

                    return networkRes;
                })
                .catch(() =>
                    // Offline fallback (only for pages)
                    caches.match("./index.html")
                );
        })
    );
});
