// ========================================
// 🎮 AI Card Challenge
// 遊戲大廳
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


// ========================================
// 建立房間
// ========================================

document
    .getElementById("createRoom")
    .addEventListener("click", async () => {

        showMessage("⏳ 正在建立房間...");


        const roomCode =
            await createRoom();


        if (!roomCode) {

            showMessage(
                "❌ 建立房間失敗"
            );

            return;

        }


        menu.classList.add("hidden");

        roomScreen.classList.remove("hidden");


        displayRoomCode.textContent =
            roomCode;


        showMessage("");

    });


// ========================================
// 加入房間
// ========================================

document
    .getElementById("joinRoom")
    .addEventListener("click", async () => {

        const roomCode =
            roomCodeInput.value.trim();


        // 檢查房號
        if (!/^\d{4}$/.test(roomCode)) {

            showMessage(
                "⚠️ 請輸入 4 位數房號"
            );

            return;

        }


        showMessage(
            "⏳ 正在加入房間..."
        );


        const success =
            await joinRoom(roomCode);


        if (!success) {

            showMessage(
                "❌ 無法加入房間"
            );

            return;

        }


        menu.classList.add("hidden");

        roomScreen.classList.remove("hidden");


        displayRoomCode.textContent =
            roomCode;


        showMessage("");

    });


// ========================================
// 離開房間
// ========================================

document
    .getElementById("leaveRoom")
    .addEventListener("click", () => {

        if (peer) {

            peer.destroy();

        }


        location.reload();

    });


// ========================================
// 系統訊息
// ========================================

function showMessage(text) {

    message.textContent = text;

}
