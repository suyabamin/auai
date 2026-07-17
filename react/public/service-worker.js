// Service Worker for Personal AI Assistant PWA
// Paths must match the GitHub Pages subpath: /ps_react_website/
const CACHE_NAME = 'ps-website-cache-v3';
const BASE = '/';

const ASSETS_TO_CACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'favicon.svg',
  BASE + 'icons.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // Fallback to index.html for navigation requests (SPA support)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});