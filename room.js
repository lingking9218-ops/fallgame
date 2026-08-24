// ========================================
// 🎮 AI Card Challenge
// room.js
// PeerJS 房間 / 2人連線 / 遊戲同步
// ========================================


// ========================================
// 🌐 全域變數
// ========================================

let peer = null;

let isHost = false;

let myPlayerNumber = 0;

let currentRoomCode = "";

let playerConnections = [];


// ========================================
// 💬 顯示系統訊息
// ========================================

function roomMessage(text) {

    const el =
        document.getElementById("message");

    if (el) {

        el.textContent = text;

    }

}


// ========================================
// 🔢 產生4碼房號
// ========================================

function generateRoomCode() {

    return Math.floor(
        1000 + Math.random() * 9000
    ).toString();

}


// ========================================
// 👥 更新玩家列表
// ========================================

function updatePlayerList() {

    const playerList =
        document.getElementById("playerList");

    if (!playerList) {

        return;

    }


    playerList.innerHTML = "";


    // ====================================
    // 玩家1
    // ====================================

    const player1 =
        document.createElement("div");

    player1.id = "player1";

    player1.textContent =
        "👤 玩家 1：房主";

    player1.style.color =
        "#81c784";

    playerList.appendChild(
        player1
    );


    // ====================================
    // 玩家2
    // ====================================

    const player2 =
        document.createElement("div");

    player2.id = "player2";


    if (
        playerConnections.length > 0
    ) {

        player2.textContent =
            "👤 玩家 2：已加入";

        player2.style.color =
            "#81c784";

    }

    else {

        player2.textContent =
            "👤 玩家 2：等待加入...";

        player2.style.color =
            "#b0bec5";

    }


    playerList.appendChild(
        player2
    );

}


// ========================================
// 🏠 建立房間
// ========================================

async function createRoom() {

    return new Promise(
        (resolve) => {

            isHost = true;

            myPlayerNumber = 1;

            currentRoomCode =
                generateRoomCode();


            console.log(
                "🏠 建立房間:",
                currentRoomCode
            );


            // ====================================
            // 建立 Peer
            // ====================================

            peer = new Peer(
                "AI_CARD_" +
                currentRoomCode
            );


            // ====================================
            // Peer 開啟
            // ====================================

            peer.on(
                "open",
                (id) => {

                    console.log(
                        "✅ Peer 開啟:",
                        id
                    );


                    updatePlayerList();


                    roomMessage("");


                    resolve(
                        currentRoomCode
                    );

                }
            );


            // ====================================
            // 玩家加入
            // ====================================

            peer.on(
                "connection",
                (connection) => {

                    console.log(
                        "👤 收到玩家連線:",
                        connection.peer
                    );


                    // ----------------------------
                    // 防止重複
                    // ----------------------------

                    if (
                        playerConnections.includes(
                            connection
                        )
                    ) {

                        return;

                    }


                    playerConnections.push(
                        connection
                    );


                    updatePlayerList();


                    // ====================================
                    // ⭐ 先註冊 data
                    // ====================================

                    connection.on(
                        "data",
                        (data) => {

                            console.log(
                                "📨 房主收到資料:",
                                data
                            );


                            if (!data) {

                                return;

                            }


                            // ----------------------------
                            // 玩家加入
                            // ----------------------------

                            if (
                                data.type ===
                                "PLAYER_JOINED"
                            ) {

                                console.log(
                                    "👤 玩家2確認加入"
                                );


                                connection.send({

                                    type:
                                        "ROOM_JOINED",

                                    playerNumber:
                                        2

                                });


                                return;

                            }


                            // ----------------------------
                            // 玩家2的遊戲資料
                            // ----------------------------

                            if (
                                typeof handleGameData ===
                                "function"
                            ) {

                                handleGameData(
                                    data
                                );

                            }

                        }
                    );


                    // ====================================
                    // connection open
                    // ====================================

                    connection.on(
                        "open",
                        () => {

                            console.log(
                                "🔗 玩家2 connection open"
                            );


                            // 告訴玩家2房間成功

                            connection.send({

                                type:
                                    "ROOM_JOINED",

                                playerNumber:
                                    2

                            });


                            // ----------------------------
                            // 如果遊戲已經開始
                            // 立即同步
                            // ----------------------------

                            if (
                                typeof gameData !==
                                "undefined" &&
                                gameData &&
                                gameData.started
                            ) {

                                console.log(
                                    "🎮 同步目前遊戲狀態給玩家2"
                                );


                                connection.send({

                                    type:
                                        "GAME_START",

                                    gameData:
                                        gameData

                                });

                            }

                        }
                    );


                    // ====================================
                    // 連線關閉
                    // ====================================

                    connection.on(
                        "close",
                        () => {

                            console.log(
                                "❌ 玩家2離開"
                            );


                            const index =
                                playerConnections.indexOf(
                                    connection
                                );


                            if (
                                index !== -1
                            ) {

                                playerConnections.splice(
                                    index,
                                    1
                                );

                            }


                            updatePlayerList();

                        }
                    );


                    // ====================================
                    // 連線錯誤
                    // ====================================

                    connection.on(
                        "error",
                        (error) => {

                            console.error(
                                "❌ 玩家連線錯誤:",
                                error
                            );

                        }
                    );

                }
            );


            // ====================================
            // Peer 錯誤
            // ====================================

            peer.on(
                "error",
                (error) => {

                    console.error(
                        "❌ PeerJS 錯誤:",
                        error
                    );


                    roomMessage(
                        "❌ 房間建立失敗：" +
                        error.type
                    );


                    resolve(null);

                }
            );

        }
    );

}


