const CACHE_NAME="2024-05-11 10:31",urlsToCache=["/emoji-puzzle/","/emoji-puzzle/index.js","/emoji-puzzle/mp3/correct1.mp3","/emoji-puzzle/mp3/decision50.mp3","/emoji-puzzle/favicon/favicon.svg"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})