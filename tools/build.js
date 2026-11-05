// Builds: dist/artifact.html (for claude.ai artifact) and dist/pwa/* (standalone installable PWA)
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'vocab.json'),'utf8'));
const seed=JSON.stringify(data).replace(/</g,'\\u003c');
const app=fs.readFileSync(path.join(root,'src/app.html'),'utf8').replace('__SEED__',()=>seed);
const dist=path.join(root,'dist'),pwa=path.join(dist,'pwa');
fs.mkdirSync(path.join(pwa,'icons'),{recursive:true});
for(const f of fs.readdirSync(path.join(root,'assets/icons')))fs.copyFileSync(path.join(root,'assets/icons',f),path.join(pwa,'icons',f));
fs.writeFileSync(path.join(dist,'artifact.html'),app);
const head=`<!DOCTYPE html>
<html lang="es" data-pwa="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#080C18">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="TechVocab">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
</head>
<body>
`;
fs.writeFileSync(path.join(pwa,'index.html'),head+app+'\n</body>\n</html>\n');
fs.copyFileSync(path.join(root,'vocab.json'),path.join(pwa,'vocab.json'));
fs.writeFileSync(path.join(pwa,'manifest.webmanifest'),JSON.stringify({
  name:"TechVocab Pro",short_name:"TechVocab",lang:"es",start_url:"./",scope:"./",display:"standalone",
  background_color:"#080C18",theme_color:"#080C18",orientation:"any",
  icons:[{src:"icons/icon-192.png",sizes:"192x192",type:"image/png"},{src:"icons/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"}]
},null,2));
const shellVer=Date.now().toString(36);
fs.writeFileSync(path.join(pwa,'sw.js'),`// TechVocab Pro service worker · shell ${shellVer}
const CACHE="tvp-shell-${shellVer}";
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
`);
console.log('built',data.version,data.V.length,'terms');
