// OFFLINE MODE DISABLED — all caching logic commented out.
// The app now relies entirely on the backend/DB for state.

// const CACHE_NAME = "tracking-cache-v2";
// const OFFLINE_URLS = ["/", "/index.html"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
//   );
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) =>
//       Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       )
//     )
//   );
//   self.clients.claim();
// });

// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return;
//   const url = new URL(event.request.url);
//   // Never cache API/state calls so the app always
//   // sees the latest data from the backend.
//   if (url.pathname.startsWith("/state")) {
//     event.respondWith(fetch(event.request));
//     return;
//   }
//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       if (cached) return cached;
//       return fetch(event.request)
//         .then((response) => {
//           const responseClone = response.clone();
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, responseClone);
//           });
//           return response;
//         })
//         .catch(() => caches.match("/index.html"));
//     })
//   );
// });