// ========================================
// 🚪 加入房間
// ========================================

async function joinRoom(roomCode) {

    return new Promise(
        (resolve) => {

            isHost = false;

            myPlayerNumber = 2;

            currentRoomCode =
                roomCode;


            console.log(
                "🔗 準備加入:",
                roomCode
            );


            // ====================================
            // 建立自己的 Peer
            // ====================================

            peer = new Peer();


            // ====================================
            // Peer 開啟
            // ====================================

            peer.on(
                "open",
                () => {

                    console.log(
                        "✅ 玩家2 Peer 開啟"
                    );


                    // ----------------------------
                    // 連線房主
                    // ----------------------------

                    const connection =
                        peer.connect(
                            "AI_CARD_" +
                            roomCode,
                            {
                                reliable: true
                            }
                        );


                    playerConnections = [
                        connection
                    ];


                    // ====================================
                    // ⭐⭐⭐ 非常重要
                    // 先設定 data 監聽
                    // ====================================

                    connection.on(
                        "data",
                        (data) => {

                            console.log(
                                "📨 玩家2收到:",
                                data
                            );


                            if (!data) {

                                return;

                            }


                            // ====================================
                            // 房間加入成功
                            // ====================================

                            if (
                                data.type ===
                                "ROOM_JOINED"
                            ) {

                                console.log(
                                    "🎉 玩家2正式加入房間"
                                );


                                updatePlayerList();


                                resolve(
                                    true
                                );


                                return;

                            }


                            // ====================================
                            // 遊戲同步
                            // ====================================

                            if (
                                typeof handleGameData ===
                                "function"
                            ) {

                                handleGameData(
                                    data
                                );

                            }

                        }
                    );


                    // ====================================
                    // Connection 開啟
                    // ====================================

                    connection.on(
                        "open",
                        () => {

                            console.log(
                                "🔗 玩家2已連線房主"
                            );


                            // 告訴房主：
                            // 我已經準備好

                            connection.send({

                                type:
                                    "PLAYER_JOINED"

                            });

                        }
                    );


                    // ====================================
                    // Connection 錯誤
                    // ====================================

                    connection.on(
                        "error",
                        (error) => {

                            console.error(
                                "❌ 加入房間失敗:",
                                error
                            );


                            roomMessage(
                                "❌ 加入房間失敗"
                            );


                            resolve(
                                false
                            );

                        }
                    );


                    // ====================================
                    // Connection 關閉
                    // ====================================

                    connection.on(
                        "close",
                        () => {

                            console.log(
                                "❌ 與房主的連線中斷"
                            );

                        }
                    );

                }
            );


            // ====================================
            // Peer 錯誤
            // ====================================

            peer.on(
                "error",
                (error) => {

                    console.error(
                        "❌ PeerJS 錯誤:",
                        error
                    );


                    roomMessage(
                        "❌ 無法加入房間：" +
                        error.type
                    );


                    resolve(
                        false
                    );

                }
            );

        }
    );

}


// ========================================
// 📡 房主廣播
// ========================================

function broadcast(data) {

    if (!isHost) {

        return;

    }


    console.log(
        "📡 房主廣播:",
        data
    );


    playerConnections.forEach(
        (connection) => {

            if (
                connection &&
                connection.open
            ) {

                connection.send(
                    data
                );

            }

        }
    );

}


// ========================================
// 📤 玩家2 → 房主
// ========================================

function sendToHost(data) {

    if (isHost) {

        return;

    }


    if (
        playerConnections.length === 0
    ) {

        console.error(
            "❌ 尚未連線房主"
        );

        return;

    }


    const connection =
        playerConnections[0];


    if (
        connection &&
        connection.open
    ) {

        console.log(
            "📤 玩家2 → 房主:",
            data
        );


        connection.send(
            data
        );

    }

}


// ========================================
// 🔄 初始化玩家列表
// ========================================

updatePlayerList();


// ========================================
// 🧪 Debug
// ========================================

console.log(
    "🏠 room.js 已載入"
);
