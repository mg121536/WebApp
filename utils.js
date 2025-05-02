// ==============================================================================
// キャリブレーション機能（仮実装）
// ==============================================================================
function startCalibration() {
    alert("キャリブレーション開始（仮機能）");
}

// ==============================================================================
// チェックボックスの状態を取得
// ==============================================================================
function toggleGraph() {
    const showSin = document.getElementById('sinCheckbox').checked;
    const showCos = document.getElementById('cosCheckbox').checked;
    const showSinN = document.getElementById('sinNCheckbox').checked;
    const showCosN = document.getElementById('cosNCheckbox').checked;

    // 状態に応じてグラフを更新
    updateGraph(showSin, showCos, showSinN, showCosN);
}

// ==============================================================================
// 戻るボタン動作（履歴がない場合はウィンドウを閉じる）
// ==============================================================================
function tryGoBack() {
    if (window.history.length > 1) {
        history.back();
    } else {
        window.close(); // 一部ブラウザでは無効
    }
}