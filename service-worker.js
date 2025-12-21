// UPDATED: Changed version from v1 to v2 to force file refresh
const CACHE_NAME = "pwa-cache-v2";

const CACHE_ASSETS = [
  "./",
  "./index.html",
  "./app.html",
  "./styles/style.css",
  "./assets/Go Web Store.svg",
  "./assets/No Results.svg",
  "./assets/Cancel.svg",
  "./assets/Microphone.svg",
  "./assets/Searchbar.svg",
  "./assets/Cover.png",
  "./assets/No Match Found.svg",
  "./assets/Share.svg",
  "./js/app.js",
  "./js/query-param.mjs",
  "./js/animated-logo.mjs",
  "./js/carousel-component.mjs",
  "./js/app-card.mjs",
  "./js/download-app.mjs",
  "./js/search-bar.mjs",
  "./js/app-details.mjs",
  "./js/get-apps.mjs",
  "./fonts/Lato-Bold.ttf",
  "./fonts/Lato-Regular.ttf",
  "./fonts/Material Symbols.woff",
  // Ensure this file is re-cached
  "./js/splash-screen.mjs" 
];

self.addEventListener("install", (event) => {
  // Skip waiting forces the new service worker to become active immediately
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become available to all pages immediately
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});