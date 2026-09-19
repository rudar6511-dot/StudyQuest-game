const CACHE_NAME = "studyquest-pwa-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./welcome.html",
  "./home.html",
  "./style.css",
  "./script.js",
  "./quiz-engine-fix.js",
  "./championship.js",
  "./championship.css",
  "./multiplayer.js",
  "./multiplayer.css",
  "./player-presence.js",
  "./player-presence.css",
  "./background-music.js",
  "./background-music.css",
  "./premium.js",
  "./premium.css",
  "./typing.html",
  "./leaderboard.html",
  "./certificate.html",
  "./multiplayer.html",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("./welcome.html"));
    })
  );
});