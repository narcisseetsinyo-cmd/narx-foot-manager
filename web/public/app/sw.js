/* NARX Foot Manager – service worker : l'application s'ouvre même sans connexion.
   Les données passent par Firestore (cache hors ligne intégré), jamais par ce fichier. */
const CACHE = "narx-app-v3.11.0";
const SHELL = ["/app/", "/app/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("narx-app-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
const networkFirst = req => fetch(req).then(r => put(req, r)).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("/app/")));
const cacheFirst = req => caches.match(req).then(r => r || fetch(req).then(x => put(req, x)));
const swr = req => caches.match(req).then(r => { const n = fetch(req).then(x => put(req, x)).catch(() => r); return r || n; });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (req.mode === "navigate" || u.pathname === "/__/firebase/init.js") return e.respondWith(networkFirst(req));
    if (u.pathname.startsWith("/__/firebase/")) return e.respondWith(cacheFirst(req)); // SDK versionné
    if (/\.(png|webmanifest|woff2?)$/.test(u.pathname)) return e.respondWith(swr(req));
    return;
  }
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") return e.respondWith(swr(req));
});
