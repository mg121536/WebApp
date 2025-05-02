// ==============================================================================
// グラフ描画
// ==============================================================================
// 定数定義
const FONT_AXIS  = '10px Arial';
const FONT_TITLE = '16px Arial';
const COLOR_TEXT = '#ffffff';
const COLOR_AXES = '#ffffff';
const COLOR_GRID = 'rgba(255, 255, 255, 0.2)';
const COLOR_SIN  = 'red';
const COLOR_COS  = 'blue';
const COLOR_SINN = 'orange';
const COLOR_COSN = 'green';

function updateGraph(A_val, B_val, C_val, D_val) {
    // データ更新
    updateData(A_vals, A_val);
    updateData(B_vals, B_val);
    updateData(C_vals, C_val);
    updateData(D_vals, D_val);

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // タイトル
    drawTitle('Sin ・ Cos ・ SinN ・ CosN');

    // 軸描画
    drawAxes();

    // Y軸ラベル
    drawYAxisLabels();

    // グリッド線
    drawGridLines();

    // X軸ラベル・垂直線
    drawXAxisLabels();
    drawVerticalLines();

    // チェックボックスの状態を取得
    const showSin  = document.getElementById('sinCheckbox')?.checked ?? true;
    const showCos  = document.getElementById('cosCheckbox')?.checked ?? true;
    const showSinN = document.getElementById('sinNCheckbox')?.checked ?? true;
    const showCosN = document.getElementById('cosNCheckbox')?.checked ?? true;

    // 波形描画
    if (showCos) drawWave(A_vals, 'blue');
    if (showSin) drawWave(B_vals, 'red');
    if (showCosN) drawWave(C_vals, 'green');
    if (showSinN) drawWave(D_vals, 'orange');
}

// データ更新処理
function updateData(vals, newValue) {
    vals.shift();
    vals.push(newValue ?? 0);
}

// タイトル描画
function drawTitle(title) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(title, canvas.width / 2 - 80, 30);
}

// 軸描画
function drawAxes() {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
}

// Y軸ラベル描画
function drawYAxisLabels() {
    ctx.font = '10px Arial';
    for (let i = 0; i <= ySteps; i++) {
        const yVal = Y_MAX - (500 * i);
        const yPos = (canvas.height / ySteps) * i;
        ctx.fillText(Math.round(yVal), 5, yPos + 10);
    }
}

// グリッド線描画
function drawGridLines() {
    for (let i = 0; i <= ySteps; i++) {
        const y = (canvas.height / ySteps) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }
}

// X軸ラベル描画
function drawXAxisLabels() {
    for (let i = 0; i <= 10; i++) {
        const xPos = (canvas.width / 10) * i;
        ctx.fillText(i, xPos, canvas.height - 5);
    }
}

// 垂直線描画
function drawVerticalLines() {
    for (let i = 1; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 10) * i, 0);
        ctx.lineTo((canvas.width / 10) * i, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }
}

// 波形描画
function drawWave(vals, color) {
    ctx.beginPath();
    vals.forEach((val, i) => {
        const x = i * xSpacing;
        const y = canvas.height - ((val - DRAW_Y_MIN) / DRAW_Y_RANGE) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}
