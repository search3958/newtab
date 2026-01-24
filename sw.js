const CACHE_NAME = 'newtab-v6-cache-v3'; // バージョンを更新
const ASSETS = [
  '/',
  '/index.html',
  '/v6.1/afterload.js',
  '/lsr/icons-6.zip',
  '/links-v6.json',
  'https://search3958.github.io/project/logos/3958logo_main.svg',
  'https://search3958.github.io/check.js',
  'https://search3958.github.io/newtab/xml/lang.js',
  'https://search3958.github.io/newtab/xml/beta.xml'
];

// インストール: 指定したファイルをすべてキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート: 古いバージョンのキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// フェッチ: ネットワークリクエストを横取り
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあればそれを返しつつ、バックグラウンドで最新版を取得（Stale-While-Revalidate）
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // オフライン時など、ネットワーク失敗時は何もせず終了（cachedResponseがあればそれが返る）
      });

      return cachedResponse || fetchPromise;
    })
  );
});