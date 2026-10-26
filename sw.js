/* Kese — çevrimdışı uygulama kabuğu */
"use strict";

const CACHE_VERSION = "kese-1.3.0";
const INDEX_URL = "./index.html";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/favicon.svg",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/splash-1179x2556.png",
  "./icons/splash-1290x2796.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("kese-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(INDEX_URL, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(INDEX_URL)
            .then((cached) => cached || caches.match("./"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const payload = notification && notification.data ? notification.data : {};
  if (notification) notification.close();

  const target = new URL(self.registration.scope);
  if (payload.tab) target.hash = payload.tab;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const client = clientList.find((entry) => {
          try {
            return new URL(entry.url).origin === target.origin;
          } catch (error) {
            return false;
          }
        });
        if (client) {
          try {
            client.postMessage({
              type: "kese:notification-click",
              tab: payload.tab || null,
              entityType: payload.entityType || null,
              entityId: payload.entityId || null
            });
          } catch (error) {
            /* istemci mesajı alamıyorsa yalnızca odakla */
          }
          return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target.href);
        return undefined;
      })
  );
});
