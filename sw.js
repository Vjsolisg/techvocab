// TechVocab Pro service worker · shell mww4somz
const CACHE="tvp-shell-mww4somz";
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","vocab.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("tvp-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.origin===location.origin&&u.pathname.endsWith("vocab.json")){ // network first: updates
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("vocab.json",c));return r;}).catch(()=>caches.match("vocab.json")));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:u.origin===location.origin}).then(hit=>hit||fetch(e.request).then(r=>{
    if(r.ok&&(u.origin===location.origin||u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com"))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));}
    return r;}).catch(()=>caches.match("index.html"))));
});
