// ==============================================================================
// Service Worker 設定
// キャッシュ戦略：インストール時キャッシュ → フェッチ時にキャッシュ優先
// キャッシュクリア：アクティベート時に旧キャッシュ削除
// ==============================================================================

const CACHE_NAME = 'ips-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/register-sw.js',
    '/manifest.json',
    '/img/MnbIcon.png',
    '/img/MnbHeader.png'
];

// ==============================================================================
// インストール時に指定ファイルをキャッシュ
// ==============================================================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// ==============================================================================
// リクエスト時にキャッシュを優先し、なければネットワークから取得
// ==============================================================================
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// ==============================================================================
// アクティベート時に不要な（古い）キャッシュを削除
// ==============================================================================
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (!cacheWhitelist.includes(key)) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});


function tryGoBack() {
  if (window.history.length > 1) {
    history.back();
  } else {
    window.close(); // 一部ブラウザでは動作制限あり
  }
}

