// ================================
// 🎮 AI Card Challenge
// 房間系統 - 第 2 版
// ================================


const menu = document.getElementById("menu");

const roomScreen = document.getElementById("roomScreen");

const roomCodeInput = document.getElementById("roomCode");

const displayRoomCode = document.getElementById("displayRoomCode");

const roomStatus = document.getElementById("roomStatus");

const message = document.getElementById("message");


// ================================
// 建立房間
// ================================

document.getElementById("createRoom").addEventListener("click", () => {

    const roomCode =
        Math.floor(1000 + Math.random() * 9000).toString();

    openRoom(roomCode);

});


// ================================
// 加入房間
// ================================

document.getElementById("joinRoom").addEventListener("click", () => {

    const roomCode = roomCodeInput.value.trim();

    if (!/^\d{4}$/.test(roomCode)) {

        showMessage("⚠️ 請輸入 4 位數房號");

        return;
    }

    openRoom(roomCode);

});


// ================================
// 開啟房間畫面
// ================================

function openRoom(roomCode) {

    menu.classList.add("hidden");

    roomScreen.classList.remove("hidden");

    displayRoomCode.textContent = roomCode;

    roomStatus.textContent = "⏳ 等待對手加入...";

    showMessage("");

}


// ================================
// 顯示訊息
// ================================

function showMessage(text) {

    message.textContent = text;

}


// ================================
// 離開房間
// ================================

document.getElementById("leaveRoom").addEventListener("click", () => {

    roomScreen.classList.add("hidden");

    menu.classList.remove("hidden");

    roomCodeInput.value = "";

    showMessage("");

});
