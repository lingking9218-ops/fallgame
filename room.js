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
// 建立自己的 Peer
// ========================================

function createPeer() {

    return new Promise((resolve, reject) => {

        // 隨機產生 4 碼 ID
        const roomCode =
            Math.floor(
                1000 + Math.random() * 9000
            ).toString();

        peer = new Peer(roomCode);


        peer.on("open", (id) => {

            myPeerId = id;

            console.log(
                "PeerJS 初始化成功:",
                id
            );

            resolve(id);

        });


        peer.on("connection", (connection) => {

            console.log(
                "收到玩家連線:",
                connection.peer
            );

            isHost = true;

            playerConnections.push(connection);

            setupConnection(connection);

            updateRoomStatus();

        });


        peer.on("error", (error) => {

            console.error(
                "PeerJS 錯誤:",
                error
            );

            reject(error);

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
            "房間建立成功:",
            roomCode
        );

        return roomCode;

    } catch (error) {

        console.error(
            "建立房間失敗:",
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

        // 先建立自己的 Peer
        await createPeer();


        console.log(
            "正在加入房間:",
            roomCode
        );


        // 連線到房主
        const connection =
            peer.connect(roomCode);


        hostConnection = connection;

        isHost = false;


        setupConnection(connection);


        return new Promise((resolve, reject) => {

            connection.on("open", () => {

                console.log(
                    "成功加入房間:",
                    roomCode
                );

                updateRoomStatus();

                resolve(true);

            });


            connection.on("error", (error) => {

                console.error(
                    "加入房間失敗:",
                    error
                );

                reject(error);

            });

        });

    } catch (error) {

        console.error(
            "加入房間失敗:",
            error
        );

        return false;

    }

}


// ========================================
// 設定玩家連線
// ========================================

function setupConnection(connection) {

    connection.on("open", () => {

        console.log(
            "連線建立:",
            connection.peer
        );

        updateRoomStatus();

    });


    connection.on("data", (data) => {

        console.log(
            "收到資料:",
            data
        );

        handleRoomData(data);

    });


    connection.on("close", () => {

        console.log(
            "玩家離開:",
            connection.peer
        );


        playerConnections =
            playerConnections.filter(
                c => c !== connection
            );


        updateRoomStatus();

    });


    connection.on("error", (error) => {

        console.error(
            "連線錯誤:",
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
// 接收房間資料
// ========================================

function handleRoomData(data) {

    console.log(
        "房間資料:",
        data
    );


    // 下一步會在這裡加入
    // 玩家加入
    // 遊戲同步
    // 關卡同步
    // 比分同步
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

        status.textContent =
            `🏠 房主｜等待對手加入`;

    } else {

        if (
            hostConnection &&
            hostConnection.open
        ) {

            status.textContent =
                `🟢 已連線到房主`;

        } else {

            status.textContent =
                `⏳ 正在連線到房主...`;

        }

    }

}
