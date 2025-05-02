// ==============================================================================
// Service Worker 登録処理
// ==============================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service Workerの登録
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker 登録成功:', registration);

                // 登録後に Service Worker が有効になるまで待機
                if (registration.waiting) {
                    // すでに待機中の Service Worker がある場合
                    console.log('新しい Service Worker が待機中です。');
                }

                // Service Worker がインストールされ、アクティブになるのを待つ
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;

                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // 新しいコンテンツが利用可能
                                console.log('新しいコンテンツがインストールされました');
                                alert('新しいバージョンのアプリケーションが利用可能です');
                            } else {
                                // オフラインでも利用可能
                                console.log('コンテンツがキャッシュされ、オフラインで利用可能です');
                            }
                        }
                    };
                };
            })
            .catch(error => {
                console.error('Service Worker 登録失敗:', error);
                alert('サービスワーカーの登録に失敗しました。');
            });
    });
} else {
    console.log('このブラウザは Service Worker をサポートしていません');
}