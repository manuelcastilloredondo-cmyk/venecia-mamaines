const V="venecia-v3";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","vendor/leaflet.css","vendor/leaflet.js","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=="venecia-tiles").map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.hostname.endsWith("tile.openstreetmap.org")){
    e.respondWith(caches.open("venecia-tiles").then(async c=>{const hit=await c.match(r); if(hit) return hit; try{const res=await fetch(r); if(res.ok||res.type==="opaque") c.put(r,res.clone()); return res;}catch(_){return hit||Response.error();}}));
    return;
  }
  if(r.mode==="navigate"||u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); return res;}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp));} return res;})));
});
