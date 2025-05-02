// ==============================================================================
// Service Worker 設定
// ==============================================================================

const CACHE_NAME = 'ips-app-cache-v1';
const urlsToCache = [
    '/',
    '/offline.html',
    '/portal.html',
    '/index.html',
    '/style.css',
    '/register-sw.js',
    '/script.js',
    '/init.js',
    '/utils.js',
    '/settings.js',
    '/resize.js',
    '/graph.js',
    '/parser.js',
    '/serial.js',
    '/bluetooth.js',
    '/websocket.js',
    '/manifest.json',
    '/img/MnbIcon.png',
    '/img/MnbHeader.png'
];

// ==============================================================================
// インストール処理：初回アクセス時に必要なリソースをキャッシュ
// ==============================================================================

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: キャッシュ作成');
            return cache.addAll(urlsToCache).catch(error => {
                console.error('キャッシュの追加に失敗しました:', error);
            });
        })
    );
});

// ==============================================================================
// フェッチ処理：キャッシュがあればキャッシュを使用、なければネットワークから取得
// ==============================================================================

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response; // キャッシュからリソースを返す
            }

            // キャッシュにない場合、ネットワークから取得
            return fetch(event.request).catch(() => {
                // オフライン時にオフラインページを返す
                return caches.match('/offline.html');
            });
        })
    );
});

// ==============================================================================
// アクティベート処理：古いキャッシュを削除して最新の状態に保つ
// ==============================================================================

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (!cacheWhitelist.includes(key)) {
                        return caches.delete(key); // 不要なキャッシュ削除
                    }
                })
            );
        })
    );
});

// ==============================================================================
// 戻るボタン用の処理（UI側で使用）
// ==============================================================================

function tryGoBack() {
    if (window.history.length > 1) {
        history.back();
    } else {
        window.close(); // 一部ブラウザではウィンドウを閉じられない場合あり
    }
}
