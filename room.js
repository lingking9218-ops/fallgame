// ========================================
// 🌐 AI Card Challenge
// PeerJS 房間系統
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


        // Peer 建立完成
        peer.on("open", (id) => {

            myPeerId = id;

            console.log(
                "🟢 PeerJS ID:",
                id
            );

            resolve(id);

        });


        // 有玩家連進來
        peer.on("connection", (connection) => {

            console.log(
                "👤 玩家嘗試加入:",
                connection.peer
            );


            // 目前只允許 2 人
            if (playerConnections.length >= 1) {

                console.log(
                    "❌ 房間已滿"
                );

                connection.on("open", () => {

                    connection.send({
                        type: "ROOM_FULL"
                    });

                    connection.close();

                });

                return;

            }


            // 成為房主
            isHost = true;


            // 加入玩家列表
            playerConnections.push(connection);


            // 設定連線
            setupConnection(connection);


            // 告訴玩家 2：
            // 加入成功
            connection.send({

                type: "ROOM_JOINED",

                playerNumber: 2

            });


            // 更新房主畫面
            updatePlayerList();

            updateRoomStatus();


            // 告訴玩家 2：
            // 房間目前有兩人
            connection.send({

                type: "PLAYER_LIST",

                players: 2

            });

        });


        // PeerJS 錯誤
        peer.on("error", (error) => {

            console.error(
                "❌ PeerJS 錯誤:",
                error
            );

            reject(error);

        });


        // Peer 關閉
        peer.on("close", () => {

            console.log(
                "🔴 PeerJS 已關閉"
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


        console.log(
            "🏠 房間建立:",
            roomCode
        );


        updatePlayerList();

        updateRoomStatus();


        return roomCode;

    } catch (error) {

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

        // 建立自己的 Peer
        await createPeer();


        console.log(
            "🔗 加入房間:",
            roomCode
        );


        // 連線到房主
        const connection =
            peer.connect(roomCode);


        hostConnection = connection;

        isHost = false;


        setupConnection(connection);


        return new Promise((resolve) => {

            let finished = false;


            // 連線成功
            connection.on("open", () => {

                console.log(
                    "🟢 已連線到房主"
                );


                updateRoomStatus();


                if (!finished) {

                    finished = true;

                    resolve(true);

                }

            });


            // 連線錯誤
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

    } catch (error) {

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

function setupConnection(connection) {

    // 連線成功
    connection.on("open", () => {

        console.log(
            "🔗 連線建立:",
            connection.peer
        );


        updateRoomStatus();

    });


    // 收到資料
    connection.on("data", (data) => {

        console.log(
            "📨 收到:",
            data
        );


        handleRoomData(
            data,
            connection
        );

    });


    // 玩家離開
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

    });


    // 連線錯誤
    connection.on("error", (error) => {

        console.error(
            "❌ Connection Error:",
            error
        );

    });

}


// ========================================
// 傳送給房主
// ========================================

function sendToHost(data) {

    if (
        hostConnection &&
        hostConnection.open
    ) {

        hostConnection.send(data);

        console.log(
            "📤 傳給房主:",
            data
        );

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
    // 玩家 2 加入
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

    }


    // ====================================
    // 玩家列表
    // ====================================

    if (
        data.type === "PLAYER_LIST"
    ) {

        updatePlayerList();

        updateRoomStatus();

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


    // ====================================
    // 房主
    // ====================================

    if (isHost) {

        player1.textContent =
            "🟢 玩家 1：房主";


        if (
            playerConnections.length >= 1
        ) {

            player2.textContent =
                "🟢 玩家 2：已加入";

        } else {

            player2.textContent =
                "⏳ 玩家 2：等待加入...";

        }

    }


    // ====================================
    // 房客
    // ====================================

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


    // 房主
    if (isHost) {

        if (
            playerConnections.length >= 1
        ) {

            status.textContent =
                "🟢 對手已加入！";

        } else {

            status.textContent =
                "🏠 房主｜等待對手加入...";

        }

    }


    // 房客
    else {

        if (
            hostConnection &&
            hostConnection.open
        ) {

            status.textContent =
                "🟢 已連線到房主";

        } else {

            status.textContent =
                "⏳ 正在連線到房主...";

        }

    }

}
