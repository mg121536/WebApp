window.startWifi = startWifi;

// ==============================================================================
// Wi-Fi経由のWebSocket接続
// ==============================================================================
function startWifi() {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      logMessage("WebSocket 接続を開始します...");
  
      ws = new WebSocket('ws://192.168.4.1:81'); // ESP32のIPアドレス
      ws.binaryType = "arraybuffer"; // バイナリデータをArrayBufferとして処理
  
      ws.onopen = () => {
        logMessage("WebSocket 接続成功: ESP32と接続されました。");
      };
  
      ws.onmessage = (event) => {
        // 受信データがバイナリかテキストかを判別
        if (event.data instanceof ArrayBuffer) {
          // ArrayBufferの場合
          const view = new DataView(event.data);
          const A_val = view.getUint16(0, false); // リトルエンディアンで取得
          const B_val = view.getUint16(2, false); // リトルエンディアンで取得
          const C_val = view.getUint16(4, false);
          const D_val = view.getUint16(6, false);
  
          updateGraph(A_val, B_val, C_val, D_val);
          logMessage(`データ更新 (BIN) → A: ${A_val}, B: ${B_val}, C: ${C_val}, D: ${D_val}`);
        } else if (typeof event.data === "string") {
          // テキストデータの場合
          logMessage("ESP32から受信（テキスト）: " + event.data);
          processData(event.data.trim());
        } else {
          logMessage("受信したデータの形式が不明です。");
        }
      };
  
      ws.onerror = (error) => {
        logMessage("WebSocket エラー: " + error.message);
      };
  
      ws.onclose = () => {
        logMessage("WebSocket 切断されました。");
      };
    } else {
      logMessage("すでにESP32と接続されています。");
    }
  
    resizeCanvas(); // 初期描画
  }

// メッセージ表示用（仮）
function logMessage(msg) {
    if (DEBUG) console.log(msg);
}