let resizeTimeout;

// 初回ロード時にも描画
window.addEventListener('load', resizeCanvas);

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

function resizeCanvas() {
    if (!canvas || typeof updateGraph !== 'function' || typeof maxDataPoints === 'undefined') {
        console.warn("キャンバスの初期化が完了していません");
        return;
    }

    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.5;
    xSpacing = canvas.width / maxDataPoints;
    updateGraph();
}
