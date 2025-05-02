// ==============================================================================
// 受信データ解析処理
// ==============================================================================
function processData(data) {
    if (DEBUG) console.log("受信データ:", data);

    const match = data.match(/A:(\d+).*B:(\d+)/);
    if (match) {
        let A_val = parseInt(match[1]);
        let B_val = parseInt(match[2]);

        // A_val と B_val が妥当な範囲内か確認
        if (A_val < 0 || A_val > Y_MAX || B_val < 0 || B_val > Y_MAX) {
            console.warn("無効なデータ値:", A_val, B_val);
            return; // 無効なデータは処理しない
        }

        updateGraph(A_val, B_val);
    } else {
        console.warn("無効なデータ形式:", data);
    }
}