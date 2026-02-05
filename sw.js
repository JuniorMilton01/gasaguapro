const CACHE_NAME = 'gasagua-v2'; // Incrementado para forçar atualização
const urlsToCache = [
  './',
  './index.html',
  './index-BCooEiNa.css',
  './index-B_0g4mRk.js',
  './manifest.json',
  './conexao.js',
  './storage.js',
  './firebase-config.js',
  './icone-192.png',
  './icone-512.png'
];

// Instalação - guarda arquivos no cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.log('Erro ao adicionar ao cache:', err);
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Fetch - estratégia Cache First para arquivos estáticos, Network para API
self.addEventListener('fetch', function(event) {
  // Não intercepta requisições de API (quando tiver backend)
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Não intercepta requisições do Firebase
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Se achou no cache, retorna
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request)
          .then(function(networkResponse) {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Atualiza o cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
            return
