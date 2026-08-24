// ================================
// 🎮 AI Card Challenge
// 房間系統 - 第 1 版
// ================================

// 建立房間
document.getElementById("createRoom").addEventListener("click", () => {

    // 產生 1000～9999 的四位數房號
    const roomCode = Math.floor(1000 + Math.random() * 9000);

    // 顯示房號
    alert("房間建立成功！\n房號：" + roomCode);
});


// 加入房間
document.getElementById("joinRoom").addEventListener("click", () => {

    // 找到輸入框
    const roomInput = document.getElementById("roomCode");

    // 取得玩家輸入
    const roomCode = roomInput.value.trim();

    // 檢查是不是 4 位數
    if (!/^\d{4}$/.test(roomCode)) {
        alert("請輸入 4 位數房號！");
        return;
    }

    // 暫時顯示成功
    alert("正在加入房間：" + roomCode);
});
