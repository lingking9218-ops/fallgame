// ========================================
// 🎮 AI Card Challenge
// 遊戲大廳
// ========================================


// ========================================
// 找到 HTML 元素
// ========================================

const menu =
    document.getElementById("menu");

const roomScreen =
    document.getElementById("roomScreen");

const roomCodeInput =
    document.getElementById("roomCode");

const displayRoomCode =
    document.getElementById("displayRoomCode");

const message =
    document.getElementById("message");

const createRoomButton =
    document.getElementById("createRoom");

const joinRoomButton =
    document.getElementById("joinRoom");

const leaveRoomButton =
    document.getElementById("leaveRoom");


// ========================================
// 建立房間
// ========================================

createRoomButton.addEventListener(
    "click",
    async () => {

        // 防止玩家連續按
        createRoomButton.disabled = true;

        joinRoomButton.disabled = true;


        showMessage(
            "⏳ 正在建立房間..."
        );


        // 使用 room.js 建立 Peer
        const roomCode =
            await createRoom();


        // 建立失敗
        if (!roomCode) {

            showMessage(
                "❌ 建立房間失敗，請重新整理頁面後再試"
            );


            createRoomButton.disabled = false;

            joinRoomButton.disabled = false;

            return;

        }


        // 隱藏主選單
        menu.classList.add("hidden");


        // 顯示房間
        roomScreen.classList.remove("hidden");


        // 顯示房號
        displayRoomCode.textContent =
            roomCode;


        // 清除訊息
        showMessage("");

    }
);


// ========================================
// 加入房間
// ========================================

joinRoomButton.addEventListener(
    "click",
    async () => {

        const roomCode =
            roomCodeInput.value.trim();


        // ====================================
        // 檢查房號
        // ====================================

        if (!/^\d{4}$/.test(roomCode)) {

            showMessage(
                "⚠️ 請輸入正確的 4 位數房號"
            );

            return;

        }


        // ====================================
        // 防止重複按
        // ====================================

        createRoomButton.disabled = true;

        joinRoomButton.disabled = true;


        showMessage(
            "⏳ 正在加入房間..."
        );


        // ====================================
        // 加入 PeerJS 房間
        // ====================================

        const success =
            await joinRoom(roomCode);


        // ====================================
        // 加入失敗
        // ====================================

        if (!success) {

            showMessage(
                "❌ 無法加入房間\n請確認房號是否正確"
            );


            createRoomButton.disabled = false;

            joinRoomButton.disabled = false;

            return;

        }


        // ====================================
        // 顯示房間
        // ====================================

        menu.classList.add("hidden");

        roomScreen.classList.remove("hidden");


        displayRoomCode.textContent =
            roomCode;


        showMessage("");

    }
);


// ========================================
// 離開房間
// ========================================

leaveRoomButton.addEventListener(
    "click",
    () => {

        // 關閉 PeerJS
        if (peer) {

            peer.destroy();

        }


        // 回到首頁
        location.reload();

    }
);


// ========================================
// 顯示系統訊息
// ========================================

function showMessage(text) {

    message.textContent = text;

}
