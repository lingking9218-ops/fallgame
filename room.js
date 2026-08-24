// ========================================
// 🌐 AI Card Challenge
// room.js
// ========================================

let peer = null;

let isHost = false;

let myPeerId = "";

let hostConnection = null;

let playerConnections = [];


// ========================================
// 建立 Peer
// ========================================

function createPeer() {

    return new Promise((resolve, reject) => {

        const roomCode =
            Math.floor(
                1000 + Math.random() * 9000
            ).toString();


        peer = new Peer(roomCode);


        peer.on("open", (id) => {

            myPeerId = id;

            console.log(
                "🟢 PeerJS ID:",
                id
            );

            resolve(id);

        });


        peer.on("connection", (connection) => {

            console.log(
                "👤 玩家加入:",
                connection.peer
            );


            if (playerConnections.length >= 1) {

                connection.on("open", () => {

                    connection.send({
                        type: "ROOM_FULL"
                    });

                    connection.close();

                });

                return;

            }


            isHost = true;


            playerConnections.push(
                connection
            );


            setupConnection(
                connection
            );


            connection.on("open", () => {

                connection.send({

                    type: "ROOM_JOINED",

                    playerNumber: 2

                });


                connection.send({

                    type: "PLAYER_LIST",

                    players: 2

                });


                updatePlayerList();

                updateRoomStatus();

                updateStartButtonSafe();

            });

        });


        peer.on("error", (error) => {

            console.error(
                "❌ PeerJS 錯誤:",
                error
            );

            reject(error);

        });


        peer.on("close", () => {

            console.log(
                "🔴 PeerJS 關閉"
            );

        });

    });

}


// ========================================
// 建立房間
// ========================================

async function createRoom() {

    try {

        isHost = true;


        const roomCode =
            await createPeer();


        updatePlayerList();

        updateRoomStatus();

        updateStartButtonSafe();


        return roomCode;

    }

    catch (error) {

        console.error(
            "❌ 建立房間失敗:",
            error
        );

        return null;

    }

}


// ========================================
// 加入房間
// ========================================

async function joinRoom(roomCode) {

    try {

        await createPeer();


        console.log(
            "🔗 加入房間:",
            roomCode
        );


        const connection =
            peer.connect(roomCode);


        hostConnection =
            connection;


        isHost = false;


        setupConnection(
            connection
        );


        return new Promise((resolve) => {

            let finished = false;


            connection.on("open", () => {

                console.log(
                    "🟢 已連線到房主"
                );


                updateRoomStatus();

                updateStartButtonSafe();


                if (!finished) {

                    finished = true;

                    resolve(true);

                }

            });


            connection.on("error", (error) => {

                console.error(
                    "❌ 加入房間錯誤:",
                    error
                );


                if (!finished) {

                    finished = true;

                    resolve(false);

                }

            });

        });

    }

    catch (error) {

        console.error(
            "❌ 加入房間失敗:",
            error
        );

        return false;

    }

}


// ========================================
// 設定連線
// ========================================

function setupConnection(
    connection
) {

    connection.on("open", () => {

        console.log(
            "🔗 連線建立:",
            connection.peer
        );


        updateRoomStatus();

        updateStartButtonSafe();

    });


    connection.on("data", (data) => {

        console.log(
            "📨 收到資料:",
            data
        );


        handleRoomData(
            data,
            connection
        );

    });


    connection.on("close", () => {

        console.log(
            "🚪 玩家離開:",
            connection.peer
        );


        playerConnections =
            playerConnections.filter(
                c => c !== connection
            );


        updatePlayerList();

        updateRoomStatus();

        updateStartButtonSafe();

    });


    connection.on("error", (error) => {

        console.error(
            "❌ Connection Error:",
            error
        );

    });

}


// ========================================
// 傳給房主
// ========================================

function sendToHost(data) {

    if (
        hostConnection &&
        hostConnection.open
    ) {

        hostConnection.send(data);

    }

}


// ========================================
// 房主廣播
// ========================================

function broadcast(data) {

    if (!isHost) {

        return;

    }


    playerConnections.forEach(
        connection => {

            if (connection.open) {

                connection.send(data);

            }

        }
    );

}


// ========================================
// 房間資料
// ========================================

function handleRoomData(
    data,
    connection
) {

    console.log(
        "📨 房間資料:",
        data
    );


    // ====================================
    // 玩家加入
    // ====================================

    if (
        data.type === "ROOM_JOINED"
    ) {

        const player1 =
            document.getElementById(
                "player1"
            );

        const player2 =
            document.getElementById(
                "player2"
            );


        if (player1) {

            player1.textContent =
                "🟢 玩家 1：房主";

        }


        if (player2) {

            player2.textContent =
                "🟢 玩家 2：我";

        }


        updateRoomStatus();

        updateStartButtonSafe();

        return;

    }


    // ====================================
    // 玩家列表
    // ====================================

    if (
        data.type === "PLAYER_LIST"
    ) {

        updatePlayerList();

        updateRoomStatus();

        updateStartButtonSafe();

        return;

    }


    // ====================================
    // 房間已滿
    // ====================================

    if (
        data.type === "ROOM_FULL"
    ) {

        alert(
            "❌ 房間已經有兩名玩家"
        );

        location.reload();

        return;

    }


    // ====================================
    // 遊戲資料
    // ====================================

    if (
        data.type === "GAME_START" ||
        data.type === "NEXT_ROUND" ||
        data.type === "ROUND_RESULT" ||
        data.type === "GAME_FINISH"
    ) {

        if (
            typeof handleGameData ===
            "function"
        ) {

            handleGameData(data);

        }

        return;

    }

}


// ========================================
// 更新玩家列表
// ========================================

function updatePlayerList() {

    const player1 =
        document.getElementById(
            "player1"
        );

    const player2 =
        document.getElementById(
            "player2"
        );


    if (
        !player1 ||
        !player2
    ) {

        return;

    }


    if (isHost) {

        player1.textContent =
            "🟢 玩家 1：房主";


        if (
            playerConnections.length >= 1
        ) {

            player2.textContent =
                "🟢 玩家 2：已加入";

        }

        else {

            player2.textContent =
                "⏳ 玩家 2：等待加入...";

        }

    }

    else {

        player1.textContent =
            "🟢 玩家 1：房主";


        player2.textContent =
            "🟢 玩家 2：我";

    }

}


// ========================================
// 更新房間狀態
// ========================================

function updateRoomStatus() {

    const status =
        document.getElementById(
            "roomStatus"
        );


    if (!status) {

        return;

    }


    if (isHost) {

        if (
            playerConnections.length >= 1
        ) {

            status.textContent =
                "🟢 對手已加入！";

        }

        else {

            status.textContent =
                "🏠 房主｜等待對手加入...";

        }

    }

    else {

        if (
            hostConnection &&
            hostConnection.open
        ) {

            status.textContent =
                "🟢 已連線到房主";

        }

        else {

            status.textContent =
                "⏳ 正在連線到房主...";

        }

    }

}


// ========================================
// 安全更新開始遊戲按鈕
// ========================================

function updateStartButtonSafe() {

    // game.js 還沒載入時不要報錯
    if (
        typeof updateStartButton !==
        "function"
    ) {

        return;

    }


    updateStartButton();

}
