// ==============================================================================
// 初期設定・グローバル変数
// ==============================================================================
const DEBUG = true;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ySteps = 10;

const maxDataPoints = 100;
const A_vals = Array(maxDataPoints).fill(0);
const B_vals = Array(maxDataPoints).fill(0);
const C_vals = Array(maxDataPoints).fill(0);
const D_vals = Array(maxDataPoints).fill(0);

let showSin = true;
let showCos = true;
let showSinN = true;
let showCosN = true;

const Y_MIN = 0;
const Y_MAX = 5000;
const Y_MARGIN = 0;
const DRAW_Y_MIN = Y_MIN - (Y_MAX * Y_MARGIN);
const DRAW_Y_MAX = Y_MAX + (Y_MAX * Y_MARGIN);
const DRAW_Y_RANGE = DRAW_Y_MAX - DRAW_Y_MIN;

let xSpacing = canvas.width / maxDataPoints;
let ws; // WebSocket変数