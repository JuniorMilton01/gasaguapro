const CACHE_NAME = 'gasagua-v4-limpo';

self.addEventListener('install', function(event) {
  console.log('SW: Instalando versão limpa...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('SW: Caches antigos limpos');
      return self.clients.claim();
    })
  );
});

// Não intercepta nada - deixa passar direto
self.addEventListener('fetch', function(event) {
  // Pass-through total - não cacheia nada
  return;
});
