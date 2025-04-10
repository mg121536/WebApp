const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxDataPoints = 100;
const A_vals = Array(maxDataPoints).fill(0);
const B_vals = Array(maxDataPoints).fill(0);
let xSpacing = canvas.width / maxDataPoints;

// 設定画面を表示する関数
function openSettings() {
    document.getElementById('settingsModal').style.display = "block";
}

// 設定画面を閉じる関数（クリックイベントがある場合は伝播を止める）
function closeSettings(event) {
    if (event) event.stopPropagation();
    document.getElementById('settingsModal').style.display = "none";
}

// 設定ファイルをインポートしたというダイアログを表示
function importSettings() {
    alert('設定ファイルをインポートしました。');
}

// ウィンドウリサイズ時にキャンバスサイズを再設定（リサイズイベントにデバウンスを適用）
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

// キャンバスのサイズを現在のウィンドウサイズに合わせて再設定
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.5;
    xSpacing = canvas.width / maxDataPoints;
    updateGraph(); // ← これを追加！
}

// シリアル通信を開始する関数（Web Serial APIを使用）
function startSerial() {
    if (navigator.serial) {
        navigator.serial.requestPort().then(port => {
            serialPort = port;
            return serialPort.open({ baudRate: 115200 });
        }).then(() => {
            const reader = serialPort.readable.getReader();
            readLoop(reader); // データの読み取りを開始
        }).catch(error => {
            alert(`シリアルポートの接続に失敗しました: ${error.message}`);
            console.error("シリアルポートの接続に失敗しました", error);
        });
    } else {
        alert("シリアル通信はこのブラウザではサポートされていません。");
    }
}

// Bluetooth通信を開始する関数（Web Bluetooth APIを使用）
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
        alert("Bluetooth接続に失敗しました: " + error.message);
        console.error("Bluetooth接続に失敗しました", error);
    }
}

// BLEから受け取ったデータを処理してグラフを更新する関数
function handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    const angleA = value.getInt16(0, true); // リトルエンディアンで値を取得
    const angleB = value.getInt16(2, true);
    updateGraph(angleA, angleB);
}

// グラフを更新する関数（A/Bの値を追加し、キャンバスを再描画）
function updateGraph(A_val, B_val) {
    A_vals.shift();
    B_vals.shift();
    A_vals.push(A_val);
    B_vals.push(B_val);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Sin ・ Cos', canvas.width / 2 - 50, 30);

    // 軸の描画
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Y軸ラベルの描画
    ctx.font = '10px Arial';
    for (let i = 0; i <= 11; i++) {
        let yPos = (canvas.height / 11) * i;
        let label = 1100 - (i * 100);
        ctx.fillText(label, 5, yPos);
    }

    // 横線の描画
    for (let i = 1; i <= 11; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 11) * i);
        ctx.lineTo(canvas.width, (canvas.height / 11) * i);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }

    // X軸ラベルと縦線の描画
    for (let i = 0; i <= 10; i++) {
        let xPos = (canvas.width / 10) * i;
        ctx.fillText(i, xPos, canvas.height - 5);
    }
    for (let i = 1; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 10) * i, 0);
        ctx.lineTo((canvas.width / 10) * i, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }

    // Aの線グラフの描画（青）
    ctx.beginPath();
    A_vals.forEach((val, i) => {
        const x = i * xSpacing;
        const y = canvas.height - (val / 1100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bの線グラフの描画（赤）
    ctx.beginPath();
    B_vals.forEach((val, i) => {
        const x = i * xSpacing;
        const y = canvas.height - (val / 1100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// シリアルポートからのデータ読み取りループ
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
            processData(line); // データ行を処理
        }
    }
}

// A/Bの値をパースしてグラフを更新する関数
function processData(data) {
    console.log("受信データ:", data); // ← この1行追加！
    const match = data.match(/A:(\d+).*B:(\d+)/);
    if (match) {
        const A_val = parseInt(match[1]);
        const B_val = parseInt(match[2]);
        updateGraph(A_val, B_val);
    } else {
        console.warn("無効なデータ形式:", data);
    }
}

// キャリブレーション開始を通知する仮関数
function startCalibration() {
    alert("キャリブレーション開始（仮機能）");
}

resizeCanvas(); // ← ページロード時に一回だけキャンバスサイズと描画を初期化！
