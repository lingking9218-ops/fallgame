// ========================================
// 🏠 AI Card Challenge
// room.js
// PeerJS 房間與玩家同步
// ========================================

let peer = null;

let isHost = false;

let myPlayerNumber = 0;

let currentRoomCode = "";

let playerConnections = [];


// ========================================
// 🔧 產生 4 碼房號
// ========================================

function generateRoomCode() {

    return Math.floor(
        1000 + Math.random() * 9000
    ).toString();

}


// ========================================
// 📨 顯示訊息
// ========================================

function roomMessage(text) {

    const el =
        document.getElementById("message");

    if (el) {
        el.textContent = text;
    }

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


    // 玩家 1
    const player1 =
        document.createElement("div");

    player1.id = "player1";

    player1.textContent =
        "👤 玩家 1：房主";

    playerList.appendChild(player1);


    // 玩家 2
    const player2 =
        document.createElement("div");

    player2.id = "player2";


    if (
        playerConnections.length >= 1
    ) {

        player2.textContent =
            "👤 玩家 2：已加入";

        player2.style.color =
            "#81c784";

    } else {

        player2.textContent =
            "👤 玩家 2：等待加入...";

    }


    playerList.appendChild(player2);

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


            peer = new Peer(
                "AI_CARD_" + currentRoomCode
            );


            peer.on(
                "open",
                (id) => {

                    console.log(
                        "🏠 房間建立成功:",
                        currentRoomCode
                    );


                    roomMessage(
                        ""
                    );


                    updatePlayerList();


                    resolve(
                        currentRoomCode
                    );

                }
            );


            peer.on(
                "connection",
                (connection) => {

                    console.log(
                        "👤 玩家加入:",
                        connection.peer
                    );


                    // 避免重複加入
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


                    connection.on(
                        "open",
                        () => {

                            console.log(
                                "🔗 玩家連線成功"
                            );


                            updatePlayerList();


                            // 告訴玩家2已成功加入
                            connection.send({

                                type:
                                    "ROOM_JOINED",

                                playerNumber:
                                    2

                            });


                            // 如果遊戲已經開始
                            // 新連線者直接收到目前遊戲狀態

                            if (
                                typeof gameData !==
                                "undefined" &&
                                gameData.started
                            ) {

                                connection.send({

                                    type:
                                        "GAME_STATE",

                                    gameData:
                                        gameData

                                });

                            }

                        }
                    );


                    connection.on(
                        "data",
                        (data) => {

                            console.log(
                                "📨 房主收到:",
                                data
                            );


                            // --------------------
                            // 玩家2送來的遊戲資料
                            // --------------------

                            if (
                                data &&
                                data.type ===
                                "CHALLENGE_SELECTED"
                            ) {

                                handleGameData(
                                    data
                                );

                                // 再同步給其他玩家
                                broadcast(
                                    data
                                );

                                return;
                            }


                            // --------------------
                            // 其他遊戲資料
                            // --------------------

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


                    connection.on(
                        "close",
                        () => {

                            console.log(
                                "❌ 玩家離開房間"
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

                }
            );


            peer.on(
                "error",
                (error) => {

                    console.error(
                        "PeerJS 錯誤:",
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


            peer = new Peer();


            peer.on(
                "open",
                () => {

                    console.log(
                        "🔗 正在連線房間:",
                        roomCode
                    );


                    const connection =
                        peer.connect(
                            "AI_CARD_" +
                            roomCode
                        );


                    connection.on(
                        "open",
                        () => {

                            console.log(
                                "✅ 加入房間成功"
                            );


                            playerConnections = [
                                connection
                            ];


                            // 收到房主訊息
                            connection.on(
                                "data",
                                (data) => {

                                    console.log(
                                        "📨 玩家2收到:",
                                        data
                                    );


                                    // ----------------
                                    // 房間同步
                                    // ----------------

                                    if (
                                        data.type ===
                                        "ROOM_JOINED"
                                    ) {

                                        updatePlayerList();

                                        resolve(
                                            true
                                        );

                                        return;
                                    }


                                    // ----------------
                                    // 遊戲資料
                                    // ----------------

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


                            // 通知房主
                            connection.send({

                                type:
                                    "PLAYER_JOINED"

                            });

                        }
                    );


                    connection.on(
                        "error",
                        (error) => {

                            console.error(
                                "加入失敗:",
                                error
                            );


                            resolve(false);

                        }
                    );

                }
            );


            peer.on(
                "error",
                (error) => {

                    console.error(
                        "PeerJS 錯誤:",
                        error
                    );


                    resolve(false);

                }
            );

        }
    );

}


// ========================================
// 📡 廣播給玩家2
// ========================================

function broadcast(data) {

    if (!isHost) {
        return;
    }


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
// 📤 玩家2傳給房主
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

        connection.send(
            data
        );

    }

}


// ========================================
// 🔄 玩家列表初始化
// ========================================

updatePlayerList();


// ========================================
// 🧪 除錯
// ========================================

console.log(
    "🏠 room.js 已載入"
);
