// Carico Magazzino: funziona anche senza internet
const CACHE = "carico-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // pagina: prima la rete (così prendi gli aggiornamenti), se manca internet usa la copia salvata
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put("./index.html", c)); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // icone e caratteri: prima la copia salvata
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return res;
  })));
});
