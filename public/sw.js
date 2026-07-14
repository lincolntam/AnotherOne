const CACHE_NAME = "anotherone-v13";
const IMAGE_CACHE = "anotherone-images-v12";
const CORE_ASSETS = ["/offline.html", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isSecretRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.destination === "image" && url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});

function isSecretRequest(url) {
  if (url.origin !== self.location.origin) return false;
  return url.pathname.startsWith("/secret") || url.pathname.startsWith("/api/secret");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match("/offline.html"));
  }
}
