window.openSettings = openSettings;

// ==============================================================================
// 設定モーダル操作
// ==============================================================================
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

/* ページタイトル変更 */
function updateApplication() {
    const product = document.getElementById("product").value;
    const titleElement = document.querySelector("title");
    const h1Element = document.querySelector("header h1");

    if (product === "RAA2P3500") {
        titleElement.textContent = "VIRアプリケーション";
        h1Element.textContent = "VIRアプリケーション";
    } else {
        titleElement.textContent = "IPSアプリケーション";
        h1Element.textContent = "IPSアプリケーション";
    }
}