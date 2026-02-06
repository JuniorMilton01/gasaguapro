const CACHE_NAME = 'gasagua-v3-limpo'; // Nome novo para forçar atualização

// NÃO cachear nada - modo pass-through
self.addEventListener('install', function(event) {
  console.log('Service Worker instalado (modo limpo)');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Deletando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Todos os caches antigos deletados');
      return self.clients.claim();
    })
  );
});

// Não interceptar requisições - deixa passar tudo
self.addEventListener('fetch', function(event) {
  // Não faz nada - deixa o navegador lidar com as requisições
  return;
});
