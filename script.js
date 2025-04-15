//==============================================================================
// 初期設定・グローバル変数
//==============================================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxDataPoints = 100;
const A_vals = Array(maxDataPoints).fill(0);
const B_vals = Array(maxDataPoints).fill(0);

const Y_MIN = 0;
const Y_MAX = 4095;
const Y_MARGIN = 0.1;  // 上下に10%の余白を追加

const DRAW_Y_MIN = Y_MIN - (Y_MAX * Y_MARGIN); // = -409.5
const DRAW_Y_MAX = Y_MAX + (Y_MAX * Y_MARGIN); // = 4504.5
const DRAW_Y_RANGE = DRAW_Y_MAX - DRAW_Y_MIN;  // = 4914

let xSpacing = canvas.width / maxDataPoints;
let ws;

//==============================================================================
// 設定モーダル操作
//==============================================================================

function openSettings() {
    document.getElementById('settingsModal').style.display = "block";
}

function closeSettings(event) {
    if (event) event.stopPropagation();
    document.getElementById('settingsModal').style.display = "none";
}

function importSettings() {
    alert('設定ファイルをインポートしました。');
}

//==============================================================================
// ウィンドウリサイズ処理
//==============================================================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.5;
    xSpacing = canvas.width / maxDataPoints;
    updateGraph(); // 初期描画
}

//==============================================================================
// シリアル通信（Web Serial API）
//==============================================================================

function startSerial() {
    if (navigator.serial) {
        navigator.serial.requestPort()
            .then(port => {
                serialPort = port;
                return serialPort.open({ baudRate: 115200 });
            })
            .then(() => {
                const reader = serialPort.readable.getReader();
                readLoop(reader); // 読み取り開始
            })
            .catch(error => {
                alert(`シリアル接続に失敗: ${error.message}`);
                console.error("シリアル接続エラー", error);
            });
    } else {
        alert("このブラウザはシリアル通信をサポートしていません。");
    }
}

//==============================================================================
// Bluetooth通信（Web Bluetooth API）
//==============================================================================

async function startBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { name: 'ESP32_BLE_Device' },
                { services: ['12345678-1234-5678-1234-56789abcdef0'] }
            ]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('12345678-1234-5678-1234-56789abcdef0');
        bluetoothCharacteristic = await service.getCharacteristic('12345678-1234-5678-1234-56789abcdef1');

        if (bluetoothCharacteristic.properties.notify) {
            await bluetoothCharacteristic.startNotifications();
            bluetoothCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        }
    } catch (error) {
        alert("Bluetooth接続に失敗: " + error.message);
        console.error("Bluetooth接続エラー", error);
    }
}

function handleCharacteristicValueChanged(event) {
    const value = new TextDecoder().decode(event.target.value);
    console.log("[BLE受信]", value);       // 受信ログ確認用
    processData(value.trim());            // 改行などを削除
}

//==============================================================================
// グラフ描画処理
//==============================================================================

function updateGraph(A_val, B_val) {
    A_vals.shift();
    B_vals.shift();
    A_vals.push(A_val ?? 0);
    B_vals.push(B_val ?? 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // タイトル
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Sin ・ Cos', canvas.width / 2 - 50, 30);

    // 軸の描画
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Y軸ラベル（10ステップ）
    ctx.font = '10px Arial';
    const ySteps = 10;
    for (let i = 0; i <= ySteps; i++) {
        const yVal = DRAW_Y_MAX - (DRAW_Y_RANGE / ySteps) * i;
        const yPos = (canvas.height / ySteps) * i;
        ctx.fillText(Math.round(yVal), 5, yPos + 10);
    }

    // 水平グリッド線
    for (let i = 1; i <= 11; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 11) * i);
        ctx.lineTo(canvas.width, (canvas.height / 11) * i);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }

    // X軸ラベルと垂直線
    for (let i = 0; i <= 10; i++) {
        const xPos = (canvas.width / 10) * i;
        ctx.fillText(i, xPos, canvas.height - 5);
    }

    for (let i = 1; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 10) * i, 0);
        ctx.lineTo((canvas.width / 10) * i, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }

    // Cos波（青）
    ctx.beginPath();
    A_vals.forEach((val, i) => {
        const x = i * xSpacing;
        const y = canvas.height - ((val - DRAW_Y_MIN) / DRAW_Y_RANGE) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sin波（赤）
    ctx.beginPath();
    B_vals.forEach((val, i) => {
        const x = i * xSpacing;
        const y = canvas.height - ((val - DRAW_Y_MIN) / DRAW_Y_RANGE) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

//==============================================================================
// シリアルデータ読み取りループ
//==============================================================================

async function readLoop(reader) {
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newLineIndex;
        while ((newLineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newLineIndex);
            buffer = buffer.slice(newLineIndex + 1);
            processData(line);
        }
    }
}

//==============================================================================
// 受信データ解析
//==============================================================================

function processData(data) {
    console.log("受信データ:", data);

    const match = data.match(/A:(\d+).*B:(\d+)/);
    if (match) {
        const A_val = parseInt(match[1]);
        const B_val = parseInt(match[2]);
        updateGraph(A_val, B_val);
    } else {
        console.warn("無効なデータ形式:", data);
    }
}

//==============================================================================
// キャリブレーション機能（仮実装）
//==============================================================================

function startCalibration() {
    alert("キャリブレーション開始（仮機能）");
}

//==============================================================================
// Wi-Fi経由のWebSocket接続
//==============================================================================

function startWifi() {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        ws = new WebSocket('ws://192.168.4.1:81'); // ESP32のAPモードIP

        ws.onopen = () => {
            console.log("WebSocket connected to ESP32");
        };

        ws.onmessage = (event) => {
            console.log("ESP32から受信:", event.data);
            const match = event.data.match(/A[:=](\d+).*B[:=](\d+)/);
            if (match) {
                const A_val = parseInt(match[1]);
                const B_val = parseInt(match[2]);
                updateGraph(A_val, B_val);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocketエラー:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket切断");
        };
    } else {
        console.log("すでにESP32と接続されています。");
    }

    resizeCanvas(); // 初期キャンバス描画
}
